/* Copyright 2020 Google LLC. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
==============================================================================*/



window.initTop = async function(forceMap=1){
  function validateCountryCode(){
    var code = params.get('country').toUpperCase()
    var randCode = d3.shuffle(config.countries.slice())[0].code
    if (!config.countries.map(d => d.code).includes(code)) code = randCode
    params.set('country', code)

    return code
  }
  var countryCode = validateCountryCode()

  if (params.get('symptom') != symptom.slug || countryCode != symptoms.countryCode){
    window.symptom = await (await fetch(util.getSymptomPath())).json()
  }

  symptom.regions.forEach(d => {
    d.name = d.region.replace('County ', '') // TODO match everything
  })

  symptom.nameLookup = Object.fromEntries(symptom.regions.map(d => [d.name, d.vals]))

  if (!window.map || forceMap) window.map = await initMap(window.resCache[0])

  var zeroVals = symptom.regions[0].vals.map(d => 0)
  map.regions.forEach(d => {
    var name = symptom.countryCode == 'AU' ? d.gns_name : d.gn_name

    d.vals = symptom.nameLookup[d.name] || symptom.nameLookup[d.en_name] || symptom.nameLookup[d.gns_name] || symptom.nameLookup[d.gn_name] || []
    // if (!d.vals.length) console.log(d.name)

    d.median = d3.median(d.vals.slice(0, config.numWeeks))
    if (isNaN(d.median)) d.median = 0
    if (d3.sum(d.vals, d => d == 0) >= config.numWeeks/2) d.median = 0
    if (d.median == 0) d.vals = zeroVals 
  })


  window.legend = await initLegend()
  window.timeline = await initTimeline()

  util.render()
}


if (window.init) window.init()
