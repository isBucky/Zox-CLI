#!/usr/bin/env node

import Program from './src/program';

import { join } from 'node:path';
import dotenv from 'dotenv';

const isTs = __filename.split('.')[1] == 'ts';

global.currentLocal = process.cwd();
global.envZoxPath = join(__dirname, isTs ? '' : '..', '.env');

dotenv.config({ path: global.envZoxPath });

new Program().start();
