# Efficiency Frontier Interactive Activity - Implementation Plan

## Overview
Build "The GM Challenge" - an interactive web activity where students act as sports GMs in 2018-2020, experiencing diminishing returns and the efficiency frontier through hands-on roster building with **real players**.

## Activity Concept

**Name**: The GM Challenge - Master the Efficiency Frontier

**Duration**: 15-20 minutes

**Core Mechanic**: Students draft real players from historical rosters (2018-2020 era) to build a 5-player roster. Each player has real performance stats (WAR/EPA/PER) and contract values at different price points. Students see real-time efficiency feedback via dynamic charts showing how their spending translates to wins. They progress through 3 league scenarios (MLB, NFL, NBA) with different cap structures.

**Learning Goals**:
1. Experience diminishing returns through allocation decisions
2. Identify the efficiency frontier visually
3. Understand league-specific constraints (no cap, hard cap, luxury tax)
4. Learn when spending stops creating value

## User Flow

```
1. Tutorial (2-3 min) → Interactive intro: "Draft 3 players, see efficiency in action"
2. MLB Scenario (5-6 min) → "It's 2019. No cap. Draft 5 players. Don't overspend."
3. NFL Scenario (5-6 min) → "It's 2020. $198M cap. Make tough choices."
4. NBA Scenario (5-6 min) → "It's 2018. Luxury tax. Is spending worth the penalty?"
5. Results (2-3 min) → Score, badges, comparison to optimal rosters, insights
```

**Draft Flow Per Scenario**:
1. View position to fill (e.g., "Select your Starting Pitcher")
2. Browse 15-20 available players with stats and salary tiers
3. Select player → Added to roster, budget updates
4. Repeat for all 5 positions
5. See real-time efficiency curve update with each selection
6. Submit roster when complete → Scoring and feedback

## Player Data Sourcing & Selection Criteria

### Data Sources
- **MLB**: Baseball Reference (baseball-reference.com) - 2019 season WAR
- **NFL**: Pro Football Reference (pro-football-reference.com) - 2020 season EPA
- **NBA**: Basketball Reference (basketball-reference.com) - 2018-19 season PER/WS

### Player Selection Criteria (Per Position)

**Goal**: 15-20 players per position with diverse performance tiers

**MLB 2019 Positions**:
- **SP (Starting Pitchers)**: WAR range 2.0-8.0 (mix of aces, solid starters, back-end)
  - Elite: Cole (7.4), Verlander (6.5), deGrom (6.6), Scherzer (5.4)
  - Good: Greinke (4.7), Ryu (4.8), Flaherty (5.5), Bieber (5.1)
  - Solid: Giolito (4.7), Berrios (3.4), Marquez (3.8)
- **RP (Relief Pitchers)**: WAR 1.0-3.5
- **SS (Shortstops)**: WAR 2.0-7.0 (Lindor, Turner, Story, Baez, Semien)
- **OF (Outfielders)**: WAR 3.0-8.5 (Trout, Betts, Yelich, Bellinger, Acuna)
- **DH (Designated Hitters)**: WAR 1.5-6.0 (Cruz, Martinez, Alvarez)

**NFL 2020 Positions**:
- **QB**: EPA range 50-145 (elite to solid starters)
  - Elite: Rodgers (142.5), Mahomes (138.2), Allen (130.1)
  - Good: Wilson (110.4), Tannehill (95.2), Brady (88.7)
  - Solid: Herbert (82.3), Cousins (75.6), Carr (70.2)
- **LT (Left Tackle)**: Pass block win rate + EPA
- **EDGE (Edge Rushers)**: Pass rush win rate + EPA
- **WR (Wide Receivers)**: EPA range 20-100
- **CB (Cornerbacks)**: EPA allowed (inverse - lower is better)

**NBA 2018-19 Positions**:
- **PG**: PER range 15-27 (Curry 27.5, Westbrook 23.5, Lillard 23.1)
- **SG**: PER range 16-30 (Harden 30.6, Beal 21.9, McCollum 19.8)
- **SF**: PER range 15-27 (George 22.4, Durant 24.7, Kawhi 26.0)
- **PF**: PER range 16-28 (Giannis 28.3, Davis 27.7, Griffin 21.4)
- **C**: PER range 18-31 (Jokic 26.4, Embiid 26.8, Towns 23.8)

### Salary Tier Philosophy

Each player gets 2-3 salary tiers to create trade-off decisions:

**3-Tier System** (for top players):
- **Value Tier**: Below market rate (~70-80% of market) - Efficiency sweet spot
- **Market Tier**: Fair market value (~100% of market) - Near frontier
- **Premium Tier**: Overpay (~120-140% of market) - Past frontier, teaches diminishing returns

**2-Tier System** (for mid/lower tier players):
- **Value Tier**: Below market rate
- **Market Tier**: Fair market value

