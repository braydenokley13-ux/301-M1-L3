// Draft engine - manages draft state and flow

class DraftEngine {
  constructor(leagueKey) {
    this.leagueKey = leagueKey;
    this.config = LEAGUE_CONFIG[leagueKey];
    this.calculator = new EfficiencyCalculator(this.config);
    this.storage = new SessionStorage();
    this.players = {};
    this.roster = {};
    this.currentPositionIndex = 0;
    this.startTime = Date.now();
    this.draftHistory = [];
  }

  async initialize() {
    await this.loadPlayers();
    this.initializeRoster();
  }

  async loadPlayers() {
    const dataFile = this.leagueKey === 'MLB_2019' ? 'mlb-2019-players.json' :
                     this.leagueKey === 'NFL_2020' ? 'nfl-2020-players.json' :
                     'nba-2018-players.json';

    const data = await loadJSON(`data/${dataFile}`);
    this.players = data;
  }

  initializeRoster() {
    for (const position of this.config.draftOrder) {
      this.roster[position] = { player: null, salary: 0, winContribution: 0 };
    }
  }

  startDraft() {
    document.getElementById('scenario-title').textContent = this.config.displayName;
    this.updateUI();
    this.displayAvailablePlayers();
  }

  selectPlayer(playerId, salary) {
    const currentPosition = this.config.draftOrder[this.currentPositionIndex];
    const player = this.findPlayerById(playerId);

    if (!player) return;

    // Check if player accepts the offer
    if (!this.playerAcceptsOffer(player, salary, currentPosition)) {
      showToast(`${player.name} rejected your offer of ${formatCurrency(salary, true)}. Try a higher tier!`, 'warning');
      return;
    }

    const winContribution = this.calculator.calculateWinContribution(player, salary, currentPosition);

    this.roster[currentPosition] = { player, salary, winContribution };
    this.draftHistory.push({ position: currentPosition, player, salary });
    this.currentPositionIndex++;

    this.updateUI();

    // Update efficiency chart
    this.updateEfficiencyFrontierChart();

    if (this.currentPositionIndex < this.config.draftOrder.length) {
      this.displayAvailablePlayers();
    } else {
      this.enableSubmit();
    }
  }

  findPlayerById(playerId) {
    for (const position of Object.keys(this.players)) {
      const found = this.players[position].find(p => p.id === playerId);
      if (found) return found;
    }
    return null;
  }

  /**
   * Determine if a player accepts the contract offer
   * Uses simple AI logic based on offer tier and player quality
   * @param {Object} player - Player object
   * @param {number} salary - Offered salary
   * @param {string} position - Position code
   * @returns {boolean} True if player accepts
   */
  playerAcceptsOffer(player, salary, position) {
    // Find which tier this salary corresponds to
    const tierIndex = player.salaryTiers.findIndex(tier => tier.amount === salary);
    if (tierIndex === -1) return false;

    const tier = player.salaryTiers[tierIndex];

    // Calculate player's relative quality (0-1 scale)
    const stat = this.calculator.getPlayerStat(player, position);
    const posConfig = this.config.positions[position];
    const playerQuality = Math.min(stat / posConfig.positionMax, 1.0);

    // Base acceptance rates by tier
    let baseAcceptanceRate;
    if (tier.label === "Premium") {
      baseAcceptanceRate = 0.99; // Almost always accept overpay
    } else if (tier.label === "Market") {
      baseAcceptanceRate = 0.85; // Usually accept fair market
    } else { // Efficient (below market)
      baseAcceptanceRate = 0.65; // Sometimes reject lowball offers
    }

    // Elite players (quality > 0.8) are pickier about efficient tier
    if (tier.label === "Efficient" && playerQuality > 0.8) {
      baseAcceptanceRate -= 0.20; // Elite players more likely to reject low offers
    }

    // Add some randomness for realism
    const random = Math.random();
    return random < baseAcceptanceRate;
  }

