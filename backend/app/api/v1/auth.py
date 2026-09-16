from datetime import datetime, timezone, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database.db import get_db
from app.models.user import User, Organization, RefreshToken, PasswordResetToken
from app.schemas.auth import (
    UserCreate, UserLogin, UserResponse, Token, QuickLoginRequest,
    RefreshTokenRequest, ForgotPasswordRequest, ResetPasswordRequest,
    ChangePasswordRequest, UserUpdateRequest, SessionResponse
)
from app.core.config import settings
from app.core.security import (
    get_password_hash, verify_password, create_access_token,
    create_refresh_token, decode_access_token, hash_token,
    generate_reset_token, hash_ip
)
from app.security.rbac import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

def utc_now_db() -> datetime:
    """Return naive UTC datetime for seamless SQLite/Postgres interoperability."""
    return datetime.now(timezone.utc).replace(tzinfo=None)

def is_expired(dt: datetime) -> bool:
    if not dt:
        return True
    now = datetime.now(timezone.utc)
    if dt.tzinfo is None:
        now = now.replace(tzinfo=None)
    return dt < now

# In-memory IP/Email rate limiter for failed login attempts
failed_attempts: dict[str, list[datetime]] = {}

def check_rate_limit(key: str):
    now = utc_now_db()
    cutoff = now - timedelta(minutes=settings.RATE_LIMIT_LOGIN_WINDOW_MINUTES)
    attempts = [t for t in failed_attempts.get(key, []) if t > cutoff]
    failed_attempts[key] = attempts
    if len(attempts) >= settings.RATE_LIMIT_LOGIN_MAX_ATTEMPTS:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many failed login attempts. Please wait {settings.RATE_LIMIT_LOGIN_WINDOW_MINUTES} minutes before retrying."
        )

def record_failed_attempt(key: str):
    now = utc_now_db()
    if key not in failed_attempts:
        failed_attempts[key] = []
    failed_attempts[key].append(now)

def clear_failed_attempts(key: str):
    failed_attempts.pop(key, None)

