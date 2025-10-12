// Import express, web framework for handling HTTP requests
import express from 'express';

// Enable CORS Cross-Origin Resource Sharing (lets FE on different port access API)
import cors from 'cors';

//Loads variables from .env file
import dotenv from 'dotenv';

// Import user routes and gathering routes, and responses routes
  import userRoutes from './routes/users';
  import gatheringRoutes from './routes/gatherings';
  import responseRoutes from './routes/responses';

// Import agent trigger route for testing
  import agentTriggerRoutes from './routes/agent-trigger';


// Load environment variables from .env file and loads DATABASE_URL and other variables to process.env
dotenv.config();

// Create Express application instance
const app = express();

// Use port from environment variable, or default to 3000
const PORT = process.env.PORT || 3000;

// Middleware - runs on every requests
// Allow requests from frontend (production and local dev)
app.use(cors({
  origin: [
    'https://amica-rho.vercel.app',  // Production frontend
    'http://localhost:5173'           // Local development
  ],
  credentials: true
}));
// Parse JSON request bodies 
app.use(express.json());
// Make any requests to /users/* handled by userRoutes router
app.use('/users', userRoutes);
// Make any requests to /gatherings/* handled by gatheringRoutes router
app.use('/gatherings', gatheringRoutes);
// Make any requests to /responses/* handled by responsesRoutes router
app.use('/responses', responseRoutes);
// Redirect requests to /agent-trigger/* to be handled by agentTriggerRoutes 
  app.use('/agent-trigger', agentTriggerRoutes);


// Test route 
app.get('/', (req, res) => {
    res.json({message: 'Amica API is running!'});
});

//Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});