import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Stack, Box, CircularProgress, IconButton, Typography, Divider, TextField, Grid, MenuItem, Button, Checkbox } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import Tooltip from "@material-ui/core/Tooltip";
import MUIDataTable from "mui-datatables";
import { connect } from "react-redux";
import { showAlert } from "../../actions/alert";

import EditNoteIcon from "@mui/icons-material/EditNote";
import { PARTY_ID, ROWS_PER_PAGE_OPTION, getMuiTableTheme, getTicketColorByValue } from "../../constants";
import { changeOpinionPoll, changeVotedParty, getAllVotersSurvey } from "../../actions/voter";
import { BJPRadio, CongressRadio, CustomRadio, JSPRadio, NeutralRadio, OthersRadio, TDPRadio, YCPRadio } from "../common/PartyRadioButtons";
import UpdateVoterDialog from "../common/UpdateVoterDialog";
import AnalyticsCard from "../common/AnalyticsCard";
import SearchIcon from "@mui/icons-material/Search";
import { FormProvider, RHFTextField } from "../../components/hook-form";
import CustomMuiDataTable from "../../components/CustomMuiDataTable";
import i18n from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";
import { useAlertContext } from "../../components/AlertProvider";
import WriteVottingReason from "../common/WriteVottingReason";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        "John Doe": "John Doe", // English
      },
    },
    te: {
      translation: {
        "John Doe": "జాన్ డో", // Telugu translation for "John Doe"
      },
    },
  },
  lng: "te", // use Telugu by default
  fallbackLng: "en", // use English if translation is not available
  interpolation: {
    escapeValue: false,
  },
});

