import hashlib
import hmac
import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any, Optional, Union
import jwt
from app.core.config import settings

def get_password_hash(password: str) -> str:
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
    return f"{salt}${key.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        parts = hashed_password.split('$')
        if len(parts) != 2:
            return False
        salt, stored_key = parts
        key = hashlib.pbkdf2_hmac('sha256', plain_password.encode('utf-8'), salt.encode('utf-8'), 100000)
        return hmac.compare_digest(stored_key, key.hex())
    except Exception:
        return False

def create_access_token(subject: Union[str, Any], role: str, expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    jti = secrets.token_hex(8)
    to_encode = {"sub": str(subject), "role": role, "jti": jti, "type": "access", "exp": expire}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_refresh_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    # Include random jti for cryptographic uniqueness
    jti = secrets.token_urlsafe(32)
    to_encode = {"sub": str(subject), "jti": jti, "type": "refresh", "exp": expire}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None

def hash_token(token: str) -> str:
    """Store token hashes in DB rather than plain text tokens."""
    return hashlib.sha256(token.encode('utf-8')).hexdigest()

def generate_reset_token() -> str:
    """Generate cryptographically secure URL-safe password reset token."""
    return secrets.token_urlsafe(48)

def compute_sha256(content: str) -> str:
    return hashlib.sha256(content.encode('utf-8')).hexdigest()

def hash_ip(ip_address: str) -> str:
    if not ip_address:
        return "00000000"
    salt = "cyber-raksha-ip-salt"
    return hashlib.sha256(f"{salt}{ip_address}".encode('utf-8')).hexdigest()[:16]
