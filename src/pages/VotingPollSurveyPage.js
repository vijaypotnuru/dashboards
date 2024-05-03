import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Grid, Container, Typography, Box, TextField, Card, MenuItem, IconButton } from "@mui/material";
import Page from "../components/Page";
import { connect } from "react-redux";
import { LoadingButton } from "@mui/lab";

import VotingPollSurveyList from "../sections/reports/VotingPollSurveyList";
import SearchByFilter from "../sections/common/SearchByFilter";
import { getAllVotersSurvey, clearVoterReducer, getAllVotersSurveyWithGroup } from "../actions/voter";
import { searchFiltercolor } from "../constants";
import { useLocation } from "react-router-dom";
import { RHFAutoComplete } from "../components/hook-form";
import { UncontrolledTextField } from "../components/hook-form/RHFTextField";
import { ClearAllOutlined } from "@mui/icons-material";

const VotingPollSurveyPage = ({ isUser, getAllVotersSurvey, clearVoterReducer, common, account, getAllVotersSurveyWithGroup }) => {
  const userPermission = account.user && account.user.permissions ? account.user.permissions : [];
  const pageActions = userPermission.filter((p) => p.page_id === 176)[0];

  const filterRef = useRef(null);
  const searchRef = useRef(null);

  const [filterValues, setFilterValues] = useState(null);
  const [otherFilterValues, setOtherFilterValues] = useState({
    intrested_party:
      account?.user?.desgination_id == 38
        ? {
            label: "YSRCP",
            value: 23,
          }
        : null,
    is_resident: null,
    isSurveyed: null,
    isVoted: account?.user?.desgination_id == 38 ? { label: "Pending", value: "N" } : null,
  });

  useEffect(() => {
    return () => {
      clearVoterReducer();
    };
  }, []);

  const handleSubmit = async (data) => {
    var searchData = searchRef.current.getSearchData();
    var values = {
      ...data,
      intrested_party: otherFilterValues.intrested_party?.value ?? null,
      is_resident: otherFilterValues.is_resident?.value ?? null,
      isSurveyed: otherFilterValues.isSurveyed?.value ?? null,
      isVoted: otherFilterValues.isVoted?.value ?? null,
      sort_by: "voted",
      ...searchData,
    };

    await getAllVotersSurveyWithGroup(values);
    setFilterValues(values);
  };

  const handleSearchSubmit = () => {
    filterRef.current.submit();
  };

  const handlePaginationSubmit = async (tableState) => {
    await getAllVotersSurvey(filterValues, tableState?.page, tableState?.rowsPerPage);
  };

  const handleReset = () => {
    setOtherFilterValues({
      intrested_party: null,
      is_resident: null,
      isSurveyed: null,
      isVoted: null,
    });

    searchRef.current.reset();
  };

  let isClearActive = otherFilterValues.intrested_party || otherFilterValues.is_resident || otherFilterValues.isSurveyed || otherFilterValues.isVoted;

  isClearActive = isClearActive != null;

  console.log("otherFilterValues", account?.user.desgination_id);

  let sortedParties = [...(common?.parties ?? [])].sort((a, b) => a.label.localeCompare(b.label));

  return (
    <Page title={pageActions.pagename}>
      <Container maxWidth="xl">
        <Card sx={{ p: 3, backgroundColor: searchFiltercolor }}>
          <Grid container spacing={2} alignItems="center">
            <SearchByFilter
              ref={filterRef}
              showVillage={false}
              showGroup={true}
              isClearActive={isClearActive}
              onSubmit={handleSubmit}
              onReset={handleReset}
              children={
                <>
                  <Grid item xs={12} md={6} lg={2}>
                    <RHFAutoComplete
                      name="intrested_party"
                      label="Select Party"
                      disabled={account?.user?.desgination_id == 38}
                      value={otherFilterValues.intrested_party}
                      options={sortedParties}
                      getOptionLabel={(option) => option.label}
                      onChange={(name, value) =>
                        setOtherFilterValues((state) => ({
                          ...state,
                          [name]: value,
                        }))
                      }
                    />
                  </Grid>

                  <Grid item xs={12} md={6} lg={2}>
                    <RHFAutoComplete
                      name="is_resident"
                      label="Select Residence"
                      value={otherFilterValues.is_resident}
                      options={[
                        {
                          label: "Resident",
                          value: 1,
                        },
                        {
                          label: "Non-Resident",
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

                  <Grid item xs={12} md={6} lg={2}>
                    <RHFAutoComplete
                      name="isSurveyed"
                      label="Survey Status"
                      value={otherFilterValues.isSurveyed}
                      options={[
                        { label: "Completed", value: "Y" },
                        { label: "Pending", value: "N" },
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
                  <Grid item xs={12} md={6} lg={2}>
                    <RHFAutoComplete
                      name="isVoted"
                      label="Voting Status"
                      disabled={account?.user?.desgination_id == 38}
                      value={otherFilterValues.isVoted}
                      options={[
                        { label: "Completed", value: "Y" },
                        { label: "Pending", value: "N" },
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

        <VotingPollSurveyList ref={searchRef} isUser={isUser} handleSubmit={handleSearchSubmit} handlePaginationSubmit={handlePaginationSubmit} />
      </Container>
    </Page>
  );
};
const mapStateToProps = (state) => {
  return {
    common: state.common,
    account: state.auth,
  };
};

export default connect(mapStateToProps, {
  getAllVotersSurvey,
  getAllVotersSurveyWithGroup,
  clearVoterReducer,
})(VotingPollSurveyPage);
