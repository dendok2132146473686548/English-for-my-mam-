/**
 * API handler implementation for both Express server and Vite connect middleware
 */
import type { Request, Response, NextFunction } from 'express';
import {
  generateConversationReply,
  evaluateUserAnswer,
  generateConversationReport,
} from './gemini.ts';

export async function handleChatRoute(req: Request, res: Response) {
  try {
    const { level, situationTitle, history, userFacts, usedTopics } = req.body || {};
    if (!level) {
      return res.status(400).json({ error: 'Level is required' });
    }

    const result = await generateConversationReply({
      level,
      situationTitle,
      history: history || [],
      userFacts: userFacts || [],
      usedTopics: usedTopics || [],
    });

    if (!result) {
      return res.status(503).json({ error: 'AI unavailable' });
    }

    return res.json(result);
  } catch (err) {
    console.error('API /api/chat error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function handleEvaluateRoute(req: Request, res: Response) {
  try {
    const { userText, question, level, mode } = req.body || {};
    if (!userText) {
      return res.status(400).json({ error: 'userText is required' });
    }

    const result = await evaluateUserAnswer({
      userText,
      question: question || '',
      level: level || 'A1',
      mode: mode || 'normal',
    });

    if (!result) {
      return res.status(503).json({ error: 'Evaluation AI unavailable' });
    }

    return res.json(result);
  } catch (err) {
    console.error('API /api/evaluate error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function handleReportRoute(req: Request, res: Response) {
  try {
    const { level, messages, situationTitle } = req.body || {};
    if (!level || !messages) {
      return res.status(400).json({ error: 'level and messages required' });
    }

    const result = await generateConversationReport({
      level,
      messages,
      situationTitle: situationTitle || 'Разговор',
    });

    if (!result) {
      return res.status(503).json({ error: 'Report AI unavailable' });
    }

    return res.json(result);
  } catch (err) {
    console.error('API /api/report error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
