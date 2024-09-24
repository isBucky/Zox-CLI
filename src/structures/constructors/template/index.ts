import { type InstallPackagesOptions, installPackages, createFolders, buildFiles } from '../';
import { buildTemplateOptions } from './template-options';
import * as Templates from '../../templates';
import { exec } from '../../functions';

import ora from 'ora';

// Types
import type { Installers, ResourcesAvailable } from '../../../program';

/**
 * Use essa função para construir templates
 *
 * @param options Opções de configuração do construtor
 */
export async function buildTemplate(options: BuildProjectOptions) {
    const { folders, files, packages, devPackages } = await buildTemplateOptions(options);

    // Construindo package.json
    await buildPackage();

    // Criando pastas solicitadas
    if (folders?.length) await createFolders(folders);

    // Copiando arquivos do template
    if (files.length) await buildFiles(files);

    // Instalando pacotes
    if (options.installer) await installPackages(options.installer, { packages, devPackages });
}

/**
 * Use essa função para criar o package.json
 */
export async function buildPackage(log: boolean = true) {
    const spinner = log ? ora('Criando package.json').start() : null;

    try {
        await exec(`cd ${process.cwd()} && npm init -y`, true);
        if (spinner) spinner.succeed('Package.json criado');
    } catch (error) {
        if (spinner) spinner.fail('Erro ao construir');
        throw error;
    }
}

export interface BuildProjectOptions {
    template: keyof typeof Templates;
    installer?: Installers;
    resources?: ResourcesAvailable;
}

export interface Template {
    path: string;
    data: InstallPackagesOptions & {
        resources?: ResourcesAvailable[];
        folders?: string[];
    };
}
