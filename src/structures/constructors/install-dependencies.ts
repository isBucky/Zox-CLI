import { exec, buildListInConsole } from '../functions';

import { select } from '@inquirer/prompts';
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

    const installer: Installers = await select({
        message: 'Qual instalador você usa:',
        choices: ['npm', 'pnpm', 'yarn', 'bun'] as Installers[],
        default: 'pnpm',
    });

    const spinner = ora().start('Fazendo a instalação dos pacotes e pacotes de desenvolvimento...');

    if (dependencies?.length) {
        await install({ installer, dependencies });

        spinner.info(
            buildListInConsole(
                `Total de ${dependencies?.length} pacotes foram instalados`,
                dependencies,
            ),
        );
    }

    if (devDependencies?.length) {
        await install({ installer, dependencies: devDependencies, dev: true });

        spinner.info(
            buildListInConsole(
                `Total de ${dependencies?.length} pacotes de desenvolvimento foram instalados`,
                devDependencies,
            ),
        );
    }

    spinner.succeed('Todos os pacotes foram instalados');
}

/**
 * Use essa função para instalar pacotes
 */
function install(options: InstallOptions) {
    // Exemplo: npm install ou yarn add
    const installerCommand = `${options.installer} ${options.installer == 'npm' ? 'install' : 'add'}`;
    const dependencies = options.dependencies.join(' ');
    const isDev = options.dev ? (options.installer == 'bun' ? '-d' : '-D') : '';

    console.log(
        [`cd ${global['currentLocal']}`, `${installerCommand} ${isDev} ${dependencies}`].join(
            ' && ',
        ),
        '\n',
    );

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

export type Installers = 'npm' | 'pnpm' | 'yarn' | 'bun';
