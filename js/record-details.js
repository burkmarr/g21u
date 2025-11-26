import { el, keyValuePairTable, detailsFromFilename, generalMessage,
  collapsibleDiv, unorderedList, setSs, getSs, getOpt, getOriginalFilename } from './common.js'
import { getFieldDefs, getTermList } from './fields.js'
import { hideTaxonMatches, displayTaxonMatches, taxonDetails } from './taxonomy.js'
import { initLocationDetails, invalidateSize, updateMap } from './mapping.js'
import { setRecordContent, initialiseList, moveSelected, getPreviousRecJson } from './record-list.js'
import { getRecordJson, storSaveFile, storFileExists, storGetFile, copyRecord, getCSV } from './file-handling.js'
import { playBlob } from './play.js'

let audioPlayer = new Audio()
let pendingEdits = false
let playbackPaused = false
let customInputCsv

export function editsPending() {
  return pendingEdits
}

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

export async function initRecordDetails() {
  await initRecordFields()
  initLocationDetails()
}

async function initRecordFields() {

  customInputCsv = await getCSV('custom-input.csv')
  const customTemplatesCsv = await getCSV('custom-templates.csv')

  console.log('Custom templates loaded:', customTemplatesCsv)

  const parent = el('record-details')

  parent.innerHTML = `<h3 id="record-details-title"></h3>
    <div id ="record-details-playback-div">
      <button id="record-details-playback-button"><img id="record-details-playback-image"></button>
      <button id="record-details-pause-button" disabled>Pause</button>
      <button id="record-duplicate">Duplicate</button>
      <select id="template-select">
        <option value="default">Biological record</option>
      </select>
    </div>
  `

  // Populate template select options
  if (customTemplatesCsv && customTemplatesCsv.length > 0) {
    const templateSelect = el('template-select')
    customTemplatesCsv.forEach(t => {
      const option = document.createElement('option')
      option.setAttribute('value', t.template.toLowerCase().replace(/\s+/g, '-'))
      option.innerText = t.template
      templateSelect.appendChild(option)
    })
    templateSelect.addEventListener('change', () => {
      //generalMessage(`Template changed to '${templateSelect.value}'. You can now edit the record fields as required.`)
      generateRecordFields(templateSelect.value)
      populateRecordFields()
    })
  } else {
    // Hide the template select control
    el('template-select').classList.add('hide')
  }

  // Set the value of the template-select control based on selected record
  const selectedFile = getSs('selectedFile')
  if (selectedFile) {
    const json = await getRecordJson(`${selectedFile}.txt`)
    if (json && json.metadata.template) {
      el('template-select').value = json.metadata.template
    }
  }   

  setSs('prevSelectedFile', null)
  playbackPaused = false
  el('record-details-pause-button').addEventListener('click', pauseResumePlayBack)
  el('record-duplicate').addEventListener('click', duplicateRecord)
  el('record-duplicate').addEventListener('keypress', e => {
    // Don't allow enter key on Duplicate button - it can
    // lead to record duplication by mistake
    if (e.key === 'Enter') {
      e.preventDefault()
    }
  })

  const recordFieldsDiv = document.createElement('div')
  recordFieldsDiv.setAttribute('id', 'record-field-controls')
  parent.appendChild(recordFieldsDiv)
  await generateRecordFields()

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

  // Handling form focus on tab/enter press
  el('record-details').addEventListener('keypress', async function (e) {
    //console.log('keypress target', e.target.id)
    if (e.code === 'Enter' && e.target.id === 'record-save-button') {
      // User has saved record - shift focus to next record button
      el('next-record').focus()
    } else if (e.code === 'Enter') {
      const fieldDefs = getFieldDefs()
      if (e.shiftKey) {
        // Copy value from previous record
        const previosRecJson = await getPreviousRecJson()
        const currentFld = fieldDefs.find(f => f.inputId === e.target.id)
        e.target.value = previosRecJson[currentFld.jsonId]
        checkEditStatus()
      }

      // If input field is grid ref or lat and the value is orig
      // then change the grid ref or lat/lon values to those originally recorded
      if (e.target.value === 'orig') {
        if (e.target.id === 'gridref-input' || e.target.id === 'lat-input') {
          const defsWithDefaults = getFieldDefs({filename: getSs('selectedFile')}) 
          if (e.target.id === 'gridref-input') {
            e.target.value = defsWithDefaults.find(d => d.inputId === 'gridref-input').default
          } else {
            e.target.value = defsWithDefaults.find(d => d.inputId === 'lat-input').default
            el('lon-input').value =  defsWithDefaults.find(d => d.inputId === 'lon-input').default
          }
          checkEditStatus()
        }
      }

      // Check if input matches any custom input codes 
      let customInputMade = false
      if (customInputCsv) {
        let customInput = customInputCsv.filter(c => `${c.colin}-input` === e.target.id && c.valin === e.target.value)
        // Set the specified fields to the specified values
        customInput.forEach(c => {
          const inputOut = el(`${c.colout}-input`)
          if (!inputOut) {
            console.log(`Field '${c.colout}' specified in custom-input.csv file does not exist.`)
          } else {
            el(`${c.colout}-input`).value = c.valout
            customInputMade = true
          }
        })
        checkEditStatus()
      }

      if (customInputMade) {
        // If a custom input was made, shift the focus to the location field
        el('location-input').focus()
      } else { 
        const currentInputIndex = fieldDefs.findIndex(f => f.inputId === e.target.id)
        let focussed = false
        for (let i = currentInputIndex+1; i<fieldDefs.length; i++) {
          const inputId = fieldDefs[i].inputId
          const value = el(inputId).value
          const edited = el(inputId).classList.contains('edited')
          // Focus on next empty, edited or 'not recorded' field
          if (value === '' || value.toLowerCase() === 'not recorded' || edited ) {
            el(inputId).focus()
            focussed = true
            if (value.toLowerCase() === 'not recorded') {
              el(inputId).select()
            }
            break
          } 
        }
        if (!focussed) {
          // No more fields to focus on
          // so move it to save button
          el('record-save-button').focus()
        }
      }
    }
  })
  el('record-details').addEventListener('keydown', function (e) {
    if (e.code === 'Tab' || e.code === 'ArrowDown' || e.code === 'ArrowUp') {
      // Tab or up/down arrow key pressed (Tab with shift means up, otherwise down)
      const down = e.code === 'Tab' && !e.shiftKey || e.code === 'ArrowDown'

      // Determine whether a term-suggestion list is displayed
      const suggestionLists = document.getElementsByClassName('term-suggestions')
      let suggestionList, availableOpts

      for (let i=0; i<suggestionLists.length; i++) {
        if (!suggestionLists[i].classList.contains('hide')) {
          suggestionList = suggestionLists[i]
          // Determine if any options currently displayed in list
          availableOpts = document.querySelectorAll(`#${suggestionList.id} li:not(.hide)`)
        }
      }
      
      if (suggestionList && availableOpts.length > 0) {
        e.preventDefault()
        e.stopPropagation()
        // Move focus to an element in list
        const listId = suggestionList.id
        const inputId = suggestionList.id.substring(0, suggestionList.id.length - 12) // remove '-suggestions' suffix
        if (e.target.id === inputId) {
          // Move focus to the first element in the list (regardless of key pressed)
          const first = document.querySelector(`#${listId} li:not(.hide)`)
          first.focus()
        } else {
          // Move focus to the next element in the list
          const availableOpts = document.querySelectorAll(`#${listId} li:not(.hide)`)
          let next
          for (let i=0; i<availableOpts.length-1; i++) {
            if (availableOpts[i].id === e.target.id) {
              if (down) {
                next = availableOpts[i+1]
              } else {
                next = availableOpts[i-1]
              }
              break
            }
          }
          if (next) {
            next.focus()
          } else {
            el(inputId).focus()
          }   
        }
      }
    }
  }, false)
}

