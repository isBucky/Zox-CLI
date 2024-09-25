/* eslint-disable security/detect-non-literal-fs-filename */
import { exec } from '../functions';

import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { omit } from '@suptreze/shared/functions';
import ObjectManager from 'object.mn';
import { isFile } from 'bucky.js';
import ora from 'ora';

export default class PackageJson {
    public packagePath: string;
    private modifications: ObjectManager;

    constructor(options?: PackageOptions) {
        this.packagePath = join(process.cwd(), 'package.json');
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
            ...omit(this.modifications.objectData, ['scripts']),

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
        const spinner = ora().start('Verificando integridade do package.json...');

        if (this.existsPackageJson && this.modifications.keys('/').length) {
            spinner.info('Package.json já existe no projeto');
            spinner.start('Adicionando recursos adicionais no package.json...');

            await this.modifyPackage();
            return spinner.succeed('Recursos adicionados');
        }

        if (this.existsPackageJson)
            return spinner.succeed('Já existe um package.json neste projeto');

        try {
            spinner.start('Criando um novo package.json...');
            await exec(`cd ${process.cwd()} && npm init -y`, true);

            if (this.modifications.keys('/').length) {
                spinner.start('Adicionando recursos adicionais no package.json...');
                await this.modifyPackage();

                spinner.info('Recursos adicionados.');
                return spinner.succeed('Package.json criado e alterado com êxito.');
            } else {
                return spinner.succeed('Package.json criado');
            }
        } catch (error) {
            spinner.fail('Erro ao construir o package.json');
            throw error;
        }
    }

    /**
     * Use para trocar o nome do projeto no package.json
     *
     * @param name Novo nome do projeto no package.json
     */
    public addName(name: string) {
        this.modifications.set('name', name);
        return true;
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
     * Nome que será dado ao projeto no package.json
     *
     * @note Não coloque nomes com espaço em branco
     */
    name?: string;
    /**
     * Use para adicionar novos scripts no package.json do projeto
     */
    scripts?: Record<string, string>;
}
