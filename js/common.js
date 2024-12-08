import { getCent, getGr } from './nl.min.js'

export function detailsFromFilename(filename) {
  if (!filename) return ''
  const name = filename.indexOf('.') > -1 ? filename.substring(0,filename.length-4) : filename
  const sName = name.split('_')
  const date = `${sName[0].substring(8,10)}/${sName[0].substring(5,7)}/${sName[0].substring(0,4)}`
  const time = sName[1].replace(/-/g, ':')
  let accuracy, altitude, gridref, lat, lon, location
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

export function getFieldDefs(filename) {
  // Filename can be null - only affects default values
  // for some fields.
  const filenameDetails = filename ? detailsFromFilename(filename) : null

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
      default: filenameDetails ? dateFromString(filenameDetails.date) : '',
      novalue: ''
    },
    {
      inputId: 'record-time-input',
      inputType: 'time',
      inputLabel: 'Record time',
      jsonId: 'time',
      default: filenameDetails ? filenameDetails.time.substring(0,5) : '00:00',
      novalue: '00:00'
    },
    {
      inputId: 'scientific-name-input',
      inputType: 'taxon',
      inputLabel: 'Scientific name',
      jsonId: 'scientific-name',
      default: '',
      novalue: '',
    },
    {
      inputId: 'common-name-input',
      inputType: 'taxon',
      inputLabel: 'Common name',
      jsonId: 'common-name',
      default: '',
      novalue: '',

    },
    {
      inputId: 'gridref-input',
      inputType: 'text',
      inputLabel: 'Grid reference',
      jsonId: 'gridref',
      default: filenameDetails ? filenameDetails.gridref : '',
      novalue: ''
    },
    {
      inputId: 'lat-input',
      inputType: 'text',
      inputLabel: 'Latitude',
      jsonId: 'latitude',
      default: filenameDetails ? filenameDetails.latitude : '',
      novalue: ''
    },
    {
      inputId: 'lon-input',
      inputType: 'text',
      inputLabel: 'Longitude',
      jsonId: 'longitude',
      default: filenameDetails ? filenameDetails.longitude : '',
      novalue: ''
    },
    {
      inputId: 'location-input',
      inputType: 'text',
      inputLabel: 'Location name',
      jsonId: 'location',
      default: '',
      novalue: ''
    },
    {
      inputId: 'comment-input',
      inputType: 'textarea',
      inputLabel: 'Comment',
      jsonId: 'comment',
      default: '',
      novalue: ''
    },
  ]
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
    'filename-format': 'osgr',
    'automatic-playback': 'false',
    'playback-volume': '0.5',
    'beep-volume': '0.5',
    'file-handling': 'opfs',
    'default-recorder': '',
    'default-determiner': '',
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