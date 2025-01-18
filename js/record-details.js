import { el, keyValuePairTable, detailsFromFilename, 
  collapsibleDiv, unorderedList, setSs, getSs, getOpt, flash } from './common.js'
import { getFieldDefs, getTermList } from './fields.js'
import { hideTaxonMatches, displayTaxonMatches, taxonDetails } from './taxonomy.js'
import { initLocationDetails, invalidateSize, updateMap } from './mapping.js'
import { setRecordContent, initialiseList, moveSelected, getPreviousRecJson } from './record-list.js'
import { getRecordJson, storSaveFile, storFileExists, storGetFile, copyRecord } from './file-handling.js'
import { playBlob } from './play.js'

let audioPlayer = new Audio()

function createInputLabel(parent, label) {
  const ldiv = document.createElement('div')
  ldiv.innerHTML = label
  parent.appendChild(ldiv)
}

function createInputDiv(parent, id) {
  const div = document.createElement('div')
  div.setAttribute('id', id)
  div.classList.add('record-details-input')
  parent.appendChild(div)
  return div
}

export function initRecordDetails() {
  initRecordFields()
  initLocationDetails()
}

function initRecordFields() {

  const parent = el('record-details')

  parent.innerHTML = `<h3 id="record-details-title"></h3>
    <div id ="record-details-playback-div">
      <button id="record-details-playback-button"><img id="record-details-playback-image"></button>
      <button id="record-duplicate">Duplicate</button>
    </div>
  `
  
  el('record-duplicate').addEventListener('click', duplicateRecord)

  // Generate the input fields
  getFieldDefs().forEach(f => {
    const ctrl = createInputDiv(parent, f.inputId.substring(0,f.inputId.length-6))
    createInputLabel(ctrl, `${f.inputLabel}:`)
    let input
    if (f.inputType === 'textarea') {
      input = document.createElement('textarea')
    } else {
      input = document.createElement('input')
      input.setAttribute('type', f.inputType)
    }
    input.setAttribute('id', f.inputId)
    input.addEventListener('input', highlightFields)
    //input.addEventListener('focus', fieldFocus)
    ctrl.appendChild(input)

    // Custom control modifications
    // Taxon
    if (f.inputType === 'taxon') {
      input.setAttribute('type', 'text')
      input.addEventListener('input', displayTaxonMatches)
      //el('manage').addEventListener('click', hideTaxonMatches)
      document.getElementsByTagName('body')[0].addEventListener('click', hideTaxonMatches)
  
      const ul =  document.createElement('div')
      ul.setAttribute('id', `${f.inputId}-suggestions`)
      ul.classList.add('taxon-suggestions')
      ctrl.appendChild(ul)

      if (f.inputId === 'scientific-name-input') {
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            taxonDetails()
          }
        })
      }
    }
    // Term lists
    if (f.inputType.startsWith('term-')) {
      input.setAttribute('type', 'text')
      input.setAttribute('list', f.inputType)
      const datalist = document.createElement('datalist')
      datalist.setAttribute('id', f.inputType)
      getTermList(f.inputType).forEach(t => {
        const opt = document.createElement('option')
        opt.setAttribute('value', t)
        datalist.appendChild(opt)
      })
      ctrl.appendChild(datalist)
    }
  })

  // Save/cancel buttons
  const ctrl = createInputDiv(parent, 'record-save-cancel')
  parent.appendChild(ctrl)
  const previous = document.createElement('button')
  previous.setAttribute('id', 'previous-record')
  previous.innerText = 'Previous'
  previous.addEventListener('click', moveSelectedRec)
  ctrl.appendChild(previous)
  const next = document.createElement('button')
  next.setAttribute('id', 'next-record')
  next.innerText = 'Next'
  next.addEventListener('click', moveSelectedRec)
  ctrl.appendChild(next)
  const cancel = document.createElement('button')
  cancel.innerText = 'Cancel'
  cancel.addEventListener('click', cancelRecord)
  ctrl.appendChild(cancel)
  const save = document.createElement('button')
  save.setAttribute('id', 'record-save-button')
  save.innerText = 'Save'
  save.addEventListener('click', saveRecord)
  ctrl.appendChild(save)

  // Handling form focus on tab press
  document.addEventListener('keyup', async function (e) {
    if (e.code === 'Enter' && e.target.id === 'record-save-button') {
      // User has saved record shift focus to next record button
      el('next-record').focus()
    }
    if (e.code === 'Enter' && e.shiftKey) {
      // Copy value from previous record
      const previosRecJson = await getPreviousRecJson()
      const fieldDefs = getFieldDefs()
      const currentFld = fieldDefs.find(f => f.inputId === e.target.id)
      el(e.target.id).value = previosRecJson[currentFld.jsonId]
      highlightFields()
    } 
  })
  document.addEventListener('keydown', function (e) {
    if (e.code === 'Tab') {
      // Tab key pressed
      e.preventDefault()
      e.stopPropagation()

      const fieldDefs = getFieldDefs()
      const currentInputIndex = fieldDefs.findIndex(f => f.inputId === e.target.id)

      // Determine whether or not the scientifc or common names
      // selection list is displayed.
      const scientificListDisplayed = !el('scientific-name-input-suggestions').classList.contains('hide')
      const commonListDisplayed = !el('common-name-input-suggestions').classList.contains('hide')

      if (scientificListDisplayed || commonListDisplayed) {
        // Move focus to an element in a taxon selection list
        const listId = scientificListDisplayed ?'scientific-name-input-suggestions' : 'common-name-input-suggestions'
        if (e.target.classList.contains('taxon-list-item')) {
          // Move focus to the next element in the list
          const next = document.querySelector(`#${e.target.id} + .taxon-list-item`)
          next.focus()
        } else {
          // Move focus to the first element in the list
          const first = document.querySelector(`#${listId} .taxon-list-item`)
          first.focus()
        }
      } else {
        // Move focus to an input control
        let focussed = false
        for (let i = currentInputIndex+1; i<fieldDefs.length; i++) {
          const inputId = fieldDefs[i].inputId
          const value = el(inputId).value
          const edited = el(inputId).classList.contains('edited')
          if (e.shiftKey) {
            // If shift and tab pressed, then just go to next input control
            el(inputId).focus()
            focussed = true
            break
          } else {
            // If only tab pressed, do special behaviour
            if (value === '' || value.toLowerCase() === 'not recorded' || edited ) {
              el(inputId).focus()
              focussed = true
              if (value.toLowerCase() === 'not recorded') {
                el(inputId).select()
              }
              break
            } 
          }

          if (value === '' || value.toLowerCase() === 'not recorded' || edited ) {
            el(inputId).focus()
            focussed = true
            break
          }
        }

        if (!focussed) {
          // No more fields to focus on
          // shift to save button
          el('record-save-button').focus()
        }
      }
    }
  }, false)
}

