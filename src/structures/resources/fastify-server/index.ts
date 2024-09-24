import NodePath from 'node:path';

// Types
import type { Template } from '../../constructors/template';

export const FastifyServer = {
    path: NodePath.resolve(__dirname),
    data: {
        folders: [
            './src',
            './src/server',
            './src/server/middlewares',
            './src/server/routes',
            './src/server/services',
        ],
        packages: [
            'fastify',
            '@supercharge/request-ip',
            '@fastify/rate-limit',
            '@fastify/multipart',
            '@fastify/compress',
            '@fastify/helmet',
            '@fastify/middie',
            '@fastify/cookie',
            '@fastify/cors',
            'kenai',
        ],
    },
} as Template;
