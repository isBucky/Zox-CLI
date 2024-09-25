import NodePath from 'node:path';

// Types
import type { Template } from '../../constructors/template';

export const InitProject = {
    path: NodePath.resolve(__dirname),
    data: {
        folders: ['./src'],
        package: {
            scripts: {
                start: 'node .',
                'start:watch': 'node --watch .',
                dev: 'tsx -r tsconfig-paths/register index.ts',
                'dev:watch': 'tsx watch -r tsconfig-paths/register index.ts',
                test: 'tsx -r tsconfig-paths/register test.ts',
                build: 'tsc && tsc-alias -p ./tsconfig.json',
                format: 'prettier --write .',
                lint: 'eslint .',
            },
            dependencies: ['bucky.js'],
            devDependencies: [
                'tsc-alias',
                'tsconfig-paths',
                'typescript',
                '@types/node',
                'eslint-plugin-prettier',
                'eslint-plugin-security',
                'eslint-plugin-promise',
                'typescript-eslint',
                '@eslint/js',
                'globals',
                'eslint',
            ],
        },
    },
} as Template;
