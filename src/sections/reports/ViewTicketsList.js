import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Card, Stack, Grid, Switch, Divider, Box, Chip, TextField, MenuItem, IconButton, CircularProgress } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import { connect } from "react-redux";
import { showAlert } from "../../actions/alert";
import EditNoteIcon from "@mui/icons-material/EditNote";
import { ThemeProvider } from "@mui/material/styles";
import { LIMIT_PER_PAGE, ROWS_PER_PAGE_OPTION, getTicketStatusById } from "../../constants";
import Tooltip from "@material-ui/core/Tooltip";
import { checkOrUncheckTicket } from "../../actions/ticket";
import AnalyticsCard from "../common/AnalyticsCard";
import { fToNow } from "../../utils/formatTime";
import CustomMuiDataTable from "../../components/CustomMuiDataTable";
import ApiServices from "../../services/apiservices";
import NewReleasesIcon from "@mui/icons-material/NewReleases";

const ViewTicketsList = ({ isUser, common, ticket, showAlert, checkOrUncheckTicket, account, handlePaginationSubmit }) => {
  const userPermission = account.user && account.user.permissions ? account.user.permissions : [];
  const pageActions = userPermission.filter((p) => p.page_id === 140)[0];
  console.log("pageActions1", pageActions);

  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState({
    status_id: "",
    next_level_user: "",
  });

  console.log("ticketdsdsdsd.data", ticket.data);

  const columns = [
    {
      name: "isCheck",
      label: "Select",
      options: {
        customBodyRender: (value, tableMeta, updateValue) => {
          var data = tableMeta.rowData;
          return <Checkbox checked={value ?? false} onChange={(e) => checkOrUncheckTicket(data[1], e.target.checked)} />;
        },
      },
    },
    {
      name: "ticket_master_pk",
      label: "Ticket ID",
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
    },
    {
      name: "navaratnalu_name",
      label: "Navaratnalu Name",
    },
    {
      name: "reason",
      label: "Description/Reason",
    },
    {
      name: "status_id",
      label: "Status",
      options: {
        customBodyRender: (value, tableMeta, updateValue) => {
          const data = tableMeta.rowData;
          console.log("datdsasdasda", data[9], value);

          return (
            <Typography
              sx={{
                display: "flex",
              }}
            >
              {getTicketStatusById(value)}
              {data[9] != 23 && value == 2 ? (
                <>
                  <Tooltip title={"This voter did not vote for the YSRCP party"}>
                    <NewReleasesIcon
                      sx={{
                        color: "#f44336",
                        fontSize: "1.5rem",
                        marginLeft: "5px",
                      }}
                    />
                  </Tooltip>
                </>
              ) : (
                ""
              )}
            </Typography>
          );
        },
      },
    },
    {
      name: "createdon",
      label: "Pending",
      options: {
        customBodyRender: (value, tableMeta, updateValue) => {
          var data = tableMeta.rowData;
          return data[6] == 1 ? fToNow(value) : "-";
        },
      },
    },
    {
      name: "createdby_name",
      label: "Created By",
    },
    {
      name: "ticket_master_pk",
      label: "Action",
      options: {
        customBodyRender: (value, tableMeta, updateValue) => {
          var index = ticket.data.findIndex((e) => e.ticket_master_pk == value);

          return (
            <Tooltip title={pageActions.edit_perm != 1 ? "You don't have access to edit" : ""}>
              <span>
                <IconButton onClick={() => handleEdit(ticket.data[index])} disabled={pageActions.edit_perm != 1}>
                  <EditNoteIcon />
                </IconButton>
              </span>
            </Tooltip>
          );
        },
      },
    },
    {
      name: "intrested_party",
      label: "Intrested Party",
      options: {
        display: false,
      },
    },
  ];

  const options = {
    elevation: 0,
    selectableRows: "none",
    responsive: "standard",
    serverSide: true,
    download: false,
    print: false,
    viewColumns: false,
    filter: false,
    // rowsPerPage: LIMIT_PER_PAGE,
    // rowsPerPageOptions: ROWS_PER_PAGE_OPTION,
    ...(account.user?.desgination_name != "MLA" && {
      filter: false,
      search: false,
      download: false,
      print: false,
      viewColumns: false,
    }),
    count: ticket.count,
    page: ticket.page,
    rowsPerPage: ticket.limit,
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

  const handleEdit = (data) => {
    if (isUser) {
      navigate(`/user/view-ticket-history`, {
        state: {
          data: data,
        },
      });
    } else {
      navigate(`/view-ticket-history`, {
        state: {
          data: data,
        },
      });
    }
  };

  // const handleSubmit = async () => {
  //   const requestBody = {
  //     ticketMasterPKList: selectedValues.ticketList,
  //     status_id: selectedValues.status_id,
  //   };
  //   console.log("requestBody", requestBody);
  //   try {
  //     setLoading(true);
  // await ApiServices.putRequest(updateTicketStatusRoute, requestBody);
  //     showAlert({
  //       text: "Ticket status updated successfully",
  //       color: "success",
  //     });
  //     setLoading(false);
  //     setSelectedValues((state) => ({
  //       ...state,
  //       ticketList: [],
  //       status_id: "",
  //     }));
  //     setRefresh((state) => !state);
  //   } catch (error) {
  //     console.log(error);
  //     showAlert({ text: "Something went wrong" });
  //     setLoading(false);
  //     setRefresh((state) => !state);
  //   }
  // };

  return (
    <>
      <AnalyticsCard names={["Total", "Open", "Resolved", "Cancelled", "Escalated"]} values={[ticket.analytics?.count, ticket.analytics?.open, ticket.analytics?.resolved, ticket.analytics?.cancelled, ticket.analytics?.escalated]} />

      <Box p={1} />

      <Card elevation={1}>
        {ticket.isLoading && (
          <Box minHeight={200} display="flex" justifyContent="center" alignItems="center">
            <CircularProgress />
          </Box>
        )}

        {!ticket.isLoading && (
          <>
            {/* <Box p={4}>
              <Grid container spacing={2} sx={{ justifyContent: "space-between" }}>
                <Grid item xs={12} md={6} lg={3}>
                  <Stack direction="row" spacing={2}>
                    <UncontrolledTextField
                      name="status_id"
                      label="Ticket Status"
                      select
                      value={formValues.status_id}
                      onChange={(e) => {
                        setFormValues((state) => ({
                          ...state,
                          status_id: e.target.value,
                        }));
                      }}
                    >
                      {common.ticket.map((item, index) => (
                        <MenuItem key={index} value={item.value}>
                          {item.label}
                        </MenuItem>
                      ))}
                    </UncontrolledTextField>

                    <LoadingButton
                      variant="contained"
                      isLoading={isLoading}
                      // onClick={handleSubmit}
                      disabled={ticket.data.filter((e) => e.isCheck == true).length <= 0}
                    >
                      Submit
                    </LoadingButton>
                  </Stack>
                </Grid>

                <Grid item xs={12} md={6} lg={3}>
                  <Stack direction="row" spacing={2}>
                    <UncontrolledTextField name="next_level_user" label="Next Level User" fullWidth select>
                      {[].map((item, index) => (
                        <MenuItem key={index} value={item.user_pk}>
                          {item.user_displayname}
                        </MenuItem>
                      ))}
                    </UncontrolledTextField>

                    <LoadingButton variant="contained">Escalate</LoadingButton>
                  </Stack>
                </Grid>
              </Grid>
            </Box>

            <Divider /> */}

            <CustomMuiDataTable title="Tickets List" columns={columns} data={ticket.data} options={options} />
          </>
        )}
      </Card>
    </>
  );
};

const mapStateToProps = (state) => {
  return {
    common: state.common,
    ticket: state.ticket,
    account: state.auth,
  };
};

export default connect(mapStateToProps, {
  showAlert,
  checkOrUncheckTicket,
})(ViewTicketsList);
