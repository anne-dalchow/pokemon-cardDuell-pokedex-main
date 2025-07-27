/**
 * @fileoverview Main game logic for the Pokémon Card Duel game.
 *
 * Handles game state, card drawing, player/computer turns, score keeping, and UI updates.
 * Uses HTML templates for card rendering and manages all game interactions.
 *
 * @module game
 */
import {
  playerCardTemplate,
  computerCardHiddenTemplate,
  computerCardTemplate,
  selectedPlayerCardTemplate,
} from "./htmlTemplate.js";

document.addEventListener("DOMContentLoaded", function () {
  const scoreboard = document.getElementById("scoreboard");
  const roundCompare = document.querySelector(".scoreboard-round-compare");
  function placeCompareInScoreboard() {
    if (window.innerWidth <= 900) {
      if (!scoreboard.contains(roundCompare)) {
        scoreboard.appendChild(roundCompare);
      }
      roundCompare.classList.add("sticky");
    } else {
      if (scoreboard.contains(roundCompare)) {
        scoreboard.parentNode.insertBefore(
          roundCompare,
          scoreboard.nextSibling
        );
      }
      roundCompare.classList.remove("sticky");
    }
  }
  window.addEventListener("resize", placeCompareInScoreboard);
  placeCompareInScoreboard();
});

let playerCards = [];
let computerCards = [];
let currentPlayerCard;
let currentComputerCard;
let playerScore = 0;
let computerScore = 0;
let totalRounds = 6;
let turnsRemaining = totalRounds;
const comparisonCategories = ["attack", "defense", "speed", "hp"];
let currentCategory;

document.getElementById("start-game").addEventListener("click", () => {
  loadPokemonData();
});

/**
 * Fetches Pokémon data by ID from the API.
 * @param {number} id - The Pokémon ID.
 * @returns {Promise<Object|null>} The Pokémon data object or null if fetch fails.
 */

async function getPokemon(id) {
  try {
    const response = await fetch(`https://pokedex.mimo.dev/api/pokemon/${id}`);
    if (!response.ok) throw new Error("Fehler beim Abrufen der Daten");
    return await response.json();
  } catch (error) {
    console.error("Fehler:", error);
    return null;
  }
}

/**
 * Loads Pokémon data for both player and computer, then displays the cards.
 * @returns {void}
 */
function loadPokemonData() {
  playerCards = [];
  computerCards = [];
  Promise.all([
    ...fetchCards(6, playerCards),
    ...fetchCards(6, computerCards),
  ]).then(initGameUI);
}

/**
 * Fetches n cards and adds them to the target array.
 * @param {number} n - Number of cards to fetch.
 * @param {Array} target - Target array to push cards into.
 * @returns {Promise[]} Array of Promises for each card fetch.
 */
function fetchCards(n, target) {
  return Array.from({ length: n }, async () => {
    const id = Math.floor(Math.random() * 1000) + 1;
    const p = await getPokemon(id);
    return p && target.push(p);
  });
}

/**
 * Initializes the UI after loading the cards.
 * @returns {void}
 */
function initGameUI() {
  displayPlayerCards();
  displayComputerCard();
  document.getElementById("start-game").style.display = "none";
  document.getElementById("game-area").style.display = "flex";
}

/**
 * Displays all player cards in the UI.
 * @returns {void}
 */
function displayPlayerCards() {
  const playerCardsDiv = document.getElementById("player-cards");
  playerCardsDiv.innerHTML = "";

  playerCards.forEach((card, index) => {
    playerCardsDiv.innerHTML += playerCardTemplate(card, index);
  });
}

/**
 * Displays a random computer card (hidden) and sets the current category.
 * @returns {void}
 */
function displayComputerCard() {
  const randomIndex = Math.floor(Math.random() * computerCards.length);
  currentComputerCard = computerCards[randomIndex];
  document.getElementById("computer-card").innerHTML =
    computerCardHiddenTemplate();
  computerCards.splice(randomIndex, 1);
  document.getElementById("computer-card").style.display = "flex";
  currentCategory = updateCurrentCategory();
}

/**
 * Selects a player card by index and enables the compare button.
 * @param {number} index - Index of the selected player card.
 * @returns {void}
 */

