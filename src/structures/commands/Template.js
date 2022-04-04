'use strict';

const { writeFile, readFile } = require('node:fs'),
  { mkdir } = require('node:fs/promises'),
  { resolve } = require('node:path');
  
const inquirer = require('inquirer'),
  { sleep } = require('bucky.js'),
  shell = require('shelljs'),
  chalk = require('chalk');
  
const Command = require('../Command.js');

class Template extends Command {
  constructor(program) {
    super(program, __filename);
  }
  
  run(command) {
    command
      .description('Use to create an automatic template.')
      .action((...args) => this.action(...args));
  }
  
  async action(name, _, command) {
    let answers = await inquirer.prompt([{
      name: 'templateName', type: 'rawlist',
      message: 'Which template do you want to use?',
      choices: [
        'react-app', 'react-native', 'next-app',
        'rest-api', 'npm-project'
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
    this.log(chalk.bold('\nLoading template...'));
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
          'index.js', 'package.json', '.gitignore', 'LICENSE',
          'Procfile', '.env', 'src/Server.js',
          
          'src/websocket/Websocket.js', 'src/structures/Database.js',
          'src/structures/I18n.js', 'src/structures/languages/pt-br.json',
          'src/structures/languages/en-us.json', 'src/models/Model.js'
        ]);
        break;
        
      case 'npm-project':
        await this.createDirectories(projectName, [resolve(process.cwd(), projectName)]);
        await sleep(100);
        await this.createFiles(projectName, answers, [
          'index.js', '.gitignore', '.npmignore',
          'README.md', 'package.json', 'LICENSE'
        ]);
        break;
        
      case 'exit': process.exit(1); break;
    }
  }
  
  createDirectories(projectName, dirs) {
    let resolveDirectory = (...args) => resolve(process.cwd(), projectName, ...args),
      directoryName = process.cwd().split('/').at(-1) + !projectName ? '' : `/${projectName}`;
      
    this.log(chalk.bold('Creating directories:'));
    return new Promise(async(res, rej) => {
      for (let i = 0; i < dirs.length; i++) {
        try {
          await mkdir(resolveDirectory(dirs[i]), { recursive: true });
          this.log(chalk.bold(' ╰Directory created successfully:') + chalk.gray(` /${directoryName}/${dirs[i]}`));
        } catch(err) {
          this.log(chalk.red(' ╰Could not create directory:') + chalk.gray(` /${directoryName}/${dirs[i]}`));
        } finally {
          if ((i + 1) == dirs.length) return this.log(chalk.bold(' ╰All directorys created successfully!')) && res(true);
        }
      }
    });
  }
  
  createFiles(projectName, { templateName, installPackages, currentFolder }, files) {
    let resolveDirectory = (...args) => resolve(process.cwd(), !projectName ? '' : projectName, ...args),
      directoryName = process.cwd().split('/').at(-1) + !projectName ? '' : `/${projectName}`;
      
    this.log(chalk.bold('\nCreating the files:'));
    return new Promise((res, rej) => {
      for (let i =0; i < files.length; i++) {
        let fileName = files[i].split('/').at(-1),
            filePath = files[i].split('/').length !== 1
              ? files[i].split('/').slice(0, files[i].split('/').length - 1).join('/')
              : '';
              
        readFile(resolve(__dirname, '..', 'txts', templateName, filePath, `${fileName}.txt`), 'utf8',
          (err, data) => {
            if (err) return this.log(err);
            data = data.replace(new RegExp(`{{projectName}}`, 'gi'), projectName)
              .replace(new RegExp(`{{projectNameLowerCase}}`, 'gi'), projectName.toLowerCase())
              .replace(new RegExp(`{{date}}`, 'gi'), (new Date()).getFullYear());
              
            writeFile(resolveDirectory(files[i]), data, async(err) => {
              if (err) this.log(chalk.red(' ╰Could not create file:') + chalk.gray(` /${directoryName}/${files[i]}`));
              else this.log(chalk.bold(' ╰File created successfully:') + chalk.gray(` /${directoryName}/${files[i]}`));
              
              if ((i + 1) == files.length) {
                this.log(chalk.bold(' ╰All files created successfully!'));
                await sleep(100);
                
                if (installPackages) {
                  this.log(chalk.bold('\nInstalling packages...'));
                  let cmdShell = projectName.length ? `cd ${projectName} && yarn` : `yarn`,
                    { stdout, stderr } = await shell.exec(cmdShell, { silent: true });
                    
                  if (stderr.length) this.log(chalk.red(' -'), chalk.bold('There was an error installing the packages:'), chalk.red(stderr.trim()));
                  this.log(chalk.green('\n +'), chalk.bold('Packages installed successfully!'));
                }
                
                return this.log(chalk.bold('\nConcluded!')) && res(true);
              }
            });
          });
      }
    });
  }
  
  log(...args) {
    return process.stdout.write(args.join(' ') + '\n');
  }
}

module.exports = Template;