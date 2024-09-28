import inquirer from 'inquirer';

export class Repository {
    constructor() {}

    async run() {
        const answers = await inquirer.prompt({
            type: 'list',
            name: 'actionName',
            message: 'Qual função deseja usar:',
            choices: ['Usar repositório'],
        });
    }
}
