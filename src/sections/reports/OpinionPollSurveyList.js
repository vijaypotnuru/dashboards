import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Stack, Box, CircularProgress, IconButton, Typography, Divider, TextField, Grid, MenuItem, Button } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import Tooltip from "@material-ui/core/Tooltip";
import MUIDataTable from "mui-datatables";
import { connect } from "react-redux";
import { showAlert } from "../../actions/alert";

import EditNoteIcon from "@mui/icons-material/EditNote";
import { PARTY_ID, ROWS_PER_PAGE_OPTION, getMuiTableTheme, getTicketColorByValue } from "../../constants";
import { changeOpinionPoll, getAllVotersSurvey } from "../../actions/voter";
import { BJPRadio, CongressRadio, CustomRadio, JSPRadio, NeutralRadio, OthersRadio, TDPRadio, YCPRadio } from "../common/PartyRadioButtons";
import UpdateVoterDialog from "../common/UpdateVoterDialog";
import AnalyticsCard from "../common/AnalyticsCard";
import SearchIcon from "@mui/icons-material/Search";
import { FormProvider, RHFTextField } from "../../components/hook-form";
import CustomMuiDataTable from "../../components/CustomMuiDataTable";
import i18n from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";
import DownloadExcelSheet from "../../components/DownloadExcelSheet";

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

