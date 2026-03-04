export const dynamic = "force-dynamic";
'use client';

import { useState, useMemo } from 'react';
import { Plus, Clock, User, ExternalLink, X } from 'lucide-react';
import Calendar from '@/components/dashboard/Calendar';

interface CoachingSession {
  id: string;
  clientName: string;
  clientEmail: string;
  date: Date;
  duration: number; // in minutes
  sessionType: 'coaching' | 'form-check' | 'nutrition' | 'group';
  notes: string;
  recurring?: 'weekly' | 'biweekly' | null;
}

// Demo sessions
const demoSessions: CoachingSession[] = [
  {
    id: '1',
    clientName: 'sarah johnson',
    clientEmail: 'sarah@email.com',
    date: new Date(2026, 2, 5, 14, 0), // March 5th, 2026 at 2 PM
    duration: 60,
    sessionType: 'coaching',
    notes: 'form review and goal setting',
    recurring: 'weekly',
  },
  {
    id: '2',
    clientName: 'mike chen',
    clientEmail: 'mike@email.com',
    date: new Date(2026, 2, 7, 10, 0), // March 7th, 2026 at 10 AM
    duration: 45,
    sessionType: 'nutrition',
    notes: 'meal plan adjustments',
    recurring: null,
  },
  {
    id: '3',
    clientName: 'emily davis',
    clientEmail: 'emily@email.com',
    date: new Date(2026, 2, 10, 16, 30), // March 10th, 2026 at 4:30 PM
    duration: 30,
    sessionType: 'form-check',
    notes: 'deadlift technique review',
    recurring: null,
  },
  {
    id: '4',
    clientName: 'group session',
    clientEmail: '',
    date: new Date(2026, 2, 12, 19, 0), // March 12th, 2026 at 7 PM
    duration: 90,
    sessionType: 'group',
    notes: 'hiit workout class',
    recurring: 'weekly',
  },
];

const sessionTypeColors = {
  'coaching': '#10a37f',
  'form-check': '#3b82f6',
  'nutrition': '#f59e0b',
  'group': '#8b5cf6',
};

const sessionTypeLabels = {
  'coaching': '1:1 coaching',
  'form-check': 'form check',
  'nutrition': 'nutrition consult',
  'group': 'group session',
};

