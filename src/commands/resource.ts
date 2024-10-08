import { Env, installPackages } from '../structures/constructors';
import PackageJson from '../structures/constructors/package';
import Github from '../services/github';

import { checkbox } from '@inquirer/prompts';

// Types
import type { TemplateData } from './template';

export class Resource {
    public github: Github;

    constructor() {
        this.github = new Github();
    }

    async run(installPackagesAfterTemplate: boolean = true) {
        const resourcesAvailable = await this.github.getAllResources();
        const resourcesName: string[] = await checkbox({
            message: 'Escolha qual recurso adicional deseja usar:',
            choices: resourcesAvailable.map((template) => template.name),
        });

        const resourceDownloaded = await this.github.download('resources', resourcesName);
        const packageJson = new PackageJson(resourceDownloaded.data.package);
        const env = new Env();

        await packageJson.build();

        if (Object.keys(resourceDownloaded.data?.env || {}).length) {
            const templateEnv = resourceDownloaded.data.env;
            env.update('/', { ...env.all(), ...templateEnv });
        }

        if (installPackagesAfterTemplate) {
            await installPackages({
                dependencies: resourceDownloaded.data.package?.dependencies,
                devDependencies: resourceDownloaded.data.package?.devDependencies,
            });
        } else {
            return {
                dependencies: resourceDownloaded.data.package?.dependencies,
                devDependencies: resourceDownloaded.data.package?.devDependencies,
            };
        }
    }
}

export type ResourceData = TemplateData;
