import './global_style.scss'
import * as bootstrap from 'bootstrap'

const PRICES_URL = 'https://interview.switcheo.com/prices.json';
const TOKEN_IMG_URL = 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/';

let prices = {};
let tokens = [];

const fromTokenBtn = document.getElementById('from-token-btn');
const fromTokenMenu = document.getElementById('from-token-menu');
const toTokenBtn = document.getElementById('to-token-btn');
const toTokenMenu = document.getElementById('to-token-menu');
let selectedFromToken = '';
let selectedToToken = '';
const inputAmount = document.getElementById('input-amount');
const outputAmount = document.getElementById('output-amount');
const swapForm = document.getElementById('swap-form');
const swapBtn = document.getElementById('swap-btn');
const loading = document.getElementById('loading');
const inputError = document.getElementById('input-error');
const formError = document.getElementById('form-error');


async function fetchPrices() {
	const res = await fetch(PRICES_URL);
	const data = await res.json();
	const latest = {};
	data.forEach(item => {
		if (!latest[item.currency] || new Date(item.date) > new Date(latest[item.currency].date)) {
			latest[item.currency] = item;
		}
	});
	prices = Object.fromEntries(Object.entries(latest).map(([k, v]) => [k, v.price]));
	tokens = Object.keys(prices).sort();
}

function tokenDropdownItem(token) {
	const img = `${TOKEN_IMG_URL}${token}.svg`;
	return `<li>
    <a class="dropdown-item d-flex align-items-center" href="#" data-token="${token}">
      <img src="${img}" class="token-img me-2" onerror="this.style.display='none'"/>
      <span>${token}</span>
    </a>
  </li>`;
}

function populateTokenDropdowns() {
	fromTokenMenu.innerHTML = tokens.map(tokenDropdownItem).join('');
	toTokenMenu.innerHTML = tokens.map(tokenDropdownItem).join('');
	// Set default selections
	selectedFromToken = tokens[0];
	selectedToToken = tokens[1];
	updateDropdownSelection();
}

function updateDropdownSelection() {
	const fromImg = `${TOKEN_IMG_URL}${selectedFromToken}.svg`;
	fromTokenBtn.innerHTML = `<img src="${fromImg}" class="token-img me-2" onerror="this.style.display='none'"/> ${selectedFromToken}`;
	const toImg = `${TOKEN_IMG_URL}${selectedToToken}.svg`;
	toTokenBtn.innerHTML = `<img src="${toImg}" class="token-img me-2" onerror="this.style.display='none'"/> ${selectedToToken}`;
	computeOutput();
}

function setupDropdownHandlers() {
	fromTokenMenu.addEventListener('click', (e) => {
		const item = e.target.closest('a[data-token]');
		if (item) {
			selectedFromToken = item.dataset.token;
			updateDropdownSelection();
			e.preventDefault();
		}
	});
	toTokenMenu.addEventListener('click', (e) => {
		const item = e.target.closest('a[data-token]');
		if (item) {
			selectedToToken = item.dataset.token;
			updateDropdownSelection();
			e.preventDefault();
		}
	});
}

function computeOutput() {
	const from = selectedFromToken;
	const to = selectedToToken;
	const amt = parseFloat(inputAmount.value);
	if (!from || !to || isNaN(amt) || amt <= 0) {
		outputAmount.value = '';
		return;
	}
	const fromPrice = prices[from];
	const toPrice = prices[to];
	if (!fromPrice || !toPrice) {
		outputAmount.value = '';
		return;
	}
	const out = amt * fromPrice / toPrice;
	outputAmount.value = out.toFixed(6);
}

function validateForm() {
	inputError.textContent = '';
	formError.textContent = '';
	if (selectedFromToken === selectedToToken) {
		formError.textContent = 'Please select different tokens to swap.';
		return false;
	}
	const amt = parseFloat(inputAmount.value);
	if (isNaN(amt) || amt <= 0) {
		inputError.textContent = 'Enter a valid amount greater than 0.';
		return false;
	}
	return true;
}

inputAmount.addEventListener('input', computeOutput);

swapForm.addEventListener('submit', async (e) => {
	e.preventDefault();
	if (!validateForm()) return;
	swapBtn.disabled = true;
	loading.style.display = '';
	setTimeout(() => {
		loading.style.display = 'none';
		swapBtn.disabled = false;
		alert(`Swapped ${inputAmount.value} ${selectedFromToken} for ${outputAmount.value} ${selectedToToken}!`);
	}, 1500);
});

(async function init() {
	await fetchPrices();
	populateTokenDropdowns();
	setupDropdownHandlers();
	computeOutput();
})();