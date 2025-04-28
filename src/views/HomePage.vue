<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Bienvenido a la Aplicación</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="home-container">
        
        
        <div class="auth-options">
          <ion-button expand="block" @click="goToLogin" class="auth-button">
            Iniciar Sesión
          </ion-button>
          
          <ion-button expand="block" @click="goToRegister" fill="outline" class="auth-button">
            Registrarse
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonImg } from '@ionic/vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const goToLogin = () => {
  router.push('/login');
};

const goToRegister = () => {
  router.push('/register');
};
</script>

<style scoped>
.home-container {
  max-width: 500px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.logo {
  max-width: 200px;
  margin: 0 auto 40px;
  display: block;
}

.auth-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 30px;
}

.auth-button {
  --border-radius: 8px;
  height: 48px;
  font-weight: 600;
  font-size: 1rem;
}
</style>
