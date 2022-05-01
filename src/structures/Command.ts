'use strict';

abstract class Command {
  public name: string;
  public program: object;
  
  constructor(program: object, file: string) {
    this.name = file.split('.')[0].toLowerCase();
    this.program = program;
  }
}

export default Command;