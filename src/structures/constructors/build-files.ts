import { buildListInConsole } from '../functions';
import { copyFiles } from '../functions';

import ora from 'ora';

import NodePath from 'node:path';

/**
 * Use essa função para construir os arquivos do template
 *
 * @param pathTemplate Caminho do template
 */
export async function buildFiles(files: string[], log: boolean = true) {
    const spinner = log ? ora('Criando arquivos').start() : null;

    try {
        await copyFiles(
            files.map((file) => ({
                path: file,
                destination: resolveDestinationPath(file),
            })),
        );

        const list = files.map((file) => file.split('/').at(-1)!.replace(/.txt/, ''));
        const listMessage = buildListInConsole('Arquivos criados', list);

        if (spinner) spinner.succeed(listMessage);
    } catch (error) {
        if (spinner) spinner.fail('Erro ao construir');
        throw error;
    }
}

function resolveDestinationPath(path: string) {
    // eslint-disable-next-line security/detect-non-literal-regexp
    const pathDestination = path.replace(new RegExp(NodePath.resolve(__dirname, '..'), 'gi'), '');
    const pathDestinationSplitted = pathDestination.split('/');

    return pathDestinationSplitted.slice(4).join('/').replace(/.txt/, '');
}
