import api from './axiosConfig';

export const getAdminIssues = (params) => api.get('/api/admin/issues', { params });
export const updateIssueStatus = (id, data, resolutionImage = null) => {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    if (resolutionImage) formData.append('resolutionImage', resolutionImage);
    return api.put(`/api/admin/issues/${id}/status`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};
export const getAdminStats = () => api.get('/api/admin/stats');
export const getAllUsers = () => api.get('/api/admin/users');
export const adminDeleteIssue = (id) => api.delete(`/api/admin/issues/${id}`);
