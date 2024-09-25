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
        package: {
            dependencies: ['@prisma/client'],
            devDependencies: ['prisma'],
            scripts: {
                'prisma:migrate-dev': 'pnpm prisma:build-dev && prisma migrate dev',
                'prisma:migrate-prod': 'pnpm prisma:build-prod && prisma migrate dev',
                'prisma:build-dev': 'sh ./scripts/prisma-build.sh mysql DATABASE_URL_DEV',
                'prisma:build-prod': 'sh ./scripts/prisma-build.sh mysql DATABASE_URL',
            },
        },
    },
} as Template;
