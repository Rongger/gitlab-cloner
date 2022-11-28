const util = require('util');
const fs = require('fs');
const exec = util.promisify(require('child_process').exec);
const { curl, GIT_HOST } = require('./request');

async function getRepoUrls(curl) {
  let _curl = curl;
  const urls = [];
  let finished = false;
  let [, prev, page, next] = curl.match(/(.*page=)(\d)(.*)/);
  page = Number(page);

  while (!finished) {
    const { stdout } = await exec(_curl);
    const res = JSON.parse(stdout);
    res.forEach((i) => {
      urls.push(
        `git@${GIT_HOST}:${i?.relative_path.replace(/^\/(.*)/, '$1')}.git`
      );
    });
    page++;
    _curl = `${prev}${page}${next}`;
    finished = res.length === 0;
  }

  return Array.from(new Set(urls));
}

getRepoUrls(curl).then((urls) => {
  fs.writeFileSync(`data.json`, JSON.stringify({ data: urls }));
});
