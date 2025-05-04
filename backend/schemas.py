from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

# ----- User Schemas -----
class UserCreate(BaseModel):
    name: str
    email: str
    password: str  # Plaintext or hashed, depending on backend flow
    is_admin: bool = False

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    is_admin: bool

    class Config:
        from_attributes = True

# ----- Chat Schemas -----
class ChatCreate(BaseModel):
    user_id: int
    created_at: datetime

class ChatResponse(BaseModel):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# ----- Message Schemas -----
class MessageCreate(BaseModel):
    chat_id: int
    sender: str  # "user" or "bot"
    content: str
    timestamp: datetime

class MessageResponse(BaseModel):
    id: int
    chat_id: int
    sender: str
    content: str
    timestamp: datetime

    class Config:
        from_attributes = True

# ----- Login Schema -----
class LoginRequest(BaseModel):
    email: str
    password: str
