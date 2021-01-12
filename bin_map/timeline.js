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



var {_, jp, fs, glob, io} = require('scrape-stl')
var d3 = require('d3')
var slugify = require('slugify')

var dir = __dirname + `/../data-parsed/combined/`


var config = io.readDataSync(__dirname + '/../config.json')

var logScale = d3.scaleLog().clamp(1).domain(config.logDomain)
var logScaleBucket = d => Math.round(logScale(d)*config.nBuckets)


var countyPop = io.readDataSync(__dirname + '/../third_party/2016-us-election/county_pop.csv')
countyPop.fipsLookup = Object.fromEntries(countyPop.map(d => [d.fips, d]))
var totalPop = countyPop.fipsLookup['00000'].pop

function calcTimeline(symptom, i){
  var {dates, counties} = io.readDataSync(dir + symptom.slug + '.json')

  var zeroVals = counties[0].vals.map(d => 0)
  counties.forEach(d => {
    d.median = d3.median(d.vals.slice(0, config.numWeeks))
    if (isNaN(d.median)) d.median = 0
    if (d3.sum(d.vals, d => d == 0) >= config.numWeeks/2) d.median = 0
    if (d.median == 0) d.vals = zeroVals 

    var m = countyPop.fipsLookup[d.fips]
    if (!m){
      d.pop = 0
    } else{
      d.pop = m.pop/totalPop*config.populationScale
    }
  })

  symptom.numValidCounties = d3.sum(counties, d => d.median != 0)
  console.log(symptom.slug, symptom.numValidCounties)
  if (!symptom.numValidCounties > config.minValidCounties) return null

  symptom.byWeek = dates.map((dateStr, i) => {
    var outbuckets = d3.range(config.nBuckets + 1).map(d => 0)

    jp.nestBy(
        counties, 
        d => d.vals[i] == 0 ? -1 : logScaleBucket(d.vals[i]/d.median))
      .filter(d => d.key != -1)
      .forEach(d => outbuckets[+d.key] = Math.round(d3.sum(d, e => e.pop)))

    return outbuckets
  })

  return symptom
}

var symptomsTimeline = io.readDataSync(dir + '__symptoms.json')
  .map(calcTimeline)
  .filter(d => d)

io.writeDataSync(dir + '__symptoms-timeline.json', symptomsTimeline)
io.writeDataSync(dir + '__symptoms-timeline-list.json', symptomsTimeline.map(({symptom, slug}) => ({symptom, slug})))

