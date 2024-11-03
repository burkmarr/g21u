import { opfsListFiles, opfsGetFiles } from './file-handling.js'
import { selectAll, transition, easeLinear } from './nl.min.js'

// recordings-div

// Populate with files from origin private file system (root folder)


export function testFlash(el) {
  flash(el.id)
}

export function deleteSelected(el) {
  console.log('delete', el.id)
  flash(el.id)
}

export async function shareSelected(el) {
  flash(el.id)
  const files = await opfsGetFiles()
  navigator.share({files: files})
}

function flash(id) {
  const t = transition().duration(300).ease(easeLinear)
  selectAll(`#${id}.menu-icon path, #${id}.menu-icon circle`)
    .transition(t).style("stroke", "#00FF21")
    .transition(t).style("stroke", "white")
  selectAll(`#${id}.menu-icon-2 path`)
    .transition(t).style("fill", "#00FF21")
    .transition(t).style("fill", "white")
}


//console.log(files)


