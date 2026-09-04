import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { handleChatRoute, handleEvaluateRoute, handleReportRoute } from './src/server/api.ts';

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());

// API Endpoints
app.post('/api/chat', handleChatRoute);
app.post('/api/evaluate', handleEvaluateRoute);
app.post('/api/report', handleReportRoute);

// Static assets from built frontend
const distPath = path.join(process.cwd(), 'dist');
app.use(express.static(distPath));

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Production server running on http://0.0.0.0:${port}`);
});
