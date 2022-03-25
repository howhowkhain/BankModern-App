'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-07-26T17:01:17.194Z',
    '2020-07-28T23:36:17.929Z',
    '2020-08-01T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT',
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// CODE
//////////////////GLOBAL VARIABLES///////////////
let sort, currentAccount, timer;
//////////////////FUNCTIONS//////////////////////

const generateUserNames = function (list) {
  list.forEach(account => {
    account.username = account.owner
      .split(' ')
      .map(el => el[0].toLowerCase())
      .join('');
  });
};

const noAccount = function () {
  alert(`This account doesn't exist!`);
  inputLoginUsername.value = '';
  inputLoginUsername.blur();
  inputLoginPin.value = '';
  inputLoginPin.blur();
};

const displayBalance = function (account) {
  const balance = account.movements
    .reduce((prevValue, currValue) => prevValue + currValue, 0)
    .toFixed(2);
  labelBalance.textContent = `${balance}€`;
};

const calcSummaryIn = function (account) {
  const totalIN = account.movements
    .filter(movement => movement > 0)
    .reduce((prevValue, currValue) => prevValue + currValue, 0)
    .toFixed(2);
  labelSumIn.textContent = `${totalIN}€`;
};

const calcSummaryOut = function (account) {
  const totalOut = account.movements
    .filter(movement => movement < 0)
    .map(movement => Math.abs(movement))
    .reduce((prevValue, currValue) => prevValue + currValue, 0)
    .toFixed(2);
  labelSumOut.textContent = `${totalOut}€`;
};

const calcSummaryInterest = function (account) {
  const totalInterest = account.movements
    .filter(movement => movement > 0)
    .map(deposit => (deposit * account.interestRate) / 100)
    .reduce((prevValue, currValue) => prevValue + currValue, 0)
    .toFixed(2);
  labelSumInterest.textContent = `${totalInterest}€`;
};

const displaySummary = function (account) {
  calcSummaryIn(account);

  calcSummaryOut(account);

  calcSummaryInterest(account);
};

