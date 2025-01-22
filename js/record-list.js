import { storGetRecs, storDeleteFiles, storArchiveFiles, storSaveFile, downloadFile, 
  storFileExists, storGetFile, getRecordJson, shareRecs, recsToCsv, downloadBlob, storGetCsvs,
  mergeCsvs, storRenameFile
} from './file-handling.js'
import { getFieldDefs } from './fields.js'
import { el, getOpt, detailsFromFilename, getSs, setSs, generalMessage, deleteConfirm, flash, 
  createProgressBar, closeProgressBar, updateProgressBar, getDateTime } from './common.js'
import { playBlob } from './play.js'
import { populateRecordFields, editsPending } from './record-details.js'
import { download, share, csv } from './svg-icons.js'

let storRecs, audioPlayers = {}

export async function initialiseList() {

  // Get the currently checked items in order to re-check them
  const currentlyChecked = []
  if (storRecs) {
    for (let i=0; i<storRecs.length; i++) {
      if (el(`record-checkbox-${i}`).checked) {
        currentlyChecked.push(i)
      }
    }
  }
  // Now re-fetch storRecs
  storRecs = await storGetRecs()
  if (!storRecs.length) {
    el('record-list').innerHTML = `<h3>No records to display</h3><p>Make some!</p>`
    setSs('selectedFile', '')
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
      // If record does not have time, then use
      // file time instead.
      const aTime = a.time ? a.time : detailsFromFilename(a.filename).time
      const bTime = b.time ? b.time : detailsFromFilename(b.filename).time

      if (aTime > bTime) {
        comparison = -1
      } else if (aTime < bTime) {
        comparison = 1
      } 
    }
    const reverse = getOpt('reverse-record-sort') === 'true'
    if (comparison && reverse) comparison = -comparison
    return comparison
  })

  // If the currently selected file indicated by
  // session storage is no longer present, then
  // reset it to the first record with no taxon name
  if (!storRecs.find(r => r.filename === getSs('selectedFile'))) {
    const firstNotEdited = storRecs.find(r => !r['scientific-name'])
    console.log('firstNotEdited', firstNotEdited)
    if (firstNotEdited) {
      // Select the first record without scientific name set 
      setSs('selectedFile', firstNotEdited.filename)
    } else {
      // Otherwise set to the first record
      setSs('selectedFile', storRecs[0].filename)
    }
  }

  // Populate with files from storage
  el('record-list').innerHTML = ''

  let selectedFileDiv
  for (let i=0; i<storRecs.length; i++) {
    const name = storRecs[i].filename
    // Create div
    const fileDiv = document.createElement('div')
    fileDiv.setAttribute('id', `file-div-${i}`)
    fileDiv.setAttribute('data-file-name', name) 
    fileDiv.setAttribute('tabindex', '1') 
    fileDiv.classList.add('record-div')
    fileDiv.addEventListener('click', e => {
      if (editsPending()) {
        generalMessage("You have pending edits. Either save or cancel these before selecting another record.")
      } else {
        recordSelected(e.target)
      }
    })
    fileDiv.addEventListener('keypress', async function (e) {
      if (e.code === 'Enter') {
        el('record-details-playback-button').focus()
      }
    })
    fileDiv.addEventListener('keydown', async function (e) {
      if (e.code === 'Tab') {
        // Move selection to record after that currently selected
        e.preventDefault()
        if (editsPending()) {
          generalMessage("You have pending edits. Either save or cancel these before selecting another record.")
        } else {
          moveSelected(e.shiftKey)
        }
      }
    })
    if (name === getSs('selectedFile')) {
      fileDiv.classList.add('record-selected')
      selectedFileDiv = fileDiv
    }
    // Number for info
    const nDiv = document.createElement('div')
    nDiv.classList.add('record-n')
    nDiv.innerText = i+1
    fileDiv.appendChild(nDiv)

    // Play image
    const playImage = document.createElement('img')
    let img
    if (await storFileExists(`${name}.wav`)) {
      img = 'images/playback-green.png'
    } else {
      img = 'images/playback-grey.png'
    }
    playImage.setAttribute('src', img)
    playImage.setAttribute('data-index', i)
    playImage.setAttribute('id', `record-play-image-${i}`)
    playImage.classList.add('record-play-image')
    if (await storFileExists(`${name}.wav`)) {
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
    if (currentlyChecked.includes(i)) {
      check.setAttribute('checked', 'checked')
    }
    check.classList.add('record-checkbox')
    check.addEventListener('click', recordChecked)
    fileDiv.appendChild(check)

    el('record-list').appendChild(fileDiv)

    // If I set the text immediately after fileDiv.appendChild(textDiv)
    // it fails (for v1) because element appears not yet created,
    // so doing it here at end which seems to work.
    setRecordContent(storRecs[i])
  }
  selectedFileDiv.focus()
}

