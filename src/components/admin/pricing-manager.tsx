"use client";
import { useState } from "react";

type Variant = { id: string; code: string; label: string; priceCents: number; extraLengthCents: number; active: boolean };

export function PricingManager({ initial }: { initial: Variant[] }) {
  const [items, setItems] = useState(initial);
  const [error, setError] = useState("");
  async function save(item: Variant, change: Partial<Variant>) {
    setError("");
    const response = await fetch(`/api/admin/service-variants/${item.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(change) });
    const data = await response.json();
    if (!response.ok) return setError(data.error);
    setItems(current => current.map(value => value.id === item.id ? data : value));
  }
  return <div className="mt-8 space-y-4">{error && <p role="alert" className="text-red-700">{error}</p>}{items.map(variant => <article className="rounded-2xl bg-white p-5" key={variant.id}><h2 className="font-serif text-2xl">{variant.code} · {variant.label}</h2><div className="mt-4 grid gap-4 sm:grid-cols-2"><label>Prix de départ (€)<input aria-label={`Prix ${variant.code}`} className="mt-1 block w-full rounded-xl border p-2" type="number" min="0" step="0.01" defaultValue={variant.priceCents / 100} onBlur={event => save(variant, { priceCents: Math.round(Number(event.target.value) * 100) })} /></label><label>Supplément longueur (€)<input aria-label={`Supplément ${variant.code}`} className="mt-1 block w-full rounded-xl border p-2" type="number" min="0" step="0.01" defaultValue={variant.extraLengthCents / 100} onBlur={event => save(variant, { extraLengthCents: Math.round(Number(event.target.value) * 100) })} /></label></div><label className="mt-4 block"><input type="checkbox" checked={variant.active} onChange={event => save(variant, { active: event.target.checked })} /> Variante active</label></article>)}</div>;
}
