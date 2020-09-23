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


var {_, d3, jp, fs, glob, io} = require('scrape-stl')
var slugify = require('slugify')
var states = io.readDataSync(__dirname + '/states.json')

var outdir = __dirname + `/../data-parsed/merge/`
if (!fs.existsSync(outdir)) fs.mkdirSync(outdir)


var symptoms = io.readDataSync(__dirname + `/../data-parsed/states/Alabama/__symptoms.json`)

d3.cross(states, symptoms).forEach(mergeSymptom)


function mergeSymptom([state, symptom], i){
  console.log(state, symptom.slug)

  var outdir = __dirname + `/../data-parsed/states/${state}/`

  var weekly = io.readDataSync(outdir + 'weekly_' + symptom.slug + '.json')
  var daily = io.readDataSync(outdir + 'daily_' + symptom.slug + '.json')

  var rv = {
    symptom: symptom.symptom,
    slug: symptom.slug,
    dates: weekly.dates,    
    counties: []
  }

  weekly.fips2county = {}
  weekly.counties.forEach(d => {
    weekly.fips2county[d.fips] = d
    d.vals = d.vals
    d.isDaily = false
  })

  daily.counties.forEach(county => {
    if (d3.sum(county.vals) == 0){
      rv.counties.push(weekly.fips2county[county.fips])
    } else{
      var vals = rv.dates.map((date, i) => {
        return d3.median(county.vals.slice(i*7, (i + 1)*7))
      })
      rv.counties.push({fips: county.fips, vals, isDaily: true})
    }
  }) 

  // check number of data points
  // console.log(symptom.slug, jp.nestBy(rv.counties, d => d.vals.length + ' ' + d.isDaily).map(d => d.key))

  io.writeDataSync(outdir + 'all_' + symptom.slug + '.json', rv)
}



