import {
    type InstallPackagesOptions,
    installPackages,
    buildPackage,
    createFolders,
    buildFiles,
    buildTemplateOption,
} from './';
import * as Templates from '../templates';

import { removeArrayDuplicates } from 'bucky.js';
import { glob } from 'glob';

import NodePath from 'node:path';

// Types
import type { Installers, ResourcesAvailable } from '../../program';

/**
 * Use essa função para construir templates
 *
 * @param options Opções de configuração do construtor
 */
export async function buildTemplate(options: BuildProjectOptions) {
    const { folders, files, packages } = await buildTemplateOption(options);

    // // Construindo package.json
    await buildPackage();

    // // Criando pastas solicitadas
    if (folders?.length) await createFolders(folders);

    // // Copiando arquivos do template
    if (files.length) await buildFiles(files);

    // // Instalando pacotes
    if (options.installer) await installPackages(options.installer, packages);
}

export interface BuildProjectOptions {
    template: keyof typeof Templates;
    installer?: Installers;
    resource?: ResourcesAvailable;
}

export interface Template {
    path: string;
    data: TemplateData;
}

export interface TemplateData {
    packages?: InstallPackagesOptions[];
    folders?: string[];
    resources?: ResourcesAvailable[];
}
