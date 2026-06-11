/** Erro com status HTTP — capturado pelo errorHandler global. */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export const badRequest = (message: string) => new HttpError(400, message);
export const unauthorized = (message = 'Não autorizado') => new HttpError(401, message);
export const forbidden = (message = 'Acesso negado') => new HttpError(403, message);
export const notFound = (message = 'Recurso não encontrado') => new HttpError(404, message);
