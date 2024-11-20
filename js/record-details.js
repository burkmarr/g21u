import { getSv } from './common.js'

initialiseDisplay()
populateRecordFields()

function initialiseDisplay () {
  const container = document.getElementById('record-details')
  // Generate record fields
  generateRecordFields(container)
  // Save/cancel buttons
  const div = document.createElement('div')
  div.setAttribute('id', 'record-save-div')
  container.appendChild(div)
  const cancel = document.createElement('button')
  cancel.innerText = 'Cancel'
  div.appendChild(cancel)
  const save = document.createElement('button')
  save.innerText = 'Save'
  div.appendChild(save)
  // Populate record fields
  populateRecordFields()
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

function generateRecordFields(el) {

  let ctrl

  // Recorder name
  ctrl = createInputDiv(el, 'recorder-name')
  createInputLabel(ctrl, 'Recorder:')
  const recorderName = document.createElement('input')
  recorderName.setAttribute('id', 'recorder-name-input')
  recorderName.setAttribute('type', 'text')
  ctrl.appendChild(recorderName)

  // Determiner name
  ctrl = createInputDiv(el, 'determiner-name')
  createInputLabel(ctrl, 'Determiner:')
  const determinerName = document.createElement('input')
  determinerName.setAttribute('id', 'determiner-name-input')
  determinerName.setAttribute('type', 'text')
  ctrl.appendChild(determinerName)

  // Date
  ctrl = createInputDiv(el, 'record-date')
  createInputLabel(ctrl, 'Record date:')
  const recordDate = document.createElement('input')
  recordDate.setAttribute('id', 'record-date-input')
  recordDate.setAttribute('type', 'date')
  ctrl.appendChild(recordDate)

  // Time
  // TODO a time clear button
  ctrl = createInputDiv(el, 'record-time')
  createInputLabel(ctrl, 'Record time:')
  const recordTime = document.createElement('input')
  recordTime.setAttribute('id', 'record-time-input')
  recordTime.setAttribute('type', 'time')
  ctrl.appendChild(recordTime)

}

export function populateRecordFields() {
  const sf = JSON.parse(getSv('selectedFile'))
  console.log('Selected file', sf)
  if (sf) {
    // Recorder
    // TODO
    // Determiner
    // TODO
    // Date
    const dte = new Date()
    const day = sf.date.substring(0,2)
    const month = sf.date.substring(3,5)
    const year = sf.date.substring(6)
    document.getElementById('record-date-input').value = `${year}-${month}-${day}`
    // Time
    document.getElementById('record-time-input').value = sf.time.substring(0,5)
  }
}