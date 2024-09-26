/* eslint-disable security/detect-non-literal-fs-filename */
import { exec } from '../functions';

import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

import inquirer from 'inquirer';
import ora from 'ora';

export async function createProjectAnswer() {
    const { createProject } = await inquirer.prompt({
        type: 'confirm',
        name: 'createProject',
        message: 'Deseja criar um novo projeto:',
        default: false,
    });

    if (!createProject) return;

    const { projectName } = await inquirer.prompt({
        type: 'input',
        name: 'projectName',
        message: 'Escreva qual vai ser o nome do projeto:',
        validate(input) {
            if (!input.length) return 'Você deve pelo menos escrever algo!';
            return true;
        },
    });

    const spinner = ora().start('Criando projeto...');

    await mkdir(join(global['currentLocal'], projectName), { recursive: true });
    global['currentLocal'] = join(global['currentLocal'], projectName);

    spinner.succeed('Projeto criado');
    return;
}
