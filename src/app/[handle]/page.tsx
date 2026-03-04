import CreatorProfile from '@/components/CreatorProfile';

export function generateStaticParams() {
  return [
    { handle: 'demo' },
    { handle: 'fitcreator' },
  ];
}

export default function CreatorProfilePage({ params }: { params: { handle: string } }) {
  return <CreatorProfile handle={params.handle} />;
}
