import { taxonDetails } from './taxonomy.js'

const defaultOpts = {
  'filename-format': 'osgr',
  'automatic-playback': 'false',
  'playback-volume': '0.5',
  'beep-volume': '0.5',
  'file-handling': 'opfs',
  'default-recorder': '',
  'default-determiner': '',
}

export function getFieldDefs() {

  const sf = getSsJson('selectedFile')
  //console.log(sf)

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
      inputLabel: 'Record time',
      jsonId: 'time',
      default: sf ? sf.time.substring(0,5) : '00:00',
      novalue: '00:00'
    },
    {
      inputId: 'scientific-name-input',
      inputType: 'taxon',
      inputLabel: 'Scientific name',
      jsonId: 'scientific-name',
      default: '',
      novalue: '',
      detailsFn: taxonDetails
    },
    {
      inputId: 'common-name-input',
      inputType: 'taxon',
      inputLabel: 'Common name',
      jsonId: 'common-name',
      default: '',
      novalue: '',
      detailsFn: taxonDetails
    },
    {
      inputId: 'gridref-input',
      inputType: 'text',
      inputLabel: 'Grid reference',
      jsonId: 'gridref',
      default: sf ? sf.location : '',
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
  ]
}

export function dateFromSf() {
  const sf = getSsJson('selectedFile')
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

export function getOpt(id) {
  return localStorage.getItem(id) ? localStorage.getItem(id) : defaultOpts[id]
}

export function setOpt(id, value) {
  localStorage.setItem(id, value)
}

export function setSsJson(id, value) {
  sessionStorage.setItem(id, JSON.stringify(value))
}

export function getSsJson(id) {
  return sessionStorage.getItem(id) ? JSON.parse(sessionStorage.getItem(id)) : null
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
  div.innerHTML = `
    <div class='collapsible-caption'>
      <b>${caption}</b> <span class='collapsible-toggle'>[show]</span>
    </div>
    <div class='collapsible-content hide'></div>
  `
  
  const toggle = document.querySelector(`#${id} .collapsible-toggle`)
  toggle.addEventListener('click', function(e){
    if (e.target.innerText === '[show]') {
      e.target.innerText = '[hide]'
      document.querySelector(`#${id} .collapsible-content`).classList.remove('hide')
    } else {
      e.target.innerText = '[show]'
      document.querySelector(`#${id} .collapsible-content`).classList.add('hide')
    }
  })

  return document.querySelector(`#${id} .collapsible-content`)
}