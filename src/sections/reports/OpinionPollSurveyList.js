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

const OpinionPollSurveyList = forwardRef(({ isUser, voter, common, account, showAlert, changeOpinionPoll, handleSubmit, handlePaginationSubmit, getTableVotersData, pollResultsData, isLoading }, ref) => {
  const [showpopup, setShowpopup] = useState(false);
  console.log("pollResultsData55555555555555", pollResultsData);
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
      name: "assembly",
      label: "Asembly",
      
    },
    {
      name: "mandal",
      label: "Mandal",
    },
    {
      name: "booth",
      label: "Booth No",
    },
    {
      name: "ysrcp",
      label: "YSRCP",
    }
    ,
    {
      name: "tdpjspbjp",
      label: "TDP-JSP-BJP",
    }
    ,
    {
      name: "inc",
      label: "INC",
    }
    ,
    {
      name: "others",
      label: "Others",
    }
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

        {isLoading && (
          <Box minHeight={200} display="flex" justifyContent="center" alignItems="center">
            <CircularProgress />
          </Box>
        )}

        {!isLoading && (
          <>
            <CustomMuiDataTable title="" columns={columns} data={pollResultsData ?? []} options={options} />
          </>
        )}
      </Card>

      {/* <DownloadExcelSheet common={common} showpopup={showpopup} getTableVotersData={getTableVotersData} handleClose={() => setShowpopup(false)} /> */}
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
