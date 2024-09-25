import { type InstallDependenciesOptions, installPackages, createFolders, buildFiles } from '../';
import { buildTemplateOptions } from './template-options';
import PackageJson, { PackageOptions } from '../package';
import * as Templates from '../../templates';

// Types
import type { Installers, ResourcesAvailable } from '../../../program';

/**
 * Use essa função para construir templates
 *
 * @param options Opções de configuração do construtor
 */
export async function buildTemplate(options: BuildProjectOptions) {
    const data = await buildTemplateOptions(options);
    const packageJson = new PackageJson({ scripts: data.package.scripts });

    // Construindo package.json
    await packageJson.build();

    // Criando pastas solicitadas
    if (data.folders?.length) await createFolders(data.folders);

    // Copiando arquivos do template
    if (data.files.length) await buildFiles(data.files);

    // Instalando pacotes
    if (options.installer)
        await installPackages(options.installer, {
            dependencies: data.package.dependencies,
            devDependencies: data.package.devDependencies,
        });
}

export interface BuildProjectOptions {
    template: keyof typeof Templates;
    installer?: Installers;
    resources?: ResourcesAvailable;
}

export interface Template {
    path: string;
    data: {
        package?: InstallDependenciesOptions & PackageOptions;
        resources?: ResourcesAvailable[];
        folders?: string[];
    };
}
