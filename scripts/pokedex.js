// Pokemon API
// https://pokeapi.co/api/v2/pokemon?limit=100&offset=0
// limit zeigt 100 pokemons an
// offset sagt, von wo wir aus starten -0 bei index 0

// const template = document
//  .getElementById("pokemon-card-template")
//  .content.cloneNode(true);
//.content nimmt den div card container, mit cloneNode(true) nehme ich alle Kindelemente, die in dem Container sind. Mit false nur den ersten

// https://pokeapi.co/api/v2/pokemon/1/
// https://pokeapi.co/api/v2/pokemon-species/1/
//https://pokeapi.co/api/v2/ability/66/ - descriptions [1].effect

// ---------------------------------------------------------------------------------------------------------------------------------------------------------//

let pokemons = [];
let pokemonDataArray = [];
const pokemonCardContainer = document.getElementById("pokemon-cards-container");
const loader = document.querySelector(".first-loader-container");
const modal = document.querySelector(".modal-container");

let offset = 0;
const limit = 20;

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

function showLoader() {
  loader.style.display = "flex";
}

function hideLoader() {
  loader.style.display = "none";
}

async function loadData() {
  await loadPokemonCards();
  loadMoreBtn();

  setTimeout(() => {
    hideLoader();
    displayVisible();
  }, 3000);
}

function displayHidden() {
  document.querySelector(".loadMore-spinner").style.display = "none";
  document.querySelector(".search-container").style.display = "none";
  document.querySelector(".loadmore-container").style.display = "none";
}

function displayVisible() {
  document.querySelector(".search-container").style.display = "flex";
  document.querySelector(".loadmore-container").style.display = "flex";
}

//--------------------------- fetch different Pokemon Data -----------------------//
async function getPokemonList(offset, limit) {
  try {
    let res = await fetch(
      `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`
    );
    if (!res.ok) {
      throw new Error(`HTTP Error! Status: ${res.status}`);
    }
    return await res.json(); // enthält: .results = Array mit name + url
  } catch (error) {
    console.error("Fehler beim Abrufen der Pokémon-Liste:", error);
  }
}

async function getAllPokemonData(id) {
  try {
    let response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Fehler beim Abrufen der Pokémon-Daten:", error);
  }
}

async function getPokemonSpeciesDetails(url) {
  try {
    let res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP Error! Status: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error("Fehler beim Abrufen der Pokémon-Daten:", error);
  }
}
async function getPokemonAbilityDetails(url) {
  try {
    let res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP Error! Status: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error("Fehler beim Abrufen der Pokémon-Daten:", error);
  }
}

//------------------------------------------------------------------------------------//

async function loadPokemonCards(currentOffset = offset) {
  const pokemonList = await getPokemonList(currentOffset, limit);

  const newPokemonData = await Promise.all(
    pokemonList.results.map(async (pokemon) => {
      const singlePokemonData = await getAllPokemonData(pokemon.name);
      const speciesData = await getPokemonSpeciesDetails(
        singlePokemonData.species.url
      );

      const abilityDescriptions = [];
      for (const ability of singlePokemonData.abilities) {
        const description = await getPokemonAbilityDetails(ability.ability.url);
        abilityDescriptions.push(description);
      }

      const types = singlePokemonData.types.map((type) => type.type.name);
      const capitalizedName =
        singlePokemonData.name.charAt(0).toUpperCase() +
        singlePokemonData.name.slice(1);

      const currentPokemon = {
        id: singlePokemonData.id,
        name: capitalizedName,
        image: singlePokemonData.sprites.other.home.front_default,
        types: types,
      };

      return { currentPokemon, speciesData, abilityDescriptions };
    })
  );

  // so werden Daten anhängt, nicht ersetzen -> spread synthax
  pokemonDataArray.push(...newPokemonData);

  newPokemonData.forEach(
    ({ currentPokemon, speciesData, abilityDescriptions }) => {
      pokemons.push(currentPokemon);
      createPokemonCard(currentPokemon, speciesData, abilityDescriptions);
    }
  );
}

