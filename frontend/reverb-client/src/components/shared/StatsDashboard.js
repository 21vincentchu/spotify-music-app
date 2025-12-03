import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import '../../styles/StatsDashboard.css';

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

const StatsDashboard = ({ recentTracks }) => {
  // Play Activity Over Time (Line Graph)
  const getPlayActivityData = () => {
    if (!recentTracks || !Array.isArray(recentTracks) || recentTracks.length === 0) {
      return { labels: [], datasets: [] };
    }

    // Group by hour and count plays
    const playsByHour = {};
    const now = new Date();

    recentTracks.forEach(item => {
      const playedAt = new Date(item.played_at);
      const hoursAgo = Math.floor((now - playedAt) / (1000 * 60 * 60));

      const hours = playedAt.getHours();
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHour = hours % 12 || 12;
      const timeKey = `${displayHour}${period}`;

      // Store both the count and hoursAgo for sorting
      if (!playsByHour[hoursAgo]) {
        playsByHour[hoursAgo] = {
          label: timeKey,
          count: 0
        };
      }
      playsByHour[hoursAgo].count++;
    });

    // Sort by hoursAgo (descending = oldest to newest)
    const sortedHours = Object.keys(playsByHour)
      .map(h => parseInt(h))
      .sort((a, b) => b - a);

    const labels = sortedHours.map(h => playsByHour[h].label);
    const data = sortedHours.map(h => playsByHour[h].count);

    return {
      labels: labels,
      datasets: [
        {
          label: 'Songs Played',
          data: data,
          borderColor: '#1282A2',
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, 'rgba(18, 130, 162, 0.6)');
            gradient.addColorStop(0.5, 'rgba(18, 130, 162, 0.3)');
            gradient.addColorStop(1, 'rgba(18, 130, 162, 0.05)');
            return gradient;
          },
          borderWidth: 2.5,
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#1282A2',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointHoverBackgroundColor: '#1282A2',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2.5,
        },
      ],
    };
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#1a1a2e',
          font: {
            size: 14,
            weight: 'bold'
          },
          padding: 15
        }
      },
      title: {
        display: true,
        text: 'Listening Activity',
        color: '#1a1a2e',
        font: {
          size: 20,
          weight: 'bold'
        },
        padding: {
          top: 5,
          bottom: 10
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        padding: 12,
        displayColors: true,
        callbacks: {
          title: function(context) {
            return `Time: ${context[0].label}`;
          },
          label: function(context) {
            const value = context.parsed.y;
            return `${value} song${value !== 1 ? 's' : ''} played`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Plays',
          color: '#1a1a2e',
          font: {
            size: 15,
            weight: 'bold'
          }
        },
        ticks: {
          color: '#1a1a2e',
          stepSize: 2,
          font: {
            size: 12
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Time',
          color: '#1a1a2e',
          font: {
            size: 15,
            weight: 'bold'
          }
        },
        ticks: {
          color: '#1a1a2e',
          font: {
            size: 12
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    },
  };

  const chartData = getPlayActivityData();

  // Find max value and add padding to prevent cutoff
  const maxValue = chartData.datasets[0]?.data?.length > 0
    ? Math.max(...chartData.datasets[0].data)
    : 10;
  // Always add 2 for padding, then round up to next even number
  const paddedMax = maxValue + 2;
  const yAxisMax = paddedMax % 2 === 0 ? paddedMax : paddedMax + 1;

  const simpleOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart',
    },
    plugins: {
      title: {
        display: true,
        text: 'Listening Activity',
        color: '#2c3e50',
        font: {
          size: 20,
          weight: '600',
          family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        },
        padding: {
          top: 5,
          bottom: 10
        }
      },
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: '#2c3e50',
          font: {
            size: 12,
            weight: '500'
          },
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          boxWidth: 6,
          boxHeight: 6
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#2c3e50',
        bodyColor: '#2c3e50',
        borderColor: '#e0e0e0',
        borderWidth: 1,
        titleFont: {
          size: 13,
          weight: 'bold'
        },
        bodyFont: {
          size: 12
        },
        padding: 10,
        cornerRadius: 6,
        displayColors: true,
        callbacks: {
          title: function(context) {
            return `Time: ${context[0].label}`;
          },
          label: function(context) {
            const value = context.parsed.y;
            return `${value} song${value !== 1 ? 's' : ''} played`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: yAxisMax,
        title: {
          display: false
        },
        ticks: {
          color: '#95a5a6',
          stepSize: 2,
          font: {
            size: 11
          },
          padding: 10
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
          lineWidth: 1
        },
        border: {
          display: false,
          dash: [5, 5]
        }
      },
      x: {
        title: {
          display: false
        },
        ticks: {
          color: '#95a5a6',
          font: {
            size: 11
          },
          padding: 10
        },
        grid: {
          display: false,
          drawBorder: true,
          borderColor: 'rgba(0, 0, 0, 0.1)'
        },
        border: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  return (
    <div className="stats-dashboard">
      <div className="single-chart-container">
        <Line data={chartData} options={simpleOptions} />
      </div>
    </div>
  );
};

export default StatsDashboard;
