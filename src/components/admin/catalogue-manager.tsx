"use client";
import Image from "next/image";
import { useMemo, useState } from "react";

type Product = { id: string; name: string; brand: string; description: string; priceCents: number | null; priceStatus: "CONFIRMED" | "VERIFY" | "MISSING"; imagePath: string; active: boolean; available: boolean; featured: boolean; displayOrder: number };

export function CatalogueManager({ initial }: { initial: Product[] }) {
  const [items, setItems] = useState(initial);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const visible = useMemo(() => items.filter(item => `${item.name} ${item.brand}`.toLowerCase().includes(query.toLowerCase())), [items, query]);
  async function save(item: Product, change: Partial<Product>) {
    setError("");
    const response = await fetch(`/api/admin/products/${item.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(change) });
    const data = await response.json();
    if (!response.ok) return setError(data.error);
    setItems(current => current.map(value => value.id === item.id ? data : value));
  }
  return <><input value={query} onChange={event => setQuery(event.target.value)} aria-label="Rechercher un produit" placeholder="Rechercher" className="mt-6 w-full rounded-xl border p-3" />{error && <p role="alert" className="mt-3 text-red-700">{error}</p>}<div className="mt-6 space-y-4">{visible.map(product => <article key={product.id} className="grid gap-4 rounded-2xl bg-white p-5 md:grid-cols-[120px_1fr]"><div className="relative aspect-square"><Image src={product.imagePath} alt={`Aperçu de ${product.name}`} fill sizes="120px" className="object-contain" /></div><div><h2 className="font-serif text-2xl">{product.name}</h2><p>{product.brand}</p><label className="mt-3 block">Description<textarea defaultValue={product.description} onBlur={event => save(product, { description: event.target.value })} className="mt-1 min-h-20 w-full rounded-xl border p-2" /></label><div className="mt-3 grid gap-3 sm:grid-cols-3"><label>Prix en euros<input type="number" min="0" step="0.01" defaultValue={product.priceCents == null ? "" : product.priceCents / 100} onBlur={event => save(product, { priceCents: event.target.value === "" ? null : Math.round(Number(event.target.value) * 100) })} className="mt-1 block w-full rounded-xl border p-2" /></label><label>État du prix<select value={product.priceStatus} onChange={event => save(product, { priceStatus: event.target.value as Product["priceStatus"] })} className="mt-1 block w-full rounded-xl border p-2"><option value="CONFIRMED">Confirmé</option><option value="VERIFY">À vérifier</option><option value="MISSING">À confirmer</option></select></label><label>Ordre d’affichage<input type="number" min="0" value={product.displayOrder} onChange={event => setItems(current => current.map(value => value.id === product.id ? { ...value, displayOrder: Number(event.target.value) } : value))} onBlur={event => save(product, { displayOrder: Number(event.target.value) })} className="mt-1 block w-full rounded-xl border p-2" /></label></div><div className="mt-4 flex flex-wrap gap-4">{(["active", "available", "featured"] as const).map(key => <label key={key}><input type="checkbox" checked={product[key]} onChange={event => save(product, { [key]: event.target.checked })} /> {key === "active" ? "Actif" : key === "available" ? "Disponible" : "Vedette"}</label>)}</div><p className="mt-3 text-xs text-black/55">Pour archiver ce produit, désactivez-le. Aucune suppression définitive n’est proposée.</p></div></article>)}</div></>;
}
