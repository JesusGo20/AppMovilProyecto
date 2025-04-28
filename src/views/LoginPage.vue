<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Iniciar Sesión</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="auth-container">
        
        
        <!-- Campo de correo con mejor espaciado -->
        <div class="form-group">
          <ion-item class="custom-item" lines="full">
            <ion-label position="floating" class="input-label">Correo Electrónico</ion-label>
            <ion-input 
              v-model="email" 
              type="email" 
              required
              class="custom-input"
            ></ion-input>
          </ion-item>
        </div>

        <!-- Campo de contraseña con mejor espaciado -->
        <div class="form-group">
          <ion-item class="custom-item" lines="full">
            <ion-label position="floating" class="input-label">Contraseña</ion-label>
            <ion-input 
              v-model="password" 
              type="password" 
              required
              class="custom-input"
            ></ion-input>
          </ion-item>
        </div>

        <!-- Botón con mejor margen superior -->
        <ion-button 
          expand="block" 
          @click="login" 
          :disabled="loading"
          class="submit-button"
        >
          <ion-spinner v-if="loading" name="crescent"></ion-spinner>
          <span v-else>Iniciar Sesión</span>
        </ion-button>

        <!-- Enlaces con mejor espaciado -->
        <div class="auth-links">
          <p class="auth-text">¿No tienes cuenta? <router-link to="/register" class="auth-link">Regístrate</router-link></p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, 
  IonLabel, IonInput, IonButton, IonSpinner, IonImg, toastController 
} from '@ionic/vue';
import axios from 'axios';

const router = useRouter();
const email = ref('dgc@gmail.com');
const password = ref('password123');
const loading = ref(false);
const token = ref('');

const waitForOneSignalId = async (): Promise<string | null> => {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      const oneSignalId = localStorage.getItem('onesignalId');
      if (oneSignalId) {
        clearInterval(interval);
        resolve(oneSignalId);
      }
    }, 1000); // Verifica cada segundo
  });
};

const login = async () => {
  try {
    loading.value = true;
    
    const response = await axios.post('https://apijkk.darkdev.click/api/login', {
      email: email.value,
      password: password.value
    });

    token.value = response.data.token;
    const userId = response.data.id;
    const OneSignalId = await waitForOneSignalId();

    localStorage.setItem('authToken', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));

    if (userId && OneSignalId) {
      await updateUser(userId, email.value, password.value, OneSignalId);
    }

    showToast('Bienvenido!');
    router.push('/dashboard');
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    showToast('Credenciales incorrectas. Intenta nuevamente.');
  } finally {
    loading.value = false;
  }
};

const updateUser = async (userId: string, email: string, password: string, oneSignalId: string) => {
  try {
    // Realizar la solicitud para actualizar el usuario
    const response = await axios.put(`https://apijkk.darkdev.click/api/users/${userId}`, {
      email: email,
      password: password,
      onesignal_id: oneSignalId,
    }, {
      headers: {
        Authorization: `Bearer ${token.value}`, // Incluir el token en los headers
      },
    });

    console.log('Usuario actualizado:', response.data);
  } catch (error) {
    const err = error as { response?: { data: any }; message: string };
    console.error('Error al actualizar el usuario:', err.response?.data || err.message);
    alert('Error al actualizar el usuario');
  }
};

const showToast = async (message: string) => {
  const toast = await toastController.create({
    message,
    duration: 2000,
    position: 'top'
  });
  await toast.present();
};
</script>

<style scoped>
/* Contenedor principal */
.auth-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}

/* Logo */
.logo {
  max-width: 150px;
  margin: 0 auto 40px;
  display: block;
}

/* Grupos de formulario */
.form-group {
  margin-bottom: 25px;
}

/* Items personalizados */
.custom-item {
  --padding-start: 0;
  --inner-padding-end: 0;
  --border-radius: 8px;
  --background: var(--ion-color-light);
  margin-bottom: 5px;
}

/* Etiquetas */
.input-label {
  color: var(--ion-color-medium);
  font-weight: 500;
  margin-bottom: 8px;
  display: block;
}

/* Inputs */
.custom-input {
  --padding-start: 12px;
  --padding-end: 12px;
  --padding-top: 12px;
  --padding-bottom: 12px;
  background: var(--ion-color-light);
  border-radius: 8px;
  margin-top: 8px;
}

/* Botón de submit */
.submit-button {
  margin-top: 20px;
  --border-radius: 8px;
  height: 48px;
  font-weight: 600;
}

/* Enlaces de autenticación */
.auth-links {
  text-align: center;
  margin-top: 25px;
}

.auth-text {
  color: var(--ion-color-medium);
  font-size: 0.9rem;
}

.auth-link {
  color: var(--ion-color-primary);
  text-decoration: none;
  font-weight: 600;
}

/* Efectos de focus */
ion-input:focus-within {
  border: 2px solid var(--ion-color-primary);
}
</style>