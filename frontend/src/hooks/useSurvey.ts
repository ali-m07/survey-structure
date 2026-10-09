import useSWR from "swr";
import { apiClient, SURVEY_API, surveyService } from "../services/api";
import { Survey } from "../types/survey";
export function useSurvey(id?: string) {
  const { data, error, mutate } = useSWR<Survey>(
    id ? `${SURVEY_API}/surveys/${id}/` : null,
    (url: string) => apiClient.get<Survey>(url),
  );
  return {
    survey: data,
    loading: !data && !error,
    error,
    refresh: mutate,
    createSurvey: surveyService.createSurvey,
    publishSurvey: surveyService.publishSurvey,
  };
}
export function useSurveys() {
  const { data, error, mutate } = useSWR<Survey[] | { results: Survey[] }>(
    `${SURVEY_API}/surveys/`,
    (url: string) => apiClient.get<Survey[] | { results: Survey[] }>(url),
  );
  return {
    surveys: Array.isArray(data) ? data : data?.results || [],
    loading: !data && !error,
    error,
    refresh: mutate,
  };
}