Example:
```javascript
{
  name: "Patrick Mahomes",
  epa: 138.2,
  salaryTiers: [
    { amount: 25000000, label: "Value tier", description: "Rookie deal extension" },
    { amount: 35000000, label: "Market tier", description: "Fair market value" },
    { amount: 45000000, label: "Premium tier", description: "Supermax - diminishing returns" }
  ]
}

{
  name: "Ryan Tannehill",
  epa: 95.2,
  salaryTiers: [
    { amount: 18000000, label: "Value tier", description: "Below market" },
    { amount: 25000000, label: "Market tier", description: "Fair value for production" }
  ]
}
```

This creates meaningful choices: "Pay premium for Mahomes or get similar value from Rodgers at market rate?"

### Example Player Pools (Concrete Reference)

**MLB 2019 - Starting Pitchers (15-20 players)**:
1. Gerrit Cole (HOU) - WAR 7.4 - Tiers: $20M, $32M, $45M
2. Jacob deGrom (NYM) - WAR 6.6 - Tiers: $18M, $28M, $40M
3. Justin Verlander (HOU) - WAR 6.5 - Tiers: $19M, $30M, $43M
4. Max Scherzer (WSH) - WAR 5.4 - Tiers: $22M, $35M, $48M
5. Shane Bieber (CLE) - WAR 5.1 - Tiers: $8M, $15M
6. Jack Flaherty (STL) - WAR 5.5 - Tiers: $10M, $18M
7. Zack Greinke (HOU) - WAR 4.7 - Tiers: $16M, $24M, $32M
8. Lucas Giolito (CHW) - WAR 4.7 - Tiers: $7M, $14M
9. Mike Soroka (ATL) - WAR 4.4 - Tiers: $6M, $12M
10. Jose Berrios (MIN) - WAR 3.4 - Tiers: $8M, $15M
... (5-10 more with WAR 2.0-4.0 range)

**NFL 2020 - Quarterbacks (15-20 players)**:
1. Aaron Rodgers (GB) - EPA 142.5 - Tiers: $22M, $33M, $42M
2. Patrick Mahomes (KC) - EPA 138.2 - Tiers: $25M, $35M, $45M
3. Josh Allen (BUF) - EPA 130.1 - Tiers: $18M, $28M, $38M
4. Russell Wilson (SEA) - EPA 110.4 - Tiers: $20M, $32M, $40M
5. Ryan Tannehill (TEN) - EPA 95.2 - Tiers: $18M, $25M
6. Tom Brady (TB) - EPA 88.7 - Tiers: $15M, $25M, $33M
7. Justin Herbert (LAC) - EPA 82.3 - Tiers: $8M, $15M (rookie deal)
8. Kirk Cousins (MIN) - EPA 75.6 - Tiers: $18M, $28M
9. Derek Carr (LV) - EPA 70.2 - Tiers: $15M, $22M
10. Matt Ryan (ATL) - EPA 68.4 - Tiers: $17M, $26M
... (5-10 more with EPA 50-70 range)

**NBA 2018-19 - Point Guards (15-20 players)**:
1. Stephen Curry (GSW) - PER 27.5, WS 9.4 - Tiers: $28M, $37M
2. Russell Westbrook (OKC) - PER 23.5, WS 8.9 - Tiers: $25M, $35M
3. Damian Lillard (POR) - PER 23.1, WS 9.7 - Tiers: $23M, $31M
4. Kyrie Irving (BOS) - PER 22.6, WS 7.4 - Tiers: $18M, $28M
5. Kemba Walker (CHA) - PER 21.2, WS 7.6 - Tiers: $16M, $24M
6. Ben Simmons (PHI) - PER 18.8, WS 6.2 - Tiers: $10M, $18M
7. Kyle Lowry (TOR) - PER 19.2, WS 8.5 - Tiers: $20M, $28M
8. Mike Conley (MEM) - PER 17.9, WS 5.8 - Tiers: $17M, $25M
9. D'Angelo Russell (BKN) - PER 18.9, WS 5.3 - Tiers: $14M, $22M
10. Jrue Holiday (NOP) - PER 18.4, WS 5.9 - Tiers: $15M, $23M
... (5-10 more with PER 15-19 range)

**Data File Format Example (mlb-2019-players.json)**:
```json
{
  "SP": [
    {
      "id": "cole-gerrit-2019",
      "name": "Gerrit Cole",
      "team": "HOU",
      "season": 2019,
      "stats": {
        "war": 7.4,
        "era": 2.50,
        "strikeouts": 326,
        "innings": 212.1
      },
      "salaryTiers": [
        {
          "amount": 20000000,
          "label": "Value tier",
          "description": "Below market - high efficiency",
          "percentile": 70
        },
        {
          "amount": 32000000,
          "label": "Market tier",
          "description": "Fair value for elite production",
          "percentile": 90
        },
        {
          "amount": 45000000,
          "label": "Premium tier",
          "description": "Overpay - diminishing returns",
          "percentile": 95
        }
      ],
      "context": "Led AL in strikeouts, signed record $324M deal with NYY after 2019"
    }
  ]
}
```

## Technical Architecture

