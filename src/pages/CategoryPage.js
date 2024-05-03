import { Grid, Container, Typography, Box, TextField, Card, Stack, MenuItem } from "@mui/material";
import Page from "../components/Page";
import { connect } from "react-redux";
import { LoadingButton } from "@mui/lab";
import Tooltip from "@material-ui/core/Tooltip";

import ReligionList from "../sections/reports/ReligionList";
import { useEffect, useState, useRef } from "react";
import { getAllReligionRoute, createReligionRoute, getAllReligionListRoute, getAllCasteCategoriesRoute, casteCategoriesRoute } from "../utils/apis";

import { showAlert } from "../actions/alert";
import ApiServices from "../services/apiservices";
import { Category } from "@mui/icons-material";
import CategoryList from "../sections/reports/CategoryList";

const CategoryPage = ({ dashboard, showAlert, account, common }) => {
  const userPermission = account.user && account.user.permissions ? account.user.permissions : [];
  const pageActions = userPermission.filter((p) => p.page_id === 204)[0];

  console.log("pageActions", pageActions);

  const [fetchLoading, setFetchLoading] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isEditState, setEditState] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [fetchedData, setFetchedData] = useState({
    category: [],
  });

  const [formValues, setFormValues] = useState({
    religion_pk: "",
    category_name: "",
  });

  const inputFieldRef = useRef();

  useEffect(() => {
    if (isEditState) {
      inputFieldRef.current.focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isFocused, isEditState]);

  useEffect(() => {
    fetchCategoryData();
  }, []);

  const fetchCategoryData = async () => {
    try {
      const response = await ApiServices.postRequest(getAllCasteCategoriesRoute);
      console.log("kong123", response.data.message);
      setFetchedData({
        category: response.data.message,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleEdit = async (data) => {
    setEditState(true);
    setIsFocused((prevState) => !prevState);
    console.log("data123456789", data);
    setFormValues((prevState) => ({
      ...prevState,
      religion_pk: data.religion_id,
      category_name: data.category_name,
      category_pk: data.category_pk,
    }));
  };

  const handleDelete = async (data) => {
    setLoading(true);
    console.log("data85282", data);
    try {
      await ApiServices.deleteRequest(casteCategoriesRoute + data.category_pk);
      showAlert({ text: "Category Deleted", color: "success" });
      fetchCategoryData();
      handleReset();
    } catch (error) {
      console.log(error);

      showAlert({ text: "Category Not Deleted", color: "error" });
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (formValues.category_name === "") {
      showAlert({ text: "Please Enter Category Name", color: "error" });
      return;
    }

    setLoading(true);

    var body = {
      religion_id: formValues.religion_pk,
      category_name: formValues.category_name,
    };

    if (!isEditState) {
      await addCategory(body);
    } else {
      await updateCategory(formValues.category_pk, body);
    }
    setLoading(false);
  };

  const handleReset = () => {
    setEditState(false);
    setFormValues({
      religion_pk: "",
      category_name: "",
    });
  };

  const addCategory = async (body) => {
    console.log("addme");
    try {
      await ApiServices.postRequest(casteCategoriesRoute, body);

      showAlert({ text: "Category Created Successfully", color: "success" });
      fetchCategoryData();
      handleReset();
    } catch (error) {
      console.log(error);
      showAlert({ text: "Category Created Failed", color: "error" });
    }
  };

  const updateCategory = async (id, body) => {
    console.log("updateme");
    try {
      await ApiServices.putRequest(`${casteCategoriesRoute}${id}`, body);
      showAlert({ text: "Category Updated Successfully", color: "success" });
      fetchCategoryData();
      handleReset();
    } catch (error) {
      console.log(error);
      showAlert({ text: "Category Updated Failed", color: "error" });
    }
  };

  console.log("common123456789", common.newReligion);

  return (
    <Page title={pageActions.pagename}>
      <Container maxWidth="xl">
        <Card sx={{ p: 3 }}>
          <Typography sx={{ pb: 2 }}>{isEditState ? "Edit Category" : "Add Category"}</Typography>
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
                label="Category Name"
                fullWidth
                value={formValues.category_name}
                onChange={(e) => {
                  setFormValues({
                    ...formValues,
                    category_name: e.target.value,
                  });
                }}
                disabled={!formValues.religion_pk}
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
        <CategoryList pageActions={pageActions} loading={fetchLoading} categoryList={fetchedData.category} handleEdit={handleEdit} handleDelete={handleDelete} />
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

export default connect(mapStateToProps, { showAlert })(CategoryPage);
