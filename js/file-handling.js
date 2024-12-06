import { getFieldDefs, getOpt, getDateTime } from './common.js'
import { mkConfig, generateCsv, asBlob } from './nl.min.js'

// Function names that start with 'stor' indicate
// functions that retrieve or write to storage and
// are all responsive to the type of storage selected.

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

export async function storGetRecs () {
  let recs = []
  const v1 = getOpt('emulate-v1') === 'true'
  switch(getOpt('file-handling')) {
    case 'opfs':
      const storRoot = await navigator.storage.getDirectory()
      const entries = storRoot.values()
      for await (const entry of entries) {
        const ext = entry.name.substring(entry.name.length - 4)
        const name = entry.name.substring(0, entry.name.length - 4)
        if (ext === '.wav') {
          if (v1) {
            recs.push({filename: name})
          } else { //v2
            const json = await getRecordJson(`${name}.txt`)
            json.filename = name
            recs.push(json)
          }
        } else if (!v1 && ext === '.txt') {
          // Add only if there is no corresponding wav file
          // those with wav files are added above
          if (!await fileExists(`${name}.wav`)) {
            const json = await getRecordJson(`${name}.txt`)
            json.filename = name
            recs.push(json)
          }
        }
      }
      break
    default:
      // No default handler
  }
  return recs
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
  // This is necessary as click() method may not on a element on some browsers
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
  // Download the file
  const blob = await storGetFile (filename)
  downloadBlob(blob, filename)
  // Update record's metadata if this is a json text file
  if (filename.endsWith('.txt')) {
    const json = await getRecordJson(filename)
    json.metadata.downloads.push(getDateTime(true))
    // Write the file
    const jsonString = JSON.stringify(json)
    await storSaveFile(new Blob([jsonString], { type: "text/plain" }), filename)
  }
}

export async function shareRecs(recs) {
  const files = []
  const txtFiles = []
  for (let i=0; i<recs.length; i++) {
    const name = recs[i]
    if (await fileExists(`${name}.wav`)) {
      const wav = await storGetFile(`${name}.wav`)
      files.push(wav)
    }
    if (await fileExists(`${name}.txt`)) {
      const txt = await storGetFile(`${name}.txt`)
      files.push(txt)
      txtFiles.push(name)
    } 
  }
  // Attempt the share
  const share = await shareApi(files)

  if (share === 'success') {
    // The share was potentially successful
    // (doesn't guarantee that the user went through with it)
    // Update the metadata of record files
    // For json text record files, add record
    // of share into metadata.
    const dateTime = getDateTime(true)
    for (let i=0; i<txtFiles.length; i++) {
      const name = txtFiles[i]
      const json = await getRecordJson(`${name}.txt`)
      json.metadata.shares.push(dateTime)
      // Write the updated file
      const jsonString = JSON.stringify(json)
      await storSaveFile(new Blob([jsonString], { type: "text/plain" }), `${name}.txt`)
    }
  }
  return share
}

async function shareApi(files) {
// Check browser support
  if (navigator.share) {
    const ret = await navigator.share({files: files})
      .then(() => {
        return 'success'
      })
      .catch((error) => {
        return `error: ${error}`
      })
    return ret
  } 
  else {
    // you can have you own implementation here
    return ("Your browser does not support the WebShare API.")
  }
}

export async function recsToCsv(recs) {
  const csvRecs = []
  const formattedDateTime = getDateTime(true)
  const unformattedDateTime = getDateTime()
  for (let i=0; i<recs.length; i++) {
    const name = recs[i]
    const json = await getRecordJson(`${name}.txt`)
    // Copy the record json object minus the metadata
    const cjson = JSON.parse(JSON.stringify(json))
    delete cjson.metadata
    csvRecs.push(cjson)
    // Update record metadata
    json.metadata.csvs.push(formattedDateTime)
    const jsonString = JSON.stringify(json)
    await storSaveFile(new Blob([jsonString], { type: "text/plain" }), `${name}.txt`)
  }
  const csvConfig = mkConfig({ 
    useKeysAsHeaders: true 
  })
  const csv = generateCsv(csvConfig)(csvRecs)
  const blob = asBlob(csvConfig)(csv)

  // The CSV file is given a name based on the current timestamp
  await storSaveFile(blob, `g21-recs-${unformattedDateTime}.csv`)
}

export async function getRecordJson(filename) {
  // This function takes care of getting the record json
  // from a given record json text file.
  // It also takes care of *creating* that file if it doesn't
  // exist. This is the only place these files are created.
  // This function is called when the application lists 
  // records - passing the name of any record json text file
  // or wav files without record json text files.
  // The function also deals with cases when a new record filed
  // is added to the apps record field defintions and an existing
  // record json text file does not have the file by adding that
  // field in and saving the new json text file. This situation
  // can arise during development or, conceivably, when a user
  // updates their app.
  const metadata = {
    downloads: [],
    shares: [],
    csvs: []
  }
  let json
  if (!await fileExists(filename)) {
    // No json text file with this filename, so create one
    json = {}
    // Add record fields
    getFieldDefs(filename).forEach(f => {
      json[f.jsonId] = f.default
    })
    // Add metadata
    json.metadata = metadata
    // Write the file
    const jsonString = JSON.stringify(json)
    await storSaveFile(new Blob([jsonString], { type: "text/plain" }), filename)
  } else {
    const blob = await storGetFile(filename)
    json = JSON.parse(await blob.text())
    // In case property or metadata has been added to definition since this 
    // file was saved, add the property/metadata, and save it before
    // returning the json.
    if (json) {
      // Fields
      let missingProperty = false
      getFieldDefs(filename).forEach(f => {
        if (!json.hasOwnProperty(f.jsonId)){
          json[f.jsonId] = f.default
          missingProperty = true
        }
      })
      // Metadata
      if (!json.metadata) {
        json.metadata = metadata
        missingProperty = true
      } else {
        Object.keys(metadata).forEach(k => {
          if (!json.metadata[k]) {
            json.metadata[k] = metadata[k]
            missingProperty = true
          }
        })
      }
      // Write file if necessary
      if (missingProperty) {
        const jsonString = JSON.stringify(json)
        await storSaveFile(new Blob([jsonString], { type: "text/plain" }), filename)
        // Need to refetch after saving
        const blob = await storGetFile(filename)
        json = JSON.parse(await blob.text())
      }
    }
  }
  return json
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

export async function copyRecord(originalName, newName) {
  // If the wav file exists, copy it
  if (await fileExists(`${originalName}.wav`)) {
    const oWavFile = await storGetFile(`${originalName}.wav`)
    await storSaveFile(oWavFile, `${newName}.wav`)
  }
  const json = await getRecordJson(`${originalName}.txt`) 
  json['scientific-name'] = ''
  json['common-name'] = ''
  json.metadata.downloads = []
  json.metadata.shares = []
  json.metadata.csvs = []
  const jsonString = JSON.stringify(json)
  await storSaveFile(new Blob([jsonString], { type: "text/plain" }), `${newName}.txt`)
}
