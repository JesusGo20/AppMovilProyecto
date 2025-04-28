import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
import { IonicVue } from '@ionic/vue';
import axios from 'axios';
import OneSignal, { NotificationClickEvent, NotificationWillDisplayEvent } from "onesignal-cordova-plugin";

/* Importaciones CSS de Ionic */
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

// Configuración global de Axios
axios.defaults.baseURL = 'https://apijkk.darkdev.click/api';
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      router.push('/login');
    }
    return Promise.reject(error);
  }
);

const app = createApp(App).use(IonicVue).use(router);

router.isReady().then(() => {
  app.mount('#app');

  try {
    // Inicializar OneSignal
    console.log('Inicializando OneSignal...');
    OneSignal.initialize("17fb4d56-dccf-46ef-9d0a-7473d753f8f9");
    OneSignal.Notifications.requestPermission();

    // Obtener el OneSignalId periódicamente
    const interval = setInterval(async () => {
      try {
        const id = await OneSignal.User.getOnesignalId();
        console.log('OneSignalId:', id);

        if (id) {
          localStorage.setItem('onesignalId', id);
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Error al obtener OneSignalId:', error);
      }
    }, 60000);

    // Manejar notificaciones en primer plano
    const displayNotification = (event: NotificationWillDisplayEvent) => {
      try {
        event.getNotification().display();
        console.log("Notificación recibida en primer plano:", JSON.stringify(event));
      } catch (error) {
        console.error('Error al mostrar la notificación:', error);
      }
    };

    OneSignal.Notifications.addEventListener("foregroundWillDisplay", displayNotification);

    // Manejar clics en notificaciones
    const openNotification = (event: NotificationClickEvent) => {
      try {
        const notificationData = JSON.stringify(event);
        console.log("Notificación clickeada:", notificationData);
      } catch (error) {
        console.error('Error al manejar el clic en la notificación:', error);
      }
    };

    OneSignal.Notifications.addEventListener("click", openNotification);

    console.log('OneSignal configurado correctamente.');
  } catch (error) {
    console.error('Error al inicializar OneSignal:', error);
  }
});