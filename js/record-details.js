const smallScreen = window.matchMedia("(max-width: 600px)")
smallScreen.addEventListener("change", function() {
  initialiseDisplay()
})
initialiseDisplay()

function initialiseDisplay () {
  const includesList = window.location.href.endsWith('manage.html') 
  if (smallScreen.matches) {
    // Small screen
    if (includesList) {
      document.getElementById('record-details-large-screen').innerHTML = ''
    } else {
      generateRecordFields(document.getElementById('record-details-small-screen'))
    }
  } else {
    // Large screen
    generateRecordFields(document.getElementById('record-details-large-screen'))
  }
}

function generateRecordFields(el) {
  el.innerHTML = "<b>Record details...</b>"
}