export async function setRecordContent(rec) {
  
  let details

  // Text
  if (getOpt('emulate-v1') === 'true') {
    // Base text on the filename
    details = detailsFromFilename(rec.filename)
  } else {
    // Base text on the JSON file values
    details = rec
  }
  let html = details.date
  if (details.time) {
    html = buildText(html, `<span class="rec-time">${details.time.substring(0, 5)}</span>`, ' ')
  } else {
    // Time might not be present on record (not v1 emulation)
    // In which case get it from the filename
    html = buildText(html, `<span class="rec-time">${detailsFromFilename(details.filename).time.substring(0, 5)}</span>`, ' ')
  }
  if (getOpt('georef-format') === 'osgr') {
    html = buildText(html, details.gridref, '<br/>')
  } else {
    html = buildText(html, `${details.longitude}/${details.latitude}`, '<br/>')
  }
  if (getOpt('emulate-v1') !== 'true') {
    html = buildText(html, `<i>${details['scientific-name']}</i>`, '<br/>')
  }
  el(`rec-text-${rec.filename}`).innerHTML = html

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
    const iconDiv = el(`rec-icons-${rec.filename}`)
    let icons = ''
    if (details.metadata.downloads.length) {
      icons = `<svg viewBox="${download.viewBox}">${download.svgEls}</svg>`
    }
    if (details.metadata.shares.length) {
      icons = `${icons}<svg viewBox="${share.viewBox}">${share.svgEls}</svg>`
    }
    if (details.metadata.csvs.length) {
      icons = `${icons}<svg style="position: relative; left: 2px" viewBox="${csv.viewBox}">${csv.svgEls}</svg>`
    }
    iconDiv.innerHTML = icons
  }
}

export async function deleteChecked(e) {
  flash(e.target.id)
  const n =  storRecs.reduce((a,r,i) => el(`record-checkbox-${i}`).checked ? a+1 : a, 0)
  if (n) {
    deleteConfirm({
      confirmButText: 'Yes',
      cancelButText: 'No',
      confirmMsgHtml: `Are you sure that you want to <i><span id="delete-archive-records">archive</span></i> the files for ${n} record${n>1 ? 's' : ''}?`,
      archiveNotPossible: () => {
        el('delete-archive-records').innerText = 'delete'
      },
      checkBoxClickFn: (e) => {
        el('delete-archive-records').innerText = e.target.checked ? 'delete' : 'archive'
      },
      confirmRejectFn: async (e) => {
        if (e.target.getAttribute('id') === 'delete-confirm') {
          const files = []
          for (let i=0; i<storRecs.length; i++) {
            const name = storRecs[i].filename
            if (el(`record-checkbox-${i}`).checked) {
              if (await storFileExists(`${name}.wav`)) {
                files.push(`${name}.wav`)
              }
              if (await storFileExists(`${name}.txt`)) {
                files.push(`${name}.txt`)
              }
              // Uncheck all checkboxes when deleting otherwise wrong items reselected.
              el(`record-checkbox-${i}`).checked = false
            }
          }
          //console.log('delete', files)
          if (el('delete-confirm-checkbox').checked) {
            await storDeleteFiles(files)
          } else {
            await storArchiveFiles(files)
          }
          
          await initialiseList()
          populateRecordFields()
        }
      },
    })
  }
}

export async function manageMetadataChecked(e) {
  flash(e.target.id)
  // Reset radio buttons
  document.querySelector('[name=radio-download][value=none]').checked = true;
  document.querySelector('[name=radio-share][value=none]').checked = true;
  document.querySelector('[name=radio-csv][value=none]').checked = true;
  // Show modal if at least one record checked
  let checked = false
  for (let i=0; i<storRecs.length; i++) {
    checked = el(`record-checkbox-${i}`).checked ? true : checked
  }
  if (checked) {
    el('metadata-dialog').showModal()
  }
}

