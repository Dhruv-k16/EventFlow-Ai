import React from 'react';
import { Link } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'motion/react';
import { KPICard } from '../../components/shared/KPICard';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Clock, DollarSign, CheckCircle2, Calendar, Briefcase } from 'lucide-react';

export const VendorDashboard: React.FC = () => {
  const { user } = useAuth();

  const pendingRequests = [
    { id: '1', event: 'Sharma Wedding', planner: 'Sarah Johnson', date: 'Mar 25, 2026', amount: '₹1,50,000' },
    { id: '2', event: 'Tech Corp Annual', planner: 'Tech Corp', date: 'Apr 10, 2026', amount: '₹80,000' },
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-extrabold text-[#49225B] mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          Good morning, {user?.firstName} 👋
        </h1>
        <p className="text-gray-500">{user?.businessName} • {user?.category}</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard label="Pending Requests" value={2} subLabel="Awaiting response" icon={Clock} accentColor="amber" />
        <KPICard label="Confirmed Revenue" value="₹8.5L" subLabel="This month" icon={DollarSign} accentColor="green" />
        <KPICard label="Confirmed Count" value={12} subLabel="Active bookings" icon={CheckCircle2} accentColor="green" />
        <KPICard label="Total Bookings" value={45} subLabel="All time" icon={Calendar} accentColor="purple" />
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          Pending Requests ⚡
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {pendingRequests.map((req) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-xl shadow-md p-6 transition-all duration-300"
            >
              <h3 className="font-bold text-lg mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>{req.event}</h3>
              <p className="text-sm text-gray-600 mb-1">Planner: {req.planner}</p>
              <p className="text-sm text-gray-600 mb-1">Date: {req.date}</p>
              <p className="text-lg font-mono font-bold text-[#49225B] mb-4">{req.amount}</p>
              <div className="flex gap-2">
                <button className="flex-1 gradient-success text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-all">
                  Confirm
                </button>
                <button className="flex-1 border border-red-200 text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-50 transition-all">
                  Reject
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Upcoming Bookings</h2>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold">Event {i}</p>
                  <p className="text-sm text-gray-500">Mar {20 + i}, 2026</p>
                </div>
                <StatusBadge status="CONFIRMED" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Link to="/vendor/portfolio" className="flex items-center justify-between p-4 gradient-purple-primary text-white rounded-xl hover:shadow-lg transition-all">
            <span className="font-semibold">My Portfolio</span>
            <Briefcase size={20} />
          </Link>
          <Link to="/vendor/inventory" className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-[#A56ABD] hover:bg-[#F3E8FF] transition-all">
            <span className="font-semibold">Manage Inventory</span>
          </Link>
          <Link to="/vendor/staff" className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-[#A56ABD] hover:bg-[#F3E8FF] transition-all">
            <span className="font-semibold">Manage Staff</span>
          </Link>
          <Link to="/vendor/financials" className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-[#A56ABD] hover:bg-[#F3E8FF] transition-all">
            <span className="font-semibold">View Financials</span>
          </Link>
          <Link to="/vendor/risk" className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-[#A56ABD] hover:bg-[#F3E8FF] transition-all">
            <span className="font-semibold">Risk Analysis</span>
          </Link>
        </div>
      </div>
    </div>
  );
};