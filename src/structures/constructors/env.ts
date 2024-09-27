/* eslint-disable security/detect-non-literal-fs-filename */
import ObjectManager from 'object.mn';
import { isFile } from 'bucky.js';
import dotenv from 'dotenv';

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export class Env {
    public static dotEnvPath = join(global.currentLocal, '.env');

    /**
     * Use essa função para puxar todos os valores do .env
     */
    public static all() {
        return this.content().objectData;
    }

    /**
     * Use para verificar se existe um valor especifico no .env
     *
     * @param name Nome do valor
     */
    public static has(name: string) {
        const content = this.content();

        return content.has(this.formatName(name));
    }

    /**
     * Use para adicionar novos valores no .env
     *
     * @param name Nome do valor
     * @param value Valor
     */
    public static set(name: string, value?: string) {
        const content = this.content();

        content.set(this.formatName(name), value);
        return this.write(content);
    }

    /**
     * Use para deletar valores do .env
     *
     * @param name Nome do valor
     */
    public static delete(name: string) {
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
    public static update(name: string, value?: string) {
        const content = this.content();

        content.update(this.formatName(name), value);
        return this.write(content);
    }

    private static content() {
        const isDotEnv = isFile(this.dotEnvPath);
        if (!isDotEnv) return new ObjectManager({});

        const content = readFileSync(this.dotEnvPath).toString('utf-8');
        return new ObjectManager(dotenv.parse(content));
    }

    private static write(content: ObjectManager) {
        let message = '';

        for (const [name, value] of Object.entries(content.objectData))
            message += `${name}=${value ?? ''}\n`;

        return writeFileSync(this.dotEnvPath, message);
    }

    private static formatName(name: string) {
        return name.toUpperCase().replace(new RegExp(' ', 'gi'), '_');
    }
}
