import { useState } from 'react';
import { format, startOfDay, subDays, isToday } from 'date-fns';

interface DayData {
  date: Date;
  versesRead: number;
}

interface ReadingHeatmapProps {
  dailyData: Record<string, number>; // dateString (YYYY-MM-DD) -> verses read
}

export function ReadingHeatmap({ dailyData }: ReadingHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Generate last 12 weeks of data
  const weeks = 12;
  const today = startOfDay(new Date());

  // Get color based on verse count
  const getColor = (versesRead: number) => {
    if (versesRead === 0) return 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700';
    if (versesRead < 25) return 'bg-teal-200 dark:bg-teal-900';
    if (versesRead < 50) return 'bg-teal-400 dark:bg-teal-700';
    if (versesRead < 100) return 'bg-teal-600 dark:bg-teal-600';
    return 'bg-teal-800 dark:bg-teal-500';
  };

  // Generate grid data
  const gridData: DayData[][] = [];
  let currentWeek: DayData[] = [];

  for (let i = 0; i < weeks * 7; i++) {
    const date = subDays(today, weeks * 7 - 1 - i);
    const dateKey = format(date, 'yyyy-MM-dd');
    const versesRead = dailyData[dateKey] || 0;

    currentWeek.push({ date, versesRead });

    if (currentWeek.length === 7) {
      gridData.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    gridData.push(currentWeek);
  }

  const handleMouseEnter = (day: DayData, event: React.MouseEvent) => {
    setHoveredDay(day);
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
  };

  const handleMouseLeave = () => {
    setHoveredDay(null);
  };

  const monthLabels: Array<{ weekIndex: number; label: string }> = [];
  const seenMonths = new Set<string>();

  gridData.forEach((week, weekIndex) => {
    const firstDay = week[0];
    const monthKey = format(firstDay.date, 'MMM');

    if (!seenMonths.has(monthKey) && weekIndex > 0) {
      monthLabels.push({ weekIndex, label: monthKey });
      seenMonths.add(monthKey);
    }
  });

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Reading Activity (Last {weeks} Weeks)
        </h4>

        {/* Legend */}
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700" />
            <div className="w-3 h-3 rounded-sm bg-teal-200 dark:bg-teal-900" />
            <div className="w-3 h-3 rounded-sm bg-teal-400 dark:bg-teal-700" />
            <div className="w-3 h-3 rounded-sm bg-teal-600 dark:bg-teal-600" />
            <div className="w-3 h-3 rounded-sm bg-teal-800 dark:bg-teal-500" />
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="relative">
        {/* Month labels */}
        <div className="flex mb-1 ml-6 relative h-4">
          {monthLabels.map(({ weekIndex, label }) => (
            <div
              key={`${weekIndex}-${label}`}
              className="absolute text-xs text-gray-500 dark:text-gray-400"
              style={{ left: `${(weekIndex * 100) / gridData.length}%` }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col justify-around text-xs text-gray-500 dark:text-gray-400 pr-1">
            <span>Sun</span>
            <span className="invisible">Mon</span>
            <span>Tue</span>
            <span className="invisible">Wed</span>
            <span>Thu</span>
            <span className="invisible">Fri</span>
            <span>Sat</span>
          </div>

          {/* Weeks */}
          <div className="flex gap-1 flex-1">
            {gridData.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1 flex-1">
                {week.map((day, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`aspect-square rounded-sm ${getColor(day.versesRead)} cursor-pointer transition-transform hover:scale-110 relative`}
                    onMouseEnter={(e) => handleMouseEnter(day, e)}
                    onMouseLeave={handleMouseLeave}
                    title={`${format(day.date, 'MMM d, yyyy')}: ${day.versesRead} verses`}
                  >
                    {isToday(day.date) && (
                      <div className="absolute inset-0 border-2 border-gold-500 dark:border-gold-400 rounded-sm pointer-events-none" />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Tooltip */}
        {hoveredDay && (
          <div
            className="fixed z-50 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full"
            style={{
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y}px`,
            }}
          >
            <div className="font-semibold">
              {format(hoveredDay.date, 'MMM d, yyyy')}
            </div>
            <div className="text-xs text-gray-300 dark:text-gray-400">
              {hoveredDay.versesRead === 0
                ? 'No verses read'
                : `${hoveredDay.versesRead} ${hoveredDay.versesRead === 1 ? 'verse' : 'verses'} read`
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
