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
function getPokemon(id) {
  return fetch(`https://pokedex.mimo.dev/api/pokemon/${id}`)
    .then((response) => {
      if (!response.ok) throw new Error("Fehler beim Abrufen der Daten");
      return response.json();
    })
    .catch((error) => {
      console.error("Fehler:", error);
      return null;
    });
}

/**
 * Loads Pokémon data for both player and computer, then displays the cards.
 * @returns {void}
 */
function loadPokemonData() {
  playerCards = [];
  computerCards = [];
  let promises = [];
  for (let i = 0; i < 6; i++) {
    const id = Math.floor(Math.random() * 1000) + 1;
    promises.push(
      getPokemon(id).then((pokemon) => {
        if (pokemon) {
          playerCards.push(pokemon);
        }
      })
    );
  }
  for (let i = 0; i < 6; i++) {
    const id = Math.floor(Math.random() * 1000) + 1;
    promises.push(
      getPokemon(id).then((pokemon) => {
        if (pokemon) {
          computerCards.push(pokemon);
        }
      })
    );
  }
  Promise.all(promises).then(() => {
    displayPlayerCards();
    displayComputerCard();
  });

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
    playerCardsDiv.innerHTML += `
                      <div class="card" onclick="selectPlayerCard(${index})">
                        <div class="card-header">${card.name}</div>
                        <div class="card-image"><img src="${card.sprites.other.home.front_default}" alt="${card.name}"></div>
                        <div class="card-content">
                            <p>Description of the character goes here. </p>
                            </div>
                            <div class="card-skill-container">
                                <div class="skill-one"><p class="skill-name">Attack</p><p>${card.stats[1].base_stat}</p></div>
                                <div class="skill-two"><p class="skill-name">Defense</p><p>${card.stats[2].base_stat}</p></div>
                                <div class="skill-three"><p class="skill-name">Speed</p><p>${card.stats[0].base_stat}</p></div>
                                <div class="skill-four"><p class="skill-name">HP</p><p>${card.stats[3].base_stat}</p></div>
                            </div>
                        </div>
                `;
  });
}

/**
 * Displays a random computer card (hidden) and sets the current category.
 * @returns {void}
 */
function displayComputerCard() {
  const randomIndex = Math.floor(Math.random() * computerCards.length);
  currentComputerCard = computerCards[randomIndex];
  document.getElementById("computer-card").innerHTML = `
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
  computerCards.splice(randomIndex, 1);
  document.getElementById("computer-card").style.display = "flex";
  currentCategory = updateCurrentCategory();
}

/**
 * Selects a player card by index and enables the compare button.
 * @param {number} index - Index of the selected player card.
 * @returns {void}
 */
function selectPlayerCard(index) {
  currentPlayerCard = playerCards[index];
  document
    .querySelectorAll("#player-cards .card")
    .forEach((card) => card.classList.remove("selected"));
  document
    .querySelectorAll("#player-cards .card")
    [index].classList.add("selected");
  document.getElementById("compare-cards").disabled = false;
}

/**
 * Displays the selected player card in the UI.
 * @returns {void}
 */
function displaySelectedPlayerCard() {
  document.getElementById("selected-player-card").innerHTML = `
            <div class="card">
                <div class="card-header">${currentPlayerCard.name}</div>
                <div class="card-image"><img src="${currentPlayerCard.sprites.other.home.front_default}" alt="${currentPlayerCard.name}"></div>
                <div class="card-skill-container">
                    <div class="skill-one"><p class="skill-name">Attack</p><p>${currentPlayerCard.stats[1].base_stat}</p></div>
                    <div class="skill-two"><p class="skill-name">Defense</p><p>${currentPlayerCard.stats[2].base_stat}</p></div>
                    <div class="skill-three"><p class="skill-name">Speed</p><p>${currentPlayerCard.stats[0].base_stat}</p></div>
                    <div class="skill-four"><p class="skill-name">HP</p><p>${currentPlayerCard.stats[3].base_stat}</p></div>
                </div>
            </div>
        `;
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
  document.getElementById("selected-computer-card").innerHTML = `
      <div class="card">
          <div class="card-header">${currentComputerCard.name}</div>
          <div class="card-image"><img src="${currentComputerCard.sprites.other.home.front_default}" alt="${currentComputerCard.name}"></div>
          <div class="card-skill-container">
              <div class="skill-one"><p class="skill-name">Attack</p><p>${currentComputerCard.stats[1].base_stat}</p></div>
              <div class="skill-two"><p class="skill-name">Defense</p><p>${currentComputerCard.stats[2].base_stat}</p></div>
              <div class="skill-three"><p class="skill-name">Speed</p><p>${currentComputerCard.stats[0].base_stat}</p></div>
              <div class="skill-four"><p class="skill-name">HP</p><p>${currentComputerCard.stats[3].base_stat}</p></div>
          </div>
      </div>
  `;
}

document.getElementById("compare-cards").addEventListener("click", () => {
  if (!currentPlayerCard) {
    alert("Please choose a card!");
    return;
  }
  let playerValue, computerValue;
  document.getElementById("comparison-field").style.display = "flex";

  switch (currentCategory) {
    case "attack":
      playerValue = currentPlayerCard.stats[1].base_stat;
      computerValue = currentComputerCard.stats[1].base_stat;
      break;
    case "defense":
      playerValue = currentPlayerCard.stats[2].base_stat;
      computerValue = currentComputerCard.stats[2].base_stat;
      break;
    case "speed":
      playerValue = currentPlayerCard.stats[0].base_stat;
      computerValue = currentComputerCard.stats[0].base_stat;
      break;
    case "hp":
      playerValue = currentPlayerCard.stats[3].base_stat;
      computerValue = currentComputerCard.stats[3].base_stat;
      break;
  }

  let winner;
  if (playerValue > computerValue) {
    winner = "Player";
  } else if (playerValue < computerValue) {
    winner = "Computer";
  } else {
    winner = "Draw";
  }

  document.getElementById("round-result").textContent = `${winner} win`;
  updateScore(winner);

  displayFullComputerCard();
  displaySelectedPlayerCard();

  setTimeout(() => {
    document.getElementById("comparison-field").style.display = "none";
    if (computerCards.length > 0) {
      displayComputerCard(); 
    } else {
      console.log("No more computer cards left!");
    }
  }, 3000);
  const index = playerCards.indexOf(currentPlayerCard);
  if (index > -1) {
    playerCards.splice(index, 1); 
  }

  currentPlayerCard = null;
  document.getElementById("player-cards").innerHTML = "";
  displayPlayerCards();
  document.getElementById("compare-cards").disabled = true;
});

Modals
