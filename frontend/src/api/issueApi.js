import api from './axiosConfig';

export const getAllIssues = (params) => api.get('/api/issues', { params });
export const getIssueById = (id) => api.get(`/api/issues/${id}`);
export const getMyIssues = () => api.get('/api/issues/my');
export const createIssue = (formData) =>
    api.post('/api/issues', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const upvoteIssue = (id) => api.put(`/api/issues/${id}/upvote`);
export const addComment = (id, content) => api.post(`/api/issues/${id}/comments`, { content });
export const deleteIssue = (id) => api.delete(`/api/issues/${id}`);
