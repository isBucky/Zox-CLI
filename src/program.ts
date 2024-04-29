import * as Resources from './structures/resources/';
import * as Commands from './commands/index';

import inquirer from 'inquirer';

// Types
import type CommandBase from './structures/command-base';

export default class Client {
    constructor() {}

    public async start() {
        const { commandName } = await inquirer.prompt({
            type: 'list',
            name: 'commandName',
            message: 'Escolha o projeto para ser carregado:',
            choices: Object.keys(Commands),
        });

        // eslint-disable-next-line security/detect-object-injection
        const command: CommandBase = new Commands[commandName]();
        const optionsForCommand: CommandOptionsToCreateAnswer = await this.createAnswers(
            command.options,
        );

        await command['run'](optionsForCommand);
        return;
    }

    public createAnswers(options?: CommandOptionsToCreateAnswerNames) {
        if (!options) return;

        const answers = {
            installer: {
                type: 'list',
                name: 'installer',
                message: 'Selecione qual instalador você deseja usar:',
                choices: ['npm', 'pnpm', 'yarn'] as Installers[],
            },
            resource: {
                type: 'checkbox',
                name: 'resource',
                message: 'Quais recursos adicionais você deseja adicionar ?',
                choices: (<any>Object.keys(Resources)) as ResourcesAvailable,
            },
        };

        // eslint-disable-next-line security/detect-object-injection
        return inquirer.prompt(options.map((name) => answers[name]));
    }
}

export type CommandOptionsToCreateAnswerNames = (keyof CommandOptionsToCreateAnswer)[];

export interface CommandOptionsToCreateAnswer {
    installer: Installers;
    resource: ResourcesAvailable;
}

export type Installers = 'npm' | 'pnpm' | 'yarn';

export type ResourcesAvailable = (keyof typeof Resources)[];
