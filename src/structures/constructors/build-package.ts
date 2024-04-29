import { exec } from '../functions';

import ora from 'ora';

/**
 * Use essa função para criar o package.json
 */
export async function buildPackage(log: boolean = true) {
    const spinner = log ? ora('Criando package.json').start() : null;

    try {
        await exec(`cd ${process.cwd()} && npm init -y`, true);
        if (spinner) spinner.succeed('Package.json criado');
    } catch (error) {
        if (spinner) spinner.fail('Erro ao construir');
        throw error;
    }
}
