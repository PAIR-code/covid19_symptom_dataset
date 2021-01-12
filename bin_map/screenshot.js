// https://roadtolarissa.com/d3-mp4/

var dateStrs = '2017-08-21 2017-08-28 2017-09-04 2017-09-11 2017-09-18 2017-09-25 2017-10-02 2017-10-09 2017-10-16 2017-10-23 2017-10-30 2017-11-06 2017-11-13 2017-11-20 2017-11-27 2017-12-04 2017-12-11 2017-12-18 2017-12-25 2018-01-01 2018-01-08 2018-01-15 2018-01-22 2018-01-29 2018-02-05 2018-02-12 2018-02-19 2018-02-26 2018-03-05 2018-03-12 2018-03-19 2018-03-26 2018-04-02 2018-04-09 2018-04-16 2018-04-23 2018-04-30 2018-05-07 2018-05-14 2018-05-21 2018-05-28 2018-06-04 2018-06-11 2018-06-18 2018-06-25 2018-07-02 2018-07-09 2018-07-16 2018-07-23 2018-07-30 2018-08-06 2018-08-13 2018-08-20 2018-08-27 2018-09-03 2018-09-10 2018-09-17 2018-09-24 2018-10-01 2018-10-08 2018-10-15 2018-10-22 2018-10-29 2018-11-05 2018-11-12 2018-11-19 2018-11-26 2018-12-03 2018-12-10 2018-12-17 2018-12-24 2018-12-31 2019-01-07 2019-01-14 2019-01-21 2019-01-28 2019-02-04 2019-02-11 2019-02-18 2019-02-25 2019-03-04 2019-03-11 2019-03-18 2019-03-25 2019-04-01 2019-04-08 2019-04-15 2019-04-22 2019-04-29 2019-05-06 2019-05-13 2019-05-20 2019-05-27 2019-06-03 2019-06-10 2019-06-17 2019-06-24 2019-07-01 2019-07-08 2019-07-15 2019-07-22 2019-07-29 2019-08-05 2019-08-12 2019-08-19 2019-08-26 2019-09-02 2019-09-09 2019-09-16 2019-09-23 2019-09-30 2019-10-07 2019-10-14 2019-10-21 2019-10-28 2019-11-04 2019-11-11 2019-11-18 2019-11-25 2019-12-02 2019-12-09 2019-12-16 2019-12-23 2019-12-30 2020-01-06 2020-01-13 2020-01-20 2020-01-27 2020-02-03 2020-02-10 2020-02-17 2020-02-24 2020-03-02 2020-03-09 2020-03-16 2020-03-23 2020-03-30 2020-04-06 2020-04-13 2020-04-20 2020-04-27 2020-05-04 2020-05-11 2020-05-18 2020-05-25 2020-06-01 2020-06-08 2020-06-15 2020-06-22 2020-06-29 2020-07-06 2020-07-13 2020-07-20 2020-07-27 2020-08-03 2020-08-10 2020-08-17 2020-08-24 2020-08-31'.split(' ')


var puppeteer = require('puppeteer')
var d3 = require('d3')
var fs = require('fs')

var {exec, execSync} = require('child_process')

async function divToGif(dates, symptom, isLarge){
  var isLargeStr = isLarge ? '_2x' : '_1x'

  var outdir = `${__dirname}/../../png-mobility/symptom-${symptom + isLargeStr}/`
  execSync('rm -rf ' + outdir)
  if (!fs.existsSync(outdir)) fs.mkdirSync(outdir)

  // open new tab and wait for data to load
  var browser = await puppeteer.launch({headless: 1})
  var page = await browser.newPage()
  await page.goto(`http://localhost:8000/?symptom=${symptom}&is-gif=true`)
  await sleep(1000)

  var imagePath
  for (var weekIndex of dates){
    console.log(symptom, weekIndex)

    await page.evaluate((weekIndex) => {
      window.state.weekIndex = +weekIndex
      render()
    }, weekIndex)
    await sleep(10)

    imagePath = outdir + symptom + '_' + dateStrs[weekIndex] + '.png'

    await page.setViewport({width: 1920, height: 1080, deviceScaleFactor: isLarge ? 2 : 1})
    var chartEl = await page.$(`.map`)
    await chartEl.screenshot({path: imagePath})
  }

  browser.close()

  var outslug = symptom + '_' + [dates[0], dates.slice(-1)[0]].map(i => dateStrs[i]).join('_') + isLargeStr

  var delay = dates.length < 50 ? 25 : 15
  var cmds = [
    'cd ' + outdir,
    `convert ${imagePath.replace(outdir, '')} palette.gif`,
    'convert -dither none -remap palette.gif *.png recording-uncompressed.gif',
    `gifsicle --optimize=3 --delay=${delay} < recording-uncompressed.gif > recording.gif`,
    'cp recording.gif ../../2020-06-search-signal/09-symptom-animation/gifs/' + outslug +  '.gif',
    `ffmpeg -framerate 10 -pattern_type glob -i '*.png' video.mp4`,
    'cp video.mp4 ../../2020-06-search-signal/09-symptom-animation/gifs/' + outslug + '.mp4',
  ]
  console.log(cmds.join(' && '))
  exec(cmds.join(' && '))
}

async function init(){
  var dates2019 = d3.range(52)
  var dates2020 = d3.range(53, 77)
  var datesAll = d3.range(77)
  var dates3year = d3.range(0, 52*3)

  var gifs = [
    [dates3year, 'allergy'],
    // [dates2020, 'fever'],
    // [dates2020, 'anxiety'],
    // [dates2020, 'anosmia'],
    // [dates2020, 'chills'],
    // [dates2020, 'chest-pain'],
    // [dates2020, 'hypoxemia']
  ]

  for (gif of gifs){
    // await divToGif(gif[0], gif[1], 0)
    await divToGif(gif[0], gif[1], 1)
  }
}
init()

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}


