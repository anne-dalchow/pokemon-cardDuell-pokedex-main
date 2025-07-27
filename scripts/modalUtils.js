/**
 * @fileoverview Modal and card utility functions for the Pokémon Card Duel and Pokedex project.
 *
 * Provides helpers for filling card content, handling modal logic, and updating modal UI elements.
 *
 * @module modalUtils
 */

/**
 * Fills the card content with Pokémon data and color.
 * @param {HTMLElement} cardTemplate - The card template element.
 * @param {Object} currentPokemon - The Pokémon data object.
 * @param {Object} speciesData - The species data object.
 */
export function fillCardContent(cardTemplate, currentPokemon, speciesData) {
  cardTemplate.querySelector(".pokemon-index").innerText = currentPokemon.id;
  cardTemplate.querySelector(".pokemon-name").innerText = currentPokemon.name;
  cardTemplate
    .querySelector(".pokemon-img-container>img")
    .setAttribute("src", currentPokemon.image);
  cardTemplate
    .querySelector(".pokemon-img-container")
    .classList.add(`color-${speciesData.color.name}`);
}

/**
 * Adds a click handler to the card for opening the modal.
 * @param {HTMLElement} cardTemplate - The card template element.
 * @param {number|string} id - The Pokémon ID.
 * @param {Function} showModalForPokemon - Callback to open modal for Pokémon.
 */
export function addCardClickHandler(cardTemplate, id, showModalForPokemon) {
  const card = cardTemplate.querySelector(".card");
  card.setAttribute("data-id", id);
  card.addEventListener("click", (event) => {
    showModalForPokemon(event.currentTarget.getAttribute("data-id"));
  });
}

/**
 * Fills the card with Pokémon type icons and color.
 * @param {HTMLElement} cardTemplate - The card template element.
 * @param {Array<string>} types - Array of Pokémon types.
 * @param {string} color - Color name for styling.
 */
export function fillCardTypes(cardTemplate, types, color) {
  const statsContainer = cardTemplate.querySelector(
    ".pokemon-stats-container div"
  );
  statsContainer.innerHTML = "";
  types.forEach((type) => {
    const icon = document.createElement("div");
    icon.classList.add("type", type, color);
    statsContainer.appendChild(icon);
  });
}

/**
 * Creates a div element for a Pokémon ability with its description.
 * @param {Object} abilityObj - Ability object from Pokémon data.
 * @param {Object} abilityDesc - Ability description object.
 * @returns {HTMLElement} Ability div element.
 */
export function createAbilityDiv(abilityObj, abilityDesc) {
  const abilityName = abilityObj.ability.name;
  const description = getEnglishAbilityDescription(abilityDesc);
  const abilityDiv = document.createElement("div");
  abilityDiv.classList.add("ability");
  abilityDiv.innerHTML = `
    <p><em><strong>${abilityName}</strong></em></p>
    <p><em>${description}</em></p>
  `;
  return abilityDiv;
}

/**
 * Extracts the English description from an ability description object.
 * @param {Object} abilityDesc - Ability description object.
 * @returns {string} English description or fallback.
 */
export function getEnglishAbilityDescription(abilityDesc) {
  if (abilityDesc && abilityDesc.effect_entries) {
    const entry = abilityDesc.effect_entries.find(
      (e) => e.language.name === "en"
    );
    if (entry) return entry.short_effect;
  }
  return "No description available.";
}

/**
 * Sets the progress bar and text for a stat in the modal.
 * @param {string} className - Stat class name.
 * @param {number} value - Stat value.
 */
export function setStatProgress(className, value) {
  document.querySelector(`.${className} progress`).value = value;
  document.querySelector(`.${className}-text`).innerText = value;
}

/**
 * Sets up the modal close button and its event listener.
 * @param {string} [modalSelector='.modal-container'] - CSS selector for modal.
 * @param {string} [closeBtnId='close-modal'] - ID of the close button.
 */
export function closeModal(
  modalSelector = ".modal-container",
  closeBtnId = "close-modal"
) {
  let closeBtn = document.getElementById(closeBtnId);
  closeBtn.addEventListener("click", () => {
    document.querySelector(modalSelector).style.display = "none";
  });
  document.querySelector(modalSelector).addEventListener("click", (event) => {
    event.stopPropagation();
  });
}

/**
 * Updates the modal header color based on Pokémon species color.
 * @param {HTMLElement} modal - The modal element.
 * @param {string} color - Color name for styling.
 */
export function updateModalHeaderColor(modal, color) {
  const pokeimgHeader = modal.querySelector(".pokeimg-modal-container");
  pokeimgHeader.className = pokeimgHeader.className
    .split(" ")
    .filter((className) => !className.startsWith("color-"))
    .join(" ");
  pokeimgHeader.classList.add(`color-${color}`);
}

/**
 * Sets the modal header text with Pokémon name and ID.
 * @param {HTMLElement} modal - The modal element.
 * @param {Object} currentPokemon - The Pokémon data object.
 */
export function setModalHeaderText(modal, currentPokemon) {
  modal.querySelector(".pokemon-index").innerText = currentPokemon.id;
  modal.querySelector(".pokemon-name").innerText = currentPokemon.name;
}

/**
 * Sets the modal header image with Pokémon image.
 * @param {HTMLElement} modal - The modal element.
 * @param {Object} currentPokemon - The Pokémon data object.
 */
export function setModalHeaderImage(modal, currentPokemon) {
  modal.querySelector(".pokeimg-modal-container img").src =
    currentPokemon.image;
}
