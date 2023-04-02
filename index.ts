#!/usr/bin/env node

import 'dotenv/config'

import { Command } from 'commander';
import pkg from './package.json';
import CommandProgram from './src/structures/Command';

const program = new Command();

program
  .name(pkg.name)
  .description(pkg.description)
  .version(pkg.version)

CommandProgram.loadCommands(program).then(() => program.parse(process.argv));