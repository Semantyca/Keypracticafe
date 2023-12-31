import { createApp } from 'vue';
import App from './App.vue';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Keycloak from 'keycloak-js';
import router from './router';
import {createPinia} from "pinia";
import { library } from '@fortawesome/fontawesome-svg-core';
import { faUser, faSignOutAlt, faBriefcase } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

function initializeKeycloak(config) {
    //only for testing
    localStorage.removeItem('jwt');
    let keycloak = new Keycloak({
        url: config['auth-server-url'],
        realm: config.realm,
        clientId: config.resource
    });

    keycloak.init({
        onLoad: 'check-sso',
        pkceMethod: 'S256',
        scope: 'openid offline_access'
    }).then((auth) => {
        if (!auth) {
            console.log("Not Authenticated");
        } else {
            console.log("Authenticated");
            localStorage.setItem('jwt', keycloak.token);
        }

        library.add(faUser, faSignOutAlt, faBriefcase);

        const app = createApp(App);
        const state = createPinia();
        app.component('font-awesome-icon', FontAwesomeIcon);
        app.config.globalProperties.$keycloak = keycloak;
        app.use(router);
        app.use(state);
        app.mount('#app');
    }).catch(() => {
        console.log("OIDC error");
        const errorMessageDiv = document.getElementById('error-message');
        errorMessageDiv.textContent = 'An error occurred. Please try again later.';
        errorMessageDiv.style.display = 'block';
    });
}

if (process.env.NODE_ENV === 'development') {
    const config = require('../keycloak.json');
    initializeKeycloak(config);
} else {
    fetch('/config')
        .then(response => response.json())
        .then(config => {
            console.log("Auth server: " + config['auth-server-url']);
            initializeKeycloak(config);
        })
        .catch(error => {
            console.error("Failed to fetch configuration:", error);
        });
}
