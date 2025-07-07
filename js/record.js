import { wavMediaRecorder, registerWavEncoder, getGr } from './nl.min.js'
import { beep, doubleBeep, playBlob } from './play.js'
import { getOpt, getDateTime } from "./common.js"
import { downloadBlob, storSaveFile } from './file-handling.js'
import { gps } from './svg-icons.js'

// No exports from this module
// so safe to have module level functionlity
// - review if exports added.
let isGeolocated = false
let filenameLoc

let mediaRecorder = null
let recording = false
let audioBlobs = []
let audioBlob
let capturedStream = null
let playback

// Shake test
function handleMotion(event) {
  const x = event.accelerationIncludingGravity.x
  const y = event.accelerationIncludingGravity.y
  const z = event.accelerationIncludingGravity.z

  const acceleration = Math.sqrt(x * x + y * y + z * z)

  // Implement your shake detection logic here
  // Example: Check if acceleration exceeds a threshold within a timeframe
  if (acceleration > 15 /* additional conditions for time window */) {
      doubleBeep(1200, 0.15)
  }
}
//window.addEventListener('devicemotion', handleMotion)

function addRemoveClickTouchEvent(el, fn, add) {
  const isTouch = navigator.maxTouchPoints
  if (isTouch) {
    if (add) {
      el.addEventListener('touchstart', fn)
    } else {
      el.removeEventListener('touchstart', fn)
    }
  } else {
    if (add) {
      el.addEventListener('click', fn)
    } else {
      el.removeEventListener('click', fn)
    }
  }
}

// Show tetrad if option selected
if (getOpt('show-tetrad') === "true") {
   document.getElementById('gps-rec-tetrad').classList.add('show')
}

// Add event handler to gps icon to remove blink class
// on animation completion
const gpsEl = document.getElementById('gps-rec-gps')
gpsEl.setAttribute('viewBox', gps.viewBox)
gpsEl.innerHTML=gps.svgEls
gpsEl.addEventListener("animationend", () => {
  gpsEl.classList.remove('blink-gps')
})

// Register the wav encoder
await registerWavEncoder()

// Start continuous geolocation. I think it's safe to do this
// without draining battery because I think it doesn't operate
// when tab is inactive/minimised.
navigator.geolocation.watchPosition(geolocated, geolocateFailure, {
  maximumAge: 30000, // 30 second maximum age
  timeout: 120000, // 2 minute timeout
  enableHighAccuracy: true
})

// Perform certain actions when document becomes visible
// or hidden (e.g. screen turned off or app minimised).
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    console.log('hidden')
    if (recording) {
      // If currently recording, stop.
      stopRecording()
    }
    // Unset isGeolocated flag so that when screen is re-activated
    // user can't make record until GPS location updated.
    isGeolocated = false
    //document.getElementById("gps-rec-record").removeEventListener('touchstart', startRecording)
    addRemoveClickTouchEvent(document.getElementById("gps-rec-record"), startRecording, false)
    document.getElementById("gps-rec-record").src = "images/record-grey.png"
  } else {
    console.log('shown')
  }
})

function geolocated(position) {
  if (!isGeolocated) {
    // First time in
    //document.getElementById("gps-rec-record").addEventListener('touchstart', startRecording)
    addRemoveClickTouchEvent(document.getElementById("gps-rec-record"), startRecording, true)
    document.getElementById("gps-rec-record").src = "images/record-green.png"
    isGeolocated = true
  }
  
  // Blink the GPS icon
  document.getElementById('gps-rec-gps').classList.add('blink-gps')

  // Update position
  let lat = position.coords.latitude
  let lon =  position.coords.longitude
  lat = Math.round(lat * 1000000) / 1000000
  lon = Math.round(lon * 1000000) / 1000000
  const accuracy = Math.ceil(position.coords.accuracy)
  const altitude = position.coords.altitude ? Math.floor(position.coords.altitude) : null
  const gr = getGr(lon, lat, 'wg', 'gb', [1,10,2000])
  const gr10 = gr.p1
  const tetrad = gr.p2000
  //const gr8 = gr.p10
  if (getOpt('georef-format') === 'osgr') {
    //2015-02-14_20-54-29_SD65821128_18_0.wav
    filenameLoc = `${gr10}_${accuracy}_${altitude ? altitude : 'none'}`
  } else {
    //2015-02-14_20-54-45_53.59675_-2.51646_15_0.wav
    filenameLoc = `${lat}_${lon}_${accuracy}_${altitude ? altitude : 'none'}`
  }
  
  // Update gui GR
  document.getElementById("gps-rec-prefix").innerHTML = gr10.substring(0,2)
  document.getElementById("gps-rec-e3").innerHTML = gr10.substring(2,5)
  document.getElementById("gps-rec-e4").innerHTML = gr10.substring(5,6)
  document.getElementById("gps-rec-e5").innerHTML = gr10.substring(6,7)
  document.getElementById("gps-rec-n3").innerHTML = gr10.substring(7,10)
  document.getElementById("gps-rec-n4").innerHTML = gr10.substring(10,11)
  document.getElementById("gps-rec-n5").innerHTML = gr10.substring(11,12)
  // Update gui accuracy
  document.getElementById("gps-rec-accuracy").innerHTML = `Accuracy: ${accuracy} m`
  // Update gui altitude
  document.getElementById("gps-rec-altitude").innerHTML = altitude ? `Altitude: ${altitude} m` : 'Altitude:'
  // Update gui lat/lng
  document.getElementById("gps-rec-latlon").innerHTML = `${lat} / ${lon}`
  // Update tetrad
  document.getElementById("gps-rec-tetrad").innerHTML = tetrad
  // Clear any error msg
  document.getElementById("gps-rec-msg").innerHTML = ""
}

