const blockedResourcesTypes = [
  'beacon',
  'csp-report',
  'font',
  'image',
  'imageset',
  'main_frame',
  'media',
  'object',
  'object_subrequest',
  'ping',
  'sub_frame',
  'web_manifest',
  'xbl',
  'xml_dtd',
  'xslt',
  'other'
]

// para bloquear recursos y que se concentre en el css
const skippedScriptResources = [
  'optimizely',
  'beacon',
  'googletagmanager',
  'googleadservices',
  'doubleclick',
  'scorecardresearch',
  'analytics'
]

module.exports = {
  blockedResourcesTypes,
  skippedScriptResources
}
