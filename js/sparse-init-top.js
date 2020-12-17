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



window.initSparseTop = async function(){

  var countryCode = util.validateCountryCode()

  d3.select('body').classed('is-sg', countryCode == 'SG')

  if (!window.symptom || params.get('symptom') != symptom.slug || countryCode != symptoms.countryCode){
    window.symptom = await (await fetch(util.getSymptomPath())).json()

    legend.setSymptom()
  }

  if (!window.topSymptoms || countryCode != topSymptoms.countryCode){
    window.topSymptoms = await (await fetch(util.getSymptomPath('top-symptoms'))).json()
    window.topSymptoms.countryCode = countryCode
  }

  decorateSymptom(symptom)
  topSymptoms.forEach(decorateSymptom)

  var width = window.innerWidth < 800 ? '100%' : window.innerWidth < 1050 ? '49%' : '32%'

  d3.select('.line-list').html('')
    .appendMany('div', topSymptoms)
    .st({width, display: 'inline-block'})
    .each(function(d){
      initSparseLine(d, d3.select(this), 1)
    })

  initSparseLine(symptom, d3.select('.line-single').html('').st({width}), 0)


  function decorateSymptom(symptom){
    var zeroVals = symptom.regions[0].vals.map(d => 0)
    symptom.regions.forEach(d => {
      d.median = d3.median(d.vals.slice(0, config.numWeeks))
      if (isNaN(d.median)) d.median = 0
      if (d3.sum(d.vals, d => d == 0) >= config.numWeeks/2) d.median = 0
      if (d.median == 0) d.vals = zeroVals 

      d.changeVals = d.vals.map(e => e/d.median)

      if (d.region == ''){
        d.region = symptom.countryName
        // clear rendering artifact at the start of chart
        d3.range(1).forEach(i => {
          d.changeVals[i] = 0
        })
      }
    })
  }
}


if (window.init) window.init()
