#!/usr/bin/env node

'use strict';

const _package = require('./package.json'),
  { readdirSync } = require('node:fs'),
  { resolve } = require('node:path'),
  { Command } = require('commander');
  
class BuilderProgram extends Command {
  constructor() {
    super();
    
    this.name('builder');
    this.description(_package.description);
    this.version(_package.version);
    
    this.loadCommands();
  }
  
  loadCommands() {
    readdirSync(resolve(__dirname, 'src', 'structures', 'commands'))
      .filter(i => i.endsWith('.js'))
      .forEach(async(file, i, arr) => {
        try {
          let CommandLine = require(resolve(__dirname, 'src', 'structures', 'commands', file));
          CommandLine = new CommandLine(this, file);
          
          console.log(CommandLine);
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