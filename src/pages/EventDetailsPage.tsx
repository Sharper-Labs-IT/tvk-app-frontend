import React, { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {useNavigate} from 'react-router-dom';
import {useAuth} from  "../context/AuthContext";
import Header from '../components/Header';
import Footer from '../components/Footer';
import type { EventCardData } from '../components/events/EventCard';
import { fetchEventById, mapApiEventToCard, participateInEvent, fetchMyEventParticipations } from '../types/events';

interface LocationState {
  event?: EventCardData;
}

const EventDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const initialEventFormState = state?.event ?? null;

  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [event, setEvent] = useState<EventCardData | null>(initialEventFormState);
  const [loading, setLoading] = useState<boolean>(!initialEventFormState);
  const [error, setError] = useState<string | null>(null);

  const [participating, setParticipating] = useState<boolean>(false);
  const [participationError, setParticipationError] = useState<string | null>(null);

  type ParticipationStatus = "pending" | "approved" | "rejected" | null;

  const [participationStatus, setParticipationStatus] = useState<ParticipationStatus>(null);
  

  const handleParticipate = async () => {

    if(!isLoggedIn){
      navigate("/login");
      return;
    }

    if (!event) return;
    setParticipating(true);
    setParticipationError(null);
    try {
      const submissionText = "My entry for event";
      const data = await participateInEvent(event.id, submissionText);
      console.log("Participation response:", data);
      if(data?.participation?.status){
        setParticipationStatus(data.participation.status);
      }
    } catch (err: any) {
      console.error("Participation error:", err.response || err);
      const message =
        err.response?.data?.message ||
        err.response?.statusText ||
        "Failed to participate. Please try again.";
      setParticipationError(message);
    } finally {
      setParticipating(false);
    }
  };

  const numericId = id ? Number(id) : NaN;


  //participant status load 

  useEffect(() => {
    if(!isLoggedIn || !event) return;

    const loadParticipationStatus = async () => {
      try {
        const data = await fetchMyEventParticipations();

        const participation = data.events.find((p) => p.event_id === event.id);

        if(participation?.status){
          setParticipationStatus(participation.status);
        }
      } catch(error){
        console.log("No participation found or not loggedIn")
      }
    };
    loadParticipationStatus();
  }, [event, isLoggedIn]);

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
            <div className="rounded-2xl bg-slate-900/80 border border-slate-700/70 px-4 sm:px-6 py-6 sm:py-10 text-center">
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
            <div className="rounded-2xl bg-slate-900/80 border border-slate-700/70 px-4 sm:px-6 py-6 sm:py-10 text-center">
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
            <div className="rounded-2xl bg-slate-900/80 border border-slate-700/70 px-4 sm:px-6 py-6 sm:py-10 text-center">
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
            <Link
              to="/events"
              className="inline-flex items-center text-[11px] sm:text-xs font-semibold text-neutral-300 hover:text-white"
            >
              ← Back to Events
            </Link>
            <span className="inline-flex sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/70 text-[10px] uppercase tracking-[0.2em] text-neutral-300">
              Event Details
            </span>
          </div>

          {/* Hero card */}
          <section className="rounded-3xl overflow-hidden border border-slate-800/80 bg-slate-950/90 shadow-[0_32px_80px_rgba(15,23,42,0.95)] flex flex-col lg:flex-row">
            {/* Left: poster */}
            <div className="relative w-full lg:w-1/2 min-h-[220px]">
              <img src={event.imageUrl} alt={event.title} className="w-full h-full object-contain p-4" />
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffbf2b] text-black text-[11px] font-semibold shadow-[0_10px_25px_rgba(15,23,42,0.8)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {event.tag || 'Featured'}
                </span>
              </div>
            </div>

            {/* Right: main info */}
            <div className="w-full lg:w-1/2 px-4 sm:px-6 md:px-8 py-6 md:py-7 flex flex-col justify-between">
              <div className="space-y-3">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold leading-snug">
                  {event.title}
                </h1>
                <p className="text-[11px] sm:text-xs text-yellow-400 font-semibold">
                  Limited seats available{' '}
                  <span className="text-yellow-300/90">— Registration required</span>
                </p>

                <div className="flex flex-col gap-1 text-[11px] sm:text-xs text-neutral-300 mt-1">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-400">
                    Date &amp; Time
                  </span>
                  <span>{event.dateTime}</span>
                </div>

                <div className="flex flex-col gap-1 text-[11px] sm:text-xs text-neutral-300">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-400">
                    Venue
                  </span>
                  <span>{event.venue}</span>
                </div>
              </div>

              {/* Button section - pushed to bottom and centered */}
              <div className="mt-6 flex flex-col items-center">
                <button
                  className={`w-full max-w-xs px-6 py-2.5 rounded-full ${
                    participationStatus === "pending"
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-[#ffbf2b] hover:bg-[#ffd65b]"
                  } text-black text-[11px] sm:text-xs font-semibold transition`}
                  onClick={handleParticipate}
                  disabled={participating || participationStatus === "pending"}
                >
                  {participating
                    ? "Submitting..."
                    : participationStatus === "pending"
                    ? "Registered"
                    : "Participate"}
                </button>
                {participationError && (
                  <p className="text-red-400 text-[11px] mt-2 text-center">{participationError}</p>
                )}
              </div>
            </div>
          </section>

          {/* Main content sections */}
          <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)] gap-6">
            {/* Description */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-700/70 p-4 sm:p-6 space-y-3">
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
  <div className="rounded-2xl bg-slate-900/80 border border-slate-700/70 p-4 sm:p-6 space-y-3">
    <h3 className="text-sm font-semibold">Event Rules &amp; Info</h3>
    
    {/* REPLACE THIS ENTIRE <ul> SECTION */}
    {event.rules ? (
      <div className="text-[11px] sm:text-xs text-neutral-300 space-y-2">
        {/* Check if rules are HTML or plain text */}
        {event.rules.includes('<') ? (
          <div 
            dangerouslySetInnerHTML={{ __html: event.rules }}
            className="prose prose-invert prose-sm max-w-none"
          />
        ) : (
          // Split by newlines for plain text
          event.rules.split('\n').filter(line => line.trim()).map((rule: string, index: number) => (
            <div key={index} className="flex items-start gap-2">
              <span className="mt-0.5">•</span>
              <span>{rule.trim()}</span>
            </div>
          ))
        )}
      </div>
    ) : (
      // Fallback if no rules in API
      <ul className="space-y-2 text-[11px] sm:text-xs text-neutral-300 list-disc list-inside">
        <li>Admission is for active TVK Members only.</li>
        <li>Please arrive at least 20 minutes before start time.</li>
        <li>Photography and recording may be restricted during certain segments.</li>
        <li>Further details (tickets, QR codes, etc.) will be emailed after registration.</li>
      </ul>
    )}
  </div>

  {/* Update the benefits section to use rewardPoints */}
  <div className="rounded-2xl bg-slate-900/60 border border-yellow-500/30 p-4 sm:p-6 space-y-2">
    <h4 className="text-sm font-semibold text-yellow-300">Members-only benefit</h4>
    <p className="text-[11px] sm:text-xs text-neutral-200">
      {event.rewardPoints ? (
        `Attending this event will reward you with ${event.rewardPoints} TVK membership points.`
      ) : (
        'Attending this event may reward you with TVK membership points and early access to future experiences.'
      )}
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