export async function generateRecordFields(template) {
  const parent = el('record-field-controls')
  // Clear any existing fields
  parent.innerHTML = ''

  // Generate the input fields
  const fieldDefs = getFieldDefs({template: template ? template : el('template-select').value})

  //console.log ('Generating record fields for template:', template, fieldDefs)

  for (let i=0; i < fieldDefs.length; i++) {
    const f = fieldDefs[i]
    const ctrl = createInputDiv(parent, f.inputId.substring(0,f.inputId.length-6))
    createInputLabel(ctrl, `${f.inputLabel}:`)
    let input
    if (f.inputType === 'textarea') {
      input = document.createElement('textarea')
      input.addEventListener('keypress', e => {
        // Don't allow carriage returns in text area
        if (e.key === 'Enter') {
          e.preventDefault()
        }
      })
    } else {
      input = document.createElement('input')
      input.setAttribute('type', f.inputType)
    }
    input.setAttribute('id', f.inputId)
    input.addEventListener('input', checkEditStatus)
    input.addEventListener('focus', hideTermMatches)
    ctrl.appendChild(input)

    // Custom control modifications
    // Taxon
    if (f.inputType === 'taxon') {
      input.setAttribute('type', 'text')
      input.addEventListener('input', displayTaxonMatches)
      document.getElementsByTagName('body')[0].addEventListener('click', hideTaxonMatches)
  
      const ul =  document.createElement('div')
      ul.setAttribute('id', `${f.inputId}-suggestions`)
      ul.classList.add('term-suggestions')
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
    // Datalist isn't customisable, so we use our own control
    if (f.inputType.startsWith('term-')) {
      input.setAttribute('type', 'text')
      input.addEventListener('input', displayTermMatches)
      input.addEventListener('focus', displayTermMatches)
      document.getElementsByTagName('body')[0].addEventListener('click', hideTermMatches)
  
      const ul =  document.createElement('div')
      ul.setAttribute('id', `${f.inputId}-suggestions`)
      ul.classList.add('term-suggestions')
      ul.classList.add('hide')
      ctrl.appendChild(ul)

      const terms = await getTermList(f.inputType)
      terms.forEach((t,i) => {
        const li = document.createElement('li')
        li.setAttribute('id', `${f.inputId}-item-${i}`)
        li.setAttribute('tabindex', '-1') // In order to allow event handling
        li.addEventListener('click', (e) => {
          input.value = e.target.innerText
          input.focus()
        })
        li.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            input.value = e.target.innerText
            input.focus()
            hideTermMatches()
          }
        })
        li.innerText =  t
        ul.appendChild(li)
      })
    }
  }
}

