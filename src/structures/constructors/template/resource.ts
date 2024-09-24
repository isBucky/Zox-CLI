import * as Resources from '../../resources';

import NodePath from 'node:path';

import { glob } from 'glob';

// Types
import type { ResourcesAvailable } from '../../../program';

/**
 * Use essa função carregar os recursos adicionais
 *
 * @param resources Recursos adicionais
 */
export async function loadResources(resources: ResourcesAvailable) {
    const [folders, files, packages, devPackages] = <string[][]>[[], [], [], []];

    for (const resourceName of resources) {
        // eslint-disable-next-line security/detect-object-injection
        const resource = Resources[resourceName];
        const resourceData = resource.data;

        const resourceFilesPath = NodePath.join(resource.path, 'files');
        const templateFiles = await glob(resourceFilesPath + '/**/*', { dot: true });

        files.push(...templateFiles);
        folders.push(...(resourceData.folders || []));
        packages.push(...(resourceData.packages || []));
        devPackages.push(...(resourceData.devPackages || []));
    }

    return {
        folders,
        files,
        packages,
        devPackages,
    } satisfies ResourcesResult;
}

export interface ResourcesResult {
    files: string[];
    folders: string[];
    packages: string[];
    devPackages: string[];
}
