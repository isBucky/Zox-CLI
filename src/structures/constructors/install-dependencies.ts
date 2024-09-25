import { exec, buildListInConsole } from '../functions';

import ora from 'ora';

// Types
import type { Installers } from '../../program';

/**
 * Use essa função para instalar os pacotes do template
 *
 * @param installer Qual instalador deseja usar
 * @param packagesOptions Opções para instalar os pacotes
 */
export async function installPackages(
    installer: Installers,
    { dependencies, devDependencies }: InstallDependenciesOptions,
    log: boolean = true,
) {
    if (!dependencies?.length && !devDependencies?.length) return;

    // Instalando pacotes que não são de desenvolvimento
    if (dependencies?.length) {
        const spinner = log ? ora('Instalando pacotes').start() : null;

        try {
            // Instalando pacotes
            await install({ installer, dependencies });

            if (spinner) spinner.succeed(buildListInConsole('Pacotes instalados', dependencies));
        } catch (error) {
            if (spinner) spinner.fail('Erro ao instalar os pacotes');
            throw error;
        }
    }

    // Instalando pacotes para desenvolvimento
    if (devDependencies?.length) {
        const spinner = log ? ora('Instalando pacotes de desenvolvimento').start() : null;

        try {
            // Instalando pacotes
            await install({ installer, dependencies: devDependencies, dev: true });

            if (spinner)
                spinner.succeed(
                    buildListInConsole('Pacotes de desenvolvimentos instados', devDependencies),
                );
        } catch (error) {
            if (spinner) spinner.fail('Erro ao instalar pacotes de desenvolvimento');
            throw error;
        }
    }
}

/**
 * Use essa função para instalar pacotes
 */
function install(options: InstallOptions) {
    // Exemplo: npm install ou yarn add
    const installerCommand = `${options.installer} ${options.installer == 'yarn' ? 'add' : 'install'}`;
    const dependencies = options.dependencies.join(' ');
    const isDev = options.dev ? '-D' : '';

    return exec(['cd $(pwd)', `${installerCommand} ${isDev} ${dependencies}`].join(' && '), true);
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