const displayMovements = function (account, sort = false) {
  containerMovements.innerHTML = '';

  const datesArrayFormated = account.movementsDates.map(
    date => date.split('T')[0]
  );
  let movementsWithDates = account.movements.map((movement, index) => [
    movement,
    datesArrayFormated[index],
  ]);
  if (sort) {
    movementsWithDates = movementsWithDates.sort((a, b) => a[0] - b[0]);
  }
  movementsWithDates.forEach((movement, index) => {
    const currentDate = new Date(movement[1]);
    // console.log(currentDate);
    const monthDate = String(currentDate.getDate()).padStart(2, 0);
    const month = String(currentDate.getMonth() + 1).padStart(2, 0);
    const year = String(currentDate.getFullYear()).padStart(4, 0);
    const currentDateFormat = `${monthDate}/${month}/${year}`;

    const operation = movement[0] > 0 ? 'deposit' : 'withdrawal';
    const html = `
          <div class="movements__row">
            <div class="movements__type movements__type--${operation}">${
      index + 1
    } ${operation}</div>
            <div class="movements__date">${currentDateFormat}</div>
            <div class="movements__value">${movement[0].toFixed(2)}€</div>
        </div>
        `;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const updateUI = function (account) {
  displayDateTime();

  displayBalance(account);

  displaySummary(account);

  displayMovements(account, sort);
};

const transfer = function (account, amount) {
  const date = new Date();
  const monthDate = String(date.getDate()).padStart(2, 0);
  const month = String(date.getMonth() + 1).padStart(2, 0);
  const year = String(date.getFullYear()).padStart(4, 0);
  const dateFormated = `${year}-${month}-${monthDate}`;
  currentAccount.movements.push(-amount);
  currentAccount.movementsDates.push(dateFormated);
  account.movements.push(amount);
  account.movementsDates.push(dateFormated);
};

const transferToAccount = function (username, amount) {
  const destinationAccount =
    accounts.find(account => account.username === username) ??
    alert(`This account doesn't exist!`);
  destinationAccount && destinationAccount !== currentAccount
    ? transfer(destinationAccount, amount)
    : alert(`You can't do transfers into same account!`);
  inputTransferAmount.blur();
};

const approvingLoan = function (list, amount) {
  list.filter(movement => movement > 0).some(deposit => deposit > amount * 0.1)
    ? list.push(amount)
    : alert('Loan not approved!');
};

const closeAccount = function (inputUser, inputPIN, currentAcc) {
  if (
    inputUser === currentAcc.username &&
    inputPIN === String(currentAcc.pin)
  ) {
    const indexAccount = accounts.findIndex(account => account === currentAcc);
    accounts.splice(indexAccount, 1);
    containerApp.style.opacity = 0;
    labelWelcome.textContent = 'Log in to get started';
  } else {
    alert('This is not your account to delete!');
  }
};

// Timer for logging out (set to 5 minutes = 300 sec)
const startLogOutTimer = function () {
  let time = 300;
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    labelTimer.textContent = `${min}:${sec}`;
    if (time === 0) {
      clearInterval(timer);
      containerApp.style.opacity = 0;
      labelWelcome.textContent = 'Log in to get started';
    }
    time--;
  };
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

// Get current date and time for the login account
const displayDateTime = function () {
  const currentDate = new Date();
  const monthDate = String(currentDate.getDate()).padStart(2, 0);
  const month = String(currentDate.getMonth() + 1).padStart(2, 0);
  const year = String(currentDate.getFullYear()).padStart(4, 0);
  const hour = String(currentDate.getHours()).padStart(2, 0);
  const minutes = String(currentDate.getMinutes()).padStart(2, 0);
  const currentDateFormat = `${monthDate}/${month}/${year}, ${hour}:${minutes}`;
  labelDate.textContent = currentDateFormat;
};

// removes all previous event listeners attached
const removeEventListeners = function () {
  btnSort.replaceWith(btnSort.cloneNode(true));
  btnTransfer.replaceWith(btnTransfer.cloneNode(true));
  btnLoan.replaceWith(btnLoan.cloneNode(true));
  btnClose.replaceWith(btnClose.cloneNode(true));
};

////////////////BUSSINESS LOGIC////////////////////
// generate usernames for each of the existent accounts
generateUserNames(accounts);

// add event listener for login button
btnLogin.addEventListener('click', e => {
  // prevent default behaviour of the form (prevent automatic reloading of the page after submiting the form)
  e.preventDefault();
  // get the input filelds values
  const userName = inputLoginUsername.value;
  const userPIN = inputLoginPin.value;
  // check for any username and PIN inputs
  if (!userName || userPIN === '') {
    alert('Use a username and a valid PIN!');
    inputLoginUsername.value = '';
    inputLoginPin.value = '';
    return;
  }
  // find the account with the specified username
  currentAccount =
    accounts.find(account => account.username === userName) ?? noAccount();
  console.log(currentAccount);
  if (currentAccount) {
    // if account with the specified username exist check for PIN matching
    if (!(String(currentAccount.pin) === userPIN)) {
      alert('Incorrect PIN. Try again!');
      inputLoginUsername.value = '';
      inputLoginPin.value = '';
      return;
    }
    // flag for sorting the account's movements (default set to false - not sorted)
    sort = false;
    // make the account visible
    containerApp.style.opacity = 1;
    // update the account's welcome message
    labelWelcome.textContent = `Welcome back, ${currentAccount.owner
      .split(' ')
      .slice(0, 1)}`;
    // clear the login input fields
    inputLoginUsername.value = '';
    inputLoginPin.value = '';
    // remove focus form the PIN login input
    inputLoginPin.blur();
    // update UI with all account's data
    updateUI(currentAccount);
    // reset timer if already running
    if (timer) clearInterval(timer);
    // start timer
    timer = startLogOutTimer();
  }
});

// add event listener for sorting button
btnSort.addEventListener('click', function () {
  sort = !sort;
  displayMovements(currentAccount, sort);
});

// adding event listener for transfer button
btnTransfer.addEventListener('click', e => {
  e.preventDefault();
  const transferTo = inputTransferTo.value;
  const transferAmmount = +inputTransferAmount.value;
  // check for username input field and for a valid amount's value
  if (!transferTo || !transferAmmount || !(transferAmmount > 0)) {
    alert('Use a username and a valid amount for tranfer operation!');
    inputTransferTo.value = '';
    inputTransferAmount.value = '';
    return;
  }
  // tranfer the sum to the account of which username was used
  transferToAccount(transferTo, transferAmmount);
  // update the user's UI account
  updateUI(currentAccount);
  // clear the input fields
  inputTransferTo.value = '';
  inputTransferAmount.value = '';
  // reset timer if already running
  if (timer) clearInterval(timer);
  // start timer
  timer = startLogOutTimer();
});

// adding event listener for requesting loan button
btnLoan.addEventListener('click', e => {
  e.preventDefault();
  const loanAmount = +inputLoanAmount.value;
  // check for a valid amount input field
  if (!loanAmount || !(loanAmount > 0)) {
    alert('Insert a valid loan amount!');
    inputLoanAmount.value = '';
    return;
  }
  // loan approving operation
  approvingLoan(currentAccount.movements, loanAmount);
  // update the user's UI account
  updateUI(currentAccount);
  // clear the input fields
  inputLoanAmount.value = '';
  // reset timer if already running
  if (timer) clearInterval(timer);
  // start timer
  timer = startLogOutTimer();
});

btnClose.addEventListener('click', e => {
  e.preventDefault();
  const inputUser = inputCloseUsername.value;
  const inputPIN = inputClosePin.value;
  // check for username and PIN input fields
  if (!inputUser || inputPIN === '') {
    alert('Insert a username and a valid PIN to close your account!');
    inputCloseUsername.value = '';
    inputClosePin.value = '';
    return;
  }
  // closing user's account
  closeAccount(inputUser, inputPIN, currentAccount);
  // clear the input fields
  inputCloseUsername.value = '';
  inputClosePin.value = '';
  // reset timer if already running
  if (timer) clearInterval(timer);
});
