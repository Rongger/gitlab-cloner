const util = require('util');
const fs = require('fs');
const exec = util.promisify(require('child_process').exec);
const { host, token } = require('./request');

async function getRepos() {
  let page = 1;
  let pageSize = 50;
  let finished = false;
  const urls = [];

  while (!finished) {
    const cmd = `curl "https://${host}/api/v4/projects?access_token=${token}&per_page=${pageSize}&page=${page}&order_by=name&sort=asc"`;
    const { stdout } = await exec(cmd);
    const res = JSON.parse(stdout);
    console.log(`Download page ${page} done, count: ${res.length}`);
    res.forEach((i) => {
      urls.push(i?.ssh_url_to_repo);
    });
    page++;
    finished = res.length === 0;
  }

  return Array.from(new Set(urls));
}

getRepos().then((urls) => {
  fs.writeFileSync(`repos.json`, JSON.stringify({ data: urls }));
});
