import { el, getSs, getOpt, precisions } from './common.js'
import { getCent, getSquare, getGr } from './nl.min.js'
import { highlightFields } from './record-details.js'

let map
let currentGrPoly, currentLatLonMkr
let clickedGrPoly, clickedLatLonMkr
let clickedLatLon

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

  // Create map
  map = L.map('map-div').setView([51.505, -0.09], 13)
  // Add event handlers
  map.on('click', mapClicked)
  // Add base layers and control
  const baseLayers = {
    'Open Street Map': L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map),
    'Stadia Alidade Satellite': L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.{ext}', {
        minZoom: 0,
        maxZoom: 20,
        attribution: '&copy; CNES, Distribution Airbus DS, © Airbus DS, © PlanetObserver (Contains Copernicus Data) | &copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        ext: 'jpg'
      }),
    'Esri World Imagery': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      }),
  }
  L.control.layers(baseLayers, []).addTo(map)

  // Controls
  // Grid ref or lat/lon 
  const georef = getOpt('georef-format')
  const georefDiv = document.createElement('div')
  ctlsDiv.appendChild(georefDiv)
  georefDiv.setAttribute('id', 'georef-div')
  if (georef === 'latlon') {
    georefDiv.classList.add('latlon')
  }

  let elm
  // Clicked
  elm = document.createElement('div')
  georefDiv.appendChild(elm)
  elm.innerHTML = 'Clicked:'
  elm.classList.add('georef-label')

  elm = document.createElement('div')
  georefDiv.appendChild(elm)
  elm.setAttribute('id', 'clicked-gr')

  if (georef === 'osgr') {
    elm = document.createElement('select')
    georefDiv.appendChild(elm)
    elm.setAttribute('id', 'clicked-precision')
    setPrecisionOptions(elm)
    elm.addEventListener('change', clickedPrecisionChanged)
  }
  elm = document.createElement('button')
  georefDiv.appendChild(elm)
  elm.setAttribute('id', 'clicked-precision-use')
  elm.innerText = 'Use'
  elm.addEventListener('click', useClickedGeoref)

  // Current
  if (georef === 'osgr') {
    elm = document.createElement('div')
    georefDiv.appendChild(elm)
    elm.innerHTML = 'Current:'
    elm.classList.add('georef-label')

    elm = document.createElement('div')
    georefDiv.appendChild(elm)
    elm.setAttribute('id', 'current-gr')

    elm = document.createElement('select')
    georefDiv.appendChild(elm)
    elm.setAttribute('id', 'current-precision')
    setPrecisionOptions(elm)

    elm = document.createElement('button')
    georefDiv.appendChild(elm)
    elm.setAttribute('id', 'current-precision-use')
    elm.innerText = 'Use'
    elm.addEventListener('click', () => {
      console.log('Use current')
    })
  }

  function setPrecisionOptions(elm) {
    let opt 
    precisions.forEach(p => {
      opt = document.createElement('option')
      elm.appendChild(opt)
      opt.innerText = p.caption
      opt.setAttribute('value', p.value)
      
    })
    elm.value = getOpt('georef-precision')
  }
}

export function invalidateSize() {
  map.invalidateSize()
}

export function updateMap() {
  clearClickedMarkers()
  const selectedFile = getSs('selectedFile')
  const georef = getOpt('georef-format')

  // Ensure header text correct
  const subText = document.querySelector('#head-div .header-note')
  if (selectedFile) {
    subText.innerHTML = 'for selected record'
  } else {
    subText.innerHTML = 'no record selected'
  }

  // Move map to location of selected record and plot marker
  let lat, lon
  if (georef === 'osgr') {
    const gr = el('gridref-input').value
    if (gr) {
      const ll = getCent(gr, 'wg')
      lat = ll.centroid[1]
      lon = ll.centroid[0]
      const grJson = getSquare(gr)
      const latlons = grJson.coordinates[0].map(lonlat => [lonlat[1], lonlat[0]])
      latlons.pop()
      if (!currentGrPoly) {
        currentGrPoly = L.polygon(latlons, {color: 'red'}).addTo(map)
      } else {
        currentGrPoly.setLatLngs(latlons)
      }
    } 
  } else {
    lat = Number(el('lat-input').value)
    lon = Number(el('lon-input').value)
    if (!currentLatLonMkr) {
      currentLatLonMkr = L.marker([lat, lon]).addTo(map)
      currentLatLonMkr._icon.classList.add("current-lat-lon")
    } else {
      currentLatLonMkr.setLatLng([lat, lon])
    }
  }
  map.panTo(L.latLng(lat, lon))

}

function mapClicked(e) {
  clickedLatLon = {
    lat: Math.round(e.latlng.lat*1000000)/1000000,
    lon: Math.round(e.latlng.lng*1000000)/1000000
  }
  setMapClickedGR()
}

function clickedPrecisionChanged(e) {
  setMapClickedGR()
}

function setMapClickedGR() {
  if (!clickedLatLon) return
  const georef = getOpt('georef-format')
  const lat = clickedLatLon.lat
  const lon = clickedLatLon.lon

  if (georef === 'osgr') {
    const grs = getGr(lon, lat, 'wg', 'gb', [1,10,100,1000,2000,5000,10000]) 
    const gr = grs[`p${el('clicked-precision').value}`]
    const grJson = getSquare(gr)
    const latlons = grJson.coordinates[0].map(lonlat => [lonlat[1], lonlat[0]])
    latlons.pop()
    if (!clickedGrPoly) {
      clickedGrPoly = L.polygon(latlons, {color: 'blue'}).addTo(map)
    } else {
      clickedGrPoly.setLatLngs(latlons)
    }
    el('clicked-gr').innerText = gr
  } else {
    if (!clickedLatLonMkr) {
      clickedLatLonMkr = L.marker([lat, lon]).addTo(map)
    } else {
      clickedLatLonMkr.setLatLng([lat, lon])
    }
    el('clicked-gr').innerText = `lat: ${lat}, lon: ${lon}`
  }
}

function useClickedGeoref() {
  const georef = getOpt('georef-format')
  if (!clickedLatLon) return
  if (georef === 'osgr') {
    el('gridref-input').value = el('clicked-gr').innerText
  } else {
    el('lat-input').value = clickedLatLon.lat
    el('lon-input').value = clickedLatLon.lon
  }
  highlightFields()
}

function clearClickedMarkers() {

  if (clickedGrPoly) {
    clickedGrPoly.remove()
    clickedGrPoly = null
  }
  if (clickedLatLonMkr) {
    clickedLatLonMkr.remove()
    clickedLatLonMkr = null
  }
  el('clicked-gr').innerText = ''
  clickedLatLon = null
}
