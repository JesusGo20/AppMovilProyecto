<template>
    <ion-page>
      <ion-header>
        <ion-toolbar>
          <ion-title>Registro</ion-title>
        </ion-toolbar>
      </ion-header>
  
      <ion-content class="ion-padding">
        <div class="auth-container">
         
          
          <ion-item>
            <ion-label position="floating">Nombre</ion-label>
            <ion-input v-model="name" required></ion-input>
          </ion-item>
  
          <ion-item>
            <ion-label position="floating">Correo Electrónico</ion-label>
            <ion-input v-model="email" type="email" required></ion-input>
          </ion-item>
  
          <ion-item>
            <ion-label position="floating">Contraseña</ion-label>
            <ion-input v-model="password" type="password" required></ion-input>
          </ion-item>
  
          <ion-item>
            <ion-label position="floating">Confirmar Contraseña</ion-label>
            <ion-input v-model="confirmPassword" type="password" required></ion-input>
          </ion-item>
  
          <ion-button expand="block" @click="register" :disabled="loading || !passwordsMatch">
            <ion-spinner v-if="loading"></ion-spinner>
            <span v-else>Registrarse</span>
          </ion-button>
  
          <div class="auth-links">
            <p>¿Ya tienes cuenta? <router-link to="/login">Inicia Sesión</router-link></p>
          </div>
        </div>
      </ion-content>
    </ion-page>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { 
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, 
    IonLabel, IonInput, IonButton, IonSpinner, toastController 
  } from '@ionic/vue';
  import axios from 'axios';
  
  const router = useRouter();
  const name = ref('Jesus Gomez');
  const email = ref('dgc@gmail.com');
  const password = ref('password123');
  const confirmPassword = ref('password123');
  const loading = ref(false);
  
  const passwordsMatch = computed(() => {
    return password.value && password.value === confirmPassword.value;
  });
  
  const register = async () => {
    try {
      loading.value = true;
      
      const response = await axios.post('https://apijkk.darkdev.click/api/register', {
        name: name.value,
        email: email.value,
        password: password.value,
        password_confirmation: confirmPassword.value
      });
  
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      showToast('Registro exitoso!');
      router.push('/LoginPage');
    } catch (error) {
      console.error('Error al registrarse:', error);
      
      let errorMessage = 'Error al registrarse. Intenta nuevamente.';
      if (error instanceof Error && (error as any).response?.data?.errors) {
        errorMessage = Object.values((error as any).response.data.errors).flat().join(', ');
      }
      
      showToast(errorMessage);
    } finally {
      loading.value = false;
    }
  };
  
  const showToast = async (message: string) => {
    const toast = await toastController.create({
      message,
      duration: 2000
    });
    await toast.present();
  };
  </script>
  
  <style scoped>
  /* Los mismos estilos que LoginPage.vue */
  </style>