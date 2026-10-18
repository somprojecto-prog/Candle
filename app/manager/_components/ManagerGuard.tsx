import type { ReactNode } from "react";

/**
 * Ponto de entrada da autenticação do /manager.
 *
 * POR AGORA deixa passar toda a gente. Quando a auth existir, é aqui
 * (num único sítio) que se verifica a sessão e o papel, por exemplo:
 *
 *   import { redirect } from "next/navigation";
 *   const session = await getSession();
 *   if (!session || !MANAGER_ROLES.includes(session.role)) redirect("/login");
 *
 * Para isso, passa a função a `async`. Alternativa: um middleware.ts na raiz
 * com matcher "/manager/:path*" (e proteger também a API, que é o que
 * realmente importa).
 */
export const MANAGER_ROLES = ["admin", "manager"] as const;

export default function ManagerGuard({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
