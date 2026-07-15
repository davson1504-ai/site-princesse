"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { hairstyles, services } from "@/data/site";
import Script from "next/script";

export function BookingForm() {
  const params = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [service, setService] = useState(params.get("service") || services[0].id);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [availabilityVersion, setAvailabilityVersion] = useState(0);

  useEffect(() => {
    if (!date || !service) return;
    const controller = new AbortController();
    fetch(`/api/availability?date=${encodeURIComponent(date)}&service=${encodeURIComponent(service)}`, { signal: controller.signal })
      .then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error); setSlots(data.slots); })
      .catch((reason) => { if (reason.name !== "AbortError") { setSlots([]); setError(reason.message || "Impossible de charger les créneaux"); } });
    return () => controller.abort();
  }, [date, service, availabilityVersion]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const raw = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch("/api/appointments", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...raw, turnstileToken: raw["cf-turnstile-response"], privacy: raw.privacy === "on" }) });
    const data = await response.json();
    if (response.ok) location.href = `/confirmation/${data.reference}?wa=${encodeURIComponent(data.whatsappUrl || "")}`;
    else { setError(data.error || "Impossible d’envoyer la demande"); setBusy(false); if (response.status === 409) setAvailabilityVersion((value) => value + 1); }
  }

  return <form onSubmit={submit} className="grid gap-5 md:grid-cols-2">
    {error && <p role="alert" className="md:col-span-2 rounded-xl bg-red-50 p-4 text-red-800">{error}</p>}
    <Field label="Nom complet" name="customerName"/><Field label="Téléphone" name="phone" type="tel"/>
    <Field label="WhatsApp (format international)" name="whatsapp" type="tel"/><Field label="Email (facultatif)" name="email" type="email" optional/>
    <label>Service<select required name="serviceId" value={service} onChange={(event) => { setService(event.target.value); setSlots([]); }} className="mt-2 w-full rounded-xl border border-black/15 bg-white p-3">{services.map((item) => <option value={item.id} key={item.id}>{item.name} · {item.duration}</option>)}</select></label>
    <Select label="Coiffure" name="hairstyleId" defaultValue={params.get("coiffure") || hairstyles[0].id} options={hairstyles.map((item) => [item.id, item.name])}/>
    <label>Date<input required name="appointmentDate" type="date" value={date} min={new Date().toISOString().slice(0,10)} onChange={(event) => { setDate(event.target.value); setSlots([]); setError(""); }} className="mt-2 w-full rounded-xl border border-black/15 bg-white p-3"/></label>
    <label>Heure<select required name="appointmentTime" disabled={!date || slots.length === 0} className="mt-2 w-full rounded-xl border border-black/15 bg-white p-3 disabled:opacity-60"><option value="">{slots.length ? "Choisir un créneau" : date ? "Chargement ou aucun créneau" : "Choisissez d'abord une date"}</option>{slots.map((slot) => <option value={slot} key={slot}>{slot}</option>)}</select></label>
    <Field label="Localisation / adresse" name="location"/><Select label="Lieu" name="appointmentType" options={[["salon","Au salon"],["domicile","À domicile"]]}/>
    <Select label="Contact préféré" name="preferredContactMethod" options={[["whatsapp","WhatsApp"],["telephone","Téléphone"],["email","Email"]]}/>
    <label className="md:col-span-2">Message<textarea name="message" maxLength={1000} className="mt-2 min-h-28 w-full rounded-xl border border-black/15 bg-white p-3"/></label>
    <input tabIndex={-1} autoComplete="off" name="website" className="absolute -left-[9999px]" aria-hidden="true"/>
    {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && <div className="md:col-span-2"><Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload"/><div className="cf-turnstile" data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}/></div>}
    <label className="md:col-span-2 flex gap-3 text-sm"><input required type="checkbox" name="privacy"/>J’accepte la politique de confidentialité.</label>
    <button disabled={busy || !slots.length} className="md:col-span-2 rounded-full bg-[#231b1b] px-6 py-4 text-white disabled:opacity-50">{busy ? "Envoi…" : "Envoyer ma demande"}</button>
  </form>;
}

function Field({label,name,type="text",optional=false}:{label:string;name:string;type?:string;optional?:boolean}){return <label>{label}<input required={!optional} name={name} type={type} maxLength={name==="customerName"?120:200} className="mt-2 w-full rounded-xl border border-black/15 bg-white p-3"/></label>}
function Select({label,name,options,defaultValue}:{label:string;name:string;options:string[][];defaultValue?:string}){return <label>{label}<select required name={name} defaultValue={defaultValue||options[0]?.[0]||""} className="mt-2 w-full rounded-xl border border-black/15 bg-white p-3">{options.map(([value,text])=><option value={value} key={value}>{text}</option>)}</select></label>}
