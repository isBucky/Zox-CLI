import NodePath from 'node:path';

// Types
import type { Template } from '../../constructors/template';

export const DockerCompose = {
    path: NodePath.resolve(__dirname),
    data: {
        package: {
            scripts: {
                'docker:start': 'docker-compose up -d',
                'docker:stop': 'docker-compose stop',
                'docker:kill': 'docker-compose kill',
                'docker:rm': 'docker-compose rm',
            },
        },
    },
} as Template;
