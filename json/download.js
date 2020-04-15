const fetch = require('node-fetch')
const fs = require('fs')

const exercises = [
  'forward lunges',
  'side lunges',
  'high knees',
  'climbers',
  'squats',
  'Rest',
  'glute bridges',
  'sit-ups',
  'crunches',
  'flutter kicks',
  'scissor kicks',
  'high plank',
  'elbow plank',
  'leg raises',
  'superman',
  'push ups',
  'shoulder taps',
  'plank rotations',
  'jump squats',
  'butt kicks',
  'jumping jacks',
  'russian twist'
]

const download = (exercise, index) => {
  const jsonName = `${exercise.replace(/ /g, '')}${index}.json`
  const json = JSON.parse(fs.readFileSync(jsonName))
  json.items.forEach((item, i) => {
    const url = item.link
    if (item.mime !== 'image/jpeg') {
      console.log('not a jpeg', url)
      return
    }
    const name = `../img/${exercise.replace(/ /g, '')}-${index}-${i}.jpg`
    fetch(url).then(async (response) => {
      if (!response.ok) {
        console.log('bad link', url)
        return
      }
      const dest = fs.createWriteStream(name)
      response.body.pipe(dest)
    }).catch((e) => {
      console.log('skipping', name)
    })
  })
}

exercises.forEach((exercise) => {
  const indices = [0, 1, 2, 3, 4, 5]
  indices.forEach(async (index) => {
    download(exercise, index)
  })
})
