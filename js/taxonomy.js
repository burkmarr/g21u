import { el, keyValuePairTable, unorderedList, collapsibleDiv } from './common.js'
import { highlightFields } from './record-details.js'

export async function hideTaxonMatches() {
  el('taxon-suggestions').classList.add('hide')
}

export async function displayTaxonMatches() {
  el('taxon-suggestions').classList.remove('hide')

  const nbnapi = `https://species-ws.nbnatlas.org/search/auto?q=${this.value}&limit=20`
  const data = await fetch(nbnapi).then(data => data.json())
  //console.log(data)
  const html = data.autoCompleteList.map(taxon => {
    const scientificName = taxon.name
    const commonName = taxon.commonName ? taxon.commonName : ''
    return `
      <li>
        <div class="taxon-list-item">
          <span class="taxon-name scientific"><i>${scientificName}</i></span>
          <br/>
          <span class="taxon-name common">${commonName}</span>
        </div>
      </li>
    `
  }).join('')
  el('taxon-suggestions').innerHTML = html
  const taxa = document.getElementsByClassName("taxon-list-item")
  for (let i=0; i < taxa.length; i++) {
    taxa[i].addEventListener('click', taxonSelected, false)
  }
}

export async function taxonDetails() {

  const scientific = el('scientific-name-input').value

  const fd = el('taxa-details').innerHTML = `
    <h3>NBN UKSI details</h3>
    <p>
      Taxonomic details from the 
      UKSI as implemented by the National Biodiversity Network.
      These details are retrieved when you first click in 
      the scientific or common name fields, hit enter in them
      or select a taxon from the taxon list. 
      NBN taxonomy searched on the
      scientific name: <b><i>${scientific}</i></b>.
    </p>
  `

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
  e.stopPropagation()
  const scientific = e.target.children[0].innerText
  const common = e.target.children[2].innerText
  el('scientific-name-input').value = scientific
  el('common-name-input').value = common
  highlightFields()
  taxonDetails()
}