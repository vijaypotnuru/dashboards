import { Grid, Container, Typography, Box, TextField, Card, Stack, MenuItem } from "@mui/material";
import Page from "../components/Page";
import { connect } from "react-redux";
import { LoadingButton } from "@mui/lab";
import Autocomplete from "@mui/material/Autocomplete";
import ViewUsersList from "../sections/reports/ViewUsersList";
import Button from "@mui/material/Button";
import ConstituenciesList from "../sections/reports/ConstituenciesList";
import { useEffect, useState, useRef } from "react";
import { getAllStatesRoute, getAllConstituenciesWithJoinRoute, createConstituenciesRoute, getAllDistrictsRoute, getAllConstituenciesRoute } from "../utils/apis";

import Tooltip from "@material-ui/core/Tooltip";
import { showAlert } from "../actions/alert";
import { set } from "date-fns";
import ApiServices from "../services/apiservices";
import { is } from "date-fns/locale";

import CircularProgress from "@mui/material/CircularProgress";

const ConstituenciesPage = ({ dashboard, showAlert, account }) => {
  const userPermission = account.user && account.user.permissions ? account.user.permissions : [];
  const pageActions = userPermission.filter((p) => p.page_id === 144)[0];
  console.log("pageActions1", pageActions);

  const [fetchLoading, setFetchLoading] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isEditState, setEditState] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [fetchedData, setFetchedData] = useState({
    states: [],
    district: [],
    consistency: [],
  });

  const [formValues, setFormValues] = useState({
    state_id: "",
    district_id: "",
    consistency_name: "",
  });

  const inputFieldRef = useRef();

  useEffect(() => {
    if (isEditState) {
      inputFieldRef.current.focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isFocused, isEditState]);

  useEffect(() => {
    fecthOptionsData();
    fecthConstituenciesData();
  }, []);

  const fecthOptionsData = async () => {
    try {
      /// get all states
      const statesResponse = await ApiServices.postRequest(getAllStatesRoute);
      // console.log("states", statesResponse.data.message);
      /// get all districts
      const districtsResponse = await ApiServices.postRequest(getAllDistrictsRoute);
      // console.log("districts", districtsResponse.data.message);

      /// state update
      setFetchedData((prevState) => ({
        ...prevState,
        states: statesResponse.data.message,
        district: districtsResponse.data.message,
      }));
    } catch (error) {
      console.log(error);
    }
  };

  const fecthConstituenciesData = async () => {
    try {
      /// get all constituencies
      const constituenciesResponse = await ApiServices.postRequest(getAllConstituenciesRoute, {
        district_id: formValues.district_id,
      });
      // console.log("constituencies", constituenciesResponse.data.message);

      setFetchedData((prevState) => ({
        ...prevState,
        consistency: constituenciesResponse.data.message,
      }));
    } catch (error) {
      console.log(error);
    }
  };

  const handleEdit = async (data) => {
    setEditState(true);
    setIsFocused((prevState) => !prevState);
    console.log("data", data);
    setFormValues({
      district_id: data.district_id,
      consistency_id: data.consistency_id,
      consistency_name: data.consistency_name,
    });
  };

  const handleDelete = async (data) => {
    setLoading(true);
    console.log("data852852852", data);
    try {
      await ApiServices.deleteRequest(createConstituenciesRoute + data.consistency_id);
      showAlert({ text: "Constituency Deleted", color: "success" });
      fecthConstituenciesData();
      handleReset();
    } catch (error) {
      console.log(error);

      showAlert({ text: "Constituency Not Deleted", color: "error" });
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    console.log("formValues", formValues);

    if (!formValues.district_id) {
      showAlert({ text: "Please Select District", color: "error" });
      return;
    }

    if (!formValues.consistency_name) {
      showAlert({ text: "Please Enter Constituency Name", color: "error" });
      return;
    }

    setLoading(true);

    var body = {
      consistency_name: formValues.consistency_name,
      district_pk: formValues.district_id,
    };

    if (!isEditState) {
      await addConstituency(body);
    } else {
      await updateConstituency(formValues.consistency_id, body);
    }
    setLoading(false);
  };

  const handleSearch = async () => {
    setLoading(true);

    await fecthConstituenciesData();
    setLoading(false);
  };

  const handleReset = () => {
    setEditState(false);
    setFormValues({
      district_id: "",
      consistency_name: "",
    });
  };

  console.log("isLdsdsdsoading", isLoading);

  const addConstituency = async (body) => {
    console.log("addme");
    try {
      await ApiServices.postRequest(createConstituenciesRoute, body);

      showAlert({ text: "Constituency Created Successfully", color: "success" });
      fecthConstituenciesData();
      handleReset();
    } catch (error) {
      console.log(error);
      showAlert({ text: "Constituency Created Failed", color: "error" });
    }
  };

  const updateConstituency = async (id, body) => {
    console.log("updateme");
    console.log("body", body);
    try {
      await ApiServices.putRequest(`${createConstituenciesRoute}${id}`, body);
      showAlert({ text: "Constituency Updated Successfully", color: "success" });
      fecthConstituenciesData();
      handleReset();
    } catch (error) {
      console.log(error);
      showAlert({ text: "Constituency Updated Failed", color: "error" });
    }
  };

  return (
    <Page title={pageActions.pagename}>
      <Container maxWidth="xl">
        <Card sx={{ p: 3 }}>
          <Typography sx={{ pb: 2 }}>{isEditState ? "Edit Constituency" : "Add Constituency"}</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6} lg={2}>
              <TextField
                size="small"
                label="Select State"
                fullWidth
                select
                value={account.user.state_pk}
                onChange={(e) => {
                  setFormValues((prevState) => ({
                    ...prevState,
                    state_id: e.target.value,
                    district_id: "",
                  }));
                }}
                disabled
              >
                {fetchedData.states.map((state, index) => {
                  return (
                    <MenuItem key={index} value={state.state_pk}>
                      {state.state_name}
                    </MenuItem>
                  );
                })}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6} lg={2}>
              <TextField
                size="small"
                label="Select District"
                fullWidth
                select
                value={formValues.district_id}
                onChange={(e) => {
                  setFormValues((prevState) => ({
                    ...prevState,
                    district_id: e.target.value,
                  }));
                }}
              >
                {/* filter districk based on state_id */}
                {fetchedData.district
                  .filter((district) => district.state_id === account.user.state_pk)
                  .map((district, index) => {
                    return (
                      <MenuItem key={index} value={district.district_id}>
                        {district.district_name}
                      </MenuItem>
                    );
                  })}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6} lg={2}>
              <TextField
                inputRef={inputFieldRef}
                size="small"
                label="Constituency Name"
                fullWidth
                value={formValues.consistency_name}
                onChange={(event) => {
                  setFormValues((prevState) => ({
                    ...prevState,
                    consistency_name: event.target.value,
                  }));
                }}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={2}>
              {!isEditState && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Tooltip title={pageActions.add_perm != 1 ? "You don't have access to add" : ""}>
                    <span>
                      <LoadingButton loading={isLoading} onClick={handleSubmit} variant="contained" disabled={pageActions.add_perm != 1}>
                        Add
                      </LoadingButton>
                    </span>
                  </Tooltip>
                  <LoadingButton
                    sx={{
                      marginLeft: 2,
                    }}
                    loading={isLoading}
                    onClick={handleSearch}
                    variant="contained"
                  >
                    Search
                  </LoadingButton>
                </Box>
              )}
              {isEditState && (
                <Stack direction="row" spacing={1}>
                  <LoadingButton loading={isLoading} onClick={handleSubmit} variant="contained">
                    Update
                  </LoadingButton>

                  <LoadingButton loading={isLoading} onClick={handleReset} variant="contained">
                    Cancel
                  </LoadingButton>
                </Stack>
              )}
            </Grid>
          </Grid>
        </Card>

        <Box p={1} />
        <>
          {isLoading && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CircularProgress />
            </Box>
          )}

          {!isLoading && (
            <ConstituenciesList
              fecthConstituenciesData={fecthConstituenciesData}
              pageActions={pageActions}
              loading={fetchLoading}
              constituenciesList={fetchedData.consistency.sort((a, b) => a.consistency_no - b.consistency_no)}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
            />
          )}
        </>
      </Container>
    </Page>
  );
};

const mapStateToProps = (state) => {
  return {
    dashboard: state.dashboard,
    account: state.auth,
  };
};

export default connect(mapStateToProps, { showAlert })(ConstituenciesPage);