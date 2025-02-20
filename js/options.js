import { getOpt, setOpt, keyValuePairTable, generalMessage, el } from "./common.js"
import { getFieldDefs } from './fields.js'
import { idb } from './nl.min.js'
import { browseNativeFolder } from './file-handling.js'

export function initialiseGui() {

  // See page HTML for reason why help-link href attribute set from JS
  document.getElementById("help-link").setAttribute('href', '/help.html?page=intro')
  
  // Initialise GUI option values
  document.getElementById("emulate-v1").checked = getOpt('emulate-v1') === "true"
  document.getElementById("georef-format").value = getOpt('georef-format')
  document.getElementById("georef-precision").value = getOpt('georef-precision')
  document.getElementById("zip-downloads").checked = getOpt('zip-downloads') === "true"
  document.getElementById("reverse-record-sort").checked = getOpt('reverse-record-sort') === "true"
  document.getElementById("automatic-playback").checked = getOpt('automatic-playback') === "true"
  document.getElementById("playback-volume").value = getOpt('playback-volume')
  document.getElementById("beep-volume").value = getOpt('beep-volume')
  document.getElementById("file-handling").value = getOpt('file-handling')
  document.getElementById("default-recorder").value = getOpt('default-recorder')
  document.getElementById("default-determiner").value = getOpt('default-determiner')

  initFileHandlingOptions()
  //initMainNativeFolder()
  //initArchiveNativeFolder()
  initNativeFolder('main')
  initNativeFolder('csv')
  initNativeFolder('archive')
  initFieldOptions()
  storageMetrics()
}

function initFileHandlingOptions() {
  // Disable file system options that are not available on this device
  if (typeof window.showDirectoryPicker === 'undefined') {
    document.querySelector('#file-handling option[value=native').setAttribute('disabled', '')
  }
}

async function initNativeFolder(type) {
  if (getOpt('file-handling') === 'native') {
    document.getElementById(`${type}-browse-folder-button`).disabled = false
    let directoryHandle = await idb.get(`${type}-native-folder`)
    if (directoryHandle) {
      document.getElementById(`${type}-native-folder`).innerHTML = `Folder name: ${directoryHandle.name}`
    } else {
      document.getElementById(`${type}-native-folder`).innerHTML = `No folder selected`
    }
  } else {
    document.getElementById(`${type}-browse-folder-button`).disabled = true
    document.getElementById(`${type}-native-folder`).innerHTML = ''
  }
}

export function useMode() {
  setOpt('emulate-v1', document.getElementById("emulate-v1").checked)
}
export function georefFormat() {
  setOpt('georef-format', document.getElementById("georef-format").value)
}

export function georefPrecision() {
  setOpt('georef-precision', document.getElementById("georef-precision").value)
}

export function zipDownloads() {
  setOpt('zip-downloads', document.getElementById("zip-downloads").checked) 
}

export function reverseRecordSort() {
  setOpt('reverse-record-sort', document.getElementById("reverse-record-sort").checked) 
}

export function automaticPlayback() {
  setOpt('automatic-playback', document.getElementById("automatic-playback").checked)
}

export function playbackVolume() {
  setOpt('playback-volume', document.getElementById("playback-volume").value)
}

export function beepVolume() {
  setOpt('beep-volume', document.getElementById("beep-volume").value)
}

export function fileHandling() {
  setOpt('file-handling', document.getElementById("file-handling").value)
  // initMainNativeFolder()
  // initArchiveNativeFolder()
  initNativeFolder('main')
  initNativeFolder('csv')
  initNativeFolder('archive')
}

export function defaultRecorder() {
  setOpt('default-recorder', document.getElementById("default-recorder").value)
}

export function defaultDeterminer() {
  setOpt('default-determiner', document.getElementById("default-determiner").value)
}

function optionalFieldChanged() {
  let optFields = ''
  getFieldDefs({allfields: true}).forEach(f => {
    if (f.optional && el(`cb-${f.jsonId}`).checked) {
      if (optFields) {
        optFields = `${optFields} ${f.jsonId}`
      } else {
        optFields = f.jsonId
      }
    }
  })
  setOpt('optional-fields', optFields)
}

export async function setNativeFolder(type) {
  const handle = await browseNativeFolder()
  if (handle) {
    // Can only work with an object here so need to store in indexeddb rather than local storage
    await idb.set(`${type}-native-folder`, handle)
    document.getElementById(`${type}-native-folder`).innerHTML = `Folder name: ${handle.name}`
  } else {
    await idb.set(`${type}-native-folder`, null)
    document.getElementById(`${type}-native-folder`).innerHTML = `No folder selected`
  }
}

async function storageMetrics() {

  const perSupported = navigator.storage && navigator.storage.persist ? true : false
  const perGranted = perSupported && await navigator.storage.persisted()
  const {quota, usage, usageDetails} = await navigator.storage.estimate()
  //const detailsSupported = navigator.storage.estimate ? true : false 

  const rows = [
    {
      caption: 'Persistent storage available',
      value: perSupported ? 'Yes' : 'No'
    },
    {
      caption: 'Persistent storage granted',
      value: perGranted ? 'Yes' : 'No'
    },
    {
      caption: 'Total storage quota',
      value: formatBytes(quota)
    },
    {
      caption: 'Total app storage usage',
      value: formatBytes(usage)
    },
    {
      caption: 'App cache use',
      value: usageDetails ? formatBytes(usageDetails.caches) : 'Info not supported by this browser'
    },
    {
      caption: 'App file system use',
      value: usageDetails ? formatBytes(usageDetails.fileSystem) : 'Info not supported by this browser'
    },
    {
      caption: 'App service worker use',
      value: usageDetails ? formatBytes(usageDetails.serviceWorkerRegistrations) : 'Info not supported by this browser'
    }
  ]
  keyValuePairTable('storage-metrics-table', rows, document.getElementById('storage-metrics'))
}

function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

function initFieldOptions() {
  const optionalIncluded = getOpt('optional-fields').split(' ')

  getFieldDefs({allfields: true}).forEach(f => {
    const p = document.createElement('p')

    const iRecordText = f.iRecord ? ` Corresponds to the iRecord input field <i>${f.iRecord}</i>.` : 'This field is not imported by iRecord.'
    const iRecordTerm = f.iRecord && f.inputType.startsWith('term-') ? `
      You can choose a term from a list 
      of those accepted by iRecord, or you can enter a term of your
      own. (Don't enter your own term if planning to import to iRecord).` : ''
    const mandatory = f.optional ? '' : ' <b>This field must be included</b> - you cannot switch it off.'
    p.innerHTML = `
      <b>${f.inputLabel}</b>. ${f.info}${iRecordTerm}${iRecordText}${mandatory}
    `
    el('record-fields').appendChild(p)

    const br = document.createElement('br')
    p.appendChild(br)
    const toggleLabel = document.createElement('label')
    toggleLabel.classList.add('switch')
    const toggle = document.createElement('input')
    toggle.setAttribute('type', 'checkbox')
    toggle.setAttribute('id', `cb-${f.jsonId}`)
    if (f.optional) {
      if (optionalIncluded.includes(f.jsonId)) {
        toggle.setAttribute('checked', 'checked')
      }
    } else {
      toggle.setAttribute('checked', 'checked')
      toggle.setAttribute('disabled', 'true')
    }
    toggle.addEventListener('change', optionalFieldChanged)
    toggleLabel.appendChild(toggle)
    const toggleSpan = document.createElement('span')
    toggleSpan.classList.add('slider')
    toggleSpan.classList.add('round')
    toggleLabel.appendChild(toggleSpan)

    p.appendChild(toggleLabel)

  })
}