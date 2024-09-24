import NodePath from 'node:path';

// Types
import type { Template } from '../../constructors/template';

export const Resources = {
    path: NodePath.resolve(__dirname),
    data: {},
} as Template;
