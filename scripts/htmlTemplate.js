/**
 * Creates the HTML for a player card.
 * @param {Object} card - The Pokémon object.
 * @param {number} index - Card index.
 * @returns {string} HTML string
 */
export function playerCardTemplate(card, index) {
  /**
   * @fileoverview HTML template functions for rendering Pokémon cards in the Card Duel game.
   *
   * Provides template generators for player cards, computer cards (hidden/revealed), and selected player cards.
   *
   * @module htmlTemplate
   */
  return `
    <div class="card" onclick="handleSelectPlayerCard(${index})">
      <div class="card-header">${card.name}</div>
      <div class="card-image"><img src="${card.sprites.other.home.front_default}" alt="${card.name}"></div>
      <div class="card-content"><p>Description of the character goes here.</p></div>
      <div class="card-skill-container">
        <div class="skill-one"><p class="skill-name">Attack</p><p>${card.stats[1].base_stat}</p></div>
        <div class="skill-two"><p class="skill-name">Defense</p><p>${card.stats[2].base_stat}</p></div>
        <div class="skill-three"><p class="skill-name">Speed</p><p>${card.stats[0].base_stat}</p></div>
        <div class="skill-four"><p class="skill-name">HP</p><p>${card.stats[3].base_stat}</p></div>
      </div>
    </div>
  `;
}

/**
 * Creates the HTML for the hidden computer card.
 * @returns {string} HTML string
 */
export function computerCardHiddenTemplate() {
  return `
    <span class="bold-large">Computer</span> <br>
    <div class="card">
      <div class="card-header">??????????</div>
      <div class="card-image">
        <img src="https://i.ibb.co/hy7mg2D/fragezeichen-03.png" alt="fragezeichen-03" alt="question mark">
      </div>
      <div class="card-skill-container">
        <div class="skill-one"><p class="skill-name">Attack</p><p>?</p></div>
        <div class="skill-two"><p class="skill-name">Defense</p><p>?</p></div>
        <div class="skill-three"><p class="skill-name">Speed</p><p>?</p></div>
        <div class="skill-four"><p class="skill-name">HP</p><p>?</p></div>
      </div>
    </div>
  `;
}

/**
 * Creates the HTML for the revealed computer card.
 * @param {Object} card - The Pokémon object.
 * @returns {string} HTML string
 */
export function computerCardTemplate(card) {
  return `
    <div class="card">
      <div class="card-header">${card.name}</div>
      <div class="card-image"><img src="${card.sprites.other.home.front_default}" alt="${card.name}"></div>
      <div class="card-skill-container">
        <div class="skill-one"><p class="skill-name">Attack</p><p>${card.stats[1].base_stat}</p></div>
        <div class="skill-two"><p class="skill-name">Defense</p><p>${card.stats[2].base_stat}</p></div>
        <div class="skill-three"><p class="skill-name">Speed</p><p>${card.stats[0].base_stat}</p></div>
        <div class="skill-four"><p class="skill-name">HP</p><p>${card.stats[3].base_stat}</p></div>
      </div>
    </div>
  `;
}

/**
 * Creates the HTML for the selected player card.
 * @param {Object} card - The Pokémon object.
 * @returns {string} HTML string
 */
export function selectedPlayerCardTemplate(card) {
  return `
    <div class="card">
      <div class="card-header">${card.name}</div>
      <div class="card-image"><img src="${card.sprites.other.home.front_default}" alt="${card.name}"></div>
      <div class="card-skill-container">
        <div class="skill-one"><p class="skill-name">Attack</p><p>${card.stats[1].base_stat}</p></div>
        <div class="skill-two"><p class="skill-name">Defense</p><p>${card.stats[2].base_stat}</p></div>
        <div class="skill-three"><p class="skill-name">Speed</p><p>${card.stats[0].base_stat}</p></div>
        <div class="skill-four"><p class="skill-name">HP</p><p>${card.stats[3].base_stat}</p></div>
      </div>
    </div>
  `;
}
