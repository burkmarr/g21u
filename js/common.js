import { getCent, getGr, idb } from './nl.min.js'

export const precisions = [
  {caption: '10 figure (1m)', value: 1, regexp: /^[a-zA-Z]{1,2}[0-9]{10}$/}, 
  {caption: '8 figure (10m)', value: 10,  regexp: /^[a-zA-Z]{1,2}[0-9]{8}$/},
  {caption: '6 figure (100m)', value: 100, regexp: /^[a-zA-Z]{1,2}[0-9]{6}$/},
  {caption: 'Monad (1km)', value: 1000, regexp: /^[a-zA-Z]{1,2}[0-9]{4}$/},
  {caption: 'Tetrad (2km)', value: 2000, regexp: /^[a-zA-Z]{1,2}[0-9]{2}[a-np-zA-NP-Z]$/},
  {caption: 'Quadrant (5km)', value: 5000, regexp: /^[a-zA-Z]{1,2}[0-9]{2}[SsNn][WwEe]$/},
  {caption: 'Hectad (10km)', value: 10000, regexp: /^[a-zA-Z]{1,2}[0-9]{2}$/}
]

export function flash(id) {
  document.getElementById(id).classList.add('flash')
}

export function generalMessage(msg) {
  if (!document.getElementById('general-message')) {
    // Create dialog
    const dialog = document.createElement('dialog')
    dialog.setAttribute('id', 'general-message')
    document.getElementsByTagName('body')[0].appendChild(dialog)
    // Create div element for message
    const message = document.createElement('div')
    message.setAttribute('id', 'general-message-text')
    dialog.appendChild(message)
    // Create div for okay button
    const buttonDiv = document.createElement('div')
    buttonDiv.classList.add('id', 'dialog-buttons')
    dialog.appendChild(buttonDiv)
    // Create form for okay button
    const form = document.createElement('form')
    form.setAttribute('method', 'dialog')
    buttonDiv.appendChild(form)
    // Create okay button
    const okay = document.createElement('button')
    form.appendChild(okay)
    okay.innerHTML = 'OK'
  }
  document.getElementById('general-message-text').innerHTML = msg
  document.getElementById('general-message').showModal()
}

export async function deleteConfirm({
  confirmMsgHtml = 'Continue with deletion?',
  confirmButText = 'Yes',
  cancelButText = 'No',
  archiveNotPossible = () => console.log('Archive not possible'),
  checkBoxClickFn = (e) => console.log('checkBoxClickFn', e.target.checked),
  confirmRejectFn = (e) => console.log(e.target.id, 'clicked'),
} = {}) {

  let dlg = el('delete-confirm-dialog')
  if (!dlg) {
    const bdy = document.getElementsByTagName('body')[0]
    dlg = document.createElement('dialog')
    bdy.appendChild(dlg)
  } 

  dlg.innerHTML = `
    <div id="archive-delete-selection">
      <p>
        You have specified an archive folder in the options. If you leave the <i>delete files</i>
        checkbox unchecked, files will be moved to the archive folder. If you would
        rather delete them, check the box.
      </p>
      <label>
        <input type="checkbox" id="delete-confirm-checkbox">
        Delete files
      </label>
    </div>
    <p id="delete-confirm-msg">${confirmMsgHtml}</p>
    <div class="dialog-buttons">
      <button id="delete-confirm">${confirmButText}</button>
      <button id="delete-reject">${cancelButText}</button>
    </div>
  `

  const dirArchiveHandle = await idb.get('archive-native-folder')
  const isArchivePossible = getOpt('file-handling') === 'native' && dirArchiveHandle !== null
  
  if (!isArchivePossible) {
    el('archive-delete-selection').classList.add('hide')
    el('delete-confirm-checkbox').setAttribute('checked', 'checked')
    archiveNotPossible()
  }

  dlg.setAttribute('id', 'delete-confirm-dialog')
  el('delete-confirm-checkbox').addEventListener('click', checkBoxClickFn)
  const removeDialog = () => dlg.close()
  el('delete-confirm').addEventListener('click', removeDialog)
  el('delete-reject').addEventListener('click', removeDialog)
  el('delete-confirm').addEventListener('click', confirmRejectFn)
  el('delete-reject').addEventListener('click', confirmRejectFn)

  dlg.showModal()
}

export function detailsFromFilename(filename) {
  if (!filename) return ''

  const withExtension = filename.endsWith('.txt') || filename.endsWith('.wav')
  const name = withExtension ? filename.substring(0,filename.length-4) : filename
  const sName = name.split('_')
  const date = `${sName[0].substring(8,10)}/${sName[0].substring(5,7)}/${sName[0].substring(0,4)}`
  const time = sName[1].replace(/-/g, ':')
  let accuracy, altitude, gridref, lat, lon, location
  if (sName[sName.length-1].startsWith('d')) {
    sName.pop()
  }
  if (sName.length === 5) {
    // Name is in GR
    gridref = sName[2]
    accuracy = sName[3]
    altitude = sName[4] === 'none' ? '' :  sName[4]
    location = gridref // For filename metadata
    // Get lat and lon
    const ll = getCent(gridref, 'wg')
    lat = String(Math.round(ll.centroid[1]*1000000)/1000000)
    lon = String(Math.round(ll.centroid[0]*1000000)/1000000)
  } else {
    // Name is lat/lon format
    lat = sName[2]
    lon = sName[3]
    location = `${lat}/${lon}` // For filename metadata
    accuracy = sName[4]
    altitude = sName[5] === 'none' ? '' :  sName[5]
    // Get gridref
    const gr = getGr(Number(lon), Number(lat), 'wg', '', [1])
    gridref = gr.p1
  }
  // If files have been duplidated, e.g. by multipled
  // shares to same folder in Windows they can have a
  // suffix to indicate the duplicate number, e.g.
  // '<filename> (1).txt'. So on split this gets
  // appended to the altitude. So remove if there.
  const sAltitude = altitude.split(' ')
  if (sAltitude.length > 1) {
    altitude = sAltitude[0]
  }

  console.log('return')
  return {
    filename: name,
    date: date,
    time: time,
    gridref: gridref,
    latitude: String(lat),
    longitude: String(lon),
    location: location,
    accuracy: accuracy,
    altitude: altitude
  }
}

