import * as Resources from '../resources';

import NodePath from 'node:path';

import { glob } from 'glob';

// Types
import type { ResourcesAvailable } from '../../program';
import type { PackageOptions } from './package';

/**
 * Use essa função carregar os recursos adicionais
 *
 * @param resources Recursos adicionais
 */
export async function loadResources(resources: ResourcesAvailable) {
    const [folders, files, dependencies, devDependencies] = <string[][]>[[], [], [], []];
    let scripts = {};

    for (const resourceName of resources) {
        // eslint-disable-next-line security/detect-object-injection
        const resource = Resources[resourceName];
        const resourceData = resource.data;

        const resourceFilesPath = NodePath.join(resource.path, 'files');
        const templateFiles = await glob(resourceFilesPath + '/**/*', { dot: true });

        files.push(...templateFiles);
        folders.push(...(resourceData.folders || []));
        dependencies.push(...(resourceData.package?.dependencies || []));
        devDependencies.push(...(resourceData.package?.devDependencies || []));

        if (Object.keys(resourceData.package?.scripts || {}).length)
            scripts = {
                ...scripts,

                ...resourceData.package!.scripts,
            };
    }

    return {
        folders,
        files,
        package: {
            scripts,
            dependencies,
            devDependencies,
        },
    } satisfies ResourcesResult;
}

export interface ResourcesResult {
    files: string[];
    folders: string[];
    package: PackageOptions & {
        dependencies: string[];
        devDependencies: string[];
    };
}
