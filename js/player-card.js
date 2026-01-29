// Player card component - reusable player display

class PlayerCard {
  constructor(player, position, config) {
    this.player = player;
    this.position = position;
    this.config = config;
    this.selectedTier = null;
  }

  render() {
    // This is handled by draft-engine for now
    // Can be extended for more complex card interactions
    return this;
  }

  selectTier(tierIndex) {
    this.selectedTier = tierIndex;
    return this.player.salaryTiers[tierIndex];
  }

  getHTML() {
    // Returns HTML string for the card
    // Used by draft-engine.renderPlayerCard
    return '';
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PlayerCard;
}
