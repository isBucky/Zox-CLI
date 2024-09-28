/* eslint-disable security/detect-non-literal-fs-filename */
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

import { confirm, input } from '@inquirer/prompts';
import ora from 'ora';

export async function createProjectAnswer() {
    const createProject = await confirm({
        message: 'Deseja criar um novo projeto:',
        default: false,
    });

    if (!createProject) return;

    const projectName = await input({
        message: 'Escreva qual vai ser o nome do projeto:',
        required: true,
    });

    const spinner = ora().start('Criando projeto...');

    await mkdir(join(global['currentLocal'], projectName), { recursive: true });
    global['currentLocal'] = join(global['currentLocal'], projectName);

    spinner.succeed('Projeto criado');
    return;
}
