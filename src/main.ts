import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
import { IonicVue } from '@ionic/vue';
import axios from 'axios'; // Importar axios

/* Importaciones CSS de Ionic (se mantienen igual) */
import '@ionic/vue/css/core.css';
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';
import '@ionic/vue/css/palettes/dark.system.css';
import './theme/variables.css';


import OneSignal, { NotificationClickEvent, NotificationWillDisplayEvent } from "onesignal-cordova-plugin";
// 1. Configuración global de Axios
axios.defaults.baseURL = 'https://apijkk.darkdev.click/api';

// 2. Interceptor para agregar token automáticamente
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// 3. Interceptor para manejar errores de autenticación
axios.interceptors.response.use(response => response, error => {
  if (error.response?.status === 401) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    router.push('/login');
  }
  return Promise.reject(error);
});

const app = createApp(App)
  .use(IonicVue)
  .use(router);

router.isReady().then(() => {
  app.mount('#app');

  OneSignal.initialize("17fb4d56-dccf-46ef-9d0a-7473d753f8f9");
  OneSignal.Notifications.requestPermission();

  const interval = setInterval(async() => {
 
     const id = await OneSignal.User.getOnesignalId();
      console.log('OnesignalId', id);
      
      if (id) {
        localStorage.setItem('onesignalId', id);
        clearInterval(interval);

      }

  }, 60000);

const displayNotification = (event: NotificationWillDisplayEvent) => {
    // Use preventDefault() to not display
    // event.preventDefault();
    // Use notification.display() to display the notification after some async work
    event.getNotification().display();

    console.log("OneSignal notification received:", JSON.stringify(event));
   
}

OneSignal.Notifications.addEventListener("foregroundWillDisplay", displayNotification);


const openNotification = (event: NotificationClickEvent) => {
  const notificationData = JSON.stringify(event);
  console.log("OneSignal notification clicked:", notificationData);
};

OneSignal.Notifications.addEventListener("click", openNotification);
});