@router.post("/register", response_model=Token)
async def register(user_in: UserCreate, request: Request, db: AsyncSession = Depends(get_db)):
    # Explicitly prohibit public registration with admin role
    if user_in.role == "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Public registration for Administrator role is not permitted. Contact CERT-In or System Administrator."
        )

    result = await db.execute(select(User).where(User.email == user_in.email))
    existing = result.scalars().first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    org_id = None
    if user_in.role == "organization":
        org_name = user_in.organization_name or f"{user_in.name}'s Organization"
        verified_domain = user_in.verified_domain or user_in.email.split("@")[-1]
        
        # Check if organization exists
        org_result = await db.execute(select(Organization).where(Organization.name == org_name))
        org = org_result.scalars().first()
        if not org:
            org = Organization(
                name=org_name,
                verified_domain=verified_domain,
                contact_email=user_in.email
            )
            db.add(org)
            await db.flush()
        org_id = org.id

    now = utc_now_db()
    user = User(
        name=user_in.name,
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        role=user_in.role,
        language=user_in.language,
        is_active=True,
        is_verified=True,
        last_login=now,
        organization_id=org_id
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    # Generate token pair & store refresh token
    access_token = create_access_token(subject=user.id, role=user.role)
    refresh_token = create_refresh_token(subject=user.id)
    user_agent = request.headers.get("user-agent", "Browser Client")[:250]
    client_ip = request.client.host if request.client else ""

    session_record = RefreshToken(
        user_id=user.id,
        token_hash=hash_token(refresh_token),
        created_at=now,
        expires_at=now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        user_agent=user_agent,
        ip_hash=hash_ip(client_ip)
    )
    db.add(session_record)
    await db.commit()

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, request: Request, db: AsyncSession = Depends(get_db)):
    client_ip = request.client.host if request.client else ""
    rate_key = f"{client_ip}:{credentials.email}"
    check_rate_limit(rate_key)

    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalars().first()
    is_valid_password = False
    if user:
        if verify_password(credentials.password, user.password_hash):
            is_valid_password = True
        elif settings.DEMO_MODE and credentials.password in ("demo123", "Demo@123", "CyberRaksha@Admin2026", "Citizen@123", "OrgAdmin@123"):
            is_valid_password = True

    if not user or not is_valid_password:
        record_failed_attempt(rate_key)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User account is deactivated")

    clear_failed_attempts(rate_key)

    now = utc_now_db()
    # Update last login timestamp
    user.last_login = now
    await db.commit()

    # Issue tokens
    access_token = create_access_token(subject=user.id, role=user.role)
    refresh_token = create_refresh_token(subject=user.id)
    user_agent = request.headers.get("user-agent", "Browser Client")[:250]

    # Save session
    session_record = RefreshToken(
        user_id=user.id,
        token_hash=hash_token(refresh_token),
        created_at=now,
        expires_at=now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        user_agent=user_agent,
        ip_hash=hash_ip(client_ip)
    )
    db.add(session_record)
    await db.commit()

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.post("/refresh", response_model=Token)
async def refresh_token(req: RefreshTokenRequest, request: Request, db: AsyncSession = Depends(get_db)):
    raw_token = req.refresh_token
    token_h = hash_token(raw_token)

    result = await db.execute(
        select(RefreshToken).where(
            RefreshToken.token_hash == token_h,
            RefreshToken.revoked == False
        )
    )
    session_record = result.scalars().first()
    if not session_record or is_expired(session_record.expires_at):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid, expired, or revoked refresh token"
        )

    # Get associated user
    user_res = await db.execute(select(User).where(User.id == session_record.user_id))
    user = user_res.scalars().first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User account inactive")

    # Rotate refresh token: revoke old one
    session_record.revoked = True

    now = utc_now_db()
    # Generate new token pair
    new_access = create_access_token(subject=user.id, role=user.role)
    new_refresh = create_refresh_token(subject=user.id)
    user_agent = request.headers.get("user-agent", "Browser Client")[:250]
    client_ip = request.client.host if request.client else ""

    new_session = RefreshToken(
        user_id=user.id,
        token_hash=hash_token(new_refresh),
        created_at=now,
        expires_at=now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        user_agent=user_agent,
        ip_hash=hash_ip(client_ip)
    )
    db.add(new_session)
    await db.commit()

    return Token(
        access_token=new_access,
        refresh_token=new_refresh,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.post("/logout")
async def logout(
    req: Optional[RefreshTokenRequest] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if req and req.refresh_token:
        token_h = hash_token(req.refresh_token)
        result = await db.execute(
            select(RefreshToken).where(
                RefreshToken.user_id == current_user.id,
                RefreshToken.token_hash == token_h
            )
        )
        session_record = result.scalars().first()
        if session_record:
            session_record.revoked = True
            await db.commit()

    return {"message": "Logged out successfully. Active session invalidated."}

@router.post("/logout-all")
async def logout_all_sessions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(RefreshToken).where(
            RefreshToken.user_id == current_user.id,
            RefreshToken.revoked == False
        )
    )
    sessions = result.scalars().all()
    for s in sessions:
        s.revoked = True
    await db.commit()
    return {"message": "All other active sessions have been terminated."}

@router.get("/sessions", response_model=List[SessionResponse])
async def get_active_sessions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    now = utc_now_db()
    result = await db.execute(
        select(RefreshToken).where(
            RefreshToken.user_id == current_user.id,
            RefreshToken.revoked == False,
            RefreshToken.expires_at > now
        ).order_by(RefreshToken.created_at.desc())
    )
    records = result.scalars().all()
    
    out: List[SessionResponse] = []
    for idx, r in enumerate(records):
        out.append(SessionResponse(
            id=r.id,
            user_agent=r.user_agent,
            created_at=r.created_at,
            expires_at=r.expires_at,
            is_current=(idx == 0)
        ))
    return out

@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalars().first()
    
    dev_token = None
    if user:
        raw_token = generate_reset_token()
        token_h = hash_token(raw_token)
        now = utc_now_db()
        reset_entry = PasswordResetToken(
            user_id=user.id,
            token_hash=token_h,
            created_at=now,
            expires_at=now + timedelta(hours=1),
            used=False
        )
        db.add(reset_entry)
        await db.commit()

        if settings.DEMO_MODE or not settings.EMAIL_SERVICE_CONFIGURED:
            dev_token = raw_token

    return {
        "message": "If the email is registered, a password reset link has been dispatched.",
        "mode": "DEVELOPMENT_MODE" if not settings.EMAIL_SERVICE_CONFIGURED else "PRODUCTION_MODE",
        "dev_reset_token": dev_token
    }

@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    token_h = hash_token(req.token)

    result = await db.execute(
        select(PasswordResetToken).where(
            PasswordResetToken.token_hash == token_h,
            PasswordResetToken.used == False
        )
    )
    reset_entry = result.scalars().first()
    if not reset_entry or is_expired(reset_entry.expires_at):
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    user_res = await db.execute(select(User).where(User.id == reset_entry.user_id))
    user = user_res.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    reset_entry.used = True
    user.password_hash = get_password_hash(req.new_password)

    # Invalidate all existing sessions for security after a password reset
    sess_res = await db.execute(
        select(RefreshToken).where(RefreshToken.user_id == user.id, RefreshToken.revoked == False)
    )
    for s in sess_res.scalars().all():
        s.revoked = True

    await db.commit()
    return {"message": "Password updated successfully. Please log in with your new credentials."}

@router.post("/change-password")
async def change_password(
    req: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not verify_password(req.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    current_user.password_hash = get_password_hash(req.new_password)
    await db.commit()
    return {"message": "Password changed successfully."}

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)

@router.put("/me", response_model=UserResponse)
async def update_profile(
    req: UserUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if req.name:
        current_user.name = req.name
    if req.language:
        current_user.language = req.language
    await db.commit()
    await db.refresh(current_user)
    return UserResponse.model_validate(current_user)

@router.post("/quick-login", response_model=Token)
async def quick_login(request_data: QuickLoginRequest, request: Request, db: AsyncSession = Depends(get_db)):
    """
    Demo Quick-Login button for Presentation & Hackathon judges.
    Issues real JWT access and refresh tokens.
    """
    role = request_data.role
    email_map = {
        "citizen": "citizen@cyberraksha.gov.in",
        "organization": "org@infosec-defense.in",
        "admin": "admin@cyberraksha.gov.in"
    }
    target_email = email_map.get(role, "citizen@cyberraksha.gov.in")
    result = await db.execute(select(User).where(User.email == target_email))
    user = result.scalars().first()
    if not user:
        result = await db.execute(select(User).where(User.role == role))
        user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=404, detail=f"No demo user found for role {role}")

    now = utc_now_db()
    # Update last login
    user.last_login = now
    await db.commit()

    access_token = create_access_token(subject=user.id, role=user.role)
    refresh_token = create_refresh_token(subject=user.id)
    user_agent = request.headers.get("user-agent", "Browser Client")[:250]
    client_ip = request.client.host if request.client else ""

    session_record = RefreshToken(
        user_id=user.id,
        token_hash=hash_token(refresh_token),
        created_at=now,
        expires_at=now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        user_agent=f"{user_agent} (Quick Demo)",
        ip_hash=hash_ip(client_ip)
    )
    db.add(session_record)
    await db.commit()

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )
