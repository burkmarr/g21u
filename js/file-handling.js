import { getOpt, getDateTime, generalMessage,
  createProgressBar, updateProgressBar, closeProgressBar
 } from './common.js'
import { getFieldDefs } from './fields.js'
import { mkConfig, generateCsv, asBlob, idb, csvParse } from './nl.min.js'

// Function names that start with 'stor' indicate
// functions that retrieve or write to storage and
// are all responsive to the type of storage selected.

export async function storArchiveFiles(files) {
  // Should only ever be called if file-handling is set
  // to native
  if (getOpt('file-handling') !== 'native') {
    console.error("storArchiveFiles shouln't have been called on non-native file system option")
    return
  }
  createProgressBar(files.length, "Archiving files...")
  let iCount = 0
  for (const file of files) {
    updateProgressBar(++iCount)
    const blob = await storGetFile(file)
    const dirArchiveHandle = await idb.get('archive-native-folder')
    const nativeHandle = await dirArchiveHandle.getFileHandle(file, { create: true })
    const nativeWritable = await nativeHandle.createWritable()
    await nativeWritable.write(blob)
    await nativeWritable.close()
   
    // await storDeleteFiles([file]) - avoid using here to avoid progress bar for each delete
    let dirHandle
    if (file.endsWith('.csv')) {
      dirHandle = await idb.get('csv-native-folder')
      if(!dirHandle) dirHandle = await idb.get('main-native-folder')
    } else {
      dirHandle = await idb.get('main-native-folder')
    }
    await dirHandle.removeEntry(file).catch(e => console.warn(`Could not delete ${file}: ${e}`))
  }
  closeProgressBar()
}

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
      let dirHandle
      if (filename.endsWith('.csv')) {
        dirHandle = await idb.get('csv-native-folder')
        if(!dirHandle) dirHandle = await idb.get('main-native-folder')
      } else {
        dirHandle = await idb.get('main-native-folder')
      }
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
      let dirHandle
      if (name.endsWith('.csv')) {
        dirHandle = await idb.get('csv-native-folder')
        if(!dirHandle) dirHandle = await idb.get('main-native-folder')
      } else {
        dirHandle = await idb.get('main-native-folder')
      }
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

export async function storRenameFile(oldName, newName) {
  switch(getOpt('file-handling')) {
    case 'opfs':
      const storRoot = await navigator.storage.getDirectory()
      const opfsHandle = await storRoot.getFileHandle(oldName, {create: false})
      await opfsHandle.move(newName).catch(e => console.warn(`Could not move ${oldName}: ${e}`))
      break
    case 'idb':
      const file = await idb.get(oldName)
      const newFile = new File([file], newName, { type: file.type })
      await idb.set(newName, newFile)
      await idb.del(oldName)
      break
    case 'native':
      let dirHandle
      if (oldName.endsWith('.csv')) {
        dirHandle = await idb.get('csv-native-folder')
        if(!dirHandle) dirHandle = await idb.get('main-native-folder')
      } else {
        dirHandle = await idb.get('main-native-folder')
      }
      const nativeHandle = await dirHandle.getFileHandle(oldName, { create: false })
      await nativeHandle.move(newName).catch(e => console.warn(`Could not move ${oldName}: ${e}`))
      break
    default:
      // No default handler
  }
}

export async function storDeleteFiles(files) {

  let iCount = 0

  switch(getOpt('file-handling')) {
    case 'opfs':
      createProgressBar(files.length, "Deleting files...")
      const storRoot = await navigator.storage.getDirectory()
      for (const file of files) {
        updateProgressBar(++iCount)
        await storRoot.removeEntry(file).catch(e => console.warn(`Could not delete ${file}`))
      }
      break
    case 'idb':
      createProgressBar(null, "Deleting files...")
      await idb.delMany(files)
      break
    case 'native':
      createProgressBar(files.length, "Deleting files...")
      let dirHandle
      if (files[0].endsWith('.csv')) {
        dirHandle = await idb.get('csv-native-folder')
        if(!dirHandle) dirHandle = await idb.get('main-native-folder')
      } else {
        dirHandle = await idb.get('main-native-folder')
      }
      for (const file of files) {
        updateProgressBar(++iCount)
        await dirHandle.removeEntry(file).catch(e => console.warn(`Could not delete ${file}: ${e}`))
      }
      break
    default:
      // No default handler
  }
  closeProgressBar()
}

