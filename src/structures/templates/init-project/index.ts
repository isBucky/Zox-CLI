import Data from './data.json';

import NodePath from 'node:path';

// Types
import type { Template, TemplateData } from '../../constructors/build-template';

export const InitProject = {
    path: NodePath.resolve(__dirname),
    data: Data as TemplateData,
} as Template;
