import shell from 'shelljs';
import chalk from 'chalk';

export function exec(code: string, silent?: boolean) {
    return new Promise((r) => shell.exec(code, { silent }, r));
}

/**
 * Usa essa função para criar uma lista no console
 *
 * @param message Mensagem principal
 * @param list Array contendo strings para listar
 */
export function buildListInConsole(message: string, list: string[]) {
    return (
        message +
        `\n${chalk.cyanBright('  ╰---> ')}` +
        list.map((msg) => chalk.gray(msg)).join('\n' + chalk.cyanBright('  ╰---> '))
    );
}

export function unifyArrays<T>(cb: (data: T) => any[], values: T[]) {
    return values.reduce((prev, curr) => {
        prev.push(...(cb(curr) || []));

        return prev;
    }, [] as any[]);
}

export function unifyObjects(cb: (data) => any[], values: object[]) {
    return values.reduce((prev, curr) => {
        return { ...prev, ...(cb(curr) || {}) };
    }, {});
}