const VotingPollSurveyList = forwardRef(({ isUser, voter, account, common, showAlert, changeOpinionPoll, changeVotedParty, handleSubmit, handlePaginationSubmit }, ref) => {
  const userPermission = account.user && account.user.permissions ? account.user.permissions : [];
  const pageActions = userPermission.filter((p) => p.page_id === 176)[0];
  console.log("pageActions128465321", pageActions);

  const { t } = useTranslation();
  const navigate = useNavigate();

  const schema = Yup.object().shape({
    fieldname: Yup.string(),
    fieldvalue: Yup.string(),
  });

  const defaultValues = {
    fieldname: "",
    fieldvalue: "",
  };

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const { getValues, reset } = methods;
  console.log("account5252525", account.user);
  const columns = [
    {
      name: "voter_pkk",
      label: "Select",
      options: {
        display: false,
      },
    },
    {
      name: "voter_pkk",
      label: "Select",
      options: {
        display: pageActions.survey_perm == 1 ? true : false,
        customBodyRender: (value, tableMeta, updateValue) => {
          // console.log("tableMeta", tableMeta.rowData[18])
          // console.log("value", value)
          var data = tableMeta.rowData;
          var index = voter.data.findIndex((e) => e.voter_pkk == value);
          const isCheck = voter.data[index].voted_party !== null && voter.data[index].voted_party !== false ? true : false;

          console.log("voter.data[index]", voter.data[index]);
          return (
            <Stack direction="row" spacing={1}>
              <Tooltip title={pageActions.survey_perm != 1 ? "You don't have access to create" : ""}>
                <span>
                  <Checkbox checked={isCheck} onChange={(e) => handleChange(data[0], e.target.checked)} disabled={pageActions.survey_perm != 1} />
                </span>
              </Tooltip>
            </Stack>
          );
        },
      },
    },
    {
      name: "voter_pkk",
      label: "Voting Reason",
      options: {
        display: account.user?.desgination_id == 38 ? true : false,
        customBodyRender: (value, tableMeta, updateValue) => {
          // console.log("tableMeta", tableMeta.rowData[18])
          // console.log("value", value)

          var index = voter.data.findIndex((e) => e.voter_pkk == value);
          const isActive = voter.data[index].opinionparty !== null ? true : false;

          // console.log("voter.data[index]", voter.data[index]);
          return (
            <Stack direction="row" spacing={1}>
              <WriteVottingReason voterData={voter.data[index]} isActive={isActive} pageActions={pageActions} />
            </Stack>
          );
        },
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
    {
      name: "voter_id",
      label: "Voter ID",
    },
    {
      name: "voter_name",
      label: "Voter Name",
      options: {
        setCellProps: () => ({ style: { minWidth: "150px" } }),
        customBodyRender: (value, tableMeta, updateValue) => {
          var data = tableMeta.rowData;
          console.log("hulk", t("John Doe"));

          return <Typography>{value}</Typography>;
        },
      },
    },
    {
      name: "guardian_type",
      label: "Guardian",
    },
    {
      name: "guardian_name",
      label: "Guardian Name",
      options: {
        setCellProps: () => ({ style: { minWidth: "100px" } }),
      },
    },
    {
      name: "gender_type",
      label: "Gender",
    },
    {
      name: "voter_age",
      label: "Age",
    },
    {
      name: "permenent_address",
      label: "Permanent Address",
      options: {
        setCellProps: () => ({ style: { minWidth: "80px" } }),
      },
    },
    // {
    //   name: "opinionparty",
    //   label: "Opinion Survey",
    //   options: {
    //     customBodyRender: (value, tableMeta, updateValue) => {
    //       const opinionPartyName = common.parties.find((party) => party.value === value)?.label;
    //       return (
    //         <Typography
    //           sx={{
    //             fontSize: "13px",
    //           }}
    //         >
    //           {opinionPartyName}
    //         </Typography>
    //       );
    //     },
    //   },
    // },
    // ...(common.parties
    //   ? common.parties
    //       .filter((item) => item.value !== 22 && item.value !== 26)
    //       .map((item, index) => ({
    //         name: "voted_party",
    //         label: item.label,
    //         options: {
    //           customBodyRender: (value, tableMeta, updateValue) => {
    //             var data = tableMeta.rowData;
    //             var partyId = item.value;
    //             return (
    //               <Tooltip title={pageActions.survey_perm != 1 ? "You don't have access to select" : ""}>
    //                 <span
    //                   style={{
    //                     display: "flex",
    //                     justifyContent: "center",
    //                     alignItems: "center",
    //                   }}
    //                 >
    //                   <CustomRadio
    //                     sx={{
    //                       p: 0,
    //                     }}
    //                     customColor={item.color}
    //                     disabled={pageActions.survey_perm != 1}
    //                     checked={value == partyId}
    //                     onChange={() => handleChange(data[0], partyId)}
    //                   />
    //                 </span>
    //               </Tooltip>
    //             );
    //           },
    //         },
    //       }))
    //   : []),
    {
      name: "voter_phone_no",
      label: "Phone",
      options: {
        customBodyRender: (value, tableMeta, updateValue) => {
          return <Typography>{value ?? "-"}</Typography>;
        },
      },
    },
    ...(account.user?.desgination_name == "MLA" || account.user?.desgination_name == "Admin"
      ? [
          {
            name: "religion_name",
            label: "Religion",
          },
          {
            name: "caste_name",
            label: "Caste",
          },
          {
            name: "disability",
            label: "Disability",
            options: {
              customBodyRender: (value, tableMeta, updateValue) => {
                return value == 1 ? "Yes" : value == 0 ? "No" : "-";
              },
            },
          },
          {
            name: "govt_employee",
            label: "Govt Employee",
            options: {
              customBodyRender: (value, tableMeta, updateValue) => {
                return value == 1 ? "Yes" : value == 0 ? "No" : "-";
              },
            },
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
            name: "volunteer_id",
            label: "Volunteer",
            options: {
              display: false,
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
            name: "nr_state",
            label: "State",
          },
          {
            name: "nr_city",
            label: "City",
          },
          {
            name: "opinionparty",
            label: "Survey Flag",
            options: {
              display: false,
              customBodyRender: (value, tableMeta, updateValue) => {
                console.log("value123", value == 23 ? "Yes" : "No");
                return <Typography>{value == 23 ? "Yes" : "No"}</Typography>;
              },
            },
          },

          // {
          //   name: "opinionparty",
          //   label: "Neutral",
          //   options: {
          //     customBodyRender: (value, tableMeta, updateValue) => {
          //       var data = tableMeta.rowData;
          //       console.log("data5555", data);
          //       var partyId = PARTY_ID.NEUTRAL;
          //       return (
          //         <Tooltip title={pageActions.survey_perm != 1 ? "You don't have access to select" : ""}>
          //           <span>
          //             <NeutralRadio
          //               sx={{
          //                 p: 0,
          //               }}
          //               disabled={pageActions.survey_perm != 1}
          //               checked={value == partyId}
          //               onChange={() => {
          //                 handleChange(data[0], partyId);
          //               }}
          //             />
          //           </span>
          //         </Tooltip>
          //       );
          //     },
          //   },
          // },
          // {
          //   name: "opinionparty",
          //   label: "YCP",
          //   options: {
          //     customBodyRender: (value, tableMeta, updateValue) => {
          //       var data = tableMeta.rowData;
          //       var partyId = PARTY_ID.YSRCP;
          //       return (
          //         <Tooltip title={pageActions.survey_perm != 1 ? "You don't have access to select" : ""}>
          //           <span>
          //             <YCPRadio
          //               sx={{
          //                 p: 0,
          //               }}
          //               disabled={pageActions.survey_perm != 1}
          //               checked={value == partyId}
          //               onChange={() => handleChange(data[0], partyId)}
          //             />
          //           </span>
          //         </Tooltip>
          //       );
          //     },
          //   },
          // },
          // {
          //   name: "opinionparty",
          //   label: "TDP",
          //   options: {
          //     customBodyRender: (value, tableMeta, updateValue) => {
          //       var data = tableMeta.rowData;
          //       var partyId = PARTY_ID.TDP;
          //       return (
          //         <Tooltip title={pageActions.survey_perm != 1 ? "You don't have access to select" : ""}>
          //           <span>
          //             <TDPRadio
          //               sx={{
          //                 p: 0,
          //               }}
          //               disabled={pageActions.survey_perm != 1}
          //               checked={value == partyId}
          //               onChange={() => handleChange(data[0], partyId)}
          //             />
          //           </span>
          //         </Tooltip>
          //       );
          //     },
          //   },
          // },
          // {
          //   name: "opinionparty",
          //   label: "JSP",
          //   options: {
          //     customBodyRender: (value, tableMeta, updateValue) => {
          //       var data = tableMeta.rowData;
          //       var partyId = PARTY_ID.JANASENA;
          //       return (
          //         <Tooltip title={pageActions.survey_perm != 1 ? "You don't have access to select" : ""}>
          //           <span>
          //             <JSPRadio
          //               sx={{
          //                 p: 0,
          //               }}
          //               disabled={pageActions.survey_perm != 1}
          //               checked={value == partyId}
          //               onChange={() => handleChange(data[0], partyId)}
          //             />
          //           </span>
          //         </Tooltip>
          //       );
          //     },
          //   },
          // },
          // {
          //   name: "opinionparty",
          //   label: "Others",
          //   options: {
          //     customBodyRender: (value, tableMeta, updateValue) => {
          //       var data = tableMeta.rowData;
          //       var partyId = PARTY_ID.BJP;
          //       return (
          //         <Tooltip title={pageActions.survey_perm != 1 ? "You don't have access to select" : ""}>
          //           <span>
          //             <CongressRadio
          //               sx={{
          //                 p: 0,
          //               }}
          //               disabled={pageActions.survey_perm != 1}
          //               checked={value == partyId}
          //               onChange={() => handleChange(data[0], partyId)}
          //             />
          //           </span>
          //         </Tooltip>
          //       );
          //     },
          //   },
          // },
          // {
          //   name: "opinionparty",
          //   label: "Not Traced",
          //   options: {
          //     customBodyRender: (value, tableMeta, updateValue) => {
          //       var data = tableMeta.rowData;
          //       var partyId = PARTY_ID.CONGRESS;
          //       return (
          //         <Tooltip title={pageActions.survey_perm != 1 ? "You don't have access to select" : ""}>
          //           <span>
          //             <BJPRadio
          //               sx={{
          //                 p: 0,
          //               }}
          //               disabled={pageActions.survey_perm != 1}
          //               checked={value == partyId}
          //               onChange={() => handleChange(data[0], partyId)}
          //             />
          //           </span>
          //         </Tooltip>
          //       );
          //     },
          //   },
          // },
        ]
      : []),

    {
      name: "volunteer_name",
      label: "Volunteer",
    },
    {
      name: "volunteer_phonenumber",
      label: "Volunteer Phone",
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
      name: "surveyed_by",
      label: "Surveyed By",
    },
    {
      name: "voted_surveyby",
      label: "Voted By",
    },
    // {
    //   name: "updatedby",
    //   label: "Updated By",
    // },
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
    setRowProps: (row, dataIndex) => {
      var index = voter.data.findIndex((e) => e.voter_pkk == row[0]);
      const isCheck = voter.data[index].voted_party !== null && voter.data[index].voted_party !== false ? true : false;
      console.log("row8945612489651", voter.data[index], isCheck);
      return {
        style: {
          backgroundColor: isCheck == true ? "lightgreen" : "white",
        },
      };
    },
    elevation: 0,
    selectableRows: "none",
    responsive: "standard",
    serverSide: true,
    filter: false,
    search: false,
    download: false,
    print: false,
    viewColumns: false,

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
          handlePaginationSubmit(tableState);
          break;
        case "changeRowsPerPage":
          handlePaginationSubmit(tableState);
          break;
        default:
        // console.log("action not handled.");
        // console.log(action, tableState);
      }
    },
  };

  const handleChange = async (id, value) => {
    const volunteer_id = account.user?.user_pk;
    console.log("hulk8574744744", id, value, volunteer_id);
    var result = await changeVotedParty(id, value, volunteer_id);
    console.log("hulk8574744744", result);
    if (result) {
      showAlert({ text: `Vote ${value == 1 ? "Submited" : "Removed"}`, color: `${value == 1 ? "success" : "error"}` });
    }
  };

  const handleEdit = (data) => {
    if (isUser) {
      navigate("/user/view-ticket-history", { state: { data: data } });
    } else {
      navigate("/view-ticket-history", { state: { data: data } });
    }
  };

  const getSearchData = () => {
    var fieldname = getValues("fieldname");
    var fieldvalue = getValues("fieldvalue");

    var searchData = {
      fieldname: fieldname === "" ? null : fieldname,
      fieldvalue: fieldvalue === "" ? null : fieldvalue,
    };

    return searchData;
  };

  useImperativeHandle(ref, () => ({
    getSearchData: getSearchData,
    reset: reset,
  }));

  return (
    <>
      <AnalyticsCard names={["Total Voters", "Survey Completed", "Pending"]} values={[voter.count, voter.completed, voter.pending]} />

      <Box p={1} />

      <Card elevation={1}>
        <FormProvider methods={methods}>
          <Box p={3}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={2}>
                <RHFTextField name="fieldname" label="Search by" select>
                  {searchFields.map((item, index) => (
                    <MenuItem key={index} value={item.name}>
                      {item.label}
                    </MenuItem>
                  ))}
                </RHFTextField>
              </Grid>

              <Grid item xs={3}>
                <RHFTextField name="fieldvalue" label="Search..." />
              </Grid>

              <Grid item xs={3}>
                <Button disabled={voter.isLoading} variant="contained" onClick={() => handleSubmit()}>
                  <SearchIcon />
                </Button>
              </Grid>
            </Grid>
          </Box>
        </FormProvider>

        <Divider />

        {voter.isLoading && (
          <Box minHeight={200} display="flex" justifyContent="center" alignItems="center">
            <CircularProgress />
          </Box>
        )}

        {!voter.isLoading && (
          <>
            <CustomMuiDataTable title="Voting Poll" columns={columns} data={voter.data} options={options} />
          </>
        )}
      </Card>
    </>
  );
});

const mapStateToProps = (state) => {
  return {
    voter: state.voter,
    account: state.auth,
    common: state.common,
  };
};

export default connect(
  mapStateToProps,
  {
    showAlert,
    changeOpinionPoll,
    changeVotedParty,
    getAllVotersSurvey,
  },
  null,
  { forwardRef: true }
)(VotingPollSurveyList);
