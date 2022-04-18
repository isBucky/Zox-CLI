'use strict';

class Command {
  constructor(program, file) {
    this.name = file.split('.')[0].toLowerCase();
    this.program = program;
  }
}

module.exports = Command;