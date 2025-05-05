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

