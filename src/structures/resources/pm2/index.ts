import NodePath from 'node:path';

// Types
import type { Template } from '../../constructors/template';

export const PM2 = {
    path: NodePath.resolve(__dirname),
    data: {
        package: {
            dependencies: ['pm2'],
            scripts: {
                pm2: 'pm2 start ./ecosystem.config.js',
                'pm2:watch': 'pm2 start ./ecosystem.config.js --watch',
                'pm2:restart': 'pm2 restart ./ecosystem.config.js',
                'pm2:stop': 'pm2 stop ./ecosystem.config.js',
                'pm2:close': 'pm2 delete ./ecosystem.config.js',
            },
        },
    },
} as Template;
