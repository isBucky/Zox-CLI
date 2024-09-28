import { buildListInConsole, unifyArrays, unifyObjects } from '../../structures/functions';
import { copyFilesFromGithub } from './copy-files';
import { createFolders } from './create-folders';
import { resolveResource } from './resource';

import axios, { type AxiosInstance } from 'axios';
import { formatSizeUnits, sleep } from 'bucky.js';
import ora from 'ora';

// Types
import type { TemplateData } from '../../commands';

export default class Github {
    public owner: string;
    public repoName: string;
    public token: string;

    constructor() {
        this.owner = process.env.GITHUB_OWNER!;
        this.repoName = process.env.GITHUB_REPO!;
        this.token = process.env.GITHUB_TOKEN!;
    }

    public get instance() {
        return axios.create({
            baseURL: `https://api.github.com/repos/${this.owner}/${this.repoName}/`,
            headers: {
                Authorization: 'Bearer ' + this.token,
                'X-GitHub-Api-Version': '2022-11-28',
            },
        });
    }

    public async getAllTemplates() {
        return (await this.instance.get('contents/templates')).data as GetAllResult;
    }

    public async getAllResources() {
        return (await this.instance.get('contents/resources')).data as GetAllResult;
    }

    public async getContents(type: Types, names: string[]) {
        const contents = await Promise.all(names.map((name) => this.getContent(type, name)));
        return (<GetContentResult['tree']>[]).concat(...contents);
    }

    public async getContent(type: Types, name: string) {
        let sha: string;

        if (type == 'resources') {
            const resources = await this.getAllResources();
            const resource = resources.find((data) => data.name == name);

            if (!resource) throw new Error('Não existe um recurso com esse nome');
            sha = resource.sha;
        } else {
            const templates = await this.getAllTemplates();
            const template = templates.find((data) => data.name == name);

            if (!template) throw new Error('Não existe um template com esse nome');
            sha = template.sha;
        }

        const content = (await this.instance.get(`/git/trees/${sha}?recursive=1`))
            .data as GetContentResult;

        return content.tree;
    }

    public async download(type: Types, name: string | string[]) {
        const sleepTime = 1500;
        const spinnerFirst = ora().start(
            type == 'templates'
                ? `Construindo o template ${name}...\n`
                : `Adicionando os recursos ${typeof name == 'string' ? name : name.join(', ')}...\n`,
        );

        await sleep(sleepTime);
        spinnerFirst.start('Adquirindo conteúdo...');

        try {
            const content =
                typeof name == 'string'
                    ? await this.getContent(type, name)
                    : await this.getContents(type, name);
            const templateData = await this.getData(content);
            let scripts = templateData.package?.scripts || {};
            let env = templateData.env || {};

            spinnerFirst.info('Conteúdo adquirido');

            // Arrays
            let files = content.filter((file) => file.type == 'blob' && file.path !== 'data.json');
            let folders = (<string[]>[]).concat(
                content.filter((i) => i.type == 'tree').map((i) => i.path),
                templateData?.folders || [],
            );
            let dependencies = templateData.package?.dependencies || [];
            let devDependencies = templateData.package?.devDependencies || [];

            // Metrics
            let downloadSize = files.reduce((a, file) => a + (file?.size || 0), 0);

            if (type == 'templates' && templateData?.resources?.length) {
                spinnerFirst.start('Recursos adicionais detectado, adicionando-os...');

                await sleep(sleepTime);
                const resources = await Promise.all(
                    templateData.resources.map((r) => resolveResource(this, r)),
                );

                downloadSize += resources.reduce((i, r) => i + r.downloadSize, 0);
                folders = folders.concat(...resources.map((r) => r.data.folders || []));
                files = files.concat(...resources.map((f) => f.files || []));

                scripts = {
                    ...scripts,
                    ...resources.reduce(
                        (acc, curr) => ({ ...acc, ...curr.data.package?.scripts }),
                        {},
                    ),
                };

                env = {
                    ...env,
                    ...resources.reduce((acc, curr) => ({ ...acc, ...curr.data.env }), {}),
                };

                dependencies = dependencies.concat(
                    ...resources.map((d) => d.data.package?.dependencies || []),
                );

                devDependencies = devDependencies.concat(
                    ...resources.map((d) => d.data.package?.devDependencies || []),
                );

                spinnerFirst.info(
                    buildListInConsole('Recursos adicionados', templateData.resources),
                );
            }

            if (folders.length) {
                spinnerFirst.start('Criando as pastas...');

                await sleep(sleepTime);
                await createFolders(folders);

                spinnerFirst.info(
                    buildListInConsole('Total de pastas criadas: ' + folders.length, folders),
                );
            }

            if (files.length) {
                spinnerFirst.start(
                    `Total de ${files.length} arquivos - ${formatSizeUnits(downloadSize)} sendo baixados do github no momento...`,
                );

                await sleep(sleepTime);
                await copyFilesFromGithub(this, files);

                spinnerFirst.info(
                    buildListInConsole(
                        `Total de ${files.length} arquivos - ${formatSizeUnits(downloadSize)} foram baixados`,
                        files.map((i) => i.path),
                    ),
                );
            }

            spinnerFirst.succeed(
                type == 'templates'
                    ? `Template ${name} construído`
                    : `Os recursos ${typeof name == 'string' ? name : name.join(', ')} foram adicionados`,
            );
            return {
                downloadSize,
                filesDownloaded: files.length,

                folders,
                files,

                data: {
                    ...templateData,

                    package: {
                        ...templateData.package,

                        dependencies,
                        devDependencies,
                        scripts,
                    },
                } as TemplateData,
            };
        } catch (error) {
            spinnerFirst.fail(`Ocorreu um erro ao tentar fazer download do ${type}`);
            throw error;
        }
    }

    public async getData<T extends TemplateData>(tree: GetContentResult['tree']) {
        const files = tree.filter((data) => data.path == 'data.json');
        if (!files.length) return {} as T;

        if (files.length == 1) {
            const result = await this.instance.get(`git/blobs/${files[0].sha}`);
            return <T>JSON.parse(atob(result.data.content));
        }

        const requestResult = await Promise.all(
            files.map((file) => this.instance.get(`git/blobs/${file.sha}`)),
        );
        const results = requestResult.map((result) => JSON.parse(atob(result.data.content)));

        return {
            folders: unifyArrays((data) => data.folders, results),
            package: {
                dependencies: unifyArrays((data) => data.package?.dependencies, results),
                devDependencies: unifyArrays((data) => data.package?.devDependencies, results),
                scripts: unifyObjects((data) => data.package?.scripts, results),
            },
        } as T;
    }
}

export type Unify = (cb: UnifyDataFunction, data: Array<any> | object) => string[];

export type UnifyDataFunction = (data: TemplateData) => any;

export type Types = 'resources' | 'templates';

export type GetContentResult = {
    sha: string;
    url: string;
    tree: {
        path: string;
        mode: string;
        type: 'blob' | 'tree';
        sha: string;
        size?: number;
        url: string;
    }[];
    truncated: boolean;
};

export type GetAllResult = {
    name: string;
    path: string;
    sha: string;
    size: number;
    url: string;
    html_url: string;
    git_url: string;
}[];
