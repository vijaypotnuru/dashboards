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
} from "../utils/apis";
import { showAlert } from "../actions/alert";
import { set } from "date-fns";
import ApiServices from "../services/apiservices";
import CircularProgress from "@mui/material/CircularProgress";
import GroupsList from "../sections/reports/GroupsList";

const ClusterGroupsPage = ({ dashboard, showAlert, account }) => {
  const userPermission = account.user && account.user.permissions ? account.user.permissions : [];
  const pageActions = userPermission.filter((p) => p.page_id === 206)[0];
  console.log("pageActions1", pageActions);

  const [fetchLoading, setFetchLoading] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isEditState, setEditState] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [fetchedData, setFetchedData] = useState({
    states: [],
    district: [],
    consistency: [],
    mandal: [],
    division: [],
    sachivalayam: [],
    part_no: [],
    groups: [],
  });

  const [formValues, setFormValues] = useState({
    district_id: "",
    consistency_id: "",
    mandal_id: "",
    division_id: "",
    sachivalayam_id: "",
    part_no: "",
    group_name: "",
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
    fectGroupData();
    console.log("fecthOptionsData", fetchedData);
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

      /// get all mandals
      const mandalsResponse = await ApiServices.postRequest(getAllMandalRoute);
      // console.log("mandals", mandalsResponse.data.message);

      /// get all divisions
      const divisionsResponse = await ApiServices.postRequest(getAllDivisionRoute);
      // console.log("divisions", divisionsResponse.data.message);

      const sachivalayamResponse = await ApiServices.postRequest(getAllSachivalayamRoute, {
        district_id: formValues.district_id == "" ? null : formValues.district_id,
        consistency_id: formValues.consistency_id == "" ? null : formValues.consistency_id,
        mandal_id: formValues.mandal_id == "" ? null : formValues.mandal_id,
        division_id: formValues.division_id == "" ? null : formValues.division_id,
      });

      const partNoResponse = await ApiServices.postRequest(getAllPartsRoute, {
        district_id: null,
        consistency_id: null,
        mandal_id: null,
        division_id: null,
        sachivalayam_id: null,
      });

      /// state update
      setFetchedData((prevState) => ({
        ...prevState,
        states: statesResponse.data.message,
        district: districtsResponse.data.message,
        consistency: constituenciesResponse.data.message,
        mandal: mandalsResponse.data.message,
        division: divisionsResponse.data.message,
        sachivalayam: sachivalayamResponse.data.message,
        part_no: partNoResponse.data.message,
      }));
    } catch (error) {
      console.log(error);
    }
  };

  const fectGroupData = async () => {
    try {
      /// get all sachivalayam
      const groupResponse = await ApiServices.postRequest(getAllClusterGroupsRoute, {
        district_id: formValues.district_id == "" ? null : formValues.district_id,
        consistency_id: formValues.consistency_id == "" ? null : formValues.consistency_id,
        mandal_id: formValues.mandal_id == "" ? null : formValues.mandal_id,
        division_id: formValues.division_id == "" ? null : formValues.division_id,
        sachivalayam_id: formValues.sachivalayam_id == "" ? null : formValues.sachivalayam_id,
        part_no: formValues.part_no == "" ? null : formValues.part_no,
      });

      /// state update
      setFetchedData((prevState) => ({
        ...prevState,

        groups: groupResponse.data.message,
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
      mandal_id: data.mandal_id,
      division_id: data.division_id,
      sachivalayam_id: data.sachivalayam_id,
      part_no: data.part_pk,
      group_id: data.group_pk,
      group_name: data.group_name,
    });
  };

  const handleDelete = async (data) => {
    setLoading(true);
    console.log("data852852852", data);
    try {
      await ApiServices.deleteRequest(clusterGroupsRoute + data.group_pk);
      showAlert({ text: "Group Deleted", color: "success" });
      fectGroupData();
      handleReset();
    } catch (error) {
      console.log(error);

      showAlert({ text: "Group Not Deleted", color: "error" });
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

    if (!formValues.mandal_id) {
      showAlert({
        text: "Please Select Mandal",
        color: "error",
      });

      return;
    }

    if (!formValues.division_id) {
      showAlert({
        text: "Please Select Division",
        color: "error",
      });

      return;
    }

    if (!formValues.sachivalayam_id) {
      showAlert({
        text: "Please Select Sachivalayam",
        color: "error",
      });

      return;
    }

    if (!formValues.part_no) {
      showAlert({
        text: "Please Select Part No",
        color: "error",
      });

      return;
    }

    if (!formValues.group_name) {
      showAlert({
        text: "Please Enter Group Name",
        color: "error",
      });

      return;
    }

    setLoading(true);

    var body = {
      district_id: formValues.district_id,
      division_pk: formValues.division_id,
      division_id: formValues.division_id,
      sachivalayam_id: formValues.sachivalayam_id,
      part_pk: formValues.part_no,
      group_name: formValues.group_name,
    };

    if (!isEditState) {
      await addGroup(body);
    } else {
      await updateGroup(formValues.group_id, body);
    }
    setLoading(false);
  };

  const handleSearch = async () => {
    setLoading(true);

    await fectGroupData();
    setLoading(false);
  };

  const handleReset = () => {
    setEditState(false);
    setFormValues({
      district_id: "",
      consistency_id: "",
      mandal_id: "",
      division_id: "",
      sachivalayam_id: "",
      part_no: "",
      group_name: "",
    });
  };

  const addGroup = async (body) => {
    try {
      await ApiServices.postRequest(clusterGroupsRoute, body);

      showAlert({
        text: "Group Created Successfully",
        color: "success",
      });
      fectGroupData();
      handleReset();
    } catch (error) {
      console.log(error);
      showAlert({ text: "Group Creation Failed" });
    }
  };

  const updateGroup = async (id, data) => {
    try {
      await ApiServices.putRequest(`${clusterGroupsRoute}${id}`, data);

      showAlert({
        text: "Group Updated Successfully",
        color: "success",
      });
      fectGroupData();
      handleReset();
    } catch (error) {
      console.log(error);
      showAlert({ text: "Group Updation Failed" });
    }
  };

  return (
    <Page title={pageActions.pagename}>
      <Container maxWidth="xl">
        <Card sx={{ p: 3 }}>
          <Typography sx={{ pb: 2 }}>{isEditState ? "Edit Group" : "Add Group"}</Typography>
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
                    mandal_id: "",
                    division_id: "",
                    sachivalayam_id: "",
                    part_no: "",
                    group_name: "",
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
                    mandal_id: "",
                    division_id: "",
                    sachivalayam_id: "",
                    part_no: "",
                    group_name: "",
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
                    mandal_id: "",
                    division_id: "",
                    sachivalayam_id: "",
                    part_no: "",
                    group_name: "",
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
                size="small"
                label="Select Mandal"
                fullWidth
                select
                value={formValues.mandal_id}
                onChange={(e) => {
                  setFormValues((prevState) => ({
                    ...prevState,
                    mandal_id: e.target.value,
                    division_id: "",
                    sachivalayam_id: "",
                    part_no: "",
                    group_name: "",
                  }));
                }}
              >
                {/* filter mandal based on consistency_id */}
                {fetchedData.mandal
                  .filter((mandal) => mandal.consistency_id === formValues.consistency_id)
                  .sort((a, b) => a.mandal_name.localeCompare(b.mandal_name))
                  .map((mandal, index) => {
                    return (
                      <MenuItem key={index} value={mandal.mandal_id}>
                        {mandal.mandal_name}
                      </MenuItem>
                    );
                  })}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6} lg={2}>
              <TextField
                size="small"
                label="Select Division"
                fullWidth
                select
                value={formValues.division_id}
                onChange={(e) => {
                  setFormValues((prevState) => ({
                    ...prevState,
                    division_id: e.target.value,
                    sachivalayam_id: "",
                    part_no: "",
                    group_name: "",
                  }));
                }}
              >
                {/* filter division based on mandal_id */}
                {fetchedData.division
                  .filter((division) => division.mandal_id === formValues.mandal_id)
                  .sort((a, b) => a.division_name.localeCompare(b.division_name))
                  .map((division, index) => {
                    return (
                      <MenuItem key={index} value={division.division_id}>
                        {division.division_name}
                      </MenuItem>
                    );
                  })}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6} lg={2}>
              <TextField
                size="small"
                label="Select Sachivalayam"
                fullWidth
                select
                value={formValues.sachivalayam_id}
                onChange={(e) => {
                  setFormValues((prevState) => ({
                    ...prevState,
                    sachivalayam_id: e.target.value,
                    part_no: "",
                    group_name: "",
                  }));
                }}
              >
                {/* filter sachivalayam based on division_id */}

                {fetchedData.sachivalayam

                  .filter((sachivalayam) => sachivalayam.division_id === formValues.division_id)
                  .map((sachivalayam, index) => {
                    return (
                      <MenuItem key={index} value={sachivalayam.sachivalayam_id}>
                        {sachivalayam.sachivalayam_name}
                      </MenuItem>
                    );
                  })}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6} lg={2}>
              <TextField
                size="small"
                label="Select Part No"
                fullWidth
                select
                value={formValues.part_no}
                onChange={(e) => {
                  setFormValues((prevState) => ({
                    ...prevState,
                    part_no: e.target.value,
                    group_name: "",
                  }));
                }}
              >
                {/* filter part_no based on sachivalayam_id */}
                {fetchedData.part_no

                  .filter((part_no) => part_no.sachivalayam_id === formValues.sachivalayam_id)
                  .map((part_no, index) => {
                    return (
                      <MenuItem key={index} value={part_no.part_no}>
                        {part_no.part_no}
                      </MenuItem>
                    );
                  })}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6} lg={2}>
              <TextField
                inputRef={inputFieldRef}
                size="small"
                label="Group Name"
                fullWidth
                value={formValues.group_name}
                onChange={(e) => {
                  setFormValues((prevState) => ({
                    ...prevState,
                    group_name: e.target.value,
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

          {!isLoading && <GroupsList pageActions={pageActions} loading={fetchLoading} groupsList={fetchedData.groups} handleEdit={handleEdit} handleDelete={handleDelete} />}
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

export default connect(mapStateToProps, { showAlert })(ClusterGroupsPage);
