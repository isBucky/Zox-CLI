#!/usr/bin/env node

const shell = require('shelljs');

let [branch, ...message] = process.argv.slice(2), date = new Date(),
  dateCommit = `${date.getUTCFullYear()}/${String(date.getUTCMonth()).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
  
message = message.filter(Boolean).join(' ');
if (!branch || !branch.length) branch = 'main';
if (!message.length) message = `New Commit at ${dateCommit}`;

shell.exec([
  'git add --all',
  `git commit -m "${message}"`,
  `git push origin ${branch}`
].join(' && '));