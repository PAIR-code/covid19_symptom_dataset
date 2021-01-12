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

// console.clear()
var ttSel = d3.select('body').selectAppend('div.tooltip.tooltip-hidden')

var symptomSlugs = `abdominal-obesity abdominal-pain acne actinic-keratosis acute-bronchitis adrenal-crisis ageusia alcoholism allergic-conjunctivitis allergy amblyopia amenorrhea amnesia anal-fissure anaphylaxis anemia angina-pectoris angioedema angular-cheilitis anosmia anxiety aphasia aphonia apnea arthralgia arthritis ascites asperger-syndrome asphyxia asthma astigmatism ataxia atheroma attention-deficit-hyperactivity-disorder auditory-hallucination autoimmune-disease avoidant-personality-disorder back-pain bacterial-vaginosis balance-disorder beau's-lines bell's-palsy biliary-colic binge-eating bleeding bleeding-on-probing blepharospasm bloating blood-in-stool blurred-vision blushing boil bone-fracture bone-tumor bowel-obstruction bradycardia braxton-hicks-contractions breakthrough-bleeding breast-pain bronchitis bruise bruxism bunion burn burning-chest-pain burning-mouth-syndrome candidiasis canker-sore cardiac-arrest carpal-tunnel-syndrome cataplexy cataract chancre cheilitis chest-pain chills chorea chronic-pain cirrhosis cleft-lip-and-cleft-palate clouding-of-consciousness cluster-headache colitis coma common-cold compulsive-behavior compulsive-hoarding confusion congenital-heart-defect conjunctivitis constipation convulsion cough crackles cramp crepitus croup cyanosis dandruff delayed-onset-muscle-soreness dementia dentin-hypersensitivity depersonalization depression dermatitis desquamation developmental-disability diabetes diabetic-ketoacidosis diarrhea dizziness dry-eye-syndrome dysautonomia dysgeusia dysmenorrhea dyspareunia dysphagia dysphoria dystonia dysuria ear-pain eczema edema encephalitis encephalopathy epidermoid-cyst epilepsy epiphora erectile-dysfunction erythema erythema-chronicum-migrans esophagitis excessive-daytime-sleepiness eye-pain eye-strain facial-nerve-paralysis facial-swelling fasciculation fatigue fatty-liver-disease fecal-incontinence fever fibrillation fibrocystic-breast-changes fibromyalgia flatulence floater focal-seizure folate-deficiency food-craving food-intolerance frequent-urination gastroesophageal-reflux-disease gastroparesis generalized-anxiety-disorder generalized-tonicclonic-seizure genital-wart gingival-recession gingivitis globus-pharyngis goitre gout grandiosity granuloma guilt hair-loss halitosis hay-fever headache heart-arrhythmia heart-murmur heartburn hematochezia hematoma hematuria hemolysis hemoptysis hemorrhoids hepatic-encephalopathy hepatitis hepatotoxicity hiccup hip-pain hives hot-flash hydrocephalus hypercalcaemia hypercapnia hypercholesterolemia hyperemesis-gravidarum hyperglycemia hyperkalemia hyperlipidemia hypermobility hyperpigmentation hypersomnia hypertension hyperthermia hyperthyroidism hypertriglyceridemia hypertrophy hyperventilation hypocalcaemia hypochondriasis hypoglycemia hypogonadism hypokalemia hypomania hyponatremia hypotension hypothyroidism hypoxemia hypoxia impetigo implantation-bleeding impulsivity indigestion infection inflammation inflammatory-bowel-disease ingrown-hair insomnia insulin-resistance intermenstrual-bleeding intracranial-pressure iron-deficiency irregular-menstruation itch jaundice kidney-failure kidney-stone knee-pain kyphosis lactose-intolerance laryngitis leg-cramps lesion leukorrhea lightheadedness low-back-pain low-grade-fever lymphedema major-depressive-disorder malabsorption male-infertility manic-disorder melasma melena meningitis menorrhagia middle-back-pain migraine milium mitral-insufficiency mood-disorder mood-swing morning-sickness motion-sickness mouth-ulcer muscle-atrophy muscle-weakness myalgia mydriasis myocardial-infarction myoclonus nasal-congestion nasal-polyp nausea neck-mass neck-pain neonatal-jaundice nerve-injury neuralgia neutropenia night-sweats night-terror nocturnal-enuresis nodule nosebleed nystagmus obesity onychorrhexis oral-candidiasis orthostatic-hypotension osteopenia osteophyte osteoporosis otitis otitis-externa otitis-media pain palpitations panic-attack papule paranoia paresthesia pelvic-inflammatory-disease pericarditis periodontal-disease periorbital-puffiness peripheral-neuropathy perspiration petechia phlegm photodermatitis photophobia photopsia pleural-effusion pleurisy pneumonia podalgia polycythemia polydipsia polyneuropathy polyuria poor-posture post-nasal-drip postural-orthostatic-tachycardia-syndrome prediabetes proteinuria pruritus-ani psychosis ptosis pulmonary-edema pulmonary-hypertension purpura pus pyelonephritis radiculopathy rectal-pain rectal-prolapse red-eye renal-colic restless-legs-syndrome rheum rhinitis rhinorrhea rosacea round-ligament-pain rumination scar sciatica scoliosis seborrheic-dermatitis self-harm sensitivity-to-sound sexual-dysfunction shallow-breathing sharp-pain shivering shortness-of-breath shyness sinusitis skin-condition skin-rash skin-tag skin-ulcer sleep-apnea sleep-deprivation sleep-disorder snoring sore-throat spasticity splenomegaly sputum stomach-rumble strabismus stretch-marks stridor stroke stuttering subdural-hematoma suicidal-ideation swelling swollen-feet swollen-lymph-nodes syncope tachycardia tachypnea telangiectasia tenderness testicular-pain throat-irritation thrombocytopenia thyroid-nodule tic tinnitus tonsillitis toothache tremor trichoptilosis tumor type-2-diabetes unconsciousness underweight upper-respiratory-tract-infection urethritis urinary-incontinence urinary-tract-infection urinary-urgency uterine-contraction vaginal-bleeding vaginal-discharge vaginitis varicose-veins vasculitis ventricular-fibrillation ventricular-tachycardia vertigo viral-pneumonia visual-acuity vomiting wart water-retention weakness weight-gain wheeze xeroderma xerostomia yawn hyperhidrosis pancreatitis`.split(' ')

