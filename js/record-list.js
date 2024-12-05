import { storGetRecs, storDeleteFiles, downloadFile, 
  fileExists, storGetFile, getRecordJson, shareRecs, recsToCsv
} from './file-handling.js'
import { getOpt, detailsFromFilename, getSs, setSs } from './common.js'
import { playBlob } from './play.js'
import { populateRecordFields } from './record-details.js'
import { download, share, csv } from './svg-icons.js'

let storRecs, audioPlayers = {}

export async function initialiseList() {

  storRecs = await storGetRecs()

  // If the currently selected file indicated by
  // session storage is no longer present, then
  // reset it.
  if (!storRecs.find(r => r.filename === getSs('selectedFile'))) {
    setSs('selectedFile', '')
  }

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
    // Metadata icons
    const iconDiv = document.createElement('div')
    iconDiv.setAttribute('id', `rec-icons-${name}`)
    iconDiv.classList.add('record-div-icons')
    fileDiv.appendChild(iconDiv)
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
    setRecordContent(name)
  }
}

export async function setRecordContent(filename) {
  
  let details

  // Text
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
  if (getOpt('emulate-v1') !== 'true') {
    html = buildText(html, `<i>${details['scientific-name']}</i>`, '<br/>')
  }
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

  // Metadata icons
  if (getOpt('emulate-v1') !== 'true') {
    const iconDiv = document.getElementById(`rec-icons-${filename}`)
    let icons = ''
    if (details.metadata.downloads.length) {
      icons = `<svg viewBox="${download.viewBox}">${download.svgEls}</svg>`
    }
    if (details.metadata.shares.length) {
      icons = `${icons}<svg viewBox="${share.viewBox}">${share.svgEls}</svg>`
    }
    if (details.metadata.csvs.length) {
      icons = `${icons}<svg viewBox="${csv.viewBox}">${csv.svgEls}</svg>`
    }
    iconDiv.innerHTML = icons
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

export async function manageMetadataChecked(e) {
  flash(e.target.id)
}

export async function deleteSound(e) {
  flash(e.target.id)
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
    const recs = []
    for (let i=0; i<storRecs.length; i++) {
      const name = storRecs[i].filename
      if (document.getElementById(`record-checkbox-${i}`).checked) { 
        recs.push(name)
      }
    }
    const share = await shareRecs(recs)
    if (share === 'success') {
      populateRecordFields()
    } else if (share.startsWith('error')) {
      if (!share.includes('AbortError')) {
        document.getElementById('share-problem-message').innerHTML = `<p>
          The share failed. The most likely reason is that you exceeded the 
          limit allowed. Try sharing fewer files.</p>
          <p style="font-size: 0.8em">(Reported error was: ${share})</p>.`
        document.getElementById('share-problem').showModal()
      }   
    } else {
      // Share not supported by browser
      document.getElementById('share-problem-message').innerHTML = `<p>
        This browser does not support the web share API. 
        Consider using a browser that does, e.g. Chrome.</p>
        <p style="font-size: 0.8em">(Reported browser is: ${navigator.userAgent})</p>.`
      document.getElementById('share-problem').showModal()
    }
  }
}

export async function downloadChecked(e) {
  //console.log('e', e)
  flash(e.target.id)
  const n =  storRecs.reduce((a,r,i) => document.getElementById(`record-checkbox-${i}`).checked ? a+1 : a, 0)
  if (n) {
    const promises = []
    for (let i=0; i<storRecs.length; i++) {
      const name = storRecs[i].filename
      if (document.getElementById(`record-checkbox-${i}`).checked) {
        // Download WAV if it exists
        if (await fileExists(`${name}.wav`)) {
          promises.push(downloadFile(`${name}.wav`))
        }
        // Download JSON (txt) if it exists and not emulating v1
        if (getOpt('emulate-v1') === 'false' && await fileExists(`${name}.txt`)) {
          promises.push(downloadFile(`${name}.txt`))
        }
      }
    }
    await Promise.all(promises)
    populateRecordFields()
  }
}

export async function csvChecked(e) {
  flash(e.target.id)
  const n =  storRecs.reduce((a,r,i) => document.getElementById(`record-checkbox-${i}`).checked ? a+1 : a, 0)
  if (n) {
    const recs = storRecs.filter((sr,i) => document.getElementById(`record-checkbox-${i}`).checked).map(sr => sr.filename)
    recsToCsv(recs)
  }
}

export function uncheckAllRecs(e) {
  flash(e.target.id)
  const checkboxes = document.getElementsByClassName('record-checkbox')
  for(let i=0, n=checkboxes.length;i<n;i++) {
    checkboxes[i].checked = false
  }
}

export function checkAllRecs(e) {
  flash(e.target.id)
  const checkboxes = document.getElementsByClassName('record-checkbox')
  for(let i=0, n=checkboxes.length;i<n;i++) {
    checkboxes[i].checked = true
  }
}

function flash(id) {
  document.getElementById(id).classList.add('flash')
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