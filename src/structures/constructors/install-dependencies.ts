import { exec, buildListInConsole } from '../functions';

import { sleep } from 'bucky.js';
import inquirer from 'inquirer';
import ora from 'ora';

/**
 * Use essa função para instalar os pacotes do template
 *
 * @param installer Qual instalador deseja usar
 * @param packagesOptions Opções para instalar os pacotes
 */
export async function installPackages({
    dependencies,
    devDependencies,
}: InstallDependenciesOptions) {
    if (!dependencies?.length && !devDependencies?.length) return;

    const { installer } = await inquirer.prompt({
        type: 'list',
        message: 'Qual instalador você usa:',
        name: 'installer',
        choices: ['npm', 'pnpm', 'yarn'] as Installers[],
        default: 'pnpm',
    });

    const spinner = ora().start('Fazendo a instalação dos pacotes e pacotes de desenvolvimento...');

    await Promise.all([
        dependencies?.length ? install({ installer, dependencies }) : undefined,
        devDependencies?.length
            ? install({ installer, dependencies: devDependencies, dev: true })
            : undefined,
    ]);

    await sleep(1500);
    if (dependencies?.length)
        spinner.info(
            buildListInConsole(
                `Total de ${dependencies?.length} pacotes foram instalados`,
                dependencies,
            ),
        );

    if (devDependencies?.length)
        spinner.info(
            buildListInConsole(
                `Total de ${dependencies?.length} pacotes de desenvolvimento foram instalados`,
                devDependencies,
            ),
        );

    spinner.succeed('Todos os pacotes foram instalados');
}

/**
 * Use essa função para instalar pacotes
 */
function install(options: InstallOptions) {
    // Exemplo: npm install ou yarn add
    const installerCommand = `${options.installer} ${options.installer == 'npm' ? 'install' : 'add'}`;
    const dependencies = options.dependencies.join(' ');
    const isDev = options.dev ? '-D ' : '';

    return exec(
        [`cd ${global['currentLocal']}`, `${installerCommand} ${isDev} ${dependencies}`].join(
            ' && ',
        ),
        true,
    );
}

export interface InstallOptions {
    installer: Installers;
    dependencies: string[];
    dev?: boolean;
}

export interface InstallDependenciesOptions {
    dependencies?: string[];
    devDependencies?: string[];
}

export type Installers = 'npm' | 'pnpm' | 'yarn';
