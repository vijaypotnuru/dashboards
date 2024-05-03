import { Grid, Container, Typography, Box, TextField, Card, MenuItem } from "@mui/material";
import Page from "../components/Page";
import { connect } from "react-redux";
import { LoadingButton } from "@mui/lab";
import ViewUsersList from "../sections/reports/ViewUsersList";
import Button from "@mui/material/Button";
import { useCallback, useEffect, useRef, useState } from "react";
import SearchByFilter from "../sections/common/SearchByFilter";
import { searchFiltercolor } from "../constants";
import { clearUserReducer, getAllUsers } from "../actions/user";
import { UncontrolledTextField } from "../components/hook-form/RHFTextField";
import { RHFAutoComplete } from "../components/hook-form";

const ViewUserPage = ({ account, common, clearUserReducer, getAllUsers }) => {
  const userPermission = account.user && account.user.permissions ? account.user.permissions : [];
  const pageActions = userPermission.filter((p) => p.page_id === 135)[0];

  const [designation, setDesignation] = useState(null);

  useEffect(() => {
    clearUserReducer();
  }, []);

  const handleSubmit = async (filterValues) => {
    console.log("filterValudsadadades", filterValues);

    var values = {
      // username: account.user.username,
      ...filterValues,
      designation_id: designation?.value ?? null,
    };

    console.log("valdasddasdadasues", values);

    await getAllUsers(values);
  };

  // console.log("account", account);

  let isClearActive = designation != null;

  return (
    <Page title={pageActions.pagename}>
      <Container maxWidth="xl">
        <Card sx={{ p: 3, backgroundColor: searchFiltercolor }}>
          <Grid container spacing={2} alignItems="center">
            <SearchByFilter
              isClearActive={isClearActive}
              showDistrict={true}
              showOtherFilters={false}
              showVillage={false}
              showSurveyedBy={false}
              onSubmit={handleSubmit}
              onReset={() => setDesignation(null)}
              children={
                <Grid item xs={12} md={6} lg={2}>
                  <RHFAutoComplete
                    name="designation_id"
                    label="Select Designation*"
                    options={common?.designation}
                    value={designation}
                    onChange={(e, value) => {
                      setDesignation(value);
                    }}
                  />
                </Grid>
              }
            />

            {/* <Grid item xs={12} md={6} lg={2}>
              <RHFAutoComplete
                name="voter_id"
                label="Voter ID"

                // disabled={account.user.part_no != null}
              />
            </Grid> */}

            {/* <Grid item xs={12} md={6} lg={2}>
              <RHFAutoComplete
                name="voter_name"
                label="Voter Name"

                // disabled={account.user.part_no != null}
              />
            </Grid> */}
          </Grid>
        </Card>

        <Box p={1} />

        <ViewUsersList />
      </Container>
    </Page>
  );
};

const mapStateToProps = (state) => {
  return { account: state.auth, common: state.common };
};

export default connect(mapStateToProps, { clearUserReducer, getAllUsers })(ViewUserPage);