export async function getMetadata() {

  // The default information to show for field details
  // is the original WAV file details.
  const selectedFile = getSs('selectedFile')

  if (selectedFile) {
    el('metadata-details').innerHTML = `<h3>Metadata <span class="header-note">for selected record</span></h3>`
  } else {
    el('metadata-details').innerHTML = `<h3>Metadata <span class="header-note">- no record selected</span></h3>`
  }

  const para = document.createElement('p')
  para.innerHTML = `<i>For information only - these data will not be exported to CSV.</i>`
  el('metadata-details').appendChild(para)

  if (selectedFile) {
    const json = await getRecordJson(`${selectedFile}.txt`)

    // Original recording details
    const ordDiv = collapsibleDiv('original-recording-details', 'Original recording details', el('metadata-details'))
    const details = detailsFromFilename(selectedFile)
    const ordRows = []
    ordRows.push({caption: 'Filename', value: selectedFile})
    ordRows.push({caption: 'Date', value: details.date})
    ordRows.push({caption: 'Time', value: details.time})
    ordRows.push({caption: 'Loc', value: details.location})
    ordRows.push({caption: 'Accuracy', value: details.accuracy + ' m'})
    ordRows.push({caption: 'Altitude', value: details.altitude === '' ? 'not recorded' : details.altitude + ' m'})
    keyValuePairTable('wav-details', ordRows, ordDiv)

    // Downloads
    const downDiv = collapsibleDiv('download-details', 'Downloaded on...', el('metadata-details'))
    if (json.metadata.downloads.length) {
      unorderedList('download-details-list', json.metadata.downloads, downDiv)
    } else {
      downDiv.innerHTML = "No downloads are recorded for this record."
    }

    // Shares
    const shareDiv = collapsibleDiv('share-details', 'Shared on...', el('metadata-details'))
    if (json.metadata.shares.length) {
      unorderedList('share-details-list', json.metadata.shares, shareDiv)
    } else {
      shareDiv.innerHTML = "No shares are recorded for this record."
    }
    
    // CSVs
    const csvDiv = collapsibleDiv('csv-details', 'Exported to CSV on...', el('metadata-details'))
    if (json.metadata.csvs.length) {
      unorderedList('csv-details-list', json.metadata.csvs, csvDiv)
    } else {
      csvDiv.innerHTML = "No exports to CSV are recorded for this record."
    }
  }

  const {quota, usage, usageDetails} = await navigator.storage.estimate()
  // console.log('quota', quota)
  // console.log('usage', usage)
  // console.log('usageDetails', usageDetails)
}

