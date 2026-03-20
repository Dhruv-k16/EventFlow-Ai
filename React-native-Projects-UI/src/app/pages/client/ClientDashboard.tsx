import React from 'react';
import { Link } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'motion/react';
import { KPICard } from '../../components/shared/KPICard';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Calendar, CheckCircle2, Clock, Plus } from 'lucide-react';

export const ClientDashboard: React.FC = () => {
  const { user } = useAuth();

  const events = [
    { id: '1', name: 'Sharma Wedding', date: 'Mar 25, 2026', location: 'Mumbai', guests: 500, status: 'CONFIRMED' as const },
    { id: '2', name: 'Birthday Party', date: 'Mar 18, 2026', location: 'Goa', guests: 80, status: 'CONFIRMED' as const },
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-extrabold text-[#49225B] mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          Good to see you, {user?.firstName} 👋
        </h1>
        <p className="text-gray-500">Here's your event overview</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard label="My Events" value={events.length} subLabel="Total events" icon={Calendar} accentColor="purple" />
        <KPICard label="Active Bookings" value={15} subLabel="Confirmed vendors" icon={CheckCircle2} accentColor="green" />
        <KPICard label="Upcoming Events" value={1} subLabel="Next 30 days" icon={Clock} accentColor="amber" />
        <KPICard label="Past Events" value={3} subLabel="Completed" icon={Calendar} accentColor="blue" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans' }}>My Events</h2>
          <div className="flex items-center gap-3">
            <Link 
              to="/client/create-event" 
              className="flex items-center gap-2 px-4 py-2 gradient-purple-primary text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              <Plus size={20} />
              <span>Create New Event</span>
            </Link>
            <Link to="/client/events" className="text-sm font-semibold text-[#6E3482] hover:text-[#49225B]">View all →</Link>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
            >
              <div className="h-36 gradient-purple-accent" />
              <div className="p-5 space-y-3">
                <div>
                  <h3 className="font-bold text-lg" style={{ fontFamily: 'Plus Jakarta Sans' }}>{event.name}</h3>
                  <StatusBadge status={event.status} />
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>📅 {event.date}</p>
                  <p>📍 {event.location}</p>
                  <p>👥 {event.guests} guests</p>
                </div>
                <div className="flex gap-2 pt-2">
                  <Link to={`/risk/${event.id}`} className="flex-1 text-center px-3 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                    Risk →
                  </Link>
                  <Link to={`/events/${event.id}`} className="flex-1 text-center px-3 py-2 text-sm font-semibold text-[#6E3482] hover:bg-[#F3E8FF] rounded-lg transition-colors">
                    Details →
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold" style={{ fontFamily: 'Plus Jakarta Sans' }}>Recent Bookings</h2>
          <Link to="/bookings" className="text-sm font-semibold text-[#6E3482] hover:text-[#49225B]">View all →</Link>
        </div>
        <div className="space-y-3">
          {['Elegant Decor Co.', 'Gourmet Catering', 'Sound Masters AV'].map((vendor, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-[#F3E8FF] transition-colors">
              <div>
                <p className="font-semibold">{vendor}</p>
                <p className="text-sm text-gray-500">Sharma Wedding</p>
              </div>
              <StatusBadge status="CONFIRMED" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};