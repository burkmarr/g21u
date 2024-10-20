export async function beep(n) {
  // https://www.soundjay.com/beep-sounds-1.html#google_vignette
  
  return new Promise((resolve, reject) => {
    const audio = new Audio(`../beeps/beep-${n}.mp3`)
    audio.addEventListener('ended', () => {
      resolve()
    })
    audio.play()
  })
}

export async function beep2(id) {
  // https://www.soundjay.com/beep-sounds-1.html#google_vignette
  const audio = document.getElementById(id)
  return new Promise((resolve, reject) => {
    audio.addEventListener('ended', () => {
      console.log('stop', id)
      resolve()
    })
    console.log('play', id)
    audio.play()
  })
}

export async function beep3(id) {
  // https://www.soundjay.com/beep-sounds-1.html#google_vignette
  //const audio = document.getElementById(id) 
  let audio = new Audio()
  audio.type = "audio/mpeg"
  audio.volume = "0.4"
  audio.src = `../beeps/beep-${id}.mp3`
  return new Promise((resolve, reject) => {
    audio.addEventListener('ended', () => {
      //console.log('stop', id)
      audio = null
      resolve()
    })
    //console.log('play', id)
    audio.play()
  })
}

export function beep4(freq, duration) {
  const audioCtx = new AudioContext()
  const oscillator = audioCtx.createOscillator()
  oscillator.type = "sine"
  oscillator.frequency.value = freq
  oscillator.connect(audioCtx.destination)
  oscillator.start(audioCtx.currentTime)
  oscillator.stop(audioCtx.currentTime + duration)
}
