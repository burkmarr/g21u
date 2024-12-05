import { getGrFromCoords } from 'brc-atlas-bigr'
import { MediaRecorder, register } from 'extendable-media-recorder'
import { connect } from 'extendable-media-recorder-wav-encoder'
// export * from 'd3-selection'
// export * from 'd3-transition'
// export * from 'd3-ease'
export * from 'export-to-csv'

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