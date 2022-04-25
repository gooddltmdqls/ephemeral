#!/usr/bin/env node

import pkg from '../index.js';
import chalk from 'chalk'
import os from 'os';
import fs from 'fs'
import inquirer from 'inquirer';
import { Command } from 'commander';

const app = new Command();

if (!fs.existsSync(`${os.homedir()}/.ephemeral`)) {
    fs.mkdirSync(`${os.homedir()}/.ephemeral`);
    console.log(chalk.cyan('초기 설정이 완료되었습니다!'));
}

app
    .version(pkg.version, '-v, --version', '프로그램의 버전을 표시합니다.')
    .usage('[옵션] 명령어')
    .helpOption('-h, --help', '프로그램의 도움말을 표시합니다.');
app
    .command('backup <name>')
    .description('현재 폴더를 지정한 이름으로 백업합니다.')
    .action(async (name) => {
        let options = app.opts();
        let confirm = true;
        
        if (fs.existsSync(`${os.homedir()}/.ephemeral/${name}`) && !options.force) {
            confirm = (await inquirer.prompt([{
                type: 'confirm',
                name: 'confirm',
                message: '해당 이름의 백업 파일이 이미 존재합니다. 덮어쓰시겠습니까?'
            }])).confirm;
        }
        
        if (confirm) {
            clearDir(`${os.homedir()}/.ephemeral/${name}`);
            
            copyFiles(process.cwd(), `${os.homedir()}/.ephemeral/${name}`);
            
            console.log(chalk.cyan('백업이 완료되었습니다.'));
        }
        
        return;
    });

app
    .command('restore <name>')
    .option('-d, --delete', '백업 파일을 불러온 후 백업 폴더를 삭제합니다.')
    .description('지정한 이름에 저장된 백업 파일들을 현재 폴더에 불러옵니다.')
    .action(async (name) => {
        let options = app.opts();
        let confirm = true;
        
        if (!fs.existsSync(`${os.homedir()}/.ephemeral/${name}`)) return console.log(chalk.red("해당 이름의 백업 내용이 존재하지 않습니다."));
        
        if (fs.readdirSync(process.cwd()).length && !options.force) {
            confirm = (await inquirer.prompt([{
                type: 'confirm',
                name: 'confirm',
                message: '현재 디렉터리에 파일이 존재합니다. 모든 파일을 삭제하고 백업 내용을 불러올까요?'
            }])).confirm;
        }
        
        if (confirm) {
            clearDir(process.cwd());
            
            copyFiles(`${os.homedir()}/.ephemeral/${name}`, process.cwd(), 'Restored');
            if (options.delete) fs.rmSync(`${os.homedir()}/.ephemeral/${name}`, { recursive: true });
            
            console.log(chalk.cyan('불러오기를 완료했습니다.'));
        }
        
        return;
    });
    
app
    .command('*')
    .action(() => console.log('존재하지 않는 명령어입니다.'));

app
    .option('-f, --force', '불러오거나 백업할 때 파일을 강제로 덮어씁니다.')
    .option('-V, --verbose', '자세한 기록을 출력합니다.');

app.parse(process.argv);

function copyFiles(dir, des, text = 'Copied') {
    let options = app.opts();
    const files = fs.readdirSync(dir);
    
    if (!fs.existsSync(des)) fs.mkdirSync(des);
    
    for (let i = 0; i < files.length; i++) {
        let file = files[i];
        
        let stat = fs.lstatSync(`${dir}/${file}`);
        if (stat.isDirectory()) {
            fs.mkdirSync(`${des}/${file}`);
            
            copyFiles(`${dir}/${file}`, `${des}/${file}`, text);
        } else {
            fs.writeFileSync(`${des}/${file}`, fs.readFileSync(`${dir}/${file}`));
            if ((!options.verbose && !`${dir}/${file}`.includes('node_modules')) || options.verbose) console.log(chalk.cyan(`${text} `) + `${dir}/${file}`);
        }
    }
    
    return;
}

function clearDir(dir) {
    if (!fs.existsSync(dir)) return;
    let files = fs.readdirSync(dir);
    
    for (let i = 0; i < files.length; i++) {
        let file = files[i];
        
        fs.rmSync(`${dir}/${file}`, { recursive: true });
    }
}