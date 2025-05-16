import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { format, subDays } from 'date-fns';
import { Loader2 } from 'lucide-react';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const MOOD_EMOJIS: Record<string, string> = {
  happy: '😊',
  neutral: '😐',
  sad: '😔',
  anxious: '😰',
  energized: '⚡',
  tired: '😴',
};

const MOOD_VALUES: Record<string, number> = {
  happy: 3,
  neutral: 2,
  sad: 1,
  anxious: 0,
  energized: 3,
  tired: 1,
};

interface MoodEntry {
  id: string;
  mood: string;
  createdAt: string;
  notes?: string;
  energyLevel?: number;
  tags?: string[];
}

interface MoodTrackerProps {
  moodHistory: MoodEntry[];
  loading?: boolean;
  daysToShow?: number;
}

export const MoodTracker: React.FC<MoodTrackerProps> = ({
  moodHistory = [],
  loading = false,
  daysToShow = 7,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (moodHistory.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No mood data available. Start tracking your mood to see insights.
      </div>
    );
  }


  // Generate labels for the past N days
  const labels = Array.from({ length: daysToShow }, (_, i) => {
    const date = subDays(new Date(), daysToShow - 1 - i);
    return format(date, 'EEE');
  });

  // Prepare data for the chart
  const moodData = labels.map((_, index) => {
    const date = subDays(new Date(), daysToShow - 1 - index);
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Find mood entries for this date
    const dailyEntries = moodHistory.filter(entry => {
      const entryDate = format(new Date(entry.createdAt), 'yyyy-MM-dd');
      return entryDate === dateStr;
    });

    if (dailyEntries.length === 0) return null;

    // Calculate average mood for the day
    const avgMood = dailyEntries.reduce((sum, entry) => {
      return sum + (MOOD_VALUES[entry.mood] || 0);
    }, 0) / dailyEntries.length;

    return {
      date: dateStr,
      mood: avgMood,
      entries: dailyEntries,
    };
  }).filter(Boolean);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Mood',
        data: labels.map((_, i) => {
          const entry = moodData[i];
          return entry ? entry.mood : null;
        }),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: (context: any) => {
          const value = context.dataset.data[context.dataIndex];
          if (value === null) return 'transparent';
          if (value >= 2.5) return '#10B981';
          if (value >= 1.5) return '#F59E0B';
          return '#EF4444';
        },
        pointBorderColor: 'transparent',
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 0,
        max: 3,
        ticks: {
          callback: (value: number) => {
            const moods = Object.entries(MOOD_VALUES);
            const mood = moods.find(([_, v]) => v === value);
            return mood ? mood[0].charAt(0).toUpperCase() + mood[0].slice(1) : '';
          },
          stepSize: 1,
        },
        grid: {
          display: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const dataIndex = context.dataIndex;
            const entry = moodData[dataIndex];
            if (!entry) return 'No data';
            
            const moodCounts: Record<string, number> = {};
            entry.entries.forEach((e: MoodEntry) => {
              moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
            });
            
            return Object.entries(moodCounts).map(([mood, count]) => {
              return `${MOOD_EMOJIS[mood] || '•'} ${mood}: ${count} time${count > 1 ? 's' : ''}`;
            });
          },
        },
      },
    },
  };

  // Calculate mood statistics
  const moodCounts = moodHistory.reduce((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostCommonMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';
  const totalEntries = moodHistory.length;

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-lg p-4 border border-border/50">
        <h3 className="text-lg font-medium mb-4">Mood Trends</h3>
        <div className="h-64">
          <Line data={chartData} options={options} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-card rounded-lg p-4 border border-border/50">
          <h4 className="text-sm font-medium text-muted-foreground mb-1">Most Common Mood</h4>
          <div className="flex items-center">
            <span className="text-3xl mr-2">{MOOD_EMOJIS[mostCommonMood] || '😐'}</span>
            <span className="text-xl font-medium capitalize">{mostCommonMood}</span>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 border border-border/50">
          <h4 className="text-sm font-medium text-muted-foreground mb-1">Total Entries</h4>
          <div className="text-3xl font-medium">{totalEntries}</div>
        </div>

        <div className="bg-card rounded-lg p-4 border border-border/50">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Mood Distribution</h4>
          <div className="space-y-2">
            {Object.entries(moodCounts).map(([mood, count]) => (
              <div key={mood} className="flex items-center">
                <span className="w-6">{MOOD_EMOJIS[mood] || '•'}</span>
                <div className="flex-1 mx-2 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{
                      width: `${(count / totalEntries) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-8 text-right">
                  {Math.round((count / totalEntries) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodTracker;
