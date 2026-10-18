import { NextResponse } from "next/server";
import { requireManager } from "@/lib/orders/auth";
import { createOrder, listOrders } from "@/lib/orders/repository";
import { createOrderSchema, firstError } from "@/lib/orders/validation";

export const dynamic = "force-dynamic";

/** Público: o cliente cria a encomenda. */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });
  }
  try {
    const order = await createOrder(parsed.data);
    return NextResponse.json(order, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível registar a encomenda. Tente novamente." },
      { status: 500 },
    );
  }
}

/** Manager: lista de encomendas. */
export async function GET(req: Request) {
  const denied = requireManager(req);
  if (denied) return denied;
  return NextResponse.json(await listOrders());
}
