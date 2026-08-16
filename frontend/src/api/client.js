import axios from "axios";

export const API_BASE = import.meta.env.VITE_API_BASE || "https://learnlyapp.up.railway.app";

const client = axios.create({ baseURL: API_BASE });

export const api = {
  // ---------- users (identity switcher and auth) ----------
  listUsers: () => client.get("/api/users").then((r) => r.data),
  createUser: (payload) => client.post("/api/users", payload).then((r) => r.data),
  signup: (payload) => client.post("/api/users/signup", payload).then((r) => r.data),
  login: (payload) => client.post("/api/users/login", payload).then((r) => r.data),

  // ---------- categories ----------
  listCategories: () => client.get("/api/categories").then((r) => r.data),

  // ---------- courses ----------
  listCourses: (params = {}) => client.get("/api/courses", { params }).then((r) => r.data),
  getCourse: (id, viewerId) =>
    client
      .get(`/api/courses/${id}`, { params: viewerId ? { viewer_id: viewerId } : {} })
      .then((r) => r.data),
  createCourse: (payload) => client.post("/api/courses", payload).then((r) => r.data),
  updateCourse: (id, payload) => client.put(`/api/courses/${id}`, payload).then((r) => r.data),
  coursesByInstructor: (instructorId) =>
    client.get(`/api/courses/instructor/${instructorId}`).then((r) => r.data),

  // ---------- enrollment (instant, no payment) ----------
  enroll: (userId, courseId) =>
    client.post("/api/enrollments", { user_id: userId, course_id: courseId }).then((r) => r.data),
  myLearning: (userId) => client.get(`/api/enrollments/user/${userId}`).then((r) => r.data),
  setLectureProgress: (lectureId, userId, completed) =>
    client
      .put(`/api/enrollments/lectures/${lectureId}/progress`, { user_id: userId, completed })
      .then((r) => r.data),

  // ---------- reviews ----------
  addReview: (courseId, userId, rating, comment) =>
    client
      .post(`/api/courses/${courseId}/reviews`, { user_id: userId, rating, comment })
      .then((r) => r.data),

  // ---------- admin ----------
  deleteCourse: (id) => client.delete(`/api/courses/${id}`).then((r) => r.data),

  // ---------- quiz ----------
  getQuestions: (courseId) => client.get(`/api/courses/${courseId}/questions`).then((r) => r.data),
  getAllQuestions: (courseId) => client.get(`/api/courses/${courseId}/questions/all`).then((r) => r.data),
  createQuestion: (courseId, payload) =>
    client.post(`/api/courses/${courseId}/questions`, payload).then((r) => r.data),
  updateQuestion: (courseId, questionId, payload) =>
    client.put(`/api/courses/${courseId}/questions/${questionId}`, payload).then((r) => r.data),
  deleteQuestion: (courseId, questionId) =>
    client.delete(`/api/courses/${courseId}/questions/${questionId}`).then((r) => r.data),
  submitQuiz: (courseId, userId, answers) =>
    client.post(`/api/courses/${courseId}/quiz`, { user_id: userId, answers }).then((r) => r.data),
  getQuizAttempts: (courseId, userId) =>
    client.get(`/api/courses/${courseId}/quiz/attempts`, { params: { user_id: userId } }).then((r) => r.data),
};

export function thumbnailUrl(seed, w = 480, h = 300) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
}
