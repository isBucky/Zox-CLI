#!/usr/bin/env node

import Program from './src/program';

import { join } from 'node:path';
import dotenv from 'dotenv';

const isTs = __filename.split('.')[1] == 'ts';
dotenv.config({
    path: join(__dirname, isTs ? '' : '..', '.env'),
});

global.currentLocal = process.cwd();

new Program().start();
