// src/app/recommendations/SessionTracker.tsx
'use client';

import { useSessionTracking } from './useSessionTracking';

interface SessionTrackerProps {
  userId: string;
  logId: string | null;
  children: (tracking: ReturnType<typeof useSessionTracking>) => React.ReactNode;
}

export default function SessionTracker({ userId, logId, children }: SessionTrackerProps) {
  const tracking = useSessionTracking(userId, logId);

  // Сессия автоматически завершается при размонтировании компонента
  // через useEffect внутри useSessionTracking (flushPending + PATCH запрос)

  return <>{children(tracking)}</>;
}
