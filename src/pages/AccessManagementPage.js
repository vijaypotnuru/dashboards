import React from "react";
import Page from "../components/Page";
import { Box, Container, Typography } from "@mui/material";
import AccessMangementList from "../sections/reports/AccessMangementList";
import { LoadingButton } from "@mui/lab";

import { connect } from "react-redux";

const AccessManagementPage = ({ account }) => {
  const userPermission = account.user && account.user.permissions ? account.user.permissions : [];
  const pageActions = userPermission.filter((p) => p.page_id === 137)[0];
  return (
    <Page title={pageActions.pagename}>
      <Container maxWidth="xl">
        <AccessMangementList />
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

export default connect(mapStateToProps, {})(AccessManagementPage);
