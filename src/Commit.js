#!/usr/bin/env node

const shell = require('shelljs');

let [branch, message] = process.argv.slice(2), date = new Date(),
  dateCommit = `${date.getFullYear()}/${String(date.getMonth()).padStart(2, '0')}/${String(date.getDay()).padStart(2, '0')}`;
  
if (!branch || !branch.length) branch = 'main';
if (!message || !message.length) message = `New Commit at ${dateCommit}`;

shell.exec([
  'git add --all',
  `git commit -m "${message}"`,
  `git push origin ${branch}`
].join(' && '));