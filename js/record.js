import { selectAll, transition, easeLinear, wavMediaRecorder, registerWavEncoder, getGr } from './nl.min.js'
import { beep, doubleBeep, playBlob } from './play.js'

let isGeolocated = false
let filename

let mediaRecorder = null
let audioBlobs = []
let audioBlob
let capturedStream = null
let playback

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

function geolocated(position) {
  if (!isGeolocated) {
    // First time in
    document.getElementById("g21-simp-record").addEventListener('click', startRecording)
    document.getElementById("g21-simp-record").src = "/images/record-green.png"
    isGeolocated = true
  }
  
  // Can't find a way to do this transition/animation with CSS because of
  // the need to chain transitions, so using D3
  const t = transition().duration(200).ease(easeLinear)
  selectAll(".gps-path")
    .transition(t).style("fill", "#00FF21")
    .transition(t).style("fill", "lightgrey")

  // Update position
  let lat = position.coords.latitude
  let lon =  position.coords.longitude
  lat = Math.round(lat * 100000) / 100000
  lon = Math.round(lon * 100000) / 100000
  const accuracy = Math.ceil(position.coords.accuracy)
  const altitude = position.coords.altitude ? Math.floor(position.coords.altitude) : null
  const gr = getGr(lon, lat, 'wg', 'gb', [1]).p1
  const dte = new Date()
  const year = dte.getFullYear()
  let month = String(dte.getMonth() + 1)
  let day = String(dte.getDate())
  let hour = String(dte.getHours())
  let minute = String(dte.getMinutes())
  let second = String(dte.getSeconds())
  month = month.length === 2 ? month : `0${month}`
  day = day.length === 2 ? day : `0${day}`
  hour = hour.length === 2 ? hour : `0${hour}`
  minute = minute.length === 2 ? minute : `0${minute}`
  second = second.length === 2 ? second : `0${second}`
  const dateTime = `${year}-${month}-${day}_${hour}-${minute}-${second}`
   //2015-02-14_20-54-45_53.59675_-2.51646_15_0.wav
  filename = `${dateTime}_${lat}_${lon}_${accuracy}_${altitude ? altitude : 'none'}.wav`
  
  // Update gui GR
  document.getElementById("g21-simp-prefix").innerHTML = gr.substring(0,2)
  document.getElementById("g21-simp-e3").innerHTML = gr.substring(2,5)
  document.getElementById("g21-simp-e4").innerHTML = gr.substring(5,6)
  document.getElementById("g21-simp-e5").innerHTML = gr.substring(6,7)
  document.getElementById("g21-simp-n3").innerHTML = gr.substring(7,10)
  document.getElementById("g21-simp-n4").innerHTML = gr.substring(10,11)
  document.getElementById("g21-simp-n5").innerHTML = gr.substring(11,12)
  // Update gui accuracy
  document.getElementById("g21-simp-accuracy").innerHTML = `Accuracy: ${accuracy} m`
  // Update gui altitude
  document.getElementById("g21-simp-altitude").innerHTML = altitude ? `Altitude: ${altitude} m` : 'Altitude:'
  // Update gui lat/lng
  document.getElementById("g21-simp-latlon").innerHTML = `${lat} / ${lon}`
  // Clear any error msg
  document.getElementById("g21-simp-msg").innerHTML = ""
}

function geolocateFailure(err) {
  console.log('Geolocation failure')
  document.getElementById("g21-simp-msg").innerHTML = err.message
}

export async function startRecording() {

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

  const elMicrophone = document.getElementById("g21-simp-record")
  elMicrophone.removeEventListener('click', startRecording)
  await beep(600, 0.3) // Await ensures that beep won't be on playback
  mediaRecorder.start()
  elMicrophone.src = "/images/record-red.png"
  elMicrophone.classList.add("flashing")
  elMicrophone.addEventListener('click', stopRecording)

  const elBin = document.getElementById("g21-simp-bin")
  elBin.src = "/images/bin-orange.png"
  elBin.addEventListener('click', cancelRecording)
}

async function stopRecording() {

  mediaRecorder.addEventListener('stop', async () => {
    const mimeType = mediaRecorder.mimeType
    audioBlob = new Blob(audioBlobs, { type: mimeType })
    if (capturedStream) {
      capturedStream.getTracks().forEach(track => track.stop())
    }
    const playbackOpt = true // Replace with option
    if (playbackOpt) {
      playback = new Audio()
      await playBlob(playback, audioBlob, 1)
      playback = null
      beep(600, 0.2)
      const elMicrophone = document.getElementById("g21-simp-record")
      elMicrophone.removeEventListener('click', stopPlayback)
      elMicrophone.src = "/images/record-green.png"
      elMicrophone.classList.remove("flashing")
      elMicrophone.addEventListener('click', startRecording)
    }
    const mode = 'download' // Replace with option
    if (mode === 'download') {
      downloadBlob(audioBlob, filename)
    }
  })
  mediaRecorder.stop()
  doubleBeep(600, 0.15)
  const elMicrophone = document.getElementById("g21-simp-record")
  elMicrophone.removeEventListener('click', stopRecording)
  elMicrophone.classList.remove("flashing")
  const elBin = document.getElementById("g21-simp-bin")
  elBin.src = "/images/bin-grey.png"
  elBin.removeEventListener('click', cancelRecording)
  const playbackOpt = true // Replace with option
  if (playbackOpt) {
    elMicrophone.src = "/images/playback-red.png"
    elMicrophone.classList.add("flashing")
    elMicrophone.addEventListener('click', stopPlayback)
  } else {
    elMicrophone.src = "/images/record-green.png"
    elMicrophone.addEventListener('click', startRecording)
  }
}

function stopPlayback() {
  console.log('stop playback')

  playback.pause()
  playback.currentTime = 0
  playback = null

  beep(600, 0.2)
  const elMicrophone = document.getElementById("g21-simp-record")
  elMicrophone.removeEventListener('click', stopPlayback)
  elMicrophone.src = "/images/record-green.png"
  elMicrophone.classList.remove("flashing")
  elMicrophone.addEventListener('click', startRecording)

  const mode = 'download' // Replace with option
  if (mode === 'download') {
    downloadBlob(audioBlob, filename)
  }
}

function cancelRecording() {
  beep(450, 0.4)
  
  const elMicrophone = document.getElementById("g21-simp-record")
  elMicrophone.removeEventListener('click', stopRecording)
  elMicrophone.src = "/images/record-green.png"
  elMicrophone.classList.remove("flashing")
  console.log('Add startRecording from cancelRecording')
  elMicrophone.addEventListener('click', startRecording)

  const elBin = document.getElementById("g21-simp-bin")
  elBin.src = "/images/bin-grey.png"
  elBin.removeEventListener('click', cancelRecording)
}

function downloadBlob(blob, name) {
  // Convert your blob into a Blob URL (a special url that points to an object in the browser's memory)
  const blobUrl = URL.createObjectURL(blob)
  // Create a link element
  const link = document.createElement("a")
  // Set link's href to point to the Blob URL
  link.href = blobUrl
  link.download = name
  // Append link to the body
  document.body.appendChild(link)
  // Dispatch click event on the link
  // This is necessary as link.click() does not work on the latest firefox
  link.dispatchEvent(
    new MouseEvent('click', { 
      bubbles: true, 
      cancelable: true, 
      view: window 
    })
  )
  // Remove link from body
  document.body.removeChild(link)
}

