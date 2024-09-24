import { loadResources, type ResourcesResult } from './resource';
import * as Templates from '../../templates';

import { removeArrayDuplicates } from 'bucky.js';
import { glob } from 'glob';

import NodePath from 'node:path';

// Types
import type { ResourcesAvailable } from '../../../program';
import type { BuildProjectOptions } from '..';

/**
 * Função usado para resolver as opções de configuração dos templates disponíveis
 *
 * @param options Opções de configuração do template
 */
export async function buildTemplateOptions(options: BuildProjectOptions) {
    const template = Templates[options.template];
    const templateFilesPath = NodePath.join(template.path, 'files');
    const templateFiles = await glob(templateFilesPath + '/**/*', { dot: true });

    const [files, folders, packages, devPackages] = <string[][]>[
        templateFiles,
        template.data.folders || [],
        template.data.packages || [],
        template.data.devPackages || [],
    ];

    // Procurando e resolvendo recursos adicionais
    if (options.resources?.length || template.data.resources?.length) {
        const resourceData = await loadResources(
            <ResourcesAvailable>(
                removeArrayDuplicates(
                    (<any[]>[]).concat(options.resources, template.data.resources),
                ).filter(Boolean)
            ),
        );

        files.push(...resourceData.files);
        folders.push(...resourceData.folders);
        packages.push(...resourceData.packages);
        devPackages.push(...resourceData.devPackages);
    }

    return {
        folders: removeArrayDuplicates(folders).filter(Boolean),
        files: removeArrayDuplicates(files).filter(Boolean),
        packages,
        devPackages,
    } satisfies TemplateResult;
}

export type TemplateResult = ResourcesResult;
