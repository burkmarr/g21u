import { selectAll, transition, easeLinear, getWavRecorder, getGr } from './nl.min.js'

const wavRecorder = getWavRecorder()
let state = ""
let filename
let isGeolocated = false

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
  console.log(gr)
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

export async function recordAudioWav(cancel){
  if (state === "recording"){
    // STOP recording
    state = ""
    document.getElementById("g21-simp-bin").src = "/images/bin-grey.png"
    const elMicrophone = document.getElementById("g21-simp-record")
    elMicrophone.src = "/images/record-green.png"
    elMicrophone.classList.remove("flashing")

    // Although wavRecorder.stop() is asynchronous, it does not return
    // a promise so we can't detect when completed. However it sets
    // the reference to wavRecorder to undefined when it completes, so
    // we can poll for that to happen and then download the file
    wavRecorder.stop()
    if (!cancel) {
      const si = setInterval(() => {
        if (!wavRecorder.mediaRecorder) {
          wavRecorder.download(filename, true)
          clearInterval(si)
        }
      },100)
    }
  }
  else {
    // START recording
    state = "recording"
     document.getElementById("g21-simp-bin").src = "/images/bin-orange.png"
    const elMicrophone = document.getElementById("g21-simp-record")
    elMicrophone.src = "/images/record-red.png"
    elMicrophone.classList.add("flashing")

    wavRecorder.start()
  }
}

export function cancelRecording() {
  if (state = "recording") {
    recordAudioWav(true)
    document.getElementById("g21-simp-bin").src = "/images/bin-grey.png"
  }
}

