import { storGetRecs, storDeleteFiles, downloadFile, 
  fileExists, storGetFile, getRecordJson 
} from './file-handling.js'
import { selectAll, transition, easeLinear } from './nl.min.js'
import { getOpt, detailsFromFilename, getSs, setSs } from './common.js'
import { playBlob } from './play.js'
import { populateRecordFields } from './record-details.js'

let storRecs, audioPlayers = {}

export async function initialiseList() {

  storRecs = await storGetRecs()

  console.log(storRecs.length)

  if (!storRecs.length) {
    document.getElementById('record-list').innerHTML = `<h3>No records to display</h3><p>Make some!</p>`
    return
  }

  storRecs = storRecs.sort((a,b) => {
    // Sort on date first and then time
    let comparison = 0
    if (a.date > b.date) {
      comparison = -1
    } else if (a.date < b.date) {
      comparison = 1
    }
    if (comparison === 0) {
      if (a.time > b.time) {
        comparison = -1
      } else if (a.time < b.time) {
        comparison = 1
      } 
    }
    return comparison
  })
  console.log('storRecs', storRecs)

  // If the currently selected file indicated by
  // session storage is no longer present, then
  // reset it.
  if (!storRecs.find(r => r.filename === getSs('selectedFile'))) {
    setSs('selectedFile', '')
  }
  // Populate with files from storage (large devices)
  document.getElementById('record-list').innerHTML = ''

  for (let i=0; i<storRecs.length; i++) {
    const name = storRecs[i].filename
    // Create div
    const fileDiv = document.createElement('div')
    fileDiv.setAttribute('id', `file-div-${i}`)
    fileDiv.setAttribute('data-file-name', name) 
    fileDiv.classList.add('record-div')
    fileDiv.addEventListener('click', recordSelected)
    if (name === getSs('selectedFile')) {
      fileDiv.classList.add('record-selected')
    }
    // Play image
    const playImage = document.createElement('img')
    let img
    if (await fileExists(`${name}.wav`)) {
      img = 'images/playback-green.png'
    } else {
      img = 'images/playback-grey.png'
    }
    playImage.setAttribute('src', img)
    playImage.setAttribute('data-index', i)
    playImage.setAttribute('id', `record-play-image-${i}`)
    playImage.classList.add('record-play-image')
    if (await fileExists(`${name}.wav`)) {
      playImage.addEventListener('click', playRecording)
    } else {
      playImage.classList.add('no-wav')
    }
    fileDiv.appendChild(playImage)
    // Logo
    const logoImage = document.createElement('img')
    logoImage.setAttribute('src', 'images/gilbert.png')
    logoImage.classList.add('record-logo')
    fileDiv.appendChild(logoImage)
    // Text
    const textDiv = document.createElement('div')
    textDiv.setAttribute('id', `rec-text-${name}`)
    textDiv.classList.add('record-div-text')
    fileDiv.appendChild(textDiv)
    
    // Select checkbox
    const check = document.createElement('input')
    check.setAttribute('type', 'checkbox')
    check.setAttribute('id', `record-checkbox-${i}`)
    check.classList.add('record-checkbox')
    check.addEventListener('click', recordChecked)
    fileDiv.appendChild(check)
    
    document.getElementById('record-list').appendChild(fileDiv)

    // If I set the text immediately after fileDiv.appendChild(textDiv)
    // it fails (for v1) because element appears not yet created,
    // so doing it here at end which seems to work.
    setRecordText(name)
  }
}

export async function setRecordText(filename) {
  let details
  if (getOpt('emulate-v1') === 'true') {
    // Base text on the filename
    details = detailsFromFilename(filename)
  } else {
    // Base text on the JSON file values
    details = await getRecordJson(`${filename}.txt`)
  }
  let html = details.date
  html = buildText(html, details.time.substring(0, 5), ' ')
  html = buildText(html, details.gridref, '<br/>')
  html = buildText(html, details['scientific-name'], '<br/>')

  document.getElementById(`rec-text-${filename}`).innerHTML = html

  function buildText(txt1, txt2, sep) {
    if (txt1 && txt2) {
      return `${txt1}${sep}${txt2}`
    } else if (txt1) {
      return txt1
    } else {
      return txt2
    }
  }
}

export async function deleteChecked(e) {
  flash(e.target.id)
  const n =  storRecs.reduce((a,r,i) => document.getElementById(`record-checkbox-${i}`).checked ? a+1 : a, 0)
  if (n) {
    document.getElementById('file-num').innerText = n
    document.getElementById('file-text').innerText = n === 1 ? 'file' : 'files'
    document.getElementById('delete-confirm-dialog').showModal()
  }
}

