# Airport FAQ Chatbot Project Documentation

## Overview
This project aims to develop a user-friendly web-based chatbot that answers frequent airport-related questions, integrating OpenAI's powerful GPT API. It securely logs user interactions for continuous improvement.

## Project Objectives
- Provide reliable answers to selected FAQs.
- Politely redirect out-of-scope queries.
- Securely handle OpenAI API keys.

## Technology Stack

### Frontend
- **Framework:** React.js
- **Styling:** CSS Modules
- **Package Manager:** npm

### Backend
- **Framework:** FastAPI (Python)
- **Database:** SQLite
- **Server:** Uvicorn
- **Environment Management:** python-dotenv

### AI Integration
- **OpenAI API:** gpt-4o

## Pipeline Description
1. **User  Interface (Frontend)**
   - Built with React.js, providing a clean, intuitive interface.
   - Users input queries through a conversational UI.

2. **Backend API**
   - FastAPI backend receives requests from the frontend.
   - Securely manages environment variables using a `.env` file.

3. **OpenAI API Integration**
   - Backend constructs precise prompts for GPT-3.5 Turbo.
   - API communication secured with API key stored in environment variables.
   - JSON requests handled securely using the `requests` library.

4. **Database Management (SQLite)**
   - Lightweight SQLite database stores interactions securely.
  
## Installation and Setup

### Backend Setup
```bash
cd backend
python -m venv env
source env/bin/activate
pip install -r requirements.txt
cd ..
uvicorn backend.app:app --reload
```
### Frontend Setup
```bash
cd ./frontend/chatbot/
npm install
npm run start
```
## Challenges

### 1. Refactoring the Database Schema
Initially, all user-bot interactions were stored in a single flat table. As the application matured, it became necessary to redesign the data model to better support chat sessions. This involved:
- Splitting the `interactions` table into `chats` and `messages` tables.
- Redesigning SQLAlchemy models and corresponding Pydantic schemas.
- Updating the backend logic to properly associate messages with specific chat sessions.

### 2. Managing Authentication and Token Expiry
Implementing secure user authentication using JWT (JSON Web Tokens) introduced several challenges:
- Ensuring tokens are issued correctly upon login or registration.
- Handling token expiration and invalidation securely.
- 
### 3. React State Management and Routing
Creating a seamless user experience with React required careful state and route management, including:
- Tracking and updating the currently active chat session.
- Dynamically routing users to `/chat/:chatId` upon chat creation or selection.