function makeParams(){
  var url = new URL(window.location)
  var searchParams = new URLSearchParams(url.search) 

  var rv = {}

  rv.get = key => {
    var str = searchParams.get(key)
    if (key == 'symptom' && !symptomSlugs.includes(str)) str = 'fever'

    return str
  }

  rv.set = (key, value) => {
    searchParams.set(key, encodeURIComponent(value))

    url.search = searchParams.toString()
    history.replaceState(null, '', url)
  }

  return rv
}
window.params = makeParams()
if (!params.get('symptom')) params.set('symptom', 'fever')

var dataPath = params.get('local-data') ? '../data-parsed/combined' : 'https://storage.googleapis.com/uncertainty-over-space/combined'
var cachebust = 'cachebust=13'


var logScale = d3.scaleLog().clamp(1)
var logScaleBucket = d => Math.round(logScale(d)*nBuckets)
var colorScale = d => d3.interpolatePiYG(1 - logScaleBucket(d)/nBuckets)
var colorScaleRaw = d => d3.interpolatePiYG(1 - d/nBuckets)

window.state = {
  isGif: !!params.get('is-gif'),
}
d3.select('body').classed('is-gif', state.isGif)


if (window.resCache){
  fmtData()
  initTop()
  initList()
} else{
  d3.loadData(
    '../third_party/topojson/us.json', 
    `${dataPath}/${params.get('symptom')}.json?${cachebust}`,
    `${dataPath}/__symptoms-timeline-list.json`,
    '../third_party/2016-us-election/county_pop.csv', 
    '../config.json', 
    (err, res) => {
      if (err) return console.log(err)
        
      window.resCache = res
      fmtData()
      initTop()
      initList()
  })
}

function fmtData(){
  var [us, symptom, symptoms, countyPop, config] = window.resCache

  window.us = us
  window.symptom = symptom
  window.symptoms = symptoms
  window.countyPop = countyPop
  window.config = config

  window.nBuckets = config.nBuckets
  logScale.domain(config.logDomain)

  state.weekIndex = +symptom.dates.indexOf(params.get('date'))
  if (state.weekIndex == -1) state.weekIndex = symptom.dates.length - 1
}

async function initTop(forceMap=0){
  if (params.get('symptom') != symptom.slug){
    window.symptom = await (await fetch(`${dataPath}/${params.get('symptom')}.json?${cachebust}`)).json()
  }

  symptom.fipsLookup = Object.fromEntries(symptom.counties.map(d => [d.fips, d.vals]))

  if (!window.map || forceMap) window.map = initMap(window.resCache[0])

  var zeroVals = symptom.counties[0].vals.map(d => 0)
  map.counties.forEach(d => {
    d.vals = symptom.fipsLookup[d.meta.fips] || []
    d.median = d3.median(d.vals.slice(0, config.numWeeks))
    if (isNaN(d.median)) d.median = 0
    if (d3.sum(d.vals, d => d == 0) >= config.numWeeks/2) d.median = 0
    if (d.median == 0) d.vals = zeroVals 
  })


  window.legend = initLegend()
  window.timeline = initTimeline()

  render()
}

