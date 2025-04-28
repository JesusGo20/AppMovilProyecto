<template>
    <ion-page>
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-back-button default-href="/projects"></ion-back-button>
          </ion-buttons>
          <ion-title>Tareas - {{ projectName }}</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showAddTaskModal = true">
              <ion-icon :icon="add"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
  
      <ion-content>
        <!-- Mensaje de carga -->
        <div v-if="loading" class="ion-text-center ion-padding">
          <ion-spinner></ion-spinner>
          <p>Cargando tareas...</p>
        </div>
  
        <!-- Mensaje de error -->
        <div v-if="error" class="ion-text-center ion-padding">
          <ion-icon :icon="warning" color="danger" size="large"></ion-icon>
          <p>{{ error }}</p>
          <ion-button @click="loadTasks">Reintentar</ion-button>
        </div>
  
        <!-- Lista de tareas -->
        <ion-list v-if="!loading && !error">
          <ion-item-sliding v-for="task in tasks" :key="task.id">
            <ion-item>
              <ion-label>
                <h2>{{ task.title }}</h2>
                <p>{{ task.description }}</p>
                <p>Estado: {{ getStatusText(task.status) }}</p>
                <p v-if="task.user_id">Asignado a: {{ task.user_id }}</p>
              </ion-label>
            </ion-item>
            
            <ion-item-options side="end">
              <ion-item-option color="primary" @click.stop="editTask(task)">
                <ion-icon slot="icon-only" :icon="pencil"></ion-icon>
              </ion-item-option>
              <ion-item-option color="danger" @click.stop="confirmDeleteTask(task.id)">
                <ion-icon slot="icon-only" :icon="trash"></ion-icon>
              </ion-item-option>
              <ion-item-option color="success" @click.stop="openAssignUserModal(task)">
                <ion-icon slot="icon-only" :icon="personAdd"></ion-icon>
              </ion-item-option>
            </ion-item-options>
          </ion-item-sliding>
        </ion-list>
  
        <!-- Modal para agregar/editar tarea -->
        <ion-modal :is-open="showAddTaskModal" @didDismiss="showAddTaskModal = false">
          <ion-header>
            <ion-toolbar>
              <ion-title>{{ editingTask ? 'Editar Tarea' : 'Nueva Tarea' }}</ion-title>
              <ion-buttons slot="end">
                <ion-button @click="showAddTaskModal = false">Cerrar</ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding">
            <ion-item>
              <ion-label position="floating">Título</ion-label>
              <ion-input v-model="taskForm.title" required></ion-input>
            </ion-item>
            <ion-item>
              <ion-label position="floating">Descripción</ion-label>
              <ion-textarea v-model="taskForm.description"></ion-textarea>
            </ion-item>
            <ion-item>
              <ion-label>Estado</ion-label>
              <ion-select v-model="taskForm.status">
                <ion-select-option value="pending">Pendiente</ion-select-option>
                <ion-select-option value="in_progress">En progreso</ion-select-option>
                <ion-select-option value="completed">Completado</ion-select-option>
              </ion-select>
            </ion-item>
            <ion-button expand="block" @click="saveTask" :disabled="!taskForm.title">
              {{ editingTask ? 'Actualizar' : 'Guardar' }}
            </ion-button>
          </ion-content>
        </ion-modal>
  
        <!-- Modal para asignar usuario -->
        <ion-modal :is-open="showAssignUserModal" @didDismiss="showAssignUserModal = false">
          <ion-header>
            <ion-toolbar>
              <ion-title>Asignar Usuario</ion-title>
              <ion-buttons slot="end">
                <ion-button @click="showAssignUserModal = false">Cerrar</ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding">
            <ion-item>
              <ion-label position="floating">ID de Usuario</ion-label>
              <ion-input v-model="userToAssign" type="number"></ion-input>
            </ion-item>
            <ion-button expand="block" @click="assignUser" :disabled="!userToAssign">
              Asignar
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
    IonIcon, IonModal, IonInput, IonTextarea, IonSelect, IonSelectOption, 
    IonBackButton, IonSpinner, IonButtons, toastController, alertController 
  } from '@ionic/vue';
  import { add, pencil, trash, personAdd, warning } from 'ionicons/icons';
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import axios from 'axios';
  
  const route = useRoute();
  const projectId = route.params.projectId as string;
  
  // Estados reactivos
  interface Task {
    id: number;
    title: string;
    description: string;
    status: string;
    user_id?: number;
    project_id: string;
  }
  
  const tasks = ref<Task[]>([]);
  const projectName = ref('');
  const loading = ref(true);
  const error = ref('');
  const showAddTaskModal = ref(false);
  const showAssignUserModal = ref(false);
  const editingTask = ref<Task | null>(null);
  const currentTaskId = ref(null);
  const userToAssign = ref(null);
  
  const taskForm = ref({
    title: '',
    description: '',
    status: 'pending',
    project_id: projectId
  });
  
  // Credenciales quemadas (solo para desarrollo)
  const hardcodedCredentials = {
    email: 'dgc@gmail.com',
    password: 'password123'
  };
  
  // Cargar datos al iniciar
  onMounted(async () => {
    try {
      // 1. Autenticarse primero
      const authResponse = await axios.post(
        'https://apijkk.darkdev.click/api/login', 
        hardcodedCredentials
      );
      
      const token = authResponse.data.token;
      localStorage.setItem('authToken', token);
      
      // 2. Cargar datos
      await Promise.all([loadTasks(), loadProjectName()]);
    } catch (authError) {
      console.error('Error de autenticación:', authError);
      error.value = 'Error de autenticación. Verifica las credenciales.';
      loading.value = false;
    }
  });
  
  const loadTasks = async () => {
    try {
      loading.value = true;
      error.value = '';
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
  
      const response = await axios.get(
        'https://apijkk.darkdev.click/api/tasks',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Filtrar tareas por proyecto
      tasks.value = response.data.filter((task: any) => task.project_id == projectId);
    } catch (err) {
      console.error('Error al cargar tareas:', err);
      
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        error.value = 'Sesión expirada. Vuelve a autenticarte.';
        localStorage.removeItem('authToken');
      } else {
        error.value = 'Error al cargar tareas. Verifica tu conexión.';
      }
    } finally {
      loading.value = false;
    }
  };
  
  const loadProjectName = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
  
      const response = await axios.get(
        `https://apijkk.darkdev.click/api/projects/${projectId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      projectName.value = response.data.name;
    } catch (err) {
      console.error('Error al cargar proyecto:', err);
      projectName.value = 'Proyecto desconocido';
    }
  };
  
  const saveTask = async () => {
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
  
      if (editingTask.value) {
        await axios.put(
          `https://apijkk.darkdev.click/api/tasks/${editingTask.value.id}`,
          taskForm.value,
          config
        );
        showToast('Tarea actualizada');
      } else {
        await axios.post(
          'https://apijkk.darkdev.click/api/tasks',
          taskForm.value,
          config
        );
        showToast('Tarea creada');
      }
      
      showAddTaskModal.value = false;
      resetForm();
      await loadTasks();
    } catch (err) {
      console.error('Error al guardar tarea:', err);
      
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        error.value = 'Sesión expirada. Vuelve a autenticarte.';
        localStorage.removeItem('authToken');
      } else {
        showToast('Error al guardar tarea');
      }
    }
  };
  
  const editTask = (task: any) => {
    editingTask.value = task;
    taskForm.value = {
      title: task.title,
      description: task.description,
      status: task.status,
      project_id: task.project_id
    };
    showAddTaskModal.value = true;
  };
  
  const openAssignUserModal = (task: any) => {
    currentTaskId.value = task.id;
    userToAssign.value = task.user_id || null;
    showAssignUserModal.value = true;
  };
  
  const assignUser = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No autenticado');
      }
  
      await axios.post(
        `https://apijkk.darkdev.click/api/tasks/${currentTaskId.value}/assign-user`,
        { user_id: userToAssign.value },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      showToast('Usuario asignado');
      showAssignUserModal.value = false;
      await loadTasks();
    } catch (err) {
      console.error('Error al asignar usuario:', err);
      
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        error.value = 'Sesión expirada. Vuelve a autenticarte.';
        localStorage.removeItem('authToken');
      } else {
        showToast('Error al asignar usuario');
      }
    }
  };
  
  const confirmDeleteTask = async (id: number) => {
    const alert = await alertController.create({
      header: 'Confirmar',
      message: '¿Estás seguro de eliminar esta tarea?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', handler: () => deleteTask(id) }
      ]
    });
    await alert.present();
  };
  
  const deleteTask = async (id: number) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No autenticado');
      }
  
      await axios.delete(
        `https://apijkk.darkdev.click/api/tasks/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      showToast('Tarea eliminada');
      await loadTasks();
    } catch (err) {
      console.error('Error al eliminar tarea:', err);
      
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        error.value = 'Sesión expirada. Vuelve a autenticarte.';
        localStorage.removeItem('authToken');
      } else {
        showToast('Error al eliminar tarea');
      }
    }
  };
  
  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: 'Pendiente',
      in_progress: 'En progreso',
      completed: 'Completado'
    };
    return statusMap[status] || status;
  };
  
  const resetForm = () => {
    taskForm.value = {
      title: '',
      description: '',
      status: 'pending',
      project_id: projectId
    };
    editingTask.value = null;
    currentTaskId.value = null;
    userToAssign.value = null;
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