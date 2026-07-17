import api from './axios';

const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  logout: async (userId) => {
    const response = await api.post('/auth/logout', { userId });
    return response.data;
  },
  getProfile: async (userId) => {
    const response = await api.get(`/auth/profileInfo/${userId}`);
    return response.data;
  },
  addEmployee: async (employeeData) => {
    const response = await api.post('/auth/addEmployee', employeeData);
    return response.data;
  },
  getProfileInfo: async (userId) => {
    const response = await api.get(`/auth/profileInfo/${userId}`);
    return response.data;
  }
};

export default authService;
