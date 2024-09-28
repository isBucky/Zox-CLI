/* eslint-disable security/detect-object-injection */
import { Env } from './structures/constructors';
import * as Commands from './commands/index';

import { password, select } from '@inquirer/prompts';

export default class Client {
    constructor() {}

    public async start() {
        const env = new Env(true);

        if (!env.has('GITHUB_TOKEN')) {
            try {
                const githubToken = await password({
                    message: 'Antes de continuar, informa seu token de acesso do github:',
                    mask: '*',

                    validate(input) {
                        if (!input.length) return 'Você é obrigado a definir um token';
                        return true;
                    },
                });

                env.set('GITHUB_TOKEN', githubToken);
            } catch (error: any) {
                if (error['message'] == 'User force closed the prompt with 0 null') return;
            }
        }

        if (!env.get('GITHUB_REPO_DEFAULT')?.length || !env.get('GITHUB_OWNER_DEFAULT')?.length) {
            env.set('GITHUB_OWNER_DEFAULT', 'isBucky');
            env.set('GITHUB_REPO_DEFAULT', 'Zox-Template');
        }

        if (!env.get('GITHUB_REPO')?.length || !env.get('GITHUB_OWNER')?.length) {
            env.set('GITHUB_OWNER', process.env.GITHUB_OWNER_DEFAULT);
            env.set('GITHUB_REPO', process.env.GITHUB_REPO_DEFAULT);
        }

        if (!env.has('GITHUB_REPOS') || !env.get('GITHUB_REPOS')?.length) {
            env.set('GITHUB_REPOS', [
                [process.env.GITHUB_OWNER_DEFAULT, process.env.GITHUB_REPO_DEFAULT],
            ]);
        }

        return await this.listCommands();
    }

    public async listCommands() {
        const commands = Object.assign(
            {},
            ...Object.keys(Commands).map((CommandName) => ({
                [CommandName]: new Commands[CommandName](),
            })),
        );

        try {
            const commandName = await select({
                message: 'Escolha qual ação deseja fazer:',
                choices: Object.entries(commands).map(([name, value]) => {
                    return {
                        value: name,
                        description: value!['description'] ?? '',
                    };
                }),
            });

            return await commands[commandName]['run']();
        } catch (error: any) {
            if (error['message'] == 'User force closed the prompt with 0 null') return;
        }
    }
}

export interface CommandOptionsToCreateAnswer {
    answers: AnswersNames[];
    forceChooseOne?: AnswersNames[];
}

export type AnswersNames = 'installer';