export async function storGetRecs () {
  let recs = []
  const v1 = getOpt('emulate-v1') === 'true'
  let iCount = 0
  switch(getOpt('file-handling')) {
    case 'opfs':
      const storRoot = await navigator.storage.getDirectory()
      let ofpsEntries = storRoot.values()
      for await (const entry of ofpsEntries) {
        // No length property on interator so
        // have to iterate it to find the length
        // in order to set progress bar.
        ++iCount
      }
      createProgressBar(iCount, "Getting/updating record details...")
      ofpsEntries = storRoot.values()
      iCount=0
      for await (const entry of ofpsEntries) {
        updateProgressBar(++iCount)
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
      closeProgressBar()
      break
    case 'idb':
      const idbKeys = await idb.keys()
      createProgressBar(idbKeys.length, "Getting/updating record details...")
      for (const key of idbKeys) {
        updateProgressBar(++iCount)
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
      closeProgressBar()
      break
    case 'native':
      const dirHandle = await idb.get('main-native-folder')
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
          } else if (String(e).includes('NotAllowedError')) {
            generalMessage(`
              Permission to access the folder '${dirHandle.name}' has been lost 
              - try reselecting the folder in the options & granting permission to read and save.
            `)
          } else {
            generalMessage(`Unexpected error. ${e}`)
          }
        }
        if (checkDir) {
          let nativeEntries = dirHandle.values()
          for await (const entry of nativeEntries) {
            // No length property on interator so
            // have to iterate it to find the length
            // in order to set progress bar.
            ++iCount
          }
          createProgressBar(iCount, "Getting/updating record details...")
          nativeEntries = dirHandle.values()
          iCount=0
          for await (const entry of nativeEntries) {
            //console.log(iCount)
            updateProgressBar(++iCount)
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
          closeProgressBar()
        } 
      }
      break
    default:
      // No default handler
  }
  //console.log('return')
  return recs
}

