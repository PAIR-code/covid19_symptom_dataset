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



window.tooltipChart = function(d){
  ttSel.html('')

  ttSel.append('div')
    .st({fontSize: 14, fontWeight: 600, marginBottom: 5})
    .text(d.name)

  ttSel.append('div')
    .text('Searches related to ' + symptom.symptom)

  var isMobile = innerWidth < 590
  var c = d3.conventions({
    sel: ttSel.append('div'),
    width: isMobile ? '' : symptom.dates.length*2,
    height: isMobile ? 50 : 100,
    margin: {left: 0, top: 0, right: 0},
  })

  c.x.domain([0, symptom.dates.length - 1])
  c.y.domain([0, d3.max(d.vals)])

  c.xAxis.tickValues([19, 72, 124]).tickFormat(d => symptom.dates[d].split('-')[0])

  d3.drawAxis(c)
  c.svg.select('.y').remove()

  if (isNaN(c.y.domain()[1]) || c.y.domain()[1] == 0){
    c.svg.append('text')
      .text('Insufficient Data')
      .at({y: c.height/2, x: c.width/2, textAnchor: 'middle', fill: '#666'})
  } else {
    c.svg.appendMany('rect', d.vals)
      .at({
        x: (d, i) => c.x(i),
        width: c.x(1),
        height: d => d ? c.height - c.y(d) : 0,
        y: d => c.y(d),
        fill: val => val ? colorScale(val/d.median) : '#eee',
        stroke: '#000',
        strokeWidth: .05,
      })
  }
}

if (window.init) window.init()