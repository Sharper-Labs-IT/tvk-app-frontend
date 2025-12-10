import React, { useMemo, useState } from "react";
import EventCard from "../components/events/EventCard";
import type { EventCardData } from "../components/events/EventCard";
import Header from "../components/Header";
import Footer from "../components/Footer";

const FILTERS = ["All", "Upcoming", "Live", "Fan Meetup", "Online"] as const;
type FilterValue = (typeof FILTERS)[number];

// ---------- MOCK DATA ONLY (UI DEMO) ----------
const featuredEvent: EventCardData = {
  id: 1,
  title: "The Gilded Age Premiere Gala",
  description:
    "Step into an evening of elegance inspired by the golden age. Live music, curated cocktails, and exclusive screenings.",
  imageUrl:
    "https://images.pexels.com/photos/799091/pexels-photo-799091.jpeg?auto=compress&cs=tinysrgb&w=1200",
  dateTime: "Friday, February 28, 2026 · 8:30 PM PST",
  venue: "The Velvet Room, Los Angeles",
  tag: "Live",
};

const MOCK_EVENTS: EventCardData[] = [
  {
    id: 2,
    title: "Next-Gen Audio Experience Workshop",
    description:
      "Exclusive hands-on class on cinematic sound design for highly engaged members.",
    imageUrl:
      "https://images.pexels.com/photos/6898859/pexels-photo-6898859.jpeg?auto=compress&cs=tinysrgb&w=1200",
    dateTime: "Saturday, March 15, 2026 · 7:00 PM PST",
    venue: "Digital Studio, Online",
    tag: "Online",
  },
  {
    id: 3,
    title: "Global Fan Meetup: Unity in London",
    description:
      "A rare closed-door session with fellow global members in an intimate rooftop setting.",
    imageUrl:
      "https://images.pexels.com/photos/34075/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1200",
    dateTime: "Sunday, April 6, 2026 · 7:00 PM GMT",
    venue: "The Shard Skyline Garden, London",
    tag: "Fan Meetup",
  },
  {
    id: 4,
    title: "Behind the Scenes: Script Reading Live",
    description:
      "Watch a live table read of a newly written episode with the full cast.",
    imageUrl:
      "https://images.pexels.com/photos/1647177/pexels-photo-1647177.jpeg?auto=compress&cs=tinysrgb&w=1200",
    dateTime: "Friday, May 2, 2026 · 8:00 PM PST",
    venue: "NBC Paramount Studios, Stage 7",
    tag: "Live",
  },
  {
    id: 5,
    title: "Exclusive Member Cocktail Event",
    description:
      "An opportunity to socialise and network with inner TVK members.",
    imageUrl:
      "https://images.pexels.com/photos/3396967/pexels-photo-3396967.jpeg?auto=compress&cs=tinysrgb&w=1200",
    dateTime: "Saturday, June 14, 2026 · 6:00 PM PST",
    venue: "Eclipse Lounge, Boston",
    tag: "Meetup",
  },
];

// ---------- Dynamic Section Title ----------
const getSectionTitle = (filter: FilterValue) => {
  switch (filter) {
    case "All":
      return "All Events";
    case "Upcoming":
      return "Upcoming Events";
    case "Live":
      return "Live Events";
    case "Fan Meetup":
      return "Fan Meetups";
    case "Online":
      return "Online Events";
    default:
      return "Events";
  }
};

const EventPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterValue>("All");

  const filteredEvents = useMemo(() => {
    if (activeFilter === "All") return MOCK_EVENTS;

    if (activeFilter === "Fan Meetup") {
      return MOCK_EVENTS.filter(
        (e) => e.tag === "Fan Meetup" || e.tag === "Meetup"
      );
    }
    if (activeFilter === "Online") {
      return MOCK_EVENTS.filter((e) => e.tag === "Online");
    }
    if (activeFilter === "Live") {
      return MOCK_EVENTS.filter((e) => e.tag === "Live");
    }
    if (activeFilter === "Upcoming") {
      return MOCK_EVENTS;
    }

    return MOCK_EVENTS;
  }, [activeFilter]);

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <Header />

      <main className="bg-gradient-to-b from-[#020617] via-[#020617] to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-6 md:pt-10 pb-12 md:pb-20">
          {/* ---------- HERO SECTION ---------- */}
          <section className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start lg:items-center mb-10 md:mb-12">
            <div className="flex-1 space-y-4 md:space-y-5">
              <p className="text-[10px] md:text-xs uppercase tracking-[0.28em] text-yellow-400/80">
                TVK Members
              </p>
              <h1 className="text-[2rem] sm:text-[2.4rem] lg:text-[3rem] xl:text-[3.25rem] font-bold leading-tight">
                Events &amp; Live <br className="hidden sm:block" />
                <span className="sm:ml-1">Experiences</span>
              </h1>
              <p className="text-neutral-300 max-w-lg text-sm md:text-[15px]">
                Join exclusive fan events, live experiences, and community
                meetups reserved only for TVK Members.
              </p>

              <div className="flex flex-wrap gap-3">
                <button className="px-5 py-2.5 rounded-full bg-[#ffbf2b] text-black text-xs md:text-sm font-semibold hover:bg-[#ffd65b] transition">
                  Next Upcoming Event
                </button>
                <button className="px-5 py-2.5 rounded-full border border-yellow-500/40 text-xs md:text-sm font-semibold hover:bg-yellow-500/10 transition">
                  View All Events
                </button>
              </div>
            </div>

            {/* hero image */}
            <div className="flex-1 max-w-md w-full self-stretch">
              <div className="relative rounded-3xl overflow-hidden border border-yellow-500/20 bg-gradient-to-br from-yellow-900/30 via-amber-500/10 to-slate-900/60 aspect-[4/3] shadow-[0_18px_60px_rgba(15,23,42,0.9)]">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] sm:text-xs text-neutral-300 uppercase tracking-[0.28em]">
                    Hero Banner / Artist Image
                  </span>
                </div>
              </div>
            </div>
          </section>

          <div className="hidden md:block h-px w-full bg-gradient-to-r from-transparent via-slate-700/60 to-transparent mb-8" />

          {/* ---------- FILTERS ---------- */}
          <section className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="w-full md:w-auto">
              <div className="flex md:inline-flex gap-2 sm:gap-3 overflow-x-auto scrollbar-none bg-slate-900/70 px-2 sm:px-3 py-2.5 rounded-full border border-slate-700/80">
                {FILTERS.map((filter) => {
                  const isActive = activeFilter === filter;
                  return (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={[
                        "whitespace-nowrap px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold transition",
                        isActive
                          ? "bg-[#ffbf2b] text-black shadow-[0_0_20px_rgba(255,191,43,0.5)]"
                          : "bg-slate-800/80 text-neutral-300 hover:bg-slate-700",
                      ].join(" ")}
                    >
                      {filter}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="hidden md:block text-right">
              <p className="text-[11px] uppercase tracking-[0.22em] text-yellow-400/80">
                Curated Experiences
              </p>
              <p className="text-xs text-neutral-400">
                Browse by type or discover everything at once.
              </p>
            </div>
          </section>

          {/* ---------- FEATURED BLOCK ---------- */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[11px] md:text-xs uppercase tracking-[0.22em] text-yellow-400/80">
                  Featured Experience
                </p>
                <p className="text-xs text-neutral-400">
                  Don&apos;t miss our most exclusive event.
                </p>
              </div>
            </div>

            <div className="grid lg:grid-cols-[1.6fr,1.1fr] gap-6 rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-slate-700/70 overflow-hidden shadow-[0_28px_70px_rgba(15,23,42,0.9)]">
              <div className="relative min-h-[220px]">
                <img
                  src={featuredEvent.imageUrl}
                  alt={featuredEvent.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffbf2b] text-black text-[11px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                    Featured
                  </span>
                </div>
              </div>

              <div className="px-5 sm:px-6 py-5 sm:py-6 flex flex-col justify-between">
                <div className="space-y-3">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">
                    {featuredEvent.title}
                  </h2>
                  <p className="text-[11px] sm:text-xs text-yellow-400 font-medium">
                    Limited seats available — Registration required
                  </p>

                  <div className="space-y-3 text-[11px] sm:text-xs text-neutral-300">
                    <div>
                      <span className="text-neutral-400 block mb-0.5">
                        Date & Time
                      </span>
                      {featuredEvent.dateTime}
                    </div>
                    <div>
                      <span className="text-neutral-400 block mb-0.5">
                        Venue
                      </span>
                      {featuredEvent.venue}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                  <p className="text-[11px] sm:text-xs text-neutral-400 sm:max-w-xs">
                    {featuredEvent.description}
                  </p>
                  <button className="px-4 py-2.5 rounded-full bg-[#ffbf2b] text-black text-[11px] sm:text-xs font-semibold hover:bg-[#ffd65b]">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ---------- EVENTS GRID ---------- */}
          <section className="mb-14 md:mb-16">
            <div className="flex items-center justify-between mb-4">
              <div>
                {/* 🔥 Dynamic title here */}
                <h3 className="text-base md:text-lg font-semibold">
                  {getSectionTitle(activeFilter)}
                </h3>

                <p className="text-[11px] sm:text-xs text-neutral-400">
                  Explore our curated selection of exclusive experiences.
                </p>
              </div>
            </div>

            {filteredEvents.length === 0 ? (
              <p className="text-sm text-neutral-400 mt-4">
                No events available under this filter.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
                {filteredEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </section>

          {/* ---------- CTA ---------- */}
          <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-700/70 px-6 md:px-8 py-8 md:py-10 text-center shadow-[0_22px_60px_rgba(15,23,42,0.9)]">
            <p className="text-sm md:text-base font-semibold mb-2">
              Ready to Join?
            </p>
            <p className="text-[11px] sm:text-xs text-neutral-300 mb-5 max-w-xl mx-auto">
              Become a TVK Member and unlock access to exclusive events, live
              experiences, and our premium community.
            </p>
            <button className="px-6 md:px-7 py-2.5 md:py-3 rounded-full bg-[#ffbf2b] text-black text-xs md:text-sm font-semibold hover:bg-[#ffd65b]">
              Learn More About Membership
            </button>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EventPage;