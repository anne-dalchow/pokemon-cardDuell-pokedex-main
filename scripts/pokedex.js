/**
 * @fileoverview Main logic for the Pokémon Pokedex and Card Duel application.
 *
 * Handles data loading, card rendering, modal logic, evolution chains, and UI interactions.
 * All core application logic is managed here and uses helpers from utils and modalUtils modules.
 *
 * @module pokedex
 */
import {
  findPokemonDataById,
  findPokemonForEvolution,
  logPokemonNotFound,
  logEvolutionNotFound,
  logTemplateError,
  logEvolutionFetchError,
  capitalize,
  setDisplay,
  hideAllTabContents,
  deactivateAllTabs,
  activateFirstTab,
  handleTabClick,
  traverseEvolutionChain,
  renderEvolutionChain,
} from "./utils.js";
import {
  fillCardContent,
  addCardClickHandler,
  fillCardTypes,
  createAbilityDiv,
  setStatProgress,
  closeModal,
  updateModalHeaderColor,
  setModalHeaderText,
  setModalHeaderImage,
} from "./modalUtils.js";

let pokemons = [];
let pokemonDataArray = [];
const pokemonCardContainer = document.getElementById("pokemon-cards-container");
const loader = document.querySelector(".first-loader-container");
const modal = document.querySelector(".modal-container");
let offset = 0;
const limit = 20;

/**
 * Initializes the application on DOMContentLoaded.
 * Sets up UI, loads data, and search input event.
 */
window.addEventListener("DOMContentLoaded", () => {
  displayHidden();
  showLoader();
  loadData().then(() => {
    hideLoader();
    displayVisible();
  });
  const input = document.getElementById("search-input-pokemon");
  input.addEventListener("input", filterPokemons);
});

/**
 * Shows the loader/spinner in the UI.
 * @returns {void}
 */
function showLoader() {
  loader.style.display = "flex";
}

/**
 * Hides the loader/spinner in the UI.
 * @returns {void}
 */
function hideLoader() {
  loader.style.display = "none";
}

/**
 * Loads Pokémon data and sets up the "Load More" button.
 * @async
 * @function
 * @returns {Promise<void>} Resolves when data is loaded.
 */
async function loadData() {
  await loadPokemonCards();
  loadMoreBtn();
  setTimeout(() => {
    hideLoader();
    displayVisible();
  }, 3000);
}

/**
 * Hides UI elements before data is loaded.
 * @returns {void}
 */
function displayHidden() {
  setDisplay(".loadMore-spinner", "none");
  setDisplay(".search-container", "none");
  setDisplay(".loadmore-container", "none");
}

/**
 * Shows UI elements when data is visible.
 * @returns {void}
 */
function displayVisible() {
  setDisplay(".search-container", "flex");
  setDisplay(".loadmore-container", "flex");
}

/**
 * Fetches a list of Pokémon from the API.
 * @async
 * @function
 * @param {number} offset - The offset for pagination.
 * @param {number} limit - The number of Pokémon to fetch.
 * @returns {Promise<Object>} The Pokémon list response object.
 */
