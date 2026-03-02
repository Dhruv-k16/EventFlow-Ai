import { useCallback, useState } from 'react';
import { DataService } from '../../../services/dataStore'; // ✅ Fixed: was ../../services/
import SharedTimeline from '../../components/SharedTimeline'; // ✅ Fixed: was ../components/

export default function ClientTimelineScreen() {
  const [events, setEvents] = useState(DataService.getEvents());
  const activeEvent = events[0];

  const refreshData = useCallback(() => {
    setEvents(DataService.getEvents());
  }, []);

  if (!activeEvent) return null;

  return (
    <SharedTimeline
      items={activeEvent.timeline || []}
      eventId={activeEvent.id}
      canEdit={false}
      onRefresh={refreshData}
    />
  );
}
