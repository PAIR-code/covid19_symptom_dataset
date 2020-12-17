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


window.initLegend = async function(){
  var sel = d3.select('.legend').html('')
    .st({margin: '0px auto', opacity: state.isGif ? 0 : 1, marginBottom: 0})

  var c = d3.conventions({
    sel,
    width: 300,
    height: 50,
    margin: {right: 30, bottom: 0, top: 50},
    layers: 'sd'
  })

  // c.svg.append('text').text(`Searches related to “${symptom.symptom}”`)
  //   .translate([c.width/2, -21])
  //   .at({fontSize: 16, textAnchor: 'middle', fontWeight: 600})

  c.svg.append('text.legend-week')
    .translate([c.width/2, 3])
    .at({fontSize: 14, textAnchor: 'middle', fontWeight: 300})
  
  c.x.domain([window.config.nBuckets, 0])
  var ticks = d3.range(window.config.nBuckets + 1).reverse()
  var bw = c.x(ticks[1]) - c.x(ticks[0])

  var tickSel = c.svg.appendMany('g', ticks.concat(-1))
    .translate(d => [Math.round(c.x(d)) - .5, 10.5])

  tickSel.append('rect')
    .at({width: Math.round(bw) - 3, x: Math.round(-bw/2), height: 20, fill: colorScaleRaw, stroke: '#000'})
  tickSel.append('text')
    .text(d => {
      var str = {9: 2, 5: 1, 0: '1/2'}[d]

      return str ? str + '×' : ''
    })
    .at({fontSize: 12, textAnchor: 'middle', dy: 34, x: d => d == 5 ? bw/2 : 0})

  var noDataTick = tickSel.filter(d => d == -1)
    .translate([c.width + 60.5, 10.5])
    .st({opacity: innerWidth < 700 ? 0 : 1})
  noDataTick.select('rect').at({fill: '#eee'})
  noDataTick.select('text').text('insufficient data').at({opacity: 1, textAnchor: 'left', dx: -bw/2})

  var dateSel = c.svg.append('text')
    .translate([c.width/2, 85])
    .at({fontSize: 30, textAnchor: 'middle', opacity: 0})

  

  var divSel = c.layers[1].append('div')
    .text('searches related to ')
    .st({textAlign: 'center', fontWeight: 600, fontSize: 16})

  var symptomSelectSel = divSel.append('select')
    .classed('description-select', 1)
    .on('change', function(){
      params.set('symptom', this.value)
      setWidth(this.value)
      state.isDense ? initTop() : initSparseTop()

      if (window.gtag) gtag('event', 'select-click', {event_label: this.value})
    })
    .appendMany('option', symptoms)
    .text(d => d.symptom)
    .at({value: d => d.slug})

  symptomSelectSel.filter(d => d.slug == symptom.slug).at({selected: 'selected'})

  var countrySelectSel = divSel.append('select').lower()
    .st({width: 140, margin: 5})
    .on('change', function(){
      params.set('country', this.value)
      // setWidth(this.value)

      state.isDense ? initTop() : initSparseTop()

      if (window.gtag) gtag('event', 'select-click-country', {event_label: this.value})
    })
    .appendMany('option', config.countries)
    .text(d => d.name)
    .at({value: d => d.code})

  countrySelectSel.filter(d => d.code == symptom.countryCode).at({selected: 'selected'})


  function setWidth(slug){
    var str = symptom.symptom

    if (slug){
      str = symptoms[symptoms.map(d => d.slug).indexOf(slug)].symptom
    }

    d3.selectAll('.description-symptoms,.description-symptom-name').text(str)
    var width = d3.select('.description-symptoms').node().offsetWidth*1.05 + 25
    symptomSelectSel.parent().st({width})

    var height = divSel.node().offsetHeight
    divSel.translate(height > 35 ? -62 : -38, 1)
    divSel.translate(-72, 1)
  }
  setWidth()

  return {dateSel, symptomSelectSel}
}



if (window.init) window.init()
