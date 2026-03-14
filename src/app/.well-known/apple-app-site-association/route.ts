import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    applinks: {
      apps: [],
      details: [
        {
          appIDs: ['R2C4T4N7US.com.loadout.williamhussey'],
          paths: ['NOT /api/*', 'NOT /dashboard/*', 'NOT /signup', 'NOT /privacy', 'NOT /terms', '/*'],
        },
      ],
    },
    webcredentials: {
      apps: ['R2C4T4N7US.com.loadout.williamhussey'],
    },
  }, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
