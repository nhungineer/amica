"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Import express, web framework for handling HTTP requests
const express_1 = __importDefault(require("express"));
// Enable CORS Cross-Origin Resource Sharing (lets FE on different port access API)
const cors_1 = __importDefault(require("cors"));
//Loads variables from .env file
const dotenv_1 = __importDefault(require("dotenv"));
// Import user routes and gathering routes, and responses routes
const users_1 = __importDefault(require("./routes/users"));
const gatherings_1 = __importDefault(require("./routes/gatherings"));
const responses_1 = __importDefault(require("./routes/responses"));
const auth_1 = __importDefault(require("./routes/auth"));
// Import agent trigger route for testing
const agent_trigger_1 = __importDefault(require("./routes/agent-trigger"));
// Load environment variables from .env file and loads DATABASE_URL and other variables to process.env
dotenv_1.default.config();
// Create Express application instance
const app = (0, express_1.default)();
// Use port from environment variable, or default to 3000
const PORT = Number(process.env.PORT) || 3000;
// Middleware - runs on every requests
// Allow requests from frontend (production and local dev)
app.use((0, cors_1.default)({
    origin: [
        'https://amica-rho.vercel.app', // Production frontend
        'http://localhost:5173' // Local development
    ],
    credentials: true
}));
// Parse JSON request bodies 
app.use(express_1.default.json());
// Make any requests to /users/* handled by userRoutes router
app.use('/users', users_1.default);
// Make any requests to /gatherings/* handled by gatheringRoutes router
app.use('/gatherings', gatherings_1.default);
// Make any requests to /responses/* handled by responsesRoutes router
app.use('/responses', responses_1.default);
// Make any requests to /auth/* handled by authRoutes router
app.use('/auth', auth_1.default);
// Redirect requests to /agent-trigger/* to be handled by agentTriggerRoutes
app.use('/agent-trigger', agent_trigger_1.default);
// Test route 
app.get('/', (req, res) => {
    res.json({ message: 'Amica API is running!' });
});
//Start server
// Bind to 0.0.0.0 to make server accessible from Railway's network
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map