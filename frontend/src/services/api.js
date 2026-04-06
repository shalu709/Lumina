import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const authConfig = () => {
  const token = localStorage.getItem('lumina_token');
  return {
    headers: { Authorization: `Bearer ${token}` }
  };
};

export const aiTutor = async (prompt) => {
    const res = await axios.post(`${API_URL}/ai/tutor`, { prompt }, authConfig());
    return res.data.response;
};

export const fetchSectionTasks = async () => {
    const res = await axios.get(`${API_URL}/tasks/section`, authConfig());
    return res.data;
};

export const submitLoungeTask = async (taskData) => {
    const res = await axios.post(`${API_URL}/lounge/task`, taskData, authConfig());
    return res.data;
};

// --- Custom User API ---
export const claimClassRep = async () => {
    const res = await axios.post(`${API_URL}/users/claim-cr`, {}, authConfig());
    return res.data;
};

export const createGlobalTask = async (taskData) => {
    const res = await axios.post(`${API_URL}/tasks/`, taskData, authConfig());
    return res.data;
};

export const reportTask = async (taskId) => {
    const res = await axios.post(`${API_URL}/tasks/${taskId}/report`, { reason: 'Spam' }, authConfig());
    return res.data;
};

export const markTaskComplete = async (taskId) => {
    const res = await axios.post(`${API_URL}/tasks/${taskId}/complete`, {}, authConfig());
    return res.data;
};

export const logAttendanceDay = async (courseName, date, present) => {
    const res = await axios.post(`${API_URL}/attendance/log`, { courseName, date, present }, authConfig());
    return res.data;
};

export const fetchMyAttendance = async () => {
    const res = await axios.get(`${API_URL}/attendance/`, authConfig());
    return res.data;
};

// --- Subjects API ---
export const fetchMySubjects = async () => {
    const res = await axios.get(`${API_URL}/subjects/`, authConfig());
    return res.data;
};

export const createSubject = async (subjectData) => {
    const res = await axios.post(`${API_URL}/subjects/`, subjectData, authConfig());
    return res.data;
};

export const deleteSubject = async (id) => {
    await axios.delete(`${API_URL}/subjects/${id}`, authConfig());
};

// --- Gamification API ---
export const rewardFocusPoints = async () => {
    const res = await axios.post(`${API_URL}/users/reward`, { points: 50 }, authConfig());
    return res.data;
};

// --- Chat API ---
export const fetchSectionMessages = async (since = null) => {
    const params = since ? { since } : {};
    const res = await axios.get(`${API_URL}/chat/section`, { ...authConfig(), params });
    return res.data;
};

export const sendChatMessage = async (content) => {
    const res = await axios.post(`${API_URL}/chat/send`, { content }, authConfig());
    return res.data;
};

export const reportChatMessage = async (id) => {
    const res = await axios.post(`${API_URL}/chat/${id}/report`, {}, authConfig());
    return res.data;
};

export const unreportChatMessage = async (id) => {
    const res = await axios.post(`${API_URL}/chat/${id}/unreport`, {}, authConfig());
    return res.data;
};

export const deleteChatMessage = async (id) => {
    const res = await axios.delete(`${API_URL}/chat/${id}`, authConfig());
    return res.data;
};

// --- Announcements API ---
export const fetchSectionAnnouncements = async () => {
    const res = await axios.get(`${API_URL}/announcements/section`, authConfig());
    return res.data;
};

export const postAnnouncement = async (title, body) => {
    const res = await axios.post(`${API_URL}/announcements/`, { title, body }, authConfig());
    return res.data;
};

export const deleteAnnouncement = async (id) => {
    await axios.delete(`${API_URL}/announcements/${id}`, authConfig());
};

// --- Global Channels API ---
export const fetchGlobalMessages = async (channel, since = null) => {
    const params = since ? { since } : {};
    const res = await axios.get(`${API_URL}/global/${channel}`, { ...authConfig(), params });
    return res.data;
};

export const sendGlobalMessage = async (channel, content) => {
    const res = await axios.post(`${API_URL}/global/${channel}/send`, { content }, authConfig());
    return res.data;
};

export const reportGlobalMessage = async (channel, id) => {
    await axios.post(`${API_URL}/global/${channel}/${id}/report`, {}, authConfig());
};

export const unreportGlobalMessage = async (channel, id) => {
    await axios.post(`${API_URL}/global/${channel}/${id}/unreport`, {}, authConfig());
};

export const deleteGlobalMessage = async (channel, id) => {
    await axios.delete(`${API_URL}/global/${channel}/${id}`, authConfig());
};

// --- Leaderboard API ---
export const fetchGlobalLeaderboard = async () => {
    const res = await axios.get(`${API_URL}/users/leaderboard/global`, authConfig());
    return res.data;
};

export const fetchSectionLeaderboard = async () => {
    const res = await axios.get(`${API_URL}/users/leaderboard/section`);
    return res.data;
};

// --- Collaborative Digital Vault API ---
export const fetchVaultResources = async () => {
    const res = await axios.get(`${API_URL}/vault/`, authConfig());
    return res.data;
};

export const shareVaultResource = async (payload) => {
    const res = await axios.post(`${API_URL}/vault/share`, payload, authConfig());
    return res.data;
};

export const upvoteVaultResource = async (id) => {
    const res = await axios.post(`${API_URL}/vault/${id}/upvote`, {}, authConfig());
    return res.data;
};

// --- Anonymous Course Ratings API ---
export const fetchCourseRatings = async () => {
    const res = await axios.get(`${API_URL}/ratings/`, authConfig());
    return res.data;
};

export const postCourseRating = async (payload) => {
    const res = await axios.post(`${API_URL}/ratings/`, payload, authConfig());
    return res.data;
};

export const deleteCourseRating = async (id) => {
    await axios.delete(`${API_URL}/ratings/${id}`, authConfig());
};

// --- Direct Messaging API ---
export const fetchRecentContacts = async () => {
    const res = await axios.get(`${API_URL}/messages/contacts`, authConfig());
    return res.data;
};

export const fetchChatThread = async (partnerId) => {
    const res = await axios.get(`${API_URL}/messages/thread/${partnerId}`, authConfig());
    return res.data;
};

export const sendDirectMessage = async (partnerId, content) => {
    const res = await axios.post(`${API_URL}/messages/send/${partnerId}`, { content }, authConfig());
    return res.data;
};

export const blockUser = async (partnerId) => {
    await axios.post(`${API_URL}/messages/block/${partnerId}`, {}, authConfig());
};

export const unblockUser = async (partnerId) => {
    await axios.post(`${API_URL}/messages/unblock/${partnerId}`, {}, authConfig());
};

export const updateUserPrivacy = async (allowReadReceipts) => {
    const res = await axios.post(`${API_URL}/users/privacy`, { allowReadReceipts }, authConfig());
    return res.data;
};

// --- Advanced AI API ---
export const generateAIQuiz = async (topic) => {
    const res = await axios.post(`${API_URL}/ai/quiz`, { topic }, authConfig());
    return res.data;
};

export const summarizeAIText = async (text) => {
    const res = await axios.post(`${API_URL}/ai/summarize`, { text }, authConfig());
    return res.data;
};


