from typing import List
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import  Session
from datetime import datetime
from backend.database import  engine, sessionLocal
from backend.models import User, Interaction
from backend.schemas import interactionCreate, interactionResponse, userCreate, userResponse
from backend.security import hash_password, verify_password
from . import models


# create the database tables
models.Base.metadata.create_all(bind=engine)

# get db session per request
def getDB():
    db = sessionLocal()
    try:
        yield db
    finally:
        db.close()
        
        
app = FastAPI()

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
        password = hashedPassword
    )
    db.add(dbUser)
    db.commit()
    db.refresh(dbUser)
    return dbUser
    
# endpoint to get all users
@app.get("/users/", response_model= List[userResponse])
def getUsers( db: Session = Depends(getDB)):
    allUsers = db.query(User).all()
    return allUsers


