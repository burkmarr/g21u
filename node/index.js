
import { downloadWav, WavRecorder } from "webm-to-wav-converter"
//const { downloadWav, WavRecorder } = require("webm-to-wav-converter")
//export * from "webm-to-wav-converter-mod"
export * from "d3-selection"
export * from "d3-transition"
export * from "d3-ease"

export function convertAndDownload(data, flag) {
  downloadWav(data, flag)
}

export function getWavRecorder() {
  const wavRecorder = new WavRecorder()
  return wavRecorder
}



