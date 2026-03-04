'use client';

import { useEffect, useState } from 'react';

interface BarData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarData[];
  height?: number;
  showLabels?: boolean;
  className?: string;
}

export default function BarChart({ 
  data, 
  height = 200, 
  showLabels = true, 
  className = '' 
}: BarChartProps) {
  const [animate, setAnimate] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!data.length) return null;

  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className={`${className}`}>
      <div 
        className="flex items-end space-x-2 relative"
        style={{ height }}
      >
        {data.map((item, index) => {
          const barHeight = maxValue > 0 ? (item.value / maxValue) * (height - 40) : 0;
          const color = item.color || '#10a37f';
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center group">
              {/* Bar */}
              <div className="relative w-full flex justify-center">
                <div
                  className="w-8 bg-gray-700 rounded-t transition-all duration-1000 ease-out relative group-hover:opacity-80 cursor-pointer"
                  style={{
                    height: animate ? `${barHeight}px` : '0px',
                    backgroundColor: color,
                    minHeight: '2px'
                  }}
                >
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                    {item.value.toLocaleString()}
                  </div>
                </div>
              </div>
              
              {/* Label */}
              {showLabels && (
                <div className="text-xs text-gray-400 mt-2 text-center truncate w-full">
                  {item.label}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}