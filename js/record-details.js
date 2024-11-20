import { getSvJson, getOpt } from './common.js'
import { opfsGetFile, opfsSaveFile } from './file-handling.js'

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

  let ctrl

  // Recorder name
  ctrl = createInputDiv(parent, 'recorder-name')
  createInputLabel(ctrl, 'Recorder:')
  const recorderName = document.createElement('input')
  recorderName.setAttribute('id', 'recorder-name-input')
  recorderName.setAttribute('type', 'text')
  ctrl.appendChild(recorderName)

  // Determiner name
  ctrl = createInputDiv(parent, 'determiner-name')
  createInputLabel(ctrl, 'Determiner:')
  const determinerName = document.createElement('input')
  determinerName.setAttribute('id', 'determiner-name-input')
  determinerName.setAttribute('type', 'text')
  ctrl.appendChild(determinerName)

  // Date
  ctrl = createInputDiv(parent, 'record-date')
  createInputLabel(ctrl, 'Record date:')
  const recordDate = document.createElement('input')
  recordDate.setAttribute('id', 'record-date-input')
  recordDate.setAttribute('type', 'date')
  ctrl.appendChild(recordDate)

  // Time
  ctrl = createInputDiv(parent, 'record-time')
  createInputLabel(ctrl, 'Record time:')
  const recordTime = document.createElement('input')
  recordTime.setAttribute('id', 'record-time-input')
  recordTime.setAttribute('type', 'time')
  ctrl.appendChild(recordTime)

  // Save/cancel buttons
  ctrl = createInputDiv(parent, 'record-save-cancel')
  parent.appendChild(ctrl)
  const cancel = document.createElement('button')
  cancel.innerText = 'Cancel'
  ctrl.appendChild(cancel)
  const save = document.createElement('button')
  save.innerText = 'Save'
  save.addEventListener('click', saveRecord)
  ctrl.appendChild(save)
}

async function saveRecord() {
  // Selected soundfile
  const sf = getSvJson('selectedFile')
  // Build JSON structure
  const json = {
    wav: getSvJson('selectedFile'),
    recorder: el('recorder-name-input').value,
    determiner: el('determiner-name-input').value,
    date: el('record-date-input').value,
    time: el('record-time-input').value
  }
  // Save the file
  const jsonString = JSON.stringify(json)
  opfsSaveFile(new Blob([jsonString], { type: "application/json" }),
    `${sf.filename.substring(0, sf.filename.length-4)}.json`)
}

export async function populateRecordFields() {
  // Selected soundfile
  const sf = getSvJson('selectedFile')
  // Get corresponding JSON file if it exists
  let json
  if (sf) {
    const jsonFile = `${sf.filename.substring(0, sf.filename.length-4)}.json`
    const blob = await opfsGetFile(jsonFile)
    if (blob) {
      json = JSON.parse(await blob.text())
      console.log('read jsonFile', json)
    }
  }

  // Recorder
  if (json) {
    el('recorder-name-input').value = json.recorder
  } else if (sf) {
    el('recorder-name-input').value = getOpt('default-recorder')
  } else {
    el('recorder-name-input').value = ''
  }
  
  // Determiner
  if (json) {
    el('determiner-name-input').value = json.determiner
  } else if (sf) {
    el('determiner-name-input').value = getOpt('default-determiner')
  } else {
    el('determiner-name-input').value = ''
  }

  // Date
  if (json) {
    el('record-date-input').value = json.date
  } else if (sf) {
    const dte = new Date()
    const day = sf.date.substring(0,2)
    const month = sf.date.substring(3,5)
    const year = sf.date.substring(6)
    el('record-date-input').value = `${year}-${month}-${day}`
  } else {
    el('record-date-input').value = ''
  }

  // Time
  if (json) {
    el('record-time-input').value = json.time
  } else if (sf) {
    el('record-time-input').value = sf.time.substring(0,5)
  } else {
    el('record-time-input').value = '00:00'
  }

  // Disable all the input fields if no record selected
  if (sf) {
    el('record-details').classList.remove('disable') 
  } else {
    el('record-details').classList.add('disable') 
  }
}

function el(id) {
  return document.getElementById(id)
}