window.handleSelectPlayerCard = function (index) {
  currentPlayerCard = playerCards[index];
  document
    .querySelectorAll("#player-cards .card")
    .forEach((card) => card.classList.remove("selected"));
  document
    .querySelectorAll("#player-cards .card")
    [index].classList.add("selected");
  document.getElementById("compare-cards").disabled = false;
};

/**
 * Displays the selected player card in the UI.
 * @returns {void}
 */
function displaySelectedPlayerCard() {
  document.getElementById("selected-player-card").innerHTML =
    selectedPlayerCardTemplate(currentPlayerCard);
}

/**
 * Updates the round counter in the UI.
 * @returns {void}
 */
function updateRoundCounter() {
  const currentRound = totalRounds - turnsRemaining + 1;
  document.getElementById("round-counter").innerText = `Round ${currentRound}`;
}

/**
 * Selects a random category for comparison and updates the UI.
 * @returns {string} The selected category.
 */
function updateCurrentCategory() {
  const randomIndex = Math.floor(Math.random() * comparisonCategories.length);
  const currentCategory = comparisonCategories[randomIndex];
  updateRoundCounter();
  document.getElementById(
    "current-category"
  ).innerText = `Compare: ${currentCategory}`;
  return currentCategory;
}

/**
 * Updates the score based on the winner and checks for game end.
 * @param {string} winner - "Player", "Computer", or "Draw".
 * @returns {void}
 */
function updateScore(winner) {
  if (winner === "Player") {
    playerScore++;
  } else if (winner === "Computer") {
    computerScore++;
  }
  turnsRemaining--;
  document.getElementById("player-score").innerText = playerScore;
  document.getElementById("computer-score").innerText = computerScore;
  if (turnsRemaining === 0) {
    const finalResult =
      playerScore > computerScore
        ? "You win! Congratulations"
        : playerScore < computerScore
        ? "Computer win!"
        : "Undecided!";
    showFinalResult(finalResult);
  }
}

/**
 * Shows the final result in a modal dialog.
 * @param {string} message - The result message to display.
 * @returns {void}
 */
function showFinalResult(message) {
  const modal = document.getElementById("modal");
  document.getElementById("final-result").innerText = message;
  modal.style.display = "flex";
  document.getElementById("game-area").style.display = "none";
  document.getElementById("start-game").style.display = "flex";
  document.getElementById("game-area").style.display = "none";
}

/**
 * Displays the full computer card after comparison.
 * @returns {void}
 */
function displayFullComputerCard() {
  document.getElementById("selected-computer-card").innerHTML =
    computerCardTemplate(currentComputerCard);
}

/**
 * Compares the selected cards and updates the UI and score.
 * @returns {void}
 */
function handleCompareCards() {
  if (!currentPlayerCard) return alert("Please choose a card!");
  document.getElementById("comparison-field").style.display = "flex";
  const statMap = { attack: 1, defense: 2, speed: 0, hp: 3 };
  const idx = statMap[currentCategory];
  const playerValue = currentPlayerCard.stats[idx].base_stat;
  const computerValue = currentComputerCard.stats[idx].base_stat;
  const winner =
    playerValue > computerValue
      ? "Player"
      : playerValue < computerValue
      ? "Computer"
      : "Draw";
  document.getElementById("round-result").textContent = `${winner} win`;
  updateScore(winner);
  displayFullComputerCard();
  displaySelectedPlayerCard();
  setTimeout(resetAfterCompare, 3000);
}

/**
 * Resets the UI and cards after comparison.
 * @returns {void}
 */
function resetAfterCompare() {
  document.getElementById("comparison-field").style.display = "none";
  if (computerCards.length > 0) displayComputerCard();
  const index = playerCards.indexOf(currentPlayerCard);
  if (index > -1) playerCards.splice(index, 1);
  currentPlayerCard = null;
  document.getElementById("player-cards").innerHTML = "";
  displayPlayerCards();
  document.getElementById("compare-cards").disabled = true;
}

document
  .getElementById("compare-cards")
  .addEventListener("click", handleCompareCards);

document.getElementById("close-modal").addEventListener("click", () => {
  document.getElementById("modal").style.display = "none";
  document.getElementById("start-game").style.display = "flex";
  document.getElementById("game-area").style.display = "none";
  playerScore = 0;
  computerScore = 0;
  turnsRemaining = totalRounds;
  document.getElementById("player-score").innerText = playerScore;
  document.getElementById("computer-score").innerText = computerScore;
});
