import React, { useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { StatusBadge } from '../../components/shared/StatusBadge';

export const ClientEvents: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('All');

  const events = [
    { id: '1', name: 'Sharma Wedding', date: 'Mar 25, 2026', location: 'Mumbai', guests: 500, status: 'CONFIRMED' as const, isLive: false },
    { id: '2', name: 'Birthday Party', date: 'Mar 18, 2026', location: 'Goa', guests: 80, status: 'CONFIRMED' as const, isLive: false },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-[#49225B]" style={{ fontFamily: 'Plus Jakarta Sans' }}>My Events</h1>
        <p className="text-gray-500 mt-1">{events.length} total events</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {['All', 'Upcoming', 'Past', 'Live'].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all duration-200 ${
              activeFilter === filter ? 'gradient-purple-primary text-white' : 'bg-white border border-gray-200 text-gray-700'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4 }}
            className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 relative"
          >
            {event.isLive && (
              <div className="absolute top-3 left-3 z-10">
                <StatusBadge status="LIVE" showDot />
              </div>
            )}
            <div className="h-40 gradient-purple-accent" />
            <div className="p-5 space-y-3">
              <div>
                <h3 className="font-bold text-lg mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>{event.name}</h3>
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
  );
};
