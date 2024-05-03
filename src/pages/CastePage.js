import { Grid, Container, Typography, Box, TextField, Card, Stack, MenuItem } from "@mui/material";
import Page from "../components/Page";
import { connect } from "react-redux";
import { LoadingButton } from "@mui/lab";
import Tooltip from "@material-ui/core/Tooltip";

import CasteList from "../sections/reports/CasteList";
import { useEffect, useState, useRef } from "react";
import { getAllCastesRoute, createCasteRoute, getAllSubCastesRoute, subCastesRoute } from "../utils/apis";

import { showAlert } from "../actions/alert";
import ApiServices from "../services/apiservices";

import LsService from "../services/localstorage";

const CastePage = ({ dashboard, showAlert, account, common }) => {
  const userPermission = account.user && account.user.permissions ? account.user.permissions : [];
  const pageActions = userPermission.filter((p) => p.page_id === 174)[0];

  console.log("pageActions", pageActions);

  const [fetchLoading, setFetchLoading] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isEditState, setEditState] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [fetchedData, setFetchedData] = useState({
    caste: [],
  });

  const [formValues, setFormValues] = useState({
    religion_pk: "",
    category_pk: "",
    subcaste_name: "",
  });

  const inputFieldRef = useRef();

  useEffect(() => {
    if (isEditState) {
      inputFieldRef.current.focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isFocused, isEditState]);

  useEffect(() => {
    fetchCasteData();
  }, []);

  const fetchCasteData = async () => {
    try {
      const response = await ApiServices.postRequest(getAllSubCastesRoute);
      console.log(response.data.message);
      setFetchedData({
        caste: response.data.message,
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
      subcaste_name: data.subcaste_name,
      category_pk: data.category_id,
      religion_pk: data.religion_pk,
      subcaste_pk: data.subcaste_pk,
    }));
  };

  const handleDelete = async (data) => {
    setLoading(true);
    console.log("data85282", data);
    try {
      await ApiServices.deleteRequest(subCastesRoute + data.subcaste_pk);
      showAlert({ text: "Caste Deleted", color: "success" });
      fetchCasteData();
      handleReset();
    } catch (error) {
      console.log(error);

      showAlert({ text: "Caste Not Deleted", color: "error" });
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (formValues.subcaste_name === "") {
      showAlert({ text: "Please Enter Caste Name", color: "error" });
      return;
    }

    setLoading(true);

    var body = {
      category_id: formValues.category_pk,
      subcaste_name: formValues.subcaste_name,
    };

    if (!isEditState) {
      await addCaste(body);
    } else {
      await updateCaste(formValues.subcaste_pk, body);
    }
    setLoading(false);
  };

  const handleReset = () => {
    setEditState(false);
    setFormValues({
      religion_pk: "",
      category_pk: "",
      subcaste_name: "",
    });
  };

  const addCaste = async (body) => {
    console.log("addme");
    try {
      await ApiServices.postRequest(subCastesRoute, body);

      showAlert({ text: "Caste Created Successfully", color: "success" });
      fetchCasteData();
      handleReset();
    } catch (error) {
      console.log(error);
      showAlert({ text: "Caste Created Failed", color: "error" });
    }
  };

  const updateCaste = async (id, body) => {
    console.log("updateme");
    try {
      await ApiServices.putRequest(`${subCastesRoute}${id}`, body);
      showAlert({ text: "Caste Updated Successfully", color: "success" });
      fetchCasteData();
      handleReset();
    } catch (error) {
      console.log(error);
      showAlert({ text: "Caste Updated Failed", color: "error" });
    }
  };

  return (
    <Page title={pageActions.pagename}>
      <Container maxWidth="xl">
        <Card sx={{ p: 3 }}>
          <Typography sx={{ pb: 2 }}>{isEditState ? "Edit Caste" : "Add Caste"}</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6} lg={2}>
              <TextField
                size="small"
                label="Select Religion"
                fullWidth
                select
                value={formValues.religion_pk}
                onChange={(e) => {
                  setFormValues((prevState) => ({
                    ...prevState,
                    religion_pk: e.target.value,
                  }));
                }}
              >
                {/* filter districk based on state_id */}
                {common.newReligion &&
                  common.newReligion.map((religion, index) => {
                    return (
                      <MenuItem key={index} value={religion.religion_pk}>
                        {religion.religion_name}
                      </MenuItem>
                    );
                  })}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6} lg={2}>
              <TextField
                size="small"
                label="Select Category"
                fullWidth
                select
                value={formValues.category_pk}
                onChange={(e) => {
                  setFormValues((prevState) => ({
                    ...prevState,
                    category_pk: e.target.value,
                  }));
                }}
                disabled={!formValues.religion_pk}
              >
                {common.newCategory &&
                  common.newCategory
                    .filter((category) => category.religion_pk === formValues.religion_pk)
                    .map((category, index) => {
                      return (
                        <MenuItem key={index} value={category.category_pk}>
                          {category.category_name}
                        </MenuItem>
                      );
                    })}
              </TextField>
            </Grid>
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
                label="Caste Name"
                fullWidth
                value={formValues.subcaste_name}
                onChange={(e) => {
                  setFormValues({
                    ...formValues,
                    subcaste_name: e.target.value,
                  });
                }}
                disabled={!formValues.category_pk}
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
        <CasteList pageActions={pageActions} loading={fetchLoading} casteList={fetchedData.caste} handleEdit={handleEdit} handleDelete={handleDelete} />
      </Container>
    </Page>
  );
};

const mapStateToProps = (state) => {
  return {
    dashboard: state.dashboard,
    account: state.auth,
    common: state.common,
  };
};

export default connect(mapStateToProps, { showAlert })(CastePage);
