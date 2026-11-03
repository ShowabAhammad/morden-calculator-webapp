const displayResult = document.getElementById('result');
const displayExpression = document.getElementById('expression');

let currentValue = '0';
let savedValue = null;
let pendingOperation = null;
let waitingForNextValue = false;

function updateDisplay() {
  displayResult.textContent = formatNumber(currentValue);
}

function formatNumber(value) {
  if (value === 'Error') return value;
  const number = Number(value);
  if (!Number.isFinite(number)) return 'Error';

  const [whole, decimal] = value.split('.');
  const formattedWhole = Number(whole).toLocaleString('en-US');

  if (decimal === undefined) return formattedWhole;
  return `${formattedWhole}.${decimal}`;
}

function clearCalculator() {
  currentValue = '0';
  savedValue = null;
  pendingOperation = null;
  waitingForNextValue = false;
  displayExpression.textContent = '0';
  updateDisplay();
}

function inputDigit(digit) {
  if (currentValue === 'Error') {
    currentValue = '0';
  }

  if (waitingForNextValue) {
    currentValue = digit;
    waitingForNextValue = false;
  } else {
    currentValue = currentValue === '0' ? digit : currentValue + digit;
  }

  updateDisplay();
}

function inputDecimal() {
  if (currentValue === 'Error') {
    currentValue = '0';
  }

  if (waitingForNextValue) {
    currentValue = '0.';
    waitingForNextValue = false;
  } else if (!currentValue.includes('.')) {
    currentValue += '.';
  }

  updateDisplay();
}

function performCalculation(firstValue, secondValue, operation) {
  switch (operation) {
    case 'add':
      return firstValue + secondValue;
    case 'subtract':
      return firstValue - secondValue;
    case 'multiply':
      return firstValue * secondValue;
    case 'divide':
      return secondValue === 0 ? 'Error' : firstValue / secondValue;
    default:
      return secondValue;
  }
}

function handleOperation(operation) {
  const value = Number(currentValue);

  if (savedValue === null) {
    savedValue = value;
  } else if (pendingOperation) {
    const result = performCalculation(Number(savedValue), value, pendingOperation);
    currentValue = String(result);
    savedValue = result;
  }

  pendingOperation = operation;
  waitingForNextValue = true;
  displayExpression.textContent = `${formatNumber(String(savedValue))} ${getSymbol(operation)}`;
  updateDisplay();
}

function getSymbol(operation) {
  switch (operation) {
    case 'add': return '+';
    case 'subtract': return '−';
    case 'multiply': return '×';
    case 'divide': return '÷';
    default: return '';
  }
}

function evaluate() {
  if (savedValue === null || pendingOperation === null) return;

  const result = performCalculation(Number(savedValue), Number(currentValue), pendingOperation);
  const expressionText = `${formatNumber(String(savedValue))} ${getSymbol(pendingOperation)} ${formatNumber(currentValue)}`;

  displayExpression.textContent = expressionText;
  currentValue = String(result);
  savedValue = null;
  pendingOperation = null;
  waitingForNextValue = true;
  updateDisplay();
}

function deleteLastDigit() {
  if (currentValue === 'Error') {
    currentValue = '0';
    updateDisplay();
    return;
  }

  if (waitingForNextValue) {
    return;
  }

  currentValue = currentValue.length > 1 ? currentValue.slice(0, -1) : '0';
  updateDisplay();
}

function applyPercent() {
  const value = Number(currentValue);
  currentValue = String(value / 100);
  updateDisplay();
}

function toggleSign() {
  if (currentValue === 'Error' || currentValue === '0') return;
  currentValue = currentValue.startsWith('-') ? currentValue.slice(1) : `-${currentValue}`;
  updateDisplay();
}

function handleAction(action) {
  switch (action) {
    case 'clear':
      clearCalculator();
      break;
    case 'delete':
      deleteLastDigit();
      break;
    case 'percent':
      applyPercent();
      break;
    case 'sign':
      toggleSign();
      break;
    case 'decimal':
      inputDecimal();
      break;
    case 'equals':
      evaluate();
      break;
    default:
      if (action === 'add' || action === 'subtract' || action === 'multiply' || action === 'divide') {
        handleOperation(action);
      }
  }
}

function attachEventListeners() {
  const buttons = document.querySelectorAll('.key');

  buttons.forEach((button) => {
    const digit = button.dataset.digit;
    if (digit !== undefined) {
      button.addEventListener('click', () => inputDigit(digit));
      return;
    }

    const action = button.dataset.action;
    button.addEventListener('click', () => handleAction(action));
  });

  document.addEventListener('keydown', (event) => {
    const { key } = event;

    if (/^[0-9]$/.test(key)) {
      inputDigit(key);
      return;
    }

    if (key === '.') {
      inputDecimal();
      return;
    }

    if (key === 'Enter' || key === '=') {
      evaluate();
      return;
    }

    if (key === 'Backspace') {
      deleteLastDigit();
      return;
    }

    if (key === 'Escape') {
      clearCalculator();
      return;
    }

    if (key === '+') handleOperation('add');
    if (key === '-') handleOperation('subtract');
    if (key === '*') handleOperation('multiply');
    if (key === '/') handleOperation('divide');
    if (key === '%') applyPercent();
  });
}

attachEventListeners();
updateDisplay();
clearCalculator();
