import { useCallback, useEffect, useRef, useState } from "react";
import { Grid, Container, Typography, Box, TextField, Card, MenuItem } from "@mui/material";
import Page from "../components/Page";
import { connect } from "react-redux";
import { LoadingButton } from "@mui/lab";

import UserMappingList from "../sections/reports/UserMappingList";
import Button from "@mui/material/Button";
import SearchByFilter from "../sections/common/SearchByFilter";
import { searchFiltercolor } from "../constants";
import { getAllUsers, clearUserReducer } from "../actions/user";
import { RHFAutoComplete } from "../components/hook-form";
import { fi } from "date-fns/esm/locale";
import { useLocation } from "react-router-dom";
import { UncontrolledTextField } from "../components/hook-form/RHFTextField";

const UserMappingPage = ({ account, common, clearUserReducer, getAllUsers }) => {
  const userPermission = account.user && account.user.permissions ? account.user.permissions : [];
  const pageActions = userPermission.filter((p) => p.page_id === 138)[0];

  const [designation, setDesignation] = useState(null);
  const [filterValues, setFilterValues] = useState(null);

  useEffect(() => {
    clearUserReducer();
  }, []);

  const handleSubmit = async (data) => {
    var values = { designation_id: designation?.value ?? null, ...data };
    await getAllUsers(values);
    setFilterValues(data);
  };

  let isClearActive = designation != null;

  return (
    <Page title={pageActions.pagename}>
      <Container maxWidth="xl">
        <Card sx={{ p: 3, backgroundColor: searchFiltercolor }}>
          <Grid container spacing={2} alignItems="center">
            <SearchByFilter
              isClearActive={isClearActive}
              showDistrict={true}
              showPartNo={false}
              showVillage={false}
              showOtherFilters={false}
              // onChange={handleChange}
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
          </Grid>
        </Card>

        <Box p={1} />

        <UserMappingList filterValues={filterValues} />
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

export default connect(mapStateToProps, { clearUserReducer, getAllUsers })(UserMappingPage);
