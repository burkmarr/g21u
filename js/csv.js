import { storGetCsvs, storFileExists, storDeleteFiles, storArchiveFiles, getCSV, shareCsvs, mergeCsvs, downloadFile, storRenameFile } from './file-handling.js'
import { el, getSs, setSs, keyValuePairTable, generalMessage, getDateTime, flash, deleteConfirm, dateParse } from './common.js'
import { getFieldDefs } from './fields.js'
import { csv } from './svg-icons.js'

let storCsvs, selectedCsvRecs

export async function initialiseCsvList () {

  // Get the currently checked items in order to re-check them
  const currentlyChecked = []
  if (storCsvs) {
    for (let i=0; i<storCsvs.length; i++) {
      if (el(`csv-checkbox-${i}`).checked) {
        currentlyChecked.push(i)
      }
    }
  }
  // Now re-fetch storCsvs
  storCsvs = await storGetCsvs()
  //console.log('storCsvs', storCsvs)
  if (!storCsvs.length) {
    el('csv-list').innerHTML = `<h3>No CSVs to display</h3>`
    setSs('selectedCsv', '')
    selectedCsvRecs = null
    csvDetails()
    csvRecDetails()
    return
  }
  // storCsvs = storCsvs.sort((a,b) => {
  //   // Sort on date first and then time
  //   let comparison = 0
  //   if (a.date > b.date) {
  //     comparison = -1
  //   } else if (a.date < b.date) {
  //     comparison = 1
  //   }
  //   if (comparison === 0) {
  //     if (a.time > b.time) {
  //       comparison = -1
  //     } else if (a.time < b.time) {
  //       comparison = 1
  //     } 
  //   }
  //   return comparison
  // })

  console.log(storCsvs)
  storCsvs = storCsvs.sort((a,b) => {
    // Sort on name
    let comparison = 0
    if (a.name > b.name) {
      comparison = 1
    } else if (a.name < b.name) {
      comparison = -1
    }
    return comparison
  })

  // If the currently selected csv indicated by
  // session storage is no longer present, then
  // reset it to the first record.
  if (!storCsvs.find(f => f.name === getSs('selectedCsv'))) {
    setSs('selectedCsv', storCsvs[0].name)
  }

  // Populate with files from storage
  el('csv-list').innerHTML = ''

  for (let i=0; i<storCsvs.length; i++) {
    const name = storCsvs[i].name
    // Create div
    const csvDiv = document.createElement('div')
    csvDiv.setAttribute('id', `csv-div-${i}`)
    csvDiv.setAttribute('data-csv-name', name) 
    csvDiv.classList.add('csv-div')
    csvDiv.addEventListener('click', csvSelected)
    if (name === getSs('selectedCsv')) {
      csvDiv.classList.add('csv-selected')
    }
    // Logo
    const logoDiv = document.createElement('div')
    logoDiv.innerHTML = `<svg viewBox="${csv.viewBox}" class="csv-list-icon">${csv.svgEls}</svg>`
    csvDiv.appendChild(logoDiv)
    
    // Text
    const textDiv = document.createElement('div')
    textDiv.setAttribute('id', `csv-text-${name}`)
    textDiv.classList.add('csv-div-text')
    textDiv.innerHTML = name
    csvDiv.appendChild(textDiv)

    // Select checkbox
    const check = document.createElement('input')
    check.setAttribute('type', 'checkbox')
    check.setAttribute('id', `csv-checkbox-${i}`)
    if (currentlyChecked.includes(i)) {
      check.setAttribute('checked', 'checked')
    }
    check.classList.add('csv-checkbox')
    check.addEventListener('click', csvChecked)
    csvDiv.appendChild(check)

    el('csv-list').appendChild(csvDiv)
  }

  csvDetails()
  csvRecDetails()
}

