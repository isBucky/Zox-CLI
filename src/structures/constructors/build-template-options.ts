import * as Templates from '../templates/';
import * as Resources from '../resources';

import { removeArrayDuplicates } from 'bucky.js';

import { glob } from 'glob';

import NodePath from 'node:path';

// Types
import type { BuildProjectOptions, InstallPackagesOptions } from './';
import type { ResourcesAvailable } from '../../program';

export async function buildTemplateOption(options: BuildProjectOptions) {
    const [folders, files, packages]: [string[], string[], InstallPackagesOptions[]] = [[], [], []];

    const template = Templates[options.template];
    const templateFilesPath = NodePath.join(template.path, 'files');
    const templateFiles = await glob(templateFilesPath + '/**/*', { dot: true });

    if (template.data.folders?.length) folders.push(...template.data.folders);
    if (templateFiles.length) files.push(...templateFiles);
    if (template.data.packages?.length) packages.push(...template.data.packages);

    if (options.resource?.length || template.data.resources?.length) {
        const resourceData = await loadResources(
            <ResourcesAvailable>(
                removeArrayDuplicates(
                    (<any[]>[]).concat(options.resource, template.data.resources),
                ).filter(Boolean)
            ),
        );

        folders.push(...resourceData.folders);
        files.push(...resourceData.files);
        packages.push(...resourceData.packages);
    }

    return {
        folders: removeArrayDuplicates(folders).filter(Boolean),
        files: removeArrayDuplicates(files).filter(Boolean),
        packages,
    };
}

async function loadResources(resources: ResourcesAvailable) {
    const [folders, files, packages]: [string[], string[], InstallPackagesOptions[]] = [[], [], []];

    for (const resourceName of resources) {
        // eslint-disable-next-line security/detect-object-injection
        const resource = Resources[resourceName];

        const resourceFilesPath = NodePath.join(resource.path, 'files');
        const templateFiles = await glob(resourceFilesPath + '/**/*', { dot: true });

        if (resource.data.folders?.length) folders.push(...resource.data.folders);
        if (templateFiles.length) files.push(...templateFiles);
        if (resource.data.packages?.length) packages.push(...resource.data.packages);
    }

    return {
        folders,
        files,
        packages,
    };
}
