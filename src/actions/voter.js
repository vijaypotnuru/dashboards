import { LIMIT_PER_PAGE } from "../constants";
import ApiServices from "../services/apiservices";
import {
  changeOpinionPollRoute,
  createTicketHistoryRoute,
  createTicketRoute,
  getAllNavaratnaluRoute,
  getAllVotorsSurveyRoute,
  getDuplicateVoterslistRoute,
  getFilterDataRoute,
  getViewVotersListRoute,
  getVotersListTotals,
  saveOrupdatedSurvey,
  updateVotingSurvey,
} from "../utils/apis";
import { addVoterTicket } from "./ticket";

export const clearVoterReducer = () => async (dispatch) => {
  dispatch({
    type: "VOTER_CLEAR_SUCCESS",
  });
};

export const getAllVotersSurvey =
  (data, pageNo = 0, limit = LIMIT_PER_PAGE) =>
  async (dispatch) => {
    dispatch({
      type: "VOTER_LOAD_START",
    });

    try {
      let itemsList = [];

      let duplicatesCount = null;

      if (data.showDuplicates === true) {
        const response = await ApiServices.postRequest(`${getDuplicateVoterslistRoute}?page=${pageNo + 1}&&limit=${limit}`, data);
        const responseData = response.data;
        console.log("hulksmash123", responseData);
        duplicatesCount = responseData?.message?.count ?? null;

        itemsList = responseData?.message?.data ?? [];
        console.log("itemsList duplicate ", itemsList);
      } else {
        console.log("showDuplicate in voter.js555", false);
        const response = await ApiServices.postRequest(`${getAllVotorsSurveyRoute}?page=${pageNo + 1}&&limit=${limit}`, data);
        const responseData = response.data;
        // const itemsList = responseData?.data ?? [];
        itemsList = responseData?.message?.data ?? [];
        console.log("itemsList", itemsList);
      }
      const cardResponse = await ApiServices.postRequest(getVotersListTotals, data);
      const cardResponseData = cardResponse.data;
      const cardData = cardResponseData?.message?.data[0] ?? [];
      // const cardData = []

      // console.log(cardData);
      dispatch({
        type: "VOTER_LOAD_SUCCESS",
        payload: {
          data: itemsList,
          count: duplicatesCount == null ? cardData?.voters_count ?? 0 : duplicatesCount,
          completed: cardData?.surveyed_count ?? 0,
          pending: cardData?.not_surveyed_count ?? 0,
          page: pageNo,
          limit: limit,
        },
      });
      // console.log("VOTER_LOAD_SUCCESS", itemsList);
    } catch (err) {
      console.log(err);
      dispatch({
        type: "VOTER_LOAD_ERROR",
        payload: err.message,
      });
    }
  };

export const getAllVotersSurveyWithGroup =
  (data, pageNo = 0, limit = LIMIT_PER_PAGE) =>
  async (dispatch) => {
    dispatch({
      type: "VOTER_LOAD_START",
    });

    try {
      let itemsList = [];

      let duplicatesCount = null;

      if (data.showDuplicates === true) {
        const response = await ApiServices.postRequest(`${getDuplicateVoterslistRoute}?page=${pageNo + 1}&&limit=${limit}`, data);
        const responseData = response.data;
        console.log("hulksmash123", responseData);
        duplicatesCount = responseData?.message?.count ?? null;

        itemsList = responseData?.message?.data ?? [];
        console.log("itemsList duplicate ", itemsList);
      } else {
        console.log("showDuplicate in voter.js555", false);
        const response = await ApiServices.postRequest(`${getViewVotersListRoute}?page=${pageNo + 1}&&limit=${limit}`, data);
        const responseData = response.data;
        // const itemsList = responseData?.data ?? [];
        itemsList = responseData?.message?.data ?? [];
        console.log("itemsList", itemsList);
      }
      const cardResponse = await ApiServices.postRequest(getVotersListTotals, data);
      const cardResponseData = cardResponse.data;
      const cardData = cardResponseData?.message?.data[0] ?? [];
      // const cardData = []

      // console.log(cardData);
      dispatch({
        type: "VOTER_LOAD_SUCCESS",
        payload: {
          data: itemsList,
          count: duplicatesCount == null ? cardData?.voters_count ?? 0 : duplicatesCount,
          completed: cardData?.surveyed_count ?? 0,
          pending: cardData?.not_surveyed_count ?? 0,
          page: pageNo,
          limit: limit,
        },
      });
      // console.log("VOTER_LOAD_SUCCESS", itemsList);
    } catch (err) {
      console.log(err);
      dispatch({
        type: "VOTER_LOAD_ERROR",
        payload: err.message,
      });
    }
  };

