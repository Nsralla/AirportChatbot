from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from .database import Base

#  we have two tables, one for user and one for interaction

# Database model
class Interaction(Base):
    __tablename__ = "interactions"
    id = Column(Integer, primary_key=True, index=True) 
    userMessage = Column(String, nullable=False)
    botMessage = Column(String, nullable=False)
    timestamp = Column(DateTime, nullable=False)
    userId = Column(Integer, ForeignKey("users.id") ,nullable=False)  # Foreign key to User table   
    
# tabke for user
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True) 
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)  # hashed password
    is_admin = Column(Boolean, default=False)  # 0 for user, 1 for admin
    