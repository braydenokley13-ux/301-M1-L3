// LocalStorage management for session persistence

class SessionStorage {
  constructor() {
    this.storageKey = 'gmChallenge_session';
    this.session = this.loadSession();
  }

  /**
   * Load session from LocalStorage or create new one
   * @returns {Object} Session object
   */
  loadSession() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing session:', e);
      }
    }

    return this.createNewSession();
  }

  /**
   * Create a new session object
   * @returns {Object} New session
   */
  createNewSession() {
    return {
      studentId: this.generateId(),
      startTime: Date.now(),
      scenarios: {
        MLB_2019: {
          completed: false,
          score: 0,
          time: 0,
          data: null,
          attempts: 0
        },
        NFL_2020: {
          completed: false,
          score: 0,
          time: 0,
          data: null,
          attempts: 0
        },
        NBA_2019: {
          completed: false,
          score: 0,
          time: 0,
          data: null,
          attempts: 0
        }
      },
      currentScenario: null,
      totalScore: 0,
      badges: [],
      attempts: 1,
      tutorialCompleted: false
    };
  }

  /**
   * Generate a unique session ID
   * @returns {string} UUID
   */
  generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Save session to LocalStorage
   */
  saveSession() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.session));
      return true;
    } catch (e) {
      console.error('Error saving session:', e);
      return false;
    }
  }

  /**
   * Update current scenario state
   * @param {string} league - League identifier
   * @param {Object} state - Scenario state
   */
  updateScenarioState(league, state) {
    if (!this.session.scenarios[league]) {
      console.error('Invalid league:', league);
      return;
    }

    this.session.scenarios[league].data = {
      ...state,
      lastUpdated: Date.now()
    };
    this.session.currentScenario = league;
    this.saveSession();
  }

  /**
   * Complete a scenario and save results
   * @param {string} league - League identifier
   * @param {Object} results - Scenario results
   */
  completeScenario(league, results) {
    if (!this.session.scenarios[league]) {
      console.error('Invalid league:', league);
      return;
    }

    const scenario = this.session.scenarios[league];
    scenario.completed = true;
    scenario.score = results.score || 0;
    scenario.time = results.time || 0;
    scenario.data = results;
    scenario.attempts = (scenario.attempts || 0) + 1;

    // Update total score
    this.updateTotalScore();

    // Check for badges
    this.checkBadges();

    this.saveSession();
  }

  /**
   * Update total score across all scenarios
   */
  updateTotalScore() {
    this.session.totalScore = Object.values(this.session.scenarios)
      .reduce((sum, scenario) => sum + (scenario.score || 0), 0);
  }

  /**
   * Check and award badges
   */
  checkBadges() {
    const badges = [];
    const scenarios = this.session.scenarios;

    // Frontier Master: 95%+ efficiency in all scenarios
    const allEfficient = Object.values(scenarios).every(s =>
      s.completed && s.data && s.data.efficiency >= 0.95
    );
    if (allEfficient && !this.session.badges.includes('frontierMaster')) {
      badges.push('frontierMaster');
    }

    // Cap Wizard: 95%+ efficiency in NFL
    if (scenarios.NFL_2020.completed &&
        scenarios.NFL_2020.data &&
        scenarios.NFL_2020.data.efficiency >= 0.95 &&
        !this.session.badges.includes('capWizard')) {
      badges.push('capWizard');
    }

    // Tax Strategist: Smart luxury tax decision in NBA
    if (scenarios.NBA_2019.completed &&
        scenarios.NBA_2019.data &&
        scenarios.NBA_2019.data.efficiency >= 0.90 &&
        !this.session.badges.includes('taxStrategist')) {
      badges.push('taxStrategist');
    }

    // Quick Learner: Complete all scenarios under 18 minutes
    const totalTime = Object.values(scenarios)
      .reduce((sum, s) => sum + (s.time || 0), 0);
    if (totalTime < 1080000 &&
        Object.values(scenarios).every(s => s.completed) &&
        !this.session.badges.includes('quickLearner')) {
      badges.push('quickLearner');
    }

    // Add new badges
    this.session.badges = [...new Set([...this.session.badges, ...badges])];
  }

  /**
   * Get current scenario data
   * @param {string} league - League identifier
   * @returns {Object|null} Scenario data
   */
  getScenarioData(league) {
    return this.session.scenarios[league]?.data || null;
  }

  /**
   * Check if scenario is completed
   * @param {string} league - League identifier
   * @returns {boolean}
   */
  isScenarioCompleted(league) {
    return this.session.scenarios[league]?.completed || false;
  }

  /**
   * Reset a specific scenario
   * @param {string} league - League identifier
   */
  resetScenario(league) {
    if (this.session.scenarios[league]) {
      this.session.scenarios[league] = {
        completed: false,
        score: 0,
        time: 0,
        data: null,
        attempts: this.session.scenarios[league].attempts
      };
      this.updateTotalScore();
      this.saveSession();
    }
  }

  /**
   * Reset entire session
   */
  resetSession() {
    this.session = this.createNewSession();
    this.saveSession();
  }

  /**
   * Export session data as JSON
   * @returns {string} JSON string
   */
  exportData() {
    return JSON.stringify(this.session, null, 2);
  }

  /**
   * Download session data as file
   */
  downloadData() {
    const data = this.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gm-challenge-results-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Get session summary
   * @returns {Object} Summary object
   */
  getSummary() {
    const completed = Object.values(this.session.scenarios)
      .filter(s => s.completed).length;
    const totalTime = Object.values(this.session.scenarios)
      .reduce((sum, s) => sum + (s.time || 0), 0);

    return {
      studentId: this.session.studentId,
      totalScore: this.session.totalScore,
      scenariosCompleted: completed,
      totalTime,
      badges: this.session.badges,
      grade: this.calculateGrade(),
      efficiency: this.getAverageEfficiency()
    };
  }

  /**
   * Calculate letter grade
   * @returns {string} Letter grade
   */
  calculateGrade() {
    const score = this.session.totalScore;
    if (score >= 270) return 'A';
    if (score >= 240) return 'B';
    if (score >= 210) return 'C';
    if (score >= 180) return 'D';
    return 'F';
  }

  /**
   * Get average efficiency across completed scenarios
   * @returns {number} Average efficiency
   */
  getAverageEfficiency() {
    const completed = Object.values(this.session.scenarios)
      .filter(s => s.completed && s.data);

    if (completed.length === 0) return 0;

    const sum = completed.reduce((total, s) =>
      total + (s.data.efficiency || 0), 0);
    return Math.round((sum / completed.length) * 100) / 100;
  }

  /**
   * Mark tutorial as completed
   */
  completeTutorial() {
    this.session.tutorialCompleted = true;
    this.saveSession();
  }

  /**
   * Check if tutorial is completed
   * @returns {boolean}
   */
  isTutorialCompleted() {
    return this.session.tutorialCompleted || false;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SessionStorage;
}
