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



window.initMapOld = async function(us){
  
  return {regions: [], regionSel: d3.select(null), dateSel: d3.select(null)}


  var mapSel = d3.select('.map').html('').st({width: ''})
  if (state.isGif){
    mapSel.append('div').st({height: 40}).text(' ')
    d3.select('.legend').st({top: 40})
  }

  var width = state.isGif ? 626 : Math.min(975, mapSel.node().offsetWidth)
  var height = width/975*610
  mapSel.st({width, background: '#fff'})


  var conus = topojson.feature(us, {
    type: 'GeometryCollection',
    geometries: us.objects.states.geometries.filter(d => d.id !== 2 && d.id !== 15 && d.id < 60)
  })

  var path = d3.geoPath().projection(d3.geoAlbersUsa().fitSize([width, height], conus))

  var zoom = d3.zoom()
    .scaleExtent([1, 3])
    .extent([[0, 0], [width, height]])
    .translateExtent([[0, 0], [width, height]])
    .on('zoom', function(){
      svg.attr('transform', d3.event.transform)
    })

  var svg = mapSel.append('svg')
    .at({width, height})
    .call(zoom)
    .append('g')

  window.zbug = {zoom, svg}

  mapSel.appendMany('div.zoom-button', ['+', '—'])
    .text(d => d)
    .st({bottom: (d, i) => i ? 5 : 40})
    .on('click', (d, i) => {
      svg.parent().transition().call(zoom.scaleBy, i ? .5 : 1.74)     
    })

  var counties = topojson.feature(us, us.objects.counties).features
  countyPop.fipsLookup = Object.fromEntries(countyPop.map(d => [d.fips, d]))

  var regionSel = svg.append('g')
    .appendMany('path.county', counties)
    .at({d: path, fill: '#eee', strokeWidth: state.isGif ? .2 : .5, stroke: '#fff', fill: '#eee'})
    .each(d => {
      var fips = d3.format('05')(d.id)
      var m = countyPop.fipsLookup[fips]
      if (!m) return
      d.name = m.name + ', ' + m.state
      d.pop = +m.pop

      d.meta = {fips}
    })
    .filter(d => d.pop)
    .call(d3.attachTooltip)
    .on('mouseover', function(d){
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

      d3.select(this).raise()
    })

  var statemesh = topojson.mesh(us, us.objects.states)
  svg.append('path.state-mesh')
    .at({d: path(statemesh), fill: 'none', stroke: '#555', strokeWidth: 1})

  var dateSel = svg.append('text')
    .translate([10, -15])
    .at({fontSize: 25, textAnchor: 'start'})
    .st({opacity: state.isGif ? 1 : 0, pointerEvents: 'none'})
    .text(`“${symptom.symptom}” Related Searches`)

  var dateSel = svg.append('text')
    .translate([width - 145, -15])
    .at({fontSize: 25, textAnchor: 'start'})
    .st({opacity: state.isGif ? 1 : 0, pointerEvents: 'none', 'font-variant-numeric': 'tabular-numsx'})

  counties = counties
    .filter(d => d.meta)
    .filter(d => d.meta.fips != '51515') // Missing from source data

  return {regionSel, counties, statemesh, conus, dateSel}
}

if (window.init) window.init()
