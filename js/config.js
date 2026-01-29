// League and position configurations for efficiency calculations

const LEAGUE_CONFIG = {
  MLB_2019: {
    name: 'MLB 2019',
    displayName: 'Major League Baseball - 2019 Season',
    budget: {
      total: null, // No salary cap in MLB
      soft: null,
      hard: null,
      luxuryTax: null
    },
    positions: {
      SP: {
        name: 'Starting Pitcher',
        positionMax: 8.0,
        efficiencyThreshold: 25000000,
        positionWeight: 0.30
      },
      RP: {
        name: 'Relief Pitcher',
        positionMax: 3.5,
        efficiencyThreshold: 12000000,
        positionWeight: 0.15
      },
      SS: {
        name: 'Shortstop',
        positionMax: 8.5,
        efficiencyThreshold: 22000000,
        positionWeight: 0.20
      },
      OF: {
        name: 'Outfielder',
        positionMax: 9.0,
        efficiencyThreshold: 28000000,
        positionWeight: 0.25
      },
      DH: {
        name: 'Designated Hitter',
        positionMax: 3.5,
        efficiencyThreshold: 15000000,
        positionWeight: 0.10
      }
    },
    draftOrder: ['SP', 'RP', 'SS', 'OF', 'DH'],
    statName: 'WAR',
    difficulty: 'easy',
    description: 'No salary cap. Learn to recognize diminishing returns.'
  },

  NFL_2020: {
    name: 'NFL 2020',
    displayName: 'National Football League - 2020 Season',
    budget: {
      total: 198200000,
      soft: null,
      hard: 198200000,
      luxuryTax: null
    },
    positions: {
      QB: {
        name: 'Quarterback',
        positionMax: 150,
        efficiencyThreshold: 35000000,
        positionWeight: 0.35
      },
      LT: {
        name: 'Left Tackle',
        positionMax: 80,
        efficiencyThreshold: 18000000,
        positionWeight: 0.18
      },
      EDGE: {
        name: 'Edge Rusher',
        positionMax: 95,
        efficiencyThreshold: 22000000,
        positionWeight: 0.20
      },
      WR: {
        name: 'Wide Receiver',
        positionMax: 100,
        efficiencyThreshold: 20000000,
        positionWeight: 0.15
      },
      CB: {
        name: 'Cornerback',
        positionMax: 50,
        efficiencyThreshold: 17000000,
        positionWeight: 0.12
      }
    },
    draftOrder: ['QB', 'LT', 'EDGE', 'WR', 'CB'],
    statName: 'EPA',
    difficulty: 'medium',
    description: 'Hard salary cap at $198.2M. Make tough trade-offs.'
  },

  NBA_2019: {
    name: 'NBA 2018-19',
    displayName: 'National Basketball Association - 2018-19 Season',
    budget: {
      total: 101900000,
      soft: 101900000,
      hard: null,
      luxuryTax: 123700000
    },
    positions: {
      PG: {
        name: 'Point Guard',
        positionMax: 31,
        efficiencyThreshold: 28000000,
        positionWeight: 0.20
      },
      SG: {
        name: 'Shooting Guard',
        positionMax: 31,
        efficiencyThreshold: 25000000,
        positionWeight: 0.20
      },
      SF: {
        name: 'Small Forward',
        positionMax: 27,
        efficiencyThreshold: 30000000,
        positionWeight: 0.20
      },
      PF: {
        name: 'Power Forward',
        positionMax: 29,
        efficiencyThreshold: 30000000,
        positionWeight: 0.20
      },
      C: {
        name: 'Center',
        positionMax: 27,
        efficiencyThreshold: 28000000,
        positionWeight: 0.20
      }
    },
    draftOrder: ['PG', 'SG', 'SF', 'PF', 'C'],
    statName: 'PER',
    difficulty: 'hard',
    description: 'Soft cap with luxury tax. Strategic spending decisions.',
    luxuryTaxRates: [
      { threshold: 0, rate: 1.5 },
      { threshold: 5000000, rate: 1.75 },
      { threshold: 10000000, rate: 2.5 },
      { threshold: 15000000, rate: 3.25 },
      { threshold: 20000000, rate: 3.75 }
    ]
  }
};

// Scoring thresholds
const SCORING = {
  efficiency: {
    excellent: 0.90,
    good: 0.75,
    fair: 0.60
  },
  badges: {
    frontierMaster: { minEfficiency: 0.95, allScenarios: true },
    capWizard: { league: 'NFL_2020', minEfficiency: 0.95 },
    taxStrategist: { league: 'NBA_2019', maxTaxEfficiency: 0.92 },
    quickLearner: { maxTime: 1080000 } // 18 minutes in ms
  },
  pointsPerScenario: {
    efficiency: 50,
    strategic: 30,
    speed: 10,
    comprehension: 10
  }
};

// Tutorial configuration
const TUTORIAL_CONFIG = {
  league: 'NFL_2020',
  positions: ['QB', 'WR', 'CB'],
  budget: 75000000,
  preselectedPlayers: {
    QB: 'herbert-justin-2020',
    WR: 'jefferson-justin-2020',
    CB: 'diggs-trevon-2020'
  }
};

// Chart color schemes
const CHART_COLORS = {
  student: '#2563eb',      // Blue
  optimal: '#10b981',      // Green
  frontier: '#f59e0b',     // Yellow/Orange
  overFrontier: '#ef4444', // Red
  average: '#6b7280'       // Gray
};

// Completion tier thresholds and claim codes
const COMPLETION_TIERS = {
  gold: {
    minScore: 270,  // 90% of 300
    name: 'Gold Tier',
    badge: '🥇',
    claimCode: 'GMCHALLENGE-GOLD-2026',
    message: 'Outstanding! You\'ve mastered the efficiency frontier!',
    color: '#FFD700'
  },
  silver: {
    minScore: 240,  // 80% of 300
    name: 'Silver Tier',
    badge: '🥈',
    claimCode: 'GMCHALLENGE-SILVER-2026',
    message: 'Great work! You understand diminishing returns well!',
    color: '#C0C0C0'
  },
  bronze: {
    minScore: 210,  // 70% of 300
    name: 'Bronze Tier',
    badge: '🥉',
    claimCode: 'GMCHALLENGE-BRONZE-2026',
    message: 'Good job! You\'ve completed all scenarios!',
    color: '#CD7F32'
  },
  participant: {
    minScore: 0,
    name: 'Participant',
    badge: '🎓',
    claimCode: 'GMCHALLENGE-COMPLETE-2026',
    message: 'You\'ve completed the challenge! Keep practicing!',
    color: '#6b7280'
  }
};

// Export configurations
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    LEAGUE_CONFIG,
    SCORING,
    TUTORIAL_CONFIG,
    CHART_COLORS,
    COMPLETION_TIERS
  };
}
