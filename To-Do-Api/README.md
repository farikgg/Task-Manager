# To-Do API

A RESTful API for managing tasks and categories, built with Node.js, Express, and MongoDB.

## Features

- User authentication and authorization
- Task management (CRUD operations)
- Category management
- Default categories initialization
- Secure password hashing
- JWT-based authentication
- **Improved Token Management:** Enhanced refresh token handling for better security and automatic renewal flow.
- **User Profile Updates:** API now supports updating user categories and theme color.
- **Consistent User ID Handling:** Ensured consistent use of `userId` across controllers.

## Tech Stack

- Node.js
- Express.js
- MongoDB (with Mongoose)
- JWT for authentication
- bcrypt for password hashing
- CORS enabled
- dotenv for environment variables

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm

## Installation

1. Clone the repository
2. Navigate to the project directory:
   ```bash
   cd To-Do-Api
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5001
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_jwt_refresh_secret # Add this for refresh token
   ```

## Running the Application

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on port 5001 by default.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user (returns access token and sets refresh token in cookie)
- `POST /api/auth/refresh-token` - Get a new access token using refresh token (from cookie)
- `POST /api/auth/logout` - Logout user (clears refresh token)
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile (includes username, email, categories, themeColor)
- `PUT /api/auth/password` - Change user password

### Tasks
- `GET /api/tasks` - Get all tasks for the authenticated user
- `POST /api/tasks` - Create a new task for the authenticated user
- `PUT /api/tasks/:id` - Update a task for the authenticated user
- `DELETE /api/tasks/:id` - Delete a task for the authenticated user

### Categories
- `GET /api/categories` - Get all categories for the authenticated user
- `POST /api/categories` - Create a new category for the authenticated user
- `PUT /api/categories/:id` - Update a category for the authenticated user
- `DELETE /api/categories/:id` - Delete a category for the authenticated user

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middleware/     # Custom middleware (authentication)
├── models/         # Database models
├── routes/         # API routes
└── server.js       # Main application file
```

## Security Features

- Password hashing using bcrypt
- JWT-based authentication with access and refresh tokens (refresh in HTTP-only cookie)
- CORS enabled for cross-origin requests
- Environment variables for sensitive data

## Development

The project uses nodemon for development, which automatically restarts the server when changes are detected.