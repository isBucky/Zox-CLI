import chalk from 'chalk';

/**
 * Usa essa função para criar uma lista no console
 *
 * @param message Mensagem principal
 * @param list Array contendo strings para listar
 */
export function buildList(message: string, list: string[]) {
    return (
        message +
        `\n${chalk.cyanBright('  ╰---> ')}` +
        list.map((msg) => chalk.gray(msg)).join('\n' + chalk.cyanBright('  ╰---> '))
    );
}
