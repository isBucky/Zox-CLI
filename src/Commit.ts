#!/usr/bin/env node

import shell from 'shelljs';

let branch = process.argv.slice(2)[0],
  message = process.argv.slice(3).filter(Boolean).join(' ');
  
let date = new Date(),
  dateCommit = [
    date.getUTCFullYear(),
    String(date.getUTCMonth()).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')].join('/');
  
if (!branch || !branch.length) branch = 'main';
if (!message.length) message = `New Commit at ${dateCommit}`;

shell.exec([
  'git add --all',
  `git commit -m "${message}"`,
  `git push origin ${branch}`
].join(' && '));