import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Grid, Container, Typography, Box, TextField, Card, MenuItem, IconButton } from "@mui/material";
import Page from "../components/Page";
import { connect } from "react-redux";
import { LoadingButton } from "@mui/lab";

import OpinionPollSurveyList from "../sections/reports/OpinionPollSurveyList";
import SearchByFilter from "../sections/common/SearchByFilter";
import { getAllVotersSurvey, clearVoterReducer } from "../actions/voter";
import { searchFiltercolor } from "../constants";
import { useLocation } from "react-router-dom";
import { RHFAutoComplete } from "../components/hook-form";
import { UncontrolledTextField } from "../components/hook-form/RHFTextField";
import { ClearAllOutlined } from "@mui/icons-material";
import ApiServices from "../services/apiservices";
import { getAllVotorsSurveyRoute } from "../utils/apis";

const OpinionPollSurveyPage = ({ isUser, getAllVotersSurvey, clearVoterReducer, common, account, voter }) => {
  const userPermission = account.user && account.user.permissions ? account.user.permissions : [];
  const pageActions = userPermission.filter((p) => p.page_id === 114)[0];

  console.log("ddfdfdfdfdffeuserwe", pageActions);

  const filterRef = useRef(null);
  const searchRef = useRef(null);

  const [filterValues, setFilterValues] = useState(null);
  const [otherFilterValues, setOtherFilterValues] = useState({
    intrested_party: null,
    is_resident: null,
    isSurveyed: null,
  });

  useEffect(() => {
    return () => {
      clearVoterReducer();
    };
  }, []);

  const handleSubmit = async (data) => {
    console.log("dadasdadsta", data);
    var searchData = searchRef.current.getSearchData();
    var values = {
      ...data,
      intrested_party: otherFilterValues.intrested_party?.value ?? null,
      is_resident: otherFilterValues.is_resident?.value ?? null,
      isSurveyed: otherFilterValues.isSurveyed?.value ?? null,
      sort_by: null,
      ...searchData,
    };

    await getAllVotersSurvey(values);
    setFilterValues(values);
  };

  const handleSearchSubmit = () => {
    filterRef.current.submit();
  };

  const handlePaginationSubmit = async (tableState) => {
    await getAllVotersSurvey(filterValues, tableState?.page, tableState?.rowsPerPage);
  };

  const getTableVotersData = async (limit) => {
    const response = await ApiServices.postRequest(`${getAllVotorsSurveyRoute}?page=${1}&&limit=${limit}`, filterValues);
    const responseData = response.data;
    // const itemsList = responseData?.data ?? [];
    const itemsList = responseData?.message?.data ?? [];
    console.log("itemsList85748558", itemsList);
    return itemsList;
  };

  const handleReset = () => {
    setOtherFilterValues({
      intrested_party: null,
      is_resident: null,
      isSurveyed: null,
    });

    searchRef.current.reset();
  };

  let isClearActive = otherFilterValues.intrested_party || otherFilterValues.is_resident || otherFilterValues.isSurveyed;

  isClearActive = isClearActive != null;

  let sortedParties = [...(common?.parties ?? [])].sort((a, b) => a.label.localeCompare(b.label));

  return (
    <Page title="Exit Poll Results">
      <Container maxWidth="xl">
        {/* <Typography variant="h4" sx={{ mb: 1 }}>
          Opinion Survey
        </Typography> */}

        <Card sx={{ p: 3, backgroundColor: searchFiltercolor }}>
          <Grid container spacing={2} alignItems="center">
            <SearchByFilter
            showOtherFilters={false}
            showDistrict={false}
            showConstituency={false}
            showMandal={false}
            showDivision={false}
            showSachivalayam={false}
            showPartNo={false}

              ref={filterRef}
              showVillage={false}
              isClearActive={isClearActive}
              onSubmit={handleSubmit}
              onReset={handleReset}
              children={
                <>
                  <Grid item xs={12} md={6} lg={2}>
                    <RHFAutoComplete
                      name="is_resident"
                      label="Select Options"
                      value={otherFilterValues.is_resident}
                      options={[
                        {
                          label: "Assembly",
                          value: 1,
                        },
                        {
                          label: "Mandal",
                          value: 0,
                        },
                      ]}
                      getOptionLabel={(option) => option.label}
                      onChange={(name, value) =>
                        setOtherFilterValues((state) => ({
                          ...state,
                          [name]: value,
                        }))
                      }
                    />
                  </Grid>

                 
                </>
              }
            />
            {/* <Grid item xs={12} md={6} lg={2}>
              <TextField
                size="small"
                label="Voter ID"
                fullWidth
                select
                sx={{
                  backgroundColor: "#fff",
                  borderRadius: "5px",
                }}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={2}>
              <TextField
                size="small"
                label="Voter Name"
                fullWidth
                select
                sx={{
                  backgroundColor: "#fff",
                  borderRadius: "5px",
                }}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={2}>
              <TextField
                size="small"
                label="Phone Number"
                fullWidth
                select
                sx={{
                  backgroundColor: "#fff",
                  borderRadius: "5px",
                }}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={2}>
              <TextField
                size="small"
                label="Select User"
                fullWidth
                select
                sx={{
                  backgroundColor: "#fff",
                  borderRadius: "5px",
                }}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={2}>
              <TextField
                size="small"
                label="Select Next Level User"
                fullWidth
                select
                sx={{
                  backgroundColor: "#fff",
                  borderRadius: "5px",
                }}
              />
            </Grid> */}
          </Grid>
        </Card>

        <Box p={1} />

        <OpinionPollSurveyList ref={searchRef} isUser={isUser} handleSubmit={handleSearchSubmit} handlePaginationSubmit={handlePaginationSubmit} getTableVotersData={getTableVotersData} />
      </Container>
    </Page>
  );
};
const mapStateToProps = (state) => {
  return {
    voter: state.voter,
    common: state.common,
    account: state.auth,
  };
};

export default connect(mapStateToProps, {
  getAllVotersSurvey,
  clearVoterReducer,
})(OpinionPollSurveyPage);
