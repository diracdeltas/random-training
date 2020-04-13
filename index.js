'use strict'
/* global SC */

let exerciseSeconds = [20, 20, 20, 20, 30, 30, 30, 30, 30, 60, 60, 90]

const restSeconds = [5, 5, 5, 5, 10, 10, 10, 10, 10, 20, 20, 30, 60]
const CX = '016260358267380303853:hhm1wdid5ti'
const KEY = window.location.hostname === 'localhost'
  ? 'AIzaSyBdMbfcLElXZVEhjIgHdfCoOaetzGjbMVY'
  : 'AIzaSyAIuKK4Gwa081NEzODhO2kkvFlH-VKz_DA'

const cachedSearchJson = {}

const setBackground = (exercise) => {
  const searchTerm = exercise === 'Rest' ? 'resting' : `${exercise.replace(/ /g, '+')}+exercise`
  const url = `https://www.googleapis.com/customsearch/v1?key=${KEY}&cx=${CX}&q=${searchTerm}&searchType=image&fileType=jpg&alt=json`
  if (!cachedSearchJson[exercise]) {
    window.fetch(url).then(async (response) => {
      const json = await response.json()
      cachedSearchJson[exercise] = json
      pickRandomImage(json)
    })
  } else {
    console.log('using cached images')
    pickRandomImage(cachedSearchJson[exercise])
  }
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
    'climbers',
    'squats',
    'jumping squats',
    'glute bridges'
  ],
  [
    'sit-ups',
    'crunches',
    'flutter kicks',
    'scissor kicks',
    'high plank',
    'elbow plank',
    'leg raises'
  ],
  [
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

let widget
function trySoundcloudLoad () {
  if (!widget) { return }
  const id = Math.ceil(Math.random() * 786759307)
  const url = `https://api.soundcloud.com/tracks/${id}`
  widget.load(url, {
    show_artwork: true,
    show_comments: true,
    show_user: true,
    auto_play: true
  })
  widget.bind(SC.Widget.Events.ERROR, () => {
    trySoundcloudLoad(widget)
  })
}

function initSoundcloud () {
  const iframe = document.querySelector('iframe')
  document.querySelector('#soundcloud').style.display = 'block'
  const id = Math.ceil(Math.random() * 786759307)
  iframe.src = `https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${id}&color=%23ff5500&auto_play=true&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`
  widget = SC.Widget(iframe)
  widget.bind(SC.Widget.Events.ERROR, () => {
    trySoundcloudLoad()
  })
  widget.bind(SC.Widget.Events.FINISH, () => {
    trySoundcloudLoad()
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

  if (isRest) {
    exercise = 'Rest'
    wholeTime = uniform(restSeconds)
  } else {
    exercise = uniform(exercises[exerciseType])
    wholeTime = uniform(exerciseSeconds)
    exerciseType = (exerciseType + 1) % 3
  }
  setBackground(exercise)
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
      if (widget) { widget.play() }
    } else {
      pauseBtn.classList.remove('pause')
      pauseBtn.classList.add('play')
      clearInterval(intervalTimer)
      isPaused = true
      if (widget) { widget.pause() }
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
  totalMinutes = parseInt(input.value) || totalMinutes
  totalSecondsLeft = 60 * totalMinutes
  document.querySelector('#circleTimer').style.display = 'block'
  document.querySelector('#head').style.display = 'none'
  restart.style.display = 'block'
  initTimer()
}
restart.onclick = () => {
  totalSecondsLeft = 60 * totalMinutes
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
