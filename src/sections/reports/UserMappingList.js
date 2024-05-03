import { useEffect, useState } from "react";
import { Card, Stack, Grid, Switch, Divider, Box, Chip, TextField, FormControlLabel, Typography, Checkbox, CircularProgress, Button, MenuItem } from "@mui/material";
import Tooltip from "@material-ui/core/Tooltip";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CheckBox } from "@mui/icons-material";
import { connect } from "react-redux";
import { showAlert } from "../../actions/alert";
import { checkOrUncheckUser, clearUserReducer } from "../../actions/user";
import instance from "../../utils/axios";
import { designationMappingRoute } from "../../utils/apis";
import { LoadingButton } from "@mui/lab";
import CustomMuiDataTable from "../../components/CustomMuiDataTable";
import ApiServices from "../../services/apiservices";

import * as React from "react";

import Autocomplete from "@mui/material/Autocomplete";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { ROWS_PER_PAGE_OPTION } from "../../constants";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const UserMappingList = ({ common, user, filterValues, showAlert, checkOrUncheckUser, clearUserReducer, account }) => {
  const userPermission = account.user && account.user.permissions ? account.user.permissions : [];
  const pageActions = userPermission.filter((p) => p.page_id === 140)[0];
  console.log("pageActions1", pageActions);
  const [isLoading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState({
    partno: "",
  });
  const [selectedParts, setSelectedParts] = useState([]);
  console.log("partNoList6525132", selectedParts);

  useEffect(() => {
    if (user.isLoading) {
      resetFormValues();
    }
  }, [user.isLoading]);

  const columns = [
    {
      name: "isCheck",
      label: "Select",
      options: {
        customBodyRender: (value, tableMeta, updateValue) => {
          var data = tableMeta.rowData;
          if (data[2] == 37 || data[2] == 38 || data[2] == 36) {
            return <Checkbox checked={value ?? false} onChange={(e) => checkOrUncheckUser(data[1], e.target.checked)} />;
          }
          return null;
        },
      },
    },
    {
      name: "user_pk",
      label: "User Id",
    },
    {
      name: "designation_id",
      label: "Designation Id",
      options: { display: false },
    },
    { name: "user_displayname", label: "Full Name" },
    { name: "username", label: "Phone" },
    { name: "designation_name", label: "Designation" },
    {
      name: "mandal_name",
      label: "Mandal Name",
      options: {
        customBodyRender: (value, tableMeta, updateValue) => {
          return value ?? "-";
        },
      },
    },
    {
      name: "division_name",
      label: "Division Name",
      options: {
        customBodyRender: (value, tableMeta, updateValue) => {
          return value ?? "-";
        },
      },
    },
    {
      name: "sachivalayam_name",
      label: "Sachivalyam Name",
      options: {
        customBodyRender: (value, tableMeta, updateValue) => {
          return value ?? "-";
        },
      },
    },
    {
      name: "parts",
      label: "Part/Booth No",
      options: {
        customBodyRender: (value, tableMeta, updateValue) => {
          return value ?? "-";
        },
      },
    },
    {
      name: "village_name",
      label: "Village",
      options: {
        customBodyRender: (value, tableMeta, updateValue) => {
          return value ?? "-";
        },
      },
    },
  ];
  const options = {
    elevation: 0,
    selectableRows: "none",
    responsive: "standard",
    download: false,
    print: false,
    viewColumns: false,
    filter: false,
    rowsPerPage: 100,
    rowsPerPageOptions: ROWS_PER_PAGE_OPTION,
    ...(account.user?.desgination_name != "MLA" && {
      filter: false,
      search: false,
      download: false,
      print: false,
      viewColumns: false,
    }),
  };

  const handleChange = (name, value) => {
    setFormValues((state) => ({ ...state, [name]: value }));
  };

  const handleSubmit = async () => {
    var userList = user.data.filter((e) => e.isCheck == true).map((e) => e.user_pk);
    if (selectedParts.length <= 0) {
      showAlert({ text: "Please select partno" });
      return;
    }

    if (userList.length <= 0) {
      showAlert({ text: "No user selected" });
      return;
    }

    setLoading(true);
    const partsList = selectedParts.map((e) => e.part_no);
    console.log("partsLissdasdasdt", partsList);
    try {
      var jsonData = {
        part_no_List: partsList,
        usersPkList: userList,
      };

      await ApiServices.postRequest(designationMappingRoute, jsonData);

      resetFormValues();
      clearUserReducer();
      showAlert({
        text: "User mapping updated successfully",
        color: "success",
      });
      setLoading(false);
    } catch (error) {
      console.error(error);
      showAlert({ text: "Something went wrong" });
      setLoading(false);
    }
  };

  const resetFormValues = () => {
    setFormValues({ partno: "" });
  };

  return (
    <Card elevation={1}>
      {user.isLoading && (
        <Box minHeight={200} display="flex" justifyContent="center" alignItems="center">
          <CircularProgress />
        </Box>
      )}

      {!user.isLoading && (
        <>
          <Box p={4}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {user.data.filter((e) => e.isCheck == true).length} users selected
            </Typography>

            <Grid container spacing={2} alignItems="center">
              {/* <Grid item xs={12} md={6} lg={3}>
                <TextField name="partno" value={formValues.partno} size="small" fullWidth label="Select Part/Booth No" select onChange={(e) => handleChange(e.target.name, e.target.value)}>
                  {common.parts
                    .filter((e) => e.sachivalayam_id == filterValues?.sachivalayam_id)
                    ?.map((item, index) => (
                      <MenuItem key={index} value={item.part_no}>
                        {item.part_no}
                      </MenuItem>
                    ))}
                </TextField>
              </Grid> */}

              <Grid item xs={12} md={3} lg={3}>
                <Autocomplete
                  multiple
                  id="checkboxes-tags-demo"
                  options={common.parts.filter((e) => e.sachivalayam_id == filterValues?.sachivalayam_id)}
                  disableCloseOnSelect
                  getOptionLabel={(option) => option.part_no}
                  onChange={(e, value) => {
                    setSelectedParts(value);
                  }}
                  renderOption={(props, option, { selected }) => (
                    <li {...props}>
                      <Checkbox icon={icon} checkedIcon={checkedIcon} style={{ marginRight: 8 }} checked={selected} />
                      {option.part_no}
                    </li>
                  )}
                  // style={{ width: 300 }}
                  renderInput={(params) => <TextField {...params} label="Select Part/Booth No" placeholder="Part" />}
                />
              </Grid>
              <Box p={2} />

              <Grid item xs={12} md={6} lg={3}>
                <Tooltip title={pageActions.approved_perm != 1 ? "You don't have access to Assign Part No" : ""}>
                  <span>
                    <LoadingButton loading={isLoading} variant="outlined" onClick={handleSubmit} disabled={pageActions.approved_perm != 1}>
                      Assign Part No
                    </LoadingButton>
                  </span>
                </Tooltip>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          <CustomMuiDataTable title="Users List" columns={columns} data={user.data} options={options} />
        </>
      )}
    </Card>
  );
};

const mapStateToProps = (state) => {
  return {
    common: state.common,
    user: state.user,
    account: state.auth,
  };
};

export default connect(mapStateToProps, {
  showAlert,
  checkOrUncheckUser,
  clearUserReducer,
})(UserMappingList);