export async function csvDetails () {
  const selectedCsv = getSs('selectedCsv')

  const parent = el('csv-details')
  parent.innerHTML = ''

  const title = document.createElement('h3')
  parent.appendChild(title)

  if (!selectedCsv) {
    title.innerHTML = 'CSV details <span class="header-note">- no CSV selected</span>'
    return
  } else {
    title.innerHTML = 'CSV details <span class="header-note">for selected CSV</span>'
  }

  // Get the selected file and parse it
  selectedCsvRecs = await getCSV(selectedCsv)

  // Rename CSV file input
  parent.innerHTML = `${parent.innerHTML}
    <div id ="csv-details-rename-div">
      <input type="text" id="csv-details-rename-input">
      <button id="csv-details-rename-button">Rename</button>
    </div>
    <p id="csv-details-rename-warning"></p>
  `
  el('csv-details-rename-button').addEventListener('click', renameCsv)
  el('csv-details-rename-input').value = selectedCsv

  // CSV summary info
  const earliest = selectedCsvRecs.reduce((a,r) => {return a ? dateParse(r.Date) < dateParse(a) ? r.Date : a : r.Date}, null)
  const latest = selectedCsvRecs.reduce((a,r) => {return a ? dateParse(r.Date) > dateParse(a) ? r.Date : a : r.Date}, null)

  const osgr = selectedCsvRecs.some(r => r['Grid ref'])
  const latlon = selectedCsvRecs.some(r => r['Latitude'])
  const georef = osgr && latlon ? 'Mixed (OSGR & Lat/Lon)' : osgr ? 'OSGR' : 'Lat/Lon'

  const summary = document.createElement('div')
  summary.setAttribute('id', 'csv-summary')
  summary.innerHTML = `
    <b>Records</b>: ${selectedCsvRecs.length}<br/>
    <b>Earliest</b>: ${earliest}<br/>
    <b>Latest</b>: ${latest}<br/>
    <b>Georef</b>: ${georef}
  `
  parent.appendChild(summary)


  //console.log(selectedCsvRecs)
  selectedCsvRecs.forEach((r,i) => {
    const rec =  document.createElement('div')

    // Create div
    const csvRecDiv = document.createElement('div')
    csvRecDiv.setAttribute('id', `csv-rec-div-${i}`)
    csvRecDiv.setAttribute('data-index', i) 
    csvRecDiv.classList.add('csv-rec-div')
    csvRecDiv.addEventListener('click', csvRecSelected)
    // Text
    let txt = addText('', r['Species'])
    if (r['Grid ref']) {
      txt = addText(txt, r['Grid ref'])
    } else {
      txt = addText(txt, `${r['Latitude']}/${r['Longitude']}`)
    }
    txt = addText(txt, r['Site name'])
    txt = addText(txt, r['Date'])
    const textDiv = document.createElement('div')
    textDiv.setAttribute('id', `csv-rec-text-${i}`)
    textDiv.classList.add('csv-rec-div-text')
    textDiv.innerHTML = txt
    csvRecDiv.appendChild(textDiv)
    parent.appendChild(csvRecDiv)
  })

  csvRecDetails()

  function addText(txt, val) {
    if (!val) {
      return txt
    } else if (txt) {
      return `${txt}<br/>${val}`
    } else {
      return val
    }
  }
}

function csvRecDetails() {
 
  let selectedCsvRec = document.getElementsByClassName("csv-rec-selected")
  if(selectedCsvRec.length) {
    selectedCsvRec = selectedCsvRec[0]
  } else {
    selectedCsvRec = null
  }

  const parent = el('record-details')
  parent.innerHTML = ''

  const title = document.createElement('h3')
  parent.appendChild(title)

  if (!selectedCsvRec) {
    title.innerHTML = 'Record details <span class="header-note">- no record selected</span>'
    return
  } else {
    title.innerHTML = 'Record details <span class="header-note">for selected record</span>'
  }

  console.log(selectedCsvRec)
  const recIndex = Number(selectedCsvRec.getAttribute('data-index'))
  const record = selectedCsvRecs[recIndex]

  const rows = []
  Object.keys(record).forEach(k => {
    rows.push({
      caption: k,
      value: record[k]
    })
  })
  keyValuePairTable('rec-details', rows, parent)
}

