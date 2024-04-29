import Fastify, { type FastifyInstance } from 'fastify';
import { getClientIp } from '@supercharge/request-ip';

// Import structures and Services
import Loaders from './loaders';

// Middlewares
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import compress from '@fastify/compress';
import helmet from '@fastify/helmet';
import middie from '@fastify/middie';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';

export class Server {
    public app: FastifyInstance;

    constructor() {
        this.app = Fastify({
            trustProxy: true,
            bodyLimit: 5242880, // 5 MB
            ignoreTrailingSlash: true,
        });

        this.app.addContentTypeParser(
            'application/json',
            { parseAs: 'string' },
            (request, payload, done) => {
                try {
                    const data = JSON.parse(payload as any);
                    return done(null, data);
                } catch (error) {
                    return done(error as Error);
                }
            },
        );

        this.app.setErrorHandler((error, request, reply) => console.log(error));

        this.app.setNotFoundHandler((request, reply) =>
            reply.code(404).send({
                message: 'Not found',
            }),
        );

        this.hooks();
    }

    private hooks() {
        /**
         * Hook para resolver os cookies assinados
         */
        this.app.addHook('preParsing', (request, reply, payload, done) => {
            request['signedCookies'] = Object.entries(request.cookies).reduce(
                (acc, [key, value]) => {
                    if (!value) return acc;

                    const result = request.unsignCookie(value);
                    // eslint-disable-next-line security/detect-object-injection
                    if (result.valid && result.value) acc[key] = result.value;
                    return acc;
                },
                {},
            );

            return done();
        });
    }

    private middlewares() {
        return Promise.all([
            this.app.register(rateLimit, {
                timeWindow: 3e4, // 30s
                global: true,
                max: 50,
                continueExceeding: true,

                keyGenerator: (req) => getClientIp(req)!,
            }),
            this.app.register(cors, { credentials: true }),
            this.app.register(helmet, {
                global: true,
                hsts: {
                    // 60 dias
                    maxAge: 1e3 * 120 * 24 * 60,
                    includeSubDomains: true,
                    preload: true,
                },
                xFrameOptions: {
                    action: 'deny',
                },
                xXssProtection: true,
                hidePoweredBy: true,
                xContentTypeOptions: true,
                referrerPolicy: {
                    policy: 'no-referrer',
                },
            }),
            this.app.register(cookie, {
                parseOptions: {},
                secret: '',
            }),
            this.app.register(compress, {
                global: true,
                encodings: ['gzip', 'deflate', 'br'],
                threshold: 1024,
            }),
            this.app.register(multipart, {
                attachFieldsToBody: true,

                limits: {
                    fileSize: 5242880,
                    files: 17,
                },
            }),
            this.app.register(middie),
        ]);
    }

    async start() {
        try {
            await this.middlewares();
            await Loaders.serverRoutes(this);

            this.app.listen({ port: 3000 }, (err, address) => {
                if (err) return Promise.reject(err);

                console.log(`Server is listening: ${address}`);
            });
        } catch (err: any) {
            console.error(err);
        }
    }
}
