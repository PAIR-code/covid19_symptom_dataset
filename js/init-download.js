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


// d3.loadData(`${window.dataPath}/download-manifest.csv`, (err, res) => {
d3.loadData(`https://storage.googleapis.com/uncertainty-over-space/ssd_i18n/download-manifest.csv?cachebust=10`, (err, res) => {
  window.downloadFiles = res[0]
    .filter(d => d.sub_region_1 == '' || !['Singapore', 'New Zealand', 'Ireland'].includes(d.country_region))

  var countries = _.sortBy(d3.nestBy(downloadFiles, d => d.country_region), d => d.key)

  // country_region,country_region_code,sub_region_1
  // Australia,AU,Northern Territory
  // Australia,AU,New South Wales
  // Australia,AU,Victoria



  var dlSel = d3.select('.download')//.classed('expand', false)

  var isExpand = dlSel.classed('expand')

  // dlSel.on('click', () => {
  //   if (isExpand) return
  //   isExpand = !isExpand
  //   dlSel.classed('expand', isExpand)
  // })  

  dlSel.select('h3').on('click', () => {
    isExpand = !isExpand
    dlSel.classed('expand', isExpand)
  })  


  var years = [2017, 2018, 2019, 2020, 2021, 2022]
  years.active = '2022'

  var yearsSel = d3.select('.year.buttons').html('')
    .appendMany('div.button', years)
    .text(d => d)
    .classed('active', d => d == years.active)
    .on('click', d => {
      years.active = d
      yearsSel.classed('active', d=> d == years.active)

      // aSel.classed('disabled', 1)
      setLinks()
    })


  var interval = ['Daily', 'Weekly']
  interval.active = interval[0]

  var intervalSel = d3.select('.interval.buttons').html('')
    .appendMany('div.button', interval)
    .text(d => d)
    .classed('active', d => d == interval.active)
    .on('click', d => {
      interval.active = d
      intervalSel.classed('active', d => d == interval.active)

      setLinks()
    })


  var countrySel = d3.select('.expand-area').html('')
    .appendMany('div', countries)

  countrySel.append('a.country-name.row')
    .append('span')
    .text(d => d.key)

  var expandCountrySel = countrySel.filter(d => d.filter(d => d.sub_region_1).length)

  expandCountrySel.append('div.row.region-list.expand-region')
    .on('click', function(d){
      d.isExpand = !d.isExpand
      d3.select(this).parent().classed('expand', d.isExpand)
    })
    .append('span').text('Subregions')

  expandCountrySel
    .appendMany('a.region-list.row', d => _.sortBy(d, d => d.sub_region_1).filter(d => d.sub_region_1))
    .append('span')
    .text(d => d.sub_region_1)


  var aSel = dlSel.selectAll('a')
  function setLinks(){
    aSel.at({href: d => {
      var root = 'https://storage.cloud.google.com/gcs-public-data---symptom-search'

      var yearStr = years.active
      var intervalStr = interval.active.toLowerCase()


      if (d.key){
        return `${root}/${yearStr}/country/${intervalStr}/${yearStr}_${d[0].country_region_code}_${intervalStr}_symptoms_dataset.csv`
      } else{
        return `${root}/${yearStr}/sub_region_1/${intervalStr}/${yearStr}_${d.country_region_code}_${d.sub_region_1.replace(/ /g, '_')}_${intervalStr}_symptoms_dataset.csv`
      }
    }})

    aSel.classed('disabled', d => years.active == 2017 && d == 'East Region')
  }
  setLinks()
})