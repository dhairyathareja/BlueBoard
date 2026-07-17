import api from './axios';

const employeeService = {
  getList: async (params = {}) => {
    const response = await api.get('/employee/list', { params });
    return response.data;
  },
  getDetails: async (id) => {
    const response = await api.get(`/employee/details/${id}`);
    return response.data;
  },
  getDashboardStats: async () => {
    const response = await api.get('/employee/dashboardStats');
    return response.data;
  },
  update: async (employeeData) => {
    const response = await api.post('/employee/update', employeeData);
    return response.data;
  },
  updateStatus: async (employeeId, status) => {
    const response = await api.post('/employee/update/status', { employeeId, status });
    return response.data;
  }
};

export default employeeService;
