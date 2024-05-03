import { useEffect, useState, useRef, useCallback } from "react";
import { Typography, Card, Stack, Grid, Switch, Divider, Box, CircularProgress, TextField, TableContainer, Table, TableRow, TableBody, TableHead, TableCell, TableFooter, Paper, Link } from "@mui/material";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { connect } from "react-redux";
import { showAlert } from "../../actions/alert";
import { LoadingButton } from "@mui/lab";
import SearchByFilter from "../common/SearchByFilter";
import { getOpinionResults, clearDashboardReducer, getSurveyResultsByDivision, getSurveyResultsBySachivalyam, getSurveyResultsByParts } from "../../actions/dashboard";
import { BarChartWidget } from "../common";
import { BJPColor, CONGRESSColor, DEATHColor, JSPColor, NETURALColor, NOTTRACEDColor, OTHERColor, TDPColor, YSRCPColor } from "../../utils/constants";
import { searchFiltercolor } from "../../constants";
import { useLocation } from "react-router-dom";
import { RHFAutoComplete } from "../../components/hook-form";
import { da } from "date-fns/locale";

const SurveyReportsList = ({ dashboard, getOpinionResults, clearDashboardReducer, account, common }) => {
  const [filterValues, setFilterValues] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [reset, setReset] = useState(false);

  const filterRef = useRef(null);
  const searchRef = useRef(null);

  const [otherFilterValues, setOtherFilterValues] = useState({
    intrested_party: null,
    is_resident: null,
  });
  let location = useLocation();
  const buttonRef = useRef();

  const [divTitle, setDivTitle] = useState("");
  const [isDivLoading, setDivLoading] = useState(false);
  const [resultDivisions, setResultDivisions] = useState(null);

  const [sachiTitle, setSachiTitle] = useState("");
  const [isSachiLoading, setSachiLoading] = useState(false);
  const [resultSachivalyams, setResultSachivalyams] = useState(null);

  const [partsTitle, setPartsTitle] = useState("");
  const [isPartsLoading, setPartsLoading] = useState(false);
  const [resultParts, setResultParts] = useState(null);

  useEffect(() => {
    clearDashboardReducer();
  }, []);

  const handleSubmit = async (filterValues) => {
    const jsonData = {
      ...filterValues,
      intrested_party: otherFilterValues.intrested_party?.value ?? null,
      is_resident: otherFilterValues.is_resident?.value ?? null,
    };

    setFilterValues(jsonData);

    await getOpinionResults(jsonData);
    setResultDivisions(null);
    setResultSachivalyams(null);
    setResultParts(null);

    if (account?.user.mandal_pk != null && account?.user.division_pk == null && account?.user.sachivalayam_pk == null) {
      handleDivisionList({ ...jsonData, mandal_pk: account?.user.mandal_pk, mandal_name: account?.user.mandal_name });
    }

    if (account?.user.mandal_pk != null && account?.user.division_pk != null && account?.user.sachivalayam_pk == null) {
      handleSachivalayamList({ ...jsonData, division_pk: account?.user.division_pk, division_name: account?.user.division_name });
    }

    if (account?.user.mandal_pk != null && account?.user.division_pk != null && account?.user.sachivalayam_pk != null) {
      handlePartList({ ...jsonData, sachivalayam_pk: account?.user.sachivalayam_pk, sachivalayam_name: account?.user.sachivalayam_name });
    }
  };

  const handleDivisionList = async (data) => {
    console.log("data777777777", data);
    const jsonData = {
      ...filterValues,
      mandal_id: data.mandal_pk,
      ...data,
    };

    setDivLoading(true);
    var result = await getSurveyResultsByDivision(jsonData);
    setDivTitle(data.mandal_name);
    setResultDivisions(result);
    setResultSachivalyams(null);
    setResultParts(null);
    setDivLoading(false);
  };

  const handleSachivalayamList = async (data) => {
    const jsonData = {
      ...filterValues,
      division_id: data.division_pk,
      ...data,
    };

    setSachiLoading(true);
    var result = await getSurveyResultsBySachivalyam(jsonData);
    setSachiTitle(data.division_name);
    setResultSachivalyams(result);
    setResultParts(null);
    setSachiLoading(false);
  };

  const handlePartList = async (data) => {
    const jsonData = {
      ...filterValues,
      sachivalayam_id: data.sachivalayam_pk,
      part_no: null,
      ...data,
    };

    setPartsLoading(true);
    var result = await getSurveyResultsByParts(jsonData);
    setPartsTitle(data.sachivalayam_name);
    setResultParts(result);
    setPartsLoading(false);
  };

  const handleReset = () => {
    setOtherFilterValues({
      intrested_party: null,
      is_resident: null,
      isSurveyed: null,
    });

    if (searchRef.current) {
      searchRef.current.reset();
    }
  };

  const grandTotalForPercentage = (data) => {
    let grandTotalValue = 0;
    data.map((item) => {
      grandTotalValue += parseFloat(item.neutral_percent) + parseFloat(item.ysrcp_percent) + parseFloat(item.tdp_percent) + parseFloat(item.janasena_percent) + parseFloat(item.others_percent) + parseFloat(item.not_traced_percent);
    });
    return (grandTotalValue / data.length).toFixed(2) + "%";
  };

  let isClearActive = otherFilterValues.intrested_party != null || otherFilterValues.is_resident != null;

  let sortedParties = [...(common?.parties ?? [])].sort((a, b) => a.label.localeCompare(b.label));

  const getVotesWithIcon = (votes, maxVotes, minVotes, isPercent = false) => {
    if (maxVotes == 0) return votes;

    if (votes === maxVotes) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          {votes}
          {isPercent ? "%" : ""}
          <ArrowDropUpIcon style={{ color: "green" }} />
        </Box>
      );
    } else if (votes === minVotes) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          {votes}
          {isPercent ? "%" : ""}
          <ArrowDropDownIcon style={{ color: "red" }} />
        </Box>
      );
    } else {
      return votes;
    }
  };

  return (
    <>
      <Card sx={{ p: 3, backgroundColor: searchFiltercolor }}>
        <Grid container spacing={2} alignItems="center">
          <SearchByFilter
            ref={filterRef}
            showVillage={false}
            isClearActive={isClearActive}
            onSubmit={handleSubmit}
            onReset={handleReset}
            children={
              <>
                <Grid item xs={12} md={6} lg={2}>
                  <RHFAutoComplete
                    name="intrested_party"
                    label="Select Party"
                    value={otherFilterValues.intrested_party}
                    options={sortedParties}
                    getOptionLabel={(option) => option.label}
                    onChange={(name, value) =>
                      setOtherFilterValues((state) => ({
                        ...state,
                        [name]: value,
                      }))
                    }
                  />
                </Grid>

                <Grid item xs={12} md={6} lg={2}>
                  <RHFAutoComplete
                    name="is_resident"
                    label="Select Residence"
                    value={otherFilterValues.is_resident}
                    options={[
                      {
                        label: "Resident",
                        value: 1,
                      },
                      {
                        label: "Non-Resident",
                        value: 0,
                      },
                    ]}
                    getOptionLabel={(option) => option.label}
                    onChange={(name, value) =>
                      setOtherFilterValues((state) => ({
                        ...state,
                        [name]: value,
                      }))
                    }
                  />
                </Grid>
              </>
            }
          />
        </Grid>
      </Card>

      <Box p={1} />

      {dashboard.isLoading && (
        <Box minHeight={200} display="flex" justifyContent="center" alignItems="center">
          <CircularProgress />
        </Box>
      )}

      {!dashboard.isLoading && dashboard.surveyReports1 && (
        <Grid container spacing={1}>
          {" "}
          <Grid item xs={12} md={12}>
            <Card elevation={1}>
              <Box p={2}>
                <BarChartWidget
                  showInsideValue={false}
                  title="Voter pulse by Party"
                  distributed={true}
                  chartLabels={["Neutral", "YCP", "TDP", "JSP", "BJP", "CONGRESS", "Others", "Not Traced", "Death"]}
                  chartData={[
                    {
                      name: "Total",
                      data: [
                        dashboard.surveyReports2?.survey_results_by_constituency?.map((item) => (item.neutral == null || Number.isNaN(Number(item.neutral)) ? 0 : parseInt(item.neutral))).reduce((a, b) => a + b, 0) ?? 0,
                        dashboard.surveyReports2?.survey_results_by_constituency?.map((item) => (item.ysrcp == null || Number.isNaN(Number(item.ysrcp)) ? 0 : parseInt(item.ysrcp))).reduce((a, b) => a + b, 0) ?? 0,
                        dashboard.surveyReports2?.survey_results_by_constituency?.map((item) => (item.tdp == null || Number.isNaN(Number(item.tdp)) ? 0 : parseInt(item.tdp))).reduce((a, b) => a + b, 0) ?? 0,
                        dashboard.surveyReports2?.survey_results_by_constituency?.map((item) => (item.janasena == null || Number.isNaN(Number(item.janasena)) ? 0 : parseInt(item.janasena))).reduce((a, b) => a + b, 0) ?? 0,
                        dashboard.surveyReports2?.survey_results_by_constituency?.map((item) => (item.bjp == null || Number.isNaN(Number(item.bjp)) ? 0 : parseInt(item.bjp))).reduce((a, b) => a + b, 0) ?? 0,
                        dashboard.surveyReports2?.survey_results_by_constituency?.map((item) => (item.congress == null || Number.isNaN(Number(item.congress)) ? 0 : parseInt(item.congress))).reduce((a, b) => a + b, 0) ?? 0,
                        dashboard.surveyReports2?.survey_results_by_constituency?.map((item) => (item.others == null || Number.isNaN(Number(item.others)) ? 0 : parseInt(item.others))).reduce((a, b) => a + b, 0) ?? 0,
                        dashboard.surveyReports2?.survey_results_by_constituency?.map((item) => (item.not_traced == null || Number.isNaN(Number(item.not_traced)) ? 0 : parseInt(item.not_traced))).reduce((a, b) => a + b, 0) ?? 0,
                        dashboard.surveyReports2?.survey_results_by_constituency?.map((item) => (item.death == null || Number.isNaN(Number(item.death)) ? 0 : parseInt(item.death))).reduce((a, b) => a + b, 0) ?? 0,
                      ],
                    },
                  ]}
                  chartColors={[NETURALColor, YSRCPColor, TDPColor, JSPColor, BJPColor, CONGRESSColor, OTHERColor, NOTTRACEDColor, DEATHColor]}
                />
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={12}>
            <CustomizedTables
              title={"Voters Opinion by Mandal"}
              labels={["S.No", "Mandal Name", "#Parts", "Male", "Female", "TG", "Unknown", "Survey Voter", "Pending Voter", "Total"]}
              rows={dashboard.surveyReports1?.survey_summary_by_constituency?.map((item, index) => [
                index + 1,
                item.mandal_name || "Mandal Name",
                item.parts_count || 0,
                item.male_voters || 0,
                item.female_voters || 0,
                item.other_voters || 0,
                item.unknown_voters || 0,
                item.total_voters || 0,
                item.pending_survey_voters || 0,
                item.total_voters_by_mandal || 0,
              ])}
              total={[
                "",
                "Total:",
                dashboard.surveyReports1?.all_totals?.final_polling_totals ?? 0,
                dashboard.surveyReports1?.all_totals?.final_male_total ?? 0,
                dashboard.surveyReports1?.all_totals?.final_female_total ?? 0,
                dashboard.surveyReports1?.all_totals?.final_others_total ?? 0,
                dashboard.surveyReports1?.all_totals?.final_unknown_total ?? 0,
                dashboard.surveyReports1?.all_totals?.total_survey_count ?? 0,
                dashboard.surveyReports1?.all_totals?.pending_survey_count ?? 0,
                dashboard.surveyReports1?.all_totals?.final_total ?? 0,
              ]}
            />
          </Grid>
          {account?.user.mandal_pk == null && (
            <>
              <Grid item xs={12} md={12}>
                <CustomizedTables
                  title={"Voters Opinion by Party"}
                  labels={["S.No", "Mandal Name", "Neutral", "YCP", "TDP", "JSP", "BJP", "CONGRESS", "Others", "Not Traced", "Death", "Total"]}
                  onRowClick={(index) => handleDivisionList(dashboard.surveyReports2?.survey_results_by_constituency[index])}
                  rows={dashboard.surveyReports2?.survey_results_by_constituency?.map((item, index) => {
                    const partyVotes = [parseInt(item?.ysrcp ?? "0"), parseInt(item?.tdp ?? "0"), parseInt(item?.janasena ?? "0"), parseInt(item?.bjp ?? "0"), parseInt(item?.congress ?? "0")];
                    const maxVotes = Math.max(...partyVotes);
                    const minVotes = Math.min(...partyVotes);
                    console.log("maxVotfsdfdfses", maxVotes);

                    const getVotesWithIcon = (votes) => {
                      console.log("vodfsfdstes", votes);
                      if (votes === maxVotes && votes !== 0) {
                        return (
                          <>
                            {votes}
                            <ArrowDropUpIcon style={{ color: "green" }} />
                          </>
                        );
                      } else if (votes === minVotes) {
                        return (
                          <>
                            {votes}
                            <ArrowDropDownIcon style={{ color: "red" }} />
                          </>
                        );
                      } else {
                        return votes;
                      }
                    };

                    return [
                      index + 1,
                      item.mandal_name,
                      item?.neutral ?? 0,
                      getVotesWithIcon(parseInt(item?.ysrcp ?? 0)),
                      getVotesWithIcon(parseInt(item?.tdp ?? 0)),
                      getVotesWithIcon(parseInt(item?.janasena ?? 0)),
                      getVotesWithIcon(parseInt(item?.bjp ?? 0)),
                      getVotesWithIcon(parseInt(item?.congress ?? 0)),
                      item?.others ?? 0,
                      item?.not_traced ?? 0,
                      item?.death ?? 0,
                      parseInt(item.neutral) + parseInt(item.ysrcp) + parseInt(item.tdp) + parseInt(item.janasena) + parseInt(item.bjp) + parseInt(item.congress) + parseInt(item.others) + parseInt(item.not_traced) + parseInt(item.death) || 0,
                    ];
                  })}
                  total={[
                    "",
                    "Total:",
                    dashboard.surveyReports2?.all_totals?.neutral_count ?? 0,
                    dashboard.surveyReports2?.all_totals?.ycp_count ?? 0,
                    dashboard.surveyReports2?.all_totals?.tdp_count ?? 0,
                    dashboard.surveyReports2?.all_totals?.jsp_count ?? 0,
                    dashboard.surveyReports2?.all_totals?.bjp_count ?? 0,
                    dashboard.surveyReports2?.all_totals?.congress_count ?? 0,
                    dashboard.surveyReports2?.all_totals?.others_count ?? 0,
                    dashboard.surveyReports2?.all_totals?.not_traced_count ?? 0,
                    dashboard.surveyReports2?.all_totals?.death_count ?? 0,
                    dashboard.surveyReports2?.all_totals?.neutral_count +
                    dashboard.surveyReports2?.all_totals?.ycp_count +
                    dashboard.surveyReports2?.all_totals?.tdp_count +
                    dashboard.surveyReports2?.all_totals?.jsp_count +
                    dashboard.surveyReports2?.all_totals?.bjp_count +
                    dashboard.surveyReports2?.all_totals?.congress_count +
                    dashboard.surveyReports2?.all_totals?.others_count +
                    dashboard.surveyReports2?.all_totals?.not_traced_count +
                    dashboard.surveyReports2?.all_totals?.death_count,
                  ]}
                />
              </Grid>
              <Grid item xs={12} md={12}>
                <CustomizedTables
                  title={"Voters Opinion % for Party"}
                  labels={["S.No", "Mandal Name", "Neutral", "YCP", "TDP", "JSP", "BJP", "CONGRESS", "Others", "Not Traced", "Death", "Total"]}
                  rows={dashboard.surveyReports2?.survey_results_by_constituency?.map((item, index) => {
                    const partyVotes = [parseFloat(item?.ysrcp_percent ?? "0"), parseFloat(item?.tdp_percent ?? "0"), parseFloat(item?.janasena_percent ?? "0"), parseFloat(item?.bjp_percent ?? "0"), parseFloat(item?.congress_percent ?? "0")];
                    const maxVotes = Math.max(...partyVotes);
                    const minVotes = Math.min(...partyVotes);

                    const getVotesWithIcon = (votes) => {
                      if (votes === maxVotes && votes !== 0) {
                        return (
                          <>
                            {votes}% <ArrowDropUpIcon style={{ color: "green" }} />
                          </>
                        );
                      } else if (votes === minVotes) {
                        return (
                          <>
                            {votes}% <ArrowDropDownIcon style={{ color: "red" }} />
                          </>
                        );
                      } else {
                        return votes + "%";
                      }
                    };

                    return [
                      index + 1,
                      item.mandal_name,
                      item?.neutral_percent ?? 0,
                      getVotesWithIcon(parseFloat(item?.ysrcp_percent ?? 0)),
                      getVotesWithIcon(parseFloat(item?.tdp_percent ?? 0)),
                      getVotesWithIcon(parseFloat(item?.janasena_percent ?? 0)),
                      getVotesWithIcon(parseFloat(item?.bjp_percent ?? 0)),
                      getVotesWithIcon(parseFloat(item?.congress_percent ?? 0)),
                      item?.others_percent ?? 0,
                      item?.not_traced_percent ?? 0,
                      item?.death_percent ?? 0,
                      // (parseFloat(item.neutral_percent) + parseFloat(item.ysrcp_percent) + parseFloat(item.tdp_percent) + parseFloat(item.janasena_percent) + parseFloat(item.others_percent) + parseFloat(item.not_traced_percent)).toFixed(2) + "%",
                      "100% ",
                    ];
                  })}
                  total={["\u200B", "\u200B", "\u200B", "\u200B", "\u200B", "\u200B", "\u200B", "\u200B", "\u200B", "\u200B", "\u200B", "\u200B"]}
                />
              </Grid>
            </>
          )}
          {isDivLoading && (
            <Box minHeight={200} display="flex" justifyContent="center" alignItems="center" width="100%">
              <CircularProgress />
            </Box>
          )}
          {!isDivLoading && resultDivisions != null && (
            <>
              <Grid item xs={12} md={12}>
                <CustomizedTables
                  title={`Voters Opinion by Division & Party - ${divTitle}`}
                  labels={["S.No", "Division Name", "Survey Count", "Voting Count", "Neutral", "YCP", "TDP", "JSP", "BJP", "CONGRESS", "Others", "Not Traced", "Death"]}
                  onRowClick={(index) => handleSachivalayamList(resultDivisions.survey_results_by_division[index])}
                  rows={resultDivisions.survey_results_by_division?.map((item, index) => {
                    const partyVotes = [parseInt(item.ysrcp ?? 0), parseInt(item.tdp ?? 0), parseInt(item.janasena ?? 0), parseInt(item.bjp ?? 0), parseInt(item.congress ?? 0)];
                    const maxVotes = Math.max(...partyVotes);
                    const minVotes = Math.min(...partyVotes);

                    return [
                      index + 1,
                      item.division_name,
                      // parseInt(item.neutral) + parseInt(item.ysrcp) + parseInt(item.tdp) + parseInt(item.janasena) + parseInt(item.bjp) + parseInt(item.congress) + parseInt(item.others) + parseInt(item.not_traced) || 0,
                      item.total_surveys ?? 0,
                      item.voting_count ?? 0,
                      item.neutral ?? 0,
                      getVotesWithIcon(parseInt(item.ysrcp ?? 0), maxVotes, minVotes),
                      getVotesWithIcon(parseInt(item.tdp ?? 0), maxVotes, minVotes),
                      getVotesWithIcon(parseInt(item.janasena ?? 0), maxVotes, minVotes),
                      getVotesWithIcon(parseInt(item.bjp ?? 0), maxVotes, minVotes),
                      getVotesWithIcon(parseInt(item.congress ?? 0), maxVotes, minVotes),
                      item.others ?? 0,
                      item.not_traced ?? 0,
                      item.death ?? 0,
                    ];
                  })}
                  total={[
                    "",
                    "Total:",
                    // dashboard.surveyReports3?.all_totals?.neutral_count +
                    //   dashboard.surveyReports3?.all_totals?.ycp_count +
                    //   dashboard.surveyReports3?.all_totals?.tdp_count +
                    //   dashboard.surveyReports3?.all_totals?.jsp_count +
                    //   dashboard.surveyReports3?.all_totals?.bjp_count +
                    //   dashboard.surveyReports3?.all_totals?.congress_count +
                    //   dashboard.surveyReports3?.all_totals?.others_count +
                    //   dashboard.surveyReports3?.all_totals?.not_traced_count,
                    resultDivisions.all_totals?.total_survey_count ?? 0,
                    resultDivisions.all_totals?.total_voting_count ?? 0,
                    resultDivisions.all_totals?.neutral_count ?? 0,
                    resultDivisions.all_totals?.ycp_count ?? 0,
                    resultDivisions.all_totals?.tdp_count ?? 0,
                    resultDivisions.all_totals?.jsp_count ?? 0,
                    resultDivisions.all_totals?.bjp_count ?? 0,
                    resultDivisions.all_totals?.congress_count ?? 0,
                    resultDivisions.all_totals?.others_count ?? 0,
                    resultDivisions.all_totals?.not_traced_count ?? 0,
                    resultDivisions.all_totals?.death_count ?? 0,
                  ]}
                />
              </Grid>
              <Grid item xs={12} md={12}>
                <CustomizedTables
                  title={`Voters Opinion % by Divsion & Party - ${divTitle}`}
                  labels={["S.No", "Division Name", "Neutral", "YCP", "TDP", "JSP", "BJP", "CONGRESS", "Others", "Not Traced", "Death", "Total"]}
                  rows={resultDivisions.survey_results_by_division?.map((item, index) => {
                    const partyVotes = [parseFloat(item.ysrcp_percent ?? 0), parseFloat(item.tdp_percent ?? 0), parseFloat(item.janasena_percent ?? 0), parseFloat(item.bjp_percent ?? 0), parseFloat(item.congress_percent ?? 0)];
                    const maxVotes = Math.max(...partyVotes);
                    const minVotes = Math.min(...partyVotes);

                    return [
                      index + 1,
                      item.division_name,
                      item.neutral_percent ?? "0.00%",
                      getVotesWithIcon(parseFloat(item.ysrcp_percent ?? "0.00%"), maxVotes, minVotes, true),
                      getVotesWithIcon(parseFloat(item.tdp_percent ?? "0.00%"), maxVotes, minVotes, true),
                      getVotesWithIcon(parseFloat(item.janasena_percent ?? "0.00%"), maxVotes, minVotes, true),
                      getVotesWithIcon(parseFloat(item.bjp_percent ?? "0.00%"), maxVotes, minVotes, true),
                      getVotesWithIcon(parseFloat(item.congress_percent ?? "0.00%"), maxVotes, minVotes, true),
                      item.others_percent ?? "0.00%",
                      item.not_traced_percent ?? "0.00%",
                      item.death_percent ?? "0.00%",
                      // (parseFloat(item.neutral_percent) + parseFloat(item.ysrcp_percent) + parseFloat(item.tdp_percent) + parseFloat(item.janasena_percent) + parseFloat(item.others_percent) + parseFloat(item.not_traced_percent)).toFixed(2) + "%",
                      "100%",
                    ];
                  })}
                  total={["\u200B", "\u200B", "\u200B", "\u200B", "\u200B", "\u200B", "\u200B", "\u200B", "\u200B", "\u200B", "\u200B", "\u200B"]}
                />
              </Grid>
            </>
          )}
          {isSachiLoading && (
            <Box minHeight={200} display="flex" justifyContent="center" alignItems="center" width="100%">
              <CircularProgress />
            </Box>
          )}
          {!isSachiLoading && resultSachivalyams != null && (
            <>
              <Grid item xs={12} md={12}>
                <CustomizedTables
                  title={`Voting Opinion by Sachivalayam & Party - ${sachiTitle}`}
                  labels={["S.No", "Sachivalayam Name", "Survey Count", "Voting Count", "Neutral", "YCP", "TDP", "JSP", "BJP", "CONGRESS", "Others", "Not Traced", "Death"]}
                  onRowClick={(index) => handlePartList(resultSachivalyams.survey_results_by_division[index])}
                  rows={resultSachivalyams.survey_results_by_division?.map((item, index) => {
                    const partyVotes = [parseInt(item.ysrcp ?? 0), parseInt(item.tdp ?? 0), parseInt(item.janasena ?? 0), parseInt(item.bjp ?? 0), parseInt(item.congress ?? 0)];
                    const maxVotes = Math.max(...partyVotes);
                    const minVotes = Math.min(...partyVotes);

                    return [
                      index + 1,
                      item.sachivalayam_name,
                      // parseInt(item.neutral) + parseInt(item.ysrcp) + parseInt(item.tdp) + parseInt(item.janasena) + parseInt(item.bjp) + parseInt(item.congress) + parseInt(item.others) + parseInt(item.not_traced) || 0,
                      item.total_surveys ?? 0,
                      item.voting_count ?? 0,
                      item.neutral ?? 0,
                      getVotesWithIcon(parseInt(item.ysrcp ?? 0), maxVotes, minVotes),
                      getVotesWithIcon(parseInt(item.tdp ?? 0), maxVotes, minVotes),
                      getVotesWithIcon(parseInt(item.janasena ?? 0), maxVotes, minVotes),
                      getVotesWithIcon(parseInt(item.bjp ?? 0), maxVotes, minVotes),
                      getVotesWithIcon(parseInt(item.congress ?? 0), maxVotes, minVotes),
                      item.others ?? 0,
                      item.not_traced ?? 0,
                      item.death ?? 0,
                    ];
                  })}
                  total={[
                    "",
                    "Total:",
                    // dashboard.surveyReports3?.all_totals?.neutral_count +
                    //   dashboard.surveyReports3?.all_totals?.ycp_count +
                    //   dashboard.surveyReports3?.all_totals?.tdp_count +
                    //   dashboard.surveyReports3?.all_totals?.jsp_count +
                    //   dashboard.surveyReports3?.all_totals?.bjp_count +
                    //   dashboard.surveyReports3?.all_totals?.congress_count +
                    //   dashboard.surveyReports3?.all_totals?.others_count +
                    //   dashboard.surveyReports3?.all_totals?.not_traced_count,
                    resultSachivalyams.all_totals?.total_survey_count ?? 0,
                    resultSachivalyams.all_totals?.total_voting_count ?? 0,
                    resultSachivalyams.all_totals?.neutral_count ?? 0,
                    resultSachivalyams.all_totals?.ycp_count ?? 0,
                    resultSachivalyams.all_totals?.tdp_count ?? 0,
                    resultSachivalyams.all_totals?.jsp_count ?? 0,
                    resultSachivalyams.all_totals?.bjp_count ?? 0,
                    resultSachivalyams.all_totals?.congress_count ?? 0,
                    resultSachivalyams.all_totals?.others_count ?? 0,
                    resultSachivalyams.all_totals?.not_traced_count ?? 0,
                    resultSachivalyams.all_totals?.death_count ?? 0,
                  ]}
                />
              </Grid>
              <Grid item xs={12} md={12}>
                <CustomizedTables
                  title={`Voting Opinion % by Sachivalayam & Party - ${sachiTitle}`}
                  labels={["S.No", "Sachivalayam Name", "Neutral", "YCP", "TDP", "JSP", "BJP", "CONGRESS", "Others", "Not Traced", "Death", "Total"]}
                  rows={resultSachivalyams.survey_results_by_division?.map((item, index) => {
                    const partyVotes = [parseFloat(item.ysrcp_percent ?? 0), parseFloat(item.tdp_percent ?? 0), parseFloat(item.janasena_percent ?? 0), parseFloat(item.bjp_percent ?? 0), parseFloat(item.congress_percent ?? 0)];
                    const maxVotes = Math.max(...partyVotes);
                    const minVotes = Math.min(...partyVotes);

                    return [
                      index + 1,
                      item.sachivalayam_name,
                      item.neutral_percent ?? "0.00%",
                      getVotesWithIcon(parseFloat(item.ysrcp_percent ?? "0.00%"), maxVotes, minVotes, true),
                      getVotesWithIcon(parseFloat(item.tdp_percent ?? "0.00%"), maxVotes, minVotes, true),
                      getVotesWithIcon(parseFloat(item.janasena_percent ?? "0.00%"), maxVotes, minVotes, true),
                      getVotesWithIcon(parseFloat(item.bjp_percent ?? "0.00%"), maxVotes, minVotes, true),
                      getVotesWithIcon(parseFloat(item.congress_percent ?? "0.00%"), maxVotes, minVotes, true),
                      item.others_percent ?? "0.00%",
                      item.not_traced_percent ?? "0.00%",
                      item.death_percent ?? "0.00%",
                      // (parseFloat(item.neutral_percent) + parseFloat(item.ysrcp_percent) + parseFloat(item.tdp_percent) + parseFloat(item.janasena_percent) + parseFloat(item.others_percent) + parseFloat(item.not_traced_percent)).toFixed(2) + "%",
                      "100%",
                    ];
                  })}
                  total={["\u200B", "\u200B", "\u200B", "\u200B", "\u200B", "\u200B", "\u200B", "\u200B", "\u200B", "\u200B", "\u200B", "\u200B"]}
                />
              </Grid>
            </>
          )}
          {isPartsLoading && (
            <Box minHeight={200} display="flex" justifyContent="center" alignItems="center" width="100%">
              <CircularProgress />
            </Box>
          )}
          {!isPartsLoading && resultParts != null && (
            <>
              <Grid item xs={12} md={12}>
                <CustomizedTables
                  title={`Voting Opinion by Part & Party - ${partsTitle}`}
                  labels={["S.No", "Part Name", "Survey Count", "Voting Count", "Neutral", "YCP", "TDP", "JSP", "BJP", "CONGRESS", "Others", "Not Traced", "Death"]}
                  rows={resultParts.survey_results_by_parts?.map((item, index) => {
                    const partyVotes = [parseInt(item.ysrcp ?? 0), parseInt(item.tdp ?? 0), parseInt(item.janasena ?? 0), parseInt(item.bjp ?? 0), parseInt(item.congress ?? 0)];
                    const maxVotes = Math.max(...partyVotes);
                    const minVotes = Math.min(...partyVotes);

                    return [
                      index + 1,
                      item.part_no,
                      // parseInt(item.neutral) + parseInt(item.ysrcp) + parseInt(item.tdp) + parseInt(item.janasena) + parseInt(item.bjp) + parseInt(item.congress) + parseInt(item.others) + parseInt(item.not_traced) || 0,
                      item.total_surveys ?? 0,
                      item.voting_count ?? 0,
                      item.neutral ?? 0,
                      getVotesWithIcon(parseInt(item.ysrcp ?? 0), maxVotes, minVotes),
                      getVotesWithIcon(parseInt(item.tdp ?? 0), maxVotes, minVotes),
                      getVotesWithIcon(parseInt(item.janasena ?? 0), maxVotes, minVotes),
                      getVotesWithIcon(parseInt(item.bjp ?? 0), maxVotes, minVotes),
                      getVotesWithIcon(parseInt(item.congress ?? 0), maxVotes, minVotes),
                      item.others ?? 0,
                      item.not_traced ?? 0,
                      item.death ?? 0,
                    ];
                  })}
                  total={[
                    "",
                    "Total:",
                    // dashboard.surveyReports3?.all_totals?.neutral_count +
                    //   dashboard.surveyReports3?.all_totals?.ycp_count +
                    //   dashboard.surveyReports3?.all_totals?.tdp_count +
                    //   dashboard.surveyReports3?.all_totals?.jsp_count +
                    //   dashboard.surveyReports3?.all_totals?.bjp_count +
                    //   dashboard.surveyReports3?.all_totals?.congress_count +
                    //   dashboard.surveyReports3?.all_totals?.others_count +

                    //   dashboard.surveyReports3?.all_totals?.not_traced_count,
                    resultParts.all_totals?.total_survey_count ?? 0,
                    resultParts.all_totals?.total_voting_count ?? 0,
                    resultParts.all_totals?.neutral_count ?? 0,
                    resultParts.all_totals?.ycp_count ?? 0,
                    resultParts.all_totals?.tdp_count ?? 0,
                    resultParts.all_totals?.jsp_count ?? 0,
                    resultParts.all_totals?.bjp_count ?? 0,
                    resultParts.all_totals?.congress_count ?? 0,
                    resultParts.all_totals?.others_count ?? 0,
                    resultParts.all_totals?.not_traced_count ?? 0,
                    resultParts.all_totals?.death_count ?? 0,
                  ]}
                />
              </Grid>
              <Grid item xs={12} md={12}>
                <CustomizedTables
                  title={`Voting Opinion % by Part & Party - ${partsTitle}`}
                  labels={["S.No", "Part Name", "Neutral", "YCP", "TDP", "JSP", "BJP", "CONGRESS", "Others", "Not Traced", "Death", "Total"]}
                  rows={resultParts.survey_results_by_parts?.map((item, index) => {
                    const partyVotes = [parseFloat(item.ysrcp_percent ?? 0), parseFloat(item.tdp_percent ?? 0), parseFloat(item.janasena_percent ?? 0), parseFloat(item.bjp_percent ?? 0), parseFloat(item.congress_percent ?? 0)];
                    const maxVotes = Math.max(...partyVotes);
                    const minVotes = Math.min(...partyVotes);

                    return [
                      index + 1,
                      item.part_no,
                      item.neutral_percent ?? "0.00%",
                      getVotesWithIcon(parseFloat(item.ysrcp_percent ?? "0.00%"), maxVotes, minVotes, true),
                      getVotesWithIcon(parseFloat(item.tdp_percent ?? "0.00%"), maxVotes, minVotes, true),
                      getVotesWithIcon(parseFloat(item.janasena_percent ?? "0.00%"), maxVotes, minVotes, true),
                      getVotesWithIcon(parseFloat(item.bjp_percent ?? "0.00%"), maxVotes, minVotes, true),
                      getVotesWithIcon(parseFloat(item.congress_percent ?? "0.00%"), maxVotes, minVotes, true),
                      item.others_percent ?? "0.00%",
                      item.not_traced_percent ?? "0.00%",
                      item.death_percent ?? "0.00%",
                      // (parseFloat(item.neutral_percent) + parseFloat(item.ysrcp_percent) + parseFloat(item.tdp_percent) + parseFloat(item.janasena_percent) + parseFloat(item.others_percent) + parseFloat(item.not_traced_percent)).toFixed(2) + "%",
                      "100%",
                    ];
                  })}
                  total={["\u200B", "\u200B", "\u200B", "\u200B", "\u200B", "\u200B", "\u200B", "\u200B", "\u200B", "\u200B", "\u200B", "\u200B"]}
                />
              </Grid>
            </>
          )}
        </Grid>
      )}
    </>
  );
};