  undoLastPick() {
    if (this.draftHistory.length === 0) return;

    const last = this.draftHistory.pop();
    this.roster[last.position] = { player: null, salary: 0, winContribution: 0 };
    this.currentPositionIndex--;

    this.updateUI();
    this.displayAvailablePlayers();
  }

  updateUI() {
    this.updateBudget();
    this.updateRoster();
    this.updateMetrics();
    this.updateButtons();
  }

  updateBudget() {
    const totalSpent = calculateTotalSalary(this.roster);
    const total = this.config.budget.total || totalSpent * 2;
    const remaining = this.config.budget.hard ? Math.max(0, this.config.budget.total - totalSpent) : total;

    document.getElementById('budget-total').textContent = this.config.budget.total ? formatCurrency(total, true) : 'Unlimited';
    document.getElementById('budget-spent').textContent = formatCurrency(totalSpent, true);
    document.getElementById('budget-remaining').textContent = this.config.budget.hard ? formatCurrency(remaining, true) : '-';
  }

  updateRoster() {
    const rosterDisplay = document.getElementById('roster-display');
    const html = [];

    for (const position of this.config.draftOrder) {
      const selection = this.roster[position];
      const filled = selection.player !== null;

      html.push('<div class="roster-slot' + (filled ? ' filled' : '') + '">');
      html.push('<div class="roster-position-label">' + this.config.positions[position].name + '</div>');

      if (filled) {
        html.push('<div class="roster-player-name">' + selection.player.name + '</div>');
        html.push('<div class="roster-player-salary">' + formatCurrency(selection.salary, true) + '</div>');
      } else {
        html.push('<div class="text-muted text-sm">Empty</div>');
      }

      html.push('</div>');
    }

    rosterDisplay.innerHTML = html.join('');
  }

  updateMetrics() {
    const totalSpent = calculateTotalSalary(this.roster);
    const metrics = this.calculator.calculateRosterEfficiency(this.roster, totalSpent);

    document.getElementById('metric-wins').textContent = metrics.totalWins.toFixed(1);
    document.getElementById('metric-efficiency').textContent = metrics.efficiency > 0 ?
      formatPercent(metrics.efficiency / 100) : '-';

    const currentPosition = this.config.draftOrder[this.currentPositionIndex];
    if (currentPosition) {
      document.getElementById('current-position').textContent =
        'Select ' + this.config.positions[currentPosition].name;
      document.getElementById('position-progress').textContent =
        this.currentPositionIndex + ' of ' + this.config.draftOrder.length + ' selected';
    } else {
      document.getElementById('current-position').textContent = 'Draft Complete';
      document.getElementById('position-progress').textContent =
        this.config.draftOrder.length + ' of ' + this.config.draftOrder.length + ' selected';
    }
  }

  updateButtons() {
    document.getElementById('undo-btn').disabled = this.draftHistory.length === 0;
    document.getElementById('submit-btn').disabled = this.currentPositionIndex < this.config.draftOrder.length;
  }

  displayAvailablePlayers() {
    const currentPosition = this.config.draftOrder[this.currentPositionIndex];
    const playerGrid = document.getElementById('player-grid');

    if (!currentPosition || !this.players[currentPosition]) {
      playerGrid.innerHTML = '<p class="text-center text-muted">No players available</p>';
      return;
    }

    const players = this.players[currentPosition];
    const html = players.map(player => this.renderPlayerCard(player, currentPosition));
    playerGrid.innerHTML = html.join('');
  }

