import { getOpt, dateFromString, grChangePrecision, detailsFromFilename } from './common.js'
import { storFileExists, getCSV, getRecordJson } from './file-handling.js'

let locations
const customTemplatesCsv = await getCSV('custom-templates.csv')
const customFieldsCsv = await getCSV('custom-fields.csv')

export function getFieldDefs({
  filename = null,
  allfields = false,
  template = 'default'
} = {}) {
  // Filename can be null - only affects default values
  // for some fields.
  const filenameDetails = filename ? detailsFromFilename(filename) : null

  const fieldDefs =  [
    {
      inputId: 'recorder-name-input',
      inputType: 'text',
      inputLabel: 'Recorder',
      jsonId: 'recorder',
      iRecord: 'Recorder',
      default: getOpt('default-recorder'),
      novalue: '',
      optional: false,
      forDuplication: true,
      info: `Name of the person that made the record.`,
      templates: ['default']
    },
    {
      inputId: 'determiner-name-input',
      inputType: 'text',
      inputLabel: 'Determiner',
      jsonId: 'determiner',
      iRecord: 'Identified by',
      default: getOpt('default-determiner'),
      novalue: '',
      optional: true,
      forDuplication: true,
      info: `Name of the person who identified the taxon.`,
      templates: ['default']
    },
    {
      inputId: 'record-date-input',
      inputType: 'date',
      inputLabel: 'Record date',
      jsonId: 'date',
      iRecord: 'Date',
      default: filenameDetails ? dateFromString(filenameDetails.date) : '',
      novalue: '',
      optional: false,
      forDuplication: true,
      info: `Date on which the record was made.`,
      templates: ['all']
    },
    {
      inputId: 'record-time-input',
      inputType: 'time',
      inputLabel: 'Record time',
      jsonId: 'time',
      iRecord: null,
      default: filenameDetails ? filenameDetails.time.substring(0,5) : '00:00',
      novalue: '00:00',
      optional: true,
      forDuplication: true,
      info: `Time at which the record was made.`,
      templates: ['default']
    },
    // This is the point at which custom fields will be inserted
    {
      inputId: 'scientific-name-input',
      inputType: 'taxon',
      inputLabel: 'Scientific name',
      jsonId: 'scientific-name',
      iRecord: 'Species',
      default: '',
      novalue: '',
      optional: false,
      info: `Scientific name of the recorded taxon. Suggested names are supplied by the NBN species search API (and optionally, your own list). `,
      templates: ['default']
    },
    {
      inputId: 'common-name-input',
      inputType: 'taxon',
      inputLabel: 'Common name',
      jsonId: 'common-name',
      iRecord: null,
      default: '',
      novalue: '',
      optional: true,
      info: `Common (vernacular) name of the recorded taxon.  Suggested names are supplied by the NBN species search API (and optionally, your own list). `,
      templates: ['default']
    },
    {
      inputId: 'certainty-input',
      inputType: 'term-certainty',
      inputLabel: 'Certainty',
      jsonId: 'certaity',
      iRecord: 'Certainty',
      default: '',
      novalue: '',
      optional: true,
      info: `Certainty of taxon identification.`,
      templates: ['default']
    },
    {
      inputId: 'idref-input',
      inputType: 'text',
      inputLabel: 'ID reference',
      jsonId: 'idref',
      iRecord: 'Identification reference',
      default: '',
      novalue: '',
      optional: true,
      info: `You can use this field to indicate a reference to any identification sources used.`,
      templates: ['default']
    },
    {
      inputId: 'birdbreed-input',
      inputType: 'term-birdbreed',
      inputLabel: 'Breeding evidence (birds)',
      jsonId: 'birdbreed',
      iRecord: 'Breeding evidence',
      default: 'not recorded',
      novalue: '',
      optional: true,
      info: `Stage of recorded taxon.`,
      templates: ['default']
    },
    {
      inputId: 'stage-input',
      inputType: 'term-stage',
      inputLabel: 'Stage',
      jsonId: 'stage',
      iRecord: 'Stage',
      default: 'not recorded',
      novalue: '',
      optional: true,
      info: `Stage of recorded taxon.`,
      templates: ['default']
    },
    {
      inputId: 'sex-input',
      inputType: 'term-sex',
      inputLabel: 'Sex',
      jsonId: 'sex',
      iRecord: 'Sex',
      default: 'not recorded',
      novalue: '',
      optional: true,
      info: `Sex of recorded taxon.`,
      templates: ['default']
    },

    {
      inputId: 'quantity-input',
      inputType: 'text',
      inputLabel: 'Quantity',
      jsonId: 'quantity',
      iRecord: 'Quantity',
      default: '',
      novalue: '',
      optional: true,
      info: `The quantity of the recorded taxon. This could be a number or some other
        quantity specification such as used in the DAFOR scale, or free text.`,
      templates: ['default']
    },
    
    {
      inputId: 'obstype-input',
      inputType: 'term-obstype',
      inputLabel: 'Observation type',
      jsonId: 'obstype',
      iRecord: 'Observation Type',
      default: '',
      novalue: '',
      optional: true,
      info: `Recording method. If you are planning to import to iRecord
        and want to use a term that's not in the list, use the <i>Recording method</i>
        field instead.`,
      templates: ['default']
    },
    {
      inputId: 'method-input',
      inputType: 'text',
      inputLabel: 'Recording method',
      jsonId: 'method',
      iRecord: 'Method (free text)',
      default: '',
      novalue: '',
      optional: true,
      info: `Free text recording method. If you are planning to import to iRecord
        it is better to use a term from <i>Observation type</i> if one matches.`,
      templates: ['default']
    },
    {
      inputId: 'idtype-input',
      inputType: 'term-idtype',
      inputLabel: 'Identification type',
      jsonId: 'idtype',
      iRecord: 'Identification type',
      default: '',
      novalue: '',
      optional: true,
      info: `You can used this to provide information on whether an insect specimen was exmined.`,
      templates: ['default']
    },
    {
      inputId: 'specimen-input',
      inputType: 'term-specimen',
      inputLabel: 'Specimen retained',
      jsonId: 'specimen',
      iRecord: 'Specimen',
      default: '',
      novalue: '',
      optional: true,
      info: `You can used this to provide information on whether a specimen was retained or not.`,
      templates: ['default']
    },
    {
      inputId: 'habitat-input',
      inputType: 'text',
      inputLabel: 'Habitat',
      jsonId: 'habitat',
      iRecord: 'Habitat',
      default: '',
      novalue: '',
      optional: true,
      forDuplication: true,
      info: `Habitat in which record was made.`,
      templates: ['default']
    },
    {
      inputId: 'gridref-input',
      inputType: 'text',
      inputLabel: 'Grid reference',
      jsonId: 'gridref',
      iRecord: 'Grid ref',
      default: filenameDetails ? grChangePrecision(filenameDetails.gridref, Number(getOpt('georef-precision'))) : '',
      novalue: '',
      optional: false,
      forDuplication: true,
      info: `OSGB grid reference for record location. Either grid reference or lat/lon is required. Which is used depends
        upon your selection in the <i>File & geolocation handling</i> section.`,
      templates: ['all']
    },
    {
      inputId: 'lat-input',
      inputType: 'text',
      inputLabel: 'Latitude',
      jsonId: 'latitude',
      iRecord: 'Latitude',
      default: filenameDetails ? filenameDetails.latitude : '',
      novalue: '',
      optional: false,
      forDuplication: true,
      info: `Latitude for record location. Either grid reference or lat/lon is required. Which is used depends
        upon your selection in the <i>File & geolocation handling</i> section.`,
      templates: ['all']
    },
    {
      inputId: 'lon-input',
      inputType: 'text',
      inputLabel: 'Longitude',
      jsonId: 'longitude',
      iRecord: 'Longitude',
      default: filenameDetails ? filenameDetails.longitude : '',
      novalue: '',
      optional: false,
      forDuplication: true,
      info: `Longitude for record location. Either grid reference or lat/lon is required. Which is used depends
        upon your selection in the <i>File & geolocation handling</i> section.`,
      templates: ['all']
    },
    {
      inputId: 'location-input',
      inputType: 'term-location',
      inputLabel: 'Location name',
      jsonId: 'location',
      iRecord: 'Site name',
      default: '',
      novalue: '',
      optional: false,
      forDuplication: true,
      info: `Location name for record.`,
      templates: ['default']
    },
    {
      inputId: 'comment-input',
      inputType: 'textarea',
      inputLabel: 'Comment',
      jsonId: 'comment',
      iRecord: 'Comment',
      default: '',
      novalue: '',
      optional: true,
      forDuplication: true,
      info: `Free form comment for record.`,
      templates: ['default']
    },
  ]

  // If a custom field template is defined, then create any required custom fields
  let customFields = []
  if (customFieldsCsv) {
    customFields = customFieldsCsv.map(cf => {

      const templates = customTemplatesCsv ? customTemplatesCsv.filter(t => {
        const ids = t['custom-column-ids'].split(' ')
        return ids.find(cid => cid === cf['custom-column-id'])
      }).map(t => t.template.toLowerCase().replace(/\s+/g, '-')) : []

      return {
        inputId: `${cf['custom-column-id']}-input`,
        inputType: cf['type'] === 'term' ? `term-${cf['custom-column-id']}` : cf['type'],
        inputLabel: cf['label'],
        jsonId: cf['custom-column-id'],
        iRecord: null,
        default: cf.default ? cf.default : '',
        novalue: cf.default ? cf.default : '',
        optional: false,
        info: '',
        templates: templates
      }
    })
  }
  // Insert custom fields before scientific name field
  if (customFields.length > 0) {
    const sciNameIndex = fieldDefs.findIndex(fd => fd.jsonId === 'scientific-name') 
    fieldDefs.splice(sciNameIndex, 0, ...customFields)
  }

  //console.log ('fieldDefs', fieldDefs)
  
  // If the custom-templates.csv files exists, then enrich the fieldDefs
  // templates arrays with any templates that use the field
  if(customTemplatesCsv && customTemplatesCsv.length > 0) {
    customTemplatesCsv.forEach(t => {
      const columnIds = t['core-column-ids'].split(' ')
      fieldDefs.forEach(fd => {
        if (columnIds.find(id => id === fd.jsonId)) {
          fd.templates.push(t.template.toLowerCase().replace(/\s+/g, '-'))
        }
      })
    })
  }

  if (allfields) {
    return fieldDefs
  } else {
    return fieldDefs.filter(fd => {
      // Filter on georef format
      let ret = true
      if (getOpt('georef-format') === 'osgr') {
        // Grid reference is being used
        if (fd.inputId === 'lat-input' || fd.inputId === 'lon-input') {
          ret = false
        }
      } else {
        // Lat long is being used
        if (fd.inputId === 'gridref-input') {
          ret = false
        }
      }
      // Filter on optional fields inclusion
      const optionalIncluded = getOpt('optional-fields').split(' ')
      if (fd.optional && !getOpt('optional-fields').split(' ').includes(fd.jsonId)) {
        ret = false
      }
      // Filter on template
      if (fd.templates[0] !== 'all' && !fd.templates.includes(template)) {
        ret = false
      }
      return ret
    })
  }
}

