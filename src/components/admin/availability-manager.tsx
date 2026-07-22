"use client";

import { useMemo, useState } from "react";

type Row = {
  id: string;
  date: string;
  isPublished: boolean;
  startMinutes: number;
  endMinutes: number;
  breakStartMinutes: number | null;
  breakEndMinutes: number | null;
  slotIntervalMinutes: number;
  note: string | null;
  appointmentCount: number;
};

const toDateKey = (value: string) => value.slice(0, 10);
const toTime = (minutes: number | null) =>
  minutes == null
    ? ""
    : `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
const toMinutes = (value: string) =>
  value ? Number(value.slice(0, 2)) * 60 + Number(value.slice(3)) : null;

export function AvailabilityManager({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState(initial);
  const [selectedDate, setSelectedDate] = useState(
    initial[0] ? toDateKey(initial[0].date) : "",
  );
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [error, setError] = useState("");
  const active = rows.filter(
    (x) =>
      x.isPublished &&
      toDateKey(x.date) >= new Date().toISOString().slice(0, 10),
  ).length;
  const selected = rows.find((x) => toDateKey(x.date) === selectedDate);

  const days = useMemo(() => {
    const [year, monthNumber] = month.split("-").map(Number);
    const first = new Date(year, monthNumber - 1, 1);
    const offset = (first.getDay() + 6) % 7;
    return Array.from({ length: 42 }, (_, i) => {
      const date = new Date(year, monthNumber - 1, i - offset + 1, 12);
      return {
        key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
        inMonth: date.getMonth() === monthNumber - 1,
        label: date.getDate(),
      };
    });
  }, [month]);

  async function publish() {
    if (!selectedDate) return setError("Choisissez une date future");
    setError("");
    const response = await fetch("/api/admin/availability", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ date: selectedDate }),
    });
    const data = await response.json();
    if (!response.ok) return setError(data.error);
    setRows((current) => [
      ...current.filter((row) => row.id !== data.id),
      { ...data, appointmentCount: 0 },
    ]);
  }

  async function save(change: Partial<Row>) {
    if (!selected) return;
    setError("");
    if (
      change.isPublished === false &&
      selected.appointmentCount > 0 &&
      !window.confirm(
        `Cette date contient ${selected.appointmentCount} rendez-vous. Ils seront conservés, mais aucune nouvelle demande ne sera acceptée. Continuer ?`,
      )
    )
      return;
    const response = await fetch(`/api/admin/availability/${selected.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(change),
    });
    const data = await response.json();
    if (!response.ok) return setError(data.error);
    setRows((current) =>
      current.map((row) =>
        row.id === selected.id
          ? { ...data, appointmentCount: row.appointmentCount }
          : row,
      ),
    );
  }

  const previewSlots = selected
    ? Array.from(
        {
          length: Math.max(
            0,
            Math.ceil(
              (selected.endMinutes - selected.startMinutes) /
                selected.slotIntervalMinutes,
            ),
          ),
        },
        (_, i) => selected.startMinutes + i * selected.slotIntervalMinutes,
      )
        .filter(
          (value) =>
            !(
              selected.breakStartMinutes != null &&
              selected.breakEndMinutes != null &&
              value >= selected.breakStartMinutes &&
              value < selected.breakEndMinutes
            ),
        )
        .map(toTime)
    : [];

  return (
    <div>
      <p className="mt-3 font-semibold" aria-live="polite">
        {active} / 7 dates publiées
      </p>
      {error && (
        <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-red-800">
          {error}
        </p>
      )}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <label>
          Mois{" "}
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="ml-2 rounded-xl border p-2"
          />
        </label>
        <label>
          Date future{" "}
          <input
            type="date"
            value={selectedDate}
            min={new Date().toISOString().slice(0, 10)}
            onInput={(e) => {
              setSelectedDate(e.currentTarget.value);
              if (e.currentTarget.value)
                setMonth(e.currentTarget.value.slice(0, 7));
            }}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              if (e.target.value) setMonth(e.target.value.slice(0, 7));
            }}
            className="ml-2 rounded-xl border p-2"
          />
        </label>
        <button
          type="button"
          disabled={
            !selectedDate || Boolean(selected?.isPublished) || active >= 7
          }
          onClick={publish}
          className="rounded-xl bg-[#231b1b] px-5 py-3 text-white disabled:opacity-45"
        >
          Publier la date sélectionnée
        </button>
      </div>
      <div
        className="mt-5 grid grid-cols-7 gap-2"
        role="grid"
        aria-label={`Calendrier des disponibilités ${month}`}
      >
        <div className="contents text-center text-xs font-semibold">
          {["L", "M", "M", "J", "V", "S", "D"].map((label, index) => (
            <span key={`${label}-${index}`}>{label}</span>
          ))}
        </div>
        {days.map((day) => {
          const row = rows.find((item) => toDateKey(item.date) === day.key);
          const past = day.key < new Date().toISOString().slice(0, 10);
          const state = row?.isPublished
            ? row.appointmentCount > 0
              ? "partielle"
              : "publiée"
            : row && row.appointmentCount > 0
              ? "fermée avec rendez-vous"
              : "indisponible";
          const style = row?.isPublished
            ? row.appointmentCount > 0
              ? "border-orange-600 bg-orange-50"
              : "border-green-700 bg-green-50"
            : row && row.appointmentCount > 0
              ? "border-red-700 bg-red-50"
              : "bg-gray-100 text-gray-500";
          return (
            <button
              type="button"
              role="gridcell"
              key={day.key}
              disabled={!day.inMonth || past}
              aria-label={`${new Date(`${day.key}T12:00:00`).toLocaleDateString("fr-FR")}, ${state}`}
              aria-selected={selectedDate === day.key}
              onClick={() => setSelectedDate(day.key)}
              className={`min-h-14 rounded-xl border p-2 focus-visible:outline-2 focus-visible:outline-offset-2 ${style} ${!day.inMonth ? "opacity-25" : ""} ${selectedDate === day.key ? "ring-2 ring-black" : ""}`}
            >
              <span>{day.label}</span>
              {row?.appointmentCount ? (
                <span className="block text-[10px]">
                  {row.appointmentCount} RDV
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-sm">
        <span aria-hidden>●</span> Vert : publiée · <span aria-hidden>●</span>{" "}
        Orange : publiée avec rendez-vous · <span aria-hidden>●</span> Rouge :
        fermée avec rendez-vous conservés · <span aria-hidden>○</span> Gris :
        indisponible.
      </p>
      {selected && (
        <section className="mt-8 rounded-2xl bg-white p-5">
          <h2 className="font-serif text-2xl">
            Configurer le{" "}
            {new Date(`${selectedDate}T12:00:00`).toLocaleDateString("fr-FR")}
          </h2>
          <p className="mt-1 text-sm text-black/60">
            {selected.appointmentCount} rendez-vous enregistré
            {selected.appointmentCount > 1 ? "s" : ""}.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <TimeField
              label="Début"
              value={toTime(selected.startMinutes)}
              onCommit={(value) =>
                save({ startMinutes: value ?? selected.startMinutes })
              }
            />
            <TimeField
              label="Fin"
              value={toTime(selected.endMinutes)}
              onCommit={(value) =>
                save({ endMinutes: value ?? selected.endMinutes })
              }
            />
            <TimeField
              label="Début pause"
              value={toTime(selected.breakStartMinutes)}
              optional
              onCommit={(value) => save({ breakStartMinutes: value })}
            />
            <TimeField
              label="Fin pause"
              value={toTime(selected.breakEndMinutes)}
              optional
              onCommit={(value) => save({ breakEndMinutes: value })}
            />
            <label>
              Intervalle
              <select
                value={selected.slotIntervalMinutes}
                onChange={(e) =>
                  save({ slotIntervalMinutes: Number(e.target.value) })
                }
                className="mt-1 block w-full rounded-xl border p-2"
              >
                {[15, 30, 45, 60].map((value) => (
                  <option key={value} value={value}>
                    {value} min
                  </option>
                ))}
              </select>
            </label>
            <label className="sm:col-span-2">
              Note
              <input
                defaultValue={selected.note ?? ""}
                onBlur={(e) => save({ note: e.target.value || null })}
                className="mt-1 block w-full rounded-xl border p-2"
              />
            </label>
          </div>
          <div className="mt-5">
            <h3 className="font-semibold">Aperçu des débuts de créneaux</h3>
            <p className="mt-2 text-sm text-black/60">
              {previewSlots.length
                ? previewSlots.join(" · ")
                : "Aucun créneau avec cette configuration."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => save({ isPublished: !selected.isPublished })}
            className={`mt-5 rounded-xl px-5 py-3 text-white ${selected.isPublished ? "bg-red-800" : "bg-green-800"}`}
          >
            {selected.isPublished ? "Dépublier" : "Publier"}
          </button>
        </section>
      )}
    </div>
  );
}

function TimeField({
  label,
  value,
  optional = false,
  onCommit,
}: {
  label: string;
  value: string;
  optional?: boolean;
  onCommit: (value: number | null) => void;
}) {
  return (
    <label>
      {label}
      <input
        type="time"
        defaultValue={value}
        required={!optional}
        onBlur={(e) => onCommit(toMinutes(e.target.value))}
        className="mt-1 block w-full rounded-xl border p-2"
      />
    </label>
  );
}
