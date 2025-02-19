import { getGrFromCoords, getCentroid, getGjson } from 'brc-atlas-bigr'
import { MediaRecorder, register } from 'extendable-media-recorder'
import { connect } from 'extendable-media-recorder-wav-encoder'
// import JSZip  from 'jszip'

// export * from 'd3-selection'
// export * from 'd3-transition'
// export * from 'd3-ease'
export * from 'd3-dsv' // Includes csvParse
export * from 'export-to-csv'
import { get, set, getMany, del, delMany, entries, keys } from 'idb-keyval'
import markdownit from 'markdown-it'

export async function md(raw) {
  const md = markdownit({
    html: true,
    // linkify: true,
    // typographer: true
  })

  return md.render(raw)
}

export async function registerWavEncoder() {
  await register(await connect())
}
export function wavMediaRecorder(stream) {
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'audio/wav'
  })
  return mediaRecorder
}
export function getGr(lon, lat, from, to, precisions) {
  return getGrFromCoords(lon, lat, from, to, precisions)
}
export function getCent(gridref, proj) {
  return getCentroid(gridref, proj)
}

export function getSquare(gr) {
  return getGjson(gr, 'wg', 'square', 1)
}

export const idb = {
  get: get,
  set: set,
  getMany: getMany,
  del: del,
  delMany: delMany,
  entries: entries,
  keys: keys
}

// Couldn't find a way to export jszip from this
// package successfully. 
// Always met with this error when nl.min.js runs:
// Uncaught TypeError: Failed to resolve module specifier "stream". Relative references must start with either "/", "./", or "../".
// export function getJszip() {
//   console.log('JSZip', JSZip)
//   const jszip = new JSZip()
//   return jszip
// }