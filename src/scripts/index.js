/*
 * Audio setup.
 */

window.AudioContext = window.AudioContext || window.webkitAudioContext;

let audioContext;
let sounds;

function createSound(frequency, type) {
  const oscillator = createOscillator(frequency, type);
  const gain = createGain();
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  return Sound(gain, oscillator);
}

function createOscillator(frequency, type) {
  const oscillator = audioContext.createOscillator();
  oscillator.frequency.setValueAtTime(frequency, 0);
  oscillator.type = type || 'sine';
  oscillator.start();
  return oscillator;
}

function createGain() {
  const gain = audioContext.createGain();
  gain.gain.setValueAtTime(0, 0);
  return gain;
}

function Sound(gain) {
  return {
    play: () => {
      gain.gain.setTargetAtTime(1, audioContext.currentTime, 0.01);
    },
    stop: () => {
      gain.gain.setTargetAtTime(0, audioContext.currentTime, 0.01);
    },
  };
}

/*
  * DOM elements.
  */
const buttonElements = {
  green: document.querySelector('.js-green-btn'),
  red: document.querySelector('.js-red-btn'),
  yellow: document.querySelector('.js-yellow-btn'),
  blue: document.querySelector('.js-blue-btn'),
};
const screenElement = document.querySelector('.js-screen');
const screenTextElement = document.querySelector('.js-screen-text');
const startButtonElement = document.querySelector('.js-start-btn');
const strictButtonElement = document.querySelector('.js-strict-btn');
const strictLightElement = document.querySelector('.js-strict-light');
const powerButtonElement = document.querySelector('.js-power-btn');

/*
  * Constants.
  */
const colours = ['green', 'red', 'yellow', 'blue'];
const speedIntervals = {
  1: 1000,
  5: 850,
  9: 700,
  13: 550,
};
const errorTimeouts = {
  1: 5000,
  5: 4000,
  9: 3000,
  13: 2000,
};
const screenFlashTimeout = 300;
const screenFlashToggles = {
  newGame: 4,
  error: 6,
  win: 8,
};
const winningScore = 20;

/*
 * Variables.
  */
let isOn = false;
let strictMode = false;
let buttonsLocked = true;
let sequence;
let playerIndex;
let previousColour;
let speedInterval;
let errorTimeout;
let intervalIds = [];
let timeoutIds = [];

/*
 * Add event listeners.
 */

powerButtonElement.addEventListener('change', togglePower);

function togglePower() {
  if (powerButtonElement.checked) {
    turnPowerOn();
  } else {
    turnPowerOff();
  }
}

function turnPowerOn() {
  audioContext = new window.AudioContext();
  sounds = {
    green: createSound(164.81),
    red: createSound(220.00),
    yellow: createSound(277.18),
    blue: createSound(329.63),
    error: createSound(110.00, 'triangle'),
    win: createSound(440.00),
  };

  isOn = true;
  toggleScreenLight(true);
}

function toggleScreenLight(on) {
  screenElement.classList.toggle('lit', on);
}

function turnPowerOff() {
  isOn = false;
  clearTimedEvents();
  setScreenText('--');
  toggleScreenLight(false);
  turnOffStrictMode();
  lockButtons();
  stopSounds();
}

function clearTimedEvents() {
  clearIntervals();
  clearTimeouts();
}

function clearIntervals() {
  intervalIds.forEach((id) => {
    clearInterval(id);
  });
  intervalIds = [];
}

function clearTimeouts() {
  timeoutIds.forEach((id) => {
    clearTimeout(id);
  });
  timeoutIds = [];
}

function setScreenText(text) {
  screenTextElement.innerText = text;
}

function turnOffStrictMode() {
  strictMode = false;
  strictLightElement.classList.remove('lit');
}

function lockButtons() {
  buttonsLocked = true;
  Object.keys(buttonElements).forEach((key) => {
    buttonElements[key].classList.remove('clickable', 'lit');
  });
}

function stopSounds() {
  Object.keys(sounds).forEach((key) => {
    sounds[key].stop();
  });
}

startButtonElement.addEventListener('click', startNewGame);

function startNewGame() {
  if (!isOn) {
    return;
  }

  const toggles = screenFlashToggles.newGame;
  const timeout = (toggles + 1) * screenFlashTimeout;
  clearTimedEvents();
  setScreenText('--');
  toggleScreenLight(true);
  lockButtons();
  stopSounds();
  makeScreenFlash(toggles);
  initNewSequence();
  playSequence(timeout);
}

function makeScreenFlash(toggles) {
  timeoutIds.push(setTimeout(() => {
    if (toggles > 0) {
      toggleScreenLight();
      makeScreenFlash(toggles - 1);
    }
  }, screenFlashTimeout));
}

