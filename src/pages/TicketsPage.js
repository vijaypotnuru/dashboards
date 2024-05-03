import { useRef, useState } from "react";
import { Grid, Container, Typography, Box, TextField, Card, MenuItem } from "@mui/material";
import Page from "../components/Page";
import { connect } from "react-redux";
import ViewTicketsList from "../sections/reports/ViewTicketsList";
import SearchByFilter from "../sections/common/SearchByFilter";
import { searchFiltercolor } from "../constants";
import { UncontrolledTextField } from "../components/hook-form/RHFTextField";
import { getAllTickets } from "../actions/ticket";
import { is } from "date-fns/locale";
import { RHFAutoComplete } from "../components/hook-form";

const TicketsPage = ({ isUser, common, getAllTickets, account }) => {
  const userPermission = account.user && account.user.permissions ? account.user.permissions : [];
  const pageActions = userPermission.filter((p) => p.page_id === 140)[0];

  const filterRef = useRef(null);
  const searchRef = useRef(null);
  const [navaratnaluId, setNavaratnaluId] = useState("");
  const [ticketStatus, setTicketStatus] = useState("");
  const [ticketType, setTicketType] = useState("");

  const [filterValues, setFilterValues] = useState(null);

  const handleSubmit = async (data) => {
    var values = {
      status_id: ticketStatus.value != "" ? ticketStatus?.value ?? null : null,
      navaratnalu_id: navaratnaluId.value != "" ? navaratnaluId?.value ?? null : null,
      ticket_type: ticketType.value != "" ? ticketType?.value ?? null : null,
      ...data,
    };

    console.log("submit48651320", values);
    await getAllTickets(values);
    setFilterValues(values);
  };

  const handleSearchSubmit = () => {
    filterRef.current.submit();
  };

  const handlePaginationSubmit = async (tableState) => {
    await getAllTickets(filterValues, tableState?.page, tableState?.rowsPerPage);
  };

  const handleReset = () => {
    setNavaratnaluId("");
    setTicketStatus("");
    setTicketType("");
  };

  let isClearActive = navaratnaluId != "" || ticketStatus != "" || ticketType != "";

  console.log("ticketStdasdadsaatus", ticketStatus);
  console.log("navaratnaludasdsdId", navaratnaluId);
  return (
    <Page title={pageActions.pagename}>
      <Container maxWidth="xl">
        <Card sx={{ p: 3, backgroundColor: searchFiltercolor }}>
          <Grid container spacing={2} alignItems="center">
            <SearchByFilter
              ref={filterRef}
              isClearActive={isClearActive}
              showVillage={false}
              onSubmit={handleSubmit}
              onReset={handleReset}
              children={
                <>
                  <Grid item xs={12} md={6} lg={2}>
                    <RHFAutoComplete
                      name="navaratnalu_id"
                      label="Select Navaratnalu"
                      options={common.navaratnalu.map((item) => ({ value: item.navaratnalu_pk, label: item.navaratnalu_name }))}
                      value={navaratnaluId}
                      onChange={(e, value) => {
                        console.log("valudasdasdasde", value);
                        setNavaratnaluId(value);
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6} lg={2}>
                    <RHFAutoComplete
                      name="ticket_status"
                      label="Ticket Status"
                      options={common.ticket}
                      value={ticketStatus}
                      onChange={(e, value) => {
                        setTicketStatus(value);
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6} lg={2}>
                    <RHFAutoComplete
                      name="ticket_type"
                      label="Ticket Type"
                      options={[
                        { value: "survey", label: "Survey" },
                        { value: "voting", label: "Voting" },
                      ]}
                      value={ticketType}
                      onChange={(e, value) => {
                        setTicketType(value);
                      }}
                    />
                  </Grid>
                </>
              }
            />
          </Grid>
        </Card>

        <Box p={1} />

        <ViewTicketsList isUser={isUser} ref={searchRef} handleSubmit={handleSearchSubmit} handlePaginationSubmit={handlePaginationSubmit} />
      </Container>
    </Page>
  );
};

const mapStateToProps = (state) => {
  return {
    common: state.common,
    account: state.auth,
  };
};

export default connect(mapStateToProps, { getAllTickets })(TicketsPage);
