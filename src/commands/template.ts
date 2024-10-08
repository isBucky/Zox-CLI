import { installPackages } from '../structures/constructors';
import PackageJson from '../structures/constructors/package';
import { createProjectAnswer } from '../structures/answers';
import { Env } from '../structures/constructors';
import Github from '../services/github';
import { Resource } from './resource';

import { select, confirm } from '@inquirer/prompts';
import { sleep } from 'bucky.js';

export class Template {
    public github: Github;
    public description: string;

    constructor() {
        this.github = new Github();
        this.description = 'Use para criar novos templates';
    }

    async run() {
        await createProjectAnswer();

        const templatesAvailable = await this.github.getAllTemplates();
        const templateName: string = await select({
            message: 'Escolha qual template deseja usar:',
            choices: templatesAvailable.map((template) => template.name),
        });

        const templateDownloaded = await this.github.download('templates', templateName);
        const packageJson = new PackageJson(templateDownloaded.data.package);
        const env = new Env();

        await packageJson.build();

        if (Object.keys(templateDownloaded.data?.env || {}).length) {
            const templateEnv = templateDownloaded.data.env;
            env.update('/', { ...env.all(), ...templateEnv });
        }

        const addResource = await confirm({
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
