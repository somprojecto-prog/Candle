/**
 * PONTO ÚNICO de autenticação da API do manager.
 * POR AGORA deixa passar tudo. ANTES DE PUBLICAR o site, implementa aqui
 * a verificação de sessão/papel (admin | manager). Devolve uma Response
 * 401/403 para bloquear, ou null para deixar passar.
 */
export function requireManager(_req: Request): Response | null {
  return null;
}
