import { el, getFieldDefs, keyValuePairTable, detailsFromFilename, collapsibleDiv, getSs } from './common.js'
import { hideTaxonMatches, displayTaxonMatches, taxonDetails } from './taxonomy.js'
import { setRecordText } from './record-list.js'
import { getRecordJson, storSaveFile } from './file-handling.js'


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

export function generateRecordFields() {

  const parent = el('record-details')
  parent.innerHTML = '<h3 id="record-details-title"></h3>'

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
      el('manage').addEventListener('click', hideTaxonMatches)
  
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
  })

  // Save/cancel buttons
  const ctrl = createInputDiv(parent, 'record-save-cancel')
  parent.appendChild(ctrl)
  const cancel = document.createElement('button')
  cancel.innerText = 'Cancel'
  cancel.addEventListener('click', cancelRecord)
  ctrl.appendChild(cancel)
  const save = document.createElement('button')
  save.innerText = 'Save'
  save.addEventListener('click', saveRecord)
  ctrl.appendChild(save)
}

export async function getMetadata() {

  // The default information to show for field details
  // is the original WAV file details.
  const selectedFile = getSs('selectedFile')

  if (selectedFile) {
    el('metadata-details').innerHTML = `<h3>Metadata <span class="header-note">(for selected record)</span></h3>`
  } else {
    el('metadata-details').innerHTML = `<h3>Metadata <span class="header-note">(no record selected)</span></h3>`
  }

  const para = document.createElement('p')
  para.innerHTML = `<i>For information only - these data are not explicitly stored with the record.</i>`
  el('metadata-details').appendChild(para)

  if (selectedFile) {
    const ordDiv = collapsibleDiv('original-recording-details', 'Original recording details', el('metadata-details'))
    const details = detailsFromFilename(selectedFile)
    const rows = []
    rows.push({caption: 'Filename', value: selectedFile})
    rows.push({caption: 'Date', value: details.date})
    rows.push({caption: 'Time', value: details.time})
    rows.push({caption: 'Loc', value: details.gridref})
    rows.push({caption: 'Accuracy', value: details.accuracy + ' m'})
    rows.push({caption: 'Altitude', value: details.altitude === '' ? 'not recorded' : details.altitude + ' m'})
    //keyValuePairTable('wav-details', rows, el('metadata-details'))
    keyValuePairTable('wav-details', rows, ordDiv)
  }

  const {quota, usage, usageDetails} = await navigator.storage.estimate()
  console.log('quota', quota)
  console.log('usage', usage)
  console.log('usageDetails', usageDetails)
}

async function cancelRecord() {
  await populateRecordFields()
}

async function saveRecord() {

  const selectedFile = getSs('selectedFile')

  const json = await getRecordJson(`${selectedFile}.txt`)
  //console.log(json)

  getFieldDefs(selectedFile).forEach(f => {
    json[f.jsonId] =  el(f.inputId).value
  })

  //console.log('new json', json)
  // Save the file
  const jsonString = JSON.stringify(json)
  await storSaveFile(new Blob([jsonString], { type: "text/plain" }), `${selectedFile}.txt`)
  highlightFields()

  // Update the record text in case details changed
  setRecordText(selectedFile)

  // Get taxon details in case taxon changes
  taxonDetails()
}

export async function populateRecordFields() {

  // Selected file
  const selectedFile = getSs('selectedFile')
  console.log('selectedFile', selectedFile)

  if (!selectedFile) {
    document.getElementById('record-details-title').innerHTML = 'Record details <span class="header-note">(no record selected)</span>'
  } else {
    document.getElementById('record-details-title').innerHTML = 'Record details <span class="header-note">(for selected record)</span>'
  }

  let json
  if (selectedFile) {
    //console.log(`${selectedFile}.txt`)
    // Get corresponding record JSON if it exists
    json = await getRecordJson(`${selectedFile}.txt`)
  }
  //console.log('json', json)

  getFieldDefs(selectedFile ? selectedFile : null).forEach(f => {
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

  // Disable all the input fields if no record selected
  if (selectedFile) {
    el('record-details').classList.remove('disable') 
  } else {
    el('record-details').classList.add('disable') 
  }
}

export async function highlightFields() {

  // Selected file
  const selectedFile = getSs('selectedFile')
  let json
  if (selectedFile) {
    // Get corresponding record JSON if it exists
    json = await getRecordJson(`${selectedFile}.txt`)
  }
  let edited = false
  getFieldDefs(selectedFile ? selectedFile : null).forEach(f => {
    const fld = el(f.inputId)
    fld.classList.remove('edited')
    fld.classList.remove('saved')
    if (selectedFile) {
      if (json) {
        if (fld.value === json[f.jsonId]) {
          fld.classList.add('saved')
        } else {
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

export function editNavigation(e) {
  const divId = `${getSs('topNav').substring(5)}-details`

  // Get all elements with class="details-div" and hide them
  const detailsDiv = document.getElementsByClassName("details-div")
  for (let i = 0; i < detailsDiv.length; i++) {
    detailsDiv[i].classList.add('hide')
  }
  // Show the current contents div
  document.getElementById(divId).classList.remove('hide')
}