import { storGetWavFiles, storDeleteFiles, downloadBlob } from './file-handling.js'
import { selectAll, transition, easeLinear } from './nl.min.js'
import { getOpt, setSsJson, getSsJson } from './common.js'
import { playBlob } from './play.js'
import { populateRecordFields } from './record-details.js'

let storFiles
const recordingDiv = document.getElementById('record-list')
const deleteConfirmDialog = document.getElementById('delete-confirm-dialog')

initialiseList()

async function initialiseList() {
  // Populate with files from origin private file system (root folder)
  recordingDiv.innerHTML = ''
  storFiles = await storGetWavFiles()

  const selectedFilename = getSsJson('selectedFile') ? getSsJson('selectedFile').filename : ''
  //console.log('currentSelected', selectedFilename)

  let matchSf = false
  storFiles.forEach((f,i) => {
    // Create div
    const fileDiv = document.createElement('div')
    fileDiv.setAttribute('id', `file-div-${i}`)
    fileDiv.setAttribute('data-file-name', f.name)
    fileDiv.classList.add('record-div')
    fileDiv.addEventListener('click', recordSelected)

    if (f.name === selectedFilename) {
      fileDiv.classList.add('record-selected')
      matchSf = true
    }

    // Play image
    const playImage = document.createElement('img')
    playImage.setAttribute('src', 'images/playback-green.png')
    playImage.setAttribute('data-index', i)
    playImage.setAttribute('id', `record-play-image-${i}`)
    playImage.classList.add('record-play-image')
    playImage.addEventListener('click', playRecording)
    fileDiv.appendChild(playImage)
    // Logo
    const logoImage = document.createElement('img')
    logoImage.setAttribute('src', 'images/gilbert.png')
    logoImage.classList.add('record-logo')
    fileDiv.appendChild(logoImage)
    // Text
    const sName = f.name.split('_')
    const date = `${sName[0].substring(8,10)}/${sName[0].substring(5,7)}/${sName[0].substring(0,4)}`
    const time = sName[1].replace(/-/g, ':')
    let location, accuracy, altitude
    if (sName.length === 5) {
      // Name is in GR
      location = sName[2]
      accuracy = sName[3]
      altitude = sName[4].substring(0, sName[4].length-4)
    } else {
      // Name is lat/lon format
      location = `${sName[2]}/${sName[3]}`
      accuracy = sName[4]
      altitude = sName[5].substring(0, sName[5].length-4)
    }
    const textDiv = document.createElement('div')
    textDiv.classList.add('record-div-text')
    textDiv.innerHTML=`${date} ${time}<br/>${location}`
    fileDiv.appendChild(textDiv)
    // Set the date, time and location data attributes of the div
    fileDiv.setAttribute('data-file-date', date)
    fileDiv.setAttribute('data-file-time', time)
    fileDiv.setAttribute('data-file-location', location)
    fileDiv.setAttribute('data-file-accuracy', accuracy)
    fileDiv.setAttribute('data-file-altitude', altitude)

    // Select checkbox
    const check = document.createElement('input')
    check.setAttribute('type', 'checkbox')
    check.setAttribute('id', `record-checkbox-${i}`)
    check.classList.add('record-checkbox')
    check.addEventListener('click', recordChecked)
    fileDiv.appendChild(check)
    
    recordingDiv.appendChild(fileDiv)
  })
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
    const names = []
    storFiles.forEach((f,i) => {
      if (document.getElementById(`record-checkbox-${i}`).checked) {
        names.push(f.name)
      }
    })
    await storDeleteFiles(names)
    await initialiseList()
    populateRecordFields()
  }
}

export async function shareChecked(el) {
  flash(el.id)
  const n =  storFiles.reduce((a,f,i) => document.getElementById(`record-checkbox-${i}`).checked ? a+1 : a, 0)
  if (n) {
    const files = []
    storFiles.forEach((f,i) => {
      if (document.getElementById(`record-checkbox-${i}`).checked) {
        files.push(f.file)
      }
    })
    navigator.share({files: files})
  }
}

export async function downloadChecked(el) {
  flash(el.id)
  const n =  storFiles.reduce((a,f,i) => document.getElementById(`record-checkbox-${i}`).checked ? a+1 : a, 0)
  if (n) {
    const files = []
    storFiles.forEach((f,i) => {
      if (document.getElementById(`record-checkbox-${i}`).checked) {
        downloadBlob(f.file, f.name)
      }
    })
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

  storFiles[i].playback = new Audio()
  await playBlob(storFiles[i].playback, storFiles[i].file, getOpt('playback-volume'))

  playbackImage.removeEventListener('click', stopPlayback)
  playbackImage.src = "images/playback-green.png"
  playbackImage.classList.remove("flashing")
  playbackImage.addEventListener('click', playRecording)
}

function stopPlayback(e) {

  e.stopPropagation()

  const i = Number(e.target.getAttribute('data-index'))
  const playbackImage = document.getElementById(`record-play-image-${i}`)

  storFiles[i].playback.pause()
  storFiles[i].playback.currentTime = 0
  storFiles[i].playback = null

  playbackImage.removeEventListener('click', stopPlayback)
  playbackImage.src = "images/playback-green.png"
  playbackImage.classList.remove("flashing")
  playbackImage.addEventListener('click', playRecording)
}