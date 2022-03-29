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
  interestRate: 1.5, // %
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
// generates usernames for each of the accounts
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
  inputLoginUsername.value = inputLoginPin.value = '';
  inputLoginPin.blur();
};

const currencyFormat = function (account, number) {
  const formatOptions = { style: 'currency', currency: account.currency };
  const currencyFormated = new Intl.NumberFormat(
    account.locale,
    formatOptions
  ).format(number);
  return currencyFormated;
};

const displayBalance = function (account) {
  account.balance = account.movements
    .reduce((prevValue, currValue) => prevValue + currValue, 0)
    .toFixed(2);
  labelBalance.textContent = currencyFormat(account, account.balance);
};

const calcSummaryIn = function (account) {
  const totalIN = account.movements
    .filter(movement => movement > 0)
    .reduce((prevValue, currValue) => prevValue + currValue, 0)
    .toFixed(2);
  labelSumIn.textContent = currencyFormat(account, totalIN);
};

const calcSummaryOut = function (account) {
  const totalOut = account.movements
    .filter(movement => movement < 0)
    .map(movement => Math.abs(movement))
    .reduce((prevValue, currValue) => prevValue + currValue, 0)
    .toFixed(2);
  labelSumOut.textContent = currencyFormat(account, totalOut);
};

const calcSummaryInterest = function (account) {
  const totalInterest = account.movements
    .filter(movement => movement > 0)
    .map(deposit => (deposit * account.interestRate) / 100)
    .reduce((prevValue, currValue) => prevValue + currValue, 0)
    .toFixed(2);
  labelSumInterest.textContent = currencyFormat(account, totalInterest);
};

// displays summary for deposits, withdrawals and total interest calculated for each of the deposits
const displaySummary = function (account) {
  calcSummaryIn(account);
  calcSummaryOut(account);
  calcSummaryInterest(account);
};

// format movement date
const formatMovementDates = function (dateObject, locale) {
  // calculate the difference of the days passed
  const calculateDaysPast = dateObject =>
    Math.trunc(Math.abs((new Date() - dateObject) / (24 * 60 * 60 * 1000)));

  const daysPast = calculateDaysPast(dateObject);

  if (daysPast === 0) return 'Today';
  if (daysPast === 1) return 'Yesterday';
  if (daysPast < 7) return `${daysPast} day ago`;
  else {
    return new Intl.DateTimeFormat(locale).format(dateObject);
  }
};

// update account's movements (deposits and withdrawals)
const displayMovements = function (account, sort = false) {
  containerMovements.innerHTML = '';
  // create an array with only the dates (not time included) from the movementsDated array
  const datesWithoutTime = account.movementsDates.map(
    dateTime => dateTime.split('T')[0]
  );
  // create an array where each movement is mapped to its corresponding date (no time included)
  let movementsWithDates = account.movements.map((movement, index) => [
    movement,
    datesWithoutTime[index],
  ]);
  // sort the movements in ascending order if the sort button was clicked
  if (sort) {
    movementsWithDates = movementsWithDates.sort((a, b) => a[0] - b[0]);
  }
  movementsWithDates.forEach((movement, index) => {
    // converting the corresponding date&time string of the movement into a date&time object
    const movementDate = new Date(movement[1]);
    // format the date&time object as per each client particulars (locales)
    const date = formatMovementDates(movementDate, account.locale);
    // establish if the movement is a deposit(positive value) or a withdrawal(negative value)
    const operation = movement[0] > 0 ? 'deposit' : 'withdrawal';
    const html = `
          <div class="movements__row">
            <div class="movements__type movements__type--${operation}">${
      index + 1
    } ${operation}</div>
            <div class="movements__date">${date}</div>
            <div class="movements__value">${currencyFormat(
              account,
              movement[0]
            )}</div>
        </div>
        `;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const updateUI = function (account) {
  //display login date and time
  displayDateTime(account);
  //display account's total ballance
  displayBalance(account);
  //display account's summary
  displaySummary(account);
  //display account's movements
  displayMovements(account, sort);
};

//executes transfer operations between accounts
const transfer = function (account, amount) {
  const currentDate = new Date();
  currentAccount.movements.push(-amount);
  currentAccount.movementsDates.push(currentDate.toISOString());
  account.movements.push(amount);
  account.movementsDates.push(currentDate.toISOString());
};

//function in charge for validation of transfer operations
const transferToAccount = function (fromAccount, toUsername, amount) {
  const currentBallance = +fromAccount.balance;
  const destinationAccount =
    accounts.find(account => account.username === toUsername) ??
    alert(`This account doesn't exist!`);
  if (destinationAccount) {
    if (amount > currentBallance) {
      alert(
        `Not enough ballance! \nYour current ballance is ${currencyFormat(
          currentAccount,
          currentBallance
        )}.`
      );
      return;
    }
    destinationAccount !== currentAccount
      ? transfer(destinationAccount, amount)
      : alert(`You can't do transfers into same account!`);
  }
};

const processingLoan = function (list, amount) {
  const date = new Date();
  list.push(amount);
  currentAccount.movementsDates.push(date.toISOString());
};

const approvingLoan = function (list, amount) {
  list.filter(movement => movement > 0).some(deposit => deposit > amount * 0.1)
    ? processingLoan(list, amount)
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
const displayDateTime = function (account) {
  const currentDate = new Date();
  const options = {
    hour: 'numeric',
    minute: 'numeric',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  };
  const dateFormated = new Intl.DateTimeFormat(account.locale, options).format(
    currentDate
  );
  labelDate.textContent = dateFormated;
};

const checkDate = function () {};

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
    inputLoginUsername.value = inputLoginPin.value = '';
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
  // reset timer if already running
  if (timer) clearInterval(timer);
  // start timer
  timer = startLogOutTimer();
  // get input values
  const transferTo = inputTransferTo.value;
  const transferAmmount = +inputTransferAmount.value;
  // check for username input field and for a valid amount's value
  if (!transferTo || !transferAmmount || !(transferAmmount > 0)) {
    alert('Use a username and a valid amount for tranfer operation!');
    inputTransferTo.value = inputTransferAmount.value = '';
    return;
  }
  // tranfer the sum to the account of which username was used
  transferToAccount(currentAccount, transferTo, transferAmmount);
  // update the user's UI account
  updateUI(currentAccount);
  // clear the input fields
  inputTransferTo.value = inputTransferAmount.value = '';
  inputTransferAmount.blur();
});

// adding event listener for requesting loan button
btnLoan.addEventListener('click', e => {
  e.preventDefault();
  // reset timer if already running
  if (timer) clearInterval(timer);
  // start timer
  timer = startLogOutTimer();
  // get input values
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
  inputLoanAmount.blur();
});

btnClose.addEventListener('click', e => {
  e.preventDefault();
  const inputUser = inputCloseUsername.value;
  const inputPIN = inputClosePin.value;
  // check for username and PIN input fields
  if (!inputUser || inputPIN === '') {
    alert('Insert a username and a valid PIN to close your account!');
    inputCloseUsername.value = inputClosePin.value = '';
    return;
  }
  // closing user's account
  closeAccount(inputUser, inputPIN, currentAccount);
  // clear the input fields
  inputCloseUsername.value = inputClosePin.value = '';
  // reset timer if already running
  if (timer) clearInterval(timer);
});
