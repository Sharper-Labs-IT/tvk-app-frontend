import React, { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import type { EventCardData } from '../components/events/EventCard';
import { fetchEventById, mapApiEventToCard } from '../types/events';

interface LocationState {
  event?: EventCardData;
}

const EventDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const initialEventFormState = state?.event ?? null;
  //const event = state?.event;

  const [event, setEvent] = useState<EventCardData | null>(initialEventFormState);
  const [loading, setLoading] = useState<boolean>(!initialEventFormState);
  const [error, setError] = useState<string | null>(null);

  //parse Id safely
  const numericId = id ? Number(id) : NaN;

  useEffect(() => {
    if (!numericId || Number.isNaN(numericId)) {
      setError('Invalid event ID.');
      setLoading(false);
      return;
    }

    if (event) return;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiEvent = await fetchEventById(numericId);
        const mapped = mapApiEventToCard(apiEvent);
        setEvent(mapped);
      } catch (err) {
        console.error('Failed to load event details', err);
        setError('Unable to load this event. Please try again later');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [numericId, event]);

  // For now we rely on router state. Later you will fetch from API using `id`.
  if (loading && !event) {
    return (
      <div className="min-h-screen bg-[#020617] text-white">
        <Header />
        <main className="bg-gradient-to-b from-[#1a1407] via-[#0d0b05] to-black">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 pt-10 pb-16">
            <Link
              to="/events"
              className="inline-flex items-center text-xs font-semibold text-neutral-300 hover:text-white mb-6"
            >
              ← Back to Events
            </Link>
            <div className="rounded-2xl bg-slate-900/80 border border-slate-700/70 px-6 py-10 text-center">
              <p className="text-sm text-neutral-300 mb-2">Loading event...</p>
              <p className="text-xs text-neutral-500">Please wait loading event details.</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="min-h-screen bg-[#020617] text-white">
        <Header />
        <main className="bg-gradient-to-b from-[#1a1407] via-[#0d0b05] to-black">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 pt-10 pb-16">
            <Link
              to="/events"
              className="inline-flex items-center text-xs font-semibold text-neutral-300 hover:text-white mb-6"
            >
              ← Back to Events
            </Link>
            <div className="rounded-2xl bg-slate-900/80 border border-slate-700/70 px-6 py-10 text-center">
              <p className="text-sm text-neutral-300 mb-2">Event could not be loaded.</p>
              <p className="text-xs text-neutral-500 mb-2">{error}</p>
              <p className="text-xs text-neutral-500">
                Try opening this page from the Events listing again, or check your connection.
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!event) {
    // Extremely unlikely, but just in case
    return (
      <div className="min-h-screen bg-[#020617] text-white">
        <Header />
        <main className="bg-gradient-to-b from-[#1a1407] via-[#0d0b05] to-black">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 pt-10 pb-16">
            <Link
              to="/events"
              className="inline-flex items-center text-xs font-semibold text-neutral-300 hover:text-white mb-6"
            >
              ← Back to Events
            </Link>
            <div className="rounded-2xl bg-slate-900/80 border border-slate-700/70 px-6 py-10 text-center">
              <p className="text-sm text-neutral-300 mb-2">Event not found.</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <Header />

      <main className="bg-gradient-to-b from-[#1a1407] via-[#0d0b05] to-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 pt-8 md:pt-10 pb-14 md:pb-20 space-y-8">
          {/* Back link */}
          <div className="flex items-center justify-between gap-4">
            <Link
              to="/events"
              className="inline-flex items-center text-[11px] sm:text-xs font-semibold text-neutral-300 hover:text-white"
            >
              ← Back to Events
            </Link>
            <span className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/70 text-[10px] uppercase tracking-[0.2em] text-neutral-300">
              Event Details
            </span>
          </div>

          {/* Hero card */}
          <section className="rounded-3xl overflow-hidden border border-slate-800/80 bg-slate-950/90 shadow-[0_32px_80px_rgba(15,23,42,0.95)] flex flex-col lg:flex-row">
            {/* Left: poster */}
            <div className="relative w-full lg:w-1/2 min-h-[220px]">
              <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffbf2b] text-black text-[11px] font-semibold shadow-[0_10px_25px_rgba(15,23,42,0.8)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {event.tag || 'Featured'}
                </span>
              </div>
            </div>

            {/* Right: main info */}
            <div className="w-full lg:w-1/2 px-6 md:px-8 py-6 md:py-7 flex">
              <div className="w-full flex flex-col gap-3 max-w-md">
                {/* Title */}
                <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold leading-snug">
                  {event.title}
                </h1>

                {/* Highlight line */}
                <p className="text-[11px] sm:text-xs text-yellow-400 font-semibold">
                  Limited seats available{' '}
                  <span className="text-yellow-300/90">— Registration required</span>
                </p>

                {/* Date */}
                <div className="flex flex-col gap-1 text-[11px] sm:text-xs text-neutral-300 mt-1">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-400">
                    Date &amp; Time
                  </span>
                  <span>{event.dateTime}</span>
                </div>

                {/* Venue */}
                <div className="flex flex-col gap-1 text-[11px] sm:text-xs text-neutral-300">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-400">
                    Venue
                  </span>
                  <span>{event.venue}</span>
                </div>

                {/* Primary CTA */}
                <button className="mt-3 w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#ffbf2b] text-black text-[11px] sm:text-xs font-semibold hover:bg-[#ffd65b] transition">
                  Participate
                </button>
              </div>
            </div>
          </section>

          {/* Main content sections */}
          <section className="grid lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)] gap-6">
            {/* Description */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-700/70 p-5 sm:p-6 space-y-3">
              <h2 className="text-sm sm:text-base font-semibold">About this experience</h2>
              <p className="text-[11px] sm:text-xs text-neutral-300 leading-relaxed">
                {event.description}
              </p>
              <p className="text-[11px] sm:text-xs text-neutral-400 leading-relaxed">
                This is a sample details page. Later, this section can include a richer long
                description from the backend (what to expect, schedule, dress code, who will appear,
                etc.).
              </p>
            </div>

            {/* Rules / info panel */}
            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-900/80 border border-slate-700/70 p-5 sm:p-6 space-y-3">
                <h3 className="text-sm font-semibold">Event Rules &amp; Info</h3>
                <ul className="space-y-2 text-[11px] sm:text-xs text-neutral-300 list-disc list-inside">
                  <li>Admission is for active TVK Members only.</li>
                  <li>Please arrive at least 20 minutes before start time.</li>
                  <li>Photography and recording may be restricted during certain segments.</li>
                  <li>
                    Further details (tickets, QR codes, etc.) will be emailed after registration.
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl bg-slate-900/60 border border-yellow-500/30 p-5 sm:p-6 space-y-2">
                <h4 className="text-sm font-semibold text-yellow-300">Members-only benefit</h4>
                <p className="text-[11px] sm:text-xs text-neutral-200">
                  Attending this event may reward you with TVK membership points and early access to
                  future experiences. Exact points and perks can be wired from the backend later.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EventDetailsPage;
