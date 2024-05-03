import { useEffect, useRef, useState } from "react";
import { Typography, Card, Stack, Grid, Switch, Divider, Box, Chip, TextField, FormControlLabel, Popover, Button, MenuItem, IconButton, Checkbox } from "@mui/material";
import { CheckBox } from "@mui/icons-material";
import { connect } from "react-redux";
import { showAlert } from "../../actions/alert";
import { LoadingButton } from "@mui/lab";
import ViewUserPage from "../../pages/ViewUserPage";
import Sachivalayam from "../../pages/Sachivalayam";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import CustomMuiDataTable from "../../components/CustomMuiDataTable";
import { set } from "date-fns";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@material-ui/core/Tooltip";
import ApiServices from "../../services/apiservices";
import { UpdateAndDeleteConstituenciesRoute, mpListGetAllRoute, mpMappingToConstituencyRoute } from "../../utils/apis";
import { ROWS_PER_PAGE_OPTION } from "../../constants";
import { useAlertContext } from "../../components/AlertProvider";
import SearchByFilter from "../common/SearchByFilter";
import { RHFAutoComplete } from "../../components/hook-form";

const ConstituenciesList = ({ loading, showAlert, constituenciesList, handleEdit, pageActions, handleDelete, fecthConstituenciesData }) => {
  const { showLoading, hideLoading, showAlertDialog } = useAlertContext();
  const filterRef = useRef(null);
  const [checkedValues, setCheckedValues] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [otherFilterValues, setOtherFilterValues] = useState({
    mp: null,
  });
  const [filterValues, setFilterValues] = useState({
    district: null,
    mandal: null,
    division: null,
    sachivalayam: null,
    partno: null,
    village: null,
  });

  const [mplist, setMpList] = useState([]);

  const columns = [
    {
      name: "consistency_id",
      label: "Constituency Id",
      options: {
        display: false,
      },
    },
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
      },
    },
    {
      name: "district_name",
      label: "District Name",
    },
    {
      name: "consistency_no",
      label: "Constituency No",
    },
    {
      name: "consistency_name",
      label: "Constituency Name",
    },
    {
      name: "mp_name",
      label: "MP Name",
      options: {
        customBodyRender: (value, tableMeta, updateValue) => {
          return value ? value : "-";
        },
      },
    },
    {
      name: "consistency_id",
      label: "Edit/Delete",
      options: {
        customBodyRender: (value, tableMeta, updateValue) => {
          var index = constituenciesList.findIndex((e) => e.consistency_id == value);

          return (
            <Stack direction="row">
              <Tooltip title={pageActions.edit_perm != 1 ? "You don't have access to edit" : ""}>
                <span>
                  <IconButton color="primary" onClick={(e) => handleEdit(constituenciesList[index])} disabled={pageActions.edit_perm != 1}>
                    <EditNoteIcon />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title={pageActions.delete_perm != 1 ? "You don't have access to delete" : ""}>
                <span>
                  <IconButton color="error" onClick={(e) => handleConfirmDelete(constituenciesList[index])} disabled={pageActions.delete_perm != 1}>
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

  console.log("huldsdsadasdasdasdk", filterValues);
  useEffect(() => {
    const fetchMpList = async () => {
      try {
        const response = await ApiServices.postRequest(mpListGetAllRoute);
        console.log("responsdfdsfsdfdsfsfsfsdffe", response);
        setMpList(response.data.message);
      } catch (error) {
        console.error(error);
      }
    };
    fetchMpList();
  }, []);

  const options = {
    elevation: 0,
    selectableRows: "none",
    responsive: "standard",
    rowsPerPageOptions: ROWS_PER_PAGE_OPTION,
    rowsPerPage: 100,
    download: false,
    print: false,
    viewColumns: false,
    filter: false,
  };

  const handleConfirmDelete = (data) => {
    showAlertDialog({
      description: "Are you sure? Do you want to delete this constituency?",
      agreeCallback: async () => {
        showLoading();
        await handleDelete(data);
        hideLoading();
      },
    });
  };

  // const handleSubmit = async () => {
  //   if (!selectedValues.district_id) {
  //     showAlert({ text: "Please select district", color: "error" });
  //     return;
  //   }

  //   if (!selectedValues.consistency_name) {
  //     showAlert({ text: "Please enter constituency name", color: "error" });

  //     return;
  //   }

  //   try {
  //     setIsLoading(true);
  //     const response = await ApiServices.putRequest(UpdateAndDeleteConstituenciesRoute + selectedValues.consistency_id, {
  //       district_pk: selectedValues.district_id,
  //       consistency_name: selectedValues.consistency_name,
  //     });

  //     setIsLoading(false);
  //     showAlert({ text: "Constituency Updated Successfully11", color: "success" });
  //     setRefresh((prevState) => !prevState);
  //     setSelectedValues({
  //       state_id: "",
  //       district_id: "",
  //       consistency_id: "",
  //       consistency_name: "",
  //     });
  //     setAnchorEl(null);
  //   } catch (error) {
  //     console.log(error);
  //     setIsLoading(false);
  //     showAlert({ text: "Something went wrong", color: "error" });
  //     setRefresh((prevState) => !prevState);
  //   }
  // };
  // const handleDelete = async (id) => {
  //   try {
  //     setIsLoading(true);
  //     const response = await ApiServices.deleteRequest(UpdateAndDeleteConstituenciesRoute + id);
  //     setIsLoading(false);
  //     showAlert({ text: "Constituency Deleted Successfully", color: "success" });
  //     setRefresh((prevState) => !prevState);
  //   } catch (error) {
  //     console.log(error);
  //     setIsLoading(false);
  //     showAlert({ text: "Something went wrong", color: "error" });
  //     setRefresh((prevState) => !prevState);
  //   }
  // };

  console.log("ffjjdsfhjdfjdhsfjdjfhjdfhsj", otherFilterValues);

  const handleSubmit = async () => {
    setLoading(true);
    console.log("filterValues11111nkjiijijiji", filterValues);

    if (checkedValues.length === 0) {
      showAlert({ text: "Please select atleast one constituency", color: "error" });
      setLoading(false);
      return;
    }

    if (!filterValues.district) {
      showAlert({ text: "Please select district", color: "error" });
      setLoading(false);
      return;
    }

    try {
      var jsonData = {
        consistency_list: checkedValues,
        new_district_id: filterValues.district.district_id,
        mp_id: otherFilterValues.mp.mp_pk,
      };
      console.log("jsonData48561324651230", jsonData);
      await ApiServices.postRequest(mpMappingToConstituencyRoute, jsonData);
      showAlert({
        text: "Mp assigned successfully",
        color: "success",
      });
      setCheckedValues([]);
      filterRef.current.reset();
      fecthConstituenciesData();
      setOtherFilterValues({
        mp: null,
      });
      setLoading(false);
    } catch (error) {
      console.error(error);
      showAlert({ text: "Something went wrong" });
      setCheckedValues([]);
      filterRef.current.reset();
      setLoading(false);
    }
  };

  return (
    <Card elevation={1}>
      <>
        <Stack>
          <Box p={3}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {checkedValues.length} constituency selected
            </Typography>

            <Grid container spacing={2} alignItems="center">
              <SearchByFilter
                ref={filterRef}
                showConstituency={false}
                showMandal={false}
                showSachivalayam={false}
                showPartNo={false}
                showVillage={false}
                showDivision={false}
                showOtherFilters={false}
                onChanged={(value) => setFilterValues(value)}
                showSearchButton={false}
                children={
                  <>
                    <Grid item xs={12} md={6} lg={2}>
                      <RHFAutoComplete
                        name="mp"
                        label="Select MP"
                        value={otherFilterValues.mp}
                        options={mplist.filter((item) => item.district_id == filterValues.district?.district_id)}
                        getOptionLabel={(option) => option.mp_name}
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

              <Grid item xs={12} md={6} lg={2}>
                <Tooltip title={pageActions.edit_perm != 1 ? "You don't have access to Assign Part" : ""}>
                  <span>
                    <LoadingButton loading={isLoading} onClick={handleSubmit} variant="contained" disabled={pageActions.edit_perm != 1}>
                      Assign Mp
                    </LoadingButton>
                  </span>
                </Tooltip>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {loading && (
            <Box minHeight={200} display="flex" justifyContent="center" alignItems="center">
              <CircularProgress />
            </Box>
          )}

          {!loading && <CustomMuiDataTable title="" columns={columns} data={constituenciesList} options={options} />}
        </Stack>
      </>
    </Card>
  );
};

const mapStateToProps = (state) => {
  return {
    batches: state.common,
    students: state.management,
  };
};

export default connect(mapStateToProps, {
  showAlert,
})(ConstituenciesList);
