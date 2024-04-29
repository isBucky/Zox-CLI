import { buildTemplate } from '../structures/constructors/build-template';
import CommandBase from '../structures/command-base';

import ora from 'ora';

// Types
import type { CommandOptionsToCreateAnswer } from '../program';

export class InitProject extends CommandBase {
    constructor() {
        super(['installer', 'resource']);
    }

    async run(options: CommandOptionsToCreateAnswer) {
        const spinner = ora();

        try {
            await buildTemplate({
                template: 'InitProject',

                ...options,
            });

            spinner.succeed('Projeto finalizado');
        } catch (error) {
            spinner.fail('Erro ao construir');
            throw error;
        }
    }
}
