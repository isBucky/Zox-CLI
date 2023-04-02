import { Command } from 'commander';
import { join } from 'node:path';
import glob from 'glob';

export default abstract class CommandProgram {
    public name: string;
    public description: string | void;
    public command: Command;

    constructor(description: string, program: Command, filePath: string) {
        let name = ((filePath?.split('/')?.at(-1))?.split('.')[0])?.toLowerCase() as string;

        this.name = name;
        this.description = description;
        this.command = program.command(name);

        this.command.description(description ?? '');
    }

    static loadCommands(program: Command) {
        return new Promise(async(resolve, reject) => {
            const files = await glob(join(__dirname, '..', 'commands') +'/**/*.js');
            if (!files.length) return reject(new Error('No commands'));

            for (let [index, file] of files.entries()) {
                let command = require(file).default;
                if (command instanceof Command) continue;

                new command(program, file);
                if ((index + 1) == files.length) return resolve(true);
            }
        });
    }
}