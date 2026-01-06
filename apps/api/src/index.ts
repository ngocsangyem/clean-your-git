/**
 * Express server setup for branch cleanup API
 */
import express from 'express';
import { corsMiddleware, errorHandler } from './middleware.js';
import { router } from './routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(corsMiddleware);
app.use(express.json());

// Routes
app.use(router);

// Error handling (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Branch cleanup API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
