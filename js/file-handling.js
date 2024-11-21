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

export async function opfsSaveFile(blob, name) {
  const opfsRoot = await navigator.storage.getDirectory()
  const fileHandle = await opfsRoot.getFileHandle(name, {create: true})
  const writable = await fileHandle.createWritable()
  // https://developer.mozilla.org/en-US/docs/Web/API/FileSystemWritableFileStream/write
  // May not work on iOS 
  // Writes a zero byte file on tested iPhone
  await writable.write(blob)
  await writable.close()
}

export async function opfsDeleteFiles(names) {
  const opfsRoot = await navigator.storage.getDirectory()
  for (const name of names) {
    await opfsRoot.removeEntry(name)
  }
}

export async function opfsGetWavFiles () {
  const opfsRoot = await navigator.storage.getDirectory()
  const entries = opfsRoot.values()
  const files = []
  for await (const entry of entries) {
    if (entry.name.endsWith('.wav')) {
      const existingFileHandle = await opfsRoot.getFileHandle(entry.name)
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

export async function opfsGetFile (filename) {
  const opfsRoot = await navigator.storage.getDirectory()

  const fileHandle = await opfsRoot.getFileHandle(filename, { create: false })
    .catch( error => {
      Promise.resolve(null)
    })
  if (!fileHandle) {
    return null
  }
  const file = await fileHandle.getFile()
  return file
}