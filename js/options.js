import { getOpt, setOpt } from "./common.js"

// Initialise GUI option values
document.getElementById("filename-format").value = getOpt('filename-format')
document.getElementById("automatic-playback").checked = getOpt('automatic-playback') === "true"
document.getElementById("playback-volume").value = getOpt('playback-volume')
document.getElementById("beep-volume").value = getOpt('beep-volume')
document.getElementById("file-handling").value = getOpt('file-handling')

export function filenameFormat() {
  setOpt('filename-format', document.getElementById("filename-format").value)
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
}