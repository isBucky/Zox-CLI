import NodePath from 'node:path';

// Types
import type { Template } from '../../constructors/template';

export const Prisma = {
    path: NodePath.resolve(__dirname),
    data: {
        folders: [
            './prisma',
            './prisma/migrations',
            './prisma/schemas',
            './src/structures/databases',
            './scripts',
        ],
        packages: ['@prisma/client'],
        devPackages: ['prisma'],
    },
} as Template;
