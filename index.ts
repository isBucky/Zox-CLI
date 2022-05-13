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
  
  public async loadCommands(): Promise<void> {
    let files = readdirSync(resolve(__dirname, 'src', 'structures', 'commands'))
      .filter(i => i.endsWith('.js'));
      
    for (let [index, file] of files.entries()) {
      try {
        let Command = require(`./src/structures/commands/${file}`).default;
          Command = new Command(this, file);
        Command.run(this.command(Command.name));
      }
      catch(_) {}
      finally {
        if ((Number(index) + 1) == files.length) await this.parseAsync(process.argv);
      }
    }
  }
}

new BuilderProgram();