export async function storGetCsvs() {
  let csvs = []
  switch(getOpt('file-handling')) {
    case 'opfs':
      const storRoot = await navigator.storage.getDirectory()
      const ofpsEntries = storRoot.values()
      for await (const entry of ofpsEntries) {
        const ext = entry.name.substring(entry.name.length - 4)
        if (ext === '.csv' && !entry.name.startsWith('custom-')) {
          const file = await storGetFile(entry.name)
          csvs.push(file)
        }
      }
      break
    case 'idb':
      const idbKeys = await idb.keys()
      for (const key of idbKeys) {
        const ext = key.substring(key.length - 4)
        if (ext === '.csv' && !key.startsWith('custom-')) {
          const file = await storGetFile(key)
          csvs.push(file)
        }
      }
      break
    case 'native':
      let dirHandle = await idb.get('csv-native-folder')
      if (!dirHandle) dirHandle = await idb.get('main-native-folder')

      if (!dirHandle) {
        generalMessage(`
          Native file system selected but folder is not set in options.
          Specify a folder into which to save CSV files (otherwise set main folder).
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
          } else if (String(e).includes('NotAllowedError')) {
            generalMessage(`
              Permission to access the folder '${dirHandle.name}' has been lost 
              - try reselecting the folder in the options & granting permission to read and save.
            `)
          } else {
            generalMessage(`Unexpected error. ${e}`)
          }
        }
        if (checkDir) {
          const nativeEntries = dirHandle.values()
          for await (const entry of nativeEntries) {
            const ext = entry.name.substring(entry.name.length - 4)
            if (ext === '.csv' && !entry.name.startsWith('custom-') ) {
              const file = await storGetFile(entry.name)
              csvs.push(file)
            }
          }
        } 
      }
      break
    default:
      // No default handler
  }
  return csvs
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
      let dirHandle
      if (filename.endsWith('.csv')) {
        dirHandle = await idb.get('csv-native-folder')
        if(!dirHandle) dirHandle = await idb.get('main-native-folder')
      } else {
        dirHandle = await idb.get('main-native-folder')
      }
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
  // if (filename.endsWith('.txt')) {
  //   const json = await getRecordJson(filename)
  //   json.metadata.downloads.push(getDateTime(true))
  //   // Write the file
  //   const jsonString = JSON.stringify(json)
  //   await storSaveFile(new Blob([jsonString], { type: "text/plain" }), filename)
  // }
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

export async function shareCsvs(csvs) {
  const files = []
  for (let i=0; i<csvs.length; i++) {
    if (await storFileExists(csvs[i])) {
      const csv = await storGetFile(csvs[i])
      files.push(csv)
    }
  }
  // Attempt the share
  const share = await shareApi(files)
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

export async function mergeCsvs(files, name) {

  createProgressBar(null, 'Merging CSV files...')
  //const csvs = files.map(f => getCSV(f))
  let csvRecs = []
  for (let i=0; i<files.length; i++) {
    const csv = await getCSV(files[i])
    csvRecs = [...csvRecs, ...csv]
  }

  const columnHeaders = getFieldDefs({allfields: true}).filter(f => {
    const fld = f.iRecord ? f.iRecord : f.inputLabel
    const include = csvRecs.some(r => r[fld])
    return include
  }).map(f => {
    return f.iRecord ? f.iRecord : f.inputLabel
  })

  const csvConfig = mkConfig({ 
    columnHeaders: columnHeaders
  })
  const csv = generateCsv(csvConfig)(csvRecs)
  const blob = asBlob(csvConfig)(csv)
  await storSaveFile(blob, name)
  closeProgressBar()
}

export async function recsToCsv(recs) {

  createProgressBar(recs.length, "Creating CSV from records...")

  const csvRecs = []
  const formattedDateTime = getDateTime(true)
  const unformattedDateTime = getDateTime()
  for (let i=0; i<recs.length; i++) {
    updateProgressBar(i+1)
    const name = recs[i]
    const json = await getRecordJson(`${name}.txt`)
    // Copy the record json object minus the metadata
    // Only copy those fields that are being used by
    // the user.
    // Replace the field names (property keys) with the iRecord
    // name if it exists, otherwise the caption name.
    const cjson = {}
    getFieldDefs().forEach(f => {
      const fldName = f.iRecord ? f.iRecord : f.inputLabel
      cjson[fldName] = json[f.jsonId] ? json[f.jsonId] : ''
    })
    // Push the new json into array that will make the CSV
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
  const newName = `g21-recs-${unformattedDateTime}.csv`
  await storSaveFile(blob, newName)

  closeProgressBar()

  return newName
}

export async function appendRecsToCsv(recs, csvFile) {
  console.log('append', recs, csvFile)

  // Create a temporary CSV from recs
  // Merge with selected CSV
  // 
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
    getFieldDefs({filename: filename}).forEach(f => {
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
      getFieldDefs({filename: filename}).forEach(f => {
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

export async function getCSV(filename) {
  let csv
  if (await storFileExists(filename)) {
    const blob = await storGetFile(filename)
    csv = csvParse(await blob.text())
    //console.log('Custom file found')
  } else {
    //console.log('Custom file does not exist:', filename)
  }
  return csv
}

export async function copyRecord(originalName, newName, all) {

  // If the wav file exists, copy it
  if (await storFileExists(`${originalName}.wav`)) {
    const oWavFile = await storGetFile(`${originalName}.wav`)
    await storSaveFile(oWavFile, `${newName}.wav`)
  }
  const json = await getRecordJson(`${originalName}.txt`)
  // Reset any fields which are not for duplication
  // unless the all flag is set, in which case only reset
  // taxonomy fields.
  getFieldDefs().filter(f => !f.forDuplication).forEach(f => {
    if (!all) {
      json[f.jsonId] = f.default
    } else if (f.inputType === 'taxon') {
      json[f.jsonId] = ''
    }
  })
  // Clear metadata
  json.metadata.downloads = []
  json.metadata.shares = []
  json.metadata.csvs = []
  const jsonString = JSON.stringify(json)
  await storSaveFile(new Blob([jsonString], { type: "text/plain" }), `${newName}.txt`)
}

export async function browseNativeFolder() {
  try {
    const directoryHandle = await window.showDirectoryPicker()

    let granted = false
    if (await directoryHandle.queryPermission({mode: 'readwrite'}) === 'granted') {
      granted =  true
    }
    if (!granted) {
      // Request permission
      if (await directoryHandle.requestPermission({mode: 'readwrite'}) === 'granted') {
        granted =  true
      }
      if (!granted) {
        generalMessage(`You must grant read & write access to the folder you select.`)
      }
    }
    if (granted) {
      return directoryHandle
    } else {
      return null
    }
  } catch (error) {
    // Will get here if the open folder dialog is cancelled by user, so do nothing
    return null
  }
}