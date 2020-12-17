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



window.initTimeline = async function(){
  var c = d3.conventions({
    sel: d3.select('.timeline').html('').st({width: ''}),
    height: 80,
    margin: {right: 8, left: 8, bottom: 40},
  })

  var byDay = symptom.dates.map((dateStr, i) => {
    var buckets = d3.nestBy(map.regions, d => d.vals[i] == 0 ? -1 : logScaleBucket(d.vals[i]/d.median))

    buckets = _.sortBy(buckets, d => +d.key)

    var day = {dateStr, i, buckets}
    var prev = 0
    buckets.forEach(d => {
      d.prev = prev
      prev += d3.sum(d, e => e.pop)
      d.post = prev
      d.day = day
    })

    day.total = prev

    return day
  })

  var isMobile = c.width < 500

  c.x.domain([0, byDay.length - 1]).interpolate(d3.interpolateRound)
  c.y.domain([byDay[0].total, 0])

  var bw = c.x(1)
  var daySel = c.svg.appendMany('g', byDay)
    .translate((d, i) => c.x(i) - bw/2 , 0)

  daySel.appendMany('rect', d => d.buckets)
    .at({
      y: d => c.y(d.prev),
      height: d => c.y(d.post) - c.y(d.prev), 
      width: (d, i) => c.x(d.day.i + 1) - c.x(d.day.i) - (isMobile ? 0 : .5),
      fill: d => d.key == -1 ? '#eee' : d3.interpolatePiYG(1 - d.key/nBuckets),
      prev: d => d.prev,
      pop: d => d.pop,
    })

  d3.nestBy(byDay, d => d.dateStr.split('-').slice(0, 2).join('-'))
    .filter(d => ['2017-08', '2018-01', '2018-07', '2019-01', '2019-07', '2020-01', '2020-07'].includes(d.key))
    .forEach(d => d[0].botText = d.key)

  var botAxisTickSel = daySel.filter(d => d.botText).append('g')
    .translate([bw/2, c.height])
    .st({opacity: (d, i) => isMobile && i == 0 ? 0 : 1})

  botAxisTickSel.append('text')
    .text(d => d.botText)
    .st({fontFamily: 'sans-serif', fontSize: 11, fill: '#666'})
    .at({textAnchor: 'middle', y: 18})

  botAxisTickSel.append('path')
    .at({
      d: 'M .5 0 V 6',
      stroke: '#aaa',
    })

  var axisTickSel = daySel.append('g')
    .translate([bw/2, 0])
    .st({opacity: d => 0})

  axisTickSel.append('text')
    .text(d => d.dateStr)
    .st({fontFamily: 'sans-serif', fontSize: 11, fill: '#666'})
    .at({textAnchor: 'middle', y: -10})

  axisTickSel.append('path')
    .at({
      d: 'M .5 0 V -6',
      stroke: '#666',
    })

  c.svg.on('mousemove', function(){
    var [xPos] = d3.mouse(this)

    var weekIndex = d3.clamp(0, Math.round(c.x.invert(xPos)), byDay.length - 1)
    if (weekIndex == state.weekIndex) return

    state.weekIndex = weekIndex

    util.render()
    if (window.gtag) gtag('event', 'date-hover', {event_label: symptom.dates[state.weekIndex]})
  })

  return {axisTickSel, byDay}
}
if (window.init) window.init()