function initNewSequence() {
  sequence = [getRandomColour()];
}

function getRandomColour() {
  return colours[Math.floor(Math.random() * colours.length)];
}

function playSequence(timeout) {
  let index = 0;
  playerIndex = 0;
  speedInterval = speedIntervals[sequence.length] || speedInterval;
  errorTimeout = errorTimeouts[sequence.length] || errorTimeout;
  timeoutIds.push(setTimeout(() => {
    setScreenText(getCountString());
    intervalIds.push(setInterval(() => {
      if (index < sequence.length) {
        playAndStopSequenceElement(index);
        index += 1;
      } else {
        onPlaySequenceComplete();
      }
    }, speedInterval));
  }, timeout));
}

function getCountString() {
  return (sequence.length < 10) ? `0${sequence.length}` : sequence.length;
}

function playAndStopSequenceElement(index) {
  const colour = sequence[index];
  const buttonElement = buttonElements[colour];
  const sound = sounds[colour];
  const timeout = speedInterval / 2;
  playSequenceElement(buttonElement, sound);
  stopSequenceElement(buttonElement, sound, timeout);
}

function playSequenceElement(buttonElement, sound) {
  buttonElement.classList.add('lit');
  sound.play();
}

function stopSequenceElement(buttonElement, sound, timeout) {
  timeoutIds.push(setTimeout(() => {
    buttonElement.classList.remove('lit');
    sound.stop();
  }, timeout));
}

function onPlaySequenceComplete() {
  clearTimedEvents();
  unlockButtons();
  startErrorTimeout();
}

function unlockButtons() {
  buttonsLocked = false;
  Object.keys(buttonElements).forEach((key) => {
    buttonElements[key].classList.add('clickable');
  });
}

function startErrorTimeout() {
  timeoutIds.push(setTimeout(flagError, errorTimeout));
}

function flagError() {
  const toggles = screenFlashToggles.error;
  const timeout = screenFlashTimeout * (toggles + 1);
  clearTimedEvents();
  lockButtons();
  stopSounds();
  playAndStopSound(sounds.error, timeout);
  setScreenText('!!');
  makeScreenFlash(toggles);
  continueAfterError(timeout);
}

function playAndStopSound(sound, timeout) {
  sound.play();
  timeoutIds.push(setTimeout(() => {
    sound.stop();
  }, timeout));
}

function continueAfterError(timeout) {
  timeoutIds.push(setTimeout((strictMode) ? startNewGame : playSequence, timeout));
}

strictButtonElement.addEventListener('click', toggleStrictMode);

function toggleStrictMode() {
  if (isOn) {
    strictMode = !strictMode;
    strictLightElement.classList.toggle('lit', strictMode);
  }
}

Object.keys(buttonElements).forEach((key) => {
  const buttonElement = buttonElements[key];
  buttonElement.addEventListener('mousedown', buttonPressed);
  buttonElement.addEventListener('mouseup', buttonReleased);
  buttonElement.addEventListener('mouseleave', buttonReleased);
  buttonElement.addEventListener('dragleave', buttonReleased);
  buttonElement.addEventListener('touchstart', buttonPressed);
  buttonElement.addEventListener('touchend', (event) => {
    event.preventDefault();
    event.stopPropagation();
    buttonReleased();
  });
});

function buttonPressed(e) {
  if (isOn && !buttonsLocked) {
    const buttonElement = e.target;
    const { colour } = buttonElement.dataset;
    buttonElement.classList.add('lit');
    sounds[colour].play();
    if (colour === sequence[playerIndex]) {
      previousColour = colour;
      clearTimedEvents(); // will stop error timeout
    } else {
      flagError();
    }
  } else {
    previousColour = false;
  }
}

function buttonReleased() {
  if (buttonsLocked || !isOn) {
    return;
  }
  turnAllButtonsOff();
  stopSounds();
  if (previousColour) {
    playerIndex += 1;
    if (playerIndex === winningScore) {
      flagWin();
    } else if (playerIndex === sequence.length) {
      continueSequence();
    }
    previousColour = false;
  }
}

function turnAllButtonsOff() {
  Object.keys(buttonElements).forEach((key) => {
    buttonElements[key].classList.remove('lit');
  });
}

function flagWin() {
  const timeout = screenFlashTimeout * (screenFlashToggles.win + 1);
  lockButtons();
  playAndStopSound(sounds.win, timeout);
  setScreenText('**');
  makeScreenFlash(screenFlashToggles.win);
  continueAfterWin(timeout);
}

function continueAfterWin(timeout) {
  timeoutIds.push(setTimeout(startNewGame, timeout));
}

function continueSequence() {
  playerIndex = 0;
  sequence.push(getRandomColour());
  lockButtons();
  playSequence();
}