!(function(){
  var prevX = window.innerWidth
  d3.select(window).on('resize', _.debounce(() => {
    if (prevX == window.innerWidth) return

    initTop(true)
    initList()
    prevX = window.innerWidth
  }, 500))
})()

function render(){
  map.countySel
    .at({
      fill: d => {
        var val = d.vals[state.weekIndex]/d.median
        if (!val) return '#eee'

        return colorScale(val)
      },
      strokeWidth: d => d.vals[state.weekIndex] ? .5 : 0,
    })

  var dateStr = symptom.dates[state.weekIndex]
  legend.dateSel.text(dateStr)
  map.dateSel.text(dateStr)
  d3.select('.legend-week').text(`ratio of ${symptom.dates[state.weekIndex]} weekly volume to county median`)

  d3.select('.description-date').text(dateStr)

  params.set('date', symptom.dates[state.weekIndex])

  if (!window.timeline) return

  window.timeline.axisTickSel
    .classed('active', 0)
    .filter(d => d.i == state.weekIndex)
    .classed('active', 1)
    .parent()
    .raise()
}

function initMap(us){
  var mapSel = d3.select('.map').html('').st({width: ''})
  if (state.isGif){
    mapSel.append('div').st({height: 40}).text(' ')
    d3.select('.legend').st({top: 40})
  }

  var width = state.isGif ? 626 : Math.min(975, mapSel.node().offsetWidth)
  var height = width/975*610
  mapSel.st({width, background: '#fff'})


  var conus = topojson.feature(us, {
    type: 'GeometryCollection',
    geometries: us.objects.states.geometries.filter(d => d.id !== 2 && d.id !== 15 && d.id < 60)
  })

  var path = d3.geoPath().projection(d3.geoAlbersUsa().fitSize([width, height], conus))

  var zoom = d3.zoom()
    .scaleExtent([1, 3])
    .extent([[0, 0], [width, height]])
    .translateExtent([[0, 0], [width, height]])
    .on('zoom', function(){
      svg.attr('transform', d3.event.transform)
    })

  var svg = mapSel.append('svg')
    .at({width, height})
    .call(zoom)
    .append('g')

  window.zbug = {zoom, svg}

  mapSel.appendMany('div.zoom-button', ['+', '—'])
    .text(d => d)
    .st({bottom: (d, i) => i ? 5 : 40})
    .on('click', (d, i) => {
      svg.parent().transition().call(zoom.scaleBy, i ? .5 : 1.74)     
    })

  var counties = topojson.feature(us, us.objects.counties).features
  countyPop.fipsLookup = Object.fromEntries(countyPop.map(d => [d.fips, d]))

  var countySel = svg.append('g')
    .appendMany('path.county', counties)
    .at({d: path, fill: '#eee', strokeWidth: state.isGif ? .2 : .5, stroke: '#fff', fill: '#eee'})
    .each(d => {
      var fips = d3.format('05')(d.id)
      var m = countyPop.fipsLookup[fips]
      if (!m) return
      d.name = m.name + ', ' + m.state
      d.pop = +m.pop

      d.meta = {fips}
    })
    .filter(d => d.pop)
    .call(d3.attachTooltip)
    .on('mouseover', function(d){
      ttSel.html('')

      ttSel.append('div')
        .st({fontSize: 14, fontWeight: 600, marginBottom: 5})
        .text(d.name)

      ttSel.append('div')
        .text('Searches related to ' + symptom.symptom)

      var isMobile = innerWidth < 590
      var c = d3.conventions({
        sel: ttSel.append('div'),
        width: isMobile ? '' : symptom.dates.length*2,
        height: isMobile ? 50 : 100,
        margin: {left: 0, top: 0, right: 0},
      })

      c.x.domain([0, symptom.dates.length - 1])
      c.y.domain([0, d3.max(d.vals)])

      c.xAxis.tickValues([19, 72, 124]).tickFormat(d => symptom.dates[d].split('-')[0])

      d3.drawAxis(c)
      c.svg.select('.y').remove()

      if (isNaN(c.y.domain()[1]) || c.y.domain()[1] == 0){
        c.svg.append('text')
          .text('Insufficient Data')
          .at({y: c.height/2, x: c.width/2, textAnchor: 'middle', fill: '#666'})
      } else {
        c.svg.appendMany('rect', d.vals)
          .at({
            x: (d, i) => c.x(i),
            width: c.x(1),
            height: d => d ? c.height - c.y(d) : 0,
            y: d => c.y(d),
            fill: val => val ? colorScale(val/d.median) : '#eee',
            stroke: '#000',
            strokeWidth: .05,
          })
      }

      d3.select(this).raise()
    })

  var statemesh = topojson.mesh(us, us.objects.states)
  svg.append('path.state-mesh')
    .at({d: path(statemesh), fill: 'none', stroke: '#555', strokeWidth: 1})

  var dateSel = svg.append('text')
    .translate([10, -15])
    .at({fontSize: 25, textAnchor: 'start'})
    .st({opacity: state.isGif ? 1 : 0, pointerEvents: 'none'})
    .text(`“${symptom.symptom}” Related Searches`)

  var dateSel = svg.append('text')
    .translate([width - 145, -15])
    .at({fontSize: 25, textAnchor: 'start'})
    .st({opacity: state.isGif ? 1 : 0, pointerEvents: 'none', 'font-variant-numeric': 'tabular-numsx'})

  counties = counties
    .filter(d => d.meta)
    .filter(d => d.meta.fips != '51515') // Missing from source data

  return {countySel, counties, statemesh, conus, dateSel}
}

