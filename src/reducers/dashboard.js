const initialState = {
  isLoading: false,
  opinion: [],
  opinionResults: [],
  surveyReports1: [],
  surveyReports2: [],
  votingSurveyResult: [],
  voting: [],
  errorMessage: null,
};

export default function dashboardReducer(state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case "DASHBOARD_LOAD_START":
      return {
        ...state,
        isLoading: true,
        opinion: [],
        opinionResults: [],
        surveyReports1: [],
        surveyReports2: [],
        votingSurveyResult: [],
        voting: [],
        errorMessage: null,
      };

    case "OPINION_DB_LOAD_SUCCESS":
      return {
        ...state,
        isLoading: false,
        opinion: payload,
      };

    case "VOTING_DB_LOAD_SUCCESS":
      return {
        ...state,
        isLoading: false,
        voting: payload,
      };

    case "OPINION_RESULTS_LOAD_SUCCESS":
      return {
        ...state,
        isLoading: false,
        opinionResults: payload.opinionResults,
        surveyReports1: payload.surveyReports1,
        surveyReports2: payload.surveyReports2,
      };

    case "VOTING_RESULTS_LOAD_SUCCESS":
      return {
        ...state,
        isLoading: false,
        votingSurveyResult: payload.votingSurveyResult,
        opinionResults: payload?.opinionResults ?? [],
        surveyReports1: payload?.surveyReports1 ?? [],
        surveyReports2: payload?.surveyReports2 ?? [],
        surveyReports3: payload?.surveyReports3 ?? [],
        surveyReportCardData: payload?.surveyReportCardData ?? [],
      };

    case "DASHBOARD_LOAD_ERROR":
      return {
        ...state,
        isLoading: false,
        errorMessage: payload,
      };

    case "DASHBOARD_CLEAR_SUCCESS":
      return {
        isLoading: false,
        opinion: [],
        opinionResults: [],
        surveyReports1: [],
        surveyReports2: [],
        votingSurveyResult: [],
        voting: [],
        errorMessage: null,
      };

    default:
      return state;
  }
}
