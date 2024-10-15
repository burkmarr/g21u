const wavRecorder = webm2wav.getWavRecorder()
let toggle = document.getElementById('recording-button')
let state = ""

let glcontWatchId
let glcontElapsedId
let lastUpdated

const glOptions = {
  maximumAge: 30000, // 30 second maximum age
  timeout: 120000, // 2 minute timeout
  enableHighAccuracy: true
}

navigator.geolocation.watchPosition(geolocated, geolocateFailure, glOptions)

glcontElapsedId = window.setInterval(function(){
  if (lastUpdated) {
    updateElapsed()
  }
}, 1000)

function updateElapsed() {
  const elapsed = Math.floor((Date.now() - lastUpdated) / 1000)
  document.getElementById("elapsedSinceUpdated").innerHTML = "Updated: " + elapsed + " seconds ago" 
}

function geolocated(position) {
  console.log(position)
  let lat = position.coords.latitude
  let lon =  position.coords.longitude
  lat = Math.round(lat * 100000) / 100000
  lon = Math.round(lon * 100000) / 100000
  const accuracy = Math.ceil(position.coords.accuracy)
  const altitude = position.coords.altitude ? Math.floor(position.coords.altitude) : 'null'
  const gr = bigr.getGrFromCoords(lon, lat, 'wg', 'gb', [10])
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

  document.getElementById("latitude").innerHTML = "latitude: " + lat 
  document.getElementById("longitude").innerHTML = "longitude: " + lon
  document.getElementById("gridref").innerHTML = "grid ref: " + gr.p10
  document.getElementById("timestamp").innerHTML = "Timestamp: " + position.timestamp
  document.getElementById("accuracy").innerHTML = "accuracy: " + accuracy
  document.getElementById("altitude").innerHTML = "altitude: " + altitude
  document.getElementById("datetime").innerHTML = "datetime: " + dateTime
  document.getElementById("filename").innerHTML = `${dateTime}_${lat}_${lon}_${accuracy}_${altitude}.wav`

  //2015-02-14_20-54-45_53.59675_-2.51646_15_0.wav
  
  lastUpdated = position.timestamp
  updateElapsed()
}

function geolocateFailure(err) {
  console.log('Geolocation failure')
  document.getElementById("msg").innerHTML = err.message
}

async function recordAudioWav(){
  if (state === "recording"){
    state = ""
    toggle.innerHTML = "Make new record"
    // Unfortunately, although wavRecorder.stop() is asynchronous,
    // it does not return a promise, so we have to wait a while before
    // downloading.
    wavRecorder.stop()
    const si = setInterval(() => {
      if (!wavRecorder.mediaRecorder) {
        wavRecorder.download(document.getElementById("filename").innerHTML, true)
        clearInterval(si)
      }
    },100)
    
  }
  else {
    state = "recording"
    toggle.innerHTML = "Stop recording"
    wavRecorder.start()
  }
}

