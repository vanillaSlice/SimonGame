window.addEventListener('load', function () {

  'use strict';

  /*
   * Audio setup.
   */

  var audioContext = new(window.AudioContext || window.webkitAudioContext)();
  var sounds = {
    green: createSound(164.81),
    red: createSound(220.00),
    yellow: createSound(277.18),
    blue: createSound(329.63),
    error: createSound(110.00, 'triangle'),
    win: createSound(440.00)
  };

  function createSound(frequency, type) {
    var oscillator = createOscillator(frequency, type);
    var gain = createGain();
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    return Sound(gain, oscillator);
  }

  function createOscillator(frequency, type) {
    var oscillator = audioContext.createOscillator();
    oscillator.frequency.setValueAtTime(frequency, 0);
    oscillator.type = type || 'sine';
    oscillator.start();
    return oscillator;
  }

  function createGain() {
    var gain = audioContext.createGain();
    gain.gain.setValueAtTime(0, 0);
    return gain;
  }

  function Sound(gain) {
    return {
      play: function () {
        gain.gain.setTargetAtTime(1, audioContext.currentTime, 0.01);
      },
      stop: function () {
        gain.gain.setTargetAtTime(0, audioContext.currentTime, 0.01);
      }
    };
  }

  /*
   * DOM elements.
   */
  var buttonElements = {
    green: document.querySelector('.green'),
    red: document.querySelector('.red'),
    yellow: document.querySelector('.yellow'),
    blue: document.querySelector('.blue')
  };
  var screenElement = document.querySelector('.screen');
  var screenTextElement = document.querySelector('.screen-text');
  var startButtonElement = document.querySelector('.start-btn');
  var strictButtonElement = document.querySelector('.strict-btn');
  var strictLightElement = document.querySelector('.strict-ctrl .ctrl-light');
  var powerButtonElement = document.querySelector('.power-btn');

  /*
   * Constants. 
   */
  var colours = ['green', 'red', 'yellow', 'blue'];
  var speedIntervals = {
    1: 1000,
    5: 850,
    9: 700,
    13: 550
  };
  var errorTimeouts = {
    1: 5000,
    5: 4000,
    9: 3000,
    13: 2000
  };
  var screenFlashTimeout = 300;
  var screenFlashToggles = {
    newGame: 4,
    error: 6,
    win: 8
  };
  var winningScore = 20;

  /*
   * Variables.
   */
  var isOn = false;
  var strictMode = false;
  var buttonsLocked = true;
  var sequence;
  var playerIndex;
  var previousColour;
  var speedInterval;
  var errorTimeout;
  var intervalIds = [];
  var timeoutIds = [];

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
    buttonsLocked = true;
    for (var key in buttonElements) {
      if (buttonElements.hasOwnProperty(key)) {
        buttonElements[key].classList.remove('clickable', 'lit');
      }
    }
  }

  function stopSounds() {
    for (var key in sounds) {
      if (sounds.hasOwnProperty(key)) {
        sounds[key].stop();
      }
    }
  }

  startButtonElement.addEventListener('click', startNewGame);

  function startNewGame() {
    if (!isOn) {
      return;
    }

    var toggles = screenFlashToggles.newGame;
    var timeout = (toggles + 1) * screenFlashTimeout;
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
    var colour = sequence[index];
    var buttonElement = buttonElements[colour];
    var sound = sounds[colour];
    var timeout = speedInterval / 2;
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
    buttonsLocked = false;
    for (var key in buttonElements) {
      if (buttonElements.hasOwnProperty(key)) {
        buttonElements[key].classList.add('clickable');
      }
    }
  }

  function startErrorTimeout() {
    timeoutIds.push(setTimeout(flagError, errorTimeout));
  }

  function flagError() {
    var toggles = screenFlashToggles.error;
    var timeout = screenFlashTimeout * (toggles + 1);
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
    timeoutIds.push(setTimeout((strictMode) ? startNewGame : playSequence, timeout));
  }

  strictButtonElement.addEventListener('click', toggleStrictMode);

  function toggleStrictMode() {
    if (isOn) {
      strictMode = !strictMode;
      strictLightElement.classList.toggle('lit', strictMode);
    }
  }

  (function () {
    for (var key in buttonElements) {
      if (buttonElements.hasOwnProperty(key)) {
        var buttonElement = buttonElements[key];
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
    if (isOn && !buttonsLocked) {
      var buttonElement = this;
      var colour = buttonElement.dataset.colour;
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
    for (var key in buttonElements) {
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