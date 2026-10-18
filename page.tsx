"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import StatusBadge from "../_components/StatusBadge";
import { fetchOrder, patchOrder, type OrderUpdate } from "../_lib/api";
import {
  ORDER_STATUSES,
  STATUS_META,
  formatDate,
  formatMoney,
  shortId,
  type Order,
  type OrderStatus,
} from "../_lib/order-contract";

type FormState = {
  customerName: string;
  phone: string;
  street: string;
  number: string;
  complement: string;
  city: string;
  postalCode: string;
  country: string;
  quantity: string;
  notes: string;
  status: OrderStatus;
};

function toForm(o: Order): FormState {
  return {
    customerName: o.customerName ?? "",
    phone: o.phone ?? "",
    street: o.address?.street ?? "",
    number: o.address?.number ?? "",
    complement: o.address?.complement ?? "",
    city: o.address?.city ?? "",
    postalCode: o.address?.postalCode ?? "",
    country: o.address?.country ?? "",
    quantity: String(o.quantity ?? 1),
    notes: o.notes ?? "",
    status: o.status,
  };
}

function validate(f: FormState): string | null {
  if (!f.customerName.trim()) return "Indica o nome do cliente.";
  if (!f.phone.trim()) return "Indica o telefone.";
  const q = Number(f.quantity);
  if (!Number.isInteger(q) || q < 1) {
    return "A quantidade tem de ser um número inteiro, no mínimo 1.";
  }
  return null;
}

function toPatch(f: FormState): OrderUpdate {
  return {
    customerName: f.customerName.trim(),
    phone: f.phone.trim(),
    address: {
      street: f.street.trim(),
      number: f.number.trim(),
      complement: f.complement.trim(),
      city: f.city.trim(),
      postalCode: f.postalCode.trim(),
      country: f.country.trim(),
    },
    quantity: Number(f.quantity),
    notes: f.notes,
    status: f.status,
  };
}

const inputClass =
  "w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-base text-neutral-100 placeholder:text-neutral-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400";

