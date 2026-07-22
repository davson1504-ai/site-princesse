"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Script from "next/script";
import { hairstyles, services } from "@/data/site";
import {
  braidPrices,
  EXTRA_LENGTH_CENTS,
  formatEUR,
  type BraidSize,
} from "@/lib/pricing";
type Variant = {
  code: BraidSize;
  priceCents: number;
  extraLengthCents: number;
  active: boolean;
};
type HairstyleOption = { id: string; name: string };
export function BookingForm({ hairstyleOptions = hairstyles }: { hairstyleOptions?: HairstyleOption[] }) {
  const params = useSearchParams();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [service, setService] = useState(params.get("service") || services[0].id),
    [date, setDate] = useState(""),
    [slots, setSlots] = useState<string[]>([]),
    [version, setVersion] = useState(0),
    [dates, setDates] = useState<string[]>([]),
    [fullDates, setFullDates] = useState<string[]>([]),
    [size, setSize] = useState<BraidSize>("M"),
    [extra, setExtra] = useState(false),
    [variants, setVariants] = useState<Variant[]>(
      Object.entries(braidPrices).map(([code, priceCents]) => ({
        code: code as BraidSize,
        priceCents,
        extraLengthCents: EXTRA_LENGTH_CENTS,
        active: true,
      })),
    );
  useEffect(() => {
    fetch("/api/pricing")
      .then((response) => response.json())
      .then((payload) => {
        if (payload.variants?.length) {
          setVariants(payload.variants);
          setSize((current) =>
            payload.variants.some((v: Variant) => v.code === current)
              ? current
              : payload.variants[0].code,
          );
        }
      })
      .catch(() => undefined);
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/availability?service=${encodeURIComponent(service)}`, {
      signal: controller.signal,
    })
      .then((response) => response.json())
      .then((payload) => {
        const available = payload.dates || [];
        const full = payload.fullDates || [];
        setDates(available);
        setFullDates(full);
        setDate((current) =>
          current && !available.includes(current) ? "" : current,
        );
      })
      .catch((reason) => {
        if (reason.name !== "AbortError") {
          setDates([]);
          setFullDates([]);
        }
      });
    return () => controller.abort();
  }, [service, version]);
  useEffect(() => {
    if (!date || !service) return;
    const controller = new AbortController();
    fetch(
      `/api/availability?date=${encodeURIComponent(date)}&service=${encodeURIComponent(service)}`,
      { signal: controller.signal },
    )
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error);
        setSlots(data.slots);
      })
      .catch((reason) => {
        if (reason.name !== "AbortError") {
          setSlots([]);
          setError(reason.message || "Impossible de charger les créneaux");
        }
      });
    return () => controller.abort();
  }, [date, service, version]);
  const variant = variants.find((v) => v.code === size);
  const estimate =
    (variant?.priceCents || 0) + (extra ? variant?.extraLengthCents || 0 : 0);
  const days = useMemo(
    () =>
      Array.from({ length: 35 }, (_, i) => {
        const d = new Date();
        d.setHours(12, 0, 0, 0);
        d.setDate(d.getDate() + i);
        return d.toISOString().slice(0, 10);
      }),
    [],
  );
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const raw = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch("/api/appointments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...raw,
        turnstileToken: raw["cf-turnstile-response"],
        privacy: raw.privacy === "on",
      }),
    });
    const data = await response.json();
    if (response.ok)
      location.href = `/confirmation/${data.reference}?wa=${encodeURIComponent(data.whatsappUrl || "")}`;
    else {
      setError(data.error || "Impossible d’envoyer la demande");
      setBusy(false);
      if (response.status === 409) setVersion((x) => x + 1);
    }
  }
  return (
    <form onSubmit={submit} className="grid gap-5 md:grid-cols-2">
      {error && (
        <p
          role="alert"
          className="md:col-span-2 rounded-xl bg-red-50 p-4 text-red-800"
        >
          {error}
        </p>
      )}
      <Field label="Nom complet" name="customerName" />
      <Field label="Téléphone" name="phone" type="tel" />
      <Field
        label="WhatsApp (format international)"
        name="whatsapp"
        type="tel"
      />
      <Field label="Email (facultatif)" name="email" type="email" optional />
      <label>
        Service
        <select
          required
          name="serviceId"
          value={service}
          onChange={(e) => {
            setService(e.target.value);
            setSlots([]);
          }}
          className="mt-2 w-full rounded-xl border bg-white p-3"
        >
          {services.map((x) => (
            <option value={x.id} key={x.id}>
              {x.name} · {x.duration}
            </option>
          ))}
        </select>
      </label>
      <Select
        label="Coiffure"
        name="hairstyleId"
        defaultValue={params.get("coiffure") || hairstyles[0].id}
        options={hairstyleOptions.map((x) => [x.id, x.name])}
      />
      {service === "tresses" && (
        <fieldset className="md:col-span-2 rounded-2xl border p-4">
          <legend className="px-2 font-medium">Taille des tresses</legend>
          <div className="grid gap-3 sm:grid-cols-4">
            {variants.map((v) => (
              <label key={v.code} className="rounded-xl border p-3">
                <input
                  type="radio"
                  name="braidSizeCode"
                  value={v.code}
                  checked={size === v.code}
                  onChange={() => setSize(v.code)}
                />{" "}
                {v.code} · à partir de {formatEUR(v.priceCents)}
              </label>
            ))}
          </div>
          <label className="mt-4 flex gap-2">
            <input
              type="checkbox"
              name="extraLength"
              checked={extra}
              onChange={(e) => setExtra(e.target.checked)}
            />
            Longueur supérieure (+
            {formatEUR(variant?.extraLengthCents || EXTRA_LENGTH_CENTS)})
          </label>
          <p className="mt-3 font-semibold">
            Estimation : à partir de {formatEUR(estimate)}
          </p>
          <input type="hidden" name="estimatedPriceCents" value={estimate} />
          <p className="text-xs text-black/60">
            Estimation non contractuelle, confirmée après échange.
          </p>
        </fieldset>
      )}
      <fieldset className="md:col-span-2">
        <legend className="font-medium">Date</legend>
        <input
          aria-label="Date"
          required
          name="appointmentDate"
          type="text"
          value={date}
          readOnly
          placeholder="Choisissez une date verte"
          className="mt-2 rounded-xl border bg-white p-3"
        />
        <div
          className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-7"
          aria-label="Calendrier des disponibilités"
        >
          {days.map((d) => {
            const enabled = dates.includes(d);
            const full = fullDates.includes(d);
            const state = enabled
              ? "disponible"
              : full
                ? "complet"
                : "indisponible";
            return (
              <button
                type="button"
                key={d}
                disabled={!enabled}
                onClick={() => {
                  setDate(d);
                  setSlots([]);
                  setError("");
                }}
                aria-label={`${new Date(`${d}T12:00:00`).toLocaleDateString("fr-FR")}, ${state}`}
                className={`rounded-lg border p-2 text-xs ${enabled ? "border-green-700 bg-green-50" : "bg-gray-100 text-gray-400"}`}
              >
                {new Date(`${d}T12:00:00`).getDate()}
                <span className="sr-only">
                  {enabled ? " disponible" : full ? " complet" : " indisponible"}
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs">Vert : réservable · Gris : indisponible ou complet, avec son état annoncé par le lecteur d’écran.</p>
      </fieldset>
      <label>
        Heure
        <select
          required
          name="appointmentTime"
          disabled={!date || !slots.length}
          className="mt-2 w-full rounded-xl border bg-white p-3 disabled:opacity-60"
        >
          <option value="">
            {slots.length
              ? "Choisir un créneau"
              : date
                ? "Aucun créneau"
                : "Choisissez une date"}
          </option>
          {slots.map((x) => (
            <option value={x} key={x}>
              {x}
            </option>
          ))}
        </select>
      </label>
      <Field label="Localisation / adresse" name="location" />
      <Select
        label="Lieu"
        name="appointmentType"
        options={[
          ["salon", "Au salon"],
          ["domicile", "À domicile"],
        ]}
      />
      <Select
        label="Contact préféré"
        name="preferredContactMethod"
        options={[
          ["whatsapp", "WhatsApp"],
          ["telephone", "Téléphone"],
          ["email", "Email"],
        ]}
      />
      <label className="md:col-span-2">
        Message
        <textarea
          name="message"
          maxLength={1000}
          className="mt-2 min-h-28 w-full rounded-xl border bg-white p-3"
        />
      </label>
      <input
        tabIndex={-1}
        autoComplete="off"
        name="website"
        className="absolute -left-[9999px]"
        aria-hidden="true"
      />
      {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
        <div className="md:col-span-2">
          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js"
            strategy="lazyOnload"
          />
          <div
            className="cf-turnstile"
            data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
          />
        </div>
      )}
      <label className="md:col-span-2 flex gap-3 text-sm">
        <input required type="checkbox" name="privacy" />
        J’accepte la politique de confidentialité.
      </label>
      <button
        disabled={busy || !slots.length}
        className="md:col-span-2 rounded-full bg-[#231b1b] px-6 py-4 text-white disabled:opacity-50"
      >
        {busy ? "Envoi…" : "Envoyer ma demande"}
      </button>
    </form>
  );
}
function Field({
  label,
  name,
  type = "text",
  optional = false,
}: {
  label: string;
  name: string;
  type?: string;
  optional?: boolean;
}) {
  return (
    <label>
      {label}
      <input
        required={!optional}
        name={name}
        type={type}
        maxLength={name === "customerName" ? 120 : 200}
        className="mt-2 w-full rounded-xl border bg-white p-3"
      />
    </label>
  );
}
function Select({
  label,
  name,
  options,
  defaultValue,
}: {
  label: string;
  name: string;
  options: string[][];
  defaultValue?: string;
}) {
  return (
    <label>
      {label}
      <select
        required
        name={name}
        defaultValue={defaultValue || options[0]?.[0] || ""}
        className="mt-2 w-full rounded-xl border bg-white p-3"
      >
        {options.map(([value, text]) => (
          <option value={value} key={value}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
}
