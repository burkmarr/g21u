import { getSsJson, getFieldDefs } from './common.js'
import { getJsonFile, opfsSaveFile } from './file-handling.js'

const container = el('record-details')
generateRecordFields(el('record-details'))
populateRecordFields()

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

function generateRecordFields(parent) {

  // Generate the input fields
  getFieldDefs().forEach(f => {
    const ctrl = createInputDiv(parent, f.inputId.substring(0,f.inputId.length-6))
    createInputLabel(ctrl, `${f.inputLabel}:`)
    const recorderName = document.createElement('input')
    recorderName.setAttribute('id', f.inputId)
    recorderName.setAttribute('type', f.inputType)
    recorderName.addEventListener('input', highlightFields)
    ctrl.appendChild(recorderName)
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

async function cancelRecord() {
  await populateRecordFields()
}

async function saveRecord() {
  // Selected soundfile
  const sf = getSsJson('selectedFile')
  // Build JSON structure
  const json = {
    wav: getSsJson('selectedFile'),
  }
  getFieldDefs().forEach(f => {
    json[f.jsonId] =  el(f.inputId).value
  })

  // Save the file
  const jsonString = JSON.stringify(json)
  await opfsSaveFile(new Blob([jsonString], { type: "application/json" }),
    `${sf.filename.substring(0, sf.filename.length-4)}.json`)

  console.log(json)
  console.log('Save', `${sf.filename.substring(0, sf.filename.length-4)}.json`)

  highlightFields()
}

export async function populateRecordFields() {
  // Selected soundfile
  const sf = getSsJson('selectedFile')
  //console.log(sf)

  // Get corresponding record JSON if it exists
  const json = await getRecordJson()
  //console.log(json)

  getFieldDefs().forEach(f => {
    if (json) {
      el(f.inputId).value = json[f.jsonId]
    } else if (sf) {
      el(f.inputId).value = f.default
    } else {
      el(f.inputId).value = f.novalue
    }
  })

  highlightFields()

  // Disable all the input fields if no record selected
  if (sf) {
    el('record-details').classList.remove('disable') 
  } else {
    el('record-details').classList.add('disable') 
  }
}

async function highlightFields() {

  const sf = getSsJson('selectedFile')
  const json = await getRecordJson()
  let edited = false
  getFieldDefs().forEach(f => {
    const fld = el(f.inputId)
    fld.classList.remove('edited')
    fld.classList.remove('saved')
    if (sf) {
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

function el(id) {
  return document.getElementById(id)
}

async function getRecordJson() {
  // Selected soundfile
  const sf = getSsJson('selectedFile')
  // Get corresponding JSON file if it exists
  let json
  if (sf) {
    const jsonFile = `${sf.filename.substring(0, sf.filename.length-4)}.json`
    json = await getJsonFile(jsonFile)
  }
  return json
}