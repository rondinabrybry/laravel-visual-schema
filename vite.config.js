import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'public/build',
        manifest: true,
        rollupOptions: {
            input: {
                'schema-designer': 'resources/js/schema-designer.jsx'
            }
        }
    },
    server: {
        hmr: {
            host: 'localhost'
        }
    }
});