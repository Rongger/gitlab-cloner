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

async function clone(urls = [], limits = 2) {
  const _urls = urls.concat();
  const pools = new Set();
  const errors = [];
  const logger = getLogger();
  const output = path.resolve(process.env.HOME, `repos_${genHash()}`);
  fs.mkdirSync(output);

  while (_urls.length !== 0) {
    const url = _urls.shift();

    const task = () => {
      console.log(`Start clone ${url}...`);
      return exec(`git clone ${url}`, { cwd: output }).catch((e) => {
        logger.error(e);
        errors.push(e);
      });
    };
    const promise = task();
    const clean = () => pools.delete(promise);
    promise.finally(clean);
    pools.add(promise);

    if (pools.size >= limits) {
      await Promise.race(pools);
    }
  }
  return errors;
}

function genHash() {
  return Math.random().toString().slice(2, 8);
}

main();
