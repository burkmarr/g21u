async function recordAudio(){
  if (window.recorder && window.recorder.state === "recording"){
     window.recorder.stop()
  }
  else {
    let toggle = document.getElementById('recording-button')
    let stream = await navigator.mediaDevices.getUserMedia({audio: true, video: false})
    window.recorder = new MediaRecorder(stream)

    //console.log('mimeType', window.recorder.mimeType)

    let chunks = []
    window.recorder.ondataavailable = function(event) {
      if (event.data.size <= 0) {
        return
      }
      chunks.push(event.data)
    }

    window.recorder.onstart = function() {
      toggle.innerHTML = 'Stop'
    }
    
    window.recorder.onstop = function() {
      //let blob = new Blob(chunks, { type: 'audio/mp3' })
      toggle.innerHTML = 'Start'
      // document.getElementById('audio-element').src = URL.createObjectURL(blob)
      // let tracks = stream.getTracks()
      // tracks.forEach(track => track.stop())

      webm2wav.convertAndDownload(chunks, true)
    }
  
    window.recorder.start()
  }
}

