import { getFieldDefs } from './common.js'

export function downloadBlob(blob, name) {
  // Convert your blob into a Blob URL (a special url that points to an object in the browser's memory)
  const blobUrl = URL.createObjectURL(blob)
  // Create a link element
  const link = document.createElement("a")
  // Set link's href to point to the Blob URL
  link.href = blobUrl
  link.download = name
  // Append link to the body
  document.body.appendChild(link)
  // Dispatch click event on the link
  // This is necessary as link.click() does not work on the latest firefox
  link.dispatchEvent(
    new MouseEvent('click', { 
      bubbles: true, 
      cancelable: true, 
      view: window 
    })
  )
  // Remove link from body
  document.body.removeChild(link)
}

export async function storSaveFile(blob, name) {
  const storRoot = await navigator.storage.getDirectory()
  const fileHandle = await storRoot.getFileHandle(name, {create: true})
  const writable = await fileHandle.createWritable()
  // https://developer.mozilla.org/en-US/docs/Web/API/FileSystemWritableFileStream/write
  // May not work on iOS 
  // Writes a zero byte file on tested iPhone
  await writable.write(blob)
  await writable.close()
}

export async function storDeleteFiles(names) {
  const storRoot = await navigator.storage.getDirectory()
  for (const name of names) {
    await storRoot.removeEntry(name)
  }
}

export async function storGetWavFiles () {
  const storRoot = await navigator.storage.getDirectory()
  const entries = storRoot.values()
  const files = []
  for await (const entry of entries) {
    if (entry.name.endsWith('.wav')) {
      const existingFileHandle = await storRoot.getFileHandle(entry.name)
      const file = await existingFileHandle.getFile()
      files.push({
        name: entry.name,
        file: file
      })
    } else {
      //console.log(entry.name)
    }
  }
  return files
}

export async function storGetFile (filename) {
  const storRoot = await navigator.storage.getDirectory()

  const fileHandle = await storRoot.getFileHandle(filename, { create: false })
    .catch( error => {
      Promise.resolve(null)
    })
  if (!fileHandle) {
    return null
  }
  const file = await fileHandle.getFile()
  return file
}

export async function getJsonFile(filename) {

  let json
  const blob = await storGetFile(filename)
  if (blob) {
    json = JSON.parse(await blob.text())
  }
  // In case property has been added to definition since this 
  // file was saved, add the property, and save it before
  // returning the json.
  if (json) {
    let missingProperty = false
    getFieldDefs().forEach(f => {
      if (!json.hasOwnProperty(f.jsonId)){
        json[f.jsonId] = f.novalue
        missingProperty = true
      }
    })
    if (missingProperty) {
      const jsonString = JSON.stringify(json)
      await storSaveFile(new Blob([jsonString], { type: "application/json" }), filename)
      // Need to refetch after saving
      const blob = await storGetFile(filename)
      json = JSON.parse(await blob.text())
    }
  }

  return json
}