function createPokemonCard(currentPokemon, speciesData, abilityDescriptions) {
  const template = document.getElementById("pokemon-card-template");
  if (!template) {
    console.error("Pokemon Card Template nicht gefunden!");
    return;
  }
  const cardTemplate = template.content.cloneNode(true);
  const originalColor = speciesData.color.name;
  const statsContainer = cardTemplate.querySelector(
    ".pokemon-stats-container div"
  );
  const card = cardTemplate.querySelector(".card");
  card.setAttribute("data-id", currentPokemon.id);
  card.addEventListener("click", (event) => {
    const pokemonID = event.currentTarget.getAttribute("data-id");
    showModalForPokemon(pokemonID);
  });

  cardTemplate.querySelector(".pokemon-index").innerText = currentPokemon.id;
  cardTemplate.querySelector(".pokemon-name").innerText = currentPokemon.name;
  cardTemplate
    .querySelector(".pokemon-img-container>img")
    .setAttribute("src", currentPokemon.image);
  cardTemplate
    .querySelector(".pokemon-img-container")
    .classList.add(`color-${originalColor}`);

  statsContainer.innerHTML = "";

  currentPokemon.types.forEach((type) => {
    const icon = document.createElement("div");
    icon.classList.add("type", type, originalColor);
    statsContainer.appendChild(icon);
  });
  return pokemonCardContainer.appendChild(cardTemplate);
}

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
async function loadMoreData() {
  offset += limit;
  await loadPokemonCards(offset);
  // if (offset + limit >= 200) {
  //   button.style.display = "none";
  // }
}

// ------------------------------- Modal Card ------------------------- //
async function showModalForPokemon(pokemonID) {
  let found = pokemonDataArray.find(
    ({ currentPokemon }) => currentPokemon.id == pokemonID
  );

  if (!found) {
    console.error("Pokemon not found!");
    return;
  }
  let { currentPokemon, speciesData, abilityDescriptions } = found;
  let moreData = await getAllPokemonData(currentPokemon.name);

  showModalHeader(currentPokemon, speciesData);
  showModalAboutStats(abilityDescriptions, moreData);
  showModalBaseStats(moreData);
  modal.style.display = "flex";
  let pokeID = found.speciesData.id;
  showModalCardTabs();
  showEvolutionChain(pokeID);
  nextPokemon(pokeID);
  prevPokemon(pokeID);
  closeModal();
}

function showModalHeader(currentPokemon, speciesData) {
  const originalColor = speciesData.color.name;
  modal.querySelector(".pokemon-index").innerText = currentPokemon.id;
  modal.querySelector(".pokemon-name").innerText = currentPokemon.name;
  modal.querySelector(".pokeimg-modal-container img").src =
    currentPokemon.image;

  const pokeimgHeader = modal.querySelector(".pokeimg-modal-container");

  // Alle Klassen, die mit "color-" beginnen, entfernen
  pokeimgHeader.className = pokeimgHeader.className
    .split(" ")
    .filter((className) => !className.startsWith("color-"))
    .join(" ");

  pokeimgHeader.classList.add(`color-${originalColor}`);
}

function showModalAboutStats(abilityDescriptions, moreData) {
  const abilitiesContainer = modal.querySelector(".abilities-container");
  abilitiesContainer.innerHTML = "";

  moreData.abilities.forEach((abilityObj, index) => {
    const abilityName = abilityObj.ability.name;
    let description = "No description available.";
    if (
      abilityDescriptions[index] &&
      abilityDescriptions[index].effect_entries
    ) {
      const entries = abilityDescriptions[index].effect_entries;
      const englishEntry = entries.find(function (entry) {
        return entry.language.name === "en";
      });
      if (englishEntry) {
        description = englishEntry.short_effect;
      }
    }
    // Erstelle ein HTML-Element für die Fähigkeit
    const abilityDiv = document.createElement("div");
    abilityDiv.classList.add("ability");

    abilityDiv.innerHTML = `
      <p><em><strong>${abilityName}</strong></em></p>
      <p><em>${description}</em></p>
    `;
    abilitiesContainer.appendChild(abilityDiv);
  });
}

