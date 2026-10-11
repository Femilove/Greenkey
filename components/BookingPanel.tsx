"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { CITIES, citySlug } from "@/types/property";

function Counter({
  label,
  value,
  onChange,
  max,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
  max: number;
}) {
  return (
    <div className="counter-row">
      <span>{label}</span>
      <div className="counter-control">
        <button
          type="button"
          className="counter-button"
          aria-label={`Decrease ${label.toLowerCase()}`}
          disabled={value <= 1}
          onClick={() => onChange(Math.max(1, value - 1))}
        >
          −
        </button>
        <output aria-live="polite">{value}</output>
        <button
          type="button"
          className="counter-button"
          aria-label={`Increase ${label.toLowerCase()}`}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
        >
          +
        </button>
      </div>
    </div>
  );
}

interface Initial {
  location?: string;
  checkIn?: string;
  checkOut?: string;
  people?: number;
  rooms?: number;
}

const nextDay = (iso: string) =>
  new Date(Date.parse(iso) + 86_400_000).toISOString().slice(0, 10);

export default function BookingPanel({ initial = {} }: { initial?: Initial }) {
  const router = useRouter();
  const [location, setLocation] = useState(initial.location ?? "all");
  const [checkIn, setCheckIn] = useState(initial.checkIn ?? "");
  const [checkOut, setCheckOut] = useState(initial.checkOut ?? "");
  const [people, setPeople] = useState(initial.people ?? 1);
  const [rooms, setRooms] = useState(initial.rooms ?? 1);
  const [error, setError] = useState("");
  const [today, setToday] = useState(""); // set after mount to avoid a server/client date mismatch

  useEffect(() => {
    setToday(
      new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10),
    );
  }, []);

  const handleCheckIn = (value: string) => {
    setCheckIn(value);
    if (checkOut && checkOut <= value) setCheckOut("");
    setError("");
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!checkIn !== !checkOut)
      return setError("Choose both a check-in and a check-out date.");
    if (checkIn && checkOut <= checkIn)
      return setError("Check-out must be after check-in.");
    setError("");
    const params = new URLSearchParams({
      location,
      people: String(people),
      rooms: String(rooms),
    });
    if (checkIn) params.set("check-in", checkIn);
    if (checkOut) params.set("check-out", checkOut);
    router.push(`/homes?${params.toString()}`);
  };

  return (
    <form className="booking-panel" onSubmit={handleSubmit}>
      <label className="booking-section location-section">
        <svg className="booking-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 21s7-6.08 7-12a7 7 0 1 0-14 0c0 5.92 7 12 7 12Zm0-9.25A2.75 2.75 0 1 1 12 6.25a2.75 2.75 0 0 1 0 5.5Z" />
        </svg>
        <span className="field-content">
          <span className="field-label">Location</span>
          <select
            name="location"
            aria-label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="all">All locations</option>
            {CITIES.map((city) => (
              <option key={city} value={citySlug(city)}>
                {city}
              </option>
            ))}
          </select>
        </span>
      </label>

      <div className="booking-section date-section">
        <svg className="booking-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 2v3M17 2v3M4.5 9h15M5 4.5h14a1.5 1.5 0 0 1 1.5 1.5v13A1.5 1.5 0 0 1 19 20.5H5A1.5 1.5 0 0 1 3.5 19V6A1.5 1.5 0 0 1 5 4.5Z" />
        </svg>
        <div className="field-content">
          <span className="field-label">Check in - Check out</span>
          <div className="date-inputs">
            <input
              name="check-in"
              type="date"
              aria-label="Check-in date"
              min={today || undefined}
              required={!!checkOut}
              value={checkIn}
              onChange={(e) => handleCheckIn(e.target.value)}
            />
            <span aria-hidden="true">–</span>
            <input
              name="check-out"
              type="date"
              aria-label="Check-out date"
              min={checkIn ? nextDay(checkIn) : today || undefined}
              required={!!checkIn}
              value={checkOut}
              onChange={(e) => {
                setCheckOut(e.target.value);
                setError("");
              }}
            />
          </div>
        </div>
      </div>

      <div className="booking-section guests-section">
        <svg className="booking-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 12a4.25 4.25 0 1 0 0-8.5 4.25 4.25 0 0 0 0 8.5Zm-8 8.5c0-4.05 3.58-6.5 8-6.5s8 2.45 8 6.5h-16Z" />
        </svg>
        <div className="field-content">
          <span className="field-label">Guests and rooms</span>
          <Counter
            label="People"
            value={people}
            max={20}
            onChange={setPeople}
          />
          <Counter label="Rooms" value={rooms} max={10} onChange={setRooms} />
        </div>
      </div>

      <button className="search-button" type="submit">
        Search
      </button>
      {error && (
        <p className="booking-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
