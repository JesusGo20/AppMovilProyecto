import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import LoginPage from '../views/LoginPage.vue';
import RegisterPage from '../views/RegisterPage.vue';
import Dashboard from '../views/Dashboard.vue';
import Projects from '../views/Projects.vue';
import Tasks from '../views/Tasks.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Root',
    redirect: '/home'  // Redirección desde la raíz
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage,  // Página principal por defecto
    meta: { public: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { public: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage,
    meta: { public: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/projects',
    name: 'Projects',
    component: Projects,
    meta: { requiresAuth: true }
  },
  {
    path: '/tasks/:projectId',
    name: 'Tasks',
    component: Tasks,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/home'  // Caída a HomePage para rutas no encontradas
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// Guard de navegación (se mantiene igual)
router.beforeEach((to, from, next) => {
  const isPublic = to.matched.some(record => record.meta.public);
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const token = localStorage.getItem('authToken');

  if (requiresAuth && !token) {
    next('/login'); // Redirige a login si la ruta requiere autenticación y no hay token
  } else if (isPublic && token && (to.name === 'Login' || to.name === 'Register')) {
    next('/dashboard'); // Redirige al dashboard solo desde login o register si ya está autenticado
  } else {
    next(); // Permite el acceso a la ruta
  }
});

export default router;