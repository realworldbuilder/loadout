'use client';

import { useEffect } from 'react';

interface TrackPageViewProps {
  creatorId: string;
}

export default function TrackPageView({ creatorId }: TrackPageViewProps) {
  useEffect(() => {
    // Only track if we have a creator ID
    if (!creatorId) return;

    // Generate or get session ID
    let sessionId = sessionStorage.getItem('loadout_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('loadout_session_id', sessionId);
    }

    // Track pageview
    const trackPageview = async () => {
      try {
        await fetch('/api/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'pageview',
            creator_id: creatorId,
            referrer: document.referrer || '',
            session_id: sessionId
          })
        });
      } catch (error) {
        // Silent fail - tracking should never break the page
        console.debug('Pageview tracking failed:', error);
      }
    };

    trackPageview();
  }, [creatorId]);

  // This component renders nothing
  return null;
}