#!/usr/bin/env node

import Program from './src/program';

import { join } from 'node:path';

import figlet from 'figlet';
import dotenv from 'dotenv';
import chalk from 'chalk';

const isTs = __filename.split('.')[1] == 'ts';

global.currentLocal = process.cwd();
global.envZoxPath = join(__dirname, isTs ? '' : '..', '.env');

dotenv.config({ path: global.envZoxPath });

console.log(chalk.bold.blue(figlet.textSync('Z o x !', { font: 'Bloody' })), '\n');

new Program().start();
