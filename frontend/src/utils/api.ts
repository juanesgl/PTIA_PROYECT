import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface NodeDTO {
  id: string;
  code: string;
  name: string;
  credits: number;
  suggested_semester: number;
}

export interface EdgeDTO {
  source: string;
  target: string;
}

export interface GraphResponse {
  nodes: NodeDTO[];
  edges: EdgeDTO[];
}

export interface SemesterPlanDTO {
  semester_index: number;
  courses: string[];
}

export interface StudyPlanResponse {
  semesters: SemesterPlanDTO[];
}

export interface CriticalPathResponse {
  critical_paths: Record<string, number>;
}

export const CurriculumService = {
  getGraph: async (): Promise<GraphResponse> => {
    const response = await api.get('/curriculum/graph');
    return response.data;
  },
  getToposort: async (): Promise<string[]> => {
    const response = await api.get('/curriculum/toposort');
    return response.data;
  }
};

export const PlanningService = {
  getAvailableCourses: async (studentId: string): Promise<string[]> => {
    const response = await api.get(`/students/${studentId}/available-courses`);
    return response.data;
  },
  getHistory: async (studentId: string): Promise<string[]> => {
    const response = await api.get(`/students/${studentId}/history`);
    return response.data;
  },
  getCriticalPath: async (studentId: string): Promise<CriticalPathResponse> => {
    const response = await api.get(`/students/${studentId}/critical-path`);
    return response.data;
  },
  generatePlan: async (studentId: string, maxCredits: number): Promise<StudyPlanResponse> => {
    const response = await api.post(`/students/${studentId}/plan`, {
      max_credits_per_semester: maxCredits,
      target_semesters: 10
    });
    return response.data;
  }
};
