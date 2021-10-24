export default {
    mount: {
        public: '/',
        src: '/_dist_',
    },
    buildOptions: {
        sourceMaps: true,
    },
    plugins: ['@snowpack/plugin-typescript'],
    install: [
        /* ... */
    ],
    installOptions: {
        installTypes: true,
    },
    devOptions: {
        /* ... */
    },
    proxy: {
        /* ... */
    },
    alias: {
        /* ... */
    },
};
