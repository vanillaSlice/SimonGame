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
      error: createSound(110.00, 'triangle')
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
    countElement = document.getElementById('count'),
    startButtonElement = document.getElementById('start'),
    strictLightElement = document.getElementById('light'),
    strictButtonElement = document.getElementById('strict'),
    powerButtonElement = document.getElementById('power');

  /*
   * Variables.
   */
  var colours = ['green', 'red', 'yellow', 'blue'],
    isOn = false,
    strictMode = false,
    sequence = [],
    currentSequenceCount = 0,
    acceptingButtonPresses = false,
    playerSequenceIndex = 0,
    timeoutId,
    speedTimeouts = {
      1: 1000,
      5: 850,
      9: 700,
      13: 550
    },
    speedTimeout = 1000,
    errorTimeouts = {
      1: 5000,
      5: 4000,
      9: 3000,
      13: 2000
    },
    errorTimeout = 5000,
    screenFlashTimeout = 300;

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
    clearTimeout(timeoutId);
    isOn = false;
    screenElement.classList.remove('lit');
    countElement.innerText = '--';
    strictMode = false;
    strictLightElement.classList.remove('lit');
    resetButtons();
    stopSounds();
  }

  function resetButtons() {
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

  startButtonElement.addEventListener('click', resetGame);

  function resetGame() {
    if (isOn) {
      clearTimeout(timeoutId);
      countElement.innerText = '--';
      screenElement.classList.add('lit');
      sequence = [];
      currentSequenceCount = 0;
      acceptingButtonPresses = false;
      playerSequenceIndex = 0;
      resetButtons();
      stopSounds();
      addNewColourToSequence();
      makeScreenFlashThenStartNewRound();
    }
  }

  function addNewColourToSequence() {
    var colour = colours[Math.floor(Math.random() * colours.length)];
    sequence.push(colour);
    currentSequenceCount = sequence.length;
  }

  function makeScreenFlashThenStartNewRound() {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(makeScreenFlash, screenFlashTimeout, 2, newRound);
  }

  function makeScreenFlash(flashes, onComplete) {
    if (flashes < 1) {
      startCompletionTask(onComplete);
      return;
    } else if (screenElement.classList.contains('lit')) {
      screenElement.classList.remove('lit');
    } else {
      screenElement.classList.add('lit');
      flashes--;
    }
    continueScreenFlash(flashes, onComplete);
  }

  function startCompletionTask(onComplete) {
    timeoutId = setTimeout(onComplete, screenFlashTimeout);
  }

  function continueScreenFlash(flashes, onComplete) {
    timeoutId = setTimeout(makeScreenFlash, screenFlashTimeout, flashes, onComplete);
  }

  function newRound() {
    updateScreenText();
    acceptingButtonPresses = false;
    playerSequenceIndex = 0;
    resetButtons();
    stopSounds();
    updateSpeedTimeout();
    updateErrorTimeout();
    playSequence();
  }

  function updateScreenText() {
    countElement.innerText = (currentSequenceCount < 10) ?
      '0' + currentSequenceCount : currentSequenceCount;
  }

  function updateSpeedTimeout() {
    if (speedTimeouts.hasOwnProperty(currentSequenceCount)) {
      speedTimeout = speedTimeouts[currentSequenceCount];
    }
  }

  function updateErrorTimeout() {
    if (errorTimeouts.hasOwnProperty(currentSequenceCount)) {
      errorTimeout = errorTimeouts[currentSequenceCount];
    }
  }

  function playSequence(index) {
    index = index || 0;
    if (index < currentSequenceCount) {
      playSequenceColour(index);
    } else {
      //add clickable to buttons
      acceptingButtonPresses = true;
      for (var key in buttonElements) {
        if (buttonElements.hasOwnProperty(key)) {
          buttonElements[key].classList.add('clickable');
        }
      }
      startErrorTimeout();
    }
  }

  function playSequenceColour(index) {
    var colour = sequence[index],
      buttonElement = buttonElements[colour],
      sound = sounds[colour];
    buttonElement.classList.add('lit');
    sound.play();
    index++;
    timeoutId = setTimeout(stopColourAndContinuePlayingSequence, speedTimeout / 2,
      buttonElement, sound, index);
  }

  function stopColourAndContinuePlayingSequence(buttonElement, sound, index) {
    buttonElement.classList.remove('lit');
    sound.stop();
    timeoutId = setTimeout(playSequence, speedTimeout, index);
  }

  function startErrorTimeout() {
    timeoutId = setTimeout(errorTimeoutCallback, errorTimeout);
  }

  function errorTimeoutCallback() {
    var onComplete = (strictMode) ? resetGame : newRound;
    sounds.error.play();
    countElement.innerText = '!!';
    timeoutId = setTimeout(makeScreenFlash, screenFlashTimeout, 3, onComplete);
  }

  strictButtonElement.addEventListener('click', toggleStrictMode);

  function toggleStrictMode() {
    strictMode = (isOn) ? !strictMode : false;
    strictLightElement.classList.toggle('lit', strictMode);
  }

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
      if (this.id === sequence[playerSequenceIndex]) {
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
      playerSequenceIndex++;
      if (playerSequenceIndex === currentSequenceCount) {
        addNewColourToSequence();
        newRound();
      }
      moveToNext = false;
    }
    if (!acceptingButtonPresses) {
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