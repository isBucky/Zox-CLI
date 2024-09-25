const { name, main } = require('./package.json');

module.exports = {
    apps: [
        {
            name,
            script: main,
            exec_mode: 'cluster',
            instances: '4',
            memory_max_restart: '10G',

            error_file: `./server_logs/${name}-err.log`,
            out_file: `./server_logs/${name}-out.log`,
            log_file: `./server_logs/${name}-combined.log`,
        },
    ],
};
