const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class APIClient {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }
}

export const apiClient = new APIClient();

// Service-specific clients
export const surveyService = {
  getSurveys: () => apiClient.get('/api/v1/survey/surveys/'),
  getSurvey: (id: string) => apiClient.get(`/api/v1/survey/surveys/${id}/`),
  createSurvey: (data: any) => apiClient.post('/api/v1/survey/surveys/', data),
  publishSurvey: (id: string) => apiClient.post(`/api/v1/survey/surveys/${id}/publish/`, {}),
};

export const aiService = {
  generateInsights: (context: string, data: any) =>
    apiClient.post('/api/v1/ai/insights/generate', { context, data, insight_type: 'executive_summary' }),
  analyzeSentiment: (text: string) =>
    apiClient.post('/api/v1/ai/sentiment/analyze', { text, language: 'en' }),
  chat: (prompt: string, model: string = 'gemma3') =>
    apiClient.post('/api/v1/ai/models/chat', { prompt, model }),
};

export const organizationService = {
  getEmployees: () => apiClient.get('/api/v1/organization/employees/'),
  getDepartments: () => apiClient.get('/api/v1/organization/departments/'),
  getOrgChart: (employeeId: string) =>
    apiClient.get(`/api/v1/organization/hierarchy-nodes/?employee=${employeeId}`),
};

export const reportingService = {
  getReports: () => apiClient.get('/api/v1/reporting/reports/'),
  generateReport: (id: string) => apiClient.post(`/api/v1/reporting/reports/${id}/generate/`, {}),
  getDashboards: () => apiClient.get('/api/v1/reporting/dashboards/'),
};

