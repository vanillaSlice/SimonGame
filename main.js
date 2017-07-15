window.addEventListener('load', function () {

  'use strict';

  /*
   * Audio setup.
   */

  var audioContext = new(window.AudioContext || window.webkitAudioContext)(),
    greenSound = createSound(164.81),
    redSound = createSound(220.00),
    yellowSound = createSound(277.18),
    blueSound = createSound(329.63),
    errorSound = createSound(110.00, 'triangle');

  function createSound(frequency, type) {
    // 1. Create the oscillator object
    var oscillator = audioContext.createOscillator();
    oscillator.frequency.value = frequency;
    oscillator.type = type || 'sine';
    oscillator.start();

    // 2. Create the gain object
    var gain = audioContext.createGain();
    gain.gain.value = 0;

    // 3. Make the connections
    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    // 4. Return the sound object
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
  var greenBtnElement = document.getElementById('green'),
    redBtnElement = document.getElementById('red'),
    yellowBtnElement = document.getElementById('yellow'),
    blueBtnElement = document.getElementById('blue'),
    screenElement = document.getElementById('screen'),
    countElement = document.getElementById('count'),
    startBtnElement = document.getElementById('start'),
    strictLightElement = document.getElementById('light'),
    strictBtnElement = document.getElementById('strict'),
    powerBtnElement = document.getElementById('power');

  /*
   * Variables.
   */
  var isOn = false,
    strictMode = false;
  // is playing
  // sequence
  // currentSequenceIndex
  // delay

  /*
   * Add event listeners.
   */

  powerBtnElement.addEventListener('change', togglePower);

  function togglePower() {
    if (powerBtnElement.checked) {
      turnOn();
    } else {
      turnOff();
    }
  }

  function turnOn() {
    isOn = true;
    screenElement.classList.add('lit');
  }

  function turnOff() {
    isOn = false;
    screenElement.classList.remove('lit');
    countElement.innerText = '--';
    strictMode = false;
    strictLightElement.classList.remove('lit');
    /*
    Reset anything else here
    */
  }

  startBtnElement.addEventListener('click', startGame);

  function startGame() {
    makeScreenFlash();
  }

  function makeScreenFlash() {
    var flashCount = 0;
    var screenFlashIntervalId = setInterval(function () {
      if (flashCount > 5 || !isOn) {
        clearInterval(screenFlashIntervalId);
      } else {
        flashCount++;
        screenElement.classList.toggle('lit');
      }
    }, 500);
  }

  strictBtnElement.addEventListener('click', toggleStrictMode);

  function toggleStrictMode() {
    strictMode = (isOn) ? !strictMode : false;
    strictLightElement.classList.toggle('lit', strictMode);
  }

  greenBtnElement.addEventListener('mousedown', function () {
    greenSound.play();
    greenBtnElement.classList.add('lit');
  });

  greenBtnElement.addEventListener('mouseup', function () {
    greenSound.stop();
    greenBtnElement.classList.remove('lit');
  });

  greenBtnElement.addEventListener('touchstart', function () {
    greenSound.play();
    greenBtnElement.classList.add('lit');
  });

  greenBtnElement.addEventListener('touchend', function () {
    greenSound.stop();
    greenBtnElement.classList.remove('lit');
  });

  redBtnElement.addEventListener('mousedown', function () {
    redSound.play();
    redBtnElement.classList.add('lit');
  });

  redBtnElement.addEventListener('mouseup', function () {
    redSound.stop();
    redBtnElement.classList.remove('lit');
  });

  redBtnElement.addEventListener('touchstart', function () {
    redSound.play();
    redBtnElement.classList.add('lit');
  });

  redBtnElement.addEventListener('touchend', function () {
    redSound.stop();
    redBtnElement.classList.remove('lit');
  });

  yellowBtnElement.addEventListener('mousedown', function () {
    yellowSound.play();
    yellowBtnElement.classList.add('lit');
  });

  yellowBtnElement.addEventListener('mouseup', function () {
    yellowSound.stop();
    yellowBtnElement.classList.remove('lit');
  });

  yellowBtnElement.addEventListener('touchstart', function () {
    yellowSound.play();
    yellowBtnElement.classList.add('lit');
  });

  yellowBtnElement.addEventListener('touchend', function () {
    yellowSound.stop();
    yellowBtnElement.classList.remove('lit');
  });

  blueBtnElement.addEventListener('mousedown', function () {
    blueSound.play();
    blueBtnElement.classList.add('lit');
  });

  blueBtnElement.addEventListener('mouseup', function () {
    blueSound.stop();
    blueBtnElement.classList.remove('lit');
  });

  blueBtnElement.addEventListener('touchstart', function () {
    blueSound.play();
    blueBtnElement.classList.add('lit');
  });

  blueBtnElement.addEventListener('touchend', function () {
    blueSound.stop();
    blueBtnElement.classList.remove('lit');
  });

});