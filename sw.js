const VERSION = "v2.1.1"
const BUILD = 1
const CACHE_NAME = `g21-${VERSION}-${BUILD}`
const APP_STATIC_RESOURCES = [
  "./",
  "favicon.ico",
  "index.html",
  "options.html",
  "manage.html",
  "manage.html?small=edit",
  "csv.html",
  "help.html",
  "help.html?page=index",
  "help.html?page=intro",
  "help.html?page=install",
  "help.html?page=options",
  "help.html?page=field",
  "help.html?page=csv",
  "help.html?page=location",
  "help.html?page=metadata",
  "help.html?page=navigation",
  "help.html?page=record-details",
  "help.html?page=record-list",
  "help.html?page=taxon",
  "help.html?page=releases",
  "css/general.css",
  "css/options.css",
  "css/record.css",
  "css/manage.css",
  "css/mapping.css",
  "css/navigation.css",
  "css/csv.css",
  "css/help.css",
  "js/taxonomy.js",
  "js/mapping.js",
  "js/location.js",
  "js/record.js",
  "js/navtop.js",
  "js/navbot.js",
  "js/common.js",
  "js/options.js",
  "js/file-handling.js",
  "js/record-list.js",
  "js/record-details.js",
  "js/play.js",
  "js/csv.js",
  "js/help.js",
  "js/fields.js",
  "js/svg-icons.js",
  "js/nl.min.js",
  "js/jszip.min.js",
  "manifest.json",
  "images/icon-512x512.svg",
  "images/icon-512x512.png",
  "images/icon-192x192.png",
  "images/icon-144x144.png",
  "images/icon-96x96.png",
  "images/icon-72x72.png",
  "images/icon-48x48.png",
  "images/bin-grey.png",
  "images/bin-orange.png",
  "images/record-grey.png",
  "images/record-green.png",
  "images/record-red.png",
  "images/playback-red-padded.png",
  "images/playback-red.png",
  "images/playback-green.png",
  "images/playback-grey.png",
  "images/gilbert.png",
  "docs/index.md",
  "docs/intro.md",
  "docs/install.md",
  "docs/options.md",
  "docs/field.md",
  "docs/csv.md",
  "docs/location.md",
  "docs/metadata.md",
  "docs/navigation.md",
  "docs/record-details.md",
  "docs/record-list.md",
  "docs/taxon.md",
  "docs/releases.md",
  "docs/images/windows-install.png",
  "docs/images/bin-orange.png",
  "docs/images/csv-delete-dialog.png",
  "docs/images/csv-merge-dialog.png",
  "docs/images/details-panels-desktop-input.png",
  "docs/images/details-panels-desktop.png",
  "docs/images/duplicate-button.png",
  "docs/images/function-button-groups.png",
  "docs/images/function-button-left-group.png",
  "docs/images/function-button-right-group.png",
  "docs/images/function-check-all.png",
  "docs/images/function-uncheck-all.png",
  "docs/images/gps-green.png",
  "docs/images/nav-csv-toolbar.png",
  "docs/images/nav-csv.png",
  "docs/images/nav-details-desktop.png",
  "docs/images/nav-details-mobile.png",
  "docs/images/nav-details.png",
  "docs/images/nav-edit.png",
  "docs/images/nav-list.png",
  "docs/images/nav-main-desktop.png",
  "docs/images/nav-main-mobile.png",
  "docs/images/nav-main-v1.png",
  "docs/images/nav-mapping.png",
  "docs/images/nav-merge.png",
  "docs/images/nav-metadata.png",
  "docs/images/nav-options.png",
  "docs/images/nav-record.png",
  "docs/images/nav-taxonomy.png",
  "docs/images/pause-button.png",
  "docs/images/record-copy-field-values-dialog.png",
  "docs/images/record-delete-dialog.png",
  "docs/images/record-details-playback.png",
  "docs/images/record-edited.png",
  "docs/images/record-green.png",
  "docs/images/record-location-panel-mobile.png",
  "docs/images/record-metadata-dialog.png",
  "docs/images/record-metadata.png",
  "docs/images/record-new.png",
  "docs/images/record-selected.png",
  "docs/images/record-sound-delete-dialog.png",
  "docs/images/record-summary-panel-mobile.png",
  "docs/images/resume-button.png",
]
const APP_INTERNET_RESOURCES = [
  "species-ws.nbnatlas.org",
  "unpkg.com",
  "openstreetmap",
  "stadiamaps",
  "arcgisonline",
  "api.os.uk",
]

self.addEventListener("install", (event) => {
  console.log('Service Worker installing')

  // With skipWaiting a new service worker does not wait until
  // all tabs are closed before replacing the current service worker.
  // This is probably okay in all G21 scenarios but need to regularly
  // review as G21 is developed. It's not advised where there is a 
  // DB for example and the model changes.
  self.skipWaiting()

  // Pre-caching
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      // cache.addAll(APP_STATIC_RESOURCES)
      // The method below bypasses the browsers cache when
      // constructing the sw cache - so resources are always
      // fetched from the server.
      const reloadResources = APP_STATIC_RESOURCES.map(r => new Request(r, {
        cache: 'reload',
      }))
      cache.addAll(reloadResources)
    })(),
  )
})

self.addEventListener("activate", (event) => {
  console.log('Service Worker activating')
  event.waitUntil(
    (async () => {
      const names = await caches.keys()
      await Promise.all(
        names.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name)
          }
        }),
      )
      await clients.claim()
    })(),
  )
})

self.addEventListener("fetch", (event) => {
  console.log(`Request of ${event.request.url}`)
  if (event.request.url.endsWith('version')) {
    event.respondWith(new Response(JSON.stringify({version: CACHE_NAME}), { status: 200 }))
  } else {
    event.respondWith(
      (async () => {
        
        const useInternet = APP_INTERNET_RESOURCES.find(r => event.request.url.includes(r))

        if (useInternet) {
          return fetch(event.request)
        }
        const cache = await caches.open(CACHE_NAME)
        const cachedResponse = await cache.match(event.request.url)
        if (cachedResponse) {
          // Return the cached response if it's available.
          return cachedResponse
        } else {
          // This is where we would implement a request to network
          // for resource in a cache first then network strategy
          // fetch(event.request)
          console.log('No cache present for this resource')
        }
        // Respond with a HTTP 404 response status.
        return new Response(null, { status: 404 })
      })()
    )
  }
})