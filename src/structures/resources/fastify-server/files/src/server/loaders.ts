import MainRoute from './routes/index.routes';

import { LoadRoutes, Cache } from 'kenai';

// Types
import type { Server } from './index.js';

export default class Loaders {
    /**
     * Usado para carregar as rotas do servidor usando o glob streams.
     *
     * @param server Servidor
     */
    static async serverRoutes(server: Server) {
        try {
            const routes = await LoadRoutes({
                app: server.app,
                mainRoute: MainRoute,
                controllerParameters: [server],
            });

            if (!routes) return console.log('Sem rotas para carregar');
        } catch (error: any) {
            console.log('Occurred when loading a route: ' + error.route.url);
            console.error(error);
        }

        console.log('Rotas carregadas');
        return;
    }
}
