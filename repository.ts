import { Prisma, type Order as Row } from "@prisma/client";
import { prisma } from "./db";
import { UNIT_PRICE, type Order, type OrderStatus } from "./types";
import type { CreateOrderInput, UpdateOrderInput } from "./validation";

const round2 = (n: number) => Math.round(n * 100) / 100;

function toOrder(r: Row): Order {
  return {
    id: r.id,
    orderNumber: r.orderNumber,
    status: r.status as OrderStatus,
    customerName: r.customerName,
    phone: r.phone,
    email: r.email,
    address: {
      street: r.street,
      number: r.number,
      complement: r.complement,
      city: r.city,
      postalCode: r.postalCode,
      country: r.country,
    },
    quantity: r.quantity,
    notes: r.notes,
    unitPrice: r.unitPrice,
    total: r.total,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const count = await prisma.order.count();
      const orderNumber = `CSC-${String(count + 1 + attempt).padStart(4, "0")}`;
      const row = await prisma.order.create({
        data: {
          orderNumber,
          customerName: input.customerName,
          phone: input.phone,
          email: input.email,
          street: input.address.street,
          number: input.address.number,
          complement: input.address.complement,
          city: input.address.city,
          postalCode: input.address.postalCode,
          country: input.address.country,
          quantity: input.quantity,
          notes: input.notes,
          unitPrice: UNIT_PRICE,
          total: round2(UNIT_PRICE * input.quantity),
        },
      });
      return toOrder(row);
    } catch (e) {
      // número repetido (pedidos em simultâneo): tenta o seguinte
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") continue;
      throw e;
    }
  }
  throw new Error("Não foi possível gerar o número da encomenda.");
}

export async function listOrders(): Promise<Order[]> {
  const rows = await prisma.order.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map(toOrder);
}

export async function getOrder(id: string): Promise<Order | null> {
  const row = await prisma.order.findUnique({ where: { id } });
  return row ? toOrder(row) : null;
}

export async function updateOrder(id: string, input: UpdateOrderInput): Promise<Order | null> {
  const current = await prisma.order.findUnique({ where: { id } });
  if (!current) return null;
  const row = await prisma.order.update({
    where: { id },
    data: {
      status: input.status,
      customerName: input.customerName,
      phone: input.phone,
      street: input.address.street,
      number: input.address.number,
      complement: input.address.complement,
      city: input.address.city,
      postalCode: input.address.postalCode,
      country: input.address.country,
      quantity: input.quantity,
      notes: input.notes,
      total: round2(current.unitPrice * input.quantity),
    },
  });
  return toOrder(row);
}
