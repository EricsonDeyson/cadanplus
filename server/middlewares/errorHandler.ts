import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { HttpError } from '../utils/httpError';

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: 'Rota não encontrada' });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  console.error('Erro não tratado:', err);
  const message =
    env.NODE_ENV === 'development' && err instanceof Error ? err.message : 'Erro interno do servidor';
  res.status(500).json({ error: message });
}
