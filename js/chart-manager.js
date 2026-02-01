// Chart manager for Chart.js visualizations

class ChartManager {
  constructor() {
    this.charts = {};
  }

  initializeCharts() {
    this.createEfficiencyChart();
  }

  createEfficiencyChart() {
    const ctx = document.getElementById('efficiency-chart');
    if (!ctx) return;

    this.charts.efficiency = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Your Roster',
          data: [],
          borderColor: CHART_COLORS.student,
          backgroundColor: 'rgba(37, 99, 235, 0.2)',
          borderWidth: 3,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: CHART_COLORS.student,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          fill: false,
          tension: 0.3
        }, {
          label: 'Efficiency Frontier (Optimal)',
          data: [],
          borderColor: CHART_COLORS.optimal,
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 0,
          fill: true,
          tension: 0.4,
          borderDash: [8, 4]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          title: {
            display: true,
            text: 'Efficiency Frontier: Wins vs. Spending',
            font: {
              size: 16,
              weight: 'bold'
            },
            padding: {
              top: 10,
              bottom: 20
            }
          },
          legend: {
            display: true,
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 15,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 13
            },
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                label += context.parsed.y.toFixed(1) + ' wins at $' + context.label + 'M';
                return label;
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Total Spending (Millions $)',
              font: {
                size: 14,
                weight: 'bold'
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Projected Wins',
              font: {
                size: 14,
                weight: 'bold'
              }
            },
            beginAtZero: true,
            max: 100,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              callback: function(value) {
                return value + ' wins';
              }
            }
          }
        }
      }
    });
  }

  updateEfficiencyChart(studentData, optimalData) {
    if (!this.charts.efficiency) return;

    this.charts.efficiency.data.labels = studentData.labels || [];
    this.charts.efficiency.data.datasets[0].data = studentData.values || [];
    this.charts.efficiency.data.datasets[1].data = optimalData.values || [];

    // Smooth animation
    this.charts.efficiency.update({
      duration: 750,
      easing: 'easeInOutQuart'
    });
  }

  destroy() {
    Object.values(this.charts).forEach(chart => {
      if (chart) chart.destroy();
    });
    this.charts = {};
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChartManager;
}
