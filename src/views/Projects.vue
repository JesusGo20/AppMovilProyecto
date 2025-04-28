<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Proyectos</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="showModal = true">
            <ion-icon :icon="add" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- Mensaje de carga -->
      <div v-if="loading" class="ion-text-center ion-padding">
        <ion-spinner></ion-spinner>
        <p>Cargando proyectos...</p>
      </div>

      <!-- Mensaje de error -->
      <div v-if="error" class="ion-text-center ion-padding">
        <ion-icon :icon="warning" color="danger" size="large"></ion-icon>
        <p>{{ error }}</p>
        <ion-button @click="loadProjects">Reintentar</ion-button>
      </div>

      <!-- Lista de proyectos -->
      <ion-list v-if="!loading && !error">
        <ion-item-sliding v-for="project in projects" :key="project.id">
          <ion-item @click="viewTasks(project.id)">
            <ion-label>
              <h2>{{ project.name }}</h2>
              <p>{{ project.description || 'Sin descripción' }}</p>
            </ion-label>
          </ion-item>
          
          <ion-item-options side="end">
            <ion-item-option color="primary" @click.stop="editProject(project)">
              <ion-icon :icon="pencil" slot="icon-only"></ion-icon>
            </ion-item-option>
            <ion-item-option color="danger" @click.stop="confirmDelete(project.id)">
              <ion-icon :icon="trash" slot="icon-only"></ion-icon>
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-list>

      <!-- Modal para agregar/editar -->
      <ion-modal :is-open="showModal" @didDismiss="closeModal">
        <ion-header>
          <ion-toolbar>
            <ion-title>{{ editingId ? 'Editar' : 'Nuevo' }} Proyecto</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeModal">Cerrar</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-item>
            <ion-label position="floating">Nombre</ion-label>
            <ion-input v-model="projectForm.name" required></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="floating">Descripción</ion-label>
            <ion-textarea v-model="projectForm.description"></ion-textarea>
          </ion-item>
          <ion-button 
            expand="block" 
            @click="saveProject"
            :disabled="!projectForm.name"
          >
            Guardar
          </ion-button>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, 
  IonLabel, IonItemSliding, IonItemOptions, IonItemOption, IonButton, 
  IonIcon, IonModal, IonInput, IonTextarea, IonSpinner, IonButtons, 
  toastController, alertController 
} from '@ionic/vue';
import { add, pencil, trash, warning } from 'ionicons/icons';
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();
interface Project {
  id: number;
  name: string;
  description?: string;
}

const projects = ref<Project[]>([]);
const loading = ref(true);
const error = ref('');
const showModal = ref(false);
const editingId = ref<number | null>(null);

const projectForm = ref({
  name: '',
  description: ''
});

// Credenciales quemadas (solo para desarrollo)
const hardcodedCredentials = {
  email: 'dgc@gmail.com',
  password: 'password123'
};

// Cargar proyectos al iniciar
onMounted(async () => {
  try {
    // 1. Primero autenticarse
    const authResponse = await axios.post(
      'https://apijkk.darkdev.click/api/login', 
      hardcodedCredentials
    );
    
    const token = authResponse.data.token;
    localStorage.setItem('authToken', token);
    
    // 2. Luego cargar proyectos con el token
    await loadProjects();
  } catch (authError) {
    console.error('Error de autenticación:', authError);
    error.value = 'Error de autenticación. Verifica las credenciales.';
    loading.value = false;
  }
});

const loadProjects = async () => {
  try {
    loading.value = true;
    error.value = '';
    
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await axios.get(
      'https://apijkk.darkdev.click/api/projects',
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    projects.value = response.data;
  } catch (err) {
    console.error('Error al cargar proyectos:', err);
    
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      error.value = 'Sesión expirada. Vuelve a autenticarte.';
      // Limpiar token inválido
      localStorage.removeItem('authToken');
    } else {
      error.value = 'Error al cargar proyectos. Verifica tu conexión.';
    }
  } finally {
    loading.value = false;
  }
};

const saveProject = async () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No autenticado');
    }

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    if (editingId.value) {
      await axios.put(
        `https://apijkk.darkdev.click/api/projects/${editingId.value}`,
        projectForm.value,
        config
      );
      showToast('Proyecto actualizado');
    } else {
      await axios.post(
        'https://apijkk.darkdev.click/api/projects',
        projectForm.value,
        config
      );
      showToast('Proyecto creado');
    }
    
    closeModal();
    await loadProjects();
  } catch (err) {
    console.error('Error al guardar proyecto:', err);
    showToast('Error al guardar proyecto');
    
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      error.value = 'Sesión expirada. Vuelve a autenticarte.';
      localStorage.removeItem('authToken');
    }
  }
};

const editProject = (project: Project) => {
  editingId.value = project.id;
  projectForm.value = {
    name: project.name,
    description: project.description || ''
  };
  showModal.value = true;
};

const confirmDelete = async (id: number) => {
  const alert = await alertController.create({
    header: 'Confirmar',
    message: '¿Eliminar este proyecto?',
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      { text: 'Eliminar', handler: () => deleteProject(id) }
    ]
  });
  await alert.present();
};

const deleteProject = async (id: number) => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    await axios.delete(`https://apijkk.darkdev.click/api/projects/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    showToast('Proyecto eliminado');
    await loadProjects();
  } catch (err) {
    console.error('Error al eliminar proyecto:', err);
    
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      showToast('Sesión expirada. Vuelve a autenticarte.');
      localStorage.removeItem('authToken');
      // Opcional: Redirigir a login
      // router.push('/login');
    } else {
      showToast('Error al eliminar proyecto');
    }
  }
};

const viewTasks = (projectId: number) => {
  router.push(`/tasks/${projectId}`);
};

const closeModal = () => {
  showModal.value = false;
  editingId.value = null;
  projectForm.value = { name: '', description: '' };
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
ion-item-sliding {
  margin-bottom: 8px;
}

/* Estilo para asegurar que los botones deslizables sean visibles */
ion-item-options {
  display: flex;
  align-items: center;
}

ion-item-option {
  width: 60px;
  display: flex;
  justify-content: center;
}
</style>