import { LIMIT_PER_PAGE } from "../constants";
import ApiServices from "../services/apiservices";
import { createTicketHistoryRoute, createTicketRoute, getAllTicketsRoute, getVoterTicketHistoryRoute } from "../utils/apis";

export const clearTicketReducer = () => async (dispatch) => {
  dispatch({
    type: "TICKET_CLEAR_SUCCESS",
  });
};

export const getAllTickets =
  (data, pageNo = 0, limit = LIMIT_PER_PAGE) =>
  async (dispatch) => {
    dispatch({
      type: "TICKET_LOAD_START",
    });

    try {
      // const response = await ApiServices.postRequest(getAllTicketsRoute, data);
      const response = await ApiServices.postRequest(`${getAllTicketsRoute}?page=${pageNo + 1}&&limit=${limit}`, data);

      const responseData = response.data;
      const itemsList = responseData?.message ?? [];

      dispatch({
        type: "TICKET_LOAD_SUCCESS",
        payload: {
          data: itemsList,
          analytics: { count: responseData.count, open: responseData.open, resolved: responseData.resolved, cancelled: responseData.cancelled, escalated: responseData.escalated },
          count: responseData.count,
          page: pageNo,
          limit: limit,
        },
      });
    } catch (err) {
      console.log(err);
      dispatch({
        type: "TICKET_LOAD_ERROR",
        payload: err.message,
      });
    }
  };

export const checkOrUncheckTicket = (id, value) => async (dispatch) => {
  dispatch({
    type: "TICKET_CHECK_CHANGE",
    payload: { id: id, value: value },
  });
};

export const getVoterTicketHistory = (id) => async (dispatch) => {
  dispatch({
    type: "TICKET_LOAD_START",
  });

  try {
    const response = await ApiServices.postRequest(getVoterTicketHistoryRoute, { voter_pk: id });
    const responseData = response.data?.message ?? [];

    dispatch({
      type: "TICKET_HISTORY_LOAD_SUCCESS",
      payload: responseData,
    });
  } catch (err) {
    console.log(err);
    dispatch({
      type: "TICKET_LOAD_ERROR",
      payload: err.message,
    });
  }
};

export const addVoterTicket = async (id, data, account) => {
  try {
    const jsonData = {
      ...data,
      voter_pk: id,
      navaratnalu_id: data.navaratnalu_id,
      reason: data.reason,
      status_id: 1,
      volunteer_id: account.user.user_pk,
      createdby: account.user.user_pk,
    };
    console.log("asdfghjkledfrghjkl", jsonData);

    var response = await ApiServices.postRequest(createTicketRoute, jsonData);
    const responseData = response.data ?? {};
    // console.log(result);

    if (responseData.status == "success") {
      return { status: true, message: responseData.message };
    } else {
      throw new Error(responseData.message);
    }
  } catch (err) {
    console.log(err);
    return { status: false, message: err.message };
  }
};

export const updateReplyVoterTicket = async (id, data, account) => {
  try {
    const jsonData = {
      ticket_master_pk: id,
      navaratnalu_id: data.navaratnalu_id,
      reason: data.reason,
      status_id: data.status_id != "" ? data.status_id : 1,
      ticket_attachment_id: 6,
      volunteer_id: data.status_id == 4 ? data.next_level_user_id : account.user.user_pk,
      createdby: account.user.user_pk,
      user_pk: data.status_id == 4 ? data.next_level_user_id : account.user.user_pk,
    };

    var response = await ApiServices.postRequest(createTicketHistoryRoute, jsonData);
    const responseData = response.data ?? {};
    // console.log(result);

    return { status: true, message: responseData.message };
  } catch (err) {
    console.log(err);
    return { status: false, message: err };
  }
};
