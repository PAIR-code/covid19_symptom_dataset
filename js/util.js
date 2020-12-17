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


window.util = {

  getSymptomPath: (symptom=params.get('symptom')) => {
    var countryCode = (params.get('country') || 'AU').toUpperCase()

    return `${dataPath}/countries/${countryCode}/symptoms/${symptom}.json?${cachebust}`
  },
  
  json: async url => await (await fetch(url + '?cachebust=' + window.cachebust)).json(),

  validateCountryCode: () => {
    var code = (params.get('country') || '').toUpperCase()
    var randCode = d3.shuffle(config.countries.slice())[0].code
    if (!config.countries.map(d => d.code).includes(code)) code = randCode
    params.set('country', code)

    return code
  },

  render: () => {
    map.regionSel
      .at({
        fill: d => {
          var val = d.vals[state.weekIndex]/d.median
          if (!val) return '#eee'

          return colorScale(val)
        },
        // strokeWidth: d => d.vals[state.weekIndex] ? .5 : 0,
      })

    var dateStr = symptom.dates[state.weekIndex]
    legend.dateSel.text(dateStr)
    map.dateSel.text(dateStr)
    d3.select('.legend-week').text(`ratio of ${symptom.dates[state.weekIndex]} weekly volume to county median`)

    d3.select('.description-date').text(dateStr)

    params.set('date', symptom.dates[state.weekIndex])

    if (!window.timeline) return

    window.timeline.axisTickSel
      .classed('active', 0)
      .filter(d => d.i == state.weekIndex)
      .classed('active', 1)
      .parent()
      .raise()
  },
}



if (window.init) window.init()


!(function(){
  var prevX = window.innerWidth
  d3.select(window).on('resize', _.debounce(() => {
    if (prevX == window.innerWidth) return

    state.isDense ? initTop() : initSparseTop()

    prevX = window.innerWidth
  }, 500))
})()

