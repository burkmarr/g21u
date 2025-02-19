import { el, keyValuePairTable, unorderedList, collapsibleDiv, getSs } from './common.js'
import { getCSV } from './file-handling.js'
import { checkEditStatus } from './record-details.js'

let customTaxaCsv

export async function hideTaxonMatches() {
  el('scientific-name-input-suggestions').classList.add('hide')
  if (el('common-name-input-suggestions')) {
    el('common-name-input-suggestions').classList.add('hide')
  }
}

export async function displayTaxonMatches(e) {

  const suggestionId = `${e.target.id}-suggestions`
  const scientific = e.target.id === 'scientific-name-input'

  if (this.value.trim().length === 0) {
    el(suggestionId).classList.add('hide')
    return
  }
  el(suggestionId).classList.remove('hide')

  // Get any matching custom taxa
  if (!customTaxaCsv) {
    customTaxaCsv = await getCSV('custom-taxa.csv')
  }
  let customTaxa
  if (customTaxaCsv) {
    customTaxa = customTaxaCsv.filter(t => {
      if (scientific) {
        return t.scientific.toLowerCase().includes(this.value.toLowerCase())
      } else {
        return t.common.toLowerCase().includes(this.value.toLowerCase())
      }
    }).map(t => {
      return {
        name: t.scientific,
        commonName: t.common
      }
    })
  } else {
    customTaxa = []
  }
  // Get taxa from NBN
  const nbnapi = `https://species-ws.nbnatlas.org/search/auto?q=${this.value}&limit=20`
  const ret = await fetch(nbnapi).then(data => data.json()).catch(e => Promise.resolve(null))
  let nbnTaxa
  if (ret) {
    nbnTaxa = ret.autoCompleteList.filter(t => {
      if (scientific) {
        return t.scientificNameMatches.length > 0
      } else {
        // Sometimes commonNameMatches has zero length event when commonName
        // matches the search term, so we can't just rely on t.commonNameMatches.length > 0
        return t.commonNameMatches.length > 0 || (t.commonName && t.commonName.toLowerCase().includes(this.value.toLowerCase()))
      }
    })
  } else {
    nbnTaxa = []
  }

  const allTaxa = [...customTaxa, ...nbnTaxa]
  // Create the HTML
  const html = allTaxa.map(taxon => {
    const scientificName = taxon.name
    const commonName = taxon.commonName ? taxon.commonName : ''
    return `
      <li class="taxon-list-item">
        <div>
          <span class="taxon-name scientific"><i>${scientificName}</i></span>
          <br/>
          <span class="taxon-name common">${commonName}</span>
        </div>
      </li>
    `
  }).join('')
  el(suggestionId).innerHTML = html
  const taxa = document.getElementsByClassName("taxon-list-item")
  for (let i=0; i < taxa.length; i++) {
    taxa[i].setAttribute('id', `${scientific ? 'scientific' : 'common'}-taxon-list-item-${i}`)
    taxa[i].setAttribute('tabindex', -1)
    taxa[i].addEventListener('click', taxonSelected, false)
    taxa[i].addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        taxonSelected(e)
        el(`${scientific ? 'scientific' : 'common'}-name-input`).focus()
      }
    })
  }
}

export async function taxonDetails() {

  const selectedFile = getSs('selectedFile')
  const scientific = el('scientific-name-input').value
  let noDataText
  if (!selectedFile) {
    noDataText = '- no record selected'
  } else {
    noDataText = '- no scientific name set'
  }

  el('taxa-details').innerHTML = ''

  if (scientific) {
    el('taxa-details').innerHTML = `<h3>NBN UKSI details <span class="header-note">for selected record</span></h3>`
  } else {
    el('taxa-details').innerHTML = `<h3>NBN UKSI details <span class="header-note">${noDataText}</span></h3>`
  }

  let para

  para = document.createElement('p')
  para.innerHTML = `<i>For information only - these data will not be exported to CSV.</i>`
  el('taxa-details').appendChild(para)

  para = document.createElement('p')
  para.innerHTML = `Taxonomic details from the 
      UKSI as implemented by the National Biodiversity Network.
      These details are retrieved when you select a record
      from the record list, select a taxon from an NBN taxon list
      or when you hit enter with your cursor in the scientific name field.
  `
  el('taxa-details').appendChild(para)
  
  if (!scientific) {
    return
  }
  para = document.createElement('p')
  para.innerHTML= `
    NBN taxonomy searched on the
    scientific name: <b><i>${scientific}</i></b>.
  `
  el('taxa-details').appendChild(para)

  // Get the guid for the scientific name
  const matches = await fetch(`https://species-ws.nbnatlas.org/search/auto?q=${scientific}`).then(data => data.json())
  let guid
  matches.autoCompleteList.forEach(t => {
    if (t.name === scientific) {
      guid = t.guid
    }
  })
  // Get the details for this guid
  if (guid) {
    //console.log(guid)
    const taxonomy = await fetch(`https://species-ws.nbnatlas.org/species/${guid}`).then(data => data.json())
    //console.log(taxonomy)

    // Taxonomy
    let rows = []
    rows.push({caption: 'Taxon', value: taxonomy.taxonConcept.nameFormatted})
    rows.push({caption: 'TVK', value: taxonomy.taxonConcept.guid})
    rows.push({caption: 'NBN group', value: taxonomy.taxonGroup_s})
    rows.push({caption: 'NBN count', value: taxonomy.occurrenceCounts.occurrenceCount})

    rows.push({caption: 'Kingdom', value: taxonomy.classification.kingdom})
    rows.push({caption: 'Phylum', value: taxonomy.classification.phylum})
    rows.push({caption: 'Class', value: taxonomy.classification.class})
    rows.push({caption: 'Order', value: taxonomy.classification.order})
    rows.push({caption: 'Family', value: taxonomy.classification.family})
    keyValuePairTable('nbn-taxonomy', rows, el('taxa-details'))

    // Common names
    el('taxa-details').appendChild(document.createElement('br'))
    rows = taxonomy.commonNames ? taxonomy.commonNames.map(n => n.nameString) : []
    if (rows.length) {
      const cnDiv = collapsibleDiv('common-names', 'Common names', el('taxa-details'))
      unorderedList('common-names-list', rows, cnDiv)
    } else {
      const cnDiv = document.createElement('div')
      cnDiv.innerHTML = '<b>Common names</b> - none'
      el('taxa-details').appendChild(cnDiv)
    }
    
    // Synonyms
    el('taxa-details').appendChild(document.createElement('br'))
    if (taxonomy.synonyms && taxonomy.synonyms.length) {
      const sDiv = collapsibleDiv('synonyms', 'Synonyms', el('taxa-details'))
      unorderedList('synonyms-list', taxonomy.synonyms.map(s => s.nameFormatted), sDiv)
    } else {
      const sDiv = document.createElement('div')
      sDiv.innerHTML = '<b>Synonyms</b> - none'
      el('taxa-details').appendChild(sDiv)
    }
  }
}

function taxonSelected(e) {
  const innerDiv = document.querySelector(`#${e.target.id} div`)
  e.stopPropagation()
  const scientific = innerDiv.children[0].innerText
  const common = innerDiv.children[2].innerText
  el('scientific-name-input').value = scientific
  el('common-name-input').value = common
  hideTaxonMatches()
  checkEditStatus()
  taxonDetails()
}