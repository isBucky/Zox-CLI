/* eslint-disable security/detect-non-literal-fs-filename */
import { buildListInConsole, exec } from '../functions';

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { omit } from '@suptreze/shared/functions';
import { isFile, sleep } from 'bucky.js';
import ObjectManager from 'object.mn';
import ora from 'ora';

export default class PackageJson {
    public packagePath: string;
    private modifications: ObjectManager;

    constructor(options?: PackageOptions) {
        this.packagePath = join(global['currentLocal'], 'package.json');
        this.modifications = new ObjectManager({});

        if (Object.keys(options || {}).length) this.modifications.set('/', options);
    }

    /**
     * Use essa função para obter os valores no arquivo package.json
     */
    private async packageJson() {
        const content = await readFile(this.packagePath);
        return new ObjectManager(JSON.parse(content.toString()));
    }

    /**
     * Essa função é usada para modificar e escrever as alterações no
     * package.json
     *
     * @note Todos o objetos contidos no package.json como "scripts",
     * "dependencies", etc. Devem puxar o valor atual e adicionar o modificado
     */
    private async modifyPackage() {
        const packageJson = await this.packageJson();

        packageJson.update('/', {
            ...packageJson.objectData,
            ...omit(this.modifications.objectData, ['scripts', 'devDependencies', 'dependencies']),

            scripts: {
                ...this.modifications.get('scripts'),

                ...packageJson.get('scripts'),
            },
        });

        return await writeFile(this.packagePath, JSON.stringify(packageJson.objectData, null, 4));
    }

    /**
     * Para verificar se existe um package.json na pasta
     */
    public get existsPackageJson() {
        return isFile(this.packagePath);
    }

    /**
     * Use essa função para construir o package.json do projeto
     */
    public async build() {
        const sleepTime = 1500;
        const spinner = ora().start('Verificando integridade do package.json...');

        await sleep(sleepTime);
        if (this.existsPackageJson && this.modifications.keys('/').length) {
            spinner.start('Adicionando modificações no existente package.json...');

            await sleep(sleepTime);
            await this.modifyPackage();

            return spinner.succeed(
                buildListInConsole(
                    'Modificações feitas no existente package.json',
                    this.modifications.keys('/'),
                ),
            );
        }

        if (this.existsPackageJson)
            return spinner.succeed('Já existe um package.json neste projeto');

        try {
            spinner.start('Criando um novo package.json...');
            await exec(`cd ${global['currentLocal']} && npm init -y`, true);
            spinner.info('Package.json criado');

            if (this.modifications.keys('/').length) {
                await sleep(sleepTime);
                spinner.start('Fazendo modificações package.json...');

                await this.modifyPackage();
                return spinner.succeed(
                    buildListInConsole(
                        'Modificações feitas no package.json',
                        this.modifications.keys('/'),
                    ),
                );
            }
        } catch (error) {
            spinner.fail('Erro ao construir o package.json');
            throw error;
        }
    }

    /**
     * Use para adicionar novos scripts no package.json do projeto
     *
     * @param name Nome do script (Não use espaços no nome)
     * @param value Qual o comando que esse script ira fazer
     */
    public addScript(name: string, value: string) {
        this.modifications.set('scripts/' + name, value);

        return true;
    }

    /**
     * Use para adicionar novos scripts no package.json do projeto
     *
     * @param scripts Objeto com vários scripts para adicionar no package.json
     */
    public addScripts(scripts: Record<string, string>) {
        this.modifications.set('scripts', {
            ...scripts,
            ...this.modifications.get('scripts'),
        });

        return true;
    }
}

export interface PackageOptions {
    /**
     * Use para adicionar novos scripts no package.json do projeto
     */
    scripts?: Record<string, string>;
}
