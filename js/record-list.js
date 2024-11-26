import { storGetRecFiles, storDeleteFiles, downloadFile, fileExists, 
  storGetFile, getFileJson } from './file-handling.js'
import { selectAll, transition, easeLinear } from './nl.min.js'
import { getOpt, setSsJson, getSsJson, getFieldDefs, detailsFromFilename } from './common.js'
import { playBlob } from './play.js'
import { populateRecordFields } from './record-details.js'

let storFiles, audioPlayers = {}
const recordingDiv = document.getElementById('record-list')
const deleteConfirmDialog = document.getElementById('delete-confirm-dialog')

initialiseList()

async function initialiseList() {
  // Populate with files from chosen storage 
  recordingDiv.innerHTML = ''
  storFiles = await storGetRecFiles()
  console.log('storFiles', storFiles)
  const selectedFilename = getSsJson('selectedFile') ? getSsJson('selectedFile').filename : ''
  let matchSf = false
  for (let i=0; i<storFiles.length; i++) {
    const name = storFiles[i]
    // Create div
    const fileDiv = document.createElement('div')
    fileDiv.setAttribute('id', `file-div-${i}`)
    
    fileDiv.setAttribute('data-file-name', name) 
    fileDiv.classList.add('record-div')
    fileDiv.addEventListener('click', recordSelected)
    if (name === selectedFilename) {
      fileDiv.classList.add('record-selected')
      matchSf = true
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
    let details
    console.log('name', name)
    if (getOpt('emulate-v1') === 'true') {
      // Base text on the filename
      details = detailsFromFilename(name)
    } else {
      // Base text on the JSON file values
      let json = {}
      if (await fileExists(`${name}.txt`)) {
        json = await getFileJson(`${name}.txt`)
        details = json.wav
      } else {
        // json file, does not exist - so create it
        details = detailsFromFilename(name)
        json.wav = details
        getFieldDefs(name).forEach(f => {
          json.jsonId = f.default
        })
      }
    }
    const textDiv = document.createElement('div')
    textDiv.classList.add('record-div-text')
    textDiv.innerHTML=`${details.date} ${details.time}<br/>${details.location}`
    fileDiv.appendChild(textDiv)
    // Set the date, time and location data attributes of the div
    fileDiv.setAttribute('data-file-date', details.date)
    fileDiv.setAttribute('data-file-time', details.time)
    fileDiv.setAttribute('data-file-location', details.location)
    fileDiv.setAttribute('data-file-accuracy', details.accuracy)
    fileDiv.setAttribute('data-file-altitude', details.altitude)

    // Select checkbox
    const check = document.createElement('input')
    check.setAttribute('type', 'checkbox')
    check.setAttribute('id', `record-checkbox-${i}`)
    check.classList.add('record-checkbox')
    check.addEventListener('click', recordChecked)
    fileDiv.appendChild(check)
    
    recordingDiv.appendChild(fileDiv)
  }
  if (!matchSf) {
    // Currently stored selected file is no longer present
    // so probably deleted.
    setSsJson( 'selectedFile', null)
  }
}

export async function deleteChecked(el) {
  flash(el.id)
  const n =  storFiles.reduce((a,f,i) => document.getElementById(`record-checkbox-${i}`).checked ? a+1 : a, 0)
  if (n) {
    document.getElementById('file-num').innerText = n
    document.getElementById('file-text').innerText = n === 1 ? 'file' : 'files'
    deleteConfirmDialog.showModal()
  }
}

export async function deleteYesNo(e) {
  deleteConfirmDialog.close()
  if (e.getAttribute('id') === 'delete-confirm') {
    const files = []
    for (let i=0; i<storFiles.length; i++) {
      const name = storFiles[i]
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

export async function shareChecked(el) {
  flash(el.id)
  const n =  storFiles.reduce((a,f,i) => document.getElementById(`record-checkbox-${i}`).checked ? a+1 : a, 0)
  if (n) {
    const files = []
    for (let i=0; i<storFiles.length; i++) {
      const name = storFiles[i]
      if (document.getElementById(`record-checkbox-${i}`).checked) {
        if (await fileExists(`${name}.wav`)) {
          const wav = await storGetFile(`${name}.wav`)
          files.push(wav)
        }
        if (await fileExists(`${name}.txt`)) {
          const json = await storGetFile(`${name}.txt`)
          files.push(txt)
        }   
      }
    }
    console.log('files', files)
    navigator.share({files: files})
  }
}

export async function downloadChecked(el) {
  flash(el.id)
  const n =  storFiles.reduce((a,f,i) => document.getElementById(`record-checkbox-${i}`).checked ? a+1 : a, 0)
  if (n) {
    for (let i=0; i<storFiles.length; i++) {
      const name = storFiles[i]
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

export function uncheckAll(el) {
  flash(el.id)
  const checkboxes = document.getElementsByClassName('record-checkbox')
  for(let i=0, n=checkboxes.length;i<n;i++) {
    checkboxes[i].checked = false
  }
}

export function checkAll(el) {
  flash(el.id)
  const checkboxes = document.getElementsByClassName('record-checkbox')
  for(let i=0, n=checkboxes.length;i<n;i++) {
    checkboxes[i].checked = true
  }
}

function flash(id) {
  const t = transition().duration(300).ease(easeLinear)
  selectAll(`#${id}.menu-icon path, #${id}.menu-icon circle`)
    .transition(t).style("stroke", "#00FF21")
    .transition(t).style("stroke", "white")
  selectAll(`#${id}.menu-icon-2 path`)
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
    // Save the selected file details to session storage
    // from where it can be used to populate the record details.
    const sf = {
      filename: e.target.getAttribute('data-file-name'),
      date: e.target.getAttribute('data-file-date'),
      time: e.target.getAttribute('data-file-time'),
      location: e.target.getAttribute('data-file-location'),
      accuracy: e.target.getAttribute('data-file-accuracy'),
      altitude: e.target.getAttribute('data-file-altitude')
    }
    setSsJson( 'selectedFile', sf)
  } else {
    setSsJson( 'selectedFile', null)
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
  const audioFile = await storGetFile(`${storFiles[i]}.wav`)
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