export default function CalendarPage() {
  const [sessions, setSessions] = useState<CoachingSession[]>(demoSessions);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSession, setNewSession] = useState({
    clientName: '',
    clientEmail: '',
    date: new Date(),
    time: '14:00',
    duration: 60,
    sessionType: 'coaching' as CoachingSession['sessionType'],
    notes: '',
    recurring: null as CoachingSession['recurring'],
  });

  // Convert sessions to calendar events
  const calendarEvents = useMemo(() => {
    return sessions.map(session => ({
      id: session.id,
      date: session.date,
      title: session.clientName,
      color: sessionTypeColors[session.sessionType],
    }));
  }, [sessions]);

  // Get sessions for selected date
  const selectedDateSessions = useMemo(() => {
    if (!selectedDate) return [];
    return sessions.filter(session => 
      session.date.toDateString() === selectedDate.toDateString()
    );
  }, [sessions, selectedDate]);

  // Get upcoming sessions (next 7 days)
  const upcomingSessions = useMemo(() => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    return sessions
      .filter(session => session.date >= today && session.date <= nextWeek)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [sessions]);

  const handleAddSession = () => {
    const sessionDate = new Date(newSession.date);
    const [hours, minutes] = newSession.time.split(':').map(Number);
    sessionDate.setHours(hours, minutes);

    const session: CoachingSession = {
      id: Date.now().toString(),
      clientName: newSession.clientName,
      clientEmail: newSession.clientEmail,
      date: sessionDate,
      duration: newSession.duration,
      sessionType: newSession.sessionType,
      notes: newSession.notes,
      recurring: newSession.recurring,
    };

    setSessions([...sessions, session]);
    setShowAddModal(false);
    setNewSession({
      clientName: '',
      clientEmail: '',
      date: new Date(),
      time: '14:00',
      duration: 60,
      sessionType: 'coaching',
      notes: '',
      recurring: null,
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">coaching calendar</h1>
            <p className="text-gray-400">manage your coaching sessions and appointments</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => alert('booking link: loadout.fit/@yourhandle/book')}
              className="flex items-center space-x-2 px-4 py-2 bg-[#111] border border-white/5 rounded-lg text-gray-300 hover:text-white hover:bg-[#1a1a1a] transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              <span>share booking link</span>
            </button>
            
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-[#10a37f] text-white rounded-lg hover:bg-[#0d8b6b] transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>add session</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Calendar
              events={calendarEvents}
              onDayClick={setSelectedDate}
              selectedDate={selectedDate}
            />
          </div>
          
          {/* Side Panel */}
          <div className="space-y-6">
            {/* Selected Day Sessions */}
            {selectedDate && (
              <div className="bg-[#111] rounded-lg border border-white/5 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  {selectedDate.toLocaleDateString('en', { 
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>
                
                {selectedDateSessions.length === 0 ? (
                  <p className="text-gray-400 text-sm">no sessions scheduled</p>
                ) : (
                  <div className="space-y-3">
                    {selectedDateSessions.map(session => (
                      <div 
                        key={session.id}
                        className="p-3 bg-[#1a1a1a] rounded-lg border border-white/5"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium text-sm">
                            {session.clientName}
                          </span>
                          <span 
                            className="text-xs px-2 py-1 rounded"
                            style={{ backgroundColor: sessionTypeColors[session.sessionType] + '20', color: sessionTypeColors[session.sessionType] }}
                          >
                            {sessionTypeLabels[session.sessionType]}
                          </span>
                        </div>
                        <div className="text-gray-400 text-xs space-y-1">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-3 w-3" />
                            <span>{formatTime(session.date)} • {session.duration}min</span>
                          </div>
                          {session.notes && (
                            <div>{session.notes}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Upcoming Sessions */}
            <div className="bg-[#111] rounded-lg border border-white/5 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">upcoming sessions</h3>
              
              {upcomingSessions.length === 0 ? (
                <p className="text-gray-400 text-sm">no upcoming sessions</p>
              ) : (
                <div className="space-y-3">
                  {upcomingSessions.slice(0, 5).map(session => (
                    <div 
                      key={session.id}
                      className="p-3 bg-[#1a1a1a] rounded-lg border border-white/5"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium text-sm">
                          {session.clientName}
                        </span>
                        <span 
                          className="text-xs px-2 py-1 rounded"
                          style={{ backgroundColor: sessionTypeColors[session.sessionType] + '20', color: sessionTypeColors[session.sessionType] }}
                        >
                          {sessionTypeLabels[session.sessionType]}
                        </span>
                      </div>
                      <div className="text-gray-400 text-xs">
                        {session.date.toLocaleDateString('en', { month: 'short', day: 'numeric' })} • {formatTime(session.date)} • {session.duration}min
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Session Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#111] rounded-lg border border-white/5 p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">add session</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">client name</label>
                  <input
                    type="text"
                    value={newSession.clientName}
                    onChange={(e) => setNewSession({ ...newSession, clientName: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#10a37f]"
                    placeholder="enter client name"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-2">client email</label>
                  <input
                    type="email"
                    value={newSession.clientEmail}
                    onChange={(e) => setNewSession({ ...newSession, clientEmail: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#10a37f]"
                    placeholder="enter client email"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">date</label>
                    <input
                      type="date"
                      value={newSession.date.toISOString().split('T')[0]}
                      onChange={(e) => setNewSession({ ...newSession, date: new Date(e.target.value) })}
                      className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#10a37f]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">time</label>
                    <input
                      type="time"
                      value={newSession.time}
                      onChange={(e) => setNewSession({ ...newSession, time: e.target.value })}
                      className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#10a37f]"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">duration</label>
                    <select
                      value={newSession.duration}
                      onChange={(e) => setNewSession({ ...newSession, duration: Number(e.target.value) })}
                      className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#10a37f]"
                    >
                      <option value={30}>30 min</option>
                      <option value={45}>45 min</option>
                      <option value={60}>60 min</option>
                      <option value={90}>90 min</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">session type</label>
                    <select
                      value={newSession.sessionType}
                      onChange={(e) => setNewSession({ ...newSession, sessionType: e.target.value as CoachingSession['sessionType'] })}
                      className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#10a37f]"
                    >
                      <option value="coaching">1:1 coaching</option>
                      <option value="form-check">form check</option>
                      <option value="nutrition">nutrition consult</option>
                      <option value="group">group session</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-2">notes</label>
                  <textarea
                    value={newSession.notes}
                    onChange={(e) => setNewSession({ ...newSession, notes: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#10a37f] resize-none"
                    rows={3}
                    placeholder="session notes..."
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-2">recurring</label>
                  <select
                    value={newSession.recurring || ''}
                    onChange={(e) => setNewSession({ ...newSession, recurring: e.target.value as CoachingSession['recurring'] })}
                    className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#10a37f]"
                  >
                    <option value="">one-time</option>
                    <option value="weekly">weekly</option>
                    <option value="biweekly">biweekly</option>
                  </select>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 bg-[#1a1a1a] text-gray-300 rounded-lg hover:text-white transition-colors"
                  >
                    cancel
                  </button>
                  <button
                    onClick={handleAddSession}
                    disabled={!newSession.clientName}
                    className="flex-1 px-4 py-2 bg-[#10a37f] text-white rounded-lg hover:bg-[#0d8b6b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    add session
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