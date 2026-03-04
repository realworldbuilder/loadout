'use client';

import { useState, useMemo } from 'react';
import { Mail, Plus, Download, Send, TrendingUp, Users, ShoppingCart, Repeat } from 'lucide-react';
import BarChart from '@/components/dashboard/BarChart';

interface Subscriber {
  id: string;
  email: string;
  source: 'purchase' | 'lead-magnet' | 'manual';
  dateJoined: Date;
  totalSpent: number;
}

// Demo subscribers
const demoSubscribers: Subscriber[] = [
  { id: '1', email: 'sarah.johnson@email.com', source: 'purchase', dateJoined: new Date('2026-01-15'), totalSpent: 197 },
  { id: '2', email: 'mike.chen@email.com', source: 'lead-magnet', dateJoined: new Date('2026-02-03'), totalSpent: 0 },
  { id: '3', email: 'emily.davis@email.com', source: 'purchase', dateJoined: new Date('2026-02-10'), totalSpent: 89 },
  { id: '4', email: 'alex.rodriguez@email.com', source: 'manual', dateJoined: new Date('2026-02-15'), totalSpent: 0 },
  { id: '5', email: 'jessica.kim@email.com', source: 'lead-magnet', dateJoined: new Date('2026-02-20'), totalSpent: 149 },
  { id: '6', email: 'david.wilson@email.com', source: 'purchase', dateJoined: new Date('2026-02-25'), totalSpent: 297 },
  { id: '7', email: 'lisa.brown@email.com', source: 'lead-magnet', dateJoined: new Date('2026-03-01'), totalSpent: 0 },
  { id: '8', email: 'ryan.taylor@email.com', source: 'purchase', dateJoined: new Date('2026-03-02'), totalSpent: 67 },
];

const sourceLabels = {
  'purchase': 'purchase',
  'lead-magnet': 'lead magnet',
  'manual': 'manual',
};

const sourceColors = {
  'purchase': '#10a37f',
  'lead-magnet': '#3b82f6',
  'manual': '#f59e0b',
};

