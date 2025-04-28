<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Panel Principal</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="logout" color="danger">
            Cerrar Sesión
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="dashboard-container">
        
        
        <ion-button expand="block" @click="goToProjects" class="dashboard-button">
          Proyectos
        </ion-button>
        
       
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonImg } from '@ionic/vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const goToProjects = () => {
  router.push('/projects');
};

const goToTasks = () => {
  router.push('/tasks/1'); // Cambia el ID del proyecto según sea necesario
};

const logout = () => {
  localStorage.removeItem('authToken'); // Elimina el token de autenticación
  router.push('/login'); // Redirige al usuario a la página de inicio de sesión
};
</script>

<style scoped>
.dashboard-container {
  max-width: 500px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.logo {
  max-width: 150px;
  margin-bottom: 40px;
}

.dashboard-button {
  --border-radius: 8px;
  height: 48px;
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 16px;
}
</style>