import CreatorProfile from '@/components/CreatorProfile';

export function generateStaticParams() {
  return [
    { handle: 'demo' },
    { handle: 'alexrivera' },
    { handle: 'mayafit' },
    { handle: 'ironmike' },
    { handle: 'zenlifts' },
    { handle: 'coachdre' },
    { handle: 'macrosbymel' },
    { handle: 'aline_tdn' },
  ];
}

export default function CreatorProfilePage({ params }: { params: { handle: string } }) {
  return <CreatorProfile handle={params.handle} />;
}
