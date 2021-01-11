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


window.initSparseLine = async function(symptom, sel, addTitle){
  var c = d3.conventions({
    sel: sel.append('div.line-chart'),
    height: 200,
    margin: {left: 30, right: 10}
  })

  c.svg.append('rect')
    .at({width: c.width, height: c.height, fill: '#eee'})


  var regionExtents = symptom.regions.map(d => {
    var changeVals = d.changeVals.filter(d => d > 0 && isFinite(d))

    if (!changeVals.length) return [1]

    return d3.extent(changeVals)
  })


  var valExtent = d3.extent(_.flatten(regionExtents).filter(d => d))
  c.y.domain(valExtent).nice(3)
  c.x.domain([0, symptom.dates.length - 1])

  c.x.interpolate(d3.interpolateRound).clamp(1)
  c.y.interpolate(d3.interpolateRound)


  var logY = d3.scaleLog().domain([.5, 2]).range(c.y.range()).clamp(1)

  var dayTicks = d3.nestBy(
    symptom.dates.map((d, i) => ({d, i})), 
    d => d.d.split('-').slice(0, 2).join('-'))
    .filter(d => ['2018-01', '2018-07', '2019-01', '2019-07', '2020-01', '2020-07'].includes(d.key))
    .map(d => d[0].i)

  c.xAxis
    .tickValues(dayTicks) // TODO update
    .tickFormat(d => symptom.dates[d].split('-').slice(0, 2).join('-'))
    .tickSize(c.height)

  c.yAxis
    .ticks(3)
    .tickSize(c.width).tickFormat((d, i) => d == 0 ? '' : d + '×')
  
  var logAxis = d3.axisLeft(logY)
    .tickValues([1/2, 1, 2])
    .tickSize(c.width).tickFormat((d, i) => d + '×')

  d3.drawAxis(c)
  var xAxisSel = c.svg.select('.x').translate(0, 0)
  xAxisSel.selectAll('text').at({dy: 11})

  var yAxisSel = c.svg.select('.y').translate(c.width, 0)
  

  var textOptions = {x: c.x(dayTicks[0]) + 4, fontSize: 14, y: 17, fontWeight: 600}
  var hoverTextSel = c.svg.append('text.hover-text').at(textOptions)
    .at({fontWeight: 300})
  if (addTitle){
    c.svg.append('text').text(symptom.symptom).at(textOptions)
    hoverTextSel.at({y: 34})
  }

  var line = d3.line()
    .x((d, i) => c.x(i))
    .y(d => c.y(d))
    .defined(d => d > 0 && isFinite(d))

  var pathSel = c.svg.append('g').appendMany('path.region-line', symptom.regions)
    .at({
      d: d => line(d.changeVals),
      stroke: '#000',
      opacity: symptom.regions.length < 20 ? .3 : symptom.regions.length < 60 ? .1 : .07,
      fill: 'none'
    })
    .on('mouseout', () => legend.setActiveRegion({}))
    .on('mouseover', legend.setActiveRegion)
  
  pathSel
    .filter(d => d.region == symptom.countryName)
    .lower()
    .classed('country-line', 1)
    .classed('region-line', 0)


  var botTickSel = c.svg.select('.x').append('g.bot-tick')
  botTickSel.append('path').at({d: `M 0 0 V ${-c.height}`, stroke: '#FFF'})
  var botTextSel = botTickSel.append('text')
    .at({y: 16, dy: '.71em'})

  c.svg
    .on('mousemove', function(){
      var index = Math.round(c.x.invert(d3.mouse(this)[0]))
      // botTextSel.text(symptom.dates[index].split('-').slice(0, 2).join('-'))
      d3.selectAll('.bot-tick text').text(symptom.dates[index])

      d3.selectAll('.bot-tick').st({opacity: 1})
        .translate([c.x(index) + .5, c.height])
    })    
    .on('mouseleave', function(){
      d3.selectAll('.bot-tick').st({opacity: 0})
    })


  c.sel.datum({setLog}) 

  function setLog(isLog, dur=1000){
    yAxisSel
      .transition().duration(dur)
      .call(isLog ? logAxis : c.yAxis)

    line.y(isLog ? logY : c.y)
    pathSel
      .transition().duration(dur)
      .at({d: d => line(d.changeVals)})

    window.state.isLog = isLog
  }

  if (window.state.isLog == true) setLog(1, 0)
}

if (window.init) window.init()




// function addAxisLabel(c, xText, yText){
//   if (xText){
//     c.svg.select('.x').append('g')
//       .translate([c.width/2, 35])
//       .append('text.label')
//       .text(xText)
//       .at({textAnchor: 'middle'})
//       .st({fill: '#000'})
//   }

//   if (yText){
//     c.svg.select('.y')
//       .append('g')
//       .translate([-50, c.height/2])
//       .append('text.label')
//       .text(yText)
//       .at({textAnchor: 'middle', transform: 'rotate(-90)'})
//       .st({fill: '#000'})
//   }
// }

