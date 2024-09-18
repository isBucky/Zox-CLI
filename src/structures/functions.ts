import { isFile, isDirectory } from 'bucky.js';
import shell from 'shelljs';

import Fs from 'node:fs/promises';

export function exec(code: string, silent?: boolean) {
    return new Promise((r) => shell.exec(code, { silent }, r));
}

/**
 * Use essa função para copiar arquivos
 *
 * @param options Dados para copiar os arquivos
 */
export async function copyFiles(options: CopyOptions[]) {
    for (const option of options) {
        const { path: filePath, destination } = option;
        if (!isFile(filePath)) continue;

        const directory = destination.split('/').slice(0, -1).join('/');
        if (!isDirectory(directory))
            throw new Error('O diretório do caminho não existe: ' + directory);
        // await createFolders([directory], false);

        await Fs.copyFile(filePath, destination);
    }
}

export interface CopyOptions {
    path: string;
    destination: string;
}
