declare global {
  namespace Express {
    interface Request {
      /** Usuário autenticado (populado pelo middleware requireAuth). */
      user?: { id: string; email: string };
      /** JWT do Supabase recebido na requisição. */
      accessToken?: string;
    }
  }
}

export {};
