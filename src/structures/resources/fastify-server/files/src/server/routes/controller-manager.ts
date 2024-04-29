// Types
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Server } from '..';

export interface Controller extends ControllerManager {
    run(request: FastifyRequest, reply?: FastifyReply): unknown;
}

export default abstract class ControllerManager {
    constructor(public server: Server) {}
}