export function dateFromString(dateString) {
  const dte = new Date()
  const day = dateString.substring(0,2)
  const month = dateString.substring(3,5)
  const year = dateString.substring(6)
  return `${year}-${month}-${day}`
}

export function getDateTime(formatted) {
  // If formatted not set to true, returns date of format
  // yyy-mm-dd_hh-mm-ss - which is required for filenames.
  // If set to true, returns a nicely formatted date & time.
  const dte = new Date()
  const year = dte.getFullYear()
  let month = String(dte.getMonth() + 1)
  let day = String(dte.getDate())
  let hour = String(dte.getHours())
  let minute = String(dte.getMinutes())
  let second = String(dte.getSeconds())
  month = month.length === 2 ? month : `0${month}`
  day = day.length === 2 ? day : `0${day}`
  hour = hour.length === 2 ? hour : `0${hour}`
  minute = minute.length === 2 ? minute : `0${minute}`
  second = second.length === 2 ? second : `0${second}`
  if (formatted) {
    return `${day}/${month}/${year} ${hour}:${minute}:${second}`
  } else {
    return `${year}-${month}-${day}_${hour}-${minute}-${second}`
  }
}

export function getOpt(id) {
  const defaultOpts = {
    'emulate-v1': 'false',
    'georef-format': 'osgr',
    'georef-precision': '10',
    'automatic-playback': 'false',
    'playback-volume': '0.5',
    'beep-volume': '0.5',
    'file-handling': 'opfs',
    'default-recorder': '',
    'default-determiner': '',
    'optional-fields': 'common-name stage comment',
  }
  return localStorage.getItem(id) ? localStorage.getItem(id) : defaultOpts[id]
}

export function setOpt(id, value) {
  localStorage.setItem(id, value)
}

export function setSs(id, value) {
  return sessionStorage.setItem(id, value)
}

export function getSs(id) {
  const defaults = {
    mainNav: 'navbot-link-record',
    'shown-edit-record': 'delete-selected',
    'shown-forward-record': 'share-selected',
    topNav: () => {
      if (window.matchMedia("(max-width: 1024px)").matches) {
        return 'edit-record'
      } else {
        return 'edit-taxa'
      }
    }
  }

  if (sessionStorage.getItem(id)) {
    return sessionStorage.getItem(id)
  } else if (typeof defaults[id] === 'function') {
    return defaults[id]()
  } else {
    return defaults[id]
  }
}

export function el(id) {
  return document.getElementById(id)
}

export function keyValuePairTable(id, rows, parent) {
  //console.log(rows)
  const table = document.createElement('table')
  table.setAttribute('id', id)
  table.classList.add('key-value-pair-table')
  parent.appendChild(table)
  rows.forEach(r => {
    const tr = document.createElement('tr')
    table.appendChild(tr)
    const td1 = document.createElement('td')
    td1.classList.add('caption')
    td1.innerHTML = `<b>${r.caption}</b>:`
    tr.appendChild(td1)
    const td2 = document.createElement('td')
    td2.classList.add('value')
    td2.innerHTML = r.value
    tr.appendChild(td2)
  })
}

export function unorderedList(id, rows, parent) {
  //console.log(rows)
  const ul = document.createElement('ul')
  ul.setAttribute('id', id)
  ul.classList.add('value-list')
  parent.appendChild(ul)
  rows.forEach(r => {
    const li = document.createElement('li')
    ul.appendChild(li)
    li.innerHTML = r
  })
}

export function collapsibleDiv(id, caption, parent) {
  const div = document.createElement('div')
  div.setAttribute('id', id)
  div.classList.add('collapsible')
  parent.appendChild(div)

  const toggleText = getSs(id) ? getSs(id) : 'show'
 
  div.innerHTML = `
    <div class='collapsible-caption'>
      <b>${caption}</b> <span class='collapsible-toggle'>[${toggleText}]</span>
    </div>
    <div class='collapsible-content ${toggleText === 'show' ? 'hide' : ''}'></div>
  `
  const toggle = document.querySelector(`#${id} .collapsible-toggle`)
  toggle.addEventListener('click', function(e){
    if (e.target.innerText === '[show]') {
      e.target.innerText = '[hide]'
      document.querySelector(`#${id} .collapsible-content`).classList.remove('hide')
      setSs(id, 'hide')
    } else {
      e.target.innerText = '[show]'
      document.querySelector(`#${id} .collapsible-content`).classList.add('hide')
      setSs(id, 'show')
    }
  })

  return document.querySelector(`#${id} .collapsible-content`)
}

export function grChangePrecision(gr, precision) {
  const fromPrecision = precisionFromGr(gr)
  const ll = getCent(gr, 'wg')
  const lat = ll.centroid[1]
  const lon = ll.centroid[0]
  if (precision <= fromPrecision) {
    // If the required precision is higher (smaller number)
    // than the current precision, just return current GR
    return gr
  } else {
    // Return lower precision GR
    const grs = getGr(lon, lat, 'wg', '', [precision])
    return grs[`p${precision}`]
  }
}

export function precisionFromGr(gr) {
  for (let i=0; i<precisions.length; i++) {
    const p = precisions[i]
    if (p.regexp.test(gr)) {
      return p.value
    }
  }
}