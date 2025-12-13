import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, Trash2, Ban, Edit, Users } from 'lucide-react';
import { adminEventService } from '../../../services/adminEventService';
import { type Event } from '../../../types/event';
import Loader from '../../../components/Loader';

const EventListPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await adminEventService.getAllEvents();
      setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this event? This cannot be undone.')) return;
    try {
      await adminEventService.deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (e) {
      alert('Failed to delete');
    }
  };

  const handleCancel = async (id: number) => {
    if (!window.confirm('Cancel this event?')) return;
    try {
      await adminEventService.cancelEvent(id);
      fetchEvents(); // Refresh to see status change
    } catch (e) {
      alert('Failed to cancel');
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white font-serif">Events</h1>
          <p className="text-gray-400">Manage upcoming tournaments and events</p>
        </div>
        <Link
          to="/admin/events/create"
          className="flex items-center gap-2 bg-gold hover:bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold"
        >
          <Plus size={20} /> New Event
        </Link>
      </div>

      <div className="bg-tvk-dark-card rounded-lg border border-white/10 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-gray-400 text-sm uppercase">
            <tr>
              <th className="p-4">Event</th>
              <th className="p-4">Date</th>
              <th className="p-4 text-center">Reward</th>
              <th className="p-4 text-center">Participants</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {events.map((event) => (
              <tr key={event.id} className="hover:bg-white/5">
                <td className="p-4">
                  <div className="font-bold text-white">{event.title}</div>
                  <div className="text-xs text-gray-500 truncate max-w-[200px]">
                    {event.description}
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-300">
                  <div>Start: {new Date(event.start_date).toLocaleDateString()}</div>
                  <div className="text-gray-500">
                    End: {new Date(event.end_date).toLocaleDateString()}
                  </div>
                </td>
                <td className="p-4 text-center text-gold font-bold">{event.reward_points} pts</td>
                <td className="p-4 text-center text-gray-400">
                  <div className="flex items-center justify-center gap-1">
                    <Users size={16} /> {event.participations_count || 0}
                  </div>
                </td>
                <td className="p-4 text-center">
                  {event.is_cancelled ? (
                    <span className="text-red-400 text-xs font-bold border border-red-400/30 px-2 py-1 rounded">
                      CANCELLED
                    </span>
                  ) : (
                    <span className="text-green-400 text-xs font-bold border border-green-400/30 px-2 py-1 rounded">
                      ACTIVE
                    </span>
                  )}
                </td>
                <td className="p-4 text-center flex justify-center gap-2">
                  <Link
                    to={`/admin/events/edit/${event.id}`}
                    state={{ event }}
                    className="p-2 text-blue-400 hover:bg-blue-400/10 rounded"
                  >
                    <Edit size={18} />
                  </Link>
                  {!event.is_cancelled && (
                    <button
                      onClick={() => handleCancel(event.id)}
                      className="p-2 text-orange-400 hover:bg-orange-400/10 rounded"
                      title="Cancel Event"
                    >
                      <Ban size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="p-2 text-red-400 hover:bg-red-400/10 rounded"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default EventListPage;
