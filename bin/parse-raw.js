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

var rawZipFiles = glob.sync(__dirname + `/../data-raw/zips/**/*_symptoms_dataset.csv`)
var rawGitFiles = glob.sync(__dirname + `/../data-raw/open-covid-19-data/data/exports/**/*_symptoms_dataset.csv`)
var rawFiles = rawZipFiles.concat(rawGitFiles)

states.forEach(parseState)
function parseState(state, i){
  // if (state != 'Alaska' && state != 'Alabama') return

  var outdir = __dirname + `/../data-parsed/states/${state}/`
  if (!fs.existsSync(outdir)) fs.mkdirSync(outdir, {recursive: true})

  var rawStateFiles = rawFiles.filter(d => d.includes('US_' + state))

  parseInterval('daily')
  parseInterval('weekly')

  function parseInterval(interval){
    var rawdata = []
    rawStateFiles.filter(d => d.includes(`${interval}_symptoms_dataset.csv`))
      .forEach((path, i) => {
        rawdata = rawdata.concat(io.readDataSync(path))
      })

    var dates = _.uniq(rawdata.map(d => d.date)).sort()
    var date2index = Object.fromEntries(dates.map((d, i) => [d, i]))

    var byFips = jp.nestBy(rawdata, d => d.sub_region_2_code)
      .filter(d => d.key != '')

    var symptomKeys = d3.keys(rawdata[0]).filter(d => d.includes('symptom'))
    var symptoms = symptomKeys.map((key, i) => {
      var counties = byFips.map(county => {
        var vals = dates.map(d => 0)
        county.forEach(d => {
          var val = d[key] == '' ? 0 : +d[key]
          var index = date2index[d.date]
          vals[index] = val
        })

        return {fips: county.key, vals}
      })

      var symptom = key.split(':')[1]
      var slug = slugify(symptom).toLowerCase()
      io.writeDataSync(outdir + interval + '_' + slug + '.json', {symptom, slug, dates, counties})

      return {symptom, slug}
    })

    // console.log(`num ${interval} rows: `, rawdata.length)
    console.log(dates.length, `${interval} ${state} dates`)

    if (interval == 'weekly') io.writeDataSync(outdir + '__symptoms.json', symptoms)
  }
}

