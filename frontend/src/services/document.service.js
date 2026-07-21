import api from './axios';

const documentService = {
  upload: async (formData) => {
    const response = await api.post('/document/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  getList: async (params = {}) => {
    const response = await api.get('/document/list', { params });
    return response.data;
  },
  getEmployeeDocuments: async (employeeId) => {
    const response = await api.get(`/document/employee/${employeeId}`);
    return response.data;
  },
  download: async (documentId) => {
    const response = await api.get(`/document/download/${documentId}`);
    return response.data;
  },
  update: async (formData) => {
    const response = await api.patch('/document/update', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  delete: async (documentId) => {
    const response = await api.delete('/document/delete', {
      data: { documentId }
    });
    return response.data;
  }
};

export default documentService;
