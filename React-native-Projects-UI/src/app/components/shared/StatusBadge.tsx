import React from 'react';

type Status =
  | 'CONFIRMED'
  | 'REQUESTED'
  | 'PENDING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED'
  | 'REJECTED_CAPACITY'
  | 'MEETING_PHASE_1'
  | 'MEETING_PHASE_2'
  | 'CONFIRMATION_PENDING'
  | 'LIVE'
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL'
  | string; // fallback for any unexpected value

interface StatusBadgeProps {
  status: Status;
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, showDot = false }) => {
  const getStyles = () => {
    switch (status) {
      case 'CONFIRMED':
        return { bg: 'bg-[#D1FAE5]', text: 'text-[#15803D]', border: 'border-[#A7F3D0]', label: 'Confirmed' };
      case 'REQUESTED':
        return { bg: 'bg-[#F3E8FF]', text: 'text-[#6D28D9]', border: 'border-[#DDD6FE]', label: 'Requested' };
      case 'PENDING':
        return { bg: 'bg-[#FEF3C7]', text: 'text-[#B45309]', border: 'border-[#FDE68A]', label: 'Pending' };
      case 'MEETING_PHASE_1':
        return { bg: 'bg-[#EDE9FE]', text: 'text-[#5B21B6]', border: 'border-[#C4B5FD]', label: 'Meeting 1' };
      case 'CONFIRMATION_PENDING':
        return { bg: 'bg-[#FEF3C7]', text: 'text-[#B45309]', border: 'border-[#FDE68A]', label: 'Awaiting Confirm' };
      case 'MEETING_PHASE_2':
        return { bg: 'bg-[#F3E8FF]', text: 'text-[#6E3482]', border: 'border-[#DDD6FE]', label: 'Meeting 2' };
      case 'COMPLETED':
        return { bg: 'bg-[#DBEAFE]', text: 'text-[#1D4ED8]', border: 'border-[#BFDBFE]', label: 'Completed' };
      case 'CANCELLED':
        return { bg: 'bg-[#F3F4F6]', text: 'text-[#4B5563]', border: 'border-[#E5E7EB]', label: 'Cancelled' };
      case 'REJECTED':
      case 'REJECTED_CAPACITY':
        return { bg: 'bg-[#FEE2E2]', text: 'text-[#B91C1C]', border: 'border-[#FECACA]', label: 'Rejected' };
      case 'LIVE':
        return { bg: 'bg-[#10B981]', text: 'text-white', border: 'border-transparent', label: 'Live' };
      case 'LOW':
        return { bg: 'bg-[#D1FAE5]', text: 'text-[#15803D]', border: 'border-[#A7F3D0]', label: 'Low' };
      case 'MEDIUM':
        return { bg: 'bg-[#FEF3C7]', text: 'text-[#B45309]', border: 'border-[#FDE68A]', label: 'Medium' };
      case 'HIGH':
        return { bg: 'bg-[#FFEDD5]', text: 'text-[#C2410C]', border: 'border-[#FED7AA]', label: 'High' };
      case 'CRITICAL':
        return { bg: 'bg-[#FEE2E2]', text: 'text-[#B91C1C]', border: 'border-[#FECACA]', label: 'Critical' };
      default:
        return { bg: 'bg-[#F3F4F6]', text: 'text-[#4B5563]', border: 'border-[#E5E7EB]', label: status };
    }
  };

  const styles = getStyles();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles.bg} ${styles.text} ${styles.border} ${
        status === 'CRITICAL' ? 'animate-pulse' : ''
      }`}
    >
      {(status === 'LIVE' || showDot) && (
        <span className={`w-2 h-2 rounded-full ${status === 'LIVE' ? 'bg-white pulse-glow' : 'bg-current'}`} />
      )}
      {styles.label}
    </span>
  );
};
