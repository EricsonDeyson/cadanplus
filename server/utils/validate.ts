import { z } from 'zod';
import { HttpError } from './httpError';

/** Valida o body com um schema zod; lança 400 com a primeira mensagem em caso de erro. */
export function validate<T extends z.ZodType>(schema: T, data: unknown): z.output<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const first = result.error.issues[0];
    throw new HttpError(400, first ? first.message : 'Dados inválidos');
  }
  return result.data;
}
