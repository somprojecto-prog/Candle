/**
 * Contrato local do painel /manager.
 *
 * Todos os ficheiros do manager importam o tipo Order DAQUI. Quando
 * lib/orders/types.ts existir, troca o bloco "Tipos" por:
 *
 *   export type { Order, OrderStatus } from "@/lib/orders/types";
 *
 * e confirma que os nomes dos campos batem certo.
 */

// ── Tipos ────────────────────────────────────────────────────────────
export type OrderStatus =
  | "pendente"
  | "confirmada"
  | "enviada"
  | "entregue"
  | "cancelada";

export type OrderAddress = {
  street: string;
  number: string;
  complement: string;
  city: string;
  postalCode: string;
  country: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  customerName: string;
  phone: string;
  email: string;
  address: OrderAddress;
  quantity: number;
  notes: string;
  unitPrice: number;
  total: number;
  createdAt: string;
  updatedAt: string;
};

// ── Estados (rótulos + cores dos badges) ─────────────────────────────
export const ORDER_STATUSES: OrderStatus[] = [
  "pendente",
  "confirmada",
  "enviada",
  "entregue",
  "cancelada",
];

export const STATUS_META: Record<
  OrderStatus,
  { label: string; badge: string }
> = {
  pendente: {
    label: "Pendente",
    badge: "bg-amber-500/15 text-amber-300 ring-amber-400/30",
  },
  confirmada: {
    label: "Confirmada",
    badge: "bg-sky-500/15 text-sky-300 ring-sky-400/30",
  },
  enviada: {
    label: "Enviada",
    badge: "bg-violet-500/15 text-violet-300 ring-violet-400/30",
  },
  entregue: {
    label: "Entregue",
    badge: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30",
  },
  cancelada: {
    label: "Cancelada",
    badge: "bg-rose-500/15 text-rose-300 ring-rose-400/30",
  },
};

// ── Formatação ───────────────────────────────────────────────────────
// Assume unitPrice/total em euros (não em cêntimos).
const money = new Intl.NumberFormat("pt-PT", {
  style: "currency",
  currency: "EUR",
});

export function formatMoney(value: number): string {
  return money.format(value);
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" });
}

export function shortId(id: string): string {
  return id.length > 8 ? id.slice(0, 8) : id;
}

export function formatAddress(a: OrderAddress): string {
  const line1 = [a.street, a.number].filter(Boolean).join(", ");
  const line2 = [a.complement, a.postalCode, a.city].filter(Boolean).join(" ");
  return [line1, line2, a.country].filter(Boolean).join(" · ");
}

// ── Pesquisa ─────────────────────────────────────────────────────────
/** Minúsculas e sem acentos, para pesquisar "joao" e achar "João". */
export function fold(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

export function digitsOnly(text: string): string {
  return text.replace(/\D/g, "");
}
