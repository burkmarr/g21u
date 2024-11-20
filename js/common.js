const defaultOpts = {
  'filename-format': 'osgr',
  'automatic-playback': 'false',
  'playback-volume': '0.5',
  'beep-volume': '0.5',
  'file-handling': 'opfs',
  'default-recorder': '',
  'default-determiner': '',
}

export function getOpt(id) {
  return localStorage.getItem(id) ? localStorage.getItem(id) : defaultOpts[id]
}

export function setOpt(id, value) {
  localStorage.setItem(id, value)
}

export function setSvJson(id, value) {
  sessionStorage.setItem(id, JSON.stringify(value))
}

export function getSvJson(id) {
  return sessionStorage.getItem(id) ? JSON.parse(sessionStorage.getItem(id)) : null
}