**Stack**: Vanilla JavaScript + Chart.js + Modern CSS
- No build process required for GitHub Pages
- Fast, maintainable, responsive

**File Structure**:
```
/
├── index.html                  # Landing, tutorial, activity launcher
├── activity.html               # Draft interface (all 3 scenarios)
├── results.html                # Results dashboard with player comparisons
├── css/
│   ├── main.css               # Global styles, variables, reset
│   ├── activity.css           # Draft layout, player cards, roster display
│   ├── player-card.css        # Player card component styling
│   └── charts.css             # Chart customizations
├── js/
│   ├── config.js              # Position configs, efficiency thresholds
│   ├── calculator.js          # Player-based efficiency calculations
│   ├── draft-engine.js        # Draft flow, player selection, roster management
│   ├── player-card.js         # Player card component (stats, tier selection)
│   ├── chart-manager.js       # Chart.js wrapper for real-time updates
│   ├── storage.js             # LocalStorage persistence
│   └── utils.js               # Utility functions, formatters
├── data/
│   ├── mlb-2019-players.json  # ~75-100 MLB players with 2019 WAR
│   ├── nfl-2020-players.json  # ~75-100 NFL players with 2020 EPA
│   ├── nba-2018-players.json  # ~75-100 NBA players with 2018-19 PER/WS
│   └── optimal-rosters.json   # Pre-calculated optimal rosters for comparison
└── assets/
    ├── images/
    │   ├── player-headshots/  # Optional: Player photos (100+ files)
    │   ├── team-logos/        # MLB/NFL/NBA team logos
    │   └── icons/             # Badge icons, warning icons
    └── data-sources.md        # Documentation of data sources and methodology
```

## Data Model & Calculations

### Core Formula: Win Contribution from Real Players
```javascript
// Each player has a real performance stat (WAR, EPA, PER)
// Win contribution uses real stat but applies diminishing returns to contract value

winContribution = (playerStat / positionMax) * (1 - e^(-salary / efficiencyThreshold))

// Where:
// playerStat = actual WAR/EPA/PER from 2018-2020
// positionMax = max stat value for that position (for normalization)
// salary = player's contract value (adjusted for educational tiers)
// efficiencyThreshold = salary level where returns start diminishing
```

### Player Data Structure
```javascript
const MLB_PLAYERS = {
  SP: [ // Starting Pitchers (2019 season)
    {
      name: "Gerrit Cole",
      team: "HOU",
      war: 7.4,  // Real 2019 WAR
      salaryTiers: [
        { amount: 20000000, label: "Value tier" },
        { amount: 32000000, label: "Market tier" },
        { amount: 45000000, label: "Premium tier" }
      ]
    },
    {
      name: "Jacob deGrom",
      team: "NYM",
      war: 6.6,
      salaryTiers: [
        { amount: 18000000, label: "Value tier" },
        { amount: 28000000, label: "Market tier" },
        { amount: 40000000, label: "Premium tier" }
      ]
    },
    {
      name: "Justin Verlander",
      team: "HOU",
      war: 6.5,
      salaryTiers: [
        { amount: 19000000, label: "Value tier" },
        { amount: 30000000, label: "Market tier" },
        { amount: 43000000, label: "Premium tier" }
      ]
    },
    // ... 12-17 more SPs with varying WAR and tier pricing
  ],
  RP: [ /* Relief pitchers with WAR */ ],
  SS: [ /* Shortstops with WAR */ ],
  OF: [ /* Outfielders with WAR */ ],
  DH: [ /* Designated hitters with WAR */ ]
};

const NFL_PLAYERS = {
  QB: [ // Quarterbacks (2020 season)
    {
      name: "Patrick Mahomes",
      team: "KC",
      epa: 138.2,  // Real 2020 Total EPA
      salaryTiers: [
        { amount: 25000000, label: "Rookie deal extension" },
        { amount: 35000000, label: "Market tier" },
        { amount: 45000000, label: "Supermax tier" }
      ]
    },
    {
      name: "Aaron Rodgers",
      team: "GB",
      epa: 142.5,
      salaryTiers: [
        { amount: 22000000, label: "Value tier" },
        { amount: 33000000, label: "Market tier" },
        { amount: 42000000, label: "Premium tier" }
      ]
    },
    // ... 13-18 more QBs
  ],
  LT: [ /* Left tackles with EPA/pass block win rate */ ],
  EDGE: [ /* Edge rushers with EPA/pass rush win rate */ ],
  WR: [ /* Wide receivers with EPA */ ],
  CB: [ /* Cornerbacks with EPA allowed */ ]
};

const NBA_PLAYERS = {
  PG: [ // Point guards (2018-19 season)
    {
      name: "Stephen Curry",
      team: "GSW",
      per: 27.5,  // Real 2018-19 PER
      ws48: 0.229, // Win shares per 48 minutes
      salaryTiers: [
        { amount: 28000000, label: "Star tier" },
        { amount: 37000000, label: "Supermax tier" }
      ]
    },
    // ... 13-18 more PGs
  ],
  SG: [ /* Shooting guards */ ],
  SF: [ /* Small forwards */ ],
  PF: [ /* Power forwards */ ],
  C: [ /* Centers */ ]
};
```

