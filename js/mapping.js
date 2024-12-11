import { el, getSs, getOpt } from './common.js'
import { getCent, getGr } from './nl.min.js'

let map

export function initLocationDetails() {

  const detailsDiv = el('location-details')
  detailsDiv.innerHTML = ''

  const headDiv = document.createElement('div')
  detailsDiv.appendChild(headDiv)
  headDiv.setAttribute('id', 'head-div')
  headDiv.innerHTML = `<h3>Location details <span class="header-note">for selected record</span></h3>`

  const mapDiv = document.createElement('div')
  detailsDiv.appendChild(mapDiv)
  mapDiv.setAttribute('id', 'map-div')

  const ctlsDiv = document.createElement('div')
  detailsDiv.appendChild(ctlsDiv)
  ctlsDiv.setAttribute('id', 'ctls-div')

  map = L.map('map-div').setView([51.505, -0.09], 13)
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map)
}

export function invalidateSize() {
  map.invalidateSize()
}

export function updateMap() {
  const selectedFile = getSs('selectedFile')
  const georef = getOpt('georef-format')

  // Ensure header text correct
  const subText = document.querySelector('#head-div .header-note')
  if (selectedFile) {
    subText.innerHTML = 'for selected record'
  } else {
    subText.innerHTML = 'no record selected'
  }

  // Move map to location of selected record
  let lat, lon
  if (georef === 'osgr') {
    const gr = el('gridref-input').value
    if (gr) {
      const ll = getCent(gr, 'wg')
      lat = ll.centroid[1]
      lon = ll.centroid[0]
    } 
  } else {
    lat = Number(el('lat-input').value)
    lon = Number(el('lon-input').value)
  }
  map.panTo(L.latLng(lat, lon))
}