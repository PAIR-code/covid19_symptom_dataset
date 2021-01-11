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
    if (key == 'symptom' && !symptomSlugs.includes(str)) str = 'fatigue'

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
if (!params.get('symptom')) params.set('symptom', 'fatigue')

window.dataPath = params.get('local-data') ? 
  'data-parsed/i18n' : params.get('dense-map') ? 
  'https://storage.googleapis.com/uncertainty-over-space/combined' : 'https://storage.googleapis.com/uncertainty-over-space/ssd_i18n'

window.cachebust = 'cachebust=14'
window.isScreenshot = 0
d3.select('body').classed('screenshot', isScreenshot)

var nBuckets = 11
var logScale = d3.scaleLog().clamp(1)
var logScaleBucket = d => Math.round(logScale(d)*nBuckets)
var colorScale = d => d3.interpolatePiYG(1 - logScaleBucket(d)/nBuckets)
var colorScaleRaw = d => d3.interpolatePiYG(1 - d/nBuckets)

window.state = {
  isGif: !!params.get('is-gif'),
  isDense: 0,
}
d3.select('body').classed('is-gif', state.isGif)



window.initDense = function(){
  if (window.resCache){
    runInit()
  } else{
    d3.loadData(
      'third_party/topojson/us.json', 
      'third_party/natural-earth/ne_10m.json', 
      util.getSymptomPath(),
      `${dataPath}/__symptoms-timeline-list.json`,
      'third_party/2016-us-election/county_pop.csv', 
      'config.json', 
      (err, res) => {
        if (err) return console.log(err)

        window.resCache = res
        runInit()
    })
  }

  function runInit(){
    fmtData()
    initTop()
    initList()
  }

  function fmtData(){
    var [us, world, symptom, symptoms, countyPop, config] = window.resCache

    window.us = us
    window.world = world
    window.symptom = symptom
    window.symptoms = symptoms
    window.countyPop = countyPop
    window.config = config

    window.nBuckets = config.nBuckets
    logScale.domain(config.logDomain)

    state.weekIndex = +symptom.dates.indexOf(params.get('date'))
    if (state.weekIndex == -1) state.weekIndex = symptom.dates.length - 1
  }
  d3.select('body').classed('is-dense', true)
}



window.initSparse = async function(){
  d3.select('body').classed('is-dense', false)

  window.config = await util.json('config.json') 
  window.symptoms = await util.json(`${dataPath}/countries/AU/symptoms/__symptoms.json`)

  window.legend = await initSparseLegend()
  window.topLines = await initSparseTop()
}

window.init = function(){
  state.isDense ? initDense() : initSparse()

}
init()


