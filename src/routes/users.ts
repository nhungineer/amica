  // Router is Express feature to create modular route handlers
  import { Router } from 'express';

  // Import Prisma client from src/db.ts
  import { prisma } from '../db';

  // Create router - a mini Express app for user routes

  const router = Router();

  // POST /users - Create a new user
  // handle POST requests to this router's root eg /users 
  // async waits for database operations
  // req.body - JSON data sent in the request - > destructuring const { email, name } tp extract those fields
  // Prisma.user.create(): prisma method to insert new user to the database
  router.post('/', async (req, res) => {
    try {
      const { email, name } = req.body;

      const user = await prisma.user.create({
        data: { email, name }
      });

      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: 'Failed to create user' });
    }
  });

  // GET /users/:id - Get user by ID
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });

  // Make this router available to import in other files

  export default router;