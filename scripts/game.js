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

function loadPokemonData() {
  playerCards = [];
  computerCards = [];
  let promises = [];
  for (let i = 0; i < 6; i++) {
    // Lade 6 Pokémon für den Spieler
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
    // Lade 6 Pokémon für den Computer
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

// Anzeige der Spieler-Karten
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

// Anzeige der Computerkarte mit Fragezeichen
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

// Karte des Spielers auswählen
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

// Funktion zum Aktualisieren des Rundenzählers
function updateRoundCounter() {
  const currentRound = totalRounds - turnsRemaining + 1;
  document.getElementById("round-counter").innerText = `Round ${currentRound}`;
}

// Aktuelle Kategorie für den Vergleich auswählen
function updateCurrentCategory() {
  const randomIndex = Math.floor(Math.random() * comparisonCategories.length);
  const currentCategory = comparisonCategories[randomIndex];
  updateRoundCounter();
  document.getElementById(
    "current-category"
  ).innerText = `Compare: ${currentCategory}`;
  return currentCategory;
}

// Aktualisierung des Punktestands
function updateScore(winner) {
  if (winner === "Player") {
    playerScore++;
  } else if (winner === "Computer") {
    computerScore++;
  }
  turnsRemaining--;

  // Punktestände und verbleibende Züge aktualisieren
  document.getElementById("player-score").innerText = playerScore;
  document.getElementById("computer-score").innerText = computerScore;

  // Überprüfen, ob das Spiel vorbei ist
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

// Modal für das Endergebnis anzeigen
function showFinalResult(message) {
  const modal = document.getElementById("modal");
  document.getElementById("final-result").innerText = message;
  modal.style.display = "flex";
  document.getElementById("game-area").style.display = "none";
  document.getElementById("start-game").style.display = "flex";
  document.getElementById("game-area").style.display = "none";
}

// Funktion zur Anzeige der vollständigen Computerkarte und der ausgewählten Spielerkarte im Vergleichsfeld
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
// Event-Listener für den Vergleichs-Button
document.getElementById("compare-cards").addEventListener("click", () => {
  if (!currentPlayerCard) {
    alert("Please choose a card!");
    return;
  }
  let playerValue, computerValue;
  document.getElementById("comparison-field").style.display = "flex";

  // Die bereits festgelegte Kategorie verwenden
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
  // Rundengewinner anzeigen
  document.getElementById("round-result").textContent = `${winner} win`;
  updateScore(winner);

  displayFullComputerCard();
  displaySelectedPlayerCard();

  setTimeout(() => {
    document.getElementById("comparison-field").style.display = "none";
    if (computerCards.length > 0) {
      displayComputerCard(); // Neue verdeckte Computerkarte anzeigen
    } else {
      console.log("No more computer cards left!");
    }
  }, 3000);
  // Entferne die gespielte Karte aus dem Spieler-Karten-Array
  const index = playerCards.indexOf(currentPlayerCard);
  if (index > -1) {
    playerCards.splice(index, 1); // Entferne die Karte
  }

  // Setze die aktuell ausgewählte Karte auf null zurück
  currentPlayerCard = null;

  // Aktualisiere die Anzeige der Spieler-Karten
  document.getElementById("player-cards").innerHTML = "";
  displayPlayerCards();

  document.getElementById("compare-cards").disabled = true;
});

// Event-Listener für das Schließen des Modals
document.getElementById("close-modal").addEventListener("click", () => {
  location.reload();
});
