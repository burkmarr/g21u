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
    },
    {
      inputId: 'gridref-input',
      inputType: 'text',
      inputLabel: 'Grid reference',
      jsonId: 'gridref',
      default: '',
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