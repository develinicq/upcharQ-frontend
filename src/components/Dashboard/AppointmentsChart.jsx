
import React, { useEffect, useRef } from 'react';

const AppointmentsChart = ({ data = [] }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  // Default data if no props passed
  const defaultData = [
    { month: "Jan", Rescheduled: 98, Engaged: 18, NoShow: 5, Admitted: 8 },
    { month: "Feb", Rescheduled: 82, Engaged: 12, NoShow: 4, Admitted: 6 },
    { month: "Mar", Rescheduled: 88, Engaged: 15, NoShow: 12, Admitted: 7 },
    { month: "Apr", Rescheduled: 68, Engaged: 16, NoShow: 8, Admitted: 5 },
    { month: "May", Rescheduled: 108, Engaged: 18, NoShow: 7, Admitted: 12 },
    { month: "Jun", Rescheduled: 122, Engaged: 20, NoShow: 6, Admitted: 10 },
    { month: "Jul", Rescheduled: 108, Engaged: 8, NoShow: 12, Admitted: 11 },
    { month: "Aug", Rescheduled: 98, Engaged: 9, NoShow: 5, Admitted: 6 },
    { month: "Sep", Rescheduled: 105, Engaged: 12, NoShow: 15, Admitted: 9 },
    { month: "Oct", Rescheduled: 148, Engaged: 11, NoShow: 18, Admitted: 8 },
    { month: "Nov", Rescheduled: 142, Engaged: 14, NoShow: 8, Admitted: 10 },
    { month: "Dec", Rescheduled: 128, Engaged: 6, NoShow: 15, Admitted: 11 }
  ];

  const chartData = data.length > 0 ? data : defaultData;

  useEffect(() => {
    // Load Chart.js dynamically
    const loadChart = async () => {
      if (typeof window !== 'undefined' && !window.Chart) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.js';
        document.head.appendChild(script);
        
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      // Wait for Chart to be available
      if (typeof window === 'undefined' || !window.Chart) {
        return;
      }

      if (chartRef.current) {
        chartRef.current.destroy();
      }

      const ctx = canvasRef.current;
      
      // Custom plugin for alternating background
      const alternatingBackgroundPlugin = {
        id: 'alternatingBackground',
        beforeDraw: (chart) => {
          const { ctx, chartArea } = chart;
          const { left, right, top, bottom } = chartArea;
          const barWidth = (right - left) / 12;
          
          // Draw alternating background stripes
          for (let i = 0; i < 12; i++) {
            const x = left + (i * barWidth);
            ctx.fillStyle = i % 2 === 0 ? 'rgba(248, 250, 252, 0.8)' : 'rgba(241, 245, 249, 0.6)';
            ctx.fillRect(x, top, barWidth, bottom - top);
          }
        }
      };

      chartRef.current = new window.Chart(ctx, {
        type: 'bar',
        data: {
          labels: chartData.map(item => item.month),
          datasets: [
            {
              label: 'Rescheduled',
              data: chartData.map(item => item.Rescheduled),
              backgroundColor: '#9ACD32',
              borderRadius: 2,
              borderSkipped: false,
              minBarThickness: 16,
              order: 1
            },
            {
              label: 'Engaged',
              data: chartData.map(item => item.Engaged),
              backgroundColor: '#FF6B6B',
              borderRadius: 2,
              borderSkipped: false,
              minBarThickness: 16,
              order: 2
            },
            {
              label: 'No-Show',
              data: chartData.map(item => item.NoShow),
              backgroundColor: '#4ECDC4',
              borderRadius: 2,
              borderSkipped: false,
              minBarThickness: 16,
              order: 3
            },
            {
              label: 'Admitted',
              data: chartData.map(item => item.Admitted),
              backgroundColor: '#FFD93D',
              borderRadius: 2,
              borderSkipped: false,
              minBarThickness: 16,
              order: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            intersect: false
          },
          plugins: {
            legend: {
              display: true,
              position: 'bottom',
              labels: {
                usePointStyle: true,
                pointStyle: 'rect',
                padding: 10,
                font: {
                  size: 12,
                  family: 'Inter'
                },
                color: '#64748b'
              }
            },
            tooltip: {
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              titleColor: '#374151',
              bodyColor: '#374151',
              borderColor: '#d1d5db',
              borderWidth: 1,
              cornerRadius: 6
            }
          },
          scales: {
            x: {
              grid: {
                display: true,
                color: 'rgba(226, 232, 240, 0.5)',
                lineWidth: 1,
                drawBorder: false,
                drawTicks: false
              },
              ticks: {
                font: {
                  size: 12,
                  family: 'Inter'
                },
                color: '#64748b',
                padding: 10
              },
              border: {
                display: false
              }
            },
            y: {
              beginAtZero: true,
              max: 200,
              ticks: {
                stepSize: 40,
                font: {
                  size: 12,
                  family: 'Inter'
                },
                color: '#64748b',
                padding: 10
              },
              grid: {
                display: true,
                color: 'rgba(226, 232, 240, 0.7)',
                lineWidth: 1,
                drawBorder: false,
                drawTicks: false
              },
              border: {
                display: false
              }
            }
          },
          layout: {
            
          },
          elements: {
            bar: {
              borderRadius: 2
            }
          }
        },
        plugins: [alternatingBackgroundPlugin]
      });
    };

    loadChart();

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [chartData]);

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg ">
      
      {/* Chart Container */}
      <div className="p-4">
        <div className="relative" style={{ height: '350px' }}>
          <canvas ref={canvasRef}></canvas>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsChart;