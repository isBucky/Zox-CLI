import 'inquirer';

declare module 'inquirer' {
    export interface Question<T extends Answers = Answers> {
        type: 'checkbox-plus';
    }
}

export interface cu {}
