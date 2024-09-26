import { installPackages } from '../structures/constructors';
import PackageJson from '../structures/constructors/package';
import { createProjectAnswer } from '../structures/answers';
import CommandBase from '../structures/command-base';
import Github from '../services/github';
import { Resource } from './resource';

import { sleep } from 'bucky.js';
import inquirer from 'inquirer';

export class Template extends CommandBase {
    public github: Github;

    constructor() {
        super();

        this.github = new Github();
    }

    async run() {
        await createProjectAnswer();

        const templatesAvailable = await this.github.getAllTemplates();
        const { templateName } = await inquirer.prompt({
            type: 'list',
            message: 'Escolha qual template deseja usar:',
            name: 'templateName',
            choices: templatesAvailable.map((template) => template.name),
        });

        const templateDownloaded = await this.github.download('templates', templateName);
        const packageJson = new PackageJson(templateDownloaded.data.package);

        await sleep(1500);
        await packageJson.build();

        await sleep(1500);
        const { addResource } = await inquirer.prompt({
            type: 'confirm',
            name: 'addResource',
            message: 'Deseja adicionar novos recursos para o seu projeto:',
            default: false,
        });
        if (addResource) return await new Resource().run(false);

        await installPackages({
            dependencies: templateDownloaded.data.package?.dependencies,
            devDependencies: templateDownloaded.data.package?.devDependencies,
        });
    }
}

export interface TemplateData {
    folders?: string[];
    resources?: string[];
    package?: {
        name?: string;
        scripts?: Record<string, string>;
        dependencies?: string[];
        devDependencies?: string[];
    };
}