export async function deleteYesNo(e) {
  document.getElementById('delete-confirm-dialog').close()
  if (e.target.getAttribute('id') === 'delete-confirm') {
    const files = []
    for (let i=0; i<storRecs.length; i++) {
      const name = storRecs[i].filename
      if (document.getElementById(`record-checkbox-${i}`).checked) {
        if (await fileExists(`${name}.wav`)) {
          files.push(`${name}.wav`)
        }
        if (await fileExists(`${name}.txt`)) {
          files.push(`${name}.txt`)
        }   
      }
    }
    await storDeleteFiles(files)
    await initialiseList()
    populateRecordFields()
  }
}

export async function shareChecked(e) {
  flash(e.target.id)
  const n =  storRecs.reduce((a,r,i) => document.getElementById(`record-checkbox-${i}`).checked ? a+1 : a, 0)
  if (n) {
    const files = []
    for (let i=0; i<storRecs.length; i++) {
      const name = storRecs[i].filename
      if (document.getElementById(`record-checkbox-${i}`).checked) {
        if (await fileExists(`${name}.wav`)) {
          const wav = await storGetFile(`${name}.wav`)
          files.push(wav)
        }
        if (await fileExists(`${name}.txt`)) {
          const txt = await storGetFile(`${name}.txt`)
          files.push(txt)
        }   
      }
    }
    console.log('files', files)
    navigator.share({files: files})
  }
}

export async function downloadChecked(e) {
  console.log('e', e)
  flash(e.target.id)
  const n =  storRecs.reduce((a,r,i) => document.getElementById(`record-checkbox-${i}`).checked ? a+1 : a, 0)
  if (n) {
    for (let i=0; i<storRecs.length; i++) {
      const name = storRecs[i].filename
      if (document.getElementById(`record-checkbox-${i}`).checked) {
        // Download WAV if it exists
        if (await fileExists(`${name}.wav`)) {
          downloadFile(`${name}.wav`)
        }
        // Download JSON (txt) if it exists and not emulating v1
        if (getOpt('emulate-v1') === 'false' && await fileExists(`${name}.txt`)) {
          downloadFile(`${name}.txt`)
        }
      }
    }
  }
}

export function uncheckAll(e) {
  flash(e.target.id)
  const checkboxes = document.getElementsByClassName('record-checkbox')
  for(let i=0, n=checkboxes.length;i<n;i++) {
    checkboxes[i].checked = false
  }
}

export function checkAll(e) {
  flash(e.target.id)
  const checkboxes = document.getElementsByClassName('record-checkbox')
  for(let i=0, n=checkboxes.length;i<n;i++) {
    checkboxes[i].checked = true
  }
}

function flash(id) {
  console.log('id', id)
  const t = transition().duration(300).ease(easeLinear)
  selectAll(`#${id}.nabvar-icon path, #${id}.nabvar-icon circle`)
    .transition(t).style("stroke", "#00FF21")
    .transition(t).style("stroke", "white")
  selectAll(`#${id}.nabvar-icon-2 path`)
    .transition(t).style("fill", "#00FF21")
    .transition(t).style("fill", "white")
}

function recordChecked(e) {
  e.stopPropagation()
}

function recordSelected(e) {
  const currentSelected = document.getElementsByClassName("record-selected")
  let deselect = false
  if (currentSelected.length) {
    if(currentSelected[0].getAttribute('data-file-name') === e.target.getAttribute('data-file-name')) {
      // User has clicked on an already selected record
      deselect = true
    }
    currentSelected[0].classList.remove("record-selected")
  }

  // Select the record
  if (!deselect) {
    e.target.classList.add("record-selected")
    setSs( 'selectedFile', e.target.getAttribute('data-file-name'))
  } else {
    setSs( 'selectedFile', '')
  }
  populateRecordFields()
}

async function playRecording(e) {
  //console.log('Playback', e.target.getAttribute('data-index'))

  e.stopPropagation()

  const i = Number(e.target.getAttribute('data-index'))
  const playbackImage = document.getElementById(`record-play-image-${i}`)

  playbackImage.removeEventListener('click', playRecording)
  playbackImage.src = "images/playback-red.png"
  playbackImage.classList.add("flashing")
  playbackImage.addEventListener('click', stopPlayback)

  audioPlayers[i] = new Audio()
  const audioFile = await storGetFile(`${storRecs[i].filename}.wav`)
  await playBlob(audioPlayers[i], audioFile, getOpt('playback-volume'))

  playbackImage.removeEventListener('click', stopPlayback)
  playbackImage.src = "images/playback-green.png"
  playbackImage.classList.remove("flashing")
  playbackImage.addEventListener('click', playRecording)
}

function stopPlayback(e) {

  e.stopPropagation()

  const i = Number(e.target.getAttribute('data-index'))
  const playbackImage = document.getElementById(`record-play-image-${i}`)

  audioPlayers[i].pause()
  audioPlayers[i].currentTime = 0
  audioPlayers[i] = null

  playbackImage.removeEventListener('click', stopPlayback)
  playbackImage.src = "images/playback-green.png"
  playbackImage.classList.remove("flashing")
  playbackImage.addEventListener('click', playRecording)
}