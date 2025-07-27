import {
  traverseEvolutionChain,
  renderEvolutionChain,
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

interface Pokemon {
  id: number;
  name: string;
  image: string;
  types: string[];
}

interface SpeciesData {
  id: number;
  color: { name: string };
  evolution_chain: { url: string };
}

interface AbilityDescription {
  name: string;
  effect_entries?: any[];
}

interface PokemonData {
  currentPokemon: Pokemon;
  speciesData: SpeciesData;
  abilityDescriptions: AbilityDescription[];
}

let pokemons: Pokemon[] = [];
let pokemonDataArray: PokemonData[] = [];
const pokemonCardContainer = document.getElementById(
  "pokemon-cards-container"
) as HTMLElement;
const loader = document.querySelector(".first-loader-container") as HTMLElement;
const modal = document.querySelector(".modal-container") as HTMLElement;
let offset: number = 0;
const limit: number = 20;

window.addEventListener("DOMContentLoaded", () => {
  displayHidden();
  showLoader();
  loadData().then(() => {
    hideLoader();
    displayVisible();
  });
  const input = document.getElementById(
    "search-input-pokemon"
  ) as HTMLInputElement;
  input.addEventListener("input", filterPokemons);
});

function showLoader(): void {
  loader.style.display = "flex";
}

function hideLoader(): void {
  loader.style.display = "none";
}

async function loadData(): Promise<void> {
  await loadPokemonCards();
  loadMoreBtn();
  setTimeout(() => {
    hideLoader();
    displayVisible();
  }, 3000);
}

function displayHidden(): void {
  setDisplay(".loadMore-spinner", "none");
  setDisplay(".search-container", "none");
  setDisplay(".loadmore-container", "none");
}

function displayVisible(): void {
  setDisplay(".search-container", "flex");
  setDisplay(".loadmore-container", "flex");
}

async function getPokemonList(offset: number, limit: number): Promise<any> {
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

async function getAllPokemonData(id: string | number): Promise<any> {
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

async function getPokemonSpeciesDetails(url: string): Promise<any> {
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

async function getPokemonAbilityDetails(url: string): Promise<any> {
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

async function loadPokemonCards(currentOffset: number = offset): Promise<void> {
  const pokemonList = await getPokemonList(currentOffset, limit);
  const newPokemonData = await Promise.all(
    pokemonList.results.map(fetchSinglePokemonData)
  );
  pokemonDataArray.push(...newPokemonData);
  newPokemonData.forEach(addPokemonToUI);
}

async function fetchSinglePokemonData(pokemon: any): Promise<PokemonData> {
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

function buildCurrentPokemon(singlePokemonData: any): Pokemon {
  return {
    id: singlePokemonData.id,
    name: capitalize(singlePokemonData.name),
    image: singlePokemonData.sprites.other.home.front_default,
    types: singlePokemonData.types.map((type: any) => type.type.name),
  };
}

async function fetchAbilityDescriptions(abilities: any[]): Promise<any[]> {
  return Promise.all(
    abilities.map((ability: any) =>
      getPokemonAbilityDetails(ability.ability.url)
    )
  );
}

function addPokemonToUI({
  currentPokemon,
  speciesData,
  abilityDescriptions,
}: PokemonData): void {
  pokemons.push(currentPokemon);
  createPokemonCard(currentPokemon, speciesData, abilityDescriptions);
}

function createPokemonCard(
  currentPokemon: Pokemon,
  speciesData: SpeciesData,
  abilityDescriptions: AbilityDescription[]
): HTMLElement | undefined {
  const template = document.getElementById(
    "pokemon-card-template"
  ) as HTMLTemplateElement | null;
  if (!template) {
    logTemplateError();
    return undefined;
  }
  const cardTemplate = template.content.cloneNode(true) as HTMLElement;
  fillCardContent(cardTemplate, currentPokemon, speciesData);
  addCardClickHandler(cardTemplate, currentPokemon.id, showModalForPokemon);
  fillCardTypes(cardTemplate, currentPokemon.types, speciesData.color.name);
  return pokemonCardContainer.appendChild(cardTemplate);
}

function filterPokemons(event: Event): void {
  const filter = (event.target as HTMLInputElement).value.toLowerCase();
  const cards = document.querySelectorAll(".card");

  pokemons.forEach((pokemon, index) => {
    const card = cards[index] as HTMLElement;
    const name = pokemon.name.toLowerCase();
    if (name.includes(filter)) {
      card.style.display = "flex";
    } else {
      card.style.display = "none";
    }
  });
}

function loadMoreBtn(): void {
  const button = document.getElementById("loadMore-btn") as HTMLButtonElement;
  const loader2 = document.querySelector(".loadMore-spinner") as HTMLElement;
  button.addEventListener("click", () => {
    loader2.style.display = "flex";
    button.style.display = "none";
    loadMoreData().then(() => {
      loader2.style.display = "none";
      button.style.display = "flex";
    });
  });
}

async function loadMoreData(): Promise<void> {
  offset += limit;
  await loadPokemonCards(offset);
}

async function showModalForPokemon(pokemonID: number | string): Promise<void> {
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

function fillModal(
  currentPokemon: Pokemon,
  speciesData: SpeciesData,
  abilityDescriptions: AbilityDescription[],
  moreData: any,
  pokeID: number
): void {
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

function showModalHeader(
  currentPokemon: Pokemon,
  speciesData: SpeciesData
): void {
  setModalHeaderText(modal, currentPokemon);
  setModalHeaderImage(modal, currentPokemon);
  updateModalHeaderColor(modal, speciesData.color.name);
}

function showModalAboutStats(
  abilityDescriptions: AbilityDescription[],
  moreData: any
): void {
  const abilitiesContainer = modal.querySelector(
    ".abilities-container"
  ) as HTMLElement;
  abilitiesContainer.innerHTML = "";
  moreData.abilities.forEach((abilityObj: any, index: number) => {
    abilitiesContainer.appendChild(
      createAbilityDiv(abilityObj, abilityDescriptions[index])
    );
  });
}

function showModalBaseStats(moreData: any): void {
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

function showModalCardTabs(): void {
  const tabButtons = document.querySelectorAll(
    ".tab-button"
  ) as NodeListOf<HTMLElement>;
  const infoBoxes = document.querySelectorAll(
    ".tab-content"
  ) as NodeListOf<HTMLElement>;
  hideAllTabContents(infoBoxes);
  deactivateAllTabs(tabButtons);
  activateFirstTab(tabButtons, infoBoxes);
  tabButtons.forEach((tab) =>
    tab.addEventListener("click", () =>
      handleTabClick(tab, tabButtons, infoBoxes)
    )
  );
}

const prevArrow = document.getElementById("prev-arrow") as HTMLElement;
const nextArrow = document.getElementById("next-arrow") as HTMLElement;

function nextPokemon(pokeID: number): void {
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

function prevPokemon(pokeID: number): void {
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

async function showEvolutionChain(pokeID: number): Promise<void> {
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

async function fetchEvolutionChainData(url: string): Promise<any> {
  const response = await fetch(url);
  return await response.json();
}

function buildEvolutionList(chain: any): string[] {
  const result: string[] = [];
  traverseEvolutionChain(chain, result);
  return result;
}
