import { downloadChecked, shareChecked, deleteChecked, csvChecked, 
  uncheckAllRecs, checkAllRecs, manageMetadataChecked, deleteSoundChecked, copyValuesChecked } from './record-list.js'
import { editNavigation } from './record-details.js'
import { deleteCheckedCsv, shareCheckedCsv, mergeCheckedCsv, checkAllCsvs, uncheckAllCsvs } from './csv.js'
import { getSs, setSs, getOpt } from './common.js'
import { bin, download, share, csv, checkAll, uncheckAll,
  edit, beetle, metadata, closeMetadata, delSound, map, chevronDown, 
  copy, chevronCollapse } from './svg-icons.js'

let groupButtonChangeDialog

export function navtop (page) {

  const navs = [
    {
      id: 'delete-selected',
      fn: deleteChecked,
      icon: bin,
      page: 'manage',
      group: 'edit-record',
      section: 'left',
      info: 'Delete checked records'
    },
    {
      id: 'manage-metadata-selected',
      fn: manageMetadataChecked,
      icon: closeMetadata,
      page: 'manage',
      group: 'edit-record',
      section: 'left',
      classes: 'v2',
      info: 'Manage metadata of checked records.'
    },
    {
      id: 'delete-sound-selected',
      fn: deleteSoundChecked,
      icon: delSound,
      page: 'manage',
      group: 'edit-record',
      section: 'left',
      classes: 'v2',
      info: 'Delete sound files associated with checked records.'
    },
    {
      id: 'copy-values-selected',
      fn: copyValuesChecked,
      icon: copy,
      page: 'manage',
      group: 'edit-record',
      section: 'left',
      classes: 'v2',
      info: 'Copy field values from selected record to checked records.'
    },
    {
      id: 'download-selected',
      fn: downloadChecked,
      icon: download,
      page: 'manage',
      group: 'forward-record',
      section: 'left',
      info: 'Download checked records.'
    },
    {
      id: 'share-selected',
      fn: shareChecked,
      icon: share,
      page: 'manage',
      group: 'forward-record',
      section: 'left',
      info: 'Share checked records.'
    },
    {
      id: 'csv-selected',
      fn: csvChecked,
      icon: csv,
      page: 'manage',
      group: 'forward-record',
      section: 'left',
      info: 'Export checked records to CSV.',
      classes: 'v2'
    },
    {
      id: 'select-all',
      fn: checkAllRecs,
      icon: checkAll,
      page: 'manage',
      section: 'left'
    },
    {
      id: 'deselect-all',
      fn: uncheckAllRecs,
      icon: uncheckAll,
      page: 'manage',
      section: 'left'
    },
    {
      id: 'edit-record',
      div: 'record-details',
      icon: edit,
      page: 'manage',
      section: 'right'
    },
    {
      id: 'edit-location',
      div: 'location-details',
      icon: map,
      page: 'manage',
      section: 'right'
    },
    {
      id: 'edit-taxa',
      div: 'taxa-details',
      icon: beetle,
      page: 'manage',
      section: 'right'
    },
    {
      id: 'edit-metadata',
      div: 'metadata-details',
      icon: metadata,
      page: 'manage',
      section: 'right'
    },
    {
      id: 'delete-csv-selected',
      fn: deleteCheckedCsv,
      icon: bin,
      page: 'csv',
      section: 'left'
    },
    {
      id: 'share-csv-selected',
      fn: shareCheckedCsv,
      icon: share,
      page: 'csv',
      section: 'left'
    },
    {
      id: 'merge-csv-selected',
      fn: mergeCheckedCsv,
      icon: chevronCollapse,
      page: 'csv',
      section: 'left'
    },
    {
      id: 'select-all-csv',
      fn: checkAllCsvs,
      icon: checkAll,
      page: 'csv',
      section: 'left'
    },
    {
      id: 'deselect-all-csv',
      fn: uncheckAllCsvs,
      icon: uncheckAll,
      page: 'csv',
      section: 'left'
    },

  ]

  const navtop = document.getElementById('navtop')
  let navContainer

  // Create the three potential navbar groups within
  // the main top navbar for the three sections of the
  // display on full screens
  // Left
  navContainer = document.createElement('div')
  navContainer.setAttribute('class', `navtop-inner-container left`)
  navtop.appendChild(navContainer)
  const navtopInnerLeft = document.createElement('div')
  navtopInnerLeft.setAttribute('id', 'navtop-inner-left')
  navtopInnerLeft.classList.add(page)
  navContainer.appendChild(navtopInnerLeft)
  // Middle
  navContainer = document.createElement('div')
  navContainer.setAttribute('class', 'navtop-inner-container middle')
  navtop.appendChild(navContainer)
  const navtopInnerMiddle = document.createElement('div')
  navtopInnerMiddle.setAttribute('id', 'navtop-inner-middle')
  navContainer.appendChild(navtopInnerMiddle)
  // Right
  navContainer = document.createElement('div')
  navContainer.setAttribute('class', 'navtop-inner-container right')
  navtop.appendChild(navContainer)
  const navtopInnerRight = document.createElement('div')
  navtopInnerRight.setAttribute('id', 'navtop-inner-right')
  navContainer.appendChild(navtopInnerRight)

  // Create the left section navigation buttons 
  const buttonGroupsLeft =  navs.filter(n => n.page === page).reduce((g, n) => {
    if(n.section === 'left' && !g.includes(n.group)) {
      g.push(n.group)
    }
    return g
  }, [])

  const v1 = getOpt('emulate-v1') === 'true'
  buttonGroupsLeft.forEach(g => {
    navs.filter(n => n.page === page).filter(n => n.section === 'left' && n.group === g).forEach(n => {

      const div = document.createElement('div')
      div.addEventListener('click', n.fn)
      navtopInnerLeft.appendChild(div)
      let classes = 'navbar-icon'
      classes = n.classes ? `${classes} ${n.classes}` : classes
      // If this button is part of a group, then hide it unless
      // it is the currently 'selected' button of the group.
      // Also add group name as a class.
      if (g) {
        classes = `${classes} ${g}`
        const shown = getSs(`shown-${g}`)
        if (n.id !== shown && !v1) { // If v1 emulation, leave show/hide to CSS
          classes = `${classes} hide`
        }
      }
      // Create the button
      div.innerHTML = `<svg id="${n.id}" viewBox="${n.icon.viewBox}" class="${classes}">${n.icon.svgEls}</svg>`
      // Add event listerner to remove flash class when animation ends
      document.getElementById(n.id).addEventListener("animationend", () => {
        document.getElementById(n.id).classList.remove("flash")
      })
    })
    // If the button is part of a group (g is not undefined)
    // then create the group switch button
    if (g && !v1){
      // Not required for v1 emulation
      const div = document.createElement('div')
      navtopInnerLeft.appendChild(div)
      div.innerHTML = `<svg id="${g}-button-change" viewBox="${chevronDown.viewBox}" class="navbar-icon button-change">${chevronDown.svgEls}</svg>`
      document.getElementById(`${g}-button-change`).addEventListener('click', groupButtonChange)
    }
  })

  // Create the right section navigation buttons
  navs.filter(n => n.page === page).filter(n => n.section === 'right').forEach(n => {
    const div = document.createElement('div')
    div.classList.add('edit-nav')
    if(n.id === getSs('topNav')) {
      div.classList.add('selected-nav')
    }
    navtopInnerRight.appendChild(div)
    // Class built dynamically because they can be added
    // both by navigation item
    let classes = 'navbar-icon'
    classes = n.classes ? `${classes} ${n.classes}` : classes
    div.innerHTML = `<svg id="${n.id}" data-div="${n.div}" viewBox="${n.icon.viewBox}" class="${classes}">${n.icon.svgEls}</svg>`

    // Handle highlighting of clicked div
    div.addEventListener('click', function(e){
      setSs('topNav', e.target.id)
      // Take selected class off all divs
      const allNavs = document.getElementsByClassName("edit-nav")
      for (let i = 0; i < allNavs.length; i++) {
        allNavs[i].classList.remove('selected-nav')
      }
      // Add selected class to the clicked div
      div.classList.add('selected-nav')

      editNavigation()
    })
  })

  // Create dialogs for changing buttons in button groups
  groupButtonChangeDialog = document.createElement('dialog')
  groupButtonChangeDialog.setAttribute('id', 'group-button-change-dialog')
  document.getElementsByTagName('body')[0].appendChild(groupButtonChangeDialog)

  buttonGroupsLeft.filter(g => g).forEach(g => {
    navs.filter(n => n.section === 'left').filter(n => n.group === g).forEach(n => {
      const div = document.createElement('div')
      div.setAttribute('id', `change-${n.id}`)
      div.setAttribute('data-group', g)
      div.classList.add('button-change-div')
      div.classList.add(`button-group-${g}`)
      div.addEventListener('click', groupButtonSelected)
      groupButtonChangeDialog.appendChild(div)
        
      let classes = `navbar-icon`
      classes = n.classes ? `${classes} ${n.classes}` : classes
      div.innerHTML = `<svg viewBox="${n.icon.viewBox}" class="${classes}">${n.icon.svgEls}</svg>`
  
      const span = document.createElement('span')
      span.innerHTML = n.info
      div.appendChild(span)
    })
  })
}

function groupButtonChange(e) {
  // Remove the '-button-change' suffix from target id to
  // get group name.
  const group = e.target.id.substring(0, e.target.id.length - 14)

  const allDivs = document.getElementsByClassName('button-change-div')
  for (let i=0; i<allDivs.length; i++) {
    allDivs[i].classList.add('hide')
  }
  const groupDivs = document.getElementsByClassName(`button-group-${group}`)
  for (let i=0; i<groupDivs.length; i++) {
    groupDivs[i].classList.remove('hide')
  }
  groupButtonChangeDialog.showModal()
}

function groupButtonSelected(e) {
  // Remove the 'change-' prefix from target id to
  // get the name of the chosen button.
  const chosen = e.target.id.substring(7)
  const group = e.target.getAttribute('data-group')
  setSs(`shown-${group}`, chosen)

  const grpButtons = document.getElementsByClassName(group)
  for (let i = 0; i < grpButtons.length; i++) {
    grpButtons[i].classList.add('hide')
  }
  document.getElementById(chosen).classList.remove('hide')

  groupButtonChangeDialog.close()
}