function displayTermMatches(e) {
  // Display suggestion list
  el(`${e.target.id}-suggestions`).classList.remove('hide')
  // Filter list based on current value typed by user
  const opts = document.querySelectorAll(`#${e.target.id}-suggestions li`)
  for (let i = 0; i < opts.length; i++) {
    if (opts[i].innerText.toLowerCase() === e.target.value.toLowerCase()) {
      opts[i].classList.add('hide')
    } else if (opts[i].innerText.toLowerCase().includes(e.target.value.toLowerCase())) {
      opts[i].classList.remove('hide')
    } else {
      opts[i].classList.add('hide')
    }
  }
}

function hideTermMatches(e) {
  const suggestionDivs = document.getElementsByClassName('term-suggestions')
  for (let i = 0; i < suggestionDivs.length; i++) {
    suggestionDivs[i].classList.add('hide')
  }
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

  //const {quota, usage, usageDetails} = await navigator.storage.estimate()
  // console.log('quota', quota)
  // console.log('usage', usage)
  // console.log('usageDetails', usageDetails)
}

async function moveSelectedRec(e) {
  if (pendingEdits) {
    generalMessage("You have pending edits. Either save or cancel these before duplicating the record.")
    return
  }
  moveSelected(e.target.id === 'previous-record')
 //el('record-details-playback-button').focus()
}

async function cancelRecord() {
  await populateRecordFields()
}

async function saveRecord() {

  const selectedFile = getSs('selectedFile')

  const json = await getRecordJson(`${selectedFile}.txt`)
  //const template = json.metadata.template ? json.metadata.template : 'default'

  getFieldDefs({filename: selectedFile, template: el('template-select').value}).forEach(f => {
    json[f.jsonId] =  el(f.inputId).value
    el(f.inputId).setAttribute('data-value', el(f.inputId).value)
  })

  // If template other than default selected, add to metadata
  const templateSelect = el('template-select')
  if (templateSelect.value !== 'default') {
    json.metadata.template = templateSelect.value
  } else {
    delete json.metadata.template
  }

  // Save the file
  const jsonString = JSON.stringify(json)
  await storSaveFile(new Blob([jsonString], { type: "text/plain" }), `${selectedFile}.txt`)

  checkEditStatus()

  // Update the record text in case details changed
  setRecordContent(selectedFile, json)

  // Get taxon details in case taxon changes
  taxonDetails()

  // Map details
  updateMap()
}

