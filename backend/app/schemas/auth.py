from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime

class Token(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    user: "UserResponse"

class TokenData(BaseModel):
    user_id: Optional[str] = None
    role: Optional[str] = None

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: str = Field("citizen", pattern="^(citizen|organization)$") # Admin is disallowed from public registration!
    language: str = Field("en", pattern="^(en|hi|kn|ta|te|ml|mr)$")
    organization_name: Optional[str] = None
    verified_domain: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    remember_me: Optional[bool] = False

class QuickLoginRequest(BaseModel):
    role: str = Field("citizen", pattern="^(citizen|organization|admin)$")

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6)

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)

class UserUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    language: Optional[str] = Field(None, pattern="^(en|hi|kn|ta|te|ml|mr)$")

class SessionResponse(BaseModel):
    id: int
    user_agent: str
    created_at: datetime
    expires_at: datetime
    is_current: bool = False

    model_config = ConfigDict(from_attributes=True)

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    language: str
    is_active: bool
    is_verified: bool = True
    mfa_enabled: bool = False
    last_login: Optional[datetime] = None
    organization_id: Optional[int] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

Token.model_rebuild()
