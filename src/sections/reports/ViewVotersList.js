import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Card, Stack, Grid, Divider, Box, CircularProgress, IconButton, MenuItem, Button, Checkbox } from "@mui/material";
import { connect } from "react-redux";
import { showAlert } from "../../actions/alert";
import { LoadingButton } from "@mui/lab";
import Tooltip from "@material-ui/core/Tooltip";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { ROWS_PER_PAGE_OPTION } from "../../constants";
import { deleteVoterInRedux, getAllVotersSurvey, getAllVotersSurveyWithGroup } from "../../actions/voter";
import { UncontrolledTextField } from "../../components/hook-form/RHFTextField";
import SearchIcon from "@mui/icons-material/Search";
import SearchByFilter from "../common/SearchByFilter";
import { deleteVotersById, getVolunteerListRoute, groupMappingtoVotersRoute, sachivalayamMappingtoVotersRoute, volunteerMappingToVoters, volunteerMappingToVotersRoute } from "../../utils/apis";
import instance from "../../utils/axios";
import CustomMuiDataTable from "../../components/CustomMuiDataTable";
import ApiServices from "../../services/apiservices";
import { useAlertContext } from "../../components/AlertProvider";
import { RHFAutoComplete } from "../../components/hook-form";

const ViewVotersList = ({ voter, filterValues, showAlert, getAllVotersSurvey, getAllVotersSurveyWithGroup, account, common, deleteVoterInRedux }) => {
  const userPermission = account.user && account.user.permissions ? account.user.permissions : [];
  const pageActions = userPermission.filter((p) => p.page_id === 139)[0];
  console.log("pageActions1", pageActions);
  const [volunteerListData, setVolunteerListData] = useState([]);
  const { showLoading, hideLoading, showAlertDialog } = useAlertContext();
  const [formValues, setFormValues] = useState({
    group: null,
    volunteer: null,
  });

  const [errors, setErrors] = useState({
    group: null,
    volunteer: null,
  });

  const fieldname = useRef();
  const fieldvalue = useRef();
  const filterRef = useRef(null);
  const filterRef1 = useRef(null);
  const navigate = useNavigate();

  const [isLoading, setLoading] = useState(false);
  const [isVolunteerLoading, setVolunteerLoading] = useState(false);
  const [checkedValues, setCheckedValues] = useState([]);

  const [assignValues, setAssignValues] = useState({
    mandal: null,
    division: null,
    sachivalayam: null,
    partno: null,
    village: null,
  });
  const handleChange = (name, value) => {
    const values = {};
    values[name] = value;
    setFormValues((state) => ({ ...state, ...values }));
  };

  console.log("dassdasdwqdeeeeehhhhh", filterValues);
  useEffect(() => {
    const getVolunteerList = async () => {
      setVolunteerLoading(true);
      const response = await ApiServices.postRequest(getVolunteerListRoute, {
        sachivalayam_id: filterValues?.sachivalayam_id ?? null,
      });
      const data = response.data?.message ?? [];
      console.log("data", data);
      setVolunteerListData(data);
      setVolunteerLoading(false);
    };

    getVolunteerList();
  }, [filterValues?.sachivalayam_id]);
  const columns = [
    { name: "voter_pkk", label: "Voter Pk", options: { display: false } },
    {
      name: "isCheck",
      label: "Select",
      options: {
        customBodyRender: (value, tableMeta, updateValue) => {
          const isChecked = checkedValues.includes(tableMeta.rowData[0]);
          return (
            <Checkbox
              checked={isChecked}
              onChange={(e) => {
                if (e.target.checked) {
                  setCheckedValues([...checkedValues, tableMeta.rowData[0]]);
                } else {
                  setCheckedValues(checkedValues.filter((item) => item != tableMeta.rowData[0]));
                }
              }}
            />
          );
        },
        customHeadLabelRender: (columnMeta) => {
          return (
            <>
              Select
              <Checkbox
                checked={voter.data.length > 0 && checkedValues.length === voter.data.length}
                onChange={(e) => {
                  if (e.target.checked) {
                    setCheckedValues(voter.data.map((item) => item.voter_pkk));
                  } else {
                    setCheckedValues([]);
                  }
                }}
              />
            </>
          );
        },
        // setCellProps: () => ({ style: { minWidth: "100px" } }),
      },
    },
    {
      name: "part_no",
      label: "Part No",
    },
    {
      name: "part_slno",
      label: "Part Slno",
    },
    { name: "voter_id", label: "Voter ID" },
    {
      name: "voter_name",
      label: "Voter Name",
      options: {
        setCellProps: () => ({ style: { minWidth: "200px" } }),
      },
    },
    {
      name: "guardian_name",
      label: "Guardian Name",
      options: {
        setCellProps: () => ({ style: { minWidth: "200px" } }),
      },
    },
    { name: "guardian_type", label: "Guardian" },
    {
      name: "gender_type",
      label: "Gender",
    },
    {
      name: "voter_age",
      label: "Age",
    },
    {
      name: "voter_phone_no",
      label: "Phone",
    },
    {
      name: "is_resident",
      label: "Residential",
      options: {
        customBodyRender: (value, tableMeta, updateValue) => {
          return value == 1 ? "Yes" : value == 0 ? "No" : "-";
        },
      },
    },
    {
      name: "current_address",
      label: "Current Address",
      options: {
        setCellProps: () => ({ style: { minWidth: "200px" } }),
      },
    },
    {
      name: "permenent_address",
      label: "Permanent Address",
      options: {
        setCellProps: () => ({ style: { minWidth: "200px" } }),
      },
    },
    // {
    //   name: "group_id",
    //   label: "Group ID",
    //   options: {
    //     customBodyRender: (value, tableMeta, updateValue) => {
    //       return value ? value : "-";
    //     },
    //   },
    // },

    {
      name: "volunteer_name",
      label: "Volunteer",
      options: {
        customBodyRender: (value, tableMeta, updateValue) => {
          return value ? value : "-";
        },
      },
    },
    {
      name: "volunteer_phonenumber",
      label: "Volunteer Phone",
      options: {
        customBodyRender: (value, tableMeta, updateValue) => {
          return value ? value : "-";
        },
      },
    },
    {
      name: "group_name",
      label: "Group Name",
      options: {
        customBodyRender: (value, tableMeta, updateValue) => {
          return value ? value : "-";
        },
      },
    },
    {
      name: "voter_pkk",
      label: "Edit/Delete",
      options: {
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <Stack direction="row">
              <Tooltip title={pageActions.edit_perm != 1 ? "You don't have access to edit" : ""}>
                <span>
                  <IconButton color="primary" onClick={() => handleEdit(value)} disabled={pageActions.edit_perm != 1}>
                    <EditNoteIcon />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title={pageActions.delete_perm != 1 ? "You don't have access to delete" : ""}>
                <span>
                  <IconButton color="error" onClick={() => handleConfirmDelete(value)} disabled={pageActions.delete_perm != 1}>
                    <DeleteForeverIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          );
        },
      },
    },
  ];

  const searchFields = [
    {
      name: "part_slno",
      label: "Part Slno",
    },
    {
      name: "voter_id",
      label: "Voter ID",
    },
    {
      name: "voter_name",
      label: "Voter Name",
    },
    {
      name: "guardian_name",
      label: "Guardian Name",
    },
    {
      name: "current_address",
      label: "Current Address",
    },
    {
      name: "phone_no",
      label: "Phone",
    },
  ];

  const options = {
    elevation: 0,
    selectableRows: "none",
    responsive: "standard",
    serverSide: true,
    filter: false,
    search: false,
    ...(account.user?.desgination_name != "MLA" && {
      download: false,
      print: false,
      viewColumns: false,
    }),
    count: voter.count,
    page: voter.page,
    rowsPerPage: voter.limit,
    rowsPerPageOptions: ROWS_PER_PAGE_OPTION,
    onTableChange: (action, tableState) => {
      switch (action) {
        case "changePage":
          handleRetrieveData(tableState);
          break;
        case "changeRowsPerPage":
          handleRetrieveData(tableState);
          break;
        default:
        // console.log("action not handled.");
        // console.log(action, tableState);
      }
    },
  };

  const handleRetrieveData = (tableState) => {
    var searchForm = {
      fieldname: fieldname.current.value,
      fieldvalue: fieldvalue.current.value,
    };

    console.log("tableState", tableState);
    console.log("filterValue4554546s", filterValues);

    getAllVotersSurvey({ ...filterValues, ...searchForm }, tableState.page, tableState.rowsPerPage);
  };

  const handleConfirmDelete = (id) => {
    var index = voter.data.findIndex((e) => e.voter_pkk == id);
    const voterId = voter.data[index].voter_id;
    showAlertDialog({
      description: `Do you want to delete this Voter(Voter Id : ${voterId})?`,
      agreeCallback: async () => {
        showLoading();
        await handleDelete(id);
        hideLoading();
      },
    });
  };

  const handleConfirmVolunteerAssign = () => {
    if (checkedValues.length === 0) {
      showAlert({ text: "Please select atleast one voter", color: "error" });
      setVolunteerLoading(false);
      return;
    }

    if (!filterValues.district_id) {
      showAlert({ text: "Please select district", color: "error" });
      setVolunteerLoading(false);
      return;
    }

    if (!filterValues.consistency_id) {
      showAlert({ text: "Please select constituency", color: "error" });
      setVolunteerLoading(false);
      return;
    }

    if (!filterValues.mandal_id) {
      showAlert({ text: "Please select mandal", color: "error" });
      setVolunteerLoading(false);
      return;
    }

    if (!filterValues.division_id) {
      showAlert({ text: "Please select division", color: "error" });
      setVolunteerLoading(false);
      return;
    }

    if (!filterValues.sachivalayam_id) {
      showAlert({ text: "Please select sachivalayam", color: "error" });
      setVolunteerLoading(false);
      return;
    }
    if (!filterValues.volunteer) {
      showAlert({ text: "Please select volunteer", color: "error" });
      setVolunteerLoading(false);
      return;
    }
    showAlertDialog({
      description: `Do you want to assign this Voter to Volunteer?`,
      agreeCallback: async () => {
        showLoading();
        await handleVolunteerSubmit();
        hideLoading();
      },
    });
  };

  const handleConfirmDeleteGroup = () => {
    if (checkedValues.length === 0) {
      showAlert({ text: "Please select atleast one voter", color: "error" });
      setLoading(false);
      return;
    }

    if (!filterValues.district_id) {
      showAlert({ text: "Please select district", color: "error" });
      setLoading(false);
      return;
    }

    if (!filterValues.consistency_id) {
      showAlert({ text: "Please select constituency", color: "error" });
      setLoading(false);
      return;
    }

    if (!filterValues.mandal_id) {
      showAlert({ text: "Please select mandal", color: "error" });
      setLoading(false);
      return;
    }

    if (!filterValues.division_id) {
      showAlert({ text: "Please select division", color: "error" });
      setLoading(false);
      return;
    }

    if (!filterValues.sachivalayam_id) {
      showAlert({ text: "Please select sachivalayam", color: "error" });
      setLoading(false);
      return;
    }

    if (!filterValues.part_no) {
      showAlert({ text: "Please select partno", color: "error" });
      setLoading(false);
      return;
    }

    if (!formValues.group) {
      showAlert({ text: "Please select group", color: "error" });
      setLoading(false);
      return;
    }

    showAlertDialog({
      description: `Do you want to assign this Voter to Group?`,
      agreeCallback: async () => {
        showLoading();
        await handleSubmit();
        hideLoading();
      },
    });
  };

  const handleEdit = (id) => {
    var index = voter.data.findIndex((e) => e.voter_pkk == id);
    if (index != -1) {
      navigate("/voter-registration", {
        state: { voterData: voter.data[index] },
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      // console.log("deleteUserPk",deleteUserPk);
      // var index = voter.data.findIndex((e) => e.voter_pkk == id);
      console.log("voter_pkk", id);
      console.log("voter", voter);

      const response = await ApiServices.deleteRequest(`${deleteVotersById + id}`);
      console.log(response);
      showAlert({ text: "Voter Deleted Successfully", color: "success" });
      await getAllVotersSurvey({ ...filterValues }, 1, 50);
      setLoading(false);
    } catch (error) {
      console.error(error);
      showAlert({ text: "Failed to delete Voter", color: "danger" });
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    // if (checkedValues.length === 0) {
    //   showAlert({ text: "Please select atleast one voter", color: "error" });
    //   setLoading(false);
    //   return;
    // }

    // if (!assignValues.district) {
    //   showAlert({ text: "Please select district", color: "error" });
    //   setLoading(false);
    //   return;
    // }

    // if (!assignValues.constituency) {
    //   showAlert({ text: "Please select constituency", color: "error" });
    //   setLoading(false);
    //   return;
    // }

    // if (!assignValues.mandal) {
    //   showAlert({ text: "Please select mandal", color: "error" });
    //   setLoading(false);
    //   return;
    // }

    // if (!assignValues.division) {
    //   showAlert({ text: "Please select division", color: "error" });
    //   setLoading(false);
    //   return;
    // }

    // if (!assignValues.sachivalayam) {
    //   showAlert({ text: "Please select sachivalayam", color: "error" });
    //   setLoading(false);
    //   return;
    // }

    // if (!assignValues.partno) {
    //   showAlert({ text: "Please select partno", color: "error" });
    //   setLoading(false);
    //   return;
    // }

    // if (!assignValues.group) {
    //   showAlert({ text: "Please select group", color: "error" });
    //   setLoading(false);
    //   return;
    // }
    // console.log("assignValues415414141", assignValues);
    try {
      var jsonData = {
        votersPkList: checkedValues,
        new_district_id: filterValues.district_id,
        new_consistency_id: filterValues.consistency_id,
        new_sachivalayam_id: filterValues.sachivalayam_id,
        new_mandal_id: filterValues.mandal_id,
        new_division_id: filterValues.division_id,
        new_part_no: filterValues.part_no,
        new_group_id: formValues.group.group_pk,
        // new_group_id: formValues.group.user_pk,
      };
      console.log("ffsdfsdfsdfewrwerwrwerwerwerwe", jsonData);

      await ApiServices.postRequest(groupMappingtoVotersRoute, jsonData);
      console.log("Hi ");
      showAlert({
        text: "Voter assigned successfully",
        color: "success",
      });
      setCheckedValues([]);
      // filterRef.current.reset();
      // reFecthData();
      await getAllVotersSurveyWithGroup({ ...filterValues, intrested_party: null, is_resident: null, isSurveyed: null, fieldname: null, fieldvalue: null, sort_by: null });
      setLoading(false);
    } catch (error) {
      console.error(error);
      showAlert({ text: "Something went wrong" });
      setCheckedValues([]);
      // filterRef.current.reset();
      setLoading(false);
    }
  };

  const handleVolunteerSubmit = async () => {
    setVolunteerLoading(true);
    // if (checkedValues.length === 0) {
    //   showAlert({ text: "Please select atleast one voter", color: "error" });
    //   setVolunteerLoading(false);
    //   return;
    // }

    // if (!assignValues.district) {
    //   showAlert({ text: "Please select district", color: "error" });
    //   setVolunteerLoading(false);
    //   return;
    // }

    // if (!assignValues.constituency) {
    //   showAlert({ text: "Please select constituency", color: "error" });
    //   setVolunteerLoading(false);
    //   return;
    // }

    // if (!assignValues.mandal) {
    //   showAlert({ text: "Please select mandal", color: "error" });
    //   setVolunteerLoading(false);
    //   return;
    // }

    // if (!assignValues.division) {
    //   showAlert({ text: "Please select division", color: "error" });
    //   setVolunteerLoading(false);
    //   return;
    // }

    // if (!assignValues.sachivalayam) {
    //   showAlert({ text: "Please select sachivalayam", color: "error" });
    //   setVolunteerLoading(false);
    //   return;
    // }
    // if (!assignValues.volunteer) {
    //   showAlert({ text: "Please select volunteer", color: "error" });
    //   setVolunteerLoading(false);
    //   return;
    // }
    console.log("assignValuesVolunteer123456", assignValues);
    var jsonData = {
      votersPkList: checkedValues,
      new_district_id: filterValues.district_id,
      new_consistency_id: filterValues.consistency_id,
      new_sachivalayam_id: filterValues.sachivalayam_id,
      new_mandal_id: filterValues.mandal_id,
      new_division_id: filterValues.division_id,
      new_volunteer_id: formValues.volunteer.user_pk,
    };

    console.log("jsonDaVolunteer", jsonData);
    try {
      await ApiServices.postRequest(volunteerMappingToVotersRoute, jsonData);
      console.log("Hi ");
      showAlert({
        text: "Voter assigned successfully",
        color: "success",
      });
      setCheckedValues([]);
      // filterRef1.current.reset();
      // reFecthData();
      await getAllVotersSurveyWithGroup({ ...filterValues, intrested_party: null, is_resident: null, isSurveyed: null, fieldname: null, fieldvalue: null, sort_by: null });
      setVolunteerLoading(false);
    } catch (error) {
      console.error(error);
      showAlert({ text: "Something went wrong" });
      setCheckedValues([]);
      // filterRef.current.reset();
      setVolunteerLoading(false);
    }
  };
  console.log("checkedValues", checkedValues);

  return (
    <Card elevation={1}>
      <Box p={3}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={2}>
            <UncontrolledTextField inputRef={fieldname} label="Search by" select>
              {searchFields.map((item, index) => (
                <MenuItem key={index} value={item.name}>
                  {item.label}
                </MenuItem>
              ))}
            </UncontrolledTextField>
          </Grid>

          <Grid item xs={3}>
            <UncontrolledTextField inputRef={fieldvalue} label="Search..." />
          </Grid>

          <Grid item xs={3}>
            <Button disabled={voter.isLoading} variant="contained" onClick={handleRetrieveData}>
              <SearchIcon />
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Divider />

      {voter.isLoading && (
        <Box minHeight={200} display="flex" justifyContent="center" alignItems="center">
          <CircularProgress />
        </Box>
      )}

      {!voter.isLoading && (
        <>
          {pageActions.edit_perm == 1 && (
            <Box p={3}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {checkedValues.length} voters selected
              </Typography>

              {/* <Grid container spacing={2} alignItems="center">
              <SearchByFilter ref={filterRef} showPartNo={false} showVillage={false} showOtherFilters={false} onChanged={(value) => setAssignValues(value)} showSearchButton={false} />

              <Grid item xs={12} md={6} lg={3}>
                <Tooltip title={pageActions.approved_perm != 1 ? "You don't have access to Assign Sachivalayam" : ""}>
                  <span>
                    <LoadingButton type="submit" loading={isLoading} onClick={handleSubmit} variant="contained" disabled={pageActions.approved_perm != 1}>
                      Assign Sachivalayam
                    </LoadingButton>
                  </span>
                </Tooltip>
              </Grid>
            </Grid> */}
              <Grid container spacing={2} alignItems="center">
                {/* <SearchByFilter ref={filterRef} showPartNo={true} showGroup={true} showVillage={false} showOtherFilters={false} onChanged={(value) => setAssignValues(value)} showSearchButton={false} /> */}
                <Grid item xs={12} md={6} lg={6}>
                  <RHFAutoComplete
                    name="group"
                    label="Select Cluster Group"
                    value={formValues.group}
                    options={common?.clustergroups?.filter((e) => e.part_pk == filterValues?.part_no) || []}
                    getOptionLabel={(option) => option.label}
                    onChange={handleChange}
                    // disabled={account.user.group_pk != null}
                    error={!!errors.group}
                    helperText={errors.group}
                  />
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                  <Tooltip title={pageActions.approved_perm != 1 ? "You don't have access to Assign Group" : ""}>
                    <span>
                      <LoadingButton type="submit" loading={isLoading} onClick={() => handleConfirmDeleteGroup()} variant="contained" disabled={pageActions.approved_perm != 1}>
                        Assign Group
                      </LoadingButton>
                    </span>
                  </Tooltip>
                </Grid>
              </Grid>
              <Box p={2} />
              <Divider />
              <Box p={2} />
              <Grid container spacing={2} alignItems="center">
                {/* <SearchByFilter ref={filterRef1} showPartNo={false} showVolunteer={true} showVillage={false} showOtherFilters={false} onChanged={(value) => setAssignValues(value)} showSearchButton={false} /> */}
                <Grid item xs={12} md={6} lg={6}>
                  <RHFAutoComplete
                    name="volunteer"
                    label="Select Volunteer"
                    value={formValues.volunteer}
                    options={volunteerListData ?? []}
                    getOptionLabel={(option) => option.user_displayname + " - " + option.volunteer_phonenumber}
                    onChange={handleChange}
                    error={!!errors.volunteer}
                    loading={isVolunteerLoading}
                    helperText={errors.volunteer}
                  />
                </Grid>
                <Grid item xs={12} md={6} lg={2}>
                  <Tooltip title={pageActions.approved_perm != 1 ? "You don't have access to Assign Volunteer" : ""}>
                    <span>
                      <LoadingButton type="submit" loading={isVolunteerLoading} onClick={() => handleConfirmVolunteerAssign()} variant="contained" disabled={pageActions.approved_perm != 1}>
                        Assign Volunteer
                      </LoadingButton>
                    </span>
                  </Tooltip>
                </Grid>
              </Grid>
            </Box>
          )}

          <CustomMuiDataTable columns={columns} data={voter.data} options={options} />
        </>
      )}
    </Card>
  );
};

const mapStateToProps = (state) => {
  return {
    voter: state.voter,
    account: state.auth,
    common: state.common,
  };
};

export default connect(mapStateToProps, {
  showAlert,
  getAllVotersSurvey,
  deleteVoterInRedux,
  getAllVotersSurveyWithGroup,
})(ViewVotersList);
