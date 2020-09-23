var {_, d3, jp, fs, glob, io, execSync} = require('scrape-stl')
var {execSync} = require('child_process')
var fetch = require('node-fetch')
var util = require('util')
var streamPipeline = util.promisify(require('stream').pipeline)
var states = io.readDataSync(__dirname + '/states.json')

var rawdir = __dirname + '/../data-raw'


function cloneRepo(){
  if (!fs.existsSync(rawdir + '/open-covid-19-data')){
    console.log('cloning repo')
    execSync(`cd ${rawdir} && git clone git@github.com:google-research/open-covid-19-data.git`)
  } else {
    console.log('pulling repo')
    execSync(`cd ${rawdir}/open-covid-19-data && git pull`)
  }
}
cloneRepo()


async function downloadZips(){
  var zipdir = rawdir + '/zips'
  if (!fs.existsSync(zipdir)) fs.mkdirSync(zipdir)

  for (var state of states){
    console.log('downloading', state)

    var url = `https://github.com/google-research/open-covid-19-data/releases/download/v0.0.2/US_${state}_search_trends_symptoms_dataset.zip`

    var res = await fetch(url)
    if (!res.ok) throw new Error(`zip download error ${state} ${res.statusText}`)
    await streamPipeline(res.body, fs.createWriteStream(`${zipdir}/${state}.zip`))
  }

  execSync(`cd ${zipdir} && unzip '*.zip'`)
}
downloadZips()