export async function metadataRemoveYesNo(e) {
  el('metadata-dialog').close()
  if (e.target.getAttribute('id') === 'metadata-remove-confirm') {
    const radsDownload = document.getElementsByName('radio-download')
    const radsShare = document.getElementsByName('radio-share')
    const radsCsv = document.getElementsByName('radio-csv')
    let valDownload, valShare, valCsv
    for(let i=0; i<3; i++) {
      if (radsDownload[i].checked) {
        valDownload = radsDownload[i].value
      }
      if (radsShare[i].checked) {
        valShare = radsShare[i].value
      }
      if (radsCsv[i].checked) {
        valCsv = radsCsv[i].value
      }
    }

    if (valDownload !== 'none' || valShare !== 'none' || valCsv !== 'none') {
      createProgressBar(storRecs.length, "Updating record metadata...")
      for (let i=0; i<storRecs.length; i++) {
        updateProgressBar(i+1)
        const name = storRecs[i].filename
        if (el(`record-checkbox-${i}`).checked) {
          if (await storFileExists(`${name}.txt`)) {
            const json = await getRecordJson(`${name}.txt`)
            if (valDownload === 'all') {
              json.metadata.downloads = []
            } else if (valDownload === 'last') {
              json.metadata.downloads.pop()
            }
            if (valShare === 'all') {
              json.metadata.shares = []
            } else if (valShare === 'last') {
              json.metadata.shares.pop()
            }
            if (valCsv === 'all') {
              json.metadata.csvs = []
            } else if (valCsv === 'last') {
              json.metadata.csvs.pop()
            }
            const jsonString = JSON.stringify(json)
            await storSaveFile(new Blob([jsonString], { type: "text/plain" }), `${name}.txt`)
          }   
        }
      }
      closeProgressBar()
    }
  }
  await initialiseList()
  populateRecordFields()
}

export async function deleteSoundChecked(e) {
  flash(e.target.id)
  const n =  storRecs.reduce((a,r,i) => el(`record-checkbox-${i}`).checked ? a+1 : a, 0)
  if (n) {
    deleteConfirm({
      confirmButText: 'Yes',
      cancelButText: 'No',
      confirmMsgHtml: `Are you sure that you want to <i><span id="delete-archive-sounds">archive</span></i> the sound files for ${n} record${n>1 ? 's' : ''}?`,
      archiveNotPossible: () => {
        el('delete-archive-sounds').innerText = 'delete'
      },
      checkBoxClickFn: (e) => {
        el('delete-archive-sounds').innerText = e.target.checked ? 'delete' : 'archive'
      },
      confirmRejectFn: async (e) => {
        if (e.target.getAttribute('id') === 'delete-confirm') {
          const files = []
          for (let i=0; i<storRecs.length; i++) {
            const name = storRecs[i].filename
            if (el(`record-checkbox-${i}`).checked) {
              if (await storFileExists(`${name}.wav`)) {
                files.push(`${name}.wav`)
              }
            }
          }
          if (el('delete-confirm-checkbox').checked) {
            await storDeleteFiles(files)
          } else {
            await storArchiveFiles(files)
          }
          await initialiseList()
          populateRecordFields()
        }
      },
    })
  }
}

export function copyValuesChecked(e) {
  flash(e.target.id)
  el("copy-field-selected-record").innerHTML =  document.querySelector(".record-selected .record-div-text").innerHTML
  const parent = el("copy-field-dialog-checkboxes")
  parent.innerHTML = ''
  getFieldDefs().forEach(f => {
    const cb = document.createElement('input')
    cb.setAttribute('type', 'checkbox')
    cb.setAttribute('data-jsonid', f.jsonId)
    cb.classList.add('copy-field-checkbox')
    parent.appendChild(cb)

    const span = document.createElement('span')
    span.innerText = f.inputLabel
    parent.appendChild(span)
  })
  const dialog = el("copy-fields-dialog")
  dialog.showModal()
}

