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
  const sf = getSvJson('selectedFile')
  // Build JSON structure
  const json = {
    wav: getSvJson('selectedFile'),
    // recorder: el('recorder-name-input').value,
    // determiner: el('determiner-name-input').value,
    // date: el('record-date-input').value,
    // time: el('record-time-input').value
  }

  getFieldDefs().forEach(f => {
    json[f.jsonId] =  el(f.inputId).value
  })

  // Save the file
  const jsonString = JSON.stringify(json)
  await opfsSaveFile(new Blob([jsonString], { type: "application/json" }),
    `${sf.filename.substring(0, sf.filename.length-4)}.json`)

  highlightFields()
}

export async function populateRecordFields() {
  // Selected soundfile
  const sf = getSvJson('selectedFile')
  // Get corresponding JSON file if it exists
  const json = await getFileJson()

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

function getFieldDefs() {
  const sf = getSvJson('selectedFile')

  return [
    {
      inputId: 'recorder-name-input',
      inputType: 'text',
      inputLabel: 'Recorder',
      jsonId: 'recorder',
      default: getOpt('default-recorder'),
      novalue: ''
    },
    {
      inputId: 'determiner-name-input',
      inputType: 'text',
      inputLabel: 'Determiner',
      jsonId: 'determiner',
      default: getOpt('default-determiner'),
      novalue: ''
    },
    {
      inputId: 'record-date-input',
      inputType: 'date',
      inputLabel: 'Record date',
      jsonId: 'date',
      default: dateFromSf(),
      novalue: ''
    },
    {
      inputId: 'record-time-input',
      inputType: 'time',
      inputLabel: 'Record type',
      jsonId: 'time',
      default: sf ? sf.time.substring(0,5) : '00:00',
      novalue: '00:00'
    },
    {
      inputId: 'taxon-input',
      inputType: 'text',
      inputLabel: 'Taxon',
      jsonId: 'taxon',
      default: '',
      novalue: ''
    }
  ]
}

async function highlightFields() {

  const sf = getSvJson('selectedFile')
  const json = await getFileJson()
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

async function getFileJson() {
  // Selected soundfile
  const sf = getSvJson('selectedFile')
  // Get corresponding JSON file if it exists
  let json
  if (sf) {
    const jsonFile = `${sf.filename.substring(0, sf.filename.length-4)}.json`
    const blob = await opfsGetFile(jsonFile)
    if (blob) {
      json = JSON.parse(await blob.text())
      //console.log('read jsonFile', json)
    }
  }
  return json
}

function dateFromSf() {
  const sf = getSvJson('selectedFile')
  if (sf) {
    const dte = new Date()
    const day = sf.date.substring(0,2)
    const month = sf.date.substring(3,5)
    const year = sf.date.substring(6)
    return `${year}-${month}-${day}`
  } else {
    return ''
  }
}