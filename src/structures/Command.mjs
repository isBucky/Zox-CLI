'use strict';

class Command {
  constructor(program, name) {
    this.name = name.split('/').at(-1).split('.')[0].toLowerCase();
    this.program = program;
  }
}

export default Command;