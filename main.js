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
      win: createSound(277.18)
    };

  function createSound(frequency, type) {
    var oscillator = createOscillator(frequency, type);
    var gain = createGain();
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
    screenFlashInterval = 300,
    winningScore = 20;

  /*
   * Variables.
   */
  var isOn = false,
    strictMode = false,
    locked = true,
    sequence,
    playerIndex,
    previousColour,
    speedInterval,
    errorTimeout,
    timerIds = {};

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
    screenElement.classList.add('lit');
  }

  function turnPowerOff() {
    clearTimedEvents();
    isOn = false;
    screenTextElement.innerText = '--';
    screenElement.classList.remove('lit');
    turnOffStrictMode();
    disableButtons();
    stopSounds();
  }

  function clearTimedEvents() {
    for (var key in timerIds) {
      if (timerIds.hasOwnProperty(key)) {
        clearTimeout(timerIds[key]);
        clearInterval(timerIds[key]);
      }
    }
  }

  function turnOffStrictMode() {
    strictMode = false;
    strictLightElement.classList.remove('lit');
  }

  function disableButtons() {
    locked = true;
    for (var key in buttonElements) {
      if (buttonElements.hasOwnProperty(key)) {
        buttonElements[key].classList = 'btn';
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
    if (isOn) {
      clearTimedEvents();
      screenTextElement.innerText = '--';
      screenElement.classList.add('lit');
      disableButtons();
      stopSounds();
      makeScreenFlash(4);
      sequence = [getRandomColour()];
      timerIds.playSequence = setTimeout(playSequence, screenFlashInterval * 5);
    }
  }

  function makeScreenFlash(toggles) {
    timerIds.screenFlash = setInterval(function () {
      if (toggles < 1) {
        clearInterval(timerIds.screenFlash);
      } else {
        screenElement.classList.toggle('lit');
      }
      toggles--;
    }, screenFlashInterval);
  }

  function getRandomColour() {
    return colours[Math.floor(Math.random() * colours.length)];
  }

  function playSequence() {
    var index = 0
    clearTimedEvents();
    disableButtons();
    stopSounds();
    playerIndex = 0;
    speedInterval = speedIntervals[sequence.length] || speedInterval;
    errorTimeout = errorTimeouts[sequence.length] || errorTimeout;
    screenTextElement.innerText = (sequence.length < 10) ? '0' + sequence.length : sequence.length;
    timerIds.playSequence = setInterval(function () {
      if (index < sequence.length) {
        playSequenceElement(index);
        index++;
      } else {
        enableButtons();
        timerIds.error = setTimeout(flagError, errorTimeout);
        clearInterval(timerIds.playSequence);
      }
    }, speedInterval);
  }

  function playSequenceElement(index) {
    var colour = sequence[index],
      buttonElement = buttonElements[colour],
      sound = sounds[colour];
    buttonElement.classList.add('lit');
    sound.play();
    timerIds.stopSequenceElement = setTimeout(function () {
      buttonElement.classList.remove('lit');
      sound.stop();
    }, speedInterval / 2);
  }

  function enableButtons() {
    locked = false;
    for (var key in buttonElements) {
      if (buttonElements.hasOwnProperty(key)) {
        buttonElements[key].classList = 'btn clickable';
      }
    }
  }

  function flagError() {
    var timeout = screenFlashInterval * 7;
    clearTimedEvents();
    disableButtons();
    stopSounds();
    sounds.error.play();
    screenTextElement.innerText = '!!';
    makeScreenFlash(6);
    if (strictMode) {
      timerIds.startNewGame = setTimeout(startNewGame, timeout);
    } else {
      timerIds.playSequence = setTimeout(playSequence, timeout);
    }
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
        buttonElement.addEventListener('touchstart', buttonPressed);
        buttonElement.addEventListener('mouseup', buttonReleased);
        buttonElement.addEventListener('mouseleave', buttonReleased);
        buttonElement.addEventListener('dragleave', buttonReleased);
      }
    }
    window.addEventListener('touchend', buttonReleased);
  }());

  function buttonPressed(event) {
    event.stopPropagation();
    if (isOn && this.classList.contains('clickable')) {
      this.classList.add('lit');
      sounds[this.id].play();
      if (this.id === sequence[playerIndex]) {
        previousColour = this.id;
      } else {
        previousColour = null;
        flagError();
      }
    } else {
      previousColour = null;
    }
  }

  function buttonReleased(event) {
    if (locked) {
      return;
    }
    event.stopPropagation();
    if (previousColour) {
      clearTimedEvents();
      playerIndex++;
      if (playerIndex === winningScore) {
        flagWin();
      } else if (playerIndex === sequence.length) {
        playerIndex = 0;
        sequence.push(getRandomColour());
        playSequence();
      }
      previousColour = null;
    }
    for (var key in buttonElements) {
      if (buttonElements.hasOwnProperty(key)) {
        buttonElements[key].classList.remove('lit');
      }
    }
    stopSounds();
  }

  function flagWin() {
    var ticks = 8;
    screenTextElement.innerText = "**";
    makeScreenFlash(8);
    timerIds.win = setInterval(function () {
      if (ticks < 1) {
        clearTimedEvents();
        startNewGame();
      } else if (ticks % 2 == 0) {
        sounds.win.play();
      } else {
        sounds.win.stop();
      }
      ticks--;
    }, screenFlashInterval);
  }

});