function showModalBaseStats(moreData) {
  const { height, weight, stats } = moreData;

  const updateStat = (className, value) => {
    document.querySelector(`.${className} progress`).value = value;
    document.querySelector(`.${className}-text`).innerText = value;
  };

  updateStat("height", height);
  updateStat("weight", weight);

  const statMap = [
    "hp",
    "attack",
    "defense",
    "special-attack",
    "special-defense",
    "speed",
  ];

  statMap.forEach((name, index) => {
    updateStat(name, stats[index].base_stat);
  });
}

function showModalCardTabs() {
  const tabButtons = document.querySelectorAll(".tab-button");
  const infoBoxes = document.querySelectorAll(".tab-content");

  infoBoxes.forEach((box) => {
    box.style.display = "none";
  });
  tabButtons.forEach((tab) => tab.classList.remove("active-tab"));

  if (tabButtons.length && infoBoxes.length) {
    tabButtons[0].classList.add("active-tab");
    let firstTarget = tabButtons[0].dataset.target;
    document.querySelector(`.${firstTarget}`).style.display = "flex";
  }

  tabButtons.forEach((tab) => {
    tab.addEventListener("click", () => {
      updateTabs(tab, tabButtons);
      updateTabsContent(tab, infoBoxes);
    });
  });
}
function updateTabs(tab, tabButtons) {
  tabButtons.forEach((t) => t.classList.remove("active-tab"));
  tab.classList.add("active-tab");
}
function updateTabsContent(tab, infoBoxes) {
  infoBoxes.forEach((box) => (box.style.display = "none"));
  const targetClass = tab.dataset.target;
  const targetBox = document.querySelector(`.${targetClass}`);
  if (targetBox) targetBox.style.display = "flex";
}

const prevArrow = document.getElementById("prev-arrow");
const nextArrow = document.getElementById("next-arrow");

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

function closeModal() {
  let closeBtn = document.getElementById("close-modal");
  closeBtn.addEventListener("click", () => {
    document.querySelector(".modal-container").style.display = "none";
  });
  document
    .querySelector(".modal-container")
    .addEventListener("click", (event) => {
      event.stopPropagation();
    });
}

async function showEvolutionChain(pokeID) {
  const found = pokemonDataArray.find(
    ({ currentPokemon }) => currentPokemon.id === pokeID
  );
  if (!found) {
    console.error("Pokémon nicht gefunden für Evolution Chain!");
    return;
  }

  const speciesData = found.speciesData;
  const evoChainUrl = speciesData.evolution_chain.url;

  try {
    const response = await fetch(evoChainUrl);
    const data = await response.json();
    const evolutionList = [];

    traverseEvolutionChain(data.chain, evolutionList);
    renderEvolutionChain(evolutionList);
  } catch (error) {
    console.error("Fehler beim Laden der Evolution Chain:", error);
  }
}

function traverseEvolutionChain(chainNode, resultArray) {
  resultArray.push(chainNode.species.name);

  if (chainNode.evolves_to.length > 0) {
    for (const nextEvolution of chainNode.evolves_to) {
      traverseEvolutionChain(nextEvolution, resultArray);
    }
  }
}

async function renderEvolutionChain(evolutionList) {
  const container = document.querySelector(".evo-chain-info");
  container.innerHTML = "";

  for (let i = 0; i < evolutionList.length; i++) {
    const name = evolutionList[i];

    // Hole Bilddaten für jedes Pokémon
    const pokeData = await getAllPokemonData(name);
    const imgURL = pokeData.sprites.other["official-artwork"].front_default;

    // Erstelle das Bild-Element
    const img = document.createElement("img");
    img.src = imgURL;
    img.alt = name;
    img.title = name;
    img.classList.add("evo-img");

    container.appendChild(img);

    // Pfeil zwischen den Bildern, außer nach dem letzten
    if (i < evolutionList.length - 1) {
      const arrow = document.createElement("span");
      arrow.innerHTML = `<i class="fa-solid fa-arrow-right"></i>`;
      arrow.classList.add("evo-arrow");
      container.appendChild(arrow);
    }
  }
}
