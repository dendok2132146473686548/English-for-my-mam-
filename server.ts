import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { handleChatRoute, handleEvaluateRoute, handleReportRoute, handleStatusRoute } from './src/server/api.ts';

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());

// API Endpoints
app.get('/api/status', handleStatusRoute);
app.post('/api/chat', handleChatRoute);
app.post('/api/evaluate', handleEvaluateRoute);
app.post('/api/report', handleReportRoute);

// Robust resolution of dist directory
// When bundled into dist/server.cjs, __dirname is the dist directory itself.
// When running from repo root, process.cwd()/dist is the dist directory.
const candidateDistDirs = [
  path.resolve(process.cwd(), 'dist'),
  path.resolve(__dirname),
  path.resolve(__dirname, 'dist'),
  path.resolve(process.cwd()),
];

let distPath = candidateDistDirs.find((dir) => fs.existsSync(path.join(dir, 'index.html'))) || candidateDistDirs[0];

console.log(`[Static Server] Serving files from: ${distPath} (index.html exists: ${fs.existsSync(path.join(distPath, 'index.html'))})`);

// 1. Explicitly serve /assets with strict caching and fallthrough: false (never send HTML for missing asset)
const assetsPath = path.join(distPath, 'assets');
if (fs.existsSync(assetsPath)) {
  app.use('/assets', express.static(assetsPath, {
    maxAge: '1y',
    immutable: true,
  }));
}

// 2. Serve all other static files from dist root (favicon, robots, etc.)
app.use(express.static(distPath));

// Healthcheck endpoints for Render
app.get('/healthz', (_req, res) => res.status(200).send('OK'));
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// 3. SPA Fallback - ONLY for HTML page navigations, NEVER for assets
app.get('*', (req, res) => {
  // If an asset or media file wasn't found in express.static, return a proper 404, NOT index.html
  if (
    req.path.startsWith('/assets/') ||
    /\.(css|js|map|ico|png|jpg|jpeg|svg|woff2?|ttf|eot)$/i.test(req.path)
  ) {
    return res.status(404).type('text/plain').send('Asset not found');
  }

  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.sendFile(indexPath);
  } else {
    // Re-check candidate directories in case build just finished
    const found = candidateDistDirs.find((dir) => fs.existsSync(path.join(dir, 'index.html')));
    if (found) {
      distPath = found;
      res.setHeader('Content-Type', 'text/html; charset=UTF-8');
      res.sendFile(path.join(distPath, 'index.html'));
    } else {
      console.error(`[Static Server] index.html not found at ${indexPath}`);
      res.status(404).send('Application index.html not found. Make sure "npm run build" completed successfully.');
    }
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Production server running on http://0.0.0.0:${port}`);
});
