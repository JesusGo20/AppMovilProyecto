import axios from 'axios';

const api = axios.create({
  baseURL: 'https://apijkk.darkdev.click/api',
});

export default {
  // Proyectos
  getProjects() {
    return api.get('/projects');
  },
  getProject(id) {
    return api.get(`/projects/${id}`);
  },
  createProject(data) {
    return api.post('/projects', data);
  },
  updateProject(id, data) {
    return api.put(`/projects/${id}`, data);
  },
  deleteProject(id) {
    return api.delete(`/projects/${id}`);
  },

  // Tareas
  getTasks() {
    return api.get('/tasks');
  },
  getTask(id) {
    return api.get(`/tasks/${id}`);
  },
  createTask(data) {
    return api.post('/tasks', data);
  },
  updateTask(id, data) {
    return api.put(`/tasks/${id}`, data);
  },
  deleteTask(id) {
    return api.delete(`/tasks/${id}`);
  },
  assignUserToTask(taskId, userId) {
    return api.post(`/tasks/${taskId}/assign-user`, { user_id: userId });
  }
};