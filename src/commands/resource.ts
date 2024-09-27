import { Env, installPackages } from '../structures/constructors';
import PackageJson from '../structures/constructors/package';
import CommandBase from '../structures/command-base';
import Github from '../services/github';

import { sleep } from 'bucky.js';
import inquirer from 'inquirer';

// Types
import type { TemplateData } from './template';

export class Resource extends CommandBase {
    public github: Github;

    constructor() {
        super();

        this.github = new Github();
    }

    async run(installPackagesAfterTemplate: boolean = true) {
        const resourcesAvailable = await this.github.getAllResources();
        const { resourcesName }: { resourcesName: string[] } = await inquirer.prompt({
            type: 'checkbox',
            message: 'Escolha qual recurso adicional deseja usar:',
            name: 'resourcesName',
            choices: resourcesAvailable.map((template) => template.name),
        });

        const resourceDownloaded = await this.github.download('resources', resourcesName);
        const packageJson = new PackageJson(resourceDownloaded.data.package);

        await sleep(1500);
        await packageJson.build();

        if (Object.keys(resourceDownloaded.data?.env || {}).length) {
            const templateEnv = resourceDownloaded.data.env;
            const env = Env.all();

            Env.update('/', { ...env, ...templateEnv });
        }

        if (installPackagesAfterTemplate) {
            await sleep(1500);
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
