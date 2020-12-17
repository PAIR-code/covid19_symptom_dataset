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



window.initMap = async function(){
  var width = 500
  var height = 500
  var mapSel = d3.select('.map').html('').st({width})

  var topo = world

  if (symptom.countryCode == 'GB' && true){
    if (!window.__cacheUK) window.__cacheUK = await (await fetch('third_party/natural-earth/uk.json')).json()

    topo = window.__cacheUK

    // match natural earth data
    topo.objects.ne_10m_admin_1_states_provinces_lakes = topo.objects.Local_Administrative_Units_Level_1__January_2018__Boundaries

    topo.objects.ne_10m_admin_1_states_provinces_lakes.geometries.forEach(d => {
      d.properties.iso_a2 = 'GB'
      d.properties.name = d.properties.lau118nm
    })
  } 

  var geometries = topo.objects.ne_10m_admin_1_states_provinces_lakes.geometries
    .filter(d => d.properties.iso_a2 == symptom.countryCode)

  var outline = topojson.feature(topo, {
    type: 'GeometryCollection',
    geometries: geometries
  })

  var path = d3.geoPath().projection(d3.geoMercator().fitSize([width, height], outline))
  // var path = d3.geoPath().projection(d3.geoMercator().fitWidth(width, outline))

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


  var regions = topojson
    .feature(topo, topo.objects.ne_10m_admin_1_states_provinces_lakes)
    .features
    .filter(d => d.properties.iso_a2 == symptom.countryCode)

  // regions.nameLookup = Object.fromEntries(regions.map(d => [d.properties.gns_name, d]))

  var regionSel = svg.append('g')
    .appendMany('path.region', regions)
    .at({d: path, fill: '#eee', strokeWidth: state.isGif ? .2 : .5, stroke: '#000', fill: '#eee'})
    .each(function(d){

      d.pop = 100
      d.name = d.properties.name
      d.gns_name = d.properties.gns_name
      d.gn_name = d.properties.gn_name
      d.en_name = d.properties.en_name

      d.meta = {name: d.name}
      // d3.select(this).datum(d.properties)
    })
    .filter(d => d.pop)
    .call(d3.attachTooltip)
    .on('mouseover', function(d){
      tooltipChart(d)

      d3.select(this).raise()
    })

  var dateSel = svg.append('text')
    .translate([width - 145, -15])
    .at({fontSize: 25, textAnchor: 'start'})
    .st({opacity: state.isGif ? 1 : 0, pointerEvents: 'none', 'font-variant-numeric': 'tabular-numsx'})


  return {regionSel, regions, dateSel}
}

if (window.init) window.init()
