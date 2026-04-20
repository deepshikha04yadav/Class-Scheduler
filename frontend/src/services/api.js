import axios from 'axios';
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
const api = axios.create({ baseURL: API_BASE });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use((res) => res, async (error) => {
  if (error.response?.status === 401) {
    const refresh = localStorage.getItem('refresh_token');
    if (refresh) {
      try {
        const { data } = await axios.post(`${API_BASE}/auth/refresh/`, { refresh });
        localStorage.setItem('access_token', data.access);
        error.config.headers.Authorization = `Bearer ${data.access}`;
        return api(error.config);
      } catch { localStorage.clear(); window.location.href = '/login'; }
    }
  }
  return Promise.reject(error);
});
export const authAPI = { login: (email, password) => api.post('/auth/login/', { email, password }) };
export const userAPI = {
  me: () => api.get('/users/me/'), list: () => api.get('/users/'),
  create: (data) => api.post('/users/', data), update: (id, data) => api.patch(`/users/${id}/`, data),
  delete: (id) => api.delete(`/users/${id}/`), stats: () => api.get('/users/dashboard_stats/'),
};
export const teacherAPI = {
  list: () => api.get('/teachers/'), create: (data) => api.post('/teachers/', data),
  update: (id, data) => api.patch(`/teachers/${id}/`, data), delete: (id) => api.delete(`/teachers/${id}/`),
  myProfile: () => api.get('/teachers/my_profile/'), timetable: (id) => api.get(`/teachers/${id}/timetable/`),
};
export const classAPI = {
  list: () => api.get('/classes/'), create: (data) => api.post('/classes/', data),
  update: (id, data) => api.patch(`/classes/${id}/`, data), delete: (id) => api.delete(`/classes/${id}/`),
};
export const sectionAPI = {
  list: (classId) => api.get(`/sections/${classId ? '?classroom='+classId : ''}`),
  create: (data) => api.post('/sections/', data), update: (id, data) => api.patch(`/sections/${id}/`, data),
  delete: (id) => api.delete(`/sections/${id}/`), timetable: (id) => api.get(`/sections/${id}/timetable/`),
};
export const studentAPI = {
  list: () => api.get('/students/'), create: (data) => api.post('/students/', data),
  update: (id, data) => api.patch(`/students/${id}/`, data), delete: (id) => api.delete(`/students/${id}/`),
  myProfile: () => api.get('/students/my_profile/'), myTimetable: () => api.get('/students/my_timetable/'),
};
export const subjectAPI = {
  list: () => api.get('/subjects/'), create: (data) => api.post('/subjects/', data),
  update: (id, data) => api.patch(`/subjects/${id}/`, data), delete: (id) => api.delete(`/subjects/${id}/`),
};
export const timeslotAPI = {
  list: () => api.get('/timeslots/'), create: (data) => api.post('/timeslots/', data),
  update: (id, data) => api.patch(`/timeslots/${id}/`, data), delete: (id) => api.delete(`/timeslots/${id}/`),
};
export const timetableAPI = {
  list: (params) => api.get('/timetable/', { params }), create: (data) => api.post('/timetable/', data),
  update: (id, data) => api.patch(`/timetable/${id}/`, data), delete: (id) => api.delete(`/timetable/${id}/`),
  bulkUpdate: (data) => api.post('/timetable/bulk_update/', data),
};
export const departmentAPI = {
  list: () => api.get('/departments/'), create: (data) => api.post('/departments/', data),
  update: (id, data) => api.patch(`/departments/${id}/`, data), delete: (id) => api.delete(`/departments/${id}/`),
};
export default api;
