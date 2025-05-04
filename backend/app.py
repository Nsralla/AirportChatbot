from typing import List
from fastapi import FastAPI, HTTPException, Depends, APIRouter
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy.orm import  Session
from datetime import datetime
from backend.database import  engine, sessionLocal, Base
from backend.models import User, Chat, Message
from backend.schemas import ChatCreate,MessageInput, ChatResponse, MessageCreate, MessageResponse, UserResponse, UserCreate
from backend.security import hash_password, verify_password
from . import models
from backend.auth import create_access_token, verify_token
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi import status
from passlib.context import CryptContext
from fastapi.middleware.cors import CORSMiddleware
import os
import openai
from openai import OpenAI
from dotenv import load_dotenv


dotenv_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path)
openai.api_key = os.getenv("OPENAI_API_KEY")
if not openai.api_key:
    raise RuntimeError("OPENAI_API_KEY is not set in the .env file")
client = OpenAI(api_key=openai.api_key)

res = client.models.list()
# print("//////////////////////////////////")
# # print(res)
# print("//////////////////////////////////")

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
from fastapi.responses import JSONResponse
from fastapi.requests import Request

@app.exception_handler(422)
async def validation_exception_handler(request: Request, exc):
    print( "Validation error:", exc.errors())
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": await request.body()}
    )
    
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
@app.post("/users/", response_model= UserResponse)
def createUser( user: UserCreate, db: Session = Depends(getDB)):
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
@app.get("/users/", response_model= List[UserResponse])
def getUsers(current_user = Depends(get_current_user) ,db: Session = Depends(getDB)):
    if not current_user.is_admin :
        raise HTTPException(status_code=403, detail="Not authorized")
    allUsers = db.query(User).all()
    return allUsers



@app.post("/login", status_code=200)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(getDB)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not pwd_context.verify(form_data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}


# sigin endpoint
@app.post("/sigin",response_model=UserResponse, status_code=201)
def sigin(new_user:UserCreate, db: Session = Depends(getDB)):
    # validate if email already exists
    existingUserWithSameEmail = db.query(User).filter(User.email == new_user.email).first()
    if existingUserWithSameEmail:
        raise HTTPException(status_code=400, detail={"message": "Account with this email already exists"})
    # hash the password
    hashedPassword = hash_password(new_user.password)
    db_user = User(
        name = new_user.name,
        email = new_user.email,
        password = hashedPassword,
        is_admin = new_user.is_admin
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


# Example protected route
@app.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {"id": current_user.id, "name": current_user.name, "email": current_user.email, "is_admin": current_user.is_admin}

# endpoint to get al chats
@app.get("/chats/", response_model=List[ChatResponse])
def get_chats(db: Session = Depends(getDB), current_user = Depends(get_current_user)):
    if current_user.is_admin:
        all_chats = db.query(Chat).all()
        return all_chats
    else:
        all_chats = db.query(Chat).filter(Chat.user_id == current_user.id).all()
        return all_chats
    
    
# endpoint to get a chat messages by id
@app.get("/chats/{chat_id}/messages", response_model=List[MessageResponse])
def get_chat_messages(chat_id: int, db: Session = Depends(getDB), current_user = Depends(get_current_user)):
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    if chat.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to access this chat")
    messages = db.query(Message).filter(Message.chat_id == chat_id).all()
    return messages

@app.post("/chats/", response_model=ChatResponse)
def create_new_chat(db: Session = Depends(getDB), current_user: User = Depends(get_current_user)):
    new_chat = Chat(user_id=current_user.id, created_at=datetime.now())
    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)
    return new_chat


@app.post("/messages/", response_model=List[MessageResponse])
def send_message_to_chat(
    message: MessageInput,
    db: Session = Depends(getDB),
    current_user = Depends(get_current_user)
):
    chat_id = message.chat_id
    user_message = message.user_message
    # Validate user message is not empty
    # Validate chat exists and belongs to current user
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    if chat.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to use this chat")

    # Save user message
    user_msg = Message(
        chat_id=chat_id,
        sender="user",
        content=user_message,
        timestamp=datetime.now()
    )
    db.add(user_msg)

    # Get bot reply from OpenAI
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an airport assistant chatbot. You can only answer the following 5 FAQs:\n\n"
                        "1. Which items are prohibited in carry-on luggage?\n"
                        "2. How early should I arrive before my flight?\n"
                        "3. Where is the lost-and-found located at the airport?\n"
                        "4. How much luggage can I carry?\n"
                        "5. Can I carry medicines in my hand luggage?\n\n"
                        "If the user asks anything outside of these questions, politely reply:\n"
                        "'I'm sorry, I can only help with common airport FAQs. Please contact airport staff or visit the official website for more info.'"
                    )
                },
                {"role": "user", "content": user_message}
            ],
            temperature=0.6
        )
        bot_reply = response.choices[0].message.content.strip()
    except Exception as e:
        raise HTTPException(status_code=500, detail="OPEN AI ERROR: " + str(e))

    # Save bot message
    bot_msg = Message(
        chat_id=chat_id,
        sender="bot",
        content=bot_reply,
        timestamp=datetime.now()
    )
    db.add(bot_msg)
    db.commit()

    return [user_msg, bot_msg]

