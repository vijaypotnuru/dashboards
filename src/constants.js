export const bgColors = ["#F79256", "#FBD1A2", "#7DCFB6", "#00B2CA", "#1D4E89"];
export const bgColors1 = ["#d44c2c", "#e9c474", "#1c717c", "#8f834b", "#d6742b"];

export const LOGIN_TYPES = ["MLA", "MANDAL_CONVENER/CPRO", "PRO", "APRO", "BOOTH_INCHARGE", "VOLUNTEER", "GRUHASARATHI", "Admin", "Operator"];

export const searchFiltercolor = "#D3F0E3";

export const LIMIT_PER_PAGE = 100;
export const ROWS_PER_PAGE_OPTION = [50, 100, 200];

export const PUBLIC_URL = process.env.PUBLIC_URL;

export const numRegExp = /^[0-9]+$/;
// export const phoneRegExp = /\d{10}$/;
export const phoneRegExp = /^[6-9]\d{9}$/;

export const isOtpValid = (value) => {
  var regex = /\b\d{6}\b/;
  return regex.test(value);
};

export const PARTY_ID = {
  NEUTRAL: 22,
  YSRCP: 23,
  TDP: 24,
  CONGRESS: 26,
  BJP: 25,
  JANASENA: 27,
  OTHERS: 80,
};

export const getTicketStatusById = (value) => {
  if (value === 1) {
    return "Open";
  }
  if (value === 2) {
    return "Resolved";
  }
  if (value === 3) {
    return "Cancelled";
  }
  if (value === 4) {
    return "Escalated";
  }

  return "-";
};

export const getTicketColorByValue = (value) => {
  if (value === 1) {
    return "primary.main";
  }
  if (value === 2) {
    return "success.main";
  }
  if (value === 3) {
    return "error.main";
  }
  if (value === 4) {
    return "#DC582A";
  }

  return "grey";
};
