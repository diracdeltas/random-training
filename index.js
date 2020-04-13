'use strict'

const exerciseSeconds = [30, 30, 30, 30, 60, 60, 60, 90, 90, 120]
const restSeconds = [5, 5, 5, 5, 10, 10, 10, 10, 10, 20, 20, 30, 60]

const exercises = {
  lower: [
    'forward lunges',
    'side lunges',
    'high knees',
    'climbers',
    'squats',
    'jump squats',
    'bridges'
  ],
  core: [
    'sit-ups',
    'bicycle crunches',
    'flutter kicks',
    'plank',
    'leg raises'
  ],
  arms: [
    'close-grip push ups',
    'alternating arm/leg plank',
    'superman',
    'push ups',
    'shoulder taps',
    'plank rotations'
  ]
}

start.onclick = () => {
  circleTimer.style.display = 'block'

  // circle start
  let progressBar = document.querySelector('.e-c-progress')
  let pointer = document.getElementById('e-pointer')
  let length = Math.PI * 2 * 100

  progressBar.style.strokeDasharray = length

  function update (value, timePercent) {
    var offset = -length - length * value / (timePercent)
    progressBar.style.strokeDashoffset = offset
    pointer.style.transform = `rotate(${360 * value / (timePercent)}deg)`
  }

  // circle ends
  const displayOutput = document.querySelector('.display-remain-time')
  const pauseBtn = document.getElementById('pause')

  let intervalTimer
  let timeLeft
  let wholeTime = 0.5 * 60 // manage this to set the whole time
  let isPaused = false
  let isStarted = false

  update(wholeTime, wholeTime) // refreshes progress bar
  displayTimeLeft(wholeTime)

  function timer (seconds) {
    let remainTime = Date.now() + (seconds * 1000)
    displayTimeLeft(seconds)
    intervalTimer = setInterval(function () {
      timeLeft = Math.round((remainTime - Date.now()) / 1000)
      if (timeLeft < 0) {
        clearInterval(intervalTimer)
        isStarted = false
        displayTimeLeft(wholeTime)
        pauseBtn.classList.remove('pause')
        pauseBtn.classList.add('play')
        return
      }
      displayTimeLeft(timeLeft)
    }, 1000)
  }
  function pauseTimer (event) {
    if (isStarted === false) {
      timer(wholeTime)
      isStarted = true
      this.classList.remove('play')
      this.classList.add('pause')
    } else if (isPaused) {
      this.classList.remove('play')
      this.classList.add('pause')
      timer(timeLeft)
      isPaused = !isPaused
    } else {
      this.classList.remove('pause')
      this.classList.add('play')
      clearInterval(intervalTimer)
      isPaused = !isPaused
    }
  }

  function displayTimeLeft (timeLeft) {
    let minutes = Math.floor(timeLeft / 60)
    let seconds = timeLeft % 60
    let displayString = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
    displayOutput.textContent = displayString
    update(timeLeft, wholeTime)
  }

  pauseBtn.addEventListener('click', pauseTimer)
}
