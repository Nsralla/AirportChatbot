from pydantic import BaseModel
from datetime import datetime
    
    
# pydantic for request and response validation
class interactionCreate(BaseModel):
    userMessage: str
    botMessage: str
    timestamp: datetime
    
class interactionResponse(BaseModel):
    id: int
    userMessage: str
    botMessage: str
    timestamp: datetime
    
    class Config:
        from_attributes = True
        
class userCreate(BaseModel):
    name: str
    email: str
    password: str  # hashed password

class userResponse(BaseModel):
    id: int
    name: str
    email: str
    
    class Cofig:
        from_attributes  = True
