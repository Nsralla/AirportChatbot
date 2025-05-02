from typing import List
from fastapi import FastAPI, HTTPException, Depends, APIRouter
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy.orm import  Session
from datetime import datetime
from backend.database import  engine, sessionLocal, Base
from backend.models import User, Interaction
from backend.schemas import interactionCreate, interactionResponse, userCreate, userResponse, LoginRequest
from backend.security import hash_password, verify_password
from . import models
from backend.auth import create_access_token, verify_token
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi import status
from passlib.context import CryptContext
from fastapi.middleware.cors import CORSMiddleware

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")
auth_router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# create the database tables
print("Creating tables...")
Base.metadata.create_all(bind=engine)

# get db session per request
def getDB():
    db = sessionLocal()
    try:
        yield db
    finally:
        db.close()
        
        
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # or your React dev URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to extract user from token
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(getDB)):
    payload = verify_token(token) # decodes the token, checks the signature and expiry, returns the token payload, usually something like:
    # {"sub": "5"}  # 'sub' is short for 'subject', usually the user ID, If the token is bad or expired, payload will be None.
    if payload is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    user = db.query(User).filter(User.id == payload.get("sub")).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user

# endpoint to create a new user
@app.post("/users/", response_model=userResponse)
def createUser( user: userCreate, db: Session = Depends(getDB)):
    hashedPassword = hash_password(user.password)
    # validate if email already exists
    existingUserWithSameEmail = db.query(User).filter(User.email == user.email).first()
    if existingUserWithSameEmail:
        raise HTTPException(status_code=400, detail={"message": "Email already exists"})
    dbUser = User(
        name = user.name,
        email = user.email,
        password = hashedPassword,
        is_admin = user.is_admin
    )
    db.add(dbUser)
    db.commit()
    db.refresh(dbUser)
    return dbUser
    
# endpoint to get all users
@app.get("/users/", response_model= List[userResponse])
def getUsers(current_user: User = Depends(get_current_user) ,db: Session = Depends(getDB)):
    #  check if user is admin
    print(current_user.is_admin)
    if not current_user.is_admin :
        raise HTTPException(status_code=403, detail="Not authorized")
    allUsers = db.query(User).all()
    return allUsers



@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(getDB)):
    user = db.query(User).filter(User.email == form_data.username).first()
    print(user.email, user.name, user.password)
    print(form_data.username, form_data.password)
    if not user or not pwd_context.verify(form_data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}



# Example protected route
@app.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {"id": current_user.id, "name": current_user.name, "email": current_user.email, "is_admin": current_user.is_admin}