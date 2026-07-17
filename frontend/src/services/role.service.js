import api from './axios';

const roleService = {
  add: async (roleData) => {
    const response = await api.post('/role/add', roleData);
    return response.data;
  },
  getList: async (params = {}) => {
    const response = await api.get('/role/list', { params });
    return response.data;
  },
  update: async (roleData) => {
    const response = await api.patch('/role/update', roleData);
    return response.data;
  },
  delete: async (roleId) => {
    const response = await api.patch('/role/delete', { roleId });
    return response.data;
  }
};

export default roleService;
