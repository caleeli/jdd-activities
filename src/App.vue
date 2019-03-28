<template>
    <div id="app">
        <router-link to="/Actividades"><img alt="Actividades" src="./assets/logo.svg"></router-link>
        <router-view></router-view>
    </div>
</template>

<script>
    import Vue from 'vue';
    import VueRouter from 'vue-router';
    import {components} from 'vue-jdd-components';

    const router = new VueRouter({});

    // Global objects
    window.taskMixin = {};
    window.router = router;

    window.ApiArray = function() {
        return [];
    };
    window.ApiObject = function() {
        this.loadFromAPI = function () {
            return this;
        };
    };

// Load jdd components
    Object.keys(components).forEach(name => {
        Vue.component(name, components[name]);
    });

    // Load routes
    require('./components/index.js');

    Vue.use(VueRouter);

    export default {
        router,
        name: 'app',
    }
</script>

<style>
    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        margin-top: 60px;
    }
</style>