### Position Configuration (for efficiency calculations)
```javascript
const NFL_POSITION_CONFIG = {
  QB: {
    positionMax: 150,  // Max EPA observed in dataset
    efficiencyThreshold: 35000000,  // Frontier at $35M
    positionWeight: 0.35  // QB contributes 35% to team success
  },
  LT: { positionMax: 80, efficiencyThreshold: 18000000, positionWeight: 0.18 },
  EDGE: { positionMax: 90, efficiencyThreshold: 22000000, positionWeight: 0.20 },
  WR: { positionMax: 120, efficiencyThreshold: 20000000, positionWeight: 0.15 },
  CB: { positionMax: 75, efficiencyThreshold: 17000000, positionWeight: 0.12 }
};
```

### Efficiency Scoring
```javascript
efficiency = totalWins / (totalSpending / optimalSpending)

// 0.9+ = Excellent (90%+ of optimal)
// 0.7-0.9 = Good
// <0.7 = Overspending
```

### Optimal Roster Calculation (With Real Players)

The optimal roster is the combination of players that maximizes wins for a given budget constraint. This requires optimization:

**Approach 1: Pre-calculated Optimal Rosters** (Recommended for performance)
```javascript
// Store pre-calculated optimal rosters for common scenarios
const OPTIMAL_ROSTERS = {
  NFL_2020: {
    "max_efficiency": {
      // Most efficient roster (doesn't use full cap)
      budget: 165000000,
      players: [
        { position: "QB", name: "Aaron Rodgers", tier: "Market", salary: 33000000 },
        { position: "LT", name: "Trent Williams", tier: "Value", salary: 18000000 },
        { position: "EDGE", name: "Myles Garrett", tier: "Market", salary: 22000000 },
        { position: "WR", name: "Michael Thomas", tier: "Value", salary: 20000000 },
        { position: "CB", name: "Jalen Ramsey", tier: "Value", salary: 18000000 }
      ],
      wins: 10.8,
      efficiency: 1.0
    },
    "cap_maximizer": {
      // Uses most of cap efficiently
      budget: 195000000,
      players: [
        { position: "QB", name: "Patrick Mahomes", tier: "Market", salary: 35000000 },
        // ... more players
      ],
      wins: 11.2,
      efficiency: 0.92
    }
  }
};

// Compare student roster to optimal
function compareToOptimal(studentRoster, scenario) {
  const optimal = OPTIMAL_ROSTERS[scenario].max_efficiency;
  const studentWins = calculateTotalWins(studentRoster);
  const optimalWins = optimal.wins;

  return {
    efficiency: studentWins / (studentRoster.totalSpending / optimal.budget),
    winDifference: optimalWins - studentWins,
    costDifference: studentRoster.totalSpending - optimal.budget,
    recommendations: generateRecommendations(studentRoster, optimal)
  };
}

// Generate specific player swap recommendations
function generateRecommendations(studentRoster, optimal) {
  const recommendations = [];

  for (let position of Object.keys(studentRoster.roster)) {
    const studentPick = studentRoster.roster[position];
    const optimalPick = optimal.players.find(p => p.position === position);

    if (studentPick.salary > optimalPick.salary) {
      const savings = studentPick.salary - optimalPick.salary;
      const winLoss = studentPick.winContribution - optimalPick.winContribution;

      recommendations.push({
        position: position,
        message: `Consider ${optimalPick.name} at $${optimalPick.salary/1e6}M instead of ${studentPick.player.name} at $${studentPick.salary/1e6}M`,
        impact: `Save $${savings/1e6}M, lose only ${winLoss.toFixed(1)} wins`,
        reason: "This move would improve your efficiency without significantly hurting win probability"
      });
    }
  }

  return recommendations;
}
```

**Approach 2: Dynamic Optimization** (More accurate but slower)
```javascript
// Use greedy algorithm to find near-optimal roster
function findOptimalRoster(playerPool, budget, scenario) {
  const roster = {};
  let remainingBudget = budget;

  // For each position, find the player/tier with best efficiency
  for (let position of ['QB', 'LT', 'EDGE', 'WR', 'CB']) {
    const candidates = playerPool[position];
    let bestChoice = null;
    let bestEfficiency = 0;

    for (let player of candidates) {
      for (let tier of player.salaryTiers) {
        if (tier.amount <= remainingBudget) {
          const winContribution = calculateWinContribution(player, tier, position);
          const efficiency = winContribution / tier.amount;

          if (efficiency > bestEfficiency) {
            bestEfficiency = efficiency;
            bestChoice = { player, tier, winContribution };
          }
        }
      }
    }

    roster[position] = bestChoice;
    remainingBudget -= bestChoice.tier.amount;
  }

  return roster;
}
```

