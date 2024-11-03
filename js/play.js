import { getOpt } from "./common.js"

export async function playFile(audio, path, mimeType, volume) {
  audio.type = mimeType
  audio.volume = volume
  audio.src = path
  return new Promise((resolve, reject) => {
    audio.addEventListener('ended', () => {
      resolve()
    })
    audio.play()
  })
}

export function playBlob(audio, audioBlob, volume) {
  audio.src = URL.createObjectURL(audioBlob)
  audio.volume = volume
  return new Promise((resolve, reject) => {
    audio.addEventListener('ended', () => {
      resolve()
    })
    audio.play()
  })

  //audio.addEventListener('ended', PlayNext);
  //sound.pause();
  //sound.currentTime = 0;
}

export function beep(freq, duration) {
  const audioCtx = getAudioContext()

  const oscillator = audioCtx.createOscillator()
  oscillator.type = "sine"
  oscillator.frequency.value = freq

  const gainNode = audioCtx.createGain()
  gainNode.gain.value =  Number(getOpt('beep-volume'))
  oscillator.connect(gainNode)

  gainNode.connect(audioCtx.destination)
  oscillator.start(audioCtx.currentTime)
  oscillator.stop(audioCtx.currentTime + duration)
  return new Promise(resolve => { 
    setTimeout(() =>  resolve(), duration * 1000)
  })
}

export function doubleBeep(freq, duration) {

  const audioCtx = getAudioContext()

  const beep1 = audioCtx.createOscillator()
  beep1.type = "sine"
  beep1.frequency.value = freq

  const gainNode1 = audioCtx.createGain()
  gainNode1.gain.value = Number(getOpt('beep-volume'))
  beep1.connect(gainNode1)

  gainNode1.connect(audioCtx.destination)
  beep1.start(audioCtx.currentTime)
  beep1.stop(audioCtx.currentTime + duration)

  const beep2 = audioCtx.createOscillator()
  beep2.type = "sine"
  beep2.frequency.value = freq

  const gainNode2 = audioCtx.createGain()
  gainNode2.gain.value =  Number(getOpt('beep-volume'))
  beep2.connect(gainNode2)

  gainNode2.connect(audioCtx.destination)
  beep2.start(audioCtx.currentTime + duration * 1.5)
  beep2.stop(audioCtx.currentTime + duration * 2.5)

  return new Promise(resolve => { 
    setTimeout(() =>  resolve(), duration * 1000 * 2.5)
  })
}

function getAudioContext() {
  if (!window.g21AudioContext) {
    window.g21AudioContext = new AudioContext()
  }
  return window.g21AudioContext
}