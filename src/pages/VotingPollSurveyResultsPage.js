import { Box, Container, Typography, Breadcrumbs, Link } from "@mui/material";
import Page from "../components/Page";
import Iconify from "../components/Iconify";
import SurveyReportsList from "../sections/reports/SurveyReportsList";
import VotingPollSurveyResultsList from "../sections/reports/VotingPollSurveyResultsList";
import { connect } from "react-redux";

function SurveyReportsPage({ account }) {
  const userPermission = account.user && account.user.permissions ? account.user.permissions : [];
  const pageActions = userPermission.filter((p) => p.page_id === 177)[0];
  return (
    <Page title={pageActions.pagename}>
      <Container maxWidth="xl">
        <Box mb={1}>
          {/* <Typography variant="h4" gutterBottom>
            Opinion Survey Reports
          </Typography> */}
        </Box>

        <VotingPollSurveyResultsList />
      </Container>
    </Page>
  );
}

const mapStateToProps = (state) => {
  return {
    common: state.common,
    account: state.auth,
  };
};

export default connect(mapStateToProps, {})(SurveyReportsPage);