function csvSelected(e) {
  const currentSelected = document.getElementsByClassName("csv-selected")
  if(currentSelected[0].getAttribute('data-csv-name') !== e.target.getAttribute('data-csv-name')) {
    currentSelected[0].classList.remove("csv-selected")
    e.target.classList.add("csv-selected")
    setSs( 'selectedCsv', e.target.getAttribute('data-csv-name'))

    csvDetails()
  }
}

function csvRecSelected(e) {
  const currentSelected = document.getElementsByClassName("csv-rec-selected")
  if(!currentSelected.length || currentSelected[0].getAttribute('data-index') !== e.target.getAttribute('data-index')) {
    if (currentSelected.length) {
      currentSelected[0].classList.remove("csv-rec-selected")
    }
    e.target.classList.add("csv-rec-selected")
    csvRecDetails()
  }
}

function csvChecked(e) {
  e.stopPropagation()
}

export async function deleteCheckedCsv(e) {
  flash(e.target.id)
  const n =  storCsvs.reduce((a,r,i) => el(`csv-checkbox-${i}`).checked ? a+1 : a, 0)
  if (n) {
    deleteConfirm({
      confirmButText: 'Yes',
      cancelButText: 'No',
      confirmMsgHtml: `Are you sure that you want to <i><span id="delete-archive-csvs">archive<span></i> ${n} CSV file${n>1 ? 's' : ''}?`,
      archiveNotPossible: () => {
        el('delete-archive-csvs').innerText = 'delete'
      },
      checkBoxClickFn: (e) => {
        el('delete-archive-csvs').innerText = e.target.checked ? 'delete' : 'archive'
      },
      confirmRejectFn: async (e) => {
        if (e.target.getAttribute('id') === 'delete-confirm') {
          const files = []
          for (let i=0; i<storCsvs.length; i++) {
            const name = storCsvs[i].name
            if (document.getElementById(`csv-checkbox-${i}`).checked) {
              if (await storFileExists(name)) {
                files.push(name)
              }
              // Uncheck all checkboxes when deleting otherwise wrong items reselected.
              document.getElementById(`csv-checkbox-${i}`).checked = false
            }
          }
          if (el('delete-confirm-checkbox').checked) {
            await storDeleteFiles(files)
          } else {
            await storArchiveFiles(files)
          }
          await initialiseCsvList()
        }
      },
    })
  }
}

export function mergeCheckedCsv (e) {
  flash(e.target.id)

  const n =  storCsvs.reduce((a,r,i) => document.getElementById(`csv-checkbox-${i}`).checked ? a+1 : a, 0)
  if (n > 1) {
    let sel = el('radio-merge-name-select')
    sel.innerHTML='<option value="new">Auto-generate new name</option>'
    storCsvs.forEach((f,i) => {
      if (document.getElementById(`csv-checkbox-${i}`).checked) {
        const opt = document.createElement('option')
        opt.setAttribute('value', f.name)
        opt.innerText = f.name
        sel.appendChild(opt)
      }
    })
    document.getElementById('merge-file-num').innerText = n
    document.getElementById('merge-csv-confirm-dialog').showModal()
  }
}

export async function mergeCsvYesNo (e) {
  document.getElementById('merge-csv-confirm-dialog').close()
  if (e.target.getAttribute('id') === 'merge-confirm') {
    const files = []
    for (let i=0; i<storCsvs.length; i++) {
      const name = storCsvs[i].name
      if (document.getElementById(`csv-checkbox-${i}`).checked) {
        if (await storFileExists(name)) {
          files.push(name)
        }
        // Uncheck all checkboxes when deleting otherwise wrong items
        // reselected.
        document.getElementById(`csv-checkbox-${i}`).checked = false
      }
    }
    let filename = `g21-recs-${getDateTime()}.csv`
    await mergeCsvs(files, filename)
    await storDeleteFiles(files)
    if (el('radio-merge-name-select').value !== 'new') {
      await storRenameFile(filename, el('radio-merge-name-select').value)
    }
    initialiseCsvList()
  }
} 

