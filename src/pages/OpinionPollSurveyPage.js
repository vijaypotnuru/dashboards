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
import { use } from "i18next";
import axios from "axios";

const OpinionPollSurveyPage = ({ isUser, getAllVotersSurvey, clearVoterReducer, common, account, voter }) => {
  const userPermission = account.user && account.user.permissions ? account.user.permissions : [];
  const pageActions = userPermission.filter((p) => p.page_id === 114)[0];
  const [isLoading, setIsLoading] = useState(false);

  console.log("ddfdfdfdfdffeuserwe", pageActions);

  const filterRef = useRef(null);
  const searchRef = useRef(null);

  const [filterValues, setFilterValues] = useState(null);
  const [otherFilterValues, setOtherFilterValues] = useState({
    intrested_party: null,
    is_resident: null,
    isSurveyed: null,
    assembly: null,
    mandal: null,
    booth: null,
  });

  const [newFiltersData, setNewFiltersData] = useState(null);
  const [pollResultsData, setPollResultsData] = useState(null);

  useEffect(() => {
    return () => {
      clearVoterReducer();
    };
  }, []);



  useEffect(() => {

    setIsLoading(true);
    const newFiltersResponse = async () => {
      // use axios to get the data
      console.log("with s", "https://api.paybackgold.com/api/identcity/getallmandalbooths/");
      const response = await axios.get("https://api.paybackgold.com/api/identcity/getallmandalbooths/", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEifQ.8_itYAEsDz7FW2mR0DLP9XQhzrU_x5mxOaqQva-0pug`,
        },
      });


      console.log("responseDadasdsadasdadta", response);
      setNewFiltersData(response.data.data);
    }

    const pollResultsData = async () => {
      // use axios to get the data
      console.log("with s", "https://api.paybackgold.com/api/identcity/getallpolledvotes/");
      const response = await axios.post("https://api.paybackgold.com/api/identcity/getallpolledvotes/", {
        assembly: null,
        mandal: null,
        booth: null,
      }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEifQ.8_itYAEsDz7FW2mR0DLP9XQhzrU_x5mxOaqQva-0pug`,
        },
      });

      console.log("pollResultsData", response);
      setPollResultsData(response.data.data);
    }
    newFiltersResponse();
    pollResultsData();
    setIsLoading(false);
  }, []);




  const handleSubmit = async (data) => {
    console.log("hulksdsdsdadw478956132", data);


    setIsLoading(true);
    console.log("with s", "https://api.paybackgold.com/api/identcity/getallpolledvotes/");
    const response = await axios.post("https://api.paybackgold.com/api/identcity/getallpolledvotes/", {
      assembly: otherFilterValues?.assembly ?? null,
      mandal: otherFilterValues?.mandal ?? null,
      booth: otherFilterValues?.booth ?? null,
    }, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEifQ.8_itYAEsDz7FW2mR0DLP9XQhzrU_x5mxOaqQva-0pug`,
      },
    });

    console.log("pollResultsDaddddd12345678ta", response);
    setPollResultsData(response.data.data);
    setIsLoading(false);
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
      assembly: null,
      mandal: null,
      booth: null,

    });

    searchRef.current.reset();
  };

  let isClearActive = otherFilterValues.intrested_party || otherFilterValues.is_resident || otherFilterValues.isSurveyed || otherFilterValues.assembly || otherFilterValues.mandal || otherFilterValues.booth;

  isClearActive = isClearActive != null;

  let sortedParties = [...(common?.parties ?? [])].sort((a, b) => a.label.localeCompare(b.label));

  console.log("newFiltersDdsdadadsdata", newFiltersData,
    otherFilterValues
  );


  // {
  //   "id": 36,
  //   "parliament": "ONGOLE",
  //   "assembly": "ONGOLE",
  //   "mandal": "ONGOLE URBAN",
  //   "booth": "36"
  // },
  // {
  //   "id": 37,
  //   "parliament": "ONGOLE",
  //   "assembly": "ONGOLE",
  //   "mandal": "ONGOLE URBAN",
  //   "booth": "37"
  // },
  // {
  //   "id": 38,
  //   "parliament": "ONGOLE",
  //   "assembly": "ONGOLE",
  //   "mandal": "ONGOLE URBAN",
  //   "booth": "38"
  // },
  // {
  //   "id": 39,
  //   "parliament": "ONGOLE",
  //   "assembly": "ONGOLE",
  //   "mandal": "ONGOLE URBAN",
  //   "booth": "39"
  // },
  // {
  //   "id": 40,
  //   "parliament": "ONGOLE",
  //   "assembly": "ONGOLE",
  //   "mandal": "ONGOLE URBAN",
  //   "booth": "40"
  // },
  // {
  //   "id": 41,
  //   "parliament": "ONGOLE",
  //   "assembly": "ONGOLE",
  //   "mandal": "KOTHAPATNAM",
  //   "booth": "41"
  // },
  // {
  //   "id": 42,
  //   "parliament": "ONGOLE",
  //   "assembly": "ONGOLE",
  //   "mandal": "KOTHAPATNAM",
  //   "booth": "42"
  // },
  // {
  //   "id": 43,
  //   "parliament": "ONGOLE",
  //   "assembly": "ONGOLE",
  //   "mandal": "KOTHAPATNAM",
  //   "booth": "43"
  // },
  // {
  //   "id": 44,
  //   "parliament": "ONGOLE",
  //   "assembly": "ONGOLE",
  //   "mandal": "KOTHAPATNAM",
  //   "booth": "44"
  // },

  const uniqueAssembly = [...new Set(newFiltersData?.map(item => item.assembly))];
  console.log("uniqueAssembly", uniqueAssembly);

  const uniqueMandal = [...new Set(newFiltersData?.map(item => item.mandal))];
  console.log("uniqueMandal", uniqueMandal);

  const uniqueBooth = [...new Set(newFiltersData?.map(item => item.booth))];
  console.log("uniqueBooth", uniqueBooth);






  console.log("otherFilterValues", otherFilterValues);
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
                      name="assembly"
                      label="Select Assembly"
                      value={otherFilterValues.assembly}
                      options={[...new Set(newFiltersData?.map(item => item.assembly))]}
                      getOptionLabel={(option) => option}
                      onChange={(name, value) => {
                        setOtherFilterValues((state) => ({
                          ...state,
                          [name]: value,
                        }))
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6} lg={2}>
                    <RHFAutoComplete
                      name="mandal"
                      label="Select Mandal"
                      value={otherFilterValues.mandal}
                      // options={newFiltersData}
                      options={[...new Set(newFiltersData?.filter(item => item.assembly == otherFilterValues.assembly).map(item => item.mandal))]}
                      getOptionLabel={(option) => option}
                      onChange={(name, value) => {
                        console.log("value123456", value);
                        setOtherFilterValues((state) => ({
                          ...state,
                          [name]: value,
                        }))
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6} lg={2}>
                    <RHFAutoComplete
                      name="booth"
                      label="Select Booth"
                      value={otherFilterValues.booth}
                      // options={newFiltersData}
                      options={[...new Set(newFiltersData?.filter(item => item.mandal == otherFilterValues.mandal).map(item => item.booth))]}
                      getOptionLabel={(option) => option}
                      onChange={(name, value) => {
                        setOtherFilterValues((state) => ({
                          ...state,
                          [name]: value,
                        }))
                      }}
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

        <OpinionPollSurveyList ref={searchRef} isUser={isUser} handleSubmit={handleSearchSubmit} handlePaginationSubmit={handlePaginationSubmit} getTableVotersData={getTableVotersData} pollResultsData={pollResultsData} isLoading={isLoading} />
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