function Field({
  label,
  htmlFor,
  className = "",
  children,
}: {
  label: string;
  htmlFor: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1 block text-sm text-neutral-400">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function ManagerOrderPage() {
  const { id } = useParams<{ id: string }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const o = await fetchOrder(id);
      setOrder(o);
      setForm(toForm(o));
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Não foi possível carregar.");
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const dirty = useMemo(() => {
    if (!order || !form) return false;
    return JSON.stringify(form) !== JSON.stringify(toForm(order));
  }, [order, form]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
    setSaved(false);
    setFormError(null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form || saving) return;
    const problem = validate(form);
    if (problem) {
      setFormError(problem);
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const updated = await patchOrder(id, toPatch(form));
      setOrder(updated);
      setForm(toForm(updated));
      setSaved(true);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Não foi possível guardar.");
    } finally {
      setSaving(false);
    }
  }

  const back = (
    <Link
      href="/manager"
      className="inline-block text-sm text-neutral-400 hover:text-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
    >
      ← Encomendas
    </Link>
  );

  if (loadError) {
    return (
      <div className="space-y-4">
        {back}
        <div
          role="alert"
          className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
        >
          <p>{loadError}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-2 rounded-md border border-rose-400/40 px-3 py-1 text-rose-100 hover:bg-rose-500/20"
          >
            Tentar de novo
          </button>
        </div>
      </div>
    );
  }

  if (!order || !form) {
    return (
      <div className="space-y-4">
        {back}
        <p className="py-10 text-center text-sm text-neutral-500">
          A carregar encomenda…
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      {back}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <h1 className="text-xl font-semibold tracking-tight">
          Encomenda{" "}
          <span className="font-mono text-neutral-300">{order.orderNumber ?? shortId(order.id)}</span>
        </h1>
        <StatusBadge status={order.status} />
      </div>

      <dl className="grid grid-cols-2 gap-4 rounded-lg border border-neutral-800 bg-neutral-900 p-4 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-neutral-400">Preço unitário</dt>
          <dd className="mt-0.5 tabular-nums">{formatMoney(order.unitPrice)}</dd>
        </div>
        <div>
          <dt className="text-neutral-400">Total</dt>
          <dd className="mt-0.5 tabular-nums">{formatMoney(order.total)}</dd>
        </div>
        <div>
          <dt className="text-neutral-400">Criada</dt>
          <dd className="mt-0.5">{formatDate(order.createdAt)}</dd>
        </div>
        <div>
          <dt className="text-neutral-400">Atualizada</dt>
          <dd className="mt-0.5">{formatDate(order.updatedAt)}</dd>
        </div>
      </dl>

      <section className="space-y-4">
        <h2 className="text-base font-semibold">Cliente</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome" htmlFor="customerName">
            <input
              id="customerName"
              className={inputClass}
              value={form.customerName}
              onChange={(e) => set("customerName", e.target.value)}
              autoComplete="off"
            />
          </Field>
          <Field label="Telefone" htmlFor="phone">
            <input
              id="phone"
              type="tel"
              className={inputClass}
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              autoComplete="off"
            />
          </Field>
          <Field label="Email (só leitura)" htmlFor="email" className="sm:col-span-2">
            <input
              id="email"
              className={`${inputClass} cursor-not-allowed text-neutral-500`}
              value={order.email ?? ""}
              readOnly
              tabIndex={-1}
            />
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold">Morada</h2>
        <div className="grid gap-4 sm:grid-cols-6">
          <Field label="Rua" htmlFor="street" className="sm:col-span-4">
            <input
              id="street"
              className={inputClass}
              value={form.street}
              onChange={(e) => set("street", e.target.value)}
              autoComplete="off"
            />
          </Field>
          <Field label="Número" htmlFor="number" className="sm:col-span-2">
            <input
              id="number"
              className={inputClass}
              value={form.number}
              onChange={(e) => set("number", e.target.value)}
              autoComplete="off"
            />
          </Field>
          <Field label="Complemento" htmlFor="complement" className="sm:col-span-6">
            <input
              id="complement"
              className={inputClass}
              value={form.complement}
              onChange={(e) => set("complement", e.target.value)}
              autoComplete="off"
            />
          </Field>
          <Field label="Código postal" htmlFor="postalCode" className="sm:col-span-2">
            <input
              id="postalCode"
              className={inputClass}
              value={form.postalCode}
              onChange={(e) => set("postalCode", e.target.value)}
              autoComplete="off"
            />
          </Field>
          <Field label="Cidade" htmlFor="city" className="sm:col-span-2">
            <input
              id="city"
              className={inputClass}
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              autoComplete="off"
            />
          </Field>
          <Field label="País" htmlFor="country" className="sm:col-span-2">
            <input
              id="country"
              className={inputClass}
              value={form.country}
              onChange={(e) => set("country", e.target.value)}
              autoComplete="off"
            />
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold">Encomenda</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Quantidade" htmlFor="quantity">
            <input
              id="quantity"
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              className={inputClass}
              value={form.quantity}
              onChange={(e) => set("quantity", e.target.value)}
            />
          </Field>
          <Field label="Estado" htmlFor="status">
            <select
              id="status"
              className={inputClass}
              value={form.status}
              onChange={(e) => set("status", e.target.value as OrderStatus)}
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_META[s].label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Notas" htmlFor="notes" className="sm:col-span-2">
            <textarea
              id="notes"
              rows={4}
              className={inputClass}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </Field>
        </div>
      </section>

      <div className="sticky bottom-0 -mx-4 border-t border-neutral-800 bg-neutral-950/95 px-4 py-3 backdrop-blur">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={!dirty || saving}
            className="rounded-lg bg-neutral-100 px-5 py-2.5 text-base font-medium text-neutral-900 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? "A guardar…" : "Guardar alterações"}
          </button>
          {dirty && !saving && (
            <button
              type="button"
              onClick={() => {
                setForm(toForm(order));
                setFormError(null);
              }}
              className="rounded-lg border border-neutral-800 px-4 py-2.5 text-base text-neutral-300 hover:border-neutral-600"
            >
              Descartar
            </button>
          )}
          <p role="status" aria-live="polite" className="text-sm">
            {formError && <span className="text-rose-300">{formError}</span>}
            {saved && !formError && (
              <span className="text-emerald-300">Alterações guardadas.</span>
            )}
          </p>
        </div>
      </div>
    </form>
  );
}
