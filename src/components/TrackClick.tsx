'use client';

import { ReactNode } from 'react';

interface TrackClickProps {
  creatorId: string;
  productId: string;
  children: ReactNode;
  onClick?: () => void;
}

export default function TrackClick({ creatorId, productId, children, onClick }: TrackClickProps) {
  const handleClick = () => {
    // Fire custom onClick if provided
    if (onClick) {
      onClick();
    }

    // Track the click
    const trackClick = async () => {
      try {
        // Get session ID from storage
        let sessionId = sessionStorage.getItem('loadout_session_id');
        if (!sessionId) {
          // Generate new session ID if not found
          sessionId = crypto.randomUUID();
          sessionStorage.setItem('loadout_session_id', sessionId);
        }

        // Use sendBeacon for reliability - fires even if user navigates away
        if (navigator.sendBeacon) {
          const data = JSON.stringify({
            type: 'click',
            creator_id: creatorId,
            product_id: productId,
            referrer: document.referrer || '',
            session_id: sessionId
          });
          
          navigator.sendBeacon('/api/track', new Blob([data], { type: 'application/json' }));
        } else {
          // Fallback to fetch for older browsers
          fetch('/api/track', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'click',
              creator_id: creatorId,
              product_id: productId,
              referrer: document.referrer || '',
              session_id: sessionId
            })
          }).catch(() => {
            // Silent fail
          });
        }
      } catch (error) {
        // Silent fail - tracking should never break the page
        console.debug('Click tracking failed:', error);
      }
    };

    trackClick();
  };

  return (
    <div onClick={handleClick}>
      {children}
    </div>
  );
}