'use strict'
/* global SC */

let exerciseSeconds = [20, 20, 20, 20, 30, 30, 30, 30, 30, 45, 45, 60, 60, 60]

const restSeconds = [10, 10, 10, 10, 20, 20, 20, 30]

const synth = window.speechSynthesis

const sayExercise = (seconds, exercise) => {
  const phrase = new window.SpeechSynthesisUtterance(`${exercise}, ${seconds} seconds`)
  synth.speak(phrase)
}

const sayCountdown = (number) => {
  const phrase = new window.SpeechSynthesisUtterance(`${number}`)
  synth.speak(phrase)
}

const setBackground = (exercise) => {
  const index = uniform([0, 1, 2, 3, 4, 5])
  const url = `/json/${exercise.replace(/ /g, '')}${index}.json`
  window.fetch(url).then(async (response) => {
    const json = await response.json()
    pickRandomImage(json)
  })
}

const pickRandomImage = (json) => {
  const item = uniform(json.items)
  const url = item.link
  document.body.style.backgroundImage = `url("${url}")`
}

const exercises = [
  [
    'forward lunges',
    'side lunges',
    'high knees',
    'squats',
    'jump squats',
    'glute bridges',
    'butt kicks'
  ],
  [
    'climbers',
    'jumping jacks',
    'crunches',
    'flutter kicks',
    'scissor kicks',
    'russian twist',
    'leg raises'
  ],
  [
    'superman',
    'push ups',
    'shoulder taps',
    'plank rotations',
    'high plank',
    'elbow plank'
  ],
  [
    'Rest'
  ]
]

// Picks an integer at random from a range, excluding max
function randRange (max, min) {
  min = min || 0
  const rand = Math.floor(Math.random() * (max - min))
  return min + rand
}
// Picks an item at random from an array
function uniform (array) {
  return array[randRange(array.length)]
}

let totalSecondsLeft = 0
let exerciseType = 0

function done () {
  const h1 = document.querySelector('h1')
  h1.innerText = 'Done!\n'
  document.querySelector('.circle').style.display = 'none'
  document.querySelector('.controlls').style.display = 'none'
  document.querySelector('#remaining').style.display = 'none'
  restart.style.display = 'none'
  const iframe = document.querySelector('iframe')
  iframe.src = ''
  iframe.style.display = 'none'
  const href = `https://www.allrecipes.com/recipe/${randRange(10000, 247479)}`
  const a = document.createElement('a')
  a.innerText = 'How about a snack?'
  a.href = href
  a.target = '_blank'
  h1.appendChild(a)
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

let widget

function trySoundcloudLoad (iframe) {
  let url
  let startTrack = 0
  const id = randRange(1, 786759308)
  url = `https://api.soundcloud.com/tracks/${id}`
  iframe.src = `https://w.soundcloud.com/player/?url=${url}&color=%23ff5500&auto_play=true&show_reposts=false&show_teaser=true&visual=true&start_track=${startTrack}`
}

function initSoundcloud () {
  const iframe = document.querySelector('iframe')
  document.querySelector('#soundcloud').style.display = 'block'
  trySoundcloudLoad(iframe)
  widget = SC.Widget(iframe)
  widget.bind(SC.Widget.Events.ERROR, () => {
    trySoundcloudLoad(iframe)
  })
  widget.bind(SC.Widget.Events.FINISH, () => {
    trySoundcloudLoad(iframe)
  })
}

function initTimer () {
  initSoundcloud()
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

  exercise = uniform(exercises[exerciseType])
  wholeTime = uniform(exercise === 'rest' ? restSeconds : exerciseSeconds)
  exerciseType = (exerciseType + 1) % 4
  try {
    setBackground(exercise)
  } catch (e) {
    console.log('could not set background', e)
  }

  if (wholeTime > totalSecondsLeft) {
    wholeTime = totalSecondsLeft
  }
  sayExercise(wholeTime, exercise)
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
        if (timeLeft < 0) {
          sayCountdown('You are now done. How about a snack?')
          clearInterval(intervalTimer)
          return
        }
        if (timeLeft < 4) {
          sayCountdown(timeLeft)
        }
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
      try {
        widget.play()
      } catch (e) {}
    } else {
      pauseBtn.classList.remove('pause')
      pauseBtn.classList.add('play')
      clearInterval(intervalTimer)
      isPaused = true
      try {
        widget.pause()
      } catch (e) {}
    }
  }

  function displayTimeLeft () {
    const totalMinutesLeft = Math.floor(totalSecondsLeft / 60)
    let remainderSeconds = String(totalSecondsLeft % 60)
    if (remainderSeconds.length < 2) {
      remainderSeconds = '0' + remainderSeconds
    }
    document.querySelector('#timeRemaining').innerText =
      `${totalMinutesLeft}:${remainderSeconds}`
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
      // spacebar was hit
      e.preventDefault()
      e.stopPropagation()
      pauseTimer()
    }
  }
  pauseTimer(true)
}

const start = document.querySelector('#start')
const restart = document.querySelector('#restart')
let totalMinutes = 20
start.onclick = () => {
  const input = document.querySelector('input')
  totalMinutes = parseFloat(input.value) || totalMinutes
  totalSecondsLeft = Math.ceil(60 * totalMinutes)
  document.querySelector('#circleTimer').style.display = 'block'
  document.querySelector('#head').style.display = 'none'
  restart.style.display = 'block'
  initTimer()
}
restart.onclick = () => {
  totalSecondsLeft = Math.ceil(60 * totalMinutes)
  exerciseType = 0
  restart.style.display = 'block'
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
