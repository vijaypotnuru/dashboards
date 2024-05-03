import { Grid, Container, Typography, Box, TextField, Card, Stack, MenuItem } from "@mui/material";
import Page from "../components/Page";
import { connect } from "react-redux";
import { LoadingButton } from "@mui/lab";
import Tooltip from "@material-ui/core/Tooltip";
import SachivalayamList from "../sections/reports/SachivalayamList";
import { useEffect, useState, useRef } from "react";
import instance from "../utils/axios";
import {
  getAllConstituenciesRoute,
  getAllDistrictsRoute,
  getAllDivisionRoute,
  getAllMandalRoute,
  getAllStatesRoute,
  getAllSachivalayamRoute,
  createSachivalayamRoute,
  getallpartsbysachivalayamidRoute,
  clusterGroupsRoute,
  getAllPartsRoute,
  getAllClusterGroupsRoute,
  mpListGetAllRoute,
  mpListCRUDRoute,
} from "../utils/apis";
import { showAlert } from "../actions/alert";
import { set } from "date-fns";
import ApiServices from "../services/apiservices";
import CircularProgress from "@mui/material/CircularProgress";
import GroupsList from "../sections/reports/GroupsList";
import MpList from "../sections/reports/MpList";

const MpPage = ({ dashboard, showAlert, account }) => {
  const userPermission = account.user && account.user.permissions ? account.user.permissions : [];
  const pageActions = userPermission.filter((p) => p.page_id === 209)[0];
  console.log("pageActions1", pageActions);

  const [fetchLoading, setFetchLoading] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isEditState, setEditState] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [fetchedData, setFetchedData] = useState({
    states: [],
    district: [],
    consistency: [],
    mplist: [],
  });

  const [formValues, setFormValues] = useState({
    district_id: "",
    consistency_id: "",
    mp_name: "",
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
    fectMpListData();
    console.log("fecthOptionsDatadsdasdasdasdasdasdsd", fetchedData);
  }, []);

  const fecthOptionsData = async () => {
    try {
      /// get all states
      const statesResponse = await ApiServices.postRequest(getAllStatesRoute);
      // console.log("states", statesResponse.data.message);
      /// get all districts
      const districtsResponse = await ApiServices.postRequest(getAllDistrictsRoute);
      // console.log("districts", districtsResponse.data.message);

      /// get all constituencies
      const constituenciesResponse = await ApiServices.postRequest(getAllConstituenciesRoute);
      // console.log("constituencies", constituenciesResponse.data.message);

      /// state update
      setFetchedData((prevState) => ({
        ...prevState,
        states: statesResponse.data.message,
        district: districtsResponse.data.message,
        consistency: constituenciesResponse.data.message,
      }));
    } catch (error) {
      console.log(error);
    }
  };

  const fectMpListData = async () => {
    try {
      /// get all mp list
      const mpResponse = await ApiServices.postRequest(mpListGetAllRoute);

      /// state update
      setFetchedData((prevState) => ({
        ...prevState,
        mplist: mpResponse.data.message,
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
      mp_id: data.mp_pk,
      mp_name: data.mp_name,
    });
  };

  const handleDelete = async (data) => {
    setLoading(true);
    console.log("data852852852", data);
    try {
      await ApiServices.deleteRequest(mpListCRUDRoute + data.mp_pk);
      showAlert({ text: "Mp Deleted", color: "success" });
      fectMpListData();
      handleReset();
    } catch (error) {
      console.log(error);

      showAlert({ text: "Mp Not Deleted", color: "error" });
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    console.log("formValues", formValues);

    if (!formValues.district_id) {
      showAlert({
        text: "Please Select District",
        color: "error",
      });

      return;
    }

    if (!formValues.consistency_id) {
      showAlert({
        text: "Please Select Constituency",
        color: "error",
      });

      return;
    }

    if (!formValues.mp_name) {
      showAlert({
        text: "Please Enter MP Name",
        color: "error",
      });

      return;
    }

    setLoading(true);

    var body = {
      district_id: formValues.district_id,
      consistency_id: formValues.consistency_id,
      mp_name: formValues.mp_name,
    };

    if (!isEditState) {
      await addNewMp(body);
    } else {
      await updateMp(formValues.mp_id, body);
    }
    setLoading(false);
  };

  const handleSearch = async () => {
    setLoading(true);

    await fectMpListData();
    setLoading(false);
  };

  const handleReset = () => {
    setEditState(false);
    setFormValues({
      district_id: "",
      consistency_id: "",
      mp_name: "",
    });
  };

  const addNewMp = async (body) => {
    try {
      await ApiServices.postRequest(mpListCRUDRoute, body);

      showAlert({
        text: "Mp Created Successfully",
        color: "success",
      });
      fectMpListData();
      handleReset();
    } catch (error) {
      console.log(error);
      showAlert({ text: "Mp Creation Failed" });
    }
  };

  const updateMp = async (id, data) => {
    try {
      await ApiServices.putRequest(`${mpListCRUDRoute}${id}`, data);

      showAlert({
        text: "Mp Updated Successfully",
        color: "success",
      });
      fectMpListData();
      handleReset();
    } catch (error) {
      console.log(error);
      showAlert({ text: "Mp Updation Failed" });
    }
  };

  return (
    <Page title={pageActions.pagename}>
      <Container maxWidth="xl">
        <Card sx={{ p: 3 }}>
          <Typography sx={{ pb: 2 }}>{isEditState ? "Edit Member of Parliament" : "Add Member of Parliament"}</Typography>
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
                    consistency_id: "",

                    mp_name: "",
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
                    consistency_id: "",
                    mp_name: "",
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
                size="small"
                label="Select Constituency"
                fullWidth
                select
                value={formValues.consistency_id}
                onChange={(e) => {
                  setFormValues((prevState) => ({
                    ...prevState,
                    consistency_id: e.target.value,
                    mp_name: "",
                  }));
                }}
              >
                {/* filter constituency based on district_id */}
                {fetchedData.consistency
                  .filter((consistency) => consistency.district_id === formValues.district_id)
                  .map((consistency, index) => {
                    return (
                      <MenuItem key={index} value={consistency.consistency_id}>
                        {consistency.consistency_name}
                      </MenuItem>
                    );
                  })}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6} lg={2}>
              <TextField
                inputRef={inputFieldRef}
                size="small"
                label="MP Name"
                fullWidth
                value={formValues.mp_name}
                onChange={(e) => {
                  setFormValues((prevState) => ({
                    ...prevState,
                    mp_name: e.target.value,
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

          {!isLoading && <MpList fectMpListData={fectMpListData} pageActions={pageActions} loading={fetchLoading} mpList={fetchedData.mplist} handleEdit={handleEdit} handleDelete={handleDelete} />}
        </>
      </Container>
    </Page>
  );
};

const mapStateToProps = (state) => {
  return {
    account: state.auth,
  };
};

export default connect(mapStateToProps, { showAlert })(MpPage);
