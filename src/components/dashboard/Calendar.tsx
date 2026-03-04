'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarEvent {
  id: string;
  date: Date;
  title: string;
  color?: string;
}

interface CalendarProps {
  events?: CalendarEvent[];
  onDayClick?: (date: Date) => void;
  selectedDate?: Date | null;
  className?: string;
}

export default function Calendar({ 
  events = [], 
  onDayClick, 
  selectedDate,
  className = '' 
}: CalendarProps) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  
  // For this demo, we'll use current month. In real app, you'd manage this state
  const [displayMonth, setDisplayMonth] = useState(currentMonth);
  const [displayYear, setDisplayYear] = useState(currentYear);
  
  const monthNames = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];
  
  const weekDays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  
  // Get first day of month and number of days
  const firstDayOfMonth = new Date(displayYear, displayMonth, 1);
  const lastDayOfMonth = new Date(displayYear, displayMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();
  
  // Get days from previous month to fill the grid
  const daysFromPreviousMonth = new Date(displayYear, displayMonth, 0).getDate();
  const previousMonthDays = Array.from(
    { length: startingDayOfWeek }, 
    (_, i) => daysFromPreviousMonth - startingDayOfWeek + i + 1
  );
  
  // Get days for current month
  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  // Get days from next month to fill the grid (42 total days for 6 weeks)
  const totalCells = 42;
  const remainingCells = totalCells - previousMonthDays.length - currentMonthDays.length;
  const nextMonthDays = Array.from({ length: remainingCells }, (_, i) => i + 1);
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (displayMonth === 0) {
        setDisplayMonth(11);
        setDisplayYear(displayYear - 1);
      } else {
        setDisplayMonth(displayMonth - 1);
      }
    } else {
      if (displayMonth === 11) {
        setDisplayMonth(0);
        setDisplayYear(displayYear + 1);
      } else {
        setDisplayMonth(displayMonth + 1);
      }
    }
  };
  
  const isToday = (day: number, isCurrentMonth: boolean) => {
    return isCurrentMonth && 
           day === today.getDate() && 
           displayMonth === today.getMonth() && 
           displayYear === today.getFullYear();
  };
  
  const isSelected = (day: number, isCurrentMonth: boolean) => {
    if (!selectedDate || !isCurrentMonth) return false;
    return day === selectedDate.getDate() && 
           displayMonth === selectedDate.getMonth() && 
           displayYear === selectedDate.getFullYear();
  };
  
  const getEventsForDay = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return [];
    const date = new Date(displayYear, displayMonth, day);
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };
  
  const handleDayClick = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth || !onDayClick) return;
    const date = new Date(displayYear, displayMonth, day);
    onDayClick(date);
  };

  return (
    <div className={`bg-gray-900 rounded-lg border border-gray-800 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <h2 className="text-lg font-semibold text-white">
          {monthNames[displayMonth]} {displayYear}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Calendar Grid */}
      <div className="p-4">
        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {/* Previous month days */}
          {previousMonthDays.map(day => (
            <div key={`prev-${day}`} className="h-10 flex items-center justify-center text-gray-600 text-sm">
              {day}
            </div>
          ))}
          
          {/* Current month days */}
          {currentMonthDays.map(day => {
            const dayEvents = getEventsForDay(day, true);
            const isTodayDay = isToday(day, true);
            const isSelectedDay = isSelected(day, true);
            
            return (
              <div
                key={day}
                onClick={() => handleDayClick(day, true)}
                className={`
                  h-10 flex items-center justify-center text-sm relative cursor-pointer rounded-lg transition-all
                  ${isTodayDay ? 'bg-primary-600 text-white font-medium' : ''}
                  ${isSelectedDay && !isTodayDay ? 'bg-primary-600/20 text-primary-400 font-medium' : ''}
                  ${!isTodayDay && !isSelectedDay ? 'text-gray-300 hover:bg-gray-800' : ''}
                `}
              >
                {day}
                {/* Event indicators */}
                {dayEvents.length > 0 && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
                    {dayEvents.slice(0, 3).map((event, i) => (
                      <div
                        key={event.id}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: event.color || '#10a37f' }}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                    )}
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Next month days */}
          {nextMonthDays.map(day => (
            <div key={`next-${day}`} className="h-10 flex items-center justify-center text-gray-600 text-sm">
              {day}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}