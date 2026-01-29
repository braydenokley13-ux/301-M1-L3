// Efficiency calculations based on player stats and salary

class EfficiencyCalculator {
  constructor(leagueConfig) {
    this.config = leagueConfig;
  }

  /**
   * Calculate win contribution for a player at a specific salary
   * Uses exponential diminishing returns formula
   * @param {Object} player - Player object with stats
   * @param {number} salary - Selected salary tier amount
   * @param {string} position - Position code (QB, SP, PG, etc.)
   * @returns {number} Win contribution
   */
  calculateWinContribution(player, salary, position) {
    const posConfig = this.config.positions[position];
    const stat = this.getPlayerStat(player, position);

    // Normalize stat to 0-1 scale
    const normalizedStat = stat / posConfig.positionMax;

    // Apply diminishing returns based on salary
    const efficiencyFactor = 1 - Math.exp(-salary / posConfig.efficiencyThreshold);

    // Calculate win contribution
    const winContribution = normalizedStat * efficiencyFactor * posConfig.positionWeight * 100;

    return Math.max(0, winContribution);
  }

  /**
   * Get the relevant stat for a player based on league
   * @param {Object} player - Player object
   * @param {string} position - Position code
   * @returns {number} Stat value
   */
  getPlayerStat(player, position) {
    const stats = player.stats;

    // MLB uses WAR
    if (stats.war !== undefined) {
      return stats.war;
    }

    // NFL uses EPA
    if (stats.epa !== undefined) {
      return stats.epa;
    }

    // NFL uses pass block win rate for OL
    if (stats.pbwr !== undefined) {
      return stats.epa || stats.pbwr * 0.8; // Convert PBWR to approximate EPA
    }

    // NFL uses pass rush win rate for EDGE
    if (stats.prwr !== undefined) {
      return stats.epa || stats.prwr * 0.9; // Convert PRWR to approximate EPA
    }

    // NBA uses PER
    if (stats.per !== undefined) {
      return stats.per;
    }

    return 0;
  }

  /**
   * Calculate efficiency for a complete roster
   * @param {Object} roster - Roster object with positions and players
   * @param {number} totalSpent - Total salary spent
   * @returns {Object} Efficiency metrics
   */
  calculateRosterEfficiency(roster, totalSpent) {
    let totalWins = 0;
    const positionBreakdown = {};

    // Calculate total wins from all positions
    for (const [position, selection] of Object.entries(roster)) {
      if (selection && selection.player && selection.salary) {
        const wins = this.calculateWinContribution(
          selection.player,
          selection.salary,
          position
        );
        totalWins += wins;
        positionBreakdown[position] = {
          wins,
          salary: selection.salary,
          efficiency: wins / (selection.salary / 1000000) // Wins per million
        };
      }
    }

    // Calculate optimal spending (where efficiency peaks)
    const optimalSpending = this.calculateOptimalSpending(roster);

    // Calculate efficiency ratio
    const efficiency = totalSpent > 0 ?
      totalWins / (totalSpent / optimalSpending) : 0;

    return {
      totalWins: Math.round(totalWins * 10) / 10,
      efficiency: Math.round(efficiency * 100) / 100,
      optimalSpending,
      overcost: totalSpent - optimalSpending,
      positionBreakdown,
      isEfficient: efficiency >= SCORING.efficiency.good
    };
  }

  /**
   * Calculate optimal spending for current roster selections
   * @param {Object} roster - Roster object
   * @returns {number} Optimal spending amount
   */
  calculateOptimalSpending(roster) {
    let optimal = 0;

    for (const [position, selection] of Object.entries(roster)) {
      if (selection && selection.player) {
        const posConfig = this.config.positions[position];
        const stat = this.getPlayerStat(selection.player, position);

        // Optimal salary is near the efficiency threshold, scaled by player quality
        const qualityFactor = stat / posConfig.positionMax;
        optimal += posConfig.efficiencyThreshold * qualityFactor * 0.8;
      }
    }

    return Math.round(optimal);
  }

