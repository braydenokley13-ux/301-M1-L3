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
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          tension: 0.4
        }, {
          label: 'Optimal',
          data: [],
          borderColor: CHART_COLORS.optimal,
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          borderDash: [5, 5]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Spending (Millions)'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Wins'
            },
            beginAtZero: true
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
