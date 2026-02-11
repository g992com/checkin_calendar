import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// User API
export const createUser = async (username: string) => {
  const response = await apiClient.post('/users', { username });
  return response.data.data;
};

export const getUser = async (username: string) => {
  const response = await apiClient.get(`/users/${username}`);
  return response.data.data;
};

// Task API
export const getTasks = async (params?: { userId?: string; groupId?: string }) => {
  const response = await apiClient.get('/tasks', { params });
  return response.data.data;
};

export const createTask = async (taskData: any) => {
  const response = await apiClient.post('/tasks', taskData);
  return response.data.data;
};

export const updateTask = async (id: string, taskData: any) => {
  const response = await apiClient.put(`/tasks/${id}`, taskData);
  return response.data.data;
};

export const deleteTask = async (id: string) => {
  const response = await apiClient.delete(`/tasks/${id}`);
  return response.data;
};

// CheckIn API
export const getCheckIns = async (params?: {
  taskId?: string;
  userId?: string;
  dateRange?: { start: string; end: string };
}) => {
  const response = await apiClient.get('/checkins', { params });
  return response.data.data;
};

export const createCheckIn = async (checkInData: {
  taskId: string;
  userId: string;
  checkInDate: string;
}) => {
  const response = await apiClient.post('/checkins', checkInData);
  return response.data.data; // { checkIn, streak, longestStreak }
};

export const deleteCheckIn = async (id: string) => {
  const response = await apiClient.delete(`/checkins/${id}`);
  return response.data;
};

// Statistics API
export const getUserStatistics = async (userId: string) => {
  const response = await apiClient.get(`/statistics/user/${userId}`);
  return response.data.data;
};

export const getTaskStatistics = async (taskId: string) => {
  const response = await apiClient.get(`/statistics/task/${taskId}`);
  return response.data.data;
};

export const getGroupStatistics = async (groupId: string) => {
  const response = await apiClient.get(`/statistics/group/${groupId}`);
  return response.data.data;
};

// Group API
export const getGroups = async (params?: { userId?: string }) => {
  const response = await apiClient.get('/groups', { params });
  return response.data.data;
};

export const createGroup = async (groupData: { name: string; description?: string }) => {
  const response = await apiClient.post('/groups', groupData);
  return response.data.data;
};

export const getGroup = async (id: string) => {
  const response = await apiClient.get(`/groups/${id}`);
  return response.data.data;
};

export const joinGroup = async (id: string, inviteCode: string) => {
  const response = await apiClient.post(`/groups/${id}/join`, { inviteCode });
  return response.data.data;
};

export const getGroupCalendar = async (
  id: string,
  params?: { startDate?: string; endDate?: string }
) => {
  const response = await apiClient.get(`/groups/${id}/calendar`, { params });
  return response.data.data;
};

export default apiClient;