export async function copyValuesConfirmCancel(e) {

  const dialog = el("copy-fields-dialog")
  dialog.close()

  if (e.target.getAttribute('id') === 'copy-confirm') {
    // Get json of the currently selected record
    let jsonSelected
    const selectedFile = getSs('selectedFile')
    if (selectedFile) {
      // Get corresponding record JSON if it exists
      jsonSelected = await getRecordJson(`${selectedFile}.txt`)
    }

    // Get the checkboxes from dialog
    const cbs = document.getElementsByClassName('copy-field-checkbox')

    // Loop through all records
    createProgressBar(storRecs.length, 'Copying data from selected record to checked records...')
    for (let i=0; i<storRecs.length; i++) {
      updateProgressBar(i+1)
      const name = storRecs[i].filename
      if (el(`record-checkbox-${i}`).checked) {
        // Record needs to be updated for checked fields from
        // selected record.
        if (await storFileExists(`${name}.txt`)) {
          const jsonChecked = await getRecordJson(`${name}.txt`)
          // Loop through all dialog checkboxes
          for (let i=0; i<cbs.length; i++) {
            const cb = cbs[i]
            if (cb.checked) {
              // If field checked, update field of checked record with
              // the value of the field from the selected record.
              const jsonId = cb.getAttribute('data-jsonid')
              jsonChecked[jsonId] = jsonSelected[jsonId]
            }
          }
          // Update record
          const jsonString = JSON.stringify(jsonChecked)
          await storSaveFile(new Blob([jsonString], { type: "text/plain" }), `${name}.txt`)
        }   
      }
    }
    closeProgressBar()
    initialiseList()
  }
}

export async function shareChecked(e) {
  flash(e.target.id)

  const n =  storRecs.reduce((a,r,i) => el(`record-checkbox-${i}`).checked ? a+1 : a, 0)
  if (n) {
    const recs = []
    for (let i=0; i<storRecs.length; i++) {
      const name = storRecs[i].filename
      if (el(`record-checkbox-${i}`).checked) { 
        recs.push(name)
      }
    }
    const share = await shareRecs(recs)
    if (share === 'success') {
      await initialiseList()
      populateRecordFields()
    } else if (share.startsWith('error')) {
      if (!share.includes('AbortError')) {
        // For browsers that can detect when user aborts share
        generalMessage(`
          <p>The share failed. The most likely reason is that you exceeded the 
          number of files that can be shared at once by your browser. 
          Try sharing in smaller batches.</p>
          <p style="font-size: 0.8em">(Reported error was: ${share})</p>.
        `)
      }   
    } else {
      // Share not supported by browser
      generalMessage(`
        <p>This browser does not support the web share API. 
        Consider using a browser that does, e.g. Chrome.</p>
        <p style="font-size: 0.8em">(Reported browser is: ${navigator.userAgent})</p>.
      `)
    }
  }
}

export async function downloadChecked(e) {
  flash(e.target.id)
  const zipit = getOpt('zip-downloads') === "true"
  const n =  storRecs.reduce((a,r,i) => el(`record-checkbox-${i}`).checked ? a+1 : a, 0)
  if (n) {
    const promises = []
    const zip = new JSZip() // Library included in HTML script tag
    if (zipit) createProgressBar(storRecs.length, "Zipping record files for download...")
    for (let i=0; i<storRecs.length; i++) {
      if (zipit) updateProgressBar(i+1)
      const name = storRecs[i].filename
      if (el(`record-checkbox-${i}`).checked) {
        // Download WAV if it exists
        if (await storFileExists(`${name}.wav`)) {
          if (zipit) {
            const wav = await storGetFile(`${name}.wav`)
            zip.file(`${name}.wav`, wav, {binary: true})
          } else {
            promises.push(downloadFile(`${name}.wav`))
          }
        }
        // Download JSON (txt) if it exists and not emulating v1
        if (getOpt('emulate-v1') === 'false' && await storFileExists(`${name}.txt`)) {
          if (zipit) {
            const txt = await storGetFile(`${name}.txt`)
            zip.file(`${name}.txt`, txt, {binary: true})
          } else {
            promises.push(downloadFile(`${name}.txt`))
          }
          // Update metadata
          const json = await getRecordJson(`${name}.txt`)
          json.metadata.downloads.push(getDateTime(true))
          // Write the file
          const jsonString = JSON.stringify(json)
          await storSaveFile(new Blob([jsonString], { type: "text/plain" }), `${name}.txt`)
        }
      }
    }

    if (zipit) {
      const unformattedDateTime = getDateTime()
      const blobZip = await zip.generateAsync({type:"blob"})
      const file = new File([blobZip], `g21-recs-${unformattedDateTime}.zip`, {
        type: blobZip.type,
        lastModified: new Date().getTime()
      })
      downloadBlob(blobZip, `g21-recs-${unformattedDateTime}.zip`)
      closeProgressBar
    } else {
      await Promise.all(promises)
    }

    await initialiseList()
    populateRecordFields()
  }
}

