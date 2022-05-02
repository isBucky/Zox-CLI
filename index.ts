#!/usr/bin/env node

'use strict';

import _package from './package.json';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { Command } from 'commander';

class BuilderProgram extends Command {
  constructor() {
    super();
    
    this.name('builder');
    this.description(_package.description);
    this.version(_package.version);
    
    this.loadCommands();
  }
  
  public loadCommands(): void {
    readdirSync(resolve(__dirname, 'src', 'structures', 'commands'))
      .filter(i => i.endsWith('.js'))
      .forEach(async(file, i, arr) => {
        try {
          let CommandLine = (awair import(resolve(__dirname, 'src', 'structures', 'commands', file))).default;
            CommandLine = new CommandLine(this, file);
          return CommandLine.run(this.command(CommandLine.name));
        }
        catch(_) { console.log(_) }
        finally {
          if ((i + 1) == arr.length) await this.parseAsync(process.argv);
        }
      });
  }
}

new BuilderProgram();