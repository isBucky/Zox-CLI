import CommandProgram from '../structures/Command';
import { mkdir, writeFile } from 'node:fs/promises';
import fuzzy from 'inquirer-fuzzy-path';
import { Command } from 'commander';
import Git from '../structures/Git';
import { join } from 'node:path';
import inquirer from 'inquirer';
import shell from 'shelljs';
import chalk from 'chalk';

export default class extends CommandProgram {
    constructor(...args: [Command, string]) {
        super('', ...args);

        this.command
            .option('--init')
            .action(this.run.bind(this));

        inquirer.registerPrompt('path', fuzzy)
    }

    async run(options: Options) {
        if (options?.init) return this.initProject();
        
        const exec = (code: string) => new Promise((r) => shell.exec(code, { silent: true }, r));
        const { path, name, installPackages, createRepository } = await inquirer.prompt([
            {
                type: 'path',
                name: 'path',
                message: 'Select a target directory for your project:',
                itemType: 'directory',

                excludePath: (nodePath: string) => nodePath.includes('node_modules'),
                excludeFilter: (nodePath: string) => nodePath == '.',
                default: process.cwd()
            }, {
                type: 'input',
                name: 'name',
                message: 'Type the name of your new project:',

                validate(answer) {
                    if (!answer.length) return 'You have to define a name for the project!';
                    return true;
                }
            }, {
                type: 'confirm',
                name: 'installPackages',
                message: 'Install packages automatically:',
                default: true
            }, {
                type: 'confirm',
                name: 'createRepository',
                message: 'create a github repository for this project:',
                default: false
            }
        ]);

        await mkdir(join(path, name), { recursive: true });
        

        if (installPackages) {
            const { packages } = await inquirer.prompt({
                type: 'input',
                name: 'packages',
                message: 'What extra packages do you want to add:'
            });

            await exec(`cd ${name} && yarn add ` + packages);
            await exec(`cd ${name} && yarn add -D typescript @types/node tsx`);
            await exec(`cd ${name} && npx tsc --init`);
        }

        await exec(`cd ${name} && npm init -y`);
        console.log(chalk.green('!') + chalk.bold.gray(' Project completed successfully'));

        if (createRepository) {
            let client;

            if (!process.env.GIT_AUTH?.length) {
                const { token } = await inquirer.prompt({
                    type: 'password',
                    name: 'token',
                    message: 'Please enter your GitHub token:'
                });

                process.env.GIT_AUTH = token;
                await writeFile(join(path, name, '.env'), 'GIT_AUTH=' + token);

                client = new Git();
                console.log(chalk.green('!') + chalk.bold.gray(' Logged in github: ' + (await client.authenticate())));
            }

            const { description, isPrivate } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'description',
                    message: 'Please enter your description of the repository:',
                    default: null
                }, {
                    type: 'confirm',
                    name: 'isPrivate',
                    message: 'Will the repository be private?',
                    default: true
                }
            ]);

            await client.createRepository({
                name,
                description,
                private: isPrivate
            });

            await exec(`
                cd ${name} &&
                git remote add origin https://github.com/${client.name}/${name}.git &&
                git branch -M main &&
                git push -u origin main
            `);

            console.log(chalk.green('!') + chalk.bold.gray(' Repository created successfully'));
        }
    }

    async initProject() {
        shell.exec('yarn add -D typescript @types/node tsx');
        shell.exec('npm init -y');
        shell.exec('npx tsc --init');
    }
}

interface Options {
    init: boolean;
}