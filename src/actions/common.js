import ApiServices from "../services/apiservices";
import {
  getAllDivisionRoute,
  getAllMandalRoute,
  getAllSachivalayamRoute,
  getAllPartsRoute,
  getAllVillageRoute,
  getAllNavaratnaluRoute,
  getAllCastesRoute,
  getAllReligionRoute,
  getAllDesignationsRoute,
  getTicketStatusRoute,
  getAllPartiesRoute,
  getFilterDataRoute,
  getAllDistrictsRoute,
  getAllConstituenciesRoute,
  getAllVoterTypesRoute,
  getAllReligionCasteRoute,
  getAllAgeGroupListRoute,
  getSurvedbyUsersList,
  getAllClusterGroupsRoute,
  getGroupUsersListRoute,
} from "../utils/apis";

export const getAllCommonData = (user) => async (dispatch) => {
  dispatch({
    type: "COMMON_LOAD_START",
  });

  try {
    const [
      districtResponse,
      constituencyResponse,
      navaratnaluResponse,
      casteResponse,
      religionResponse,
      religionCasteResponse,
      designationResponse,
      ticketStatusResponse,
      partiesResponse,
      groupResponse,
      voterTypesResponse,
      searchFilterResponse,
      ageGroupResponse,
      survedbyUsersListResponse,
    ] = await Promise.all([
      ApiServices.postRequest(getAllDistrictsRoute),
      ApiServices.postRequest(getAllConstituenciesRoute),
      ApiServices.postRequest(getAllNavaratnaluRoute),
      ApiServices.postRequest(getAllCastesRoute),
      ApiServices.postRequest(getAllReligionRoute),
      ApiServices.postRequest(getAllReligionCasteRoute),
      ApiServices.postRequest(getAllDesignationsRoute),
      ApiServices.postRequest(getTicketStatusRoute),
      ApiServices.postRequest(getAllPartiesRoute),
      ApiServices.postRequest(getAllClusterGroupsRoute, {
        district_id: null,
        consistency_id: null,
        mandal_id: null,
        division_id: null,
        sachivalayam_id: null,
        part_no: null,
      }),
      ApiServices.postRequest(getAllVoterTypesRoute),
      ApiServices.postRequest(getFilterDataRoute, {
        district_id: user.district_pk,
        consistency_id: user.consistency_pk,
      }),
      ApiServices.postRequest(getAllAgeGroupListRoute),
      ApiServices.postRequest(getSurvedbyUsersList),
    ]);

    // const districtResponse = await ApiServices.postRequest(getAllDistrictsRoute);
    const districtResponseData = districtResponse.data?.message ?? [];
    // const constituencyResponse = await ApiServices.postRequest(getAllConstituenciesRoute);
    const constituencyResponseData = constituencyResponse.data?.message ?? [];

    // const mandalResponse = await ApiServices.postRequest(getAllMandalRoute);
    // const mandalsResponseData = mandalResponse.data?.message ?? [];

    // const divisionsResponse = await ApiServices.postRequest(getAllDivisionRoute);
    // const divisionsResponseData = divisionsResponse.data?.message ?? [];

    // const sachivalayamResponse = await ApiServices.postRequest(getAllSachivalayamRoute);
    // const sachivalayamResponseData = sachivalayamResponse.data?.message ?? [];

    // const partsResponse = await ApiServices.postRequest(getAllPartsRoute);
    // const partsResponseData = partsResponse.data?.message ?? [];

    // const villageResponse = await ApiServices.postRequest(getAllVillageRoute);
    // const villageResponseData = villageResponse.data?.message ?? [];

    // const navaratnaluResponse = await ApiServices.postRequest(getAllNavaratnaluRoute);
    const navaratanaluResponseData = navaratnaluResponse.data?.message ?? [];

    // const casteResponse = await ApiServices.postRequest(getAllCastesRoute);
    const casteResponseData = casteResponse.data?.message ?? [];

    // const religionResponse = await ApiServices.postRequest(getAllReligionRoute);
    const religionResponseData = religionResponse.data?.message ?? [];
    console.log("religionResponseData", religionResponseData);

    // const religionCasteResponse = await ApiServices.postRequest(getAllReligionCasteRoute);
    const religionCasteResponseData = religionCasteResponse.data?.message ?? [];

    console.log("religionCasteResponseData", religionCasteResponseData);

    // const designationResponse = await ApiServices.postRequest(getAllDesignationsRoute);
    const designationResponseData = designationResponse.data?.message ?? [];

    // const ticketStatusResponse = await ApiServices.postRequest(getTicketStatusRoute);
    const ticketStatusResponseData = ticketStatusResponse.data?.message ?? [];

    // const partiesResponse = await ApiServices.postRequest(getAllPartiesRoute);
    const partiesResponseData = partiesResponse.data?.message ?? [];

    // const groupResponse = await ApiServices.postRequest(getAllClusterGroupsRoute, {
    //   district_id: null,
    //   consistency_id: null,
    //   mandal_id: null,
    //   division_id: null,
    //   sachivalayam_id: null,
    //   part_no: null,
    // });
    const groupResponseData = groupResponse.data?.message ?? [];

    // const voterTypesResponse = await ApiServices.postRequest(getAllVoterTypesRoute);
    const voterTypesResponseData = voterTypesResponse.data?.message ?? [];

    // const searchFilterResponse = await ApiServices.postRequest(getFilterDataRoute, {
    //   district_id: user.district_pk,
    //   consistency_id: user.consistency_pk,
    // });
    const searchFilterResponseData = searchFilterResponse.data?.message ?? [];

    console.log("searchFil", searchFilterResponseData);

    // const ageGroupResponse = await ApiServices.postRequest(getAllAgeGroupListRoute);
    const ageGroupResponseData = ageGroupResponse.data?.message ?? [];

    // const survedbyUsersListResponse = await ApiServices.postRequest(getSurvedbyUsersList);
    const survedbyUsersListResponseData = survedbyUsersListResponse.data?.message ?? [];

    console.log("survedbyUsersListResponseData", survedbyUsersListResponseData);

    // console.log("ageGroupResponseData", ageGroupResponseData);

    const filtersData = {
      districts: districtResponseData,
      constituencies: constituencyResponseData,
      mandals: searchFilterResponseData.mandals,
      divisions: searchFilterResponseData.divisions,
      sachivalayams: searchFilterResponseData.sachivalayams,
      parts: searchFilterResponseData.parts,
      clustergroups: groupResponseData.map((e) => ({
        label: e.group_name,
        value: e.group_pk,
        ...e,
      })),
      villages: searchFilterResponseData.villages,
      navaratnalu: navaratanaluResponseData,
      caste: casteResponseData.map((e) => ({
        label: e.lookup_valuename,
        value: e.lookup_pk,
      })),
      religion: religionResponseData.map((e) => ({
        label: e.lookup_valuename,
        value: e.lookup_pk,
      })),
      newReligion: religionCasteResponseData.religion.map((e) => ({
        label: e.religion_name,
        value: e.religion_pk,
        ...e,
      })),
      newCategory: religionCasteResponseData.category.map((e) => ({
        label: e.category_name,
        value: e.category_pk,
        ...e,
      })),
      newCaste: religionCasteResponseData.caste.map((e) => ({
        label: e.caste_name,
        value: e.caste_pk,
        ...e,
      })),
      designation: designationResponseData.map((e) => ({
        label: e.lookup_valuename,
        value: e.lookup_pk,
      })),
      ticket: ticketStatusResponseData.map((e) => ({
        label: e.ticket_status,
        value: e.lookup_pk,
      })),
      parties: partiesResponseData.map((e) => ({
        label: e.party_name,
        value: e.lookup_pk,
        color: e.attr1,
      })),
      voterTypes: voterTypesResponseData.map((e) => ({
        label: e.voter_type_name,
        value: e.lookup_pk,
      })),
      ageDropdown: ageGroupResponseData.map((e) => ({
        label: e.agegroup_name,
        value: e.lookup_valuename,
      })),
      surveyedBy: survedbyUsersListResponseData.map((e) => ({
        label: e.user_displayname,
        value: e.createdby,
        ...e,
      })),
      // searchFilterData: searchFilterResponseData,
    };

    console.log("filtersData123", filtersData);

    if (user.district_pk != null) {
      filtersData["districts"] = districtResponseData.filter((e) => e.district_id == user.district_pk);
    }

    if (user.consistency_pk != null) {
      filtersData["constituencies"] = constituencyResponseData.filter((e) => e.consistency_id == user.consistency_pk);
    }

    if (user.mandal_pk != null) {
      filtersData["mandals"] = searchFilterResponseData.mandals.filter((e) => e.mandal_id == user.mandal_pk);
    }

    if (user.division_pk != null) {
      filtersData["divisions"] = searchFilterResponseData.divisions.filter((e) => e.division_id == user.division_pk);
    }

    if (user.sachivalayam_pk != null) {
      filtersData["sachivalayams"] = searchFilterResponseData.sachivalayams.filter((e) => e.sachivalayam_id == user.sachivalayam_pk);
    }

    if (user.part_no != null) {
      filtersData["parts"] = searchFilterResponseData.parts.filter((e) => e.part_no == user.part_no);
    }

    if (user.group_id != null) {
      filtersData["clustergroups"] = groupResponseData.filter((e) => e.group_pk == user.group_id);
    }

    // if (user.village_pk != null) {
    //   filtersData["villages"] = villageResponseData.filter((e) => e.village_pk == user.village_pk);
    // }

    dispatch({
      type: "COMMON_LOAD_SUCCESS",
      payload: filtersData,
    });
  } catch (err) {
    console.log(err);
    dispatch({
      type: "COMMON_LOAD_ERROR",
      payload: err.message,
    });
  }
};