**Usage in Results Screen**:
```javascript
// Show comparison
const comparison = compareToOptimal(studentRoster, 'NFL_2020');

// Display
"Your roster: 9.2 wins for $195M (76% efficient)"
"Optimal roster: 10.8 wins for $165M (100% efficient)"
"You spent $30M more and got 1.6 fewer wins"

// Specific recommendations
"💡 Swap Patrick Mahomes ($45M) → Aaron Rodgers ($33M)"
"   Impact: Save $12M, lose only 0.1 wins"
"💡 Upgrade Derek Carr ($22M) → Jalen Ramsey ($18M)"
"   Impact: Save $4M, gain 0.3 wins through better balance"
```

### Scenario State Object
```javascript
{
  league: 'NFL',
  year: 2020,
  budget: { total: 198000000, spent: 0, remaining: 198000000, luxuryTax: 0 },
  roster: {
    QB: {
      player: null,  // Will hold player object when selected
      salary: 0,
      winContribution: 0
    },
    LT: { player: null, salary: 0, winContribution: 0 },
    EDGE: { player: null, salary: 0, winContribution: 0 },
    WR: { player: null, salary: 0, winContribution: 0 },
    CB: { player: null, salary: 0, winContribution: 0 }
  },
  currentPosition: 'QB',  // Position being drafted
  draftOrder: ['QB', 'LT', 'EDGE', 'WR', 'CB'],
  draftComplete: false,
  metrics: {
    totalWins: 0,
    efficiency: 0,
    optimalSpending: 0,
    overcost: 0,
    optimalRoster: null  // Will show optimal player selections
  },
  timestamp: Date.now()
}
```

### Example Selected Roster
```javascript
// After student completes draft
{
  roster: {
    QB: {
      player: {
        name: "Patrick Mahomes",
        team: "KC",
        epa: 138.2,
        salaryTiers: [...]
      },
      salary: 45000000,  // Student chose Premium tier
      winContribution: 2.8  // Calculated wins from this pick
    },
    LT: {
      player: {
        name: "Trent Williams",
        team: "SF",
        epa: 72.3,
        salaryTiers: [...]
      },
      salary: 18000000,  // Student chose Value tier
      winContribution: 1.4
    },
    // ... rest of roster
  },
  metrics: {
    totalWins: 9.2,
    efficiency: 0.76,  // 76% efficient (overspent)
    optimalSpending: 145000000,
    overcost: 35000000,  // Spent $35M more than optimal
    optimalRoster: {
      QB: "Aaron Rodgers at $33M",
      LT: "Trent Williams at $18M",
      // ... shows what optimal picks would have been
    }
  }
}
```

## Visual Design

### Layout: Draft Interface
```
┌─────────────────────────────────────────────────────────────┐
│ Header: GM Challenge - NFL 2020 (2/3) | Pick 1/5: QB        │
│ Budget: $198M | Spent: $0 | Remaining: $198M                │
├─────────────────────────────────────────────────────────────┤
│ YOUR ROSTER SO FAR                                          │
│ [Empty] [Empty] [Empty] [Empty] [Empty]                    │
├──────────────────────┬──────────────────────────────────────┤
│ AVAILABLE PLAYERS    │ EFFICIENCY PREVIEW                   │
│ (Scrollable)         │                                      │
│                      │ [Line Chart]                         │
│ ┌──────────────────┐ │ Real-time efficiency curve          │
│ │ Patrick Mahomes  │ │ Updates as you hover/select         │
│ │ KC | 2020        │ │                                      │
│ │ EPA: 138.2 ⭐⭐⭐ │ │ [Bar Chart]                         │
│ │                  │ │ Your spending vs optimal            │
│ │ Tiers:           │ │                                      │
│ │ ○ $25M Value     │ │ Current Metrics:                    │
│ │ ○ $35M Market    │ │ Projected Wins: 0.0                 │
│ │ ● $45M Premium   │ │ Efficiency: --                      │
│ └──────────────────┘ │ Status: Not over frontier           │
│                      │                                      │
│ ┌──────────────────┐ │                                      │
│ │ Aaron Rodgers    │ │                                      │
│ │ GB | 2020        │ │                                      │
│ │ EPA: 142.5 ⭐⭐⭐ │ │                                      │
│ │ ...              │ │                                      │
│ │ [Select Button]  │ │                                      │
│ └──────────────────┘ │                                      │
│                      │                                      │
│ [15-20 more players] │                                      │
│                      │                                      │
└──────────────────────┴──────────────────────────────────────┘
```

