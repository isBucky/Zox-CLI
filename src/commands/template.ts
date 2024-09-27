import { installPackages } from '../structures/constructors';
import PackageJson from '../structures/constructors/package';
import { createProjectAnswer } from '../structures/answers';
import CommandBase from '../structures/command-base';
import { Env } from '../structures/constructors';
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

        if (Object.keys(templateDownloaded.data?.env || {}).length) {
            const templateEnv = templateDownloaded.data.env;
            const env = Env.all();

            Env.update('/', { ...env, ...templateEnv });
        }

        await sleep(1500);
        const { addResource } = await inquirer.prompt({
            type: 'confirm',
            name: 'addResource',
            message: 'Deseja adicionar novos recursos para o seu projeto:',
            default: false,
        });

        if (addResource) {
            const { dependencies, devDependencies } = (await new Resource().run(false))!;

            templateDownloaded.data.package?.dependencies?.push(...(dependencies || []));
            templateDownloaded.data.package?.devDependencies?.push(...(devDependencies || []));
        }

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
        scripts?: Record<string, string>;
        dependencies?: string[];
        devDependencies?: string[];
    };
    env?: Record<string, string | null>;
}
