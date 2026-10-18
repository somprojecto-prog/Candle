import type { Order, OrderAddress, OrderStatus } from "./order-contract";

/** Campos editáveis enviados no PATCH /api/orders/[id]. */
export type OrderUpdate = {
  customerName: string;
  phone: string;
  address: OrderAddress;
  quantity: number;
  notes: string;
  status: OrderStatus;
};

async function parse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Erro ${res.status}`;
    try {
      const body = await res.json();
      if (body && typeof body.error === "string") message = body.error;
      else if (body && typeof body.message === "string") message = body.message;
    } catch {
      // resposta sem JSON: fica a mensagem genérica
    }
    throw new Error(message);
  }
  return (await res.json()) as T;
}

export async function fetchOrders(): Promise<Order[]> {
  const res = await fetch("/api/orders", { cache: "no-store" });
  return parse<Order[]>(res);
}

export async function fetchOrder(id: string): Promise<Order> {
  const res = await fetch(`/api/orders/${encodeURIComponent(id)}`, {
    cache: "no-store",
  });
  return parse<Order>(res);
}

export async function patchOrder(
  id: string,
  data: OrderUpdate,
): Promise<Order> {
  const res = await fetch(`/api/orders/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parse<Order>(res);
}
