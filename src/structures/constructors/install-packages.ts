import { exec } from '../functions';

import ora from 'ora';

// Types
import type { Installers } from '../../program';
import { buildListInConsole } from '../functions';

/**
 * Use essa função para instalar os pacotes do template
 *
 * @param installer Qual instalador deseja usar
 * @param packagesOptions Opções para instalar os pacotes
 */
export async function installPackages(
    installer: Installers,
    { packages, devPackages }: InstallPackagesOptions,
    log: boolean = true,
) {
    if (!packages?.length && !devPackages?.length) return;

    // Instalando pacotes que não são de desenvolvimento
    if (packages?.length) {
        const spinner = log ? ora('Instalando pacotes').start() : null;

        try {
            // Instalando pacotes
            await install({ installer, packages });

            if (spinner) spinner.succeed(buildListInConsole('Pacotes instalados', packages));
        } catch (error) {
            if (spinner) spinner.fail('Erro ao instalar os pacotes');
            throw error;
        }
    }

    // Instalando pacotes para desenvolvimento
    if (devPackages?.length) {
        const spinner = log ? ora('Instalando pacotes de desenvolvimento').start() : null;

        try {
            // Instalando pacotes
            await install({ installer, packages: devPackages, dev: true });

            if (spinner)
                spinner.succeed(
                    buildListInConsole('Pacotes de desenvolvimentos instados', devPackages),
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
    const packages = options.packages.join(' ');
    const isDev = options.dev ? '-D' : '';

    return exec(['cd $(pwd)', `${installerCommand} ${isDev} ${packages}`].join(' && '), true);
}

export interface InstallOptions {
    installer: Installers;
    packages: string[];
    dev?: boolean;
}

export interface InstallPackagesOptions {
    packages?: string[];
    devPackages?: string[];
}
