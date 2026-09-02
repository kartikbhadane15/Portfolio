import axios from 'axios';

// Since the client and server are running on different ports during dev
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Hardcoding for dev, we can extract to env later
});

export const fetchProfile = () => api.get('/profile').then(res => res.data);
export const fetchProjects = (featured = false) => api.get(`/projects?featured=${featured}`).then(res => res.data);
export const fetchProjectBySlug = (slug) => api.get(`/projects/${slug}`).then(res => res.data);
export const fetchExperience = () => api.get('/experience').then(res => res.data);
export const fetchSkills = () => api.get('/skills').then(res => res.data);
export const fetchEducation = () => api.get('/education').then(res => res.data);
export const fetchAchievements = () => api.get('/achievements').then(res => res.data);
export const fetchCertifications = () => api.get('/certifications').then(res => res.data);

// Auth
export const login = (email, password) => api.post('/auth/login', { email, password }).then(res => res.data);

// Attach token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Admin endpoints
export const fetchAdminStats = () => api.get('/admin/stats').then(res => res.data);

// Admin Projects
export const fetchAdminProjects = () => api.get('/admin/projects').then(res => res.data);
export const createAdminProject = (data) => api.post('/admin/projects', data).then(res => res.data);
export const updateAdminProject = (id, data) => api.put(`/admin/projects/${id}`, data).then(res => res.data);
export const deleteAdminProject = (id) => api.delete(`/admin/projects/${id}`).then(res => res.data);

// Admin Experience
export const fetchAdminExperience = () => api.get('/admin/experience').then(res => res.data);
export const createAdminExperience = (data) => api.post('/admin/experience', data).then(res => res.data);
export const updateAdminExperience = (id, data) => api.put(`/admin/experience/${id}`, data).then(res => res.data);
export const deleteAdminExperience = (id) => api.delete(`/admin/experience/${id}`).then(res => res.data);

// Admin Profile
export const fetchAdminProfile = () => api.get('/admin/profile').then(res => res.data);
export const updateAdminProfile = (data) => api.put('/admin/profile', data).then(res => res.data);
export const uploadProfilePhoto = (formData) => api.post('/admin/profile/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
}).then(res => res.data);

export const uploadFile = (formData) => api.post('/admin/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
}).then(res => res.data);

// Admin Skills
export const fetchAdminSkills = () => api.get('/admin/skills').then(res => res.data);
export const createAdminSkill = (data) => api.post('/admin/skills', data).then(res => res.data);
export const updateAdminSkill = (id, data) => api.put(`/admin/skills/${id}`, data).then(res => res.data);
export const deleteAdminSkill = (id) => api.delete(`/admin/skills/${id}`).then(res => res.data);

// Contact / Messages
export const submitContactMessage = (data) => api.post('/contact', data).then(res => res.data);
export const fetchAdminMessages = (params = {}) => api.get('/admin/messages', { params }).then(res => res.data);
export const fetchAdminMessagesStats = () => api.get('/admin/messages/stats').then(res => res.data);
export const fetchAdminMessage = (id) => api.get(`/admin/messages/${id}`).then(res => res.data);
export const toggleMessageReadStatus = (id, isRead) => api.patch(`/admin/messages/${id}/read`, { isRead }).then(res => res.data);
export const deleteAdminMessage = (id) => api.delete(`/admin/messages/${id}`).then(res => res.data);

// Admin Education
export const fetchAdminEducation = () => api.get('/admin/education').then(res => res.data);
export const createAdminEducation = (data) => api.post('/admin/education', data).then(res => res.data);
export const updateAdminEducation = (id, data) => api.put(`/admin/education/${id}`, data).then(res => res.data);
export const deleteAdminEducation = (id) => api.delete(`/admin/education/${id}`).then(res => res.data);

// Admin Certifications
export const fetchAdminCertifications = () => api.get('/admin/certifications').then(res => res.data);
export const createAdminCertification = (data) => api.post('/admin/certifications', data).then(res => res.data);
export const updateAdminCertification = (id, data) => api.put(`/admin/certifications/${id}`, data).then(res => res.data);
export const deleteAdminCertification = (id) => api.delete(`/admin/certifications/${id}`).then(res => res.data);

// Admin Achievements
export const fetchAdminAchievements = () => api.get('/admin/achievements').then(res => res.data);
export const createAdminAchievement = (data) => api.post('/admin/achievements', data).then(res => res.data);
export const updateAdminAchievement = (id, data) => api.put(`/admin/achievements/${id}`, data).then(res => res.data);
export const deleteAdminAchievement = (id) => api.delete(`/admin/achievements/${id}`).then(res => res.data);

// Site Settings
export const fetchSiteSettings = () => api.get('/settings').then(res => res.data);
export const fetchAdminSettings = () => api.get('/admin/settings').then(res => res.data);
export const updateAdminSettings = (data) => api.put('/admin/settings', data).then(res => res.data);
export const updateAdminPassword = (data) => api.put('/admin/settings/password', data).then(res => res.data);
export const updateAdminEmail = (data) => api.put('/admin/settings/email', data).then(res => res.data);
export const exportAdminData = () => api.get('/admin/settings/export').then(res => res.data);

// Multi-Tenant Public Endpoints
export const fetchPublicPortfolio = (username) => 
  api.get(`/public/${username || 'default'}/data`).then(res => res.data);

export const submitPublicContactMessage = (username, data) => 
  api.post(`/public/${username || 'kartik'}/contact`, data).then(res => res.data);

// Superadmin User Management
export const fetchAdminUsers = () => api.get('/admin/users').then(res => res.data);
export const createAdminUser = (data) => api.post('/admin/users', data).then(res => res.data);
export const resetAdminUserPassword = (id, newPassword) => api.put(`/admin/users/${id}/password`, { newPassword }).then(res => res.data);
export const deleteAdminUser = (id) => api.delete(`/admin/users/${id}`).then(res => res.data);





