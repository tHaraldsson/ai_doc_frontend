# AI Document Frontend

This repository contains the frontend for an AI-powered document question-answering application.  
The frontend is built with **React** and **Vite**, providing a responsive, secure, and user-friendly interface for interacting with documents and the AI backend.

---

## Features

- User authentication (login and registration)
- Protected routes for authenticated users
- Upload documents (PDF, Excel, PowerPoint)
- View user documents
- Chat interface to ask questions about uploaded documents
- Responsive design with CSS modules
- Context-based authentication state management
- Integration with backend API

---

## Tech Stack

- React 18 + Vite
- TypeScript
- React Router v6
- Context API for state management
- Fetch API for backend communication
- CSS modules for styling
- Docker support for containerized deployment

---

## Project Structure

```text
app/
├─ auth/        # Authentication pages (Login, Register)
├─ chat/        # Chat interface
├─ components/  # Reusable components (Header, LogoutButton, ProtectedRoute)
├─ context/     # AuthContext for managing user authentication
├─ documents/   # Documents page
├─ index/       # Homepage and general styles
├─ routes/      # Route definitions for navigation
├─ services/    # API service for backend communication
├─ types/       # TypeScript type definitions
└─ upload/      # Upload page and related styles

```
Pages and Routes
Authentication
/login – Login page

/register – User registration page

Documents
/documents – List of uploaded documents

/upload – Upload new documents

Chat
/chat – Chat interface to ask questions about documents

API Integration
The frontend communicates with the backend via app/services/api.ts.

It handles:

Authentication (login, registration, logout)

Uploading and retrieving documents

Asking questions to the AI

JWT management using HttpOnly cookies

All requests to protected endpoints require authentication.

Styling
CSS modules are used for scoped styling

Responsive design ensures usability on desktop and mobile

Common UI elements like header and logout button are reused across pages

Environment Variables
Create a .env file or configure environment variables depending on your deployment:

env
VITE_API_BASE_URL=https://your-backend-url.com/api

Running the Project
Development

# Install dependencies
npm install

# Start development server
npm run dev
The frontend will be available at http://localhost:5173 by default.

Production Build

npm run build
npm run preview

Docker
You can build and run the frontend using Docker:


docker build -t ai-doc-frontend .
docker run -p 5173:5173 ai-doc-frontend


Author
Tommy Haraldsson
Java Developer (Student)
Degree Thesis Project



---
