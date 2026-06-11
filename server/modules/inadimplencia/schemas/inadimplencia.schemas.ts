import { z } from 'zod';

/** Filtro de período aplicado sobre a Data de Vencimento dos títulos. */
export const periodoSchema = z.object({
  from: z.iso.date('Data inicial inválida (use YYYY-MM-DD)').optional(),
  to: z.iso.date('Data final inválida (use YYYY-MM-DD)').optional(),
});

export const topClientesSchema = periodoSchema.extend({
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type PeriodoInput = z.infer<typeof periodoSchema>;
