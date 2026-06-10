# TiffinConnect

Full-stack tiffin (home-style meal) delivery marketplace — built as my capstone project for the Post-Graduate Certificate in Web Development at Conestoga College (2024).

TiffinConnect connects local tiffin vendors with customers: vendors publish menus and manage incoming orders, customers browse providers, place orders, and track their meals — all behind role-based authentication (customer / vendor / admin).

## Tech Stack

**Frontend**
- React 18 with React Router v6
- Axios for REST API calls
- Font Awesome icons

**Backend**
- Node.js + Express 4 (REST API)
- MongoDB with Mongoose ODM
- JWT authentication with bcrypt password hashing
- express-validator for request validation
- Multer for image uploads

## Project Structure

    TiffinConnect/
    |-- backend/     Express REST API (auth, vendors, orders)
    |-- frontend/    React single-page application

## Getting Started

Prerequisites: Node.js 18+ and MongoDB (local or Atlas).

**Backend**

    cd backend
    npm install
    npm run dev

Create a .env file in backend/ with MONGO_URI, JWT_SECRET, and PORT before starting.

**Frontend**

    cd frontend
    npm install
    npm start

The React app runs on http://localhost:3000 and talks to the API on the port set in your .env.

## Security

- Passwords are hashed with bcrypt; protected routes require a valid JWT
- All secrets load from environment variables — nothing sensitive is committed to the repo

## Author

**Meet Amin** — backend-focused developer (Java/Spring Boot, Node.js) in Mississauga, ON

- GitHub: https://github.com/Meet03
- LinkedIn: https://linkedin.com/in/meet-amin-898904160
