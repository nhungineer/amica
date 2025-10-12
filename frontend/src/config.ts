// API configuration
// In production (Vercel), uses VITE_API_URL environment variable
// In development, falls back to localhost:3000
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