export async function csvCheckedOld(e) {
  flash(e.target.id)
  const n =  storRecs.reduce((a,r,i) => el(`record-checkbox-${i}`).checked ? a+1 : a, 0)
  if (n) {
    const recs = storRecs.filter((sr,i) => el(`record-checkbox-${i}`).checked).map(sr => sr.filename)
    await recsToCsv(recs)
    await initialiseList()
  }
}

export async function csvChecked(e) {
  flash(e.target.id)
  const n =  storRecs.reduce((a,r,i) => el(`record-checkbox-${i}`).checked ? a+1 : a, 0)
  if (n) {
    const storCsvs = await storGetCsvs()
    console.log(storCsvs)
    if (storCsvs.length) {
      const select = el('csv-dialog-destination')
      select.innerHTML = ''

      const optNew = document.createElement('option')
      optNew.setAttribute('value', 'new')
      optNew.innerHTML = 'Create new CSV'
      select.appendChild(optNew)

      storCsvs.forEach(csv => {
        const optCSV = document.createElement('option')
        optCSV.setAttribute('value', csv.name)
        optCSV.innerHTML = csv.name
        select.appendChild(optCSV)
      })
      el('csv-dialog').showModal()
    } else {
      await recsToCsv(recs)
      await initialiseList()
    }
  }
}

export async function csvConfirmCancel(e) {
  const dialog = el("csv-dialog")
  dialog.close()
  if (e.target.getAttribute('id') === 'csv-confirm') {
    const recs = storRecs.filter((sr,i) => el(`record-checkbox-${i}`).checked).map(sr => sr.filename)
    const destination = el('csv-dialog-destination').value
    const newCsv = await recsToCsv(recs)
    if (destination !== 'new') {
      const tmpMerge = `g21-recs-${getDateTime()}-tmp.csv`
      await mergeCsvs([newCsv, destination], tmpMerge)
      await storDeleteFiles([newCsv, destination])
      storRenameFile(tmpMerge, destination)
    }
    await initialiseList()
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

function recordChecked(e) {
  e.stopPropagation()
}

async function recordSelected(target) {
  const currentSelected = document.getElementsByClassName("record-selected")[0]
  if(currentSelected.getAttribute('data-file-name') !== target.getAttribute('data-file-name')) {
    currentSelected.classList.remove("record-selected")
    target.classList.add("record-selected")
    target.focus()
    setSs( 'selectedFile', target.getAttribute('data-file-name'))
    populateRecordFields()
  }
}

async function playRecording(e) {
  //console.log('Playback', e.target.getAttribute('data-index'))

  e.stopPropagation()

  const i = Number(e.target.getAttribute('data-index'))
  const playbackImage = el(`record-play-image-${i}`)

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
  const playbackImage = el(`record-play-image-${i}`)

  audioPlayers[i].pause()
  audioPlayers[i].currentTime = 0
  audioPlayers[i] = null

  playbackImage.removeEventListener('click', stopPlayback)
  playbackImage.src = "images/playback-green.png"
  playbackImage.classList.remove("flashing")
  playbackImage.addEventListener('click', playRecording)
}

export async function moveSelected(backward) {
  const currentSelected = document.getElementsByClassName("record-selected")[0]
  const iCurrent = Number(currentSelected.id.substring(9))
  const nextSelected = el(`file-div-${backward ? iCurrent-1 : iCurrent+1}`)
  if (nextSelected) {
    recordSelected(nextSelected)
  }
}

export function deleteConfirmCheckboxInit () {
 
  console.log(e.target.checked)
  el('delete-archive-records').innerText = e.target.checked ? 'delete' : 'archive'
}

export function deleteConfirmCheckboxChanged (e) {
 
  console.log(e.target.checked)
  el('delete-archive-records').innerText = e.target.checked ? 'delete' : 'archive'
}

export async function getPreviousRecJson() {
  let iCurrent
  for (let i=0; i<storRecs.length; i++) {
    if (storRecs[i].filename ===  getSs('selectedFile')) {
      iCurrent = i
      break
    }
  }
  if (iCurrent) {
    const previousJson =  await getRecordJson(`${storRecs[iCurrent-1].filename}.txt`)
    return previousJson
  } else {
    return null
  }
}