  renderPlayerCard(player, position) {
    const primaryStat = this.calculator.getPlayerStat(player, position);
    const rating = getStarRating(player.salaryTiers[0].percentile || 50);

    const tiers = player.salaryTiers.map(tier => {
      const recommendedClass = tier.isRecommended ? ' tier-recommended' : '';
      const recommendedBadge = tier.isRecommended ?
        '<span class="tier-badge">⚡ Recommended</span>' : '';

      return '<div class="tier-option' + recommendedClass + '" onclick="selectPlayer(\'' + player.id + '\', ' + tier.amount + ')">' +
        recommendedBadge +
        '<div class="tier-info">' +
        '<div class="tier-amount">' + formatCurrency(tier.amount, true) + '</div>' +
        '<div class="tier-label">' + tier.label + '</div>' +
        '<div class="tier-description">' + tier.description + '</div>' +
        '</div></div>';
    }).join('');

    return '<div class="player-card">' +
      '<div class="player-card-header">' +
      '<div>' +
      '<div class="player-name">' + player.name + '</div>' +
      '<div class="player-team">' + player.team + ' | ' + (player.season || this.config.name) + '</div>' +
      '</div>' +
      '<div class="player-rating">' + rating + '</div>' +
      '</div>' +
      '<div class="player-stats">' +
      '<div class="stat-item">' +
      '<div class="stat-label">' + this.config.statName + '</div>' +
      '<div class="stat-value">' + primaryStat.toFixed(1) + '</div>' +
      '</div>' +
      '</div>' +
      '<div class="salary-tiers">' + tiers + '</div>' +
      (player.context ? '<div class="player-context">' + player.context + '</div>' : '') +
      '</div>';
  }

  filterAndSortPlayers() {
    this.displayAvailablePlayers();
  }

  enableSubmit() {
    document.getElementById('submit-btn').disabled = false;
    showToast('Draft complete! Review your roster and submit when ready.', 'success');
  }

  /**
   * Update efficiency frontier visualization
   */
  updateEfficiencyFrontierChart() {
    if (!window.chartManager) return;

    const studentData = this.buildCumulativeData();
    const optimalData = this.buildOptimalFrontierData();

    chartManager.updateEfficiencyChart(studentData, optimalData);
  }

  /**
   * Build cumulative spending/wins data for student's selections
   */
  buildCumulativeData() {
    const points = [];
    let cumulativeSpent = 0;
    let cumulativeWins = 0;

    for (const position of this.config.draftOrder) {
      const selection = this.roster[position];
      if (selection.player && selection.salary) {
        cumulativeSpent += selection.salary;
        cumulativeWins += selection.winContribution;
        points.push({
          spending: cumulativeSpent / 1000000,
          wins: cumulativeWins
        });
      }
    }

    return {
      labels: points.map(p => p.spending.toFixed(1)),
      values: points.map(p => p.wins.toFixed(2))
    };
  }

  /**
   * Build optimal frontier curve based on efficiency thresholds
   */
  buildOptimalFrontierData() {
    const points = [];
    let totalSpent = 0;
    let totalWins = 0;

    for (const position of this.config.draftOrder) {
      const posConfig = this.config.positions[position];

      // Optimal point: 80% of efficiency threshold for ~85% of max production
      const optimalSalary = posConfig.efficiencyThreshold * 0.8;
      const optimalWins = (posConfig.positionWeight * 100 * 0.85);

      totalSpent += optimalSalary;
      totalWins += optimalWins;

      points.push({
        spending: totalSpent / 1000000,
        wins: totalWins
      });
    }

    return {
      labels: points.map(p => p.spending.toFixed(1)),
      values: points.map(p => p.wins.toFixed(2))
    };
  }

  submitRoster() {
    const totalSpent = calculateTotalSalary(this.roster);
    const timeSpent = Date.now() - this.startTime;
    const metrics = this.calculator.calculateRosterEfficiency(this.roster, totalSpent);
    const scores = this.calculator.calculateScore(metrics, timeSpent);

    const results = {
      league: this.leagueKey,
      roster: this.roster,
      metrics,
      scores,
      time: timeSpent,
      score: scores.total
    };

    this.storage.completeScenario(this.leagueKey, results);
    window.location.href = 'results.html?league=' + this.leagueKey;
  }
}
