/* eslint-disable security/detect-object-injection */
import * as Resources from './structures/resources/';
import * as Commands from './commands/index';

import inquirer, { QuestionCollection } from 'inquirer';

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

        const command: CommandBase = new Commands[commandName]();
        const optionsForCommand = await this.createAnswers(command.options);

        await command['run'](optionsForCommand);
        return;
    }

    public createAnswers(options?: CommandOptionsToCreateAnswer) {
        if (!options) return;

        const answers = {
            installer: {
                type: 'list',
                name: 'installer',
                message: 'Selecione qual instalador você deseja usar:',
                choices: ['npm', 'pnpm', 'yarn'] as Installers[],
                default: 'pnpm',
            } as QuestionCollection,

            resources: {
                type: 'checkbox',
                name: 'resources',
                message: 'Quais recursos adicionais você deseja adicionar ?',
                choices: Object.keys(Resources) as ResourcesAvailable,
            } as QuestionCollection,
        };

        if (options.forceChooseOne?.length) {
            for (const answerName of options.forceChooseOne) {
                answers[answerName] = {
                    ...answers[answerName],

                    validate(input) {
                        if (!input.length) return 'Você deve pelo menos selecionar uma opção';
                        return true;
                    },
                };
            }
        }

        return inquirer.prompt(options.answers.map((name) => answers[name]));
    }
}

export interface CommandOptionsToCreateAnswer {
    answers: AnswersNames[];
    forceChooseOne?: AnswersNames[];
}

export type AnswersNames = 'installer' | 'resources';

export type Installers = 'npm' | 'pnpm' | 'yarn';

export type ResourcesAvailable = (keyof typeof Resources)[];
