import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import ManagerGuard from "./_components/ManagerGuard";

export const metadata: Metadata = {
  title: "Gestão de encomendas",
  robots: { index: false, follow: false },
};

/**
 * O root layout só traz fontes e <body>, por isso o painel não herda nada
 * do 3D nem do scroll suave. O contentor é `fixed inset-0 overflow-y-auto`
 * para ter o seu próprio scroll nativo, mesmo que o globals.css da loja
 * bloqueie o scroll do body.
 */
export default function ManagerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 overflow-y-auto bg-neutral-950 text-neutral-100">
      <header className="sticky top-0 z-20 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link
            href="/manager"
            className="text-base font-semibold tracking-tight text-neutral-100 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            Gestão de encomendas
          </Link>
          <Link
            href="/"
            className="text-sm text-neutral-400 hover:text-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            Ver loja
          </Link>
        </div>
      </header>

      <ManagerGuard>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </ManagerGuard>
    </div>
  );
}
