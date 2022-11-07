const BASE_URL = "https://aerodatabox.p.rapidapi.com/airports/search/term?q=";

const options = {
  method: "GET",
  headers: {
    "X-RapidAPI-Key": "",
    "X-RapidAPI-Host": "aerodatabox.p.rapidapi.com",
  },
};

const airportCardsContainer = document.querySelector(".airport__cards");
const searchInput = document.querySelector("[data-search]");
const clearInput = document.querySelector("[data-close-button]");
// const loadIndicator = document.querySelector(".loading");

searchInput.addEventListener("input", (e) => {
  const value = e.target.value;
  updateDebounceText(e.target.value);
});

clearInput.addEventListener("click", () => {
  searchInput.value = "";
  updateDebounceText(searchInput.value);
});

const displayLoadIndicator = function () {
  let html = `<div class="loading"></div>`;
  airportCardsContainer.insertAdjacentHTML("beforeend", html);
  // loadIndicator.classList.add("display");
};

const hideLoadIndicator = function () {
  document.querySelector(".loading").remove();
};

const debounce = function (cb, delay = 1000) {
  let timeout;

  return (...args) => {
    clearTimeout(timeout);
    clearSearchResults();
    timeout = setTimeout(() => {
      if (args[0].length === 0) return;
      cb(...args);
    }, delay);
  };
};

const clearSearchResults = function () {
  airportCardsContainer.innerHTML = "";
};

const updateDebounceText = debounce((text) => {
  displayLoadIndicator();
  showSearchResults(text);
});

const getAirports = async function (searchText, options = {}) {
  if (searchText.length <= 2) {
    hideLoadIndicator();
    throw new Error("Search input must be at least 3 characters");
  }

  const result = await fetch(`${BASE_URL}${searchText}&limit=10`, options);
  hideLoadIndicator();

  if (!result.ok) throw new Error(`Fetching error: ${result.status}`);

  const dataResult = await result.json();
  return dataResult.items;
};

const renderAirportCard = function (item) {
  let html = `
    <li class="airport__card">
      <h2 class="airport__card-name">${item.name}</h2>
      <span class="airport__card-location">Airport location: <strong>${
        item.municipalityName === undefined ? "Unknown" : item.municipalityName
      }</strong></span>
      <span class="airport__card-icao">Airport ICAO: <strong>${
        item.icao
      }</strong></span>
    </li>
  `;
  airportCardsContainer.insertAdjacentHTML("beforeend", html);
};

const renderError = (text) => {
  const html = `
    <span class="airport__cards-no-result">${text}</span>
  `;
  airportCardsContainer.insertAdjacentHTML("beforeend", html);
};

const showSearchResults = async function (text) {
  return await getAirports(text, options)
    .then((data) => {
      console.log(data);

      if (data.length === 0) throw new Error("YoY! No results were found...");

      data.forEach((airport) => {
        renderAirportCard(airport);
      });
    })
    .catch((err) => renderError(err.message));
};
