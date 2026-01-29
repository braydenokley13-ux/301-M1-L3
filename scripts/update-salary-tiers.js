const fs = require('fs');
const path = require('path');

// League configurations (from config.js)
const LEAGUE_CONFIG = {
  MLB_2019: {
    positions: {
      SP: { positionMax: 8.0, efficiencyThreshold: 25000000 },
      RP: { positionMax: 3.5, efficiencyThreshold: 12000000 },
      SS: { positionMax: 8.5, efficiencyThreshold: 22000000 },
      OF: { positionMax: 9.0, efficiencyThreshold: 28000000 },
      DH: { positionMax: 3.5, efficiencyThreshold: 15000000 }
    },
    statKey: 'war'
  },
  NFL_2020: {
    positions: {
      QB: { positionMax: 150.0, efficiencyThreshold: 35000000 },
      LT: { positionMax: 80.0, efficiencyThreshold: 18000000 },
      EDGE: { positionMax: 95.0, efficiencyThreshold: 22000000 },
      WR: { positionMax: 100.0, efficiencyThreshold: 20000000 },
      CB: { positionMax: 50.0, efficiencyThreshold: 17000000 }
    },
    statKey: 'epa'
  },
  NBA_2019: {
    positions: {
      PG: { positionMax: 31.0, efficiencyThreshold: 28000000 },
      SG: { positionMax: 31.0, efficiencyThreshold: 25000000 },
      SF: { positionMax: 27.0, efficiencyThreshold: 30000000 },
      PF: { positionMax: 29.0, efficiencyThreshold: 30000000 },
      C: { positionMax: 27.0, efficiencyThreshold: 28000000 }
    },
    statKey: 'per'
  }
};

function calculateMarketValue(player, position, leagueConfig, statKey) {
  const posConfig = leagueConfig[position];
  const stat = player.stats[statKey];
  const normalizedStat = stat / posConfig.positionMax;
  const baseValue = posConfig.efficiencyThreshold * normalizedStat * 1.2;

  return {
    market: Math.round(baseValue),
    min: Math.round(baseValue * 0.85),
    max: Math.round(baseValue * 1.30)
  };
}

function updatePlayerSalaries(filename, leagueKey) {
  const filepath = path.join(__dirname, '..', 'data', filename);
  const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  const leagueConfig = LEAGUE_CONFIG[leagueKey];
  const statKey = leagueConfig.statKey;

  for (const [position, players] of Object.entries(data)) {
    players.forEach(player => {
      const marketValue = calculateMarketValue(player, position, leagueConfig.positions, statKey);

      player.salaryTiers = [
        {
          amount: marketValue.min,
          label: "Efficient",
          description: "85% of market value - high efficiency",
          percentile: 85,
          isRecommended: true
        },
        {
          amount: marketValue.market,
          label: "Market",
          description: "Fair market value for production",
          percentile: 100,
          isRecommended: false
        },
        {
          amount: marketValue.max,
          label: "Premium",
          description: "130% of market - overpay diminishes returns",
          percentile: 115,
          isRecommended: false
        }
      ];
    });
  }

  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  console.log(`✓ Updated ${filename}`);
}

// Run migrations
console.log('Starting salary tier migration...\n');
updatePlayerSalaries('mlb-2019-players.json', 'MLB_2019');
updatePlayerSalaries('nfl-2020-players.json', 'NFL_2020');
updatePlayerSalaries('nba-2018-players.json', 'NBA_2019');
console.log('\nAll player salaries updated successfully!');