export async function getTermList(term) {
  // term will be of format 'term-<termid>'
  const termId = term.substring(5)

  const terms = {
    stage: [
      'Adult',
      'Cocoon',
      'Dead',
      'Egg',
      'Exuvia',
      'Flowering',
      'Fruiting',
      'Gall',
      'Immature',
      'Juvenile',
      'Larva',
      'Larval case',
      'Larval web',
      'Leaf-mine',
      'Mature',
      'Mine',
      'Mine (vacated)',
      'Mixed',
      'Nest',
      'not recorded',
      'Nymph',
      'Other',
      'Pupa',
      'Seedling',
      'Spawn',
      'Tadpole',
      'Teneral',
      'Vegetative'
    ],
    sex: [
      'female',
      'male',
      'mixed',
      'not recorded'
    ],
    certainty: [
      'Certain',
      'Likely',
      'Uncertain'
    ],
    obstype: [
      'Actinic moth trap',
      'Call',
      'Caught',
      'Collected',
      'dung/droppings/frass/pellet, etc.',
      'Field identification',
      'Field record',
      'Field sighting',
      'Field sign',
      'Flying',
      'Fungal gall',
      'Insect gall',
      'Leaf mine',
      'MV light trap',
      'Nest',
      'Other',
      'Other gall',
      'pitfall trap',
      'Robinson moth trap',
      'swept',
      'trapped in Malaise trap',
      'trapped in water trap, voucher specimen',
      'voucher specimen',
      'voucher specimen, trapped (other)'
    ],
    birdbreed: [
      '00: Migration, Flying or Summering (M/F/U)',
      '01: Nesting habitat (H)',
      '02: Singing male (S)',
      '03: Pair in suitable habitat (P)',
      '04: Permanent territory (T)',
      '05: Courtship and display (D)',
      '06: Visiting probable nest site (N)',
      '07: Agitated behaviour (7)',
      '08: Brood patch on incubating adult (I)',
      '09: Nest building (B)',
      '10: Distraction display (DD)',
      '11: Used nest or eggshells (11)',
      '12: Recently fledged (FL)',
      '13: Occupied nest (ON)',
      '14: Faecal sac or food (FF)',
      '15: Nest with eggs (NE)',
      '16: Nest with young (NY)',
      'not recorded'
    ],
    idtype: [
      'Microscope',
      'Genitalia'
    ],
    specimen: [
      'No',
      'Yes'
    ]
  }

  // If a custom field template is defined, then add custom termlists
  if (customFieldsCsv) {
    customFieldsCsv.filter(cf => cf.type === 'term').forEach(cf => {
      terms[cf['custom-column-id']] = cf.data.split(',').map(t => t.trim())
    })
  }

  //console.log('terms', terms)

  if (termId === 'location') {
    // Special behaviour for location termlist
    const locFileExists = await storFileExists('custom-locations.csv')
    if (!locations && locFileExists) {
      // Get custom-locations.csv file if it exists
      // and hasn't yet been read
      const locs =  await getCSV('custom-locations.csv')
      locations = locs.map(l => l.name)
      return locations
    } else if (locations) {
      // Return locations if already read
      return locations
    } else {
      // Return empty list if no locations file
      return []
    }
  } else {
    return terms[termId]
  }
}