export async function populateRecordFields() {
  // Selected file
  const selectedFile = getSs('selectedFile')
  const prevSelectedFile = getSs('prevSelectedFile')

  //console.log(prevSelectedFile, selectedFile)

  // Check if the selected file is using the same wav file as the previously
  // selected - which would happen if a duplicate record was created - and
  // if it is, don't change the WAV file. We want a paused recording to
  // carry on where it left off.
  const sameWav = getOriginalFilename(selectedFile) === getOriginalFilename(prevSelectedFile)

  if (!selectedFile) {
    el('record-details-title').innerHTML = 'Record details <span class="header-note">- no record selected</span>'
    el('record-details-playback-image').setAttribute('src', 'images/playback-grey.png')
  } else {
    el('record-details-title').innerHTML = 'Record details <span class="header-note">for selected record</span>'
    // Interrupt any current playing
    if (!sameWav) {
      audioPlayer.pause()
      audioPlayer.currentTime = 0
      const but = el('record-details-playback-button')
      const img = el('record-details-playback-image')
      const pause =  el('record-details-pause-button')
      but.removeEventListener('click', playRecordWav)
      but.removeEventListener('click', stopPlaybackWav)
      playbackPaused = false
      pause.innerText = 'Pause'
      pause.disabled = true
      // Set up listerners and playing image
      if (await storFileExists(`${selectedFile}.wav`)) {
        img.setAttribute('src', 'images/playback-green.png')
        but.addEventListener('click', playRecordWav)
      } else {
        img.setAttribute('src', 'images/playback-grey.png')
      }
    }
  }

  let json
  if (selectedFile) {
    //console.log(`${selectedFile}.txt`)
    // Get corresponding record JSON if it exists
    json = await getRecordJson(`${selectedFile}.txt`)
  }
  console.log("Template for populating record fields:", el('template-select').value)
  getFieldDefs({filename: selectedFile, template: el('template-select').value}).forEach(f => {
    if (json) {
      //console.log('Populating field', f.inputId, 'with value', json[f.jsonId])
      el(f.inputId).value = json[f.jsonId]
      el(f.inputId).setAttribute('data-value', json[f.jsonId])
    } else {
      el(f.inputId).value = f.novalue
      el(f.inputId).setAttribute('data-value', '')
    }
  })

  checkEditStatus()

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

  setSs('prevSelectedFile', selectedFile)
}

export async function setTemplate(template) {
  // Set the value of the template select control
  const selectedFile = getSs('selectedFile')
  const json = await getRecordJson(`${selectedFile}.txt`)

  const templateSelect = el('template-select')
  if (json && json.metadata.template) {
    // If templateSelect has an option for this template, select it
    if ([...templateSelect.options].some(option => option.value === json.metadata.template)) {
      templateSelect.value = json.metadata.template
    } else {
      templateSelect.value = 'default'
    }
  } else {
    templateSelect.value = 'default'
  }
}
export async function checkEditStatus() {
  // pendingEdits is a global that can be queried elsewhere
  pendingEdits = false
  getFieldDefs({template: el('template-select').value}).forEach(f => {
    //console.log ('Checking edit status for', f.inputId)
    const fld = el(f.inputId)
    fld.classList.remove('edited')
    fld.classList.remove('saved')
    if (fld.value === fld.getAttribute('data-value') ||
      (fld.value === '' && fld.getAttribute('data-value') === 'null')) {
      fld.classList.add('saved')
    } else {
      fld.classList.add('edited')
      pendingEdits = true
    }
  })
  if (pendingEdits) {
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
  const pause =  el('record-details-pause-button')

  playbackPaused = false
  pause.disabled = false
  pause.innerText = 'Pause'

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

  pause.disabled = true
}

function stopPlaybackWav(e) {

  e.stopPropagation()

  const but = el('record-details-playback-button')
  const img = el('record-details-playback-image')
  const pause =  el('record-details-pause-button')

  audioPlayer.pause()
  audioPlayer.currentTime = 0

  but.removeEventListener('click', stopPlaybackWav)
  img.src = "images/playback-green.png"
  img.classList.remove("flashing")
  but.addEventListener('click', playRecordWav)

  playbackPaused = false
  pause.innerText = 'Pause'
  pause.disabled = true
}

function pauseResumePlayBack() {
  const pause =  el('record-details-pause-button')
  if (playbackPaused) {
    playbackPaused = false
    pause.innerText = 'Pause'
    audioPlayer.play()
  } else {
    playbackPaused = true
    pause.innerText = 'Resume'
    audioPlayer.pause()
  }
}

export async function duplicateRecord(e) {

  //flash(e.target.id)

  const copyFromName = getSs('selectedFile')
  if (!copyFromName) {
    return
  }

  if (pendingEdits) {
    generalMessage("You have pending edits. Either save or cancel these before duplicating the record.")
    return
  }
  
  // Do the duplication
  let originalName = copyFromName
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
  await copyRecord(copyFromName, newName, e.shiftKey)
  setSs('selectedFile', newName)
  initialiseList()
  await populateRecordFields()
}