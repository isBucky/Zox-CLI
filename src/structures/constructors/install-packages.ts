import { exec } from '../functions';

import { sleep } from 'bucky.js';
import ora from 'ora';

// Types
import type { Installers } from '../../program';
import { buildList } from './build-list';

/**
 * Use essa função para instalar os pacotes do template
 *
 * @param installer Qual instalador deseja usar
 * @param packagesOptions Opções para instalar os pacotes
 */
export async function installPackages(
    installer: Installers,
    packagesOptions?: InstallPackagesOptions[],
    log: boolean = true,
) {
    if (!packagesOptions || !packagesOptions.length) return;

    const packages = packagesOptions.filter((pkg) => !pkg?.dev);
    const devPackages = packagesOptions.filter((pkg) => pkg.dev);

    // Instalando pacotes que não são de desenvolvimento
    if (packages.length) {
        const spinner = log ? ora('Instalando pacotes').start() : null;

        try {
            const packagesNames = packages.map((pkg) => pkg.name);

            // Instalando pacotes
            await install({
                installer,
                packages: packagesNames,
            });

            if (spinner) spinner.succeed(buildList('Pacotes instalados', packagesNames));
        } catch (error) {
            if (spinner) spinner.fail('Erro ao instalar os pacotes');
            throw error;
        }
    }

    // Instalando pacotes para desenvolvimento
    if (devPackages.length) {
        const spinner = log ? ora('Instalando pacotes de desenvolvimento').start() : null;

        try {
            const packagesNames = devPackages.map((pkg) => pkg.name);

            // Instalando pacotes
            await install({
                installer,
                packages: packagesNames,
                dev: true,
            });

            if (spinner)
                spinner.succeed(buildList('Pacotes de desenvolvimentos instados', packagesNames));
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
    name: string;
    dev?: boolean;
}
