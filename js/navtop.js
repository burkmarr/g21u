import { downloadChecked, shareChecked, deleteChecked, csvChecked, 
  uncheckAllRecs, checkAllRecs, manageMetadataChecked, deleteSoundChecked } from './record-list.js'
import { editNavigation } from './record-details.js'
import { getSs, setSs } from './common.js'
import { bin, download, share, csv, checkAll, uncheckAll,
  edit, beetle, metadata, closeMetadata, delSound, map, chevronDown } from './svg-icons.js'

let forwardButtonChangeDialog

export function navtop () {
  const listNavs = [
    {
      id: 'delete-selected',
      fn: deleteChecked,
      icon: bin,
      type: 'edit-record'
    },
    {
      id: 'manage-metadata-selected',
      fn: manageMetadataChecked,
      icon: closeMetadata,
      type: 'edit-record',
      classes: 'v2'
    },
    {
      id: 'delete-sound-selected',
      fn: deleteSoundChecked,
      icon: delSound,
      type: 'edit-record',
      classes: 'v2'
    },
    {
      id: 'download-selected',
      fn: downloadChecked,
      icon: download,
      type: 'forward-record',
      info: 'Download checked records.'
    },
    {
      id: 'share-selected',
      fn: shareChecked,
      icon: share,
      type: 'forward-record',
      info: 'Share checked records.'
    },
    {
      id: 'csv-selected',
      fn: csvChecked,
      icon: csv,
      type: 'forward-record',
      info: 'Export checked records to CSV.',
      classes: 'v2'
    },
    {
      id: 'forward-button-change',
      fn: forwardButtonChange,
      icon: chevronDown,
      classes: 'v2 button-change'
    },
    {
      id: 'select-all',
      fn: checkAllRecs,
      icon: checkAll
    },
    {
      id: 'deselect-all',
      fn: uncheckAllRecs,
      icon: uncheckAll
    },
  ]

  const editNavs = [
    {
      id: 'edit-record',
      div: 'record-details',
      icon: edit
    },
    {
      id: 'edit-location',
      div: 'location-details',
      icon: map
    },
    {
      id: 'edit-taxa',
      div: 'taxa-details',
      icon: beetle
    },
     {
      id: 'edit-metadata',
      div: 'metadata-details',
      icon: metadata
    }
  ]

  // Note length of paths above screws up VB colouring

  const navtop = document.getElementById('navtop')
  let navContainer
  
  navContainer = document.createElement('div')
  navContainer.setAttribute('class', 'navtop-inner-container left')
  navtop.appendChild(navContainer)
  const navtopInnerLeft = document.createElement('div')
  navtopInnerLeft.setAttribute('id', 'navtop-inner-left')
  navContainer.appendChild(navtopInnerLeft)

  navContainer = document.createElement('div')
  navContainer.setAttribute('class', 'navtop-inner-container middle')
  navtop.appendChild(navContainer)
  const navtopInnerMiddle = document.createElement('div')
  navtopInnerMiddle.setAttribute('id', 'navtop-inner-middle')
  navContainer.appendChild(navtopInnerMiddle)

  navContainer = document.createElement('div')
  navContainer.setAttribute('class', 'navtop-inner-container right')
  navtop.appendChild(navContainer)
  const navtopInnerRight = document.createElement('div')
  navtopInnerRight.setAttribute('id', 'navtop-inner-right')
  navContainer.appendChild(navtopInnerRight)

  listNavs.forEach(n => {
    const div = document.createElement('div')
    div.addEventListener('click', n.fn)
    navtopInnerLeft.appendChild(div)
    let classes = 'navbar-icon'
    classes = n.classes ? `${classes} ${n.classes}` : classes
    if (n.type) {
      classes = `${classes} ${n.type}`
    }
    // TODO comment
    if (n.type === 'forward-record' ) {
      const shown = getSs('shown-forward-record') ? getSs('shown-forward-record') : 'share-selected'
      if (n.id === shown) {
        classes = `${classes} shown`
      }
    }
    div.innerHTML = `<svg id="${n.id}" viewBox="${n.icon.viewBox}" class="${classes}">${n.icon.svgEls}</svg>`

    // Add event listerner to remove flash class when animation ends
    document.getElementById(n.id).addEventListener("animationend", () => {
      document.getElementById(n.id).classList.remove("flash")
    })
  })

  editNavs.forEach(n => {
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
      const navs = document.getElementsByClassName("edit-nav")
      for (let i = 0; i < navs.length; i++) {
        navs[i].classList.remove('selected-nav')
      }
      // Add selected class to the clicked div
      div.classList.add('selected-nav')

      editNavigation()
    })
  })

  // Create dialogs for changing buttons
  forwardButtonChangeDialog = document.createElement('dialog')
  forwardButtonChangeDialog.setAttribute('id', 'forward-button-change-dialog')
  document.getElementsByTagName('body')[0].appendChild(forwardButtonChangeDialog)

  listNavs.filter(n => n.type === 'forward-record').forEach(n => {
    const div = document.createElement('div')
    div.classList.add('button-change-div')
    forwardButtonChangeDialog.appendChild(div)
      
    let classes = 'navbar-icon'
    classes = n.classes ? `${classes} ${n.classes}` : classes
    div.innerHTML = `<svg id="change-${n.id}" data-div="${n.div}" viewBox="${n.icon.viewBox}" class="${classes}">${n.icon.svgEls}</svg>`

    document.getElementById(`change-${n.id}`).addEventListener('click', forwardButtonClicked)
    const span = document.createElement('span')
    span.innerHTML = n.info
    div.appendChild(span)
  })
}

function forwardButtonChange() {
  forwardButtonChangeDialog.showModal()
}

function forwardButtonClicked(e) {
  setSs('shown-forward-record', e.target.id.substring(7))
  const fws = document.getElementsByClassName('forward-record')
  for (let i = 0; i < fws.length; i++) {
    fws[i].classList.remove('shown')
  }
  document.getElementById(e.target.id.substring(7)).classList.add('shown')
  forwardButtonChangeDialog.close()
}