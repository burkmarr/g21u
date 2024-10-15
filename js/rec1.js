function downloadFile() {
  const url = document.getElementById('audio-element').src
  const a = document.getElementById('download-link')
  a.href = url
  a.download = document.getElementById("filename").innerHTML
  document.body.appendChild(a)
  a.click()
}
