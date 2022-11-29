const util = require('util');
const fs = require('fs');
const path = require('path');
const exec = util.promisify(require('child_process').exec);
const { getLogger } = require('./logger');

async function main() {
  try {
    const raw = fs.readFileSync(`./repos.json`).toString();
    const urls = JSON.parse(raw).data;
    const errors = await clone(urls);
    console.log(`clone done. total: ${urls.length}, error: ${errors.length}`);
  } catch (e) {
    console.error(e);
  }
}

async function clone(urls = [], concurrency = 2) {
  const _urls = urls.concat();
  const errors = [];
  const logger = getLogger();
  const output = path.resolve(
    process.env.HOME,
    `repos_${Math.random().toString().slice(2, 8)}`
  );
  fs.mkdirSync(output);

  let next = _urls.splice(0, concurrency);
  while (next.length !== 0) {
    await Promise.all(
      next.map((i) => {
        console.log(`Start clone ${i}...`);
        return exec(`git clone ${i}`, { cwd: output }).catch((e) => {
          logger.error(e);
          errors.push(e);
        });
      })
    );
    next = _urls.splice(0, concurrency);
  }
  return errors;
}

main();
