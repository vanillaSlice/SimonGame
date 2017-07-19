window.addEventListener('load', function () {

  'use strict';

  /*
   * Audio setup.
   */

  var audioContext = new(window.AudioContext || window.webkitAudioContext)(),
    sounds = {
      green: createSound(164.81),
      red: createSound(220.00),
      yellow: createSound(277.18),
      blue: createSound(329.63),
      error: createSound(110.00, 'triangle'),
      win: createSound(440.00)
    };

  function createSound(frequency, type) {
    var oscillator = createOscillator(frequency, type),
      gain = createGain();
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    return Sound(gain);
  }

  function createOscillator(frequency, type) {
    var oscillator = audioContext.createOscillator();
    oscillator.frequency.value = frequency;
    oscillator.type = type || 'sine';
    oscillator.start();
    return oscillator;
  }

  function createGain() {
    var gain = audioContext.createGain();
    gain.gain.value = 0;
    return gain;
  }

  function Sound(gain) {
    return {
      play: function () {
        gain.gain.value = 1;
      },
      stop: function () {
        gain.gain.value = 0;
      }
    };
  }

  /*
   * DOM elements.
   */
  var buttonElements = {
      green: document.getElementById('green'),
      red: document.getElementById('red'),
      yellow: document.getElementById('yellow'),
      blue: document.getElementById('blue')
    },
    screenElement = document.getElementById('screen'),
    screenTextElement = document.getElementById('screen-text'),
    startButtonElement = document.getElementById('start'),
    strictButtonElement = document.getElementById('strict'),
    strictLightElement = document.getElementById('light'),
    powerButtonElement = document.getElementById('power');

  /*
   * Constants. 
   */
  var colours = ['green', 'red', 'yellow', 'blue'],
    speedIntervals = {
      1: 1000,
      5: 850,
      9: 700,
      13: 550
    },
    errorTimeouts = {
      1: 5000,
      5: 4000,
      9: 3000,
      13: 2000
    },
    screenFlashTimeout = 300,
    screenFlashToggles = {
      newGame: 4,
      error: 6,
      win: 8
    },
    winningScore = 20;

  /*
   * Variables.
   */
  var isOn = false,
    strictMode = false,
    buttonsLocked = true,
    sequence,
    playerIndex,
    previousColour,
    speedInterval,
    errorTimeout,
    intervalIds = [],
    timeoutIds = [];

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
    intervalIds.forEach(function (id) {
      clearInterval(id);
    });
    intervalIds = [];
  }

  function clearTimeouts() {
    timeoutIds.forEach(function (id) {
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
    var key;
    buttonsLocked = true;
    for (key in buttonElements) {
      if (buttonElements.hasOwnProperty(key)) {
        buttonElements[key].classList = 'btn';
      }
    }
  }

  function stopSounds() {
    var key;
    for (key in sounds) {
      if (sounds.hasOwnProperty(key)) {
        sounds[key].stop();
      }
    }
  }

  startButtonElement.addEventListener('click', startNewGame);

  function startNewGame() {
    var toggles, timeout;
    if (isOn) {
      toggles = screenFlashToggles.newGame;
      timeout = (toggles + 1) * screenFlashTimeout;
      clearTimedEvents();
      setScreenText('--');
      toggleScreenLight(true);
      lockButtons();
      stopSounds();
      makeScreenFlash(toggles);
      initNewSequence();
      playSequence(timeout);
    }
  }

  function makeScreenFlash(toggles) {
    timeoutIds.push(setTimeout(function () {
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
    var index = 0;
    playerIndex = 0;
    speedInterval = speedIntervals[sequence.length] || speedInterval;
    errorTimeout = errorTimeouts[sequence.length] || errorTimeout;
    timeoutIds.push(setTimeout(function () {
      setScreenText(getCountString());
      intervalIds.push(setInterval(function () {
        if (index < sequence.length) {
          playAndStopSequenceElement(index);
          index++;
        } else {
          onPlaySequenceComplete();
        }
      }, speedInterval));
    }, timeout));
  }

  function getCountString() {
    return (sequence.length < 10) ? '0' + sequence.length : sequence.length;
  }

  function playAndStopSequenceElement(index) {
    var colour = sequence[index],
      buttonElement = buttonElements[colour],
      sound = sounds[colour],
      timeout = speedInterval / 2;
    playSequenceElement(buttonElement, sound);
    stopSequenceElement(buttonElement, sound, timeout);
  }

  function playSequenceElement(buttonElement, sound) {
    buttonElement.classList.add('lit');
    sound.play();
  }

  function stopSequenceElement(buttonElement, sound, timeout) {
    timeoutIds.push(setTimeout(function () {
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
    var key;
    buttonsLocked = false;
    for (key in buttonElements) {
      if (buttonElements.hasOwnProperty(key)) {
        buttonElements[key].classList = 'btn clickable';
      }
    }
  }

  function startErrorTimeout() {
    timeoutIds.push(setTimeout(flagError, errorTimeout));
  }

  function flagError() {
    var toggles = screenFlashToggles.error,
      timeout = screenFlashTimeout * (toggles + 1);
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
    timeoutIds.push(setTimeout(function () {
      sound.stop();
    }, timeout));
  }

  function continueAfterError(timeout) {
    timeoutIds.push(setTimeout((strictMode) ? startNewGame :
      playSequence, timeout));
  }

  strictButtonElement.addEventListener('click', toggleStrictMode);

  function toggleStrictMode() {
    if (isOn) {
      strictMode = !strictMode;
      strictLightElement.classList.toggle('lit', strictMode);
    }
  }

  (function () {
    var key, buttonElement;
    for (key in buttonElements) {
      if (buttonElements.hasOwnProperty(key)) {
        buttonElement = buttonElements[key];
        buttonElement.addEventListener('mousedown', buttonPressed);
        buttonElement.addEventListener('mouseup', buttonReleased);
        buttonElement.addEventListener('mouseleave', buttonReleased);
        buttonElement.addEventListener('dragleave', buttonReleased);
        buttonElement.addEventListener('touchstart', buttonPressed);
        buttonElement.addEventListener('touchend', function (event) {
          event.preventDefault();
          event.stopPropagation();
          buttonReleased();
        });
      }
    }
  }());

  function buttonPressed() {
    var buttonElement = this,
      colour;
    if (isOn && !buttonsLocked) {
      colour = buttonElement.id;
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
      playerIndex++;
      if (playerIndex === winningScore) {
        flagWin();
      } else if (playerIndex === sequence.length) {
        continueSequence();
      }
      previousColour = false;
    }
  }

  function turnAllButtonsOff() {
    var key;
    for (key in buttonElements) {
      if (buttonElements.hasOwnProperty(key)) {
        buttonElements[key].classList.remove('lit');
      }
    }
  }

  function flagWin() {
    var timeout = screenFlashTimeout * (screenFlashToggles.win + 1);
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

});