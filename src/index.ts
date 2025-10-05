// Import express, web framework for handling HTTP requests
import express from 'express';

// Enable CORS Cross-Origin Resource Sharing (lets FE on different port access API)
import cors from 'cors';

//Loads variables from .env file
import dotenv from 'dotenv';

// Import user routes
  import userRoutes from './routes/users';

// Load environment variables from .env file and loads DATABASE_URL and other variables to process.env
dotenv.config();

// Create Express application instance
const app = express();

// Use port from environment variable, or default to 3000
const PORT = process.env.PORT || 3000;

// Middleware - runs on every requests 
// Allow requests from any origin (dev only, restrict to FE URL later)
app.use(cors());
// Parse JSON request bodies 
app.use(express.json());
// Make any requests to /users/* handled by userRoutes router
app.use('/users', userRoutes);


// Test route 
app.get('/', (req, res) => {
    res.json({message: 'Amica API is running!'});
});

//Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});