export const changeOpinionPoll = (id, value, volunteer_id) => async (dispatch) => {
  try {
    const jsonData = {
      volunteer_id: volunteer_id,
      voter_pk: id,
      intrested_party: value,
    };
    console.log(jsonData);

    await ApiServices.postRequest(changeOpinionPollRoute, jsonData);

    dispatch({
      type: "VOTER_CHANGE_OPINION",
      payload: { id: id, value: value },
    });

    return true;
  } catch (err) {
    console.log(err);

    return false;
  }
};

export const changeVotedParty = (id, value, volunteer_id) => async (dispatch) => {
  try {
    const jsonData = {
      volunteer_id: volunteer_id,
      voter_pk: id,
      voted_party: value == true ? 1 : 0,
    };
    console.log("hulkgyuhh", jsonData);

    await ApiServices.postRequest(updateVotingSurvey, jsonData);

    dispatch({
      type: "VOTER_CHANGE_VOTED_PARTY",
      payload: { id: id, value: value },
    });

    return true;
  } catch (err) {
    console.log(err);

    return false;
  }
};

export const updateVoterDetails = (id, data, voterData, account) => async (dispatch) => {
  try {
    // const jsonData = {
    //   volunteer_id: 1,
    //   voter_pk: id,
    //   ...data,
    // };

    console.log("voterData965254441dddddd1", voterData);

    if (data.voting_reason != null && voterData.voting_reason == null && data.ticket_type == "voting" && voterData.opinionparty == 23) {
      console.log("voting_reason99999", data.voting_reason);
      const addticketResponse = await addVoterTicket(id, data, account);
      console.log("addticketResponse", addticketResponse);
      dispatch({
        type: "VOTER_UPDATE_SUCCESS",
        payload: {
          id: id,
          value: {
            ...data,
          },
        },
      });

      return;
    }
    const jsonData = {
      voter_pk: id,
      ...data,
      current_address: data.is_resident == 1 ? null : data?.current_address ?? null,
      nr_state: data.is_resident == 1 ? null : data?.nr_state ?? null,
      nr_city: data.is_resident == 1 ? null : data?.nr_city ?? null,
    };
    console.log("voterData9652544411", account);
    const response = await ApiServices.postRequest(saveOrupdatedSurvey, jsonData);
    const responseData = response.data?.data ?? {};

    if (voterData.status_id == null) {
      const addticketResponse = await addVoterTicket(id, data, account);
      console.log("addticketResponse", addticketResponse);
    }

    console.log("response963852741", response);
    const caste_id = response.data?.caste_id ?? null;
    const caste_name = data.caste_name;

    dispatch({
      type: "VOTER_UPDATE_SUCCESS",
      payload: {
        id: id,
        value: {
          ...data,
          surveyed_by: account.user.user_displayname,
          status_id: voterData.status_id == null ? 1 : voterData.status_id,
          current_address: data.is_resident == 1 ? null : data?.current_address ?? null,
          caste_id: caste_id,
          caste_name: caste_name,
          nr_state: data.is_resident == 1 ? null : data?.nr_state ?? null,
          nr_city: data.is_resident == 1 ? null : data?.nr_city ?? null,
        },
      },
    });

    if (responseData.religion_id) {
      dispatch({
        type: "COMMON_ADD_RELIGION",
        payload: { label: data.religion_name, value: responseData.religion_id },
      });
    }

    if (caste_id) {
      dispatch({
        type: "COMMON_ADD_CASTE",
        payload: { label: caste_name, value: caste_id, religion_pk: data.religion_id, category_pk: data.category_id },
      });
    }

    return true;
  } catch (err) {
    console.log(err);

    return false;
  }
};

export const deleteVoterInRedux = (id, voter) => async (dispatch) => {
  console.log("data", voter);
  const newData = voter.data.filter((item) => {
    return item.voter_pkk !== id;
  });
  console.log(newData);
  console.log("id", id);
  dispatch({
    type: "VOTER_LOAD_SUCCESS",
    payload: {
      ...voter,
      data: newData,
    },
  });
};