async function getPokemonList(offset, limit) {
  try {
    let res = await fetch(
      `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`
    );
    if (!res.ok) {
      throw new Error(`HTTP Error! Status: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching Pokémon list:", error);
  }
}

/**
 * Fetches all data for a single Pokémon by name or ID.
 * @async
 * @function
 * @param {string|number} id - The Pokémon name or ID.
 * @returns {Promise<Object>} The Pokémon data object.
 */
async function getAllPokemonData(id) {
  try {
    let response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching Pokémon data:", error);
  }
}

/**
 * Fetches species details for a Pokémon.
 * @async
 * @function
 * @param {string} url - The API URL for the species.
 * @returns {Promise<Object>} The species details object.
 */
async function getPokemonSpeciesDetails(url) {
  try {
    let res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP Error! Status: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching Pokémon species details:", error);
  }
}

/**
 * Fetches ability details for a Pokémon.
 * @async
 * @function
 * @param {string} url - The API URL for the ability.
 * @returns {Promise<Object>} The ability details object.
 */
async function getPokemonAbilityDetails(url) {
  try {
    let res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP Error! Status: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching Pokémon ability details:", error);
  }
}

/**
 * Loads Pokémon cards and appends them to the UI.
 * @async
 * @function
 * @param {number} [currentOffset=offset] - The offset for pagination.
 * @returns {Promise<void>} Resolves when cards are loaded.
 */
async function loadPokemonCards(currentOffset = offset) {
  const pokemonList = await getPokemonList(currentOffset, limit);
  const newPokemonData = await Promise.all(
    pokemonList.results.map(fetchSinglePokemonData)
  );
  pokemonDataArray.push(...newPokemonData);
  newPokemonData.forEach(addPokemonToUI);
}

/**
 * Fetches all data for a single Pokémon and returns a structured object.
 * @param {Object} pokemon - The Pokémon list entry.
 * @returns {Promise<Object>} Structured Pokémon data.
 */
async function fetchSinglePokemonData(pokemon) {
  const singlePokemonData = await getAllPokemonData(pokemon.name);
  const speciesData = await getPokemonSpeciesDetails(
    singlePokemonData.species.url
  );
  const abilityDescriptions = await fetchAbilityDescriptions(
    singlePokemonData.abilities
  );
  const currentPokemon = buildCurrentPokemon(singlePokemonData);
  return { currentPokemon, speciesData, abilityDescriptions };
}

/**
 * Builds a Pokémon object with selected properties.
 * @param {Object} singlePokemonData - Raw Pokémon data from API.
 * @returns {Object} Pokémon object with id, name, image, and types.
 */
function buildCurrentPokemon(singlePokemonData) {
  return {
    id: singlePokemonData.id,
    name: capitalize(singlePokemonData.name),
    image: singlePokemonData.sprites.other.home.front_default,
    types: singlePokemonData.types.map((type) => type.type.name),
  };
}

/**
 * Fetches ability descriptions for a Pokémon.
 * @param {Array} abilities - Array of ability objects.
 * @returns {Promise<Array>} Array of ability description objects.
 */
async function fetchAbilityDescriptions(abilities) {
  return Promise.all(
    abilities.map((ability) => getPokemonAbilityDetails(ability.ability.url))
  );
}

/**
 * Adds a Pokémon card to the UI and pokemons array.
 * @param {Object} data - Pokémon data object.
 */
function addPokemonToUI({ currentPokemon, speciesData, abilityDescriptions }) {
  pokemons.push(currentPokemon);
  createPokemonCard(currentPokemon, speciesData, abilityDescriptions);
}

/**
 * Creates and appends a Pokémon card to the container.
 * @param {Object} currentPokemon - The Pokémon data object.
 * @param {Object} speciesData - The species data object.
 * @param {Array<Object>} abilityDescriptions - Array of ability description objects.
 * @returns {HTMLElement|undefined} The appended card element or undefined if template not found.
 */
function createPokemonCard(currentPokemon, speciesData, abilityDescriptions) {
  const template = document.getElementById("pokemon-card-template");
  if (!template) return logTemplateError();
  const cardTemplate = template.content.cloneNode(true);
  fillCardContent(cardTemplate, currentPokemon, speciesData);
  addCardClickHandler(cardTemplate, currentPokemon.id, showModalForPokemon);
  fillCardTypes(cardTemplate, currentPokemon.types, speciesData.color.name);
  return pokemonCardContainer.appendChild(cardTemplate);
}

/**
 * Filters Pokémon cards in the UI based on the search input.
 * @param {Event} event - The input event.
 * @returns {void}
 */
function filterPokemons(event) {
  const filter = event.target.value.toLowerCase();
  const cards = document.querySelectorAll(".card");

  pokemons.forEach((pokemon, index) => {
    const card = cards[index];
    const name = pokemon.name.toLowerCase();
    if (name.includes(filter)) {
      card.style.display = "flex";
    } else {
      card.style.display = "none";
    }
  });
}

/**
 * Sets up the "Load More" button and its event listener.
 * @returns {void}
 */
function loadMoreBtn() {
  const button = document.getElementById("loadMore-btn");
  const loader2 = document.querySelector(".loadMore-spinner");
  button.addEventListener("click", () => {
    loader2.style.display = "flex";
    button.style.display = "none";
    loadMoreData().then(() => {
      loader2.style.display = "none";
      button.style.display = "flex";
    });
  });
}

/**
 * Loads more Pokémon cards by increasing the offset.
 * @async
 * @function
 * @returns {Promise<void>} Resolves when more cards are loaded.
 */
async function loadMoreData() {
  offset += limit;
  await loadPokemonCards(offset);
}

/**
 * Opens and fills the modal with detailed Pokémon information.
 * @async
 * @function
 * @param {number|string} pokemonID - The ID of the Pokémon to display.
 * @returns {Promise<void>} Resolves when modal is shown and filled.
 */
async function showModalForPokemon(pokemonID) {
  const found = findPokemonDataById(pokemonDataArray, pokemonID);
  if (!found) return logPokemonNotFound();
  const { currentPokemon, speciesData, abilityDescriptions } = found;
  const moreData = await getAllPokemonData(currentPokemon.name);
  fillModal(
    currentPokemon,
    speciesData,
    abilityDescriptions,
    moreData,
    found.speciesData.id
  );
}

/**
 * Fills the modal with all Pokémon details and sets up navigation.
 * @param {Object} currentPokemon - The Pokémon data object.
 * @param {Object} speciesData - The species data object.
 * @param {Array<Object>} abilityDescriptions - Array of ability description objects.
 * @param {Object} moreData - Additional Pokémon data object.
 * @param {number} pokeID - The Pokémon's ID.
 */
function fillModal(
  currentPokemon,
  speciesData,
  abilityDescriptions,
  moreData,
  pokeID
) {
  showModalHeader(currentPokemon, speciesData);
  showModalAboutStats(abilityDescriptions, moreData);
  showModalBaseStats(moreData);
  modal.style.display = "flex";
  showModalCardTabs();
  showEvolutionChain(pokeID);
  nextPokemon(pokeID);
  prevPokemon(pokeID);
  closeModal();
}

/**
 * Fills the modal header with Pokémon name, ID, image, and color.
 * @param {Object} currentPokemon - The Pokémon data object.
 * @param {Object} speciesData - The species data object.
 * @returns {void}
 */
function showModalHeader(currentPokemon, speciesData) {
  setModalHeaderText(modal, currentPokemon);
  setModalHeaderImage(modal, currentPokemon);
  updateModalHeaderColor(modal, speciesData.color.name);
}

/**
 * Displays Pokémon abilities and their descriptions in the modal.
 * @param {Array<Object>} abilityDescriptions - Array of ability description objects.
 * @param {Object} moreData - Additional Pokémon data object.
 * @returns {void}
 */
function showModalAboutStats(abilityDescriptions, moreData) {
  const abilitiesContainer = modal.querySelector(".abilities-container");
  abilitiesContainer.innerHTML = "";
  moreData.abilities.forEach((abilityObj, index) => {
    abilitiesContainer.appendChild(
      createAbilityDiv(abilityObj, abilityDescriptions[index])
    );
  });
}

/**
 * Displays base stats (height, weight, and battle stats) in the modal.
 * @param {Object} moreData - The Pokémon data object with stats.
 * @returns {void}
 */
function showModalBaseStats(moreData) {
  setStatProgress("height", moreData.height);
  setStatProgress("weight", moreData.weight);
  [
    "hp",
    "attack",
    "defense",
    "special-attack",
    "special-defense",
    "speed",
  ].forEach((name, i) => {
    setStatProgress(name, moreData.stats[i].base_stat);
  });
}

/**
 * Initializes the modal's tab navigation and sets up event listeners.
 * @returns {void}
 */
function showModalCardTabs() {
  const tabButtons = document.querySelectorAll(".tab-button");
  const infoBoxes = document.querySelectorAll(".tab-content");
  hideAllTabContents(infoBoxes);
  deactivateAllTabs(tabButtons);
  activateFirstTab(tabButtons, infoBoxes);
  tabButtons.forEach((tab) =>
    tab.addEventListener("click", () =>
      handleTabClick(tab, tabButtons, infoBoxes)
    )
  );
}

const prevArrow = document.getElementById("prev-arrow");
const nextArrow = document.getElementById("next-arrow");

/**
 * Sets up the "next" arrow to show the next Pokémon in the modal.
 * @param {number} pokeID - The current Pokémon's ID.
 * @returns {void}
 */
function nextPokemon(pokeID) {
  nextArrow.onclick = () => {
    let nextPokeId = pokeID + 1;
    let exist = pokemonDataArray.find(
      ({ speciesData }) => speciesData.id === nextPokeId
    );
    exist
      ? showModalForPokemon(nextPokeId)
      : console.error("Pokemon not found");
  };
}

/**
 * Sets up the "previous" arrow to show the previous Pokémon in the modal.
 * @param {number} pokeID - The current Pokémon's ID.
 * @returns {void}
 */
function prevPokemon(pokeID) {
  let prevPokeID = pokeID - 1;
  prevPokeID < 1
    ? (prevArrow.style.visibility = "hidden")
    : (prevArrow.style.visibility = "visible");

  prevArrow.onclick = () => {
    let exist = pokemonDataArray.find(
      ({ speciesData }) => speciesData.id === prevPokeID
    );
    exist
      ? showModalForPokemon(prevPokeID)
      : console.error("Pokemon not found");
  };
}

/**
 * Loads and displays the evolution chain for a given Pokémon.
 * @async
 * @function
 * @param {number} pokeID - The Pokémon's ID.
 * @returns {Promise<void>} Resolves when the evolution chain is shown.
 */
async function showEvolutionChain(pokeID) {
  const found = findPokemonForEvolution(pokemonDataArray, pokeID);
  if (!found) return logEvolutionNotFound();
  const evoChainUrl = found.speciesData.evolution_chain.url;
  try {
    const data = await fetchEvolutionChainData(evoChainUrl);
    const evolutionList = buildEvolutionList(data.chain);
    renderEvolutionChain(evolutionList, getAllPokemonData);
  } catch (error) {
    logEvolutionFetchError(error);
  }
}

/**
 * Fetches the evolution chain data from the API.
 * @async
 * @function
 * @param {string} url - The API URL for the evolution chain.
 * @returns {Promise<Object>} The evolution chain data object.
 */
async function fetchEvolutionChainData(url) {
  const response = await fetch(url);
  return await response.json();
}

/**
 * Builds an array of evolution species names from the chain object.
 * @param {Object} chain - The evolution chain object.
 * @returns {Array<string>} Array of species names in the evolution chain.
 */
function buildEvolutionList(chain) {
  const result = [];
  traverseEvolutionChain(chain, result);
  return result;
}
