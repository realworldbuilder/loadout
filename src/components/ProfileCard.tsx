'use client';

import Image from 'next/image';
import Link from 'next/link';
import { 
  Instagram, 
  Youtube, 
  Twitter,
  ExternalLink,
  Users,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { type Creator } from '@/lib/supabase';

interface ProfileCardProps {
  creator: Creator;
  stats?: {
    followers?: number;
    products?: number;
    sales?: number;
  };
  compact?: boolean;
}

export default function ProfileCard({ creator, stats, compact = false }: ProfileCardProps) {
  const socialLinks = [
    {
      platform: 'instagram',
      url: creator.social_links.instagram 
        ? `https://instagram.com/${creator.social_links.instagram}`
        : null,
      icon: Instagram,
      color: 'hover:bg-pink-600',
    },
    {
      platform: 'youtube',
      url: creator.social_links.youtube
        ? `https://youtube.com/${creator.social_links.youtube}`
        : null,
      icon: Youtube,
      color: 'hover:bg-red-600',
    },
    {
      platform: 'twitter',
      url: creator.social_links.twitter
        ? `https://twitter.com/${creator.social_links.twitter}`
        : null,
      icon: Twitter,
      color: 'hover:bg-blue-600',
    },
  ].filter(link => link.url);

  if (compact) {
    return (
      <div className="card p-4">
        <div className="flex items-center space-x-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {creator.avatar_url ? (
              <Image
                src={creator.avatar_url}
                alt={creator.display_name}
                width={60}
                height={60}
                className="rounded-full border-2 border-primary-600"
              />
            ) : (
              <div className="w-15 h-15 rounded-full bg-gradient-primary flex items-center justify-center text-lg font-bold">
                {creator.display_name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Creator Info */}
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{creator.display_name}</h3>
            <p className="text-gray-400 text-sm">@{creator.handle}</p>
            
            {creator.bio && (
              <p className="text-gray-300 text-sm mt-1 line-clamp-2">
                {creator.bio}
              </p>
            )}
          </div>

          {/* View Profile Link */}
          <Link
            href={`/${creator.handle}`}
            className="btn-secondary flex items-center space-x-2"
          >
            <span>View</span>
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      {/* Banner/Header */}
      <div className="h-32 bg-gradient-primary relative">
        {creator.banner_url && (
          <Image
            src={creator.banner_url}
            alt={`${creator.display_name} banner`}
            fill
            className="object-cover"
          />
        )}
        
        {/* Tier Badge */}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
            creator.tier === 'pro' 
              ? 'bg-gradient-primary text-white'
              : creator.tier === 'studio'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-600 text-gray-200'
          }`}>
            {creator.tier.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="p-6">
        {/* Avatar */}
        <div className="flex items-start justify-between mb-4">
          <div className="-mt-12 relative">
            {creator.avatar_url ? (
              <Image
                src={creator.avatar_url}
                alt={creator.display_name}
                width={80}
                height={80}
                className="rounded-full border-4 border-background-primary"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-primary border-4 border-background-primary flex items-center justify-center text-2xl font-bold">
                {creator.display_name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          {/* Action Button */}
          <Link
            href={`/${creator.handle}`}
            className="btn-primary flex items-center space-x-2"
          >
            <span>Visit Storefront</span>
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>

        {/* Creator Details */}
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-1">{creator.display_name}</h2>
          <p className="text-gray-400 mb-2">@{creator.handle}</p>
          
          {creator.bio && (
            <p className="text-gray-300 leading-relaxed mb-4">{creator.bio}</p>
          )}
        </div>

        {/* Stats */}
        {stats && (
          <div className="flex items-center space-x-6 mb-4 text-sm">
            {stats.followers !== undefined && (
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="font-medium">{stats.followers.toLocaleString()}</span>
                <span className="text-gray-400">followers</span>
              </div>
            )}
            
            {stats.products !== undefined && (
              <div className="flex items-center space-x-1">
                <span className="font-medium">{stats.products}</span>
                <span className="text-gray-400">products</span>
              </div>
            )}
            
            {stats.sales !== undefined && (
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-4 w-4 text-primary-600" />
                <span className="font-medium">{stats.sales}</span>
                <span className="text-gray-400">sales</span>
              </div>
            )}
          </div>
        )}

        {/* Social Links */}
        {socialLinks.length > 0 && (
          <div className="flex space-x-2">
            {socialLinks.map(({ platform, url, icon: Icon, color }) => (
              <a
                key={platform}
                href={url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 bg-background-secondary rounded-lg transition-colors ${color}`}
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}