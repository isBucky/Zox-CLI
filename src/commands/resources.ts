import { buildTemplate } from '../structures/constructors/template';
import CommandBase from '../structures/command-base';

import ora from 'ora';

// Types
import type { CommandOptionsToCreateAnswer } from '../program';

export class Resources extends CommandBase {
    constructor() {
        super({
            answers: ['installer', 'resources'],
            forceChooseOne: ['resources'],
        });
    }

    async run(options: CommandOptionsToCreateAnswer) {
        const spinner = ora();

        try {
            await buildTemplate({
                template: 'Resources',

                ...options,
            });

            spinner.succeed('Projeto finalizado');
        } catch (error) {
            spinner.fail('Erro ao construir');
            throw error;
        }
    }
}
