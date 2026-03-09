'use client';

import { useState, useEffect } from 'react';
import { Check, ExternalLink, Lock, Crown, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface CustomDomainSettingsProps {
  onSave?: () => void;
}

export default function CustomDomainSettings({ onSave }: CustomDomainSettingsProps) {
  const { user } = useAuth();
  const [domain, setDomain] = useState('');
  const [currentDomain, setCurrentDomain] = useState<string | null>(null);
  const [domainVerified, setDomainVerified] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<'free' | 'pro'>('free');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load current domain settings
  useEffect(() => {
    if (user?.id) {
      fetchDomainSettings();
    }
  }, [user?.id]);

  const fetchDomainSettings = async () => {
    if (!user?.id) return;
    
    try {
      const res = await fetch(`/api/domains/verify?userId=${user.id}`);
      const data = await res.json();
      
      if (res.ok) {
        setCurrentDomain(data.customDomain);
        setDomainVerified(data.domainVerified);
        setSubscriptionTier(data.subscriptionTier || 'free');
        setDomain(data.customDomain || '');
      }
    } catch (error) {
      console.error('Failed to fetch domain settings:', error);
    }
  };

  const handleVerifyDomain = async () => {
    if (!domain.trim() || !user?.id) return;
    
    setVerifying(true);
    setError(null);
    setSuccess(null);
    
    try {
      const res = await fetch('/api/domains/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: domain.trim(),
          userId: user.id
        })
      });
      
      const data = await res.json();
      
      if (res.ok && data.verified) {
        setSuccess(data.message || 'Domain verified successfully!');
        setCurrentDomain(data.domain);
        setDomainVerified(true);
        onSave?.();
      } else {
        setError(data.error || 'Failed to verify domain');
        setDomainVerified(false);
      }
    } catch (error) {
      setError('Failed to verify domain. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleRemoveDomain = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Update to remove domain
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          custom_domain: null,
          domain_verified: false
        })
      });
      
      if (res.ok) {
        setCurrentDomain(null);
        setDomainVerified(false);
        setDomain('');
        setSuccess('Custom domain removed successfully');
        onSave?.();
      } else {
        setError('Failed to remove domain');
      }
    } catch (error) {
      setError('Failed to remove domain. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          tier: 'pro'
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSubscriptionTier('pro');
        setSuccess('Successfully upgraded to Pro! You can now set up a custom domain.');
        onSave?.();
      } else {
        setError(data.error || 'Failed to upgrade');
      }
    } catch (error) {
      setError('Failed to upgrade. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Pro tier gate
  if (subscriptionTier !== 'pro') {
    return (
      <div className="bg-white dark:bg-[#111] rounded-lg border border-white/5 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg">
            <Crown className="h-5 w-5 text-yellow-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Custom Domain</h3>
            <p className="text-gray-400 text-sm">Connect your own domain to your loadout page</p>
          </div>
          <div className="ml-auto">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
          <div className="flex items-start space-x-3">
            <Crown className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">Pro Feature</h4>
              <p className="text-gray-400 text-sm">
                Custom domains are available for Pro subscribers. Upgrade to connect your own domain and create a professional branded experience.
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-400">
            <Check className="h-4 w-4 mr-2 text-[#10a37f]" />
            <span>Professional branded URLs (yourbrand.com)</span>
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <Check className="h-4 w-4 mr-2 text-[#10a37f]" />
            <span>Enhanced SEO and discoverability</span>
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <Check className="h-4 w-4 mr-2 text-[#10a37f]" />
            <span>Custom domain SSL certificates</span>
          </div>
        </div>
        
        <button 
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-medium rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all disabled:opacity-50"
        >
          {loading ? 'Upgrading...' : 'Upgrade to Pro — $19/mo'}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#111] rounded-lg border border-white/5 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-[#10a37f]/20 rounded-lg">
          <ExternalLink className="h-5 w-5 text-[#10a37f]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Custom Domain</h3>
          <p className="text-gray-400 text-sm">Connect your own domain to your loadout page</p>
        </div>
        <div className="ml-auto">
          <Crown className="h-5 w-5 text-yellow-500" />
        </div>
      </div>

      {/* Current domain status */}
      {currentDomain && (
        <div className="bg-[#1a1a1a] rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${domainVerified ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <div>
                <p className="text-gray-900 dark:text-white font-medium">{currentDomain}</p>
                <p className="text-gray-400 text-sm">
                  {domainVerified ? 'Active and verified' : 'Pending verification'}
                </p>
              </div>
            </div>
            <button
              onClick={handleRemoveDomain}
              disabled={loading}
              className="text-red-400 hover:text-red-300 text-sm disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Domain input */}
      <div className="space-y-4">
        <div>
          <label className="block text-gray-400 text-sm mb-2">Your domain</label>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#10a37f]"
            placeholder="yourbrand.com"
          />
        </div>

        {/* DNS Instructions */}
        <div className="bg-[#1a1a1a] rounded-lg p-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">DNS Configuration</h4>
          <p className="text-gray-400 text-sm mb-3">
            Add this CNAME record to your domain's DNS settings:
          </p>
          <div className="bg-black/50 rounded p-3 font-mono text-sm">
            <div className="text-gray-300">
              <span className="text-yellow-400">Type:</span> CNAME<br />
              <span className="text-yellow-400">Name:</span> @ (or your subdomain)<br />
              <span className="text-yellow-400">Value:</span> loadout.fit
            </div>
          </div>
          <p className="text-gray-500 text-xs mt-2">
            DNS changes can take up to 24 hours to propagate globally.
          </p>
        </div>

        {/* Error/Success messages */}
        {error && (
          <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-center space-x-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
            <p className="text-green-400 text-sm">{success}</p>
          </div>
        )}

        {/* Verify button */}
        <button
          onClick={handleVerifyDomain}
          disabled={!domain.trim() || verifying}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-[#10a37f] text-black rounded-lg hover:bg-[#0d8b6b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {verifying ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Verifying...</span>
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              <span>Verify Domain</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}