import { installPackages } from '../structures/constructors';
import PackageJson from '../structures/constructors/package';
import { createProjectAnswer } from '../structures/answers';
import CommandBase from '../structures/command-base';
import Github from '../services/github';

import { sleep } from 'bucky.js';
import inquirer from 'inquirer';

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

        if (installPackagesAfterTemplate) {
            await sleep(1500);
            await installPackages({
                dependencies: resourceDownloaded.data.package?.dependencies,
                devDependencies: resourceDownloaded.data.package?.devDependencies,
            });
        }
    }
}

export interface ResourceData {
    folders?: string[];
    package?: {
        scripts?: Record<string, string>;
        dependencies?: string[];
        devDependencies?: string[];
    };
}