const OpinionPollSurveyList = forwardRef(({ isUser, voter, common, account, showAlert, changeOpinionPoll, handleSubmit, handlePaginationSubmit, getTableVotersData }, ref) => {
  const [showpopup, setShowpopup] = useState(false);

  const userPermission = account.user && account.user.permissions ? account.user.permissions : [];
  const pageActions = userPermission.filter((p) => p.page_id === 114)[0];
  console.log("pageActions12", pageActions);
  // inside your component
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

  const columns = [
    {
      name: "voter_pkk",
      label: "Survey",
      options: {
        customBodyRender: (value, tableMeta, updateValue) => {
          // console.log("tableMeta", tableMeta.rowData[18])
          // console.log("value", value)

          var index = voter.data.findIndex((e) => e.voter_pkk == value);
          const isActive = voter.data[index].opinionparty !== null ? true : false;

          // console.log("voter.data[index]", voter.data[index]);
          return (
            <Stack direction="row" spacing={1}>
              <UpdateVoterDialog voterData={voter.data[index]} isActive={isActive} pageActions={pageActions} />

              {voter.data[index].opinionparty == PARTY_ID.NEUTRAL && (
                <Tooltip title={pageActions.survey_perm != 1 ? "You don't have access to create" : ""}>
                  <span>
                    <IconButton
                      disabled={pageActions.survey_perm != 1}
                      onClick={() => handleEdit(voter.data[index])}
                      sx={{
                        p: 0,
                        color: getTicketColorByValue(voter.data[index]?.status_id),
                      }}
                    >
                      <EditNoteIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
            </Stack>
          );
        },
      },
    },
    {
      name: "part_no",
      label: "Asembly",
    },
    {
      name: "part_slno",
      label: "Mandal",
    },
    {
      name: "voter_id",
      label: "Booth No",
    },
    // {
    //   name: "voter_name",
    //   label: "Voter Name",
    //   options: {
    //     setCellProps: () => ({ style: { minWidth: "200px" } }),
    //     customBodyRender: (value, tableMeta, updateValue) => {
    //       var data = tableMeta.rowData;
    //       console.log("hulk", t("John Doe"));

    //       return <Typography>{value}</Typography>;
    //     },
    //   },
    // },
    // {
    //   name: "guardian_type",
    //   label: "Guardian",
    // },
    // {
    //   name: "guardian_name",
    //   label: "Guardian Name",
    //   options: {
    //     setCellProps: () => ({ style: { minWidth: "200px" } }),
    //   },
    // },
    // {
    //   name: "gender_type",
    //   label: "Gender",
    // },
    // {
    //   name: "voter_age",
    //   label: "Age",
    // },
    // {
    //   name: "permenent_address",
    //   label: "Permanent Address",
    //   options: {
    //     setCellProps: () => ({ style: { minWidth: "200px" } }),
    //   },
    // },
    // ...(account.user?.desgination_name == "MLA" || account.user?.desgination_name == "Admin"
    //   ? [
    //     {
    //       name: "voter_phone_no",
    //       label: "Phone",
    //       options: {
    //         customBodyRender: (value, tableMeta, updateValue) => {
    //           return <Typography>{value ?? "-"}</Typography>;
    //         },
    //       },
    //     },
    //     {
    //       name: "religion_name",
    //       label: "Religion",
    //     },
    //     {
    //       name: "category_id",
    //       label: "Category",
    //       options: {
    //         customBodyRender: (value, tableMeta, updateValue) => {
    //           const category = common.newCategory.filter((item) => item.value == value)[0];
    //           console.log("category123", category);
    //           return category?.label ?? "-";
    //         },
    //       },
    //     },
    //     {
    //       name: "caste_name",
    //       label: "Caste",
    //     },
    //     {
    //       name: "voter_type",
    //       label: "Voter Type",
    //       options: {
    //         customBodyRender: (value, tableMeta, updateValue) => {
    //           const voterTypeName = common.voterTypes.filter((item) => item.value == value)[0];

    //           console.log("voterTypeName", voterTypeName);

    //           return voterTypeName?.label ?? "-";
    //         },
    //       },
    //     },
    //     {
    //       name: "disability",
    //       label: "Disability",
    //       options: {
    //         customBodyRender: (value, tableMeta, updateValue) => {
    //           return value == 1 ? "Yes" : value == 0 ? "No" : "-";
    //         },
    //       },
    //     },
    //     {
    //       name: "govt_employee",
    //       label: "Govt Employee",
    //       options: {
    //         customBodyRender: (value, tableMeta, updateValue) => {
    //           return value == 1 ? "Yes" : value == 0 ? "No" : "-";
    //         },
    //       },
    //     },
    //     {
    //       name: "is_resident",
    //       label: "Residential",
    //       options: {
    //         customBodyRender: (value, tableMeta, updateValue) => {
    //           return value == 1 ? "Yes" : value == 0 ? "No" : "-";
    //         },
    //       },
    //     },
    //     {
    //       name: "volunteer_id",
    //       label: "Volunteer",
    //       options: {
    //         display: false,
    //       },
    //     },

    //     {
    //       name: "current_address",
    //       label: "Current Address",
    //       options: {
    //         setCellProps: () => ({ style: { minWidth: "200px" } }),
    //       },
    //     },
    //     {
    //       name: "nr_state",
    //       label: "State",
    //     },
    //     {
    //       name: "nr_city",
    //       label: "City",
    //     },
    //     ...(common.parties
    //       ? common.parties.map((item, index) => ({
    //         name: "opinionparty",
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
    //       : []),
    //     // {
    //     //   name: "opinionparty",
    //     //   label: "Neutral",
    //     //   options: {
    //     //     customBodyRender: (value, tableMeta, updateValue) => {
    //     //       var data = tableMeta.rowData;
    //     //       var partyId = PARTY_ID.NEUTRAL;
    //     //       return (
    //     //         <Tooltip title={pageActions.survey_perm != 1 ? "You don't have access to select" : ""}>
    //     //           <span>
    //     //             <NeutralRadio
    //     //               sx={{
    //     //                 p: 0,
    //     //               }}
    //     //               disabled={pageActions.survey_perm != 1}
    //     //               checked={value == partyId}
    //     //               onChange={() => {
    //     //                 handleChange(data[0], partyId);
    //     //               }}
    //     //             />
    //     //           </span>
    //     //         </Tooltip>
    //     //       );
    //     //     },
    //     //   },
    //     // },

    //     // {
    //     //   name: "opinionparty",
    //     //   label: "YCP",
    //     //   options: {
    //     //     customBodyRender: (value, tableMeta, updateValue) => {
    //     //       var data = tableMeta.rowData;
    //     //       var partyId = PARTY_ID.YSRCP;
    //     //       return (
    //     //         <Tooltip title={pageActions.survey_perm != 1 ? "You don't have access to select" : ""}>
    //     //           <span>
    //     //             <YCPRadio
    //     //               sx={{
    //     //                 p: 0,
    //     //               }}
    //     //               disabled={pageActions.survey_perm != 1}
    //     //               checked={value == partyId}
    //     //               onChange={() => handleChange(data[0], partyId)}
    //     //             />
    //     //           </span>
    //     //         </Tooltip>
    //     //       );
    //     //     },
    //     //   },
    //     // },
    //     // {
    //     //   name: "opinionparty",
    //     //   label: "TDP",
    //     //   options: {
    //     //     customBodyRender: (value, tableMeta, updateValue) => {
    //     //       var data = tableMeta.rowData;
    //     //       var partyId = PARTY_ID.TDP;
    //     //       return (
    //     //         <Tooltip title={pageActions.survey_perm != 1 ? "You don't have access to select" : ""}>
    //     //           <span>
    //     //             <TDPRadio
    //     //               sx={{
    //     //                 p: 0,
    //     //               }}
    //     //               disabled={pageActions.survey_perm != 1}
    //     //               checked={value == partyId}
    //     //               onChange={() => handleChange(data[0], partyId)}
    //     //             />
    //     //           </span>
    //     //         </Tooltip>
    //     //       );
    //     //     },
    //     //   },
    //     // },
    //     // {
    //     //   name: "opinionparty",
    //     //   label: "JSP",
    //     //   options: {
    //     //     customBodyRender: (value, tableMeta, updateValue) => {
    //     //       var data = tableMeta.rowData;
    //     //       var partyId = PARTY_ID.JANASENA;
    //     //       return (
    //     //         <Tooltip title={pageActions.survey_perm != 1 ? "You don't have access to select" : ""}>
    //     //           <span>
    //     //             <JSPRadio
    //     //               sx={{
    //     //                 p: 0,
    //     //               }}
    //     //               disabled={pageActions.survey_perm != 1}
    //     //               checked={value == partyId}
    //     //               onChange={() => handleChange(data[0], partyId)}
    //     //             />
    //     //           </span>
    //     //         </Tooltip>
    //     //       );
    //     //     },
    //     //   },
    //     // },
    //     // {
    //     //   name: "opinionparty",
    //     //   label: "Others",
    //     //   options: {
    //     //     customBodyRender: (value, tableMeta, updateValue) => {
    //     //       var data = tableMeta.rowData;
    //     //       var partyId = PARTY_ID.BJP;
    //     //       return (
    //     //         <Tooltip title={pageActions.survey_perm != 1 ? "You don't have access to select" : ""}>
    //     //           <span>
    //     //             <CongressRadio
    //     //               sx={{
    //     //                 p: 0,
    //     //               }}
    //     //               disabled={pageActions.survey_perm != 1}
    //     //               checked={value == partyId}
    //     //               onChange={() => handleChange(data[0], partyId)}
    //     //             />
    //     //           </span>
    //     //         </Tooltip>
    //     //       );
    //     //     },
    //     //   },
    //     // },
    //     // {
    //     //   name: "opinionparty",
    //     //   label: "Not Traced",
    //     //   options: {
    //     //     customBodyRender: (value, tableMeta, updateValue) => {
    //     //       var data = tableMeta.rowData;
    //     //       var partyId = PARTY_ID.CONGRESS;
    //     //       return (
    //     //         <Tooltip title={pageActions.survey_perm != 1 ? "You don't have access to select" : ""}>
    //     //           <span>
    //     //             <BJPRadio
    //     //               sx={{
    //     //                 p: 0,
    //     //               }}
    //     //               disabled={pageActions.survey_perm != 1}
    //     //               checked={value == partyId}
    //     //               onChange={() => handleChange(data[0], partyId)}
    //     //             />
    //     //           </span>
    //     //         </Tooltip>
    //     //       );
    //     //     },
    //     //   },
    //     // },
    //   ]
    //   : []),

    // {
    //   name: "volunteer_name",
    //   label: "Volunteer",
    // },
    // {
    //   name: "volunteer_phonenumber",
    //   label: "Volunteer Phone",
    // },
    // {
    //   name: "surveyed_by",
    //   label: "Surveyed By",
    // },
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
    elevation: 0,
    selectableRows: "none",
    responsive: "standard",
    serverSide: true,
    filter: false,
    search: false,
    download: true,
    print: false,
    viewColumns: false,
    downloadOptions: {
      filename: "opinion-poll-survey.csv",
      separator: ",",
    },

    onDownload: (buildHead, buildBody, columns, data) => {
      // console.log("buildHead", data);
      // const tableData = data;

      // let fetchVoterTableData = [];

      // const fetchTableVotersData = async () => {
      //   fetchVoterTableData = await getTableVotersData();
      //   console.log("fetchVoterTableData", fetchVoterTableData);
      // };

      // await fetchTableVotersData();
      // console.log("fetch start");
      // await delay(5000);
      // console.log("fetch end");

      // buildBody = () => {
      //   const tableData = data.map((row, index) => {
      //     const party = common.parties.filter((item) => item.value == row.data[22]);
      //     console.log("party12354648789", party, row.data);
      //     const category = common.newCategory.filter((item) => item.value == row.data[12]);
      //     console.log("category123", category);

      //     const voterType = common.voterTypes.filter((item) => item.value == row.data[14]);

      //     return [
      //       index + 1,
      //       row.data[1],
      //       row.data[2],
      //       row.data[3],
      //       row.data[4],
      //       row.data[5],
      //       row.data[6],
      //       row.data[7],
      //       row.data[8],
      //       ` ${row.data[9]} `,
      //       row.data[10],
      //       row.data[11],
      //       category[0]?.label ?? "-",
      //       row.data[13],
      //       voterType[0]?.label ?? "-",
      //       row.data[15] == 1 ? "Yes" : row.data[15] == 0 ? "No" : "-",
      //       row.data[16] == 1 ? "Yes" : row.data[16] == 0 ? "No" : "-",
      //       row.data[17] == 1 ? "Yes" : row.data[17] == 0 ? "No" : "-",
      //       row.data[19],
      //       row.data[20],
      //       row.data[21],
      //       party[0]?.label ?? "-",
      //       row.data[30],
      //     ];
      //   });

      //   return tableData;
      //   // return [["gu", "king", "hihih"]];
      // };
      // const csvHead = await buildHead().join(",");
      // const csvBody = buildBody()
      //   .map((row) => row.join(","))
      //   .join("\n");
      // return "\uFEFF" + csvHead + "\n" + csvBody;
      setShowpopup(true);
      return false;
    },

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
      console.log("action123", action, tableState);
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
    var result = await changeOpinionPoll(id, value, volunteer_id);
    if (result) {
      showAlert({ text: "Opinion Submitted", color: "success" });
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


      <Box p={1} />

      <Card elevation={1}>


        <Divider />

        {voter.isLoading && (
          <Box minHeight={200} display="flex" justifyContent="center" alignItems="center">
            <CircularProgress />
          </Box>
        )}

        {!voter.isLoading && (
          <>
            <CustomMuiDataTable title="" columns={columns} data={voter.data} options={options} />
          </>
        )}
      </Card>

      <DownloadExcelSheet common={common} showpopup={showpopup} getTableVotersData={getTableVotersData} handleClose={() => setShowpopup(false)} />
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
    getAllVotersSurvey,
  },
  null,
  { forwardRef: true }
)(OpinionPollSurveyList);
