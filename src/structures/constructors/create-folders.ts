import { buildList } from './build-list';

import ora from 'ora';

import { mkdir } from 'node:fs/promises';

/**
 * Use essa função para criar novas pastas
 *
 * @param paths Caminhos para criar as pastas
 */
export async function createFolders(paths?: string[], log: boolean = true) {
    if (!paths || !paths.length) return;

    const spinner = log ? ora('Criando pastas').start() : null;

    for (const folder of paths) {
        try {
            // eslint-disable-next-line security/detect-non-literal-fs-filename
            await mkdir(folder, { recursive: true });
        } catch (error) {
            if (spinner) spinner.fail('Erro ao construir');
            throw error;
        }
    }

    if (spinner) spinner.succeed(buildList('Pastas criadas', paths));

    return;
}