function initTimeline(){
  var c = d3.conventions({
    sel: d3.select('.timeline').html('').st({width: ''}),
    height: 80,
    margin: {right: 8, left: 8, bottom: 40},
  })

  var byDay = symptom.dates.map((dateStr, i) => {
    var buckets = d3.nestBy(map.counties, d => d.vals[i] == 0 ? -1 : logScaleBucket(d.vals[i]/d.median))

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

    render()
    if (window.gtag) gtag('event', 'date-hover', {event_label: symptom.dates[state.weekIndex]})
  })

  return {axisTickSel, byDay}
}

function initLegend(){
  var sel = d3.select('.legend').html('')
    .st({margin: '0px auto', opacity: state.isGif ? 0 : 1, marginBottom: 0})

  var c = d3.conventions({
    sel,
    width: 300,
    height: 50,
    margin: {right: 30, bottom: 0, top: 50},
    layers: 'sd'
  })

  // c.svg.append('text').text(`Searches related to “${symptom.symptom}”`)
  //   .translate([c.width/2, -21])
  //   .at({fontSize: 16, textAnchor: 'middle', fontWeight: 600})

  c.svg.append('text.legend-week')
    .translate([c.width/2, 3])
    .at({fontSize: 14, textAnchor: 'middle', fontWeight: 300})
  
  c.x.domain([nBuckets, 0])
  var ticks = d3.range(nBuckets + 1).reverse()
  var bw = c.x(ticks[1]) - c.x(ticks[0])

  var tickSel = c.svg.appendMany('g', ticks.concat(-1))
    .translate(d => [Math.round(c.x(d)) - .5, 10.5])

  tickSel.append('rect')
    .at({width: Math.round(bw) - 3, x: Math.round(-bw/2), height: 20, fill: colorScaleRaw, stroke: '#000'})
  tickSel.append('text')
    .text(d => {
      var str = {9: 2, 5: 1, 0: '1/2'}[d]

      return str ? str + '×' : ''
    })
    .at({fontSize: 12, textAnchor: 'middle', dy: 34, x: d => d == 5 ? bw/2 : 0})

  var noDataTick = tickSel.filter(d => d == -1)
    .translate([c.width + 60.5, 10.5])
    .st({opacity: innerWidth < 700 ? 0 : 1})
  noDataTick.select('rect').at({fill: '#eee'})
  noDataTick.select('text').text('insufficient data').at({opacity: 1, textAnchor: 'left', dx: -bw/2})

  var dateSel = c.svg.append('text')
    .translate([c.width/2, 85])
    .at({fontSize: 30, textAnchor: 'middle', opacity: 0})

  

  var divSel = c.layers[1].append('div')
    .text('Searches related to ')
    .st({textAlign: 'center', fontWeight: 600, fontSize: 16})

  var symptomSelectSel = divSel.append('select')
    .classed('description-select', 1)
    .on('change', function(){
      params.set('symptom', this.value)
      setWidth(this.value)
      initTop()

      if (window.gtag) gtag('event', 'select-click', {event_label: this.value})
    })
    .appendMany('option', symptoms)
    .text(d => d.symptom)
    .at({value: d => d.slug})

  symptomSelectSel.filter(d => d.slug == symptom.slug).at({selected: 'selected'})

  function setWidth(slug){
    var str = symptom.symptom

    if (slug){
      str = symptoms[symptoms.map(d => d.slug).indexOf(slug)].symptom
    }

    d3.selectAll('.description-symptoms,.description-symptom-name').text(str)
    var width = d3.select('.description-symptoms').node().offsetWidth*1.05 + 25
    symptomSelectSel.parent().st({width})

    var height = divSel.node().offsetHeight
    divSel.translate(height > 35 ? -62 : -38, 1)
  }
  setWidth()

  return {dateSel, symptomSelectSel}
}

async function initList(){
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


