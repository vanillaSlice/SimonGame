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
    speedTimeouts = {
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
    timeout = 300,
    winningScore = 20;

  /*
   * Variables.
   */
  var isOn = false,
    strictMode = false,
    sequence = [],
    locked = true,
    playerIndex = 0,
    speedTimeout = speedTimeouts[1],
    errorTimeout = errorTimeouts[1],
    timeoutIds = {};

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
    resetGame();
    strictMode = false;
    strictLightElement.classList.remove('lit');
    isOn = false;
    screenElement.classList.remove('lit');
  }

  function resetGame() {
    clearTimeouts();
    screenTextElement.innerText = '--';
    lockButtons();
    stopSounds();
    sequence = [];
    playerIndex = 0;
    speedTimeout = speedTimeouts[1];
    errorTimeout = errorTimeouts[1];
  }

  function clearTimeouts() {
    for (var key in timeoutIds) {
      if (timeoutIds.hasOwnProperty(key)) {
        clearTimeout(timeoutIds[key]);
      }
    }
  }

  function lockButtons() {
    locked = true;
    for (var key in buttonElements) {
      if (buttonElements.hasOwnProperty(key)) {
        buttonElements[key].classList = 'btn';
      }
    }
  }

  function unlockButtons() {
    locked = false;
    for (var key in buttonElements) {
      if (buttonElements.hasOwnProperty(key)) {
        buttonElements[key].classList = 'btn clickable';
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

  // done up to here
  function startNewGame() {
    if (isOn) {
      resetGame();
      addNewColourToSequence();
      makeScreenFlash(2, playSequenceAfterTimeout);
    }
  }

  function addNewColourToSequence() {
    var colour = colours[Math.floor(Math.random() * colours.length)];
    sequence.push(colour);
  }

  function makeScreenFlash(flashes, onComplete) {
    if (flashes < 1) {
      onComplete();
      return;
    } else if (screenElement.classList.contains('lit')) {
      screenElement.classList.remove('lit');
    } else {
      screenElement.classList.add('lit');
      flashes--;
    }
    timeoutIds.screenFlash =
      setTimeout(makeScreenFlash, timeout, flashes, onComplete);
  }

  function playSequenceAfterTimeout(index) {
    index = index || 0;
    timeoutIds.sequence = setTimeout(playSequence, timeout, index);
  }

  function playSequence(index) {
    if (index === 0) {
      updateScreenScore();
    }
    if (index < sequence.length) {
      playSequenceColour(index);
    } else {
      unlockButtons();
      startErrorTimeout();
    }
  }

  function updateScreenScore() {
    screenTextElement.innerText =
      (sequence.length < 10) ? '0' + sequence.length : sequence.length;
  }

  function playSequenceColour(index) {
    var colour = sequence[index],
      buttonElement = buttonElements[colour],
      sound = sounds[colour];
    buttonElement.classList.add('lit');
    sound.play();
    index++;
    stopColourAndContinuePlayingSequenceAfterTimeout(buttonElement, sound, index);
  }

  function stopColourAndContinuePlayingSequenceAfterTimeout(buttonElement, sound, index) {
    timeoutIds.sequence =
      setTimeout(stopColourAndContinuePlayingSequence, speedTimeout / 2, buttonElement, sound, index);
  }

  function stopColourAndContinuePlayingSequence(buttonElement, sound, index) {
    buttonElement.classList.remove('lit');
    sound.stop();
    timeoutIds.sequence = setTimeout(playSequence, speedTimeout, index);
  }

  function startErrorTimeout() {
    timeoutIds.error = setTimeout(errorTimeoutCallback, errorTimeout);
  }

  function errorTimeoutCallback() {
    var onComplete = (strictMode) ? startNewGame : playSequenceAfterTimeout;
    sounds.error.play();
    screenTextElement.innerText = '!!';

    timeoutIds.error = setTimeout(makeScreenFlash, timeout, 3, onComplete);
  }

  /////////////

  strictButtonElement.addEventListener('click', toggleStrictMode);

  function toggleStrictMode() {
    strictMode = (isOn) ? !strictMode : false;
    strictLightElement.classList.toggle('lit', strictMode);
  }

  /////////////

  (function () {
    for (var key in buttonElements) {
      if (buttonElements.hasOwnProperty(key)) {
        var btnElement = buttonElements[key];
        btnElement.addEventListener('mousedown', btnPressedCallback);
        btnElement.addEventListener('touchstart', btnPressedCallback);
        btnElement.addEventListener('mouseup', btnReleasedCallback);
        btnElement.addEventListener('mouseleave', btnReleasedCallback);
        btnElement.addEventListener('dragleave', btnReleasedCallback);
      }
    }
    window.addEventListener('touchend', btnReleasedCallback);
  }());

  // finish this method
  function btnPressedCallback() {
    if (isOn && this.classList.contains('clickable')) {
      this.classList.add('lit');
      sounds[this.id].play();
      if (this.id === sequence[playerIndex]) {
        moveToNext = true;
      } else {
        moveToNext = false;
        clearTimeout(timeoutId);
        errorTimeoutCallback();
      }
    } else {
      moveToNext = false;
    }
  }

  var moveToNext;

  // finish this method
  function btnReleasedCallback() {
    if (moveToNext) {
      clearTimeout(timeoutId);
      playerIndex++;
      if (playerIndex === currentSequenceCount) {
        addNewColourToSequence();
        newRound();
      }
      moveToNext = false;
    }
    if (!locked) {
      return;
    }
    for (var key in buttonElements) {
      if (buttonElements.hasOwnProperty(key)) {
        buttonElements[key].classList.remove('lit');
      }
    }
    for (key in sounds) {
      if (sounds.hasOwnProperty(key)) {
        sounds[key].stop();
      }
    }
  }

});