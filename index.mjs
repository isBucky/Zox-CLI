#!/usr/bin/env node

'use strict';

import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { Command } from 'commander';

const
  __dirname = import.meta.url.slice(7, import.meta.url.lastIndexOf('/')),
  __filename = import.meta.url.slice(7);
  
class BuilderProgram extends Command {
  constructor() {
    super();
    
    this.name('create');
    this.description('A command line (CLI) to facilitate the creation of projects (private).');
    this.version('1.0.0');
    
    this.loadCommands();
  }
  
  loadCommands() {
    readdirSync(resolve(__dirname, 'src', 'structures', 'commands'))
      .filter(i => i.endsWith('.js'))
      .forEach(async(file, i, arr) => {
        try {
          let CommandLine = (await import(resolve(__dirname, 'src', 'structures', 'commands', file))).default;
          CommandLine = new CommandLine(this);
          return CommandLine.run(this.command(CommandLine.name));
        }
        catch(_) { console.log(_) }
        finally {
          if ((i + 1) == arr.length) return this.parse(process.argv);
        }
      });
  }
}

new BuilderProgram();