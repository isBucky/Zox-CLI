import NodePath from 'node:path';

// Types
import type { Template } from '../../constructors/template';

export const InitProject = {
    path: NodePath.resolve(__dirname),
    data: {
        folders: ['./src'],
        devPackages: [
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
} as Template;
