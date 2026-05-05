import client from './client';

export const authApi = {
  login: (data) => client.post('/auth/login', data),
  register: (data) => client.post('/auth/register', data),
  getProfile: () => client.get('/auth/me'),
};

export const usersApi = {
  getAll: (params) => client.get('/users', { params }),
  getById: (id) => client.get(`/users/${id}`),
  getStudents: () => client.get('/users/students'),
  getProfessors: () => client.get('/users/professors'),
  getStudentsByGroup: (groupId) => client.get(`/users/group/${groupId}/students`),
  getAssignments: (id) => client.get(`/users/${id}/assignments`),
  create: (data) => client.post('/users', data),
  update: (id, data) => client.put(`/users/${id}`, data),
  delete: (id) => client.delete(`/users/${id}`),
  assignGroup: (id, data) => client.post(`/users/${id}/assign-group`, data),
  assignSubject: (id, data) => client.post(`/users/${id}/assign-subject`, data),
  removeAssignment: (id) => client.delete(`/users/assignments/${id}`),
};

export const subjectsApi = {
  getAll: () => client.get('/subjects'),
  create: (data) => client.post('/subjects', data),
  update: (id, data) => client.put(`/subjects/${id}`, data),
  delete: (id) => client.delete(`/subjects/${id}`),
};

export const groupsApi = {
  getAll: () => client.get('/groups'),
  create: (data) => client.post('/groups', data),
  update: (id, data) => client.put(`/groups/${id}`, data),
  delete: (id) => client.delete(`/groups/${id}`),
};

export const gradesApi = {
  getMyGrades: () => client.get('/grades/my-grades'),
  getMyAverages: () => client.get('/grades/my-averages'),
  upsert: (data) => client.post('/grades', data),
  bulkGrade: (activityId, data) => client.post(`/grades/activity/${activityId}/bulk`, data),
};

export const activitiesApi = {
  getAll: (params) => client.get('/activities', { params }),
  getMyActivities: () => client.get('/activities/my-activities'),
  getById: (id) => client.get(`/activities/${id}`),
  getStudents: (id) => client.get(`/activities/${id}/students`),
  create: (data) => client.post('/activities', data),
  update: (id, data) => client.put(`/activities/${id}`, data),
  delete: (id) => client.delete(`/activities/${id}`),
};

export const periodsApi = {
  getAll: () => client.get('/periods'),
  getActive: () => client.get('/periods/active'),
  create: (data) => client.post('/periods', data),
  update: (id, data) => client.put(`/periods/${id}`, data),
  activate: (id) => client.post(`/periods/${id}/activate`),
  deactivate: (id) => client.post(`/periods/${id}/deactivate`),
  delete: (id) => client.delete(`/periods/${id}`),
};

export const dashboardApi = {
  getFull: () => client.get('/dashboard'),
  getStats: () => client.get('/dashboard/stats'),
  getAverages: () => client.get('/dashboard/averages'),
};

export const settingsApi = {
  getAll: () => client.get('/settings'),
  getInstitutionLogo: () => `/api/settings/institution-logo?t=${Date.now()}`,
  getInstitutionName: () => client.get('/settings/institution-name'),
  uploadLogo: (formData) => client.post('/settings/institution-logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteLogo: () => client.delete('/settings/institution-logo'),
  updateInstitutionName: (name) => client.post('/settings/institution-name', { name }),
  getCertificateData: (studentId) => client.get(`/settings/certificate/${studentId}`),
};

