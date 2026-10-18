import { NextResponse } from "next/server";
import { requireManager } from "@/lib/orders/auth";
import { getOrder, updateOrder } from "@/lib/orders/repository";
import { firstError, updateOrderSchema } from "@/lib/orders/validation";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Ctx) {
  const denied = requireManager(req);
  if (denied) return denied;
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) return NextResponse.json({ error: "Encomenda não encontrada." }, { status: 404 });
  return NextResponse.json(order);
}

export async function PATCH(req: Request, { params }: Ctx) {
  const denied = requireManager(req);
  if (denied) return denied;
  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }
  const parsed = updateOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });
  }
  const order = await updateOrder(id, parsed.data);
  if (!order) return NextResponse.json({ error: "Encomenda não encontrada." }, { status: 404 });
  return NextResponse.json(order);
}
