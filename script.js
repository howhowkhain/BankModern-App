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
let count = 0;
let sort = false;
//////////////////FUNCTIONS//////////////////////
const calcBalance = function (account) {
  const balance = account.movements
    .reduce((prevValue, currValue) => prevValue + currValue, 0)
    .toFixed(2);
  return balance;
};

const calcSummaryIn = function (account) {
  const totalIN = account.movements
    .filter(movement => movement > 0)
    .reduce((prevValue, currValue) => prevValue + currValue, 0)
    .toFixed(2);
  return totalIN;
};

const calcSummaryOut = function (account) {
  const totalOut = account.movements
    .filter(movement => movement < 0)
    .map(movement => Math.abs(movement))
    .reduce((prevValue, currValue) => prevValue + currValue, 0)
    .toFixed(2);
  return totalOut;
};

const calcSummaryInterest = function (account) {
  const totalInterest = account.movements
    .filter(movement => movement > 0)
    .map(deposit => (deposit * account.interestRate) / 100)
    .reduce((prevValue, currValue) => prevValue + currValue, 0)
    .toFixed(2);
  return totalInterest;
};

const displayMovements = function (list) {
  list.forEach((movement, index) => {
    const operation = movement > 0 ? 'deposit' : 'withdrawal';
    const html = `
          <div class="movements__row">
            <div class="movements__type movements__type--${operation}">${
      index + 1
    } ${operation}</div>
            <div class="movements__date">3 days ago</div>
            <div class="movements__value">${movement.toFixed(2)}€</div>
        </div>
        `;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const sortFunction = function (sorted, list) {
  if (!sorted) {
    containerMovements.innerHTML = '';
    const sortedMovements = list.slice().sort((a, b) => a - b);
    // console.log(sortedMovements);
    displayMovements(sortedMovements);
    sort = true;
  } else {
    containerMovements.innerHTML = '';
    displayMovements(list);
    sort = false;
  }
};

const approvingLoan = function (list, amount) {
  list.filter(movement => movement > 0).some(deposit => deposit > amount * 0.1)
    ? list.push(amount)
    : alert('Loan not approved!');
};

const closeAccount = function (inputUser, inputPIN, currentAcc) {
  if (inputUser === currentAcc.username && inputPIN === currentAcc.pin) {
    const indexAccount = accounts.findIndex(account => account === currentAcc);
    console.log(indexAccount);
    accounts.splice(indexAccount, 1);
    console.log(accounts);
    containerApp.style.opacity = 0;
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
};

////////////////BUSSINESS LOGIC////////////////////
accounts.forEach(account => {
  account.username = account.owner
    .split(' ')
    .map(el => el[0].toLowerCase())
    .join('');
});
console.log(accounts);

btnLogin.addEventListener('click', e => {
  e.preventDefault();
  const totalAccounts = accounts.length;
  const userName = inputLoginUsername.value;
  const userPIN = +inputLoginPin.value;
  // console.log(userName);
  // console.log(userPIN);
  // console.log(accounts);
  // console.log(count);
  accounts.forEach(account => {
    if (account.username === userName && account.pin === userPIN) {
      const currentAccount = account;
      containerApp.style.opacity = 1;
      labelWelcome.textContent = `Welcome back, ${currentAccount.owner
        .split(' ')
        .slice(0, 1)}`;
      inputLoginUsername.value = '';
      inputLoginUsername.blur();
      inputLoginPin.value = '';
      inputLoginPin.blur();

      labelBalance.textContent = `${calcBalance(currentAccount)}€`;

      labelSumIn.textContent = `${calcSummaryIn(currentAccount)}€`;

      labelSumOut.textContent = `${calcSummaryOut(currentAccount)}€`;

      labelSumInterest.textContent = `${calcSummaryInterest(currentAccount)}€`;

      containerMovements.innerHTML = '';

      displayMovements(currentAccount.movements);

      btnSort.addEventListener('click', function () {
        sortFunction(sort, currentAccount.movements);
      });

      btnTransfer.addEventListener('click', e => {
        e.preventDefault();
        const transferTo = inputTransferTo.value;
        const transferAmmount = +inputTransferAmount.value;

        accounts.forEach(account => {
          if (account.username === transferTo) {
            currentAccount.movements.push(-transferAmmount);
            account.movements.push(transferAmmount);

            displayMovements(currentAccount.movements);

            inputTransferTo.value = '';
            inputTransferAmount.value = '';
          }
        });
      });

      btnLoan.addEventListener('click', e => {
        e.preventDefault();
        const loanAmount = +inputLoanAmount.value;

        approvingLoan(currentAccount.movements, loanAmount);

        displayMovements(currentAccount.movements);

        inputLoanAmount.value = '';
      });

      btnClose.addEventListener('click', e => {
        e.preventDefault();
        const inputUser = inputCloseUsername.value;
        const inputPIN = +inputClosePin.value;

        closeAccount(inputUser, inputPIN, currentAccount);

        inputCloseUsername.value = '';
        inputClosePin.value = '';
      });

      startLogOutTimer();
    } else {
      count++;
    }
  });
  if (count === totalAccounts) {
    console.log(count);
    alert(`This account doesn't exist!`);
    inputLoginUsername.value = '';
    inputLoginUsername.blur();
    inputLoginPin.value = '';
    inputLoginPin.blur();
  }
  count = 0;
});