async function moveSelectedRec(e) {
  moveSelected(e.target.id === 'previous-record')
}

async function cancelRecord() {
  await populateRecordFields()
}

async function saveRecord() {

  const selectedFile = getSs('selectedFile')

  const json = await getRecordJson(`${selectedFile}.txt`)
  //console.log(json)

  getFieldDefs({filename: selectedFile}).forEach(f => {
    json[f.jsonId] =  el(f.inputId).value
  })

  //console.log('new json', json)
  // Save the file
  const jsonString = JSON.stringify(json)
  await storSaveFile(new Blob([jsonString], { type: "text/plain" }), `${selectedFile}.txt`)

  highlightFields()

  // Update the record text in case details changed
  setRecordContent(selectedFile)

  // Get taxon details in case taxon changes
  taxonDetails()

  // Map details
  updateMap()
}

export async function populateRecordFields() {
  // Selected file
  const selectedFile = getSs('selectedFile')
  //console.log('selectedFile', selectedFile)

  if (!selectedFile) {
    el('record-details-title').innerHTML = 'Record details <span class="header-note">- no record selected</span>'
    el('record-details-playback-image').setAttribute('src', 'images/playback-grey.png')
  } else {
    el('record-details-title').innerHTML = 'Record details <span class="header-note">for selected record</span>'
    // Interrupt any current playing
    audioPlayer.pause()
    audioPlayer.currentTime = 0
    const but = el('record-details-playback-button')
    const img = el('record-details-playback-image')
    but.removeEventListener('click', playRecordWav)
    but.removeEventListener('click', stopPlaybackWav)
    // Set up listerners and playing image
    if (await storFileExists(`${selectedFile}.wav`)) {
      img.setAttribute('src', 'images/playback-green.png')
      but.addEventListener('click', playRecordWav)
    } else {
      img.setAttribute('src', 'images/playback-grey.png')
    }
  }

  let json
  if (selectedFile) {
    //console.log(`${selectedFile}.txt`)
    // Get corresponding record JSON if it exists
    json = await getRecordJson(`${selectedFile}.txt`)
  }
  
  getFieldDefs({filename: selectedFile}).forEach(f => {
    if (json) {
      el(f.inputId).value = json[f.jsonId]
    // } else if (selectedFile) {
    //   el(f.inputId).value = f.default
    } else {
      el(f.inputId).value = f.novalue
    }
  })

  highlightFields()

  // Initialise the field details panel
  getMetadata()

  // Initialise the taxon details panel
  taxonDetails()

  // Map details
  updateMap()

  // Disable all the input fields if no record selected
  if (selectedFile) {
    el('record-details').classList.remove('disable') 
  } else {
    el('record-details').classList.add('disable') 
  }

  // Set initial focus to sound play button
  el('record-details-playback-button').focus()
}

