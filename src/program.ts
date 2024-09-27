/* eslint-disable security/detect-non-literal-fs-filename */
/* eslint-disable security/detect-object-injection */
import * as Commands from './commands/index';

import inquirer from 'inquirer';

import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

// Types
import type CommandBase from './structures/command-base';

export default class Client {
    constructor() {}

    public async start() {
        if (!process.env.GITHUB_TOKEN || typeof process.env.GITHUB_TOKEN !== 'string') {
            const { githubToken } = await inquirer.prompt({
                type: 'password',
                name: 'githubToken',
                message: 'Antes de continuar, informa seu token de acesso do github:',

                validate(input) {
                    if (!input.length) return 'Você é obrigado a definir um token';
                    return true;
                },
            });

            const isTs = __filename.split('.')[1] == 'ts';

            await writeFile(
                join(__dirname, isTs ? '..' : '../..', '.env'),
                'GITHUB_TOKEN=' + githubToken,
            );
        }

        return await this.listCommands();
    }

    public async listCommands() {
        const { commandName } = await inquirer.prompt({
            type: 'list',
            name: 'commandName',
            message: 'Escolha qual ação deseja fazer:',
            choices: Object.keys(Commands),
        });

        const command: CommandBase = new Commands[commandName]();
        return await command['run']();
    }
}

export interface CommandOptionsToCreateAnswer {
    answers: AnswersNames[];
    forceChooseOne?: AnswersNames[];
}

export type AnswersNames = 'installer';
