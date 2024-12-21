import { getOpt, dateFromString, grChangePrecision, detailsFromFilename } from './common.js'

export function getFieldDefs(filename) {
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
      inputId: 'gridref-input',
      inputType: 'text',
      inputLabel: 'Grid reference',
      jsonId: 'gridref',
      iRecord: 'Grid ref',
      default: filenameDetails ? grChangePrecision(filenameDetails.gridref, Number(getOpt('georef-precision'))) : '',
      novalue: '',
      optional: false,
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
      info: `Free form comment for record.`
    },
  ]

  return fieldDefs.filter(fd => {
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
    return ret
  })
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
      'Vegetative',
    ],

  }

  return terms[termId]
}