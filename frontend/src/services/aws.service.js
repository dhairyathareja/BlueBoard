import api from './axios';

const awsService = {
  provisionAccess: async (employeeId) => {
    const response = await api.post('/awsProfile/provisionAccess', { employeeId });
    return response.data;
  },
  getList: async (params = {}) => {
    const response = await api.get('/awsProfile/list', { params });
    return response.data;
  },
  resetPassword: async (awsProfileId) => {
    const response = await api.patch('/awsProfile/resetPassword', { awsProfileId });
    return response.data;
  },
  disableAccess: async (awsProfileId) => {
    const response = await api.patch('/awsProfile/disableAccess', { awsProfileId });
    return response.data;
  }
};

export default awsService;