export async function shareCheckedCsv (e) {
  flash(e.target.id)
  
  const n =  storCsvs.reduce((a,r,i) => document.getElementById(`csv-checkbox-${i}`).checked ? a+1 : a, 0)
  if (n) {
    const csvs = []
    for (let i=0; i<storCsvs.length; i++) {
      const name = storCsvs[i].name
      if (document.getElementById(`csv-checkbox-${i}`).checked) { 
        csvs.push(name)
      }
    }
    const share = await shareCsvs(csvs)
    console.log(share)
    if (share === 'success') {
      // Do nothing
    } else if (share.startsWith('error')) {
      if (!share.includes('AbortError')) {
        // For browsers that can detect when user aborts share
        generalMessage(`
          <p>The share failed. The most likely reason is that you exceeded the 
          number of files that can be shared at once by your browser. 
          Try sharing in smaller batches.</p>
          <p style="font-size: 0.8em">(Reported error was: ${share})</p>.
        `)  
        }
    } else {
      // Share not supported by browser
      generalMessage(`
        <p>This browser does not support the web share API. 
        Consider using a browser that does, e.g. Chrome.</p>
        <p style="font-size: 0.8em">(Reported browser is: ${navigator.userAgent})</p>.
      `)
    }
  }
}

export async function downloadCsvChecked(e) {
  flash(e.target.id)
  const n =  storCsvs.reduce((a,r,i) => document.getElementById(`csv-checkbox-${i}`).checked ? a+1 : a, 0)
  if (n) {
    const promises = []
    for (let i=0; i<storCsvs.length; i++) {
      const name = storCsvs[i].name
      if (document.getElementById(`csv-checkbox-${i}`).checked) {
        // Download CSV if it exists
        if (await storFileExists(name)) {
          promises.push(downloadFile(name))
        }
      }
    }
    await Promise.all(promises)
  }
}

export function checkAllCsvs (e) {
  flash(e.target.id)
  const checkboxes = document.getElementsByClassName('csv-checkbox')
  for(let i=0, n=checkboxes.length;i<n;i++) {
    checkboxes[i].checked = true
  }
}

export function uncheckAllCsvs (e) {
  flash(e.target.id)
  const checkboxes = document.getElementsByClassName('csv-checkbox')
  for(let i=0, n=checkboxes.length;i<n;i++) {
    checkboxes[i].checked = false
  }
}

async function renameCsv() {
  const selectedCsv = getSs('selectedCsv')
  const newName = el("csv-details-rename-input").value

  if (await storFileExists(newName)) {
    el("csv-details-rename-warning").innerText = `A file with the name "${newName}" already exists.`
  } else {
    el("csv-details-rename-warning").innerText = ''
    await storRenameFile(selectedCsv, newName)
    setSs('selectedCsv', newName)
    initialiseCsvList()
  }
}

export function rightNavCsv() {
  const divId = `${getSs('topNav').substring(4)}`

  // Get all elements with class="details-div" and hide them
  const detailsDiv = document.getElementsByClassName("csv-panel-div")
  for (let i = 0; i < detailsDiv.length; i++) {
    detailsDiv[i].classList.add('hide')
  }
  // Show the current contents div
  if (document.getElementById(divId)) {
    document.getElementById(divId).classList.remove('hide')
  } else {
    // Default
    document.getElementById('csv-details').classList.remove('hide')
    document.getElementById('csv-csv-details').parentElement.classList.add('selected-nav')
  }
}
