export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8003').replace(/\/$/, '');
export const SURVEY_API = '/api/v1/survey';
class APIClient {
  async request<T>(endpoint: string, method = 'GET', data?: unknown, publicRequest = false): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const tenant = typeof window !== 'undefined' ? localStorage.getItem('tenant') : null;
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { method, headers: { 'Content-Type': 'application/json', ...(!publicRequest && token ? { Authorization: `Token ${token}` } : {}), ...(!publicRequest && tenant ? { 'X-Tenant-ID': tenant } : {}) }, ...(data !== undefined ? { body: JSON.stringify(data) } : {}) });
    if (!response.ok) { let details: unknown; try { details = await response.json(); } catch { details = response.statusText; } throw new Error(typeof details === 'string' ? details : JSON.stringify(details)); }
    if (response.status === 204) return undefined as T;
    return response.json();
  }
  get<T>(url: string) { return this.request<T>(url); }
  post<T>(url: string, data: unknown) { return this.request<T>(url, 'POST', data); }
  put<T>(url: string, data: unknown) { return this.request<T>(url, 'PUT', data); }
  patch<T>(url: string, data: unknown) { return this.request<T>(url, 'PATCH', data); }
  delete<T>(url: string) { return this.request<T>(url, 'DELETE'); }
  async download(url: string, filename: string) {
    const response = await fetch(`${API_BASE_URL}${url}`, {headers: {Authorization: `Token ${localStorage.getItem('token') || ''}`, 'X-Tenant-ID': localStorage.getItem('tenant') || ''}});
    if (!response.ok) throw new Error(await response.text());
    const href = URL.createObjectURL(await response.blob()); const anchor = document.createElement('a'); anchor.href = href; anchor.download = filename; anchor.click(); URL.revokeObjectURL(href);
  }
}
export const apiClient = new APIClient();
export const surveyService = {
 getSurveys: () => apiClient.get(`${SURVEY_API}/surveys/`), getSurvey: (id: string) => apiClient.get(`${SURVEY_API}/surveys/${id}/`), createSurvey: (data: unknown) => apiClient.post(`${SURVEY_API}/surveys/`, data), publishSurvey: (id: string) => apiClient.post(`${SURVEY_API}/surveys/${id}/publish/`, {})
};
export const aiService = {generateInsights: (context: string, data: unknown) => apiClient.post('/api/v1/ai/insights/generate', {context,data,insight_type:'executive_summary'}), analyzeSentiment: (text: string) => apiClient.post('/api/v1/ai/sentiment/analyze',{text,language:'en'}), chat: (prompt: string, model = 'gemma3') => apiClient.post('/api/v1/ai/models/chat',{prompt,model})};
export const organizationService = { getEmployees: () => apiClient.get('/api/v1/organization/employees/'), getDepartments: () => apiClient.get('/api/v1/organization/departments/'), getOrgChart: (id: string) => apiClient.get(`/api/v1/organization/hierarchy-nodes/?employee=${id}`) };
export const reportingService = {getReports: () => apiClient.get('/api/v1/reporting/reports/'), generateReport: (id: string) => apiClient.post(`/api/v1/reporting/reports/${id}/generate/`,{}), getDashboards: () => apiClient.get('/api/v1/reporting/dashboards/')};
