"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import StatusBadge from "./_components/StatusBadge";
import { fetchOrders } from "./_lib/api";
import {
  ORDER_STATUSES,
  STATUS_META,
  digitsOnly,
  fold,
  formatDate,
  formatMoney,
  shortId,
  type Order,
  type OrderStatus,
} from "./_lib/order-contract";

type StatusFilter = OrderStatus | "todas";

export default function ManagerOrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusFilter>("todas");
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setError(null);
    try {
      setOrders(await fetchOrders());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível carregar.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const counts = useMemo(() => {
    const c: Record<StatusFilter, number> = {
      todas: orders?.length ?? 0,
      pendente: 0,
      confirmada: 0,
      enviada: 0,
      entregue: 0,
      cancelada: 0,
    };
    for (const o of orders ?? []) c[o.status] += 1;
    return c;
  }, [orders]);

  const filtered = useMemo(() => {
    const q = fold(query.trim());
    const qDigits = digitsOnly(query);
    return (orders ?? [])
      .filter((o) => {
        if (status !== "todas" && o.status !== status) return false;
        if (!q) return true;
        if (fold(o.customerName).includes(q)) return true;
        return qDigits.length > 0 && digitsOnly(o.phone).includes(qDigits);
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [orders, status, query]);

  const filters: StatusFilter[] = ["todas", ...ORDER_STATUSES];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Encomendas</h1>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar por nome ou telefone"
          aria-label="Pesquisar por nome ou telefone"
          className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-base text-neutral-100 placeholder:text-neutral-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 sm:max-w-xs"
        />
      </div>

      <div
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1"
        role="group"
        aria-label="Filtrar por estado"
      >
        {filters.map((f) => {
          const active = status === f;
          return (
            <button
              key={f}
              type="button"
              onClick={() => setStatus(f)}
              aria-pressed={active}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                active
                  ? "border-neutral-200 bg-neutral-100 text-neutral-900"
                  : "border-neutral-800 text-neutral-300 hover:border-neutral-600"
              }`}
            >
              {f === "todas" ? "Todas" : STATUS_META[f].label}{" "}
              <span className={active ? "text-neutral-600" : "text-neutral-500"}>
                {counts[f]}
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => void load()}
            className="shrink-0 rounded-md border border-rose-400/40 px-3 py-1 text-rose-100 hover:bg-rose-500/20"
          >
            Tentar de novo
          </button>
        </div>
      )}

      {!orders && !error && (
        <p className="py-10 text-center text-sm text-neutral-500">
          A carregar encomendas…
        </p>
      )}

      {orders && filtered.length === 0 && (
        <p className="py-10 text-center text-sm text-neutral-500">
          {orders.length === 0
            ? "Ainda não há encomendas."
            : "Nenhuma encomenda corresponde ao filtro. Limpa a pesquisa ou escolhe outro estado."}
        </p>
      )}

      {filtered.length > 0 && (
        <>
          {/* Telemóvel: cartões */}
          <ul className="space-y-2 md:hidden">
            {filtered.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/manager/${encodeURIComponent(o.id)}`}
                  className="block rounded-lg border border-neutral-800 bg-neutral-900 p-4 hover:border-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{o.customerName}</p>
                      <p className="text-sm text-neutral-400">{o.phone}</p>
                    </div>
                    <StatusBadge status={o.status} />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-neutral-400">
                    <span>
                      {o.quantity} un. · {formatMoney(o.total)}
                    </span>
                    <span>{formatDate(o.createdAt)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {/* Ecrã largo: tabela */}
          <div className="hidden overflow-hidden rounded-lg border border-neutral-800 md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-900 text-neutral-400">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Encomenda</th>
                  <th scope="col" className="px-4 py-3 font-medium">Cliente</th>
                  <th scope="col" className="px-4 py-3 font-medium">Telefone</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Qtd.</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Total</th>
                  <th scope="col" className="px-4 py-3 font-medium">Estado</th>
                  <th scope="col" className="px-4 py-3 font-medium">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-neutral-900/60">
                    <td className="px-4 py-3">
                      <Link
                        href={`/manager/${encodeURIComponent(o.id)}`}
                        className="font-mono text-neutral-200 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                      >
                        {o.orderNumber ?? shortId(o.id)}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{o.customerName}</td>
                    <td className="px-4 py-3 text-neutral-300">{o.phone}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{o.quantity}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatMoney(o.total)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-4 py-3 text-neutral-400">
                      {formatDate(o.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
