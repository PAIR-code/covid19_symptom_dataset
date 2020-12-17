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

var out = []
glob.sync(__dirname + '/../data-raw/i18n/2020/country/daily/*.csv').forEach(path => {
  console.log(path)

  var data = io.readDataSync(path)

  jp.nestBy(data, d => d.sub_region_1)
    .forEach(d => {
      var {country_region, country_region_code, sub_region_1} = d[0]
      out.push({country_region, country_region_code, sub_region_1})
    })
})

io.writeDataSync(__dirname + '/../data-parsed/i18n/download-manifest.csv', out)

// {
    // country_region_code: 'US',
    // country_region: 'United States',
    // sub_region_1: 'Pennsylvania',
    // sub_region_1_code: 'US-PA',
    // sub_region_2: '',
    // sub_region_2_code: '',
    // date: '2020-11-24',
