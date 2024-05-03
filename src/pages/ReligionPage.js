import { Grid, Container, Typography, Box, TextField, Card, Stack } from "@mui/material";
import Page from "../components/Page";
import { connect } from "react-redux";
import { LoadingButton } from "@mui/lab";
import Tooltip from "@material-ui/core/Tooltip";

import ReligionList from "../sections/reports/ReligionList";
import { useEffect, useState, useRef } from "react";
import { getAllReligionRoute, createReligionRoute, getAllReligionListRoute } from "../utils/apis";

import { showAlert } from "../actions/alert";
import ApiServices from "../services/apiservices";

const ReligionPage = ({ dashboard, showAlert, account }) => {
  const userPermission = account.user && account.user.permissions ? account.user.permissions : [];
  const pageActions = userPermission.filter((p) => p.page_id === 175)[0];

  console.log("pageActions", pageActions);

  const [fetchLoading, setFetchLoading] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isEditState, setEditState] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [fetchedData, setFetchedData] = useState({
    religion: [],
  });

  const [formValues, setFormValues] = useState({
    religion_name: "",
  });

  const inputFieldRef = useRef();

  useEffect(() => {
    if (isEditState) {
      inputFieldRef.current.focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isFocused, isEditState]);

  useEffect(() => {
    fetchReligionData();
  }, []);

  const fetchReligionData = async () => {
    try {
      const response = await ApiServices.postRequest(getAllReligionListRoute);
      console.log("kong123", response.data.message);
      setFetchedData({
        religion: response.data.message,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleEdit = async (data) => {
    setEditState(true);
    setIsFocused((prevState) => !prevState);
    console.log("data", data);
    setFormValues((prevState) => ({
      ...prevState,
      religion_name: data.religion_name,
      religion_pk: data.religion_pk,
    }));
  };

  const handleDelete = async (data) => {
    setLoading(true);
    console.log("data85282", data);
    try {
      await ApiServices.deleteRequest(createReligionRoute + data.religion_pk);
      showAlert({ text: "Religion Deleted", color: "success" });
      fetchReligionData();
      handleReset();
    } catch (error) {
      console.log(error);

      showAlert({ text: "Religion Not Deleted", color: "error" });
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (formValues.religion_name === "") {
      showAlert({ text: "Please Enter Religion Name", color: "error" });
      return;
    }

    setLoading(true);

    var body = {
      religion_name: formValues.religion_name,
    };

    if (!isEditState) {
      await addReligion(body);
    } else {
      await updateReligion(formValues.religion_pk, body);
    }
    setLoading(false);
  };

  const handleReset = () => {
    setEditState(false);
    setFormValues({
      religion_name: "",
    });
  };

  const addReligion = async (body) => {
    console.log("addme");
    try {
      await ApiServices.postRequest(createReligionRoute, body);

      showAlert({ text: "Religion Created Successfully", color: "success" });
      fetchReligionData();
      handleReset();
    } catch (error) {
      console.log(error);
      showAlert({ text: "Religion Created Failed", color: "error" });
    }
  };

  const updateReligion = async (id, body) => {
    console.log("updateme");
    try {
      await ApiServices.putRequest(`${createReligionRoute}${id}`, body);
      showAlert({ text: "Religion Updated Successfully", color: "success" });
      fetchReligionData();
      handleReset();
    } catch (error) {
      console.log(error);
      showAlert({ text: "Religion Updated Failed", color: "error" });
    }
  };

  return (
    <Page title={pageActions.pagename}>
      <Container maxWidth="xl">
        <Card sx={{ p: 3 }}>
          <Typography sx={{ pb: 2 }}>{isEditState ? "Edit Religion" : "Add Religion"}</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid
              item
              xs={12}
              md={6}
              lg={2}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "15px",
              }}
            >
              <TextField
                inputRef={inputFieldRef}
                size="small"
                label="Religion Name"
                fullWidth
                value={formValues.religion_name}
                onChange={(e) => {
                  setFormValues({
                    ...formValues,
                    religion_name: e.target.value,
                  });
                }}
              />
            </Grid>

            <Grid item xs={12} md={6} lg={2}>
              {!isEditState && (
                <Tooltip title={pageActions.add_perm != 1 ? "You don't have access to add" : ""}>
                  <span>
                    <LoadingButton loading={isLoading} onClick={handleSubmit} variant="contained" disabled={pageActions.add_perm != 1}>
                      Add
                    </LoadingButton>
                  </span>
                </Tooltip>
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
        <ReligionList pageActions={pageActions} loading={fetchLoading} religionList={fetchedData.religion} handleEdit={handleEdit} handleDelete={handleDelete} />
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

export default connect(mapStateToProps, { showAlert })(ReligionPage);
