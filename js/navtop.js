import { downloadChecked, shareChecked, deleteChecked, csvChecked, 
  uncheckAllRecs, checkAllRecs, manageMetadataChecked, deleteSoundChecked } from './record-list.js'
import { editNavigation } from './record-details.js'
import { getSs, setSs } from './common.js'
import { bin, download, share, csv, checkAll, uncheckAll,
  edit, beetle, metadata, closeMetadata, delSound } from './svg-icons.js'

export function navtop () {
  const listNavs = [
    {
      id: 'delete-selected',
      fn: deleteChecked,
      icon: bin
    },
    {
      id: 'manage-metadata-selected',
      fn: manageMetadataChecked,
      icon: closeMetadata,
      classes: 'v2'
    },
    {
      id: 'delete-sound-selected',
      fn: deleteSoundChecked,
      icon: delSound,
      classes: 'v2'
    },
    {
      id: 'download-selected',
      fn: downloadChecked,
      icon: download
    },
    {
      id: 'share-selected',
      fn: shareChecked,
      icon: share,
    },
    {
      id: 'csv-selected',
      fn: csvChecked,
      icon: csv,
      classes: 'v2'
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
}