function geolocateFailure(err) {
  console.log('Geolocation failure')
  document.getElementById("gps-rec-msg").innerHTML = err.message
}

async function startRecording(e) {
  //console.log(event.touches[0].clientX)
  e.preventDefault()

  console.log(e)

  console.log('start recording')
  const stream = await  navigator.mediaDevices.getUserMedia({
    audio: {
      // Echo cancellation, if switched on, causes problems when
      // recording starts because it is about preventing interference
      // between recording and playback, so ensure this is off.
      echoCancellation: false,
    }
  })
  
  audioBlobs = []
  capturedStream = stream
  mediaRecorder = wavMediaRecorder(stream)
  // Add audio blobs while recording 
  mediaRecorder.addEventListener('dataavailable', event => {
    audioBlobs.push(event.data)
  })

  const elMicrophone = document.getElementById("gps-rec-record")
  //elMicrophone.removeEventListener('touchstart', startRecording)
  addRemoveClickTouchEvent(elMicrophone, startRecording, false)
  await beep(600, 0.3) // Await ensures that beep won't be on playback
  mediaRecorder.start()
  elMicrophone.src = "images/record-red.png"
  elMicrophone.classList.add("flashing")
  //elMicrophone.addEventListener('touchstart', stopRecording)
  addRemoveClickTouchEvent(elMicrophone, stopRecording, true)

  const elBin = document.getElementById("gps-rec-bin")
  elBin.src = "images/bin-orange.png"
  //elBin.addEventListener('touchstart', cancelRecording)
  addRemoveClickTouchEvent(elBin, cancelRecording, true)

  recording = true
}

async function stopRecording() {

  mediaRecorder.addEventListener('stop', async () => {
    const mimeType = mediaRecorder.mimeType
    audioBlob = new Blob(audioBlobs, { type: mimeType })
    if (capturedStream) {
      capturedStream.getTracks().forEach(track => track.stop())
    }
    const mode = getOpt('file-handling')
    const dateTime = getDateTime()
    if (mode === 'download') {
      downloadBlob(audioBlob, `${dateTime}_${filenameLoc}.wav`)
    } else {
      storSaveFile(audioBlob, `${dateTime}_${filenameLoc}.wav`)
    }
    if (getOpt('automatic-playback') === "true") {
      playback = new Audio()
      await playBlob(playback, audioBlob, getOpt('playback-volume'))
      playback = null
      beep(600, 0.2)
      const elMicrophone = document.getElementById("gps-rec-record")
      //elMicrophone.removeEventListener('touchstart', stopPlayback)
      addRemoveClickTouchEvent(elMicrophone, stopPlayback, false)
      elMicrophone.classList.remove("flashing")
      if (isGeolocated) {
        elMicrophone.src = "images/record-green.png"
        //elMicrophone.addEventListener('touchstart', startRecording)
        addRemoveClickTouchEvent(elMicrophone, startRecording, true)
      } else {
        elMicrophone.src = "images/record-grey.png"
      }
    }
  })
  mediaRecorder.stop()
  doubleBeep(600, 0.15)
  const elMicrophone = document.getElementById("gps-rec-record")
  //elMicrophone.removeEventListener('touchstart', stopRecording)
  addRemoveClickTouchEvent(elMicrophone, stopRecording, false)
  elMicrophone.classList.remove("flashing")
  const elBin = document.getElementById("gps-rec-bin")
  elBin.src = "images/bin-grey.png"
  //elBin.removeEventListener('touchstart', cancelRecording)
  addRemoveClickTouchEvent(elBin, cancelRecording, false)
  if (getOpt('automatic-playback') === "true") {
    elMicrophone.src = "images/playback-red-padded.png"
    elMicrophone.classList.add("flashing")
    //elMicrophone.addEventListener('touchstart', stopPlayback)
    addRemoveClickTouchEvent(elMicrophone, stopPlayback, true)
  } else {
    if (isGeolocated) {
      elMicrophone.src = "images/record-green.png"
      //elMicrophone.addEventListener('touchstart', startRecording)
      addRemoveClickTouchEvent(elMicrophone, startRecording, true)
    } else {
      elMicrophone.src = "images/record-grey.png"
    }
  }
  recording = false
}

function stopPlayback() {
  console.log('stop playback')

  playback.pause()
  playback.currentTime = 0
  playback = null

  beep(600, 0.2)
  const elMicrophone = document.getElementById("gps-rec-record")
  //elMicrophone.removeEventListener('touchstart', stopPlayback)
  addRemoveClickTouchEvent(elMicrophone, stopPlayback, false)
  elMicrophone.classList.remove("flashing")

  if (isGeolocated) {
    elMicrophone.src = "images/record-green.png"
    //elMicrophone.addEventListener('touchstart', startRecording)
    addRemoveClickTouchEvent(elMicrophone, startRecording, true)
  } else {
    elMicrophone.src = "images/record-grey.png"
  }
}

function cancelRecording() {
  beep(450, 0.4)
  
  const elMicrophone = document.getElementById("gps-rec-record")
  //elMicrophone.removeEventListener('touchstart', stopRecording)
  addRemoveClickTouchEvent(elMicrophone, stopRecording, false)
  elMicrophone.src = "images/record-green.png"
  elMicrophone.classList.remove("flashing")
  console.log('Add startRecording from cancelRecording')
  //elMicrophone.addEventListener('touchstart', startRecording)
  addRemoveClickTouchEvent(elMicrophone, startRecording, true)

  const elBin = document.getElementById("gps-rec-bin")
  elBin.src = "images/bin-grey.png"
  //elBin.removeEventListener('touchstart', cancelRecording)
  addRemoveClickTouchEvent(elBin, cancelRecording, false)

  recording = false
}