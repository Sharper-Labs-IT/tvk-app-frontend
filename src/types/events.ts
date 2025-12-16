import axiosClient from '../api/axiosClient'
import type {EventCardData} from '../components/events/EventCard';

//backend api types

export interface ApiEvent{
    id: number;
    title: string;
    description: string | null;
    rules: string | null;
    start_date: string;
    end_date: string;
    reward_points: number | null;
    created_by:number | null;
    venue_name: string | null;
    event_type: string | null;  //eg: Online, Live, Meetup etc
    is_Featured: boolean;
    is_cancelled: boolean;
    media: {
        type: string;
        path: string;
        url?: string;
    }[] | null;
    participations_count?: number;
    created_at: string;
    updated_at: string;
}

export interface PaginatedEventsResponse {
    current_page: number;
    data: ApiEvent[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: number;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number; 
}

//helper: map backend event -> eventcard data
function formatDateRange(startIso: string, endIso: string): string {
    try{
        const start = new Date(startIso);
        const end = new Date(endIso);


        const startDate = start.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric"
        });

        const startTime = start.toLocaleTimeString("en-Us", {
            hour: "numeric",
            minute: "2-digit"
        });

        const endTime = end.toLocaleTimeString("en-Us", {
            hour: "numeric",
            minute: "2-digit"
        });

        return `${startDate}. ${startTime} - ${endTime}`;
    } catch{
        return "";
    }
}

function mapEventTypeToTag(event_type: string | null): EventCardData["tag"]{
    if (!event_type) return "Other";

    const type = event_type.toLowerCase();

    if (type.includes("online")) return "Online";
    if (type.includes("live")) return "Live";
    if (type.includes("fan")) return "Fan Meetup";
    if (type.includes("meetup")) return "Meetup";

    return "Other";
}

export function mapApiEventToCard(e: ApiEvent): EventCardData {
  const imageUrl =
    e.media && e.media.length > 0 && e.media[0].url
      ? e.media[0].url
      : "";

  return {
    id: e.id,
    title: e.title,
    description: e.description || "",
    imageUrl,
    dateTime: formatDateRange(e.start_date, e.end_date),
    venue: e.venue_name || "",
    tag: mapEventTypeToTag(e.event_type),
    rules: e.rules || "", // This is what you need!
    rewardPoints: e.reward_points || 0,
    isCancelled: e.is_cancelled,
  };
}


//Participation types
export interface MyParticipation{
  id: number;
  event_id: number;
  status: "pending" | "approved" | "rejected";
}

export interface MyEventsResponse{
  user_id: number;
  events: MyParticipation[];
}

// --- API calls ---

export async function fetchEvents(page = 1) {
  const res = await axiosClient.get<PaginatedEventsResponse>(`/events?page=${page}`);
  return res.data;
}

export async function fetchFeaturedEvents() {
  // Uses EventController@featured
  const res = await axiosClient.get<ApiEvent[]>("/events/featured");
  return res.data;
}


export async function fetchEventById(id: number){
    const res = await axiosClient.get<ApiEvent>(`/events/${id}`);
    return res.data;
}


//Participate in event
export async function participateInEvent(eventId: number, submission: string) {
  const res = await axiosClient.post(`/events/${eventId}/participate`, {
    submission,
  });

  return res.data;
}

//get auth users login participation status
export async function fetchMyEventParticipations(){
  const res = await axiosClient.get<MyEventsResponse>(`/events/my`);
  return res.data;
}