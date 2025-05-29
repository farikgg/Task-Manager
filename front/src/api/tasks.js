import api from './axiosConfig';

export const getTasks = async () => {
  const response = await api.get('/tasks');
  return response.data || [];
};

export const createTask = async (taskData) => {
  const response = await api.post('/tasks', taskData);
  return response.data;
};

export const deleteTask = (id) => api.delete(`/tasks/${id}`);

export const updateTaskStatus = async (id, isCompleted) => {
  const response = await api.patch(`/tasks/${id}/status`, { isCompleted });
  return response;
};