export async function highlightFields() {

  // Selected file
  const selectedFile = getSs('selectedFile')
  let json
  if (selectedFile) {
    // Get corresponding record JSON if it exists
    json = await getRecordJson(`${selectedFile}.txt`)
    //console.log(json)
  }
  let edited = false
  getFieldDefs({filename: selectedFile}).forEach(f => {
    const fld = el(f.inputId)
    fld.classList.remove('edited')
    fld.classList.remove('saved')
    if (selectedFile) {
      if (json) {
        if (fld.value === json[f.jsonId]) {
          fld.classList.add('saved')
        } else {
          //console.log(f.jsonId, 'edited', json[f.jsonId], fld.value)
          fld.classList.add('edited')
          edited = true
        }
      } else if (fld.value !== f.default) {
        fld.classList.add('edited')
        edited = true
      }
    }
  })

  if (edited) {
    el('record-save-cancel').classList.add('edited')
  } else {
    el('record-save-cancel').classList.remove('edited')
  }
}

export function rightNavManage(e) {
  const divId = `${getSs('topNav').substring(5)}-details`

  // Get all elements with class="details-div" and hide them
  const detailsDiv = document.getElementsByClassName("details-div")
  for (let i = 0; i < detailsDiv.length; i++) {
    detailsDiv[i].classList.add('hide')
  }

  // Show the current contents div
  if (el(divId)) {
    el(divId).classList.remove('hide')
  } else {
    // Default
    el('record-details').classList.remove('hide')
    el('edit-record').parentElement.classList.add('selected-nav')
  }

  if (divId === 'location-details') {
    invalidateSize()
  }
}

async function playRecordWav(e) {
  e.stopPropagation()

  const but = el('record-details-playback-button')
  const img = el('record-details-playback-image')

  but.removeEventListener('click', playRecordWav)
  img.src = "images/playback-red.png"
  img.classList.add("flashing")
  but.addEventListener('click', stopPlaybackWav)

  audioPlayer = new Audio()
  const audioFile = await storGetFile(`${getSs('selectedFile')}.wav`)
  await playBlob(audioPlayer, audioFile, getOpt('playback-volume'))

  but.removeEventListener('click', stopPlaybackWav)
  img.src = "images/playback-green.png"
  img.classList.remove("flashing")
  but.addEventListener('click', playRecordWav)
}

function stopPlaybackWav(e) {

  e.stopPropagation()

  const but = el('record-details-playback-button')
  const img = el('record-details-playback-image')

  audioPlayer.pause()
  audioPlayer.currentTime = 0

  but.removeEventListener('click', stopPlaybackWav)
  img.src = "images/playback-green.png"
  img.classList.remove("flashing")
  but.addEventListener('click', playRecordWav)
}

export async function duplicateRecord(e) {

  flash(e.target.id)

  let originalName = getSs('selectedFile')
  if (!originalName) {
    return
  }
  const oSplit = originalName.split('_')
  if (oSplit[oSplit.length-1].startsWith('d')) {
    // The original record is a duplicate of another one - reset
    // the original name
    oSplit.pop()
    originalName = oSplit.join('_')
  }
  const ds = detailsFromFilename(originalName).date.split('/')
  const dateOriginal = new Date(ds[2], Number(ds[1])-1, ds[0])
  const dateNew = new Date()
  const millisecsDiff = dateNew.getTime() - dateOriginal.getTime()

  // Named after the original record with a suffix of number of deciseconds
  // difference between original record made and this duplication to guarantee
  // a unique filename.
  const newName = `${originalName}_d${Math.floor(millisecsDiff/100)}`
  await copyRecord(originalName, newName)
  setSs('selectedFile', newName)
  initialiseList()
  populateRecordFields()
}