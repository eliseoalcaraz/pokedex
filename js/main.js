import { createPokedexApp } from './app/pokedex-app.js';

function bootApp() {
    const app = createPokedexApp();
    window.Pokedex = app;
    app.init();
}

if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootApp);
    } else {
        bootApp();
    }
}

export { bootApp };
