import './global_style.scss'
import * as bootstrap from 'bootstrap'
import $ from 'jquery';

const PRICES_URL = 'https://interview.switcheo.com/prices.json';
const TOKEN_IMG_URL = 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/';
const ANIMATION_DURATION = 300;

let prices = {};
let tokens = [];

const $fromTokenBtn = $('#from-token-btn');
const $fromTokenMenu = $('#from-token-menu');
const $toTokenBtn = $('#to-token-btn');
const $toTokenMenu = $('#to-token-menu');
let selectedFromToken = '';
let selectedToToken = '';
const $inputAmount = $('#input-amount');
const $outputAmount = $('#output-amount');
const $swapForm = $('#swap-form');
const $swapBtn = $('#swap-btn');
const $loading = $('#loading');
const $arrow = $('#arrow');
const $inputError = $('#input-error');
const $formError = $('#form-error');
const $formSuccess = $('#form-success');

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
      <img src="${img}" class="token-img" onerror="this.style.display='none'"/>
      <span>${token}</span>
    </a>
  </li>`;
}

function populateTokenDropdowns() {
    $fromTokenMenu.html(tokens.map(tokenDropdownItem).join(''));
    $toTokenMenu.html(tokens.map(tokenDropdownItem).join(''));
    selectedFromToken = tokens[0];
    selectedToToken = tokens[1];
    updateDropdownSelection();
}

function updateDropdownSelection() {
    const fromImg = `${TOKEN_IMG_URL}${selectedFromToken}.svg`;
    $fromTokenBtn.html(`<img src="${fromImg}" class="token-img" onerror="this.style.display='none'"/> ${selectedFromToken}`);
    const toImg = `${TOKEN_IMG_URL}${selectedToToken}.svg`;
    $toTokenBtn.html(`<img src="${toImg}" class="token-img" onerror="this.style.display='none'"/> ${selectedToToken}`);
    computeOutput();
}

function setupDropdownHandlers() {
    $fromTokenMenu.on('click', 'a[data-token]', function (e) {
        selectedFromToken = $(this).data('token');
        updateDropdownSelection();
        e.preventDefault();
    });
    $toTokenMenu.on('click', 'a[data-token]', function (e) {
        selectedToToken = $(this).data('token');
        updateDropdownSelection();
        e.preventDefault();
    });
}

function computeOutput() {
    const from = selectedFromToken;
    const to = selectedToToken;
    const amt = parseFloat($inputAmount.val());
    if (!from || !to || isNaN(amt) || amt <= 0) {
        $outputAmount.val('');
        return;
    }
    const fromPrice = prices[from];
    const toPrice = prices[to];
    if (!fromPrice || !toPrice) {
        $outputAmount.val('');
        return;
    }
    const out = amt * fromPrice / toPrice;
    $outputAmount.val(out.toFixed(6));
}

function validateForm() {
    $inputError.text('');
    $formError.text('');
    $formError.hide(ANIMATION_DURATION);
    $formSuccess.hide(ANIMATION_DURATION);
    if (selectedFromToken === selectedToToken) {
        setAlert('Please select different tokens to swap.', $formError);
        return false;
    }
    const amt = parseFloat($inputAmount.val());
    if (isNaN(amt) || amt <= 0) {
        $inputError.text('Enter a valid amount greater than 0.');
        return false;
    }
    return true;
}

function setAlert(message, $alertControl) {
    $alertControl.text(message).show(ANIMATION_DURATION);
}

$inputAmount.on('input', computeOutput);

$swapForm.on('submit', async function (e) {
    e.preventDefault();
    if (!validateForm()) return;
    $swapBtn.prop('disabled', true);
    $loading.show(ANIMATION_DURATION);
    $arrow.hide(ANIMATION_DURATION);
    setTimeout(() => {
        $loading.hide(ANIMATION_DURATION);
        $arrow.show(ANIMATION_DURATION);
        $swapBtn.prop('disabled', false);
        setAlert(`Swapped ${$inputAmount.val()} ${selectedFromToken} for ${$outputAmount.val()} ${selectedToToken}!`, $formSuccess);
        $inputAmount.val('');
        $outputAmount.val('');
        setTimeout(() => {
            $formSuccess.hide(ANIMATION_DURATION)}, 5000)
    }, 1500);
});

(async function init() {
    await fetchPrices();
    populateTokenDropdowns();
    setupDropdownHandlers();
    computeOutput();
})();