import { getSs, setSs, getUrlParam } from "./common.js"
import { md } from "./nl.min.js"

let helpPage = getUrlParam("page")

if (!helpPage) {
  // If no 'page' param in URL, get last used from session storage
  helpPage = getSs('helpPage')
  // If not set in session storage, set default
  if (!helpPage) {
    helpPage = 'intro'
  }
} else {
  // Save URL help page in session storage
  setSs('helpPage', helpPage)
}

const raw = await fetch(`/docs/${helpPage}.md`)
  .then(data => data.text())
  .catch(e => {
    Promise.resolve(null)
  })

const markdown = await md(raw)
document.getElementById('help').innerHTML = markdown