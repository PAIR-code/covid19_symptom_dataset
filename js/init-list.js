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



window.initList = async function(){
  if (!window.symptomsTimeline){
    window.symptomsTimeline = await (await fetch(`${dataPath}/__symptoms-timeline.json?${cachebust}`)).json()
  }

  var topSymptoms = symptomsTimeline.filter(d => d.numValidCounties > config.minValidCounties)
  // console.log(topSymptoms.length)

  var symptomsSel = d3.select('.symptom-list').html('')
    .st({margin: '10px auto', maxWidth: 1280, marginTop: 50})
    .appendMany('div', topSymptoms)
    .text(d => d.symptom)
    .st({width: window.innerWidth < 900 ? '100%' : window.innerWidth < 1050 ? '32%' : '24%'})
    .on('click', d => {
      params.set('symptom', d.slug)
      initTop()
      if (window.gtag) gtag('event', 'timeline-click', {event_label: d.slug})    
    })
    .st({display: 'inline-block', margin: 5, marginTop: 10, marginBottom: 10, color: '#333', fontSize: 14, height: 66, cursor: 'pointer'})
  

  var drawQueue = []
  symptomsSel.each(addToDrawQueue)
  function addToDrawQueue(symptom, i){
    drawQueue.push(() => drawTimeline(symptom, i, d3.select(this)))
  }

  function drawNext(){
    d3.range(3).forEach(() => {
      var fn = drawQueue.shift()
      if (fn) fn()     
    })

    if (drawQueue.length) window.drawNextTimeout = d3.timeout(drawNext, 50)
  }
  if (window.drawNextTimeout) window.drawNextTimeout.stop()
  d3.timeout(drawNext, 100)


  function drawTimeline(symptom, i, sel){
    var c = d3.conventions({
      sel: sel.append('div'),
      layers: 'sc',
      height: 50,
      margin: {top: 0, left: 0, right: 10, bottom: 0}
    })

    c.x.domain([0, symptom.byWeek.length - 1]).interpolate(d3.interpolateRound).clamp(1)
    c.y.domain([config.populationScale, 0]).interpolate(d3.interpolateRound)
    
    var bw = Math.round((c.x(1) - 1)/2)*2
    var ctx = c.layers[1]

    symptom.byWeek.forEach((week, weekIndex) => {
      var prev = 0
      d3.range(-1, window.nBuckets + 1).forEach(i => {
        var val = i > -1 ? week[i] : config.populationScale - d3.sum(week)

        var post = prev + val

        ctx.beginPath()
        ctx.fillStyle = i > -1 ? colorScaleRaw(i) : '#eee'
        ctx.rect(
          c.x(weekIndex) - bw/2,
          c.y(prev),
          c.x(weekIndex + 1) - c.x(weekIndex) + .5,
          c.y(post) - c.y(prev)
        )
        ctx.fill()

        prev = post
      })  
    })

  var botTickSel = c.svg.append('g').st({opacity: 0})

  var botTextSel = botTickSel.append('text')
    .text(d => d.botText)
    .st({fontFamily: 'sans-serif', fontSize: 11, fill: '#666'})
    .at({textAnchor: 'middle', y: 16})

  botTickSel.append('path')
    .at({
      d: 'M .5 0 V 6',
      stroke: '#aaa',
    })

  sel.select('canvas')
    .on('mousemove', function(){
      var index = Math.round(c.x.invert(d3.mouse(this)[0]))

      botTextSel.text(window.symptom.dates[index])

      botTickSel.st({opacity: 1})
        .translate([c.x(index), c.height])
    })    
    .on('mouseout', function(){
      botTickSel.st({opacity: 0})
    })
  }
}



if (window.init) window.init()
