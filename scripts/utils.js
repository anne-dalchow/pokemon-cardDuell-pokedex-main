/**
 * @fileoverview Utility functions for the Pokémon Pokedex and Card Duel project.
 *
 * Provides helpers for traversing evolution chains, rendering evolution UI, tab navigation,
 * error logging, string formatting, and DOM manipulation. All functions are exported for use in main modules.
 *
 * @module utils
 */

/**
 * Recursively traverses the evolution chain and fills the result array.
 * @param {Object} chainNode - The current node in the evolution chain.
 * @param {Array<string>} resultArray - The array to store evolution species names.
 * @returns {void}
 */
export function traverseEvolutionChain(chainNode, resultArray) {
  resultArray.push(chainNode.species.name);
  if (chainNode.evolves_to.length > 0) {
    for (const nextEvolution of chainNode.evolves_to) {
      traverseEvolutionChain(nextEvolution, resultArray);
    }
  }
}

/**
 * Renders the evolution chain for a given list of Pokémon names.
 * @async
 * @param {Array<string>} evolutionList - List of Pokémon names representing the evolution steps.
 * @param {Function} getAllPokemonData - Function to fetch Pokémon data.
 * @returns {Promise<void>} Resolves when the evolution chain has been rendered.
 */
export async function renderEvolutionChain(evolutionList, getAllPokemonData) {
  const container = document.querySelector(".evo-chain-info");
  container.innerHTML = "";
  for (let i = 0; i < evolutionList.length; i++) {
    await appendEvolutionStep(container, evolutionList[i], getAllPokemonData);
    if (i < evolutionList.length - 1) appendEvolutionArrow(container);
  }
}

/**
 * Appends a Pokémon image to the evolution chain container.
 * @async
 * @param {HTMLElement} container - The container element.
 * @param {string} name - Pokémon name.
 * @param {Function} getAllPokemonData - Function to fetch Pokémon data.
 */
export async function appendEvolutionStep(container, name, getAllPokemonData) {
  const pokeData = await getAllPokemonData(name);
  const imgURL = pokeData.sprites.other["official-artwork"].front_default;
  const img = document.createElement("img");
  img.src = imgURL;
  img.alt = name;
  img.title = name;
  img.classList.add("evo-img");
  container.appendChild(img);
}

/**
 * Appends an arrow between evolution steps.
 * @param {HTMLElement} container - The container element.
 */
export function appendEvolutionArrow(container) {
  const arrow = document.createElement("span");
  arrow.innerHTML = '<i class="fa-solid fa-arrow-right"></i>';
  arrow.classList.add("evo-arrow");
  container.appendChild(arrow);
}

/**
 * Finds a Pokémon data object by its ID.
 * @param {Array} pokemonDataArray - Array of Pokémon data objects.
 * @param {number|string} pokemonID - The Pokémon ID.
 * @returns {Object|undefined} The found Pokémon data object or undefined.
 */
export function findPokemonDataById(pokemonDataArray, pokemonID) {
  return pokemonDataArray.find(
    ({ currentPokemon }) => currentPokemon.id == pokemonID
  );
}

/**
 * Finds a Pokémon for evolution by its ID.
 * @param {Array} pokemonDataArray - Array of Pokémon data objects.
 * @param {number} pokeID - The Pokémon ID.
 * @returns {Object|undefined} The found Pokémon data object or undefined.
 */
export function findPokemonForEvolution(pokemonDataArray, pokeID) {
  return pokemonDataArray.find(
    ({ currentPokemon }) => currentPokemon.id === pokeID
  );
}

/**
 * Logs an error if a Pokémon is not found for modal.
 */
export function logPokemonNotFound() {
  console.error("Pokemon not found!");
}

/**
 * Logs an error if a Pokémon is not found for evolution chain.
 */
export function logEvolutionNotFound() {
  console.error("Pokémon not found for Evolution Chain!");
}

/**
 * Logs an error if the Pokémon card template is not found.
 */
export function logTemplateError() {
  console.error("Pokemon Card Template not found!");
}

/**
 * Logs an error if the evolution chain fetch fails.
 * @param {Error} error - The error object.
 */
export function logEvolutionFetchError(error) {
  console.error("Error loading Evolution Chain:", error);
}

/**
 * Capitalizes the first letter of a string.
 * @param {string} str - The string to capitalize.
 * @returns {string} Capitalized string.
 */
export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Sets the display style for a selector.
 * @param {string} selector - CSS selector.
 * @param {string} value - Display value.
 */
export function setDisplay(selector, value) {
  document.querySelector(selector).style.display = value;
}

/**
 * Hides all tab contents.
 * @param {NodeListOf<HTMLElement>} infoBoxes - Tab content elements.
 */
export function hideAllTabContents(infoBoxes) {
  infoBoxes.forEach((box) => (box.style.display = "none"));
}

/**
 * Deactivates all tabs.
 * @param {NodeListOf<HTMLElement>} tabButtons - Tab button elements.
 */
export function deactivateAllTabs(tabButtons) {
  tabButtons.forEach((tab) => tab.classList.remove("active-tab"));
}

/**
 * Activates the first tab and shows its content.
 * @param {NodeListOf<HTMLElement>} tabButtons - Tab button elements.
 * @param {NodeListOf<HTMLElement>} infoBoxes - Tab content elements.
 */
export function activateFirstTab(tabButtons, infoBoxes) {
  if (tabButtons.length && infoBoxes.length) {
    tabButtons[0].classList.add("active-tab");
    document.querySelector(`.${tabButtons[0].dataset.target}`).style.display =
      "flex";
  }
}

/**
 * Handles tab click event.
 * @param {HTMLElement} tab - The clicked tab button.
 * @param {NodeListOf<HTMLElement>} tabButtons - Tab button elements.
 * @param {NodeListOf<HTMLElement>} infoBoxes - Tab content elements.
 */
export function handleTabClick(tab, tabButtons, infoBoxes) {
  updateTabs(tab, tabButtons);
  updateTabsContent(tab, infoBoxes);
}

/**
 * Updates the active tab.
 * @param {HTMLElement} tab - The tab button to activate.
 * @param {NodeListOf<HTMLElement>} tabButtons - Tab button elements.
 */
export function updateTabs(tab, tabButtons) {
  tabButtons.forEach((t) => t.classList.remove("active-tab"));
  tab.classList.add("active-tab");
}

/**
 * Shows the content of the active tab.
 * @param {HTMLElement} tab - The active tab button.
 * @param {NodeListOf<HTMLElement>} infoBoxes - Tab content elements.
 */
export function updateTabsContent(tab, infoBoxes) {
  infoBoxes.forEach((box) => (box.style.display = "none"));
  const targetClass = tab.dataset.target;
  const targetBox = document.querySelector(`.${targetClass}`);
  if (targetBox) targetBox.style.display = "flex";
}
