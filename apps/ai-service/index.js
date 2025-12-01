import express from 'express';
import cors from 'cors';
import 'dotenv/config'; // Loads .env file
import { router as aiRouter } from './router.js';

const app = express();
const port = process.env.AI_SERVICE_PORT || 3002;

// --- Middleware ---
// Using module type, so __dirname is not available.
// Use 'import.meta.url' if you need file paths.
app.use(cors()); // Allow requests (e.g., from your Next.js app)
app.use(express.json()); // Parse JSON bodies

// --- Routes ---
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'ai-service' });
});

app.use('/api/ai', aiRouter);

// --- Start Server ---
app.listen(port, () => {
  console.log(`🚀 AI service listening on http://localhost:${port}`);
});