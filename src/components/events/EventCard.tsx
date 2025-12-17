// src/components/events/EventCard.tsx
import React from "react";
import {Link} from 'react-router-dom';

export interface EventCardData {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  dateTime: string;
  startDate: string;
  venue: string;
  tag: "Online" | "Live" | "Fan Meetup" | "Meetup" | "Other";
  rules?: string;
  rewardPoints?: number;
  isCancelled?: boolean;
}

interface EventCardProps {
  event: EventCardData;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  return (
    <article
      className="
        group h-full bg-slate-900/80 backdrop-blur-xl border border-slate-700/70 rounded-3xl overflow-hidden
        flex flex-col hover:border-yellow-500/70 hover:shadow-[0_0_32px_rgba(255,191,43,0.18)]
        transition
      "
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900" />
        )}

        {/* Tag pill */}
        <div className="absolute top-3 left-3">
          <span
            className="
              inline-flex items-center gap-2 px-3 py-1 rounded-full
              bg-slate-900/85 text-[11px] text-yellow-300 border border-yellow-500/40
            "
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {event.tag}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex flex-col gap-3 flex-1">
        <h4 className="text-sm font-semibold line-clamp-2">{event.title}</h4>

        <div className="space-y-1 text-[11px] sm:text-xs text-neutral-300">
          <p>{event.dateTime}</p>
          <p className="text-neutral-400">{event.venue}</p>
        </div>

        <p className="text-[11px] sm:text-xs text-neutral-400 line-clamp-3">
          {event.description}
        </p>

        <div className="mt-auto pt-2">
          <Link
            to={`/events/${event.id}`}
            state={{ event }}
            className="
              w-full inline-flex items-center justify-center px-4 py-2 rounded-full bg-slate-800
              text-[11px] sm:text-xs font-semibold hover:bg-[#ffbf2b] hover:text-black transition
            "
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
};

export default EventCard;
