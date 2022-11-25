const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { curl, GIT_HOST } = require('./request')

async function main() {
  try {
    const urls = await getRepoUrls(curl)
    const errCount = await clone(urls.slice(8, urls.length))
    console.log(`clone done. total: ${urls.length}, error: ${errCount}`);
  } catch (e) {
    console.error(e);
  }
}

async function getRepoUrls(curl) {
  let _curl = curl
  const urls = []
  let finished = false
  let [, prev, page, next] = curl.match(/(.*page=)(\d)(.*)/)
  page = Number(page)

  while(!finished) {
    const { stdout } = await exec(_curl);
    const res = JSON.parse(stdout)
    res.forEach(i => {
      urls.push(`git@${GIT_HOST}:${i?.relative_path}.git`)
    })
    page++
    _curl = `${prev}${page}${next}`
    finished = res.length === 0
  }

  return urls
}

async function clone(urls = [], concurrency = 2) {
  const output = `~/repos_${Math.random().toString().slice(2, 8)}`
  await exec(`mkdir ${output}`)

  const _urls = urls.concat()
  const errors = []
  let next = _urls.splice(0, concurrency)
  while(next.length !== 0) {
    await Promise.all(next.map(i => {
      console.log(`start clone ${i}`);
      return exec(`cd ${output} && git clone ${i}`).catch(e => {
        console.log(e);
        errors.push(e)
      })
    }))
    next = _urls.splice(0, concurrency)
  }
  return errors.length
}

main()
