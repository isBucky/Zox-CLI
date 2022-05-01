'use strict';

import { writeFile, readFile } from 'node:fs';
import { mkdir }  from 'node:fs/promises';
import { resolve }  from 'node:path';

import inquirer from 'inquirer';
import { sleep } from 'bucky.js';
import shell from 'shelljs';
import chalk from 'chalk';

import Command from '../Command';

class Template extends Command {
  constructor(program: object, file: string) {
    super(program, file);
  }
  
  public run(command): void {
    command
      .description('Use to create an automatic template.')
      .action(this.action);
  }
  
  public async action(): Promise<void> {
    let answers = await inquirer.prompt([{
      name: 'templateName', type: 'rawlist',
      message: 'Which template do you want to use?',
      choices: [
        'react-app', 'react-native', 'next-app',
        'rest-api', 'websocket-client', 'npm-project'
      ]
    }, {
      name: 'projectName', type: 'input',
      message: 'What will be the name of your project?',
      default: `Unnamed-${Date.now()}`
    }, {
      name: 'currentFolder', type: 'input',
      message: 'Do you want to create this project in the current folder?',
      default: false
    }, {
      name: 'installPackages', type: 'confirm',
      message: 'Do you want it to install packages automatically?',
      default: false
    }]);
    
    let projectName = !answers.currentFolder ? answers.projectName : null;
    console.log(chalk.bold('\nLoading template...'));
    switch(answers.templateName) {
      case 'react-app': break;
      
      case 'react-native': break;
      
      case 'next-app':
        await this.createDirectories(projectName, [ 'src/pages', 'src/styles', 'public' ]);
        await sleep(100);
        await this.createFiles(projectName, answers, [
          'src/pages/_app.jsx', 'src/pages/_document.jsx',
          'src/pages/index.jsx', 'package.json', 'next.config.js'
        ]);
        break;
      
      case 'rest-api':
        await this.createDirectories(projectName, [
          'src/websocket/handlers', 'src/structures/languages',
          'src/routes/controllers', 'src/routes/middlewares',
          'src/models'
        ]);
        await sleep(100);
        await this.createFiles(projectName, answers, [
          'index.ts', 'package.json', '.gitignore', 'LICENSE',
          'Procfile', '.env', 'src/Server.ts',
          
          'src/websocket/Websocket.ts', 'src/structures/Database.ts',
          'src/structures/I18n.ts', 'src/structures/languages/pt-br.json',
          'src/structures/languages/en-us.json', 'src/models/Model.ts'
        ]);
        break;
        
      case 'websocket-client':
        await this.createDirectories(projectName, [
          'src/websocket/handlers', 'src/structures/languages',
          'src/routes/controllers', 'src/routes/middlewares',
          'src/models'
        ]);
        await sleep(100);
        await this.createFiles(projectName, answers, [
          'index.ts', 'package.json', '.gitignore', 'LICENSE',
          'Procfile', '.env', 'src/Server.ts',
          
          'src/websocket/Websocket.ts', 'src/structures/Database.ts',
          'src/structures/I18n.ts', 'src/structures/languages/pt-br.json',
          'src/structures/languages/en-us.json', 'src/models/Model.ts'
        ]);
        break;
        
      case 'npm-project':
        await this.createDirectories(projectName, [resolve(process.cwd(), projectName)]);
        await sleep(100);
        await this.createFiles(projectName, answers, [
          'index.ts', '.gitignore', '.npmignore',
          'README.md', 'package.json', 'LICENSE'
        ]);
        break;
        
      case 'exit': process.exit(1); break;
    }
  }
  
  public createDirectories(projectName: string, dirs: string[]): Promise<boolean> {
    let resolveDirectory = (...args) => resolve(process.cwd(), !projectName ? '' : projectName, ...args),
      resolvedProjectName = !projectName ? process.cwd().split('/').at(-1) : projectName
      
    console.log(chalk.bold('Creating directories:'));
    return new Promise(async(res, rej) => {
      for (let i = 0; i < dirs.length; i++) {
        try {
          await mkdir(resolveDirectory(dirs[i]), { recursive: true });
          console.log(chalk.bold(' ╰Directory created successfully:') + chalk.gray(` /${resolvedProjectName}/${dirs[i]}`));
        } catch(err) {
          console.log(chalk.red(' ╰Could not create directory:') + chalk.gray(` /${resolvedProjectName}/${dirs[i]}`));
        } finally {
          if ((i + 1) == dirs.length) {
            console.log(chalk.bold(' ╰All directorys created successfully!'));
            return res(true);
          }
        }
      }
    });
  }
  
  public createFiles(
    projectName: string,
    { templateName, installPackages, currentFolder }: AnswersOptions,
    files: string[]
  ): Promise<boolean> {
    let resolveDirectory = (...args) => resolve(process.cwd(), projectName ?? '', ...args),
      resolvedProjectName = !projectName ? process.cwd().split('/').at(-1) : projectName;
      
    console.log(chalk.bold('\nCreating the files:'));
    return new Promise((res, rej) => {
      for (let i =0; i < files.length; i++) {
        let fileName = files[i].split('/').at(-1),
            filePath = files[i].split('/').length !== 1
              ? files[i].split('/').slice(0, files[i].split('/').length - 1).join('/')
              : '';
              
        readFile(resolve(__dirname, '..', 'txts', templateName, filePath, `${fileName}.txt`), 'utf8',
          (err, data) => {
            if (err) return console.log(err);
            data = data.replace(new RegExp(`{{projectName}}`, 'gi'), resolvedProjectName)
              .replace(new RegExp(`{{projectNameLowerCase}}`, 'gi'), resolvedProjectName.toLowerCase())
              .replace(new RegExp(`{{date}}`, 'gi'), String ((new Date()).getFullYear()));
              
            writeFile(resolveDirectory(files[i]), data, async(err) => {
              if (err) console.log(chalk.red(' ╰Could not create file:') + chalk.gray(` /${resolvedProjectName}/${files[i]}`));
              else console.log(chalk.bold(' ╰File created successfully:') + chalk.gray(` /${resolvedProjectName}/${files[i]}`));
              
              if ((i + 1) == files.length) {
                console.log(chalk.bold(' ╰All files created successfully!'));
                await sleep(100);
                
                if (installPackages) {
                  console.log(chalk.bold('\nInstalling packages...'));
                  let cmdShell = projectName ? `cd ${projectName} && yarn` : `yarn`,
                    { stdout, stderr } = await shell.exec(cmdShell, { silent: true });
                    
                  if (stderr.length) console.log(chalk.red(' -'), chalk.bold('There was an error installing the packages:'), chalk.red(stderr.trim()));
                  console.log(chalk.green('\n +'), chalk.bold('Packages installed successfully!'));
                }
                
                console.log(chalk.bold('\nConcluded!'));
                return res(true);
              }
            });
          });
      }
    });
  }
}

export interface AnswersOptions {
  templateName: string;
  installPackages: boolean;
  currentFolder: boolean;
}

export default Template;