import React from 'react';
import { useParams } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { PlannerRiskDashboard } from './PlannerRiskDashboard';
import { ClientRiskDashboard } from './ClientRiskDashboard';

export const RiskDashboard: React.FC = () => {
  const { eventId } = useParams();
  const { user } = useAuth();

  if (user?.role === 'CLIENT') {
    return <ClientRiskDashboard eventId={eventId} />;
  }

  return <PlannerRiskDashboard eventId={eventId} />;
};
