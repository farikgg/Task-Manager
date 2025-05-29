# To-Do Frontend Application

A modern React-based frontend application for managing tasks and categories, built to work with the To-Do API.

## Features

- User authentication (login/register)
- Task management with CRUD operations
- Category management
- Responsive design
- Modern UI/UX
- Real-time updates (Note: This might be a placeholder or partially implemented feature based on interaction history)
- **Calendar View with Daily Task Modal:** View tasks for a specific day in a modal popup.
- **Improved Token Management:** Enhanced security by storing refresh tokens in HTTP-only cookies and implementing automatic access token renewal.
- **User Profile Customization:** Added options to change theme accent color, saved locally and on the backend.
- **Dynamic Navbar Greeting:** Navbar now displays a time-sensitive greeting with the user's name.
- **Enhanced Task Display:** Updated task icons and improved task list rendering.
- **UI/Style Enhancements:** Various style adjustments in user profile and other components for better layout and appearance.

## Tech Stack

- React.js
- React Router for navigation
- Axios for API requests
- Modern JavaScript (ES6+)
- CSS for styling

## Prerequisites

- Node.js (v14 or higher)
- npm 
- Backend API running (To-Do API)

## Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd front
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file in the root directory with the following variables:
   ```
   REACT_APP_API_URL=http://localhost:5001/api
   ```

## Running the Application

Development mode:
```bash
npm start
```

The application will start on port 3000 by default.

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── services/      # API service functions
├── context/       # React context providers
├── utils/         # Utility functions
└── App.js         # Main application component
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from create-react-app

## Development

The project uses Create React App for development, which provides:
- Hot reloading
- ESLint configuration
- Testing setup
- Build optimization

## Building for Production

To create a production build:
```bash
npm run build
```

This will create an optimized build in the `build` folder.

## Testing

The project includes testing setup with Jest and React Testing Library. Run tests with:
```bash
npm test
```