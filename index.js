'use strict'

let exerciseSeconds = [20, 20, 20, 20, 30, 30, 30, 30, 30, 60, 60, 90]

const restSeconds = [5, 5, 5, 5, 10, 10, 10, 10, 10, 20, 20, 30, 60]

const exercises = [
  [
    'forward lunges',
    'side lunges',
    'high knees',
    'jump knee tucks',
    'climbers',
    'squats',
    'jumping squats',
    'bridges'
  ],
  [
    'sit-ups',
    'crunches',
    'flutter kicks',
    'high plank',
    'elbow plank',
    'leg raises'
  ],
  [
    'alt arm/leg plank',
    'superman',
    'push ups',
    'shoulder taps',
    'plank rotations'
  ]
]

// Picks an item at random from an array
function uniform (array) {
  return array[Math.floor(Math.random() * array.length)]
}

let totalSecondsLeft = 0
let isRest = false
let exerciseType = uniform([0, 1, 2])

function done () {
  document.querySelector('h1').innerText = 'Done!'
  document.querySelector('.circle').style.display = 'none'
  document.querySelector('.controlls').style.display = 'none'
  document.querySelector('#remaining').style.display = 'none'
}
let intervalTimer
let timeLeft
let wholeTime
let exercise
let isPaused
let isStarted = false
const progressBar = document.querySelector('.e-c-progress')
const pointer = document.getElementById('e-pointer')

const length = Math.PI * 2 * 100
function update (value, timePercent) {
  const offset = -length - length * value / (timePercent)
  progressBar.style.strokeDashoffset = offset
  pointer.style.transform = `rotate(${360 * value / (timePercent)}deg)`
}

function initTimer () {
  const pauseBtn = document.getElementById('pause')
  // circle start
  progressBar.style.strokeDasharray = length

  // circle ends
  const displayOutput = document.querySelector('.display-remain-time')

  isPaused = false

  if (totalSecondsLeft <= 0) {
    done()
    return
  }

  if (isRest) {
    exercise = 'Rest'
    wholeTime = uniform(restSeconds)
  } else {
    exercise = uniform(exercises[exerciseType])
    wholeTime = uniform(exerciseSeconds)
    exerciseType = (exerciseType + 1) % 3
  }
  isRest = !isRest

  if (wholeTime > totalSecondsLeft) {
    wholeTime = totalSecondsLeft
  }
  timeLeft = wholeTime

  document.querySelector('h1').innerText = exercise

  update(wholeTime, wholeTime) // refreshes progress bar

  function timer () {
    if (intervalTimer) {
      clearInterval(intervalTimer)
    }
    displayTimeLeft()
    intervalTimer = setInterval(function () {
      timeLeft = timeLeft - 1
      if (timeLeft < 0 && totalSecondsLeft > 0) {
        initTimer()
      } else {
        displayTimeLeft()
      }
    }, 1000)
  }
  function pauseTimer (restart) {
    if (isStarted === false) {
      timer()
      isStarted = true
      pauseBtn.classList.remove('play')
      pauseBtn.classList.add('pause')
      isPaused = false
    } else if (isPaused || restart) {
      pauseBtn.classList.remove('play')
      pauseBtn.classList.add('pause')
      timer()
      isPaused = false
    } else {
      pauseBtn.classList.remove('pause')
      pauseBtn.classList.add('play')
      clearInterval(intervalTimer)
      isPaused = true
    }
  }

  function displayTimeLeft () {
    const totalMinutesLeft = Math.floor(totalSecondsLeft / 60)
    let remainderSeconds = String(totalSecondsLeft % 60)
    if (remainderSeconds.length < 2) {
      remainderSeconds = '0' + remainderSeconds
    }
    timeRemaining.innerText = `${totalMinutesLeft}:${remainderSeconds}`
    if (totalSecondsLeft > 0) {
      totalSecondsLeft = totalSecondsLeft - 1
    } else {
      // show that we are done
      done()
      return
    }
    let minutes = Math.floor(timeLeft / 60)
    let seconds = timeLeft % 60
    let displayString = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
    displayOutput.textContent = displayString
    update(timeLeft, wholeTime)
  }
  pauseBtn.onclick = (e) => { pauseTimer() }
  document.body.onkeydown = (e) => {
    if (e.keyCode === 32) {
      e.preventDefault()
      e.stopPropagation()
      pauseTimer()
    }
  }
  pauseTimer(true)
}

start.onclick = () => {
  const input = document.querySelector('input')
  const totalMinutes = parseInt(input.value) || 20
  totalSecondsLeft = 60 * totalMinutes
  circleTimer.style.display = 'block'
  input.value = totalMinutes
  start.style.display = 'none'
  document.querySelector('input').disabled = true
  initTimer()
}

window.onload = () => {
  const input = document.querySelector('input')
  input.focus()
  input.select()
  input.onkeydown = (e) => {
    if (e.key === 'Enter') {
      start.onclick()
    }
  }
}
