import { Box, Container, Typography, Breadcrumbs, Link } from "@mui/material";
import Page from "../components/Page";
import { connect } from "react-redux";
import VotingPollSurveyReportsList from "../sections/reports/VotingPollSurveyReportsList";

function VotingPollSurveyReportsPage({ account }) {
  const userPermission = account.user && account.user.permissions ? account.user.permissions : [];
  const pageActions = userPermission.filter((p) => p.page_id === 205)[0];

  return (
    <Page title={pageActions.pagename}>
      <Container maxWidth="xl">
        <Box mb={1}>
          {/* <Typography variant="h4" gutterBottom>
            Opinion Survey Reports
          </Typography> */}
        </Box>

        <VotingPollSurveyReportsList />
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

export default connect(mapStateToProps, {})(VotingPollSurveyReportsPage);