  /**
   * Calculate luxury tax for NBA
   * @param {number} totalSalary - Total roster salary
   * @returns {number} Luxury tax amount
   */
  calculateLuxuryTax(totalSalary) {
    if (this.config.name !== 'NBA 2018-19') {
      return 0;
    }

    const taxThreshold = this.config.budget.luxuryTax;
    if (totalSalary <= taxThreshold) {
      return 0;
    }

    const overage = totalSalary - taxThreshold;
    let tax = 0;
    let remaining = overage;

    // Progressive tax rates
    const rates = this.config.luxuryTaxRates;
    for (let i = 0; i < rates.length; i++) {
      const currentThreshold = rates[i].threshold;
      const nextThreshold = i < rates.length - 1 ?
        rates[i + 1].threshold : Infinity;
      const tierSize = nextThreshold - currentThreshold;

      if (remaining > 0) {
        const taxableInTier = Math.min(remaining, tierSize);
        tax += taxableInTier * rates[i].rate;
        remaining -= taxableInTier;
      }
    }

    return Math.round(tax);
  }

  /**
   * Generate recommendations for improving efficiency
   * @param {Object} studentRoster - Student's roster
   * @param {Object} optimalRoster - Optimal roster for comparison
   * @returns {Array} Array of recommendation objects
   */
  generateRecommendations(studentRoster, optimalRoster) {
    const recommendations = [];

    for (const position of Object.keys(studentRoster)) {
      const studentPick = studentRoster[position];
      const optimalPick = optimalRoster.players.find(p => p.position === position);

      if (!studentPick || !optimalPick) continue;

      if (studentPick.salary > optimalPick.salary * 1.2) {
        const savings = studentPick.salary - optimalPick.salary;
        recommendations.push({
          position,
          type: 'overspend',
          message: `Consider ${optimalPick.name} at $${(optimalPick.salary / 1000000).toFixed(1)}M instead of ${studentPick.player.name} at $${(studentPick.salary / 1000000).toFixed(1)}M`,
          impact: `Save $${(savings / 1000000).toFixed(1)}M while maintaining similar production`,
          priority: 'high'
        });
      }
    }

    // Check for underutilized budget
    const studentTotal = Object.values(studentRoster)
      .reduce((sum, sel) => sum + (sel.salary || 0), 0);
    const optimalTotal = optimalRoster.budget;

    if (studentTotal < optimalTotal * 0.8 && this.config.budget.hard) {
      recommendations.push({
        type: 'underutilized',
        message: `You're only using ${((studentTotal / this.config.budget.total) * 100).toFixed(0)}% of the salary cap`,
        impact: 'Consider upgrading at key positions to improve win total',
        priority: 'medium'
      });
    }

    return recommendations;
  }

  /**
   * Calculate score for a scenario
   * @param {Object} metrics - Efficiency metrics
   * @param {number} timeSpent - Time spent in milliseconds
   * @returns {Object} Scoring breakdown
   */
  calculateScore(metrics, timeSpent) {
    const scores = {};

    // Efficiency score (0-50 points)
    const efficiencyRatio = Math.min(metrics.efficiency, 1.0);
    scores.efficiency = Math.round(efficiencyRatio * SCORING.pointsPerScenario.efficiency);

    // Strategic decision (0-30 points)
    // Rewards staying close to frontier
    const frontierScore = metrics.efficiency >= 0.95 ? 30 :
                         metrics.efficiency >= 0.85 ? 25 :
                         metrics.efficiency >= 0.75 ? 20 :
                         metrics.efficiency >= 0.65 ? 15 : 10;
    scores.strategic = frontierScore;

    // Speed bonus (0-10 points)
    const targetTime = 6 * 60 * 1000; // 6 minutes
    const speedRatio = Math.max(0, 1 - (timeSpent / targetTime - 1));
    scores.speed = Math.round(speedRatio * SCORING.pointsPerScenario.speed);

    // Comprehension (base 10 points, could add quiz later)
    scores.comprehension = 10;

    // Total
    scores.total = scores.efficiency + scores.strategic + scores.speed + scores.comprehension;

    return scores;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EfficiencyCalculator;
}
