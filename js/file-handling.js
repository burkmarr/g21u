import { getFieldDefs, getOpt } from './common.js'

export function downloadBlob(blob, name) {
  // Convert blob into a Blob URL (a special url that points to an object in the browser's memory)
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

export async function downloadFile(filename) {
  const blob = await storGetFile (filename)
  downloadBlob(blob, filename)
}

export async function storSaveFile(blob, name) {

  switch(getOpt('file-handling')) {
    case 'opfs':
      const storRoot = await navigator.storage.getDirectory()
      const fileHandle = await storRoot.getFileHandle(name, {create: true})
      const writable = await fileHandle.createWritable()
      // https://developer.mozilla.org/en-US/docs/Web/API/FileSystemWritableFileStream/write
      // May not work on iOS 
      // Writes a zero byte file on tested iPhone
      await writable.write(blob)
      await writable.close()
      break
    default:
      // No default handler
  }
}

export async function storDeleteFiles(files) {
  switch(getOpt('file-handling')) {
    case 'opfs':
      const storRoot = await navigator.storage.getDirectory()
      for (const file of files) {
        await storRoot.removeEntry(file).catch(e => console.log(`Could not delete ${file}`))
      }
      break
    default:
      // No default handler
  }
}

export async function storGetRecFiles () {
  // Returns a list of file names (without extension)
  // which will be used to build a list of records in
  // the application. In v1 emulation, just return the
  // list of wav files. For v2 return a list of all
  // json files plus names of wavs which don't have a
  // json file - the record listing code will create
  // the json if it is missing.
  let files
  const wav = []
  const txt = []
  const ext = getOpt('emulate-v1') === 'true' ? 'wav' : 'txt'
  switch(getOpt('file-handling')) {
    case 'opfs':
      const storRoot = await navigator.storage.getDirectory()
      const entries = storRoot.values()
      for await (const entry of entries) {
        if (entry.name.endsWith('.wav')) {
          wav.push(entry.name.substring(0, entry.name.length - 4))
        } else if (entry.name.endsWith('.txt')) {
          txt.push(entry.name.substring(0, entry.name.length - 4))
        } else {
          // TODO delete file?
        }
      }
      break
    default:
      // No default handler
  }
  if (ext === 'wav') {
    files = wav
  } else {
    files = [...new Set([...txt, ...wav])]
  }
  return files
}

export async function storGetFile (filename) {
  let file
  switch(getOpt('file-handling')) {
    case 'opfs':
      const storRoot = await navigator.storage.getDirectory()
      const fileHandle = await storRoot.getFileHandle(filename, { create: false })
        .catch( error => {
          Promise.resolve(null)
        })
      if (!fileHandle) {
        return null
      }
      file = await fileHandle.getFile()
      break
    default:
      // No default handler
  }
  return file
}

export async function getFileJson(filename) {

  let json
  const blob = await storGetFile(filename)
  //console.log('blob', blob)
  if (blob) {
    json = JSON.parse(await blob.text())
  }
  // In case property has been added to definition since this 
  // file was saved, add the property, and save it before
  // returning the json.
  if (json) {
    let missingProperty = false
    getFieldDefs(filename).forEach(f => {
      if (!json.hasOwnProperty(f.jsonId)){
        json[f.jsonId] = f.default
        missingProperty = true
      }
    })
    if (missingProperty) {
      const jsonString = JSON.stringify(json)
      await storSaveFile(new Blob([jsonString], { type: "text/plain" }), filename)
      // Need to refetch after saving
      const blob = await storGetFile(filename)
      json = JSON.parse(await blob.text())
    }
  }
  return json
}

export async function getJsonAsTextFile(filename) {
  // navigator.share does not allow json, so share as text instead
  const blob = await storGetFile(filename)
  let text = await blob.text()
  const textBlob = new Blob([text], { type: "text/plain" })
  const textFile = new File([textBlob], `${filename}.txt`, {
    type: "text/plain" // Required else navigator.share doesn't work
  })
  return textFile
}

export async function fileExists(filename) {
  let file
  switch(getOpt('file-handling')) {
    case 'opfs':
      const storRoot = await navigator.storage.getDirectory()
      const fileHandle = await storRoot.getFileHandle(filename, { create: false })
        .catch( error => {
          Promise.resolve(null)
        })
      return typeof fileHandle !== 'undefined'
    default:
      // No default handler
  }
}
