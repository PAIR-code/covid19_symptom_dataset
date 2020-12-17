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




window.initSparseLegend = async function(){
  var countryCode = util.validateCountryCode()
  var countryName = _.find(config.countries, {code: countryCode}).name



  var countrySelectSel =  d3.select('.sparse .legend').html('')
    .st({margin: '0px auto'}).append('div')
    .html(`
      <span style="white-space:nowrap">Symptom searches in</span>
      <select></select>
      <span style="white-space:nowrap">
        <span class='key country-wide'>Country-wide</span>
        <span class='key region'>Region</span>
      </span>
    `)
    .st({textAlign: 'center'})
    .select('select')
    .st({width: 200, margin: 10, padding: 10, marginLeft: 20})
    .st({display: isScreenshot ? 'none' : ''})
    .on('change', function(){
      params.set('country', this.value)
      initSparseTop()

      if (window.gtag) gtag('event', 'select-click-country', {event_label: this.value})
    })
    .appendMany('option', config.countries)
    .text(d => d.name)
    .at({value: d => d.code})

  countrySelectSel.filter(d => d.code == countryCode).at({selected: 'selected'})



  var symptomSelectSel = d3.select('.symptom-dropdown').html('')
    .st({margin: '0px auto'}).append('div')
    .html('<span style="white-space:nowrap">Related searches for</span>')
    .st({textAlign: 'center'})
    .append('select')
    .st({textAlign: 'center', margin: 10})
    .on('change', function(){
      params.set('symptom', this.value)
      initSparseTop()
      setWidth(this.value)

      if (window.gtag) gtag('event', 'select-click-line', {event_label: this.value})
    })
    .appendMany('option', symptoms)
    .text(d => d.symptom)
    .at({value: d => d.slug})


  function setWidth(slug){
    var str = symptom.symptom

    if (slug){
      str = symptoms[symptoms.map(d => d.slug).indexOf(slug)].symptom
    }

    d3.selectAll('.description-symptoms,.description-symptom-name').text(str)
    var width = d3.select('.description-symptoms').node().offsetWidth*1 + 25
    symptomSelectSel.parent().st({width})
  }

  function setSymptom(){
    symptomSelectSel
      .filter(d => d.slug == symptom.slug).at({selected: 'selected'})

    setWidth()
  }



  // var c = d3.conventions({
  //   sel: d3.select('.key').html('').append('div'),
  //   height: 1,
  //   margin: {bottom: 10, top: 20}
  // })

  // var leftPx = 40 + 25
  // var leftPx = c.width/2
  // var axisSel = c.svg.appendMany('g.axis', ['Country', 'Region'])
  //   .at({fontSize: 12, fontFamily: 'sans-serif'})
  //   .translate((d, i) => [i ? leftPx + 40 : leftPx -40, 0])

  // axisSel.append('path')
  //   .at({strokeWidth: 2, d: 'M -4 -4 H -14'})
  //   .st({stroke: (d, i) => i ? '#000' : '#f00'})

  // axisSel.append('text').text(d => d)

  


  return {setSymptom}
}



if (window.init) window.init()
