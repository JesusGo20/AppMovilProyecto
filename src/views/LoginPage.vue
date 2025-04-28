<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Iniciar Sesión</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="auth-container">
        <!-- Campo de correo -->
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

        <!-- Campo de contraseña -->
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

        <!-- Botón de inicio de sesión -->
        <ion-button 
          expand="block" 
          @click="login" 
          :disabled="loading"
          class="submit-button"
        >
          <ion-spinner v-if="loading" name="crescent"></ion-spinner>
          <span v-else>Iniciar Sesión</span>
        </ion-button>

        <!-- Enlaces -->
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
  IonLabel, IonInput, IonButton, IonSpinner, toastController 
} from '@ionic/vue';
import axios from 'axios';

const router = useRouter();
const email = ref('');
const password = ref('');
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
    // Agregar un timeout para evitar loops infinitos
    setTimeout(() => {
      clearInterval(interval);
      resolve(null);
    }, 15000); // Máximo 15 segundos
  });
};

const login = async () => {
  try {
    loading.value = true;

    // Realizar la solicitud de inicio de sesión
    const response = await axios.post('https://apijkk.darkdev.click/api/login', {
      email: email.value,
      password: password.value
    });

    token.value = response.data.token;
    const userId = response.data.id;
    const oneSignalId = await waitForOneSignalId();

    if (!oneSignalId) {
      showToast('Error al obtener el OneSignalId. Intenta nuevamente.');
      return;
    }

    // Guardar datos en localStorage
    localStorage.setItem('authToken', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));

    // Actualizar el usuario con el OneSignalId
    if (userId && oneSignalId) {
      await updateUser(userId, email.value, password.value, oneSignalId);
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
    const response = await axios.put(`https://apijkk.darkdev.click/api/users/${userId}`, {
      email,
      password,
      onesignal_id: oneSignalId,
    }, {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });

    console.log('Usuario actualizado:', response.data);
    localStorage.removeItem('onesignalId'); // Limpiar el OneSignalId después de usarlo
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    showToast('Error al actualizar el usuario.');
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
/* Estilos personalizados */
.auth-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 25px;
}

.custom-item {
  --padding-start: 0;
  --inner-padding-end: 0;
  --border-radius: 8px;
  --background: var(--ion-color-light);
  margin-bottom: 5px;
}

.input-label {
  color: var(--ion-color-medium);
  font-weight: 500;
}

.custom-input {
  --padding-start: 12px;
  --padding-end: 12px;
  --padding-top: 12px;
  --padding-bottom: 12px;
  background: var(--ion-color-light);
  border-radius: 8px;
}

.submit-button {
  margin-top: 20px;
  --border-radius: 8px;
  height: 48px;
  font-weight: 600;
}

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
</style>