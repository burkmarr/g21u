import { getFieldDefs, getOpt, getDateTime, generalMessage } from './common.js'
import { mkConfig, generateCsv, asBlob, idb } from './nl.min.js'

// Function names that start with 'stor' indicate
// functions that retrieve or write to storage and
// are all responsive to the type of storage selected.

export async function storFileExists(filename) {
  let file
  //console.log('storeFileExists', filename)
  switch(getOpt('file-handling')) {
    case 'opfs':
      const storRoot = await navigator.storage.getDirectory()
      const opfsHandle = await storRoot.getFileHandle(filename, { create: false })
        .catch( e => {Promise.resolve()})
      return typeof opfsHandle !== 'undefined'
    case 'idb':
      const file = await idb.get(filename)
      return typeof file !== 'undefined'
    case 'native':
      //console.log('storFileExists', filename)
      const dirHandle = await idb.get('native-folder')
      //console.log('dirHandle', dirHandle)
      const nativeHandle = await dirHandle.getFileHandle(filename, { create: false })
        .catch( e => {Promise.resolve()})
      return typeof nativeHandle !== 'undefined'
    default:
      // No default handler
  }
}

export async function storSaveFile(blob, name) {

  // Check if the blob is already a file and if not
  // convert it to one
  let file
  if (blob.name) {
    file = blob
  } else {
    let mimeType
    switch (name.substring(name.length-3)) {
      case 'txt':
        mimeType = 'text/plain'
        break
      case 'wav':
        mimeType = 'audio/wav'
        break
      case 'csv':
        mimeType = 'text/csv'
        break
      default:
    }
    file = new File([blob], name, {type: mimeType})
  }

  switch(getOpt('file-handling')) {
    case 'opfs':
      const storRoot = await navigator.storage.getDirectory()
      const opfsHandle = await storRoot.getFileHandle(name, {create: true})
      const opfsWritable = await opfsHandle.createWritable()
      // https://developer.mozilla.org/en-US/docs/Web/API/FileSystemWritableFileStream/write
      // May not work on iOS 
      // Writes a zero byte file on tested iPhone (could it be because mime type not correctly set? May be fixed now)
      await opfsWritable.write(file)
      await opfsWritable.close()
      break
    case 'idb':
      await idb.set(name, file)
      break
    case 'native':
      const dirHandle = await idb.get('native-folder')
      if (!dirHandle) {
        generalMessage(`
          Native file system selected but folder is not set in options.
          Specify a folder into which to save files.
        `)
      } else {
        const nativeHandle = await dirHandle.getFileHandle(name, { create: true })
        //console.log('nativeHandle', nativeHandle)
        const nativeWritable = await nativeHandle.createWritable()
        await nativeWritable.write(file)
        await nativeWritable.close()
      }
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
        await storRoot.removeEntry(file).catch(e => console.warn(`Could not delete ${file}`))
      }
      break
    case 'idb':
      await idb.delMany(files)
      break
    case 'native':
      const dirHandle = await idb.get('native-folder')
      for (const file of files) {
        await dirHandle.removeEntry(file).catch(e => console.warn(`Could not delete ${file}`))
      }
      break
    default:
      // No default handler
  }
}

export async function storGetRecs () {
  let recs = []
  const v1 = getOpt('emulate-v1') === 'true'
  switch(getOpt('file-handling')) {
    case 'opfs':
      const storRoot = await navigator.storage.getDirectory()
      const ofpsEntries = storRoot.values()
      for await (const entry of ofpsEntries) {
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
          if (!await storFileExists(`${name}.wav`)) {
            const json = await getRecordJson(`${name}.txt`)
            json.filename = name
            recs.push(json)
          }
        }
      }
      break
    case 'idb':
      const idbKeys = await idb.keys()
      for (const key of idbKeys) {
        const ext = key.substring(key.length - 4)
        const name = key.substring(0, key.length - 4)
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
          if (!await storFileExists(`${name}.wav`)) {
            const json = await getRecordJson(`${name}.txt`)
            json.filename = name
            recs.push(json)
          }
        }
      }
      break
    case 'native':
      const dirHandle = await idb.get('native-folder')
      if (!dirHandle) {
        generalMessage(`
          Native file system selected but folder is not set in options.
          Specify a folder into which to save files.
        `)
      } else {
        let checkDir = true
        const nativeEntries = dirHandle.values()
        try {
          for await (const entry of nativeEntries) {}
        } catch (e) {
          checkDir = false
          if (String(e).includes('directory could not be found')) {
            generalMessage(`
              The folder ${dirHandle.name} could not be read - check that
              it hasn't been deleted. Reset the native folder in the options.
            `)
          } else {
            generalMessage(`Unexpected error. ${e}`)
          }
        }
        if (checkDir) {
          const nativeEntries = dirHandle.values()
          for await (const entry of nativeEntries) {
            const ext = entry.name.substring(entry.name.length - 4)
            const name = entry.name.substring(0, entry.name.length - 4)
            if (ext === '.wav') {
              if (v1) {
                recs.push({filename: name})
              } else { //v2
                //console.log('get json')
                const json = await getRecordJson(`${name}.txt`)
                //console.log(json)
                json.filename = name
                recs.push(json)
              }
            } else if (!v1 && ext === '.txt') {
              // Add only if there is no corresponding wav file
              // those with wav files are added above
              if (!await storFileExists(`${name}.wav`)) {
                const json = await getRecordJson(`${name}.txt`)
                json.filename = name
                recs.push(json)
              }
            }
          }
        } 
      }
      break
    default:
      // No default handler
  }
  //console.log('return')
  return recs
}

export async function storGetFile (filename) {
  let file
  switch(getOpt('file-handling')) {
    case 'opfs':
      const storRoot = await navigator.storage.getDirectory()
      const fileHandle = await storRoot.getFileHandle(filename, { create: false })
      file = await fileHandle.getFile()
      break
    case 'idb':
      file = await idb.get(filename)
      break
    case 'native':
      const dirHandle = await idb.get('native-folder')
      const nativeHandle = await dirHandle.getFileHandle(filename, { create: false })
      file = await nativeHandle.getFile()
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
    if (await storFileExists(`${name}.wav`)) {
      const wav = await storGetFile(`${name}.wav`)
      files.push(wav)
    }
    if (await storFileExists(`${name}.txt`)) {
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
  // The function also deals with cases when a new record field
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
  if (!await storFileExists(filename)) {
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
    //console.log('created'. json)
    await storSaveFile(new Blob([jsonString], { type: "text/plain" }), filename)
  } else {
    //console.log('Does exist')
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

export async function copyRecord(originalName, newName) {
  // If the wav file exists, copy it
  if (await storFileExists(`${originalName}.wav`)) {
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
