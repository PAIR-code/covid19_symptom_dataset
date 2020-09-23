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

var outdir = __dirname + `/../data-parsed/combined/`
if (!fs.existsSync(outdir)) fs.mkdirSync(outdir)
  


var symptoms = io.readDataSync(__dirname + `/../data-parsed/states/Alabama/__symptoms.json`)
io.writeDataSync(outdir + '__symptoms.json', symptoms)

symptoms.forEach(combineSymptom)

function combineSymptom(symptom, i){
  console.log(symptom.slug)

  var rv = null
  states.forEach(state => {
    var data = io.readDataSync(__dirname + `/../data-parsed/states/${state}/all_${symptom.slug}.json`)

    // console.log(state, data.dates.length)

    if (!rv){
      rv = data
    } else {
      rv.counties = rv.counties.concat(data.counties)
      if (rv.dates.length != data.dates.length) throw 'Date mismatch: ' + state
    }
  })

  io.writeDataSync(outdir + symptom.slug + '.json', rv)
}



