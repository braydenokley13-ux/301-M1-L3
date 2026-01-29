// Utility functions for formatting and helpers

/**
 * Format currency values
 * @param {number} amount - Amount in dollars
 * @param {boolean} short - Use short format (M for millions)
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount, short = false) {
  if (short) {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount}`;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Format time duration
 * @param {number} ms - Time in milliseconds
 * @returns {string} Formatted time string
 */
function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds}s`;
  }

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Format percentage
 * @param {number} value - Value between 0 and 1
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
function formatPercent(value, decimals = 0) {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format decimal number
 * @param {number} value - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number
 */
function formatNumber(value, decimals = 1) {
  return value.toFixed(decimals);
}

/**
 * Get efficiency status and color
 * @param {number} efficiency - Efficiency value (0-1)
 * @returns {Object} Status object with label and color
 */
function getEfficiencyStatus(efficiency) {
  if (efficiency >= 0.95) {
    return { label: 'Excellent', color: CHART_COLORS.optimal, emoji: '🌟' };
  }
  if (efficiency >= 0.85) {
    return { label: 'Good', color: CHART_COLORS.frontier, emoji: '✅' };
  }
  if (efficiency >= 0.75) {
    return { label: 'Fair', color: CHART_COLORS.frontier, emoji: '⚠️' };
  }
  return { label: 'Needs Improvement', color: CHART_COLORS.overFrontier, emoji: '❌' };
}

/**
 * Get badge information
 * @param {string} badgeId - Badge identifier
 * @returns {Object} Badge details
 */
function getBadgeInfo(badgeId) {
  const badges = {
    frontierMaster: {
      name: 'Frontier Master',
      description: 'Achieved 95%+ efficiency in all scenarios',
      icon: '👑',
      color: '#fbbf24'
    },
    capWizard: {
      name: 'Cap Wizard',
      description: 'Mastered the NFL salary cap (95%+ efficiency)',
      icon: '🧙',
      color: '#3b82f6'
    },
    taxStrategist: {
      name: 'Tax Strategist',
      description: 'Made smart luxury tax decisions in NBA',
      icon: '💰',
      color: '#10b981'
    },
    quickLearner: {
      name: 'Quick Learner',
      description: 'Completed all scenarios in under 18 minutes',
      icon: '⚡',
      color: '#f59e0b'
    }
  };

  return badges[badgeId] || { name: 'Unknown', description: '', icon: '❓', color: '#6b7280' };
}

/**
 * Debounce function to limit rate of function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit rate of function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit time in ms
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Shuffle array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get star rating from stat percentile
 * @param {number} percentile - Percentile (0-100)
 * @returns {string} Star rating HTML
 */
function getStarRating(percentile) {
  const stars = Math.ceil(percentile / 20); // 0-5 stars
  return '⭐'.repeat(stars);
}

/**
 * Create element with classes and attributes
 * @param {string} tag - HTML tag name
 * @param {Object} options - Options object
 * @returns {HTMLElement} Created element
 */
function createElement(tag, options = {}) {
  const element = document.createElement(tag);

  if (options.classes) {
    element.className = Array.isArray(options.classes) ?
      options.classes.join(' ') : options.classes;
  }

  if (options.attributes) {
    for (const [key, value] of Object.entries(options.attributes)) {
      element.setAttribute(key, value);
    }
  }

  if (options.text) {
    element.textContent = options.text;
  }

  if (options.html) {
    element.innerHTML = options.html;
  }

  if (options.children) {
    options.children.forEach(child => {
      if (child instanceof HTMLElement) {
        element.appendChild(child);
      }
    });
  }

  return element;
}

/**
 * Show notification toast
 * @param {string} message - Message to display
 * @param {string} type - Type (success, error, warning, info)
 * @param {number} duration - Duration in ms
 */
function showToast(message, type = 'info', duration = 3000) {
  const toast = createElement('div', {
    classes: ['toast', `toast-${type}`],
    text: message
  });

  document.body.appendChild(toast);

  // Trigger animation
  setTimeout(() => toast.classList.add('show'), 10);

  // Remove after duration
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => document.body.removeChild(toast), 300);
  }, duration);
}

/**
 * Validate roster completeness
 * @param {Object} roster - Roster object
 * @param {Array} positions - Required positions
 * @returns {Object} Validation result
 */
function validateRoster(roster, positions) {
  const missing = [];
  const errors = [];

  for (const position of positions) {
    if (!roster[position] || !roster[position].player) {
      missing.push(position);
    }
  }

  if (missing.length > 0) {
    errors.push(`Missing selections for: ${missing.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    missing
  };
}

/**
 * Calculate total roster salary
 * @param {Object} roster - Roster object
 * @returns {number} Total salary
 */
function calculateTotalSalary(roster) {
  return Object.values(roster).reduce((total, selection) => {
    return total + (selection && selection.salary ? selection.salary : 0);
  }, 0);
}

/**
 * Sort players by stat
 * @param {Array} players - Array of players
 * @param {string} statName - Stat to sort by
 * @param {boolean} ascending - Sort order
 * @returns {Array} Sorted players
 */
function sortPlayers(players, statName, ascending = false) {
  return players.sort((a, b) => {
    const statA = a.stats[statName.toLowerCase()] || 0;
    const statB = b.stats[statName.toLowerCase()] || 0;
    return ascending ? statA - statB : statB - statA;
  });
}

/**
 * Filter players by search term
 * @param {Array} players - Array of players
 * @param {string} searchTerm - Search term
 * @returns {Array} Filtered players
 */
function filterPlayers(players, searchTerm) {
  if (!searchTerm) return players;

  const term = searchTerm.toLowerCase();
  return players.filter(player =>
    player.name.toLowerCase().includes(term) ||
    player.team.toLowerCase().includes(term)
  );
}

/**
 * Load JSON file
 * @param {string} url - URL to JSON file
 * @returns {Promise<Object>} Parsed JSON
 */
async function loadJSON(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading JSON:', error);
    throw error;
  }
}

/**
 * Safe query selector
 * @param {string} selector - CSS selector
 * @param {HTMLElement} parent - Parent element
 * @returns {HTMLElement|null} Found element
 */
function $(selector, parent = document) {
  return parent.querySelector(selector);
}

/**
 * Safe query selector all
 * @param {string} selector - CSS selector
 * @param {HTMLElement} parent - Parent element
 * @returns {Array<HTMLElement>} Found elements
 */
function $$(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    formatCurrency,
    formatTime,
    formatPercent,
    formatNumber,
    getEfficiencyStatus,
    getBadgeInfo,
    debounce,
    throttle,
    shuffleArray,
    getStarRating,
    createElement,
    showToast,
    validateRoster,
    calculateTotalSalary,
    sortPlayers,
    filterPlayers,
    loadJSON,
    $,
    $$
  };
}