function CustomizedTables({ labels, rows, total, title, showHover = [1], onRowClick }) {
  return (
    <>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: searchFiltercolor, width: "100%" }}>
              <TableCell
                colSpan={labels.length}
                align="center"
                sx={{
                  // backgroundColor: searchFiltercolor,
                  textAlign: "center",
                  width: "100%",
                }}
              >
                <Typography variant="h6">{title}</Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              {labels?.map((item, index) => (
                <TableCell key={index} sx={{ backgroundColor: searchFiltercolor, textAlign: "center" }}>
                  {index == 1 && (
                    <Typography variant="body2" align="left">
                      {item}
                    </Typography>
                  )}
                  {index != 1 && item}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows?.map((row, index) => (
              <TableRow key={index}>
                {row?.map((item, index2) => (
                  <TableCell key={index2}>
                    {(onRowClick == null || !showHover.includes(index2)) && (
                      <Typography
                        variant="body2"
                        sx={{
                          textAlign: index2 != 1 ? "center" : "left",
                        }}
                      >
                        {item}
                      </Typography>
                    )}

                    {showHover.includes(index2) && onRowClick != null && (
                      <Link component="button" variant="body2" onClick={onRowClick != null ? () => onRowClick(index) : null}>
                        {item}
                      </Link>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
          <TableHead>
            <TableRow>
              {total?.map((item, index) => (
                <TableCell key={index} sx={{ backgroundColor: searchFiltercolor, textAlign: "center" }}>
                  {index == 1 && (
                    <Typography variant="body2" align="left">
                      {item}
                    </Typography>
                  )}
                  {index != 1 && item}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
        </Table>
      </TableContainer>
    </>
  );
}

const mapStateToProps = (state) => {
  return {
    dashboard: state.dashboard,
    account: state.auth,
    common: state.common,
  };
};

export default connect(mapStateToProps, {
  getOpinionResults,
  clearDashboardReducer,
})(SurveyReportsList);
