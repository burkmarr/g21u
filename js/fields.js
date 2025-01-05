import { getOpt, dateFromString, grChangePrecision, detailsFromFilename } from './common.js'

export function getFieldDefs({
  filename = null,
  allfields = false
} = {}) {
  // Filename can be null - only affects default values
  // for some fields.
  const filenameDetails = filename ? detailsFromFilename(filename) : null

  //console.log('filenameDetails', filenameDetails) 
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
      info: `Name of the person that made the record.`
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
      info: `Name of the person who identified the taxon.`
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
      info: `Date on which the record was made.`
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
      info: `Time at which the record was made.`
    },
    {
      inputId: 'scientific-name-input',
      inputType: 'taxon',
      inputLabel: 'Scientific name',
      jsonId: 'scientific-name',
      iRecord: 'Species',
      default: '',
      novalue: '',
      optional: false,
      info: `Scientific name of the recorded taxon.`
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
      info: `Common (vernacular) name of the recorded taxon.`
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
      info: `Certainty of taxon identification.`
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
      info: `Stage of recorded taxon.`
    },
    {
      inputId: 'stage-input',
      inputType: 'term-stage',
      inputLabel: 'Stage',
      jsonId: 'stage',
      iRecord: 'Stage',
      default: 'Not recorded',
      novalue: '',
      optional: true,
      info: `Stage of recorded taxon.`
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
      info: `Sex of recorded taxon.`
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
        field instead.`
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
        it is better to use a term from <i>Observation type</i> if one matches.`
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
      info: `You can used this to provide information on whether an insect specimen was exmined.`
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
      info: `You can used this to provide information on whether a specimen was retained or not.`
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
        upon your selection in the <i>File & geolocation handling</i> section.`
    },
    {
      inputId: 'lat-input',
      inputType: 'text',
      inputLabel: 'Latitude',
      jsonId: 'latitude',
      iRecord: null,
      default: filenameDetails ? filenameDetails.latitude : '',
      novalue: '',
      optional: false,
      forDuplication: true,
      info: `Latitude for record location. Either grid reference or lat/lon is required. Which is used depends
        upon your selection in the <i>File & geolocation handling</i> section.`
    },
    {
      inputId: 'lon-input',
      inputType: 'text',
      inputLabel: 'Longitude',
      jsonId: 'longitude',
      iRecord: null,
      default: filenameDetails ? filenameDetails.longitude : '',
      novalue: '',
      optional: false,
      forDuplication: true,
      info: `Longitude for record location. Either grid reference or lat/lon is required. Which is used depends
        upon your selection in the <i>File & geolocation handling</i> section.`
    },
    {
      inputId: 'location-input',
      inputType: 'text',
      inputLabel: 'Location name',
      jsonId: 'location',
      iRecord: 'Site name',
      default: '',
      novalue: '',
      optional: false,
      forDuplication: true,
      info: `Location name for record.`
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
      info: `Free form comment for record.`
    },
  ]


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
      return ret
    })
  }
}

export function getTermList(term) {
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
      'Not recorded',
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
  return terms[termId]
}