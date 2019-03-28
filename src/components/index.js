import Vue from 'vue';

// Icon for start event "forms"
require('../assets/start.svg');

window.addEventListener('load', () => {
    const Actividades = require('./Actividades').default;
    const ListaActividades = require('./ListaActividades').default;
    window.router.addRoutes([
        {path: ListaActividades.path, component: ListaActividades},
        {path: Actividades.path, component: Actividades},
    ]);
});

export const icon = require('../assets/start.svg');
