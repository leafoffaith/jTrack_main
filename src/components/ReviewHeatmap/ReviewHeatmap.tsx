import dayjs from 'dayjs';
import { DayForecast } from '../../hooks/useReviewForecast';

interface ReviewHeatmapProps {
  days: DayForecast[];
  maxCount: number;
}

/**
 * Get color based on review count
 * Yellow: 1-10, Orange: 11-25, Red: 26+
 */
function getColorForCount(count: number): string {
  if (count === 0) return '#f3f4f6'; // gray-100 (empty)
  if (count <= 5) return '#fef3c7'; // yellow-100
  if (count <= 10) return '#fde047'; // yellow-300
  if (count <= 15) return '#fb923c'; // orange-400
  if (count <= 25) return '#f97316'; // orange-500
  return '#dc2626'; // red-600 (heavy)
}

/**
 * Get intensity label for tooltip
 */
function getIntensityLabel(count: number): string {
  if (count === 0) return 'No reviews';
  if (count <= 10) return 'Light';
  if (count <= 25) return 'Medium';
  return 'Heavy';
}

export function ReviewHeatmap({ days, maxCount }: ReviewHeatmapProps) {
  // Split into 2 rows of 7 days each
  const week1 = days.slice(0, 7);
  const week2 = days.slice(7, 14);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
        <span>Next 14 Days</span>
        <span className="text-gray-500">
          Peak: <strong>{maxCount}</strong> reviews
        </span>
      </div>

      {/* Week 1 */}
      <div className="grid grid-cols-7 gap-2">
        {week1.map((day) => {
          const date = dayjs(day.date);
          const isToday = date.isSame(dayjs(), 'day');
          const color = getColorForCount(day.count);
          const intensity = getIntensityLabel(day.count);

          return (
            <div
              key={day.date}
              className="group relative flex flex-col items-center"
            >
              {/* Day label */}
              <div className="text-xs text-gray-500 mb-1 font-medium">
                {date.format('ddd')}
              </div>

              {/* Heatmap cell */}
              <div
                className="w-full aspect-square rounded-md transition-all duration-200 hover:scale-110 hover:shadow-md cursor-pointer border border-gray-200"
                style={{ backgroundColor: color }}
              >
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                  <div className="font-semibold">{date.format('MMM D')}</div>
                  <div className="text-gray-300">
                    {day.count} reviews • {intensity}
                  </div>
                  {isToday && (
                    <div className="text-yellow-300 text-[10px] mt-1">TODAY</div>
                  )}
                  {/* Tooltip arrow */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                    <div className="border-4 border-transparent border-t-gray-900" />
                  </div>
                </div>

                {/* Count text */}
                {day.count > 0 && (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-800">
                      {day.count}
                    </span>
                  </div>
                )}

                {/* Today indicator */}
                {isToday && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
                )}
              </div>

              {/* Date label */}
              <div className="text-[10px] text-gray-400 mt-1">
                {date.format('D')}
              </div>
            </div>
          );
        })}
      </div>

      {/* Week 2 */}
      <div className="grid grid-cols-7 gap-2">
        {week2.map((day) => {
          const date = dayjs(day.date);
          const color = getColorForCount(day.count);
          const intensity = getIntensityLabel(day.count);

          return (
            <div
              key={day.date}
              className="group relative flex flex-col items-center"
            >
              {/* Day label */}
              <div className="text-xs text-gray-500 mb-1 font-medium">
                {date.format('ddd')}
              </div>

              {/* Heatmap cell */}
              <div
                className="w-full aspect-square rounded-md transition-all duration-200 hover:scale-110 hover:shadow-md cursor-pointer border border-gray-200"
                style={{ backgroundColor: color }}
              >
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                  <div className="font-semibold">{date.format('MMM D')}</div>
                  <div className="text-gray-300">
                    {day.count} reviews • {intensity}
                  </div>
                  {/* Tooltip arrow */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                    <div className="border-4 border-transparent border-t-gray-900" />
                  </div>
                </div>

                {/* Count text */}
                {day.count > 0 && (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-800">
                      {day.count}
                    </span>
                  </div>
                )}
              </div>

              {/* Date label */}
              <div className="text-[10px] text-gray-400 mt-1">
                {date.format('D')}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200 mt-4">
        <span className="text-xs text-gray-600">Intensity</span>
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1">
            <div
              className="w-4 h-4 rounded border border-gray-200"
              style={{ backgroundColor: '#fef3c7' }}
            />
            <span className="text-xs text-gray-600 mr-2">Light</span>
          </div>
          <div className="flex items-center gap-1">
            <div
              className="w-4 h-4 rounded border border-gray-200"
              style={{ backgroundColor: '#fb923c' }}
            />
            <span className="text-xs text-gray-600 mr-2">Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div
              className="w-4 h-4 rounded border border-gray-200"
              style={{ backgroundColor: '#dc2626' }}
            />
            <span className="text-xs text-gray-600">Heavy</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReviewHeatmap;