### Player Card Design
```
┌────────────────────────────────────┐
│ Patrick Mahomes          [★★★★★]   │ <- Star rating from EPA
│ Kansas City Chiefs | QB | 2020     │
├────────────────────────────────────┤
│ EPA: 138.2  (Top 5%)               │ <- Real stat with percentile
│ Games: 15 | TD: 38                 │ <- Context stats
├────────────────────────────────────┤
│ Contract Tiers:                    │
│ ○ $25M - Value tier ⚡             │ <- Radio buttons
│ ○ $35M - Market tier 💰            │
│ ● $45M - Premium tier 🔥           │ <- Selected
├────────────────────────────────────┤
│ Win Contribution: +2.8             │ <- Preview at selected tier
│ Efficiency: 🟡 Near frontier       │ <- Warning if overspending
├────────────────────────────────────┤
│        [SELECT MAHOMES]            │ <- Action button
└────────────────────────────────────┘
```

### Charts
1. **Primary**: Efficiency curve (line chart) - wins vs spending
2. **Secondary**: Position allocation (horizontal bars) - color-coded efficiency
3. **Tertiary**: Efficiency gauge (0-100%) - overall performance

### Color Scheme
- Blue (#2563eb): Student's current decisions
- Green (#10b981): Optimal/efficient zone
- Yellow (#f59e0b): Approaching frontier
- Red (#ef4444): Over frontier/wasteful
- Gray (#6b7280): League average

## Scoring System (100 points per scenario, 300 total)

**Per Scenario Breakdown**:
- **Efficiency Score** (50 pts): Based on spending vs optimal
- **Strategic Decision** (30 pts): Did they identify and respect frontier?
- **Speed Bonus** (10 pts): Completed within target time
- **Comprehension** (10 pts): Post-scenario quiz questions

**Final Grades**:
- 270-300 (90%+): A - "Elite GM"
- 240-269 (80-89%): B - "Competent GM"
- 210-239 (70-79%): C - "Learning GM"
- <210 (<70%): Review recommended

**Badges**:
- "Frontier Master": Stay within 5% of optimal in all 3 scenarios
- "Cap Wizard": 95%+ efficiency in NFL scenario
- "Tax Strategist": Make profitable luxury tax decision in NBA
- "Quick Learner": Complete all scenarios under 18 minutes

## Progressive Difficulty

1. **MLB (Easy)**: No cap → Students discover diminishing returns naturally
2. **NFL (Medium)**: Hard cap → Forced trade-offs teach opportunity cost
3. **NBA (Hard)**: Luxury tax → Strategic decision-making with penalties

## League-Specific Mechanics

### MLB (2019 Season)
- Budget: Unlimited (no salary cap)
- Player Pool: 15-20 real players per position (SP, RP, SS, OF, DH)
  - Starting Pitchers: Gerrit Cole, deGrom, Verlander, Scherzer, etc.
  - Includes WAR stats from 2019 season
- Focus: Learning to recognize diminishing returns without hard constraints
- Challenge: Self-discipline to stop spending (e.g., "Is Cole at $45M worth it over Verlander at $30M?")
- Teaching Moment: "The Yankees spent $223M in 2019 and won 103 games. The Rays spent $64M and won 96 games. Efficiency matters."

### NFL (2020 Season)
- Budget: $198.2M hard cap (real 2020 cap)
- Player Pool: 15-20 real players per position (QB, LT, EDGE, WR, CB)
  - QBs: Mahomes, Rodgers, Wilson, Allen, Jackson, etc.
  - Includes EPA stats from 2020 season
- Focus: Opportunity cost and trade-offs
- Challenge: Maximize value within constraint
- Teaching Moment: "Pay Mahomes $45M and you have $153M for 4 other positions. Pay Rodgers $33M and you have $165M. Which builds a better team?"

### NBA (2018-19 Season)
- Budget: $101.9M soft cap (real 2018-19 cap)
- Luxury Tax: $123.7M threshold
- Player Pool: 15-20 real players per position (PG, SG, SF, PF, C)
  - Guards: Curry, Westbrook, Harden, Lillard, etc.
  - Includes PER/WS stats from 2018-19 season
- Focus: Tax strategy and marginal value
- Tax Calculation: Progressive rates (1.5x first tier, escalating)
- Challenge: Is paying tax worth the wins?
- Teaching Moment: "Warriors paid $37M in luxury tax in 2019. Was that championship worth it?"

## Data Persistence

**LocalStorage Schema**:
```javascript
{
  studentId: "uuid",
  startTime: timestamp,
  scenarios: {
    mlb: { completed: true, score: 85, time: 342, data: {...} },
    nfl: { completed: true, score: 78, time: 389, data: {...} },
    nba: { completed: false, score: 0, time: 0, data: null }
  },
  totalScore: 163,
  badges: ["Frontier Master"],
  attempts: 1
}
```

**Features**:
- Auto-save every 10 seconds
- Resume capability if student leaves
- Retry individual scenarios
- Download results as JSON

## Educational Features

**Real-time Feedback (During Draft)**:
- Player comparison tooltips: "Mahomes at $45M vs Rodgers at $33M: +0.2 wins for $12M more"
- Warning badges on player cards: "⚠️ Premium tier - diminishing returns"
- Efficiency preview: Chart updates as you hover over salary tiers
- Smart suggestions: "💡 Consider Rodgers at Market tier - 95% of Mahomes' value at 73% of the cost"

**Post-Scenario Insights (Concrete Examples)**:
- "You drafted Patrick Mahomes at $45M (Premium tier)"
- "Aaron Rodgers had similar EPA (142.5 vs 138.2) and cost $33M (Market tier)"
- "That $12M difference only yielded 0.3 additional wins"
- "If you'd drafted Rodgers + upgraded CB, you'd have 1.2 more wins"
- Shows optimal roster: "Rodgers ($33M) + Williams ($18M) + Garrett ($22M) + Thomas ($20M) + Ramsey ($18M) = 11.5 wins"

**Real Player Context (During Selection)**:
- 2020 performance: "Mahomes led KC to Super Bowl LV, 38 TDs, 4,740 yards"
- Contract reality: "In real life, Mahomes signed 10yr/$450M in 2020 ($45M AAV)"
- Peer comparison: "Top 5 QB by EPA in 2020: Rodgers (142.5), Mahomes (138.2), Allen (130.1)"
- Historical context: "2020 cap was $198M. Teams averaged $30M on QB position."

**Teachable Moments**:
- After overspending: "You spent $195M and won 9.2 games. The optimal roster ($165M) would win 10.8 games. The extra $30M actually hurt your roster balance."
- After efficient draft: "Excellent! You built a 10.5-win roster for $168M. You identified the efficiency frontier and stayed on it."
- Smart picks: "Great choice - Trent Williams at Value tier ($18M). His 72.3 EPA is top-10, and you paid below market rate."

## Accessibility

- Keyboard navigation (Tab, Enter, Arrow keys for sliders)
- ARIA labels on all interactive elements
- Color blind friendly (patterns + colors)
- Mobile responsive (breakpoints: 768px, 1024px)
- Large touch targets (44x44px minimum)
- Screen reader support

## Implementation Steps

### Phase 1: Player Data Collection & Setup (3-4 hours)
1. Research and collect real player stats for 2018-2020
   - MLB 2019: WAR data for ~75-100 players across 5 positions
   - NFL 2020: EPA data for ~75-100 players across 5 positions
   - NBA 2018-19: PER/WS data for ~75-100 players across 5 positions
2. Create player data JSON files with stats, teams, and salary tiers
3. Verify data accuracy against Baseball Reference, Pro Football Reference, Basketball Reference
4. Build position configuration with max values and efficiency thresholds

### Phase 2: Core Structure (2-3 hours)
1. Create HTML pages (index, activity, results)
2. Set up CSS architecture for draft interface
   - Player card styling
   - Draft board layout
   - Roster display
3. Initialize Chart.js integration
4. Build basic navigation flow between pages

### Phase 3: Data Layer (2-3 hours)
1. Create config.js with league/position configurations
2. Load and parse player JSON files
3. Implement calculator.js with player-based efficiency formulas
4. Build storage.js for LocalStorage management

### Phase 4: Draft Engine (4-5 hours) **Most Complex**
1. Build draft-engine.js with state management
2. Create player card component with stat display and tier selection
3. Implement player filtering and sorting (by stat, salary, team)
4. Build draft selection flow:
   - Display available players for current position
   - Handle tier selection
   - Add to roster
   - Update budget
   - Progress to next position
5. Add budget constraints (hard cap for NFL, luxury tax for NBA)
6. Implement "undo" functionality to change previous picks

### Phase 5: Visualization (2-3 hours)
1. Build chart-manager.js wrapper for Chart.js
2. Create efficiency curve chart that updates with each pick
3. Build roster spending breakdown chart
4. Add efficiency gauge component
5. Implement hover previews (show impact before selecting)

### Phase 6: Scoring & Results (2-3 hours)
1. Implement scoring algorithm with optimal roster calculation
2. Build results dashboard showing:
   - Your roster vs optimal roster
   - Player-by-player comparison
   - "What if" scenarios (if you'd picked X instead of Y)
3. Create badge system
4. Add downloadable results with player details

### Phase 7: Educational Features (2-3 hours)
1. Add player comparison tooltips
2. Create post-scenario insight generator with real player examples
3. Add historical context and real contract info
4. Build interactive tutorial with real players
5. Implement smart suggestions during draft

### Phase 8: Polish & Testing (2-3 hours)
1. Responsive design testing (mobile, tablet, desktop)
2. Test draft flow with all leagues
3. Verify player stat accuracy
4. Accessibility audit (keyboard nav, screen readers)
5. Performance optimization (lazy load player images, cache data)
6. Edge case handling (what if user picks all premium tier?)

## Critical Files to Implement

1. **data/mlb-2019-players.json** - ~75-100 MLB players with 2019 WAR stats, teams, salary tiers
2. **data/nfl-2020-players.json** - ~75-100 NFL players with 2020 EPA stats, teams, salary tiers
3. **data/nba-2018-players.json** - ~75-100 NBA players with 2018-19 PER/WS stats, teams, salary tiers
4. **js/calculator.js** - Player-based efficiency calculations (uses real stats + salary tiers)
5. **js/config.js** - Position configurations and efficiency thresholds per league
6. **js/draft-engine.js** - Draft flow state management, player selection, roster building
7. **js/chart-manager.js** - Chart.js integration for real-time efficiency visualization
8. **activity.html** - Draft interface with player cards, roster display, charts
9. **css/activity.css** - Player card styling, draft board layout, roster display
10. **js/player-card.js** - Reusable player card component with stats and tier selection

## Verification & Testing

**End-to-End Test Flow**:
1. Load index.html → Tutorial with real players (simplified 3-pick draft)
2. Complete tutorial → Advance to MLB 2019 scenario
3. Draft position 1 (SP): Browse ~15-20 starting pitchers
   - Verify all players show correct 2019 WAR stats
   - Hover over Gerrit Cole at Premium tier → Chart previews impact
   - Select Cole at Premium ($45M) → Warning shows "diminishing returns"
4. Draft positions 2-5 → Complete MLB roster
5. Submit roster → Score calculated, insights show:
   - "You picked Cole at $45M but deGrom at $28M has similar WAR (7.4 vs 6.6)"
   - "That $17M difference only yielded 0.4 additional wins"
6. Advance to NFL 2020 scenario
7. Test hard cap: Try to draft all premium tier → Should block after exceeding $198.2M
8. Draft efficient NFL roster → Complete successfully
9. Advance to NBA 2018-19 scenario
10. Test luxury tax: Draft roster over $123.7M → Tax calculated and displayed
11. Complete NBA → Results page shows:
    - All 3 rosters with real player names
    - Optimal rosters for comparison
    - Badges earned
12. Download results → JSON contains all player selections and stats
13. Refresh page → Progress persists, can resume draft
14. Test on mobile → Player cards stack, charts resize
15. Test keyboard navigation → Can tab through players, select with Enter

**Player Data Validation**:
- Cross-reference 10 random players per league against official stats sites
- Verify WAR/EPA/PER values match 2018-2020 seasons
- Check team affiliations are correct for that year
- Ensure salary tiers are realistic and create meaningful trade-offs

**Calculation Validation**:
- Test efficiency formula with known player combinations
- Example: Mahomes ($45M, EPA 138.2) should yield less efficiency than Rodgers ($33M, EPA 142.5)
- Verify diminishing returns curve flattens correctly
- Check optimal roster calculation produces sensible results

**Math Verification Examples**:
```javascript
// Test case 1: Premium tier should show diminishing returns
selectPlayer("Patrick Mahomes", "Premium", 45000000)
// Expected: winContribution ≈ 2.8, efficiency warning displayed

// Test case 2: Value tier should show high efficiency
selectPlayer("Aaron Rodgers", "Value", 33000000)
// Expected: winContribution ≈ 2.7, efficiency "optimal" badge

// Test case 3: NFL hard cap enforcement
totalSpending = 198200000
trySelectPlayer("Premium tier player that would exceed cap")
// Expected: Button disabled, error message "Would exceed cap"

// Test case 4: NBA luxury tax calculation
rosterOver = { spending: 135000000 } // $11.3M over $123.7M threshold
calculateLuxuryTax(rosterOver)
// Expected: tax ≈ $16.95M (1.5x first tier)
```

**Edge Cases**:
- User picks all Value tier → Should succeed with high efficiency score
- User picks all Premium tier → NFL should block due to cap, MLB should work but score poorly
- User tries to skip a position → Should be blocked until all 5 positions filled
- User refreshes mid-draft → Should resume at current position
- Player data fails to load → Show error message, don't crash

## Success Criteria

✅ Students can complete all 3 scenarios in 15-20 minutes
✅ Charts update in real-time as sliders move (<16ms latency)
✅ Efficiency frontier is clearly visible and intuitive
✅ Scoring accurately reflects efficiency decisions
✅ Works on mobile, tablet, and desktop browsers
✅ Progress persists across page reloads
✅ Educational insights are actionable and clear
✅ Activity is engaging and teaches the concept effectively

## Deployment

1. Commit all files to repository
2. Push to `claude/efficiency-frontier-lesson-LxIwb` branch
3. Enable GitHub Pages in repository settings
4. Set source to branch: `claude/efficiency-frontier-lesson-LxIwb`
5. Access at: `https://[username].github.io/301-M1-L3/`

---

**Estimated Total Implementation Time**: 20-28 hours
- Player data collection: +4-6 hours (researching stats, organizing data)
- Draft UI complexity: +2-3 hours (player cards vs simple sliders)
- Testing with real data: +2-3 hours (verifying accuracy, edge cases)

**Key Innovation**: Students don't just learn about the efficiency frontier—they **experience** it through concrete decisions:
- "Do I pay $45M for Mahomes or $33M for Rodgers?"
- "Cole at $45M only gives me 0.4 more wins than deGrom at $28M"
- "That extra $17M could upgrade my shortstop instead"

**Using real players transforms abstract concepts into tangible trade-offs that students will remember.**