export default function PipelinePage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>(demoSubscribers);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailData, setEmailData] = useState({
    to: 'all',
    subject: '',
    body: '',
  });

  // Generate growth chart data
  const growthChartData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        signups: Math.floor(Math.random() * 5) + 1,
      };
    });

    return last30Days.map((day, index) => ({
      label: new Date(day.date).getDate().toString(),
      value: day.signups,
      color: '#10a37f',
    }));
  }, []);

  // Funnel data
  const funnelData = {
    visitors: 12500,
    subscribers: 890,
    customers: 156,
    repeat: 42,
  };

  const funnelConversions = {
    visitorToSubscriber: ((funnelData.subscribers / funnelData.visitors) * 100).toFixed(1),
    subscriberToCustomer: ((funnelData.customers / funnelData.subscribers) * 100).toFixed(1),
    customerToRepeat: ((funnelData.repeat / funnelData.customers) * 100).toFixed(1),
  };

  const handleExportSubscribers = () => {
    const csv = [
      'Email,Source,Date Joined,Total Spent',
      ...subscribers.map(sub => 
        `${sub.email},${sourceLabels[sub.source]},${sub.dateJoined.toISOString().split('T')[0]},${sub.totalSpent}`
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subscribers.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleSendEmail = () => {
    // In real app, this would send via Supabase/email service
    alert(`email would be sent to ${emailData.to === 'all' ? 'all subscribers' : emailData.to}`);
    setShowEmailModal(false);
    setEmailData({ to: 'all', subject: '', body: '' });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">client pipeline</h1>
            <p className="text-gray-400">manage your email list and customer funnel</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleExportSubscribers}
              className="flex items-center space-x-2 px-4 py-2 bg-[#111] border border-white/5 rounded-lg text-gray-300 hover:text-white hover:bg-[#1a1a1a] transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>export subscribers</span>
            </button>
            
            <button
              onClick={() => setShowEmailModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-[#10a37f] text-white rounded-lg hover:bg-[#0d8b6b] transition-colors"
            >
              <Send className="h-4 w-4" />
              <span>send email</span>
            </button>
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#111] rounded-lg border border-white/5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">total subscribers</p>
                <p className="text-2xl font-bold text-white">{subscribers.length.toLocaleString()}</p>
                <p className="text-[#10a37f] text-xs mt-1">+{growthChartData.reduce((sum, day) => sum + day.value, 0)} this month</p>
              </div>
              <Users className="h-8 w-8 text-[#10a37f]" />
            </div>
          </div>
          
          <div className="bg-[#111] rounded-lg border border-white/5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">paying customers</p>
                <p className="text-2xl font-bold text-white">{subscribers.filter(s => s.totalSpent > 0).length}</p>
                <p className="text-[#10a37f] text-xs mt-1">{((subscribers.filter(s => s.totalSpent > 0).length / subscribers.length) * 100).toFixed(1)}% conversion</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-[#10a37f]" />
            </div>
          </div>
          
          <div className="bg-[#111] rounded-lg border border-white/5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">total revenue</p>
                <p className="text-2xl font-bold text-white">${subscribers.reduce((sum, s) => sum + s.totalSpent, 0).toLocaleString()}</p>
                <p className="text-[#10a37f] text-xs mt-1">${(subscribers.reduce((sum, s) => sum + s.totalSpent, 0) / subscribers.length).toFixed(0)} avg per subscriber</p>
              </div>
              <TrendingUp className="h-8 w-8 text-[#10a37f]" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Subscriber Growth */}
          <div className="bg-[#111] rounded-lg border border-white/5 p-6">
            <h3 className="text-lg font-semibold text-white mb-6">subscriber growth (last 30 days)</h3>
            <BarChart data={growthChartData} height={200} />
          </div>
          
          {/* Lead Magnet */}
          <div className="bg-[#111] rounded-lg border border-white/5 p-6">
            <h3 className="text-lg font-semibold text-white mb-6">lead magnet</h3>
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h4 className="text-white font-medium mb-2">create a free product to collect emails</h4>
              <p className="text-gray-400 text-sm mb-6">offer a workout guide, nutrition plan, or mini course in exchange for email signup</p>
              <button className="px-6 py-2 bg-[#10a37f] text-white rounded-lg hover:bg-[#0d8b6b] transition-colors">
                create lead magnet
              </button>
            </div>
          </div>
        </div>

        {/* Funnel Visualization */}
        <div className="bg-[#111] rounded-lg border border-white/5 p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-6">conversion funnel</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="bg-gradient-to-b from-[#10a37f] to-[#0d8b6b] rounded-lg p-6 mb-4">
                <Users className="h-8 w-8 text-white mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{funnelData.visitors.toLocaleString()}</div>
                <div className="text-green-100 text-sm">visitors</div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="text-[#10a37f] text-lg font-bold">{funnelConversions.visitorToSubscriber}%</div>
                <div className="ml-2 w-8 h-0.5 bg-gradient-to-r from-[#10a37f] to-[#3b82f6]"></div>
              </div>
              <div className="bg-gradient-to-b from-[#3b82f6] to-[#2563eb] rounded-lg p-6 mb-4">
                <Mail className="h-8 w-8 text-white mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{funnelData.subscribers.toLocaleString()}</div>
                <div className="text-blue-100 text-sm">subscribers</div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="text-[#3b82f6] text-lg font-bold">{funnelConversions.subscriberToCustomer}%</div>
                <div className="ml-2 w-8 h-0.5 bg-gradient-to-r from-[#3b82f6] to-[#f59e0b]"></div>
              </div>
              <div className="bg-gradient-to-b from-[#f59e0b] to-[#d97706] rounded-lg p-6 mb-4">
                <ShoppingCart className="h-8 w-8 text-white mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{funnelData.customers.toLocaleString()}</div>
                <div className="text-yellow-100 text-sm">customers</div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="text-[#f59e0b] text-lg font-bold">{funnelConversions.customerToRepeat}%</div>
                <div className="ml-2 w-8 h-0.5 bg-gradient-to-r from-[#f59e0b] to-[#8b5cf6]"></div>
              </div>
              <div className="bg-gradient-to-b from-[#8b5cf6] to-[#7c3aed] rounded-lg p-6 mb-4">
                <Repeat className="h-8 w-8 text-white mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{funnelData.repeat.toLocaleString()}</div>
                <div className="text-purple-100 text-sm">repeat</div>
              </div>
            </div>
          </div>
        </div>

        {/* Subscribers Table */}
        <div className="bg-[#111] rounded-lg border border-white/5 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">subscribers</h3>
            <div className="text-gray-400 text-sm">
              {subscribers.length} total subscribers
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-gray-400 text-sm font-medium pb-3">email</th>
                  <th className="text-left text-gray-400 text-sm font-medium pb-3">source</th>
                  <th className="text-left text-gray-400 text-sm font-medium pb-3">date joined</th>
                  <th className="text-right text-gray-400 text-sm font-medium pb-3">total spent</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="border-b border-gray-800/50">
                    <td className="py-3">
                      <span className="text-white text-sm">{subscriber.email}</span>
                    </td>
                    <td className="py-3">
                      <span 
                        className="text-xs px-2 py-1 rounded"
                        style={{ 
                          backgroundColor: sourceColors[subscriber.source] + '20', 
                          color: sourceColors[subscriber.source] 
                        }}
                      >
                        {sourceLabels[subscriber.source]}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="text-gray-300 text-sm">
                        {subscriber.dateJoined.toLocaleDateString()}
                      </span>
                    </td>
                    <td className="text-right py-3">
                      <span className="text-white text-sm font-medium">
                        ${subscriber.totalSpent.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Email Modal */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#111] rounded-lg border border-white/5 p-6 w-full max-w-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">compose email</h3>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">to</label>
                  <select
                    value={emailData.to}
                    onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#10a37f]"
                  >
                    <option value="all">all subscribers ({subscribers.length})</option>
                    <option value="customers">paying customers ({subscribers.filter(s => s.totalSpent > 0).length})</option>
                    <option value="prospects">prospects ({subscribers.filter(s => s.totalSpent === 0).length})</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-2">subject</label>
                  <input
                    type="text"
                    value={emailData.subject}
                    onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#10a37f]"
                    placeholder="enter email subject"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-2">body</label>
                  <textarea
                    value={emailData.body}
                    onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#10a37f] resize-none"
                    rows={8}
                    placeholder="write your email content..."
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowEmailModal(false)}
                    className="flex-1 px-4 py-2 bg-[#1a1a1a] text-gray-300 rounded-lg hover:text-white transition-colors"
                  >
                    cancel
                  </button>
                  <button
                    onClick={handleSendEmail}
                    disabled={!emailData.subject || !emailData.body}
                    className="flex-1 px-4 py-2 bg-[#10a37f] text-white rounded-lg hover:bg-[#0d8b6b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    send email
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}