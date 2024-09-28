/* eslint-disable security/detect-non-literal-fs-filename */
import ObjectManager from 'object.mn';
import { isFile } from 'bucky.js';
import dotenv from 'dotenv';

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export class Env {
    public path: string;

    constructor(public isLocalEnv: boolean = false) {
        this.path = isLocalEnv ? global.envZoxPath : join(global.currentLocal, '.env');
    }

    /**
     * Use essa função para puxar todos os valores do .env
     */
    public all() {
        return this.content().objectData;
    }

    /**
     * Use para verificar se existe um valor especifico no .env
     *
     * @param name Nome do valor
     */
    public has(name: string) {
        const content = this.content();

        return content.has(this.formatName(name));
    }

    /**
     * Use para obter valores do .env
     *
     * @param name Nome do valor
     */
    public get(name: string) {
        const content = this.content();
        const value = content.get(name);

        try {
            return JSON.parse(value);
        } catch (err) {
            return value;
        }
    }

    /**
     * Use para adicionar novos valores no .env
     *
     * @param name Nome do valor
     * @param value Valor
     */
    public set(name: string, value?: any) {
        const content = this.content();

        content.set(this.formatName(name), this.formatValue(value));
        return this.write(content);
    }

    /**
     * Use para deletar valores do .env
     *
     * @param name Nome do valor
     */
    public delete(name: string) {
        const content = this.content();

        content.delete(this.formatName(name));
        return this.write(content);
    }

    /**
     * Use para atualizar valores no .env
     *
     * @param name Nome do valor
     * @param value Valor
     */
    public update(name: string, value?: string) {
        const content = this.content();

        content.update(this.formatName(name), this.formatValue(value));
        return this.write(content);
    }

    private content() {
        const isDotEnv = isFile(this.path);
        if (!isDotEnv) return new ObjectManager({});

        const content = readFileSync(this.path).toString('utf-8');
        return new ObjectManager(dotenv.parse(content));
    }

    private write(content: ObjectManager) {
        let message = '';

        for (const [name, value] of Object.entries(content.objectData))
            message += `${name}=${value ?? ''}\n\n`;

        if (this.isLocalEnv) process.env = { ...process.env, ...content.objectData };
        return writeFileSync(this.path, message);
    }

    private formatValue(value: any) {
        if (!value) return '';

        if (['object', 'array'].includes(typeof value)) return JSON.stringify(value);
        return value.toString().replace(new RegExp(' ', 'gi'), '');
    }

    private formatName(name: string) {
        return name.toUpperCase().replace(new RegExp(' ', 'gi'), '_');
    }
}
