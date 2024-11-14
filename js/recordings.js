import { opfsGetFiles, opfsDeleteFiles, downloadBlob } from './file-handling.js'
import { selectAll, transition, easeLinear } from './nl.min.js'
import { getOpt } from './common.js'
import { playBlob } from './play.js'


let opfsFiles
const recordingDiv = document.getElementById('recordings-div')
const deleteConfirmDialog = document.getElementById('delete-confirm-dialog')

initialiseDisplay()

async function initialiseDisplay() {
  // Populate with files from origin private file system (root folder)
  recordingDiv.innerHTML = ''
  opfsFiles = await opfsGetFiles()

  opfsFiles.forEach((f,i) => {
    // Create div
    const fileDiv = document.createElement('div')
    fileDiv.setAttribute('id', `file-div-${i}`)
    fileDiv.classList.add('opfs-div')
    // Play image
    const playImage = document.createElement('img')
    playImage.setAttribute('src', 'images/playback-green.png')
    playImage.setAttribute('data-index', i)
    playImage.setAttribute('id', `opfs-play-image-${i}`)
    playImage.classList.add('opfs-play-image')
    playImage.addEventListener('click', playRecording)
    fileDiv.appendChild(playImage)
    // Logo
    const logoImage = document.createElement('img')
    logoImage.setAttribute('src', 'images/gilbert.png')
    logoImage.classList.add('opfs-logo')
    fileDiv.appendChild(logoImage)
    // Text
    const sName = f.name.split('_')
    const date = `${sName[0].substring(8,10)}/${sName[0].substring(5,7)}/${sName[0].substring(0,4)}`
    const time = sName[1].replace(/-/g, ':')
    let location
    if (sName.length === 5) {
      // Name is in GR
      location = sName[2]
    } else {
      // Name is lat/lon format
      location = `${sName[2]}/${sName[3]}`
    }
    const textDiv = document.createElement('div')
    textDiv.classList.add('opfs-div-text')
    textDiv.innerHTML=`${date} ${time}<br/>${location}`
    fileDiv.appendChild(textDiv)
    // Select checkbox
    const check = document.createElement('input')
    check.setAttribute('type', 'checkbox')
    check.setAttribute('id', `opfs-checkbox-${i}`)
    check.classList.add('opfs-checkbox')
    fileDiv.appendChild(check)
    
    recordingDiv.appendChild(fileDiv)
  })
}

export async function deleteSelected(el) {
  flash(el.id)
  const n =  opfsFiles.reduce((a,f,i) => document.getElementById(`opfs-checkbox-${i}`).checked ? a+1 : a, 0)
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
    opfsFiles.forEach((f,i) => {
      if (document.getElementById(`opfs-checkbox-${i}`).checked) {
        names.push(f.name)
      }
    })
    await opfsDeleteFiles(names)
    initialiseDisplay()
  }
}

export async function shareSelected(el) {
  flash(el.id)
  const n =  opfsFiles.reduce((a,f,i) => document.getElementById(`opfs-checkbox-${i}`).checked ? a+1 : a, 0)
  if (n) {
    const files = []
    opfsFiles.forEach((f,i) => {
      if (document.getElementById(`opfs-checkbox-${i}`).checked) {
        files.push(f.file)
      }
    })
    navigator.share({files: files})
  }
}

export async function downloadSelected(el) {
  flash(el.id)
  const n =  opfsFiles.reduce((a,f,i) => document.getElementById(`opfs-checkbox-${i}`).checked ? a+1 : a, 0)
  if (n) {
    const files = []
    opfsFiles.forEach((f,i) => {
      if (document.getElementById(`opfs-checkbox-${i}`).checked) {
        downloadBlob(f.file, f.name)
      }
    })
  }
}

export function uncheckAll(el) {
  flash(el.id)
  const checkboxes = document.getElementsByClassName('opfs-checkbox')
  for(let i=0, n=checkboxes.length;i<n;i++) {
    checkboxes[i].checked = false
  }
}

export function checkAll(el) {
  flash(el.id)
  const checkboxes = document.getElementsByClassName('opfs-checkbox')
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

async function playRecording(e) {
  console.log('Playback', e.target.getAttribute('data-index'))

  const i = Number(e.target.getAttribute('data-index'))
  const playbackImage = document.getElementById(`opfs-play-image-${i}`)

  playbackImage.removeEventListener('click', playRecording)
  playbackImage.src = "images/playback-red.png"
  playbackImage.classList.add("flashing")
  playbackImage.addEventListener('click', stopPlayback)

  opfsFiles[i].playback = new Audio()
  await playBlob(opfsFiles[i].playback, opfsFiles[i].file, getOpt('playback-volume'))

  playbackImage.removeEventListener('click', stopPlayback)
  playbackImage.src = "images/playback-green.png"
  playbackImage.classList.remove("flashing")
  playbackImage.addEventListener('click', playRecording)
}

function stopPlayback(e) {

  const i = Number(e.target.getAttribute('data-index'))
  const playbackImage = document.getElementById(`opfs-play-image-${i}`)

  opfsFiles[i].playback.pause()
  opfsFiles[i].playback.currentTime = 0
  opfsFiles[i].playback = null

  playbackImage.removeEventListener('click', stopPlayback)
  playbackImage.src = "images/playback-green.png"
  playbackImage.classList.remove("flashing")
  playbackImage.addEventListener('click', playRecording)
}