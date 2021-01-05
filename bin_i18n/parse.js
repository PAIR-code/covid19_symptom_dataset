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


var config = io.readDataSync(__dirname + '/../config.json')
var rawCSVFiles = glob.sync(__dirname + `/../data-raw/i18n/*/country/weekly/*.csv`)


config.countries.forEach(({code, name}, i) => {
  // if (i) return

  var outdir = __dirname + `/../data-parsed/i18n/countries/${code}/symptoms/`
  if (!fs.existsSync(outdir)) fs.mkdirSync(outdir, {recursive: true})

  var rawdata = []
  rawCSVFiles.forEach(path => {
    if (!path.includes(`_${code}_weekly_symptoms_dataset.csv`)) return
    var data = io.readDataSync(path)
    rawdata = rawdata.concat(data)
  })

  rawdata = _.sortBy(rawdata, d => d.date)

  var dates = _.uniq(rawdata.map(d => d.date).filter(d => d >= '2017-11-27'))
  var date2index = Object.fromEntries(dates.map((d, i) => [d, i]))

  var byRegion = jp.nestBy(rawdata, d => d.sub_region_1)

  var symptomKeys = d3.keys(rawdata[0]).filter(d => d.includes('symptom'))
  var symptoms = symptomKeys.map((key, i) => {
    var regions = byRegion.map(region => {
      var vals = dates.map(d => 0)
      region.forEach(d => {
        var val = d[key] == '' ? 0 : +d[key]
        var index = date2index[d.date]
        vals[index] = val
      })

      return {region: region.key, vals}
    })

    var symptom = key.split(':')[1]
    var slug = slugify(symptom).toLowerCase()
    var date = (new Date()).toISOString()
    io.writeDataSync(outdir + slug + '.json', {symptom, slug, dates, regions, countryCode: code, countryName: name, date})

    if (code == 'SG') console.log(date)

    return {symptom, slug}
  })

  console.log(code, ' dates:', dates.length, ' regions:', byRegion.length)
  io.writeDataSync(outdir + '__symptoms.json', symptoms)

// heart-arrhythmia itch sore-throat
  // var topSymptoms = 'anosmia cough fever shortness-of-breath'
  var topSymptoms = 'anxiety asthma anosmia alcoholism common-cold cough depression fatigue fever headache nausea shortness-of-breath'
    .split(' ')
    .map(slug => {
      return io.readDataSync(outdir + slug + '.json')
    })

  io.writeDataSync(outdir + 'top-symptoms.json', topSymptoms)
})



    // country_region_code: 'AU',
    // country_region: 'Australia',
    // sub_region_1: '',
    // sub_region_1_code: '',
    // sub_region_2: '',
    // sub_region_2_code: '',
    // date: '2018-04-16',
    // 'symptom:Abdominal obesity': '2.93',
    // 'symptom:Abdominal pain': '5.87',
    // 'symptom:Acne': '11.31',
    // 'symptom:Actinic keratosis': '0.5',
    // 'symptom:Acute bronchitis': '0.37',
    // 'symptom:Adrenal crisis': '0.13',
    // 'symptom:Ageusia': '0.05',
    // 'symptom:Alcoholism': '5.54',
    // 'symptom:Allergic conjunctivitis': '0.07',

