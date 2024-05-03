import { useEffect, useState, useRef, useCallback } from "react";
import { Typography, Card, Stack, Grid, Switch, Divider, Box, CircularProgress, TextField, TableContainer, Table, TableRow, TableBody, TableHead, TableCell, TableFooter, Paper, Button, Link } from "@mui/material";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { connect } from "react-redux";
import { showAlert } from "../../actions/alert";
import { LoadingButton } from "@mui/lab";
import SearchByFilter from "../common/SearchByFilter";
import { getOpinionResults, clearDashboardReducer, getVotingResults, getVotingResultsByDivision, getVotingResultsBySachivalyam, getVotingResultsByParts } from "../../actions/dashboard";
import { BarChartWidget } from "../common";
import { BJPColor, CONGRESSColor, JSPColor, NETURALColor, NOTTRACEDColor, OTHERColor, TDPColor, YSRCPColor, DEATHColor } from "../../utils/constants";
import { searchFiltercolor } from "../../constants";
import { useLocation } from "react-router-dom";
import { RHFAutoComplete } from "../../components/hook-form";
import { da } from "date-fns/locale";
import * as Colors from "../../utils/constants";

const VotingPollSurveyReportsList = ({ dashboard, getOpinionResults, getVotingResults, clearDashboardReducer, account, common }) => {
  const [filterValues, setFilterValues] = useState({});
  const [isLoading, setLoading] = useState(false);
  const [reset, setReset] = useState(false);
  const [voterHeader, setVoterHeader] = useState([]);
  const [voterResultData, setVoterResultData] = useState([]);
  const filterRef = useRef(null);
  const searchRef = useRef(null);

  const [otherFilterValues, setOtherFilterValues] = useState({
    intrested_party: null,
    is_resident: null,
    isVoted: null,
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

  // useEffect(() => {
  // var headerList = [];
  // var headerList2 = [];

  // if (dashboard?.votingSurveyResult?.length > 0) {
  //   dashboard.votingSurveyResult.map((item) => {
  //     item.voted_party.map((e) => {
  //       var index = headerList.findIndex((x) => x.id === e.id);
  //       if (index == -1) {
  //         headerList.push({ id: e.id, name: e.name });
  //       }
  //     });
  //   });
  // }
  // if (dashboard?.eachPartyPercentage?.length > 0) {
  //   dashboard.eachPartyPercentage.map((item) => {
  //     item.voted_party.map((e) => {
  //       var index = headerList2.findIndex((x) => x.id === e.id);
  //       if (index == -1) {
  //         headerList2.push({ id: e.id, name: e.name });
  //       }
  //     });
  //   });
  // }

  //   calculateVotingResult();
  // }, [dashboard.votingSurveyResult]);

  const calculateVotingResult = (result) => {
    var headerList = [];
    var headerList2 = [];
    const result_byconstituency_total = [];
    const percentage_byconstituency_total = [];

    dashboard.votingSurveyResult.forEach((item) => {
      var index = headerList.findIndex((x) => x.id === item.lookup_pk);
      if (index === -1) {
        headerList.push({ id: item.lookup_pk, name: item.lookup_valuename });
      }

      var cons_index = result_byconstituency_total.findIndex((e) => e.constituency_pk === item.constituency_pk);

      if (cons_index !== -1) {
        if (item.interested_party_count != null) {
          var interested_index = result_byconstituency_total[cons_index].interested_party.findIndex((e) => e.id === item.interested_party);
          if (interested_index != -1) {
            var count = result_byconstituency_total[cons_index].interested_party[interested_index].votes + Number(item.interested_party_count);
            result_byconstituency_total[cons_index].interested_party[interested_index].votes = count;
            result_byconstituency_total[cons_index].interested_party[interested_index].percent = (count / item.cons_voters_count) * 100;
          } else {
            result_byconstituency_total[cons_index].interested_party.push({
              id: item.lookup_pk,
              name: item.lookup_valuename,
              votes: Number(item.interested_party_count),
              percent: (Number(item.interested_party_count) / item.cons_voters_count) * 100,
            });
          }
        }

        if (item.voted_party_count != null) {
          var voted_index = result_byconstituency_total[cons_index].voted_party.findIndex((e) => e.id === item.voted_party);
          if (voted_index != -1) {
            result_byconstituency_total[cons_index].voted_party[voted_index].votes += Number(item.voted_party_count);
          } else {
            result_byconstituency_total[cons_index].voted_party.push({
              id: item.lookup_pk,
              name: item.lookup_valuename,
              votes: Number(item.voted_party_count),
              percent: (Number(item.voted_party_count) / item.cons_voters_count) * 100,
            });
          }
        }

        // interested_party_total[cons_index].push({
        //   party_name: item.party_name,
        //   party_votes: item.party_votes,
        // });
      } else {
        var newItem = {
          district_pk: item.district_pk,
          district_name: item.district_name,
          constituency_pk: item.constituency_pk,
          constituency_name: item.constituency_name,
          interested_party:
            item.interested_party_count != null
              ? [
                {
                  id: item.lookup_pk,
                  name: item.lookup_valuename,
                  votes: Number(item.interested_party_count),
                  percent: (Number(item.interested_party_count) / item.cons_voters_count) * 100,
                },
              ]
              : [],
          voted_party:
            item.voted_party_count != null
              ? [
                {
                  id: item.lookup_pk,
                  name: item.lookup_valuename,
                  votes: Number(item.voted_party_count),
                  percent: (Number(item.voted_party_count) / item.cons_voters_count) * 100,
                },
              ]
              : [],
          cons_voters_count: item.cons_voters_count,
        };

        console.log("newItem", newItem);

        result_byconstituency_total.push(newItem);
      }
    });

    console.log("result_byconstituency_total", result_byconstituency_total);
    console.log("headerList", headerList);
    setVoterHeader(headerList);
    setVoterResultData(result_byconstituency_total);
  };

  const handleSubmit = async (filterValues) => {
    const jsonData = {
      ...filterValues,
      intrested_party: otherFilterValues.intrested_party?.value ?? null,
      is_resident: otherFilterValues.is_resident?.value ?? null,
      isVoted: otherFilterValues.isVoted?.value ?? null,
    };
    setFilterValues(jsonData);
    const fetchOptionReportsData = true;

    await getVotingResults(jsonData, fetchOptionReportsData);
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
      console.log("jsonDatapart5855", jsonData);
      handlePartList({ ...jsonData, sachivalayam_pk: account?.user.sachivalayam_pk, sachivalayam_name: account?.user.sachivalayam_name });
    }
  };

  const handleDivisionList = async (data) => {
    const jsonData = {
      ...filterValues,
      mandal_id: data.mandal_pk,
      ...data,
    };

    setDivLoading(true);
    var result = await getVotingResultsByDivision(jsonData);
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
    var result = await getVotingResultsBySachivalyam(jsonData);
    setSachiTitle(data.division_name);
    setResultSachivalyams(result);
    setResultParts(null);
    setSachiLoading(false);
  };

  const handlePartList = async (data) => {
    console.log("dat845612a", data);

    const jsonData = {
      ...filterValues,
      sachivalayam_id: data.sachivalayam_pk,
      part_no: null,
      ...data,
    };

    setPartsLoading(true);
    var result = await getVotingResultsByParts(jsonData);
    setPartsTitle(data.sachivalayam_name);
    setResultParts(result);
    setPartsLoading(false);
  };

  const handleReset = () => {
    setOtherFilterValues({
      intrested_party: null,
      is_resident: null,
      isSurveyed: null,
      isVoted: null,
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

  ///////////////////////////////////////////////////////////////
  // separate the parties fron voterResultData.vote_party
  const parties = voterResultData.map((item) => item.voted_party);
  console.log("parties", parties);

  // check if this party higher votes comparitive to other parties if it is  true then increase the score by 1

  let totalParties = voterHeader;

  let partiesWithScores = [];

  totalParties.forEach((party) => {
    let score = 0;
    let findedParty = voterResultData.map((item) => item.voted_party).find((item) => item.id === party.id);
    console.log("findedParty852", findedParty);

    for (let item of voterResultData) {
      console.log("item852", item);
    }

    partiesWithScores.push({ ...party, score });

    // return party;
  });

  voterResultData.forEach((item) => {
    console.log("item85285252", item);
    console.log("item.voted_party", item.voted_party);
    // find the first party with highest votes
    let firstParty = item.voted_party.find((party) => party.votes === Math.max(...item.voted_party.map((party) => party.votes)));
    // add 1 to the score of the party
    let findedParty = partiesWithScores.find((party) => party?.id === firstParty?.id);
    console.log("firstParty", firstParty);
    if (firstParty?.votes > 0) {
      partiesWithScores = partiesWithScores.map((party) => {
        if (party.id === firstParty.id) {
          return { ...party, score: party.score + 1 };
        }
        return party;
      });
    }
  });

  partiesWithScores = partiesWithScores.map((item) => {
    const color = common?.parties.find((party) => party.value === item.id)?.color;
    return { ...item, color };
  });

  console.log("partiesWithScores", partiesWithScores); // ok

  /////////////////////////////////////////////////////

  let secondChartData = {
    totalVotes: voterResultData.reduce((acc, item) => acc + item.cons_voters_count, 0) - voterResultData.reduce((acc, item) => acc + item.voted_party.reduce((acc, item) => acc + item.votes, 0), 0),
    totalPartyVotes: voterResultData.reduce((acc, item) => acc + item.voted_party.reduce((acc, item) => acc + item.votes, 0), 0),
  };

  console.log("secondChartData", secondChartData);

  console.log("voterResultData", common?.parties);

  // let firstChartData = (common?.parties ?? []).map((party) => {
  //   return {
  //     id: party?.value,
  //     party_name: party?.label,
  //     count: 0,
  //     color: party?.color,
  //   };
  // });

  // console.log("firstChartData", firstChartData);

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

  let sortedParties = [...(common?.parties ?? [])].sort((a, b) => a.label.localeCompare(b.label));

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
                <Grid item xs={12} md={6} lg={2}>
                  <RHFAutoComplete
                    name="isVoted"
                    label="Voting Status"
                    value={otherFilterValues.isVoted}
                    options={[
                      { label: "Completed", value: "Y" },
                      { label: "Pending", value: "N" },
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

      {!dashboard.isLoading && (
        <Grid container spacing={1}>
          <Grid item xs={12} md={12}>
            <Card elevation={1}>
              <Box p={2}>
                {/* <BarChartWidget
                  showInsideValue={false}
                  title="Opinion Survey by Party"
                  distributed={true}
                  chartLabels={["Neutral", "YCP", "TDP", "JSP", "BJP", "CONGRESS", "Others", "Not Traced"]}
                  chartData={[
                    {
                      name: "Total",
                      data: [
                        // dashboard.surveyReports2?.survey_results_by_constituency?.map((item) => (item.neutral == null || Number.isNaN(Number(item.neutral)) ? 0 : parseInt(item.neutral))).reduce((a, b) => a + b, 0) ?? 0,
                        // dashboard.surveyReports2?.survey_results_by_constituency?.map((item) => (item.ysrcp == null || Number.isNaN(Number(item.ysrcp)) ? 0 : parseInt(item.ysrcp))).reduce((a, b) => a + b, 0) ?? 0,
                        // dashboard.surveyReports2?.survey_results_by_constituency?.map((item) => (item.tdp == null || Number.isNaN(Number(item.tdp)) ? 0 : parseInt(item.tdp))).reduce((a, b) => a + b, 0) ?? 0,
                        // dashboard.surveyReports2?.survey_results_by_constituency?.map((item) => (item.janasena == null || Number.isNaN(Number(item.janasena)) ? 0 : parseInt(item.janasena))).reduce((a, b) => a + b, 0) ?? 0,
                        // dashboard.surveyReports2?.survey_results_by_constituency?.map((item) => (item.bjp == null || Number.isNaN(Number(item.bjp)) ? 0 : parseInt(item.bjp))).reduce((a, b) => a + b, 0) ?? 0,
                        // dashboard.surveyReports2?.survey_results_by_constituency?.map((item) => (item.congress == null || Number.isNaN(Number(item.congress)) ? 0 : parseInt(item.congress))).reduce((a, b) => a + b, 0) ?? 0,
                        // dashboard.surveyReports2?.survey_results_by_constituency?.map((item) => (item.others == null || Number.isNaN(Number(item.others)) ? 0 : parseInt(item.others))).reduce((a, b) => a + b, 0) ?? 0,
                        // dashboard.surveyReports2?.survey_results_by_constituency?.map((item) => (item.not_traced == null || Number.isNaN(Number(item.not_traced)) ? 0 : parseInt(item.not_traced))).reduce((a, b) => a + b, 0) ?? 0,
                        dashboard.surveyReports3?.map((item) => (item.lookup_valuename != "NEUTRAL" || Number.isNaN(Number(item.survey_count)) ? 0 : parseInt(item.survey_count))).reduce((a, b) => a + b, 0) ?? 0,
                        dashboard.surveyReports3?.map((item) => (item.lookup_valuename != "YSRCP" || Number.isNaN(Number(item.survey_count)) ? 0 : parseInt(item.survey_count))).reduce((a, b) => a + b, 0) ?? 0,
                        dashboard.surveyReports3?.map((item) => (item.lookup_valuename != "TDP" || Number.isNaN(Number(item.survey_count)) ? 0 : parseInt(item.survey_count))).reduce((a, b) => a + b, 0) ?? 0,
                        dashboard.surveyReports3?.map((item) => (item.lookup_valuename != "JSP" || Number.isNaN(Number(item.survey_count)) ? 0 : parseInt(item.survey_count))).reduce((a, b) => a + b, 0) ?? 0,
                        dashboard.surveyReports3?.map((item) => (item.lookup_valuename != "BJP" || Number.isNaN(Number(item.survey_count)) ? 0 : parseInt(item.survey_count))).reduce((a, b) => a + b, 0) ?? 0,
                        dashboard.surveyReports3?.map((item) => (item.lookup_valuename != "CONGRESS" || Number.isNaN(Number(item.survey_count)) ? 0 : parseInt(item.survey_count))).reduce((a, b) => a + b, 0) ?? 0,
                        dashboard.surveyReports3?.map((item) => (item.lookup_valuename != "Others" || Number.isNaN(Number(item.survey_count)) ? 0 : parseInt(item.survey_count))).reduce((a, b) => a + b, 0) ?? 0,
                        dashboard.surveyReports3?.map((item) => (item.lookup_valuename != "NOT TRACED" || Number.isNaN(Number(item.survey_count)) ? 0 : parseInt(item.survey_count))).reduce((a, b) => a + b, 0) ?? 0,
                      ],
                    },
                  ]}
                  chartColors={[NETURALColor, YSRCPColor, TDPColor, JSPColor, BJPColor, CONGRESSColor, OTHERColor, NOTTRACEDColor]}
                /> */}
                <BarChartWidget
                  showInsideValue={false}
                  title="Opinion Survey by Party"
                  distributed={true}
                  chartLabels={["Neutral", "YCP", "TDP", "JSP", "BJP", "CONGRESS", "Others", "Not Traced", "Death"]}
                  chartData={[
                    {
                      name: "Total",
                      data: [
                        dashboard.surveyReports3?.map((item) => (item.lookup_valuename != "NEUTRAL" || Number.isNaN(Number(item.survey_count)) ? 0 : parseInt(item.survey_count))).reduce((a, b) => a + b, 0) ?? 0,
                        dashboard.surveyReports3?.map((item) => (item.lookup_valuename != "YSRCP" || Number.isNaN(Number(item.survey_count)) ? 0 : parseInt(item.survey_count))).reduce((a, b) => a + b, 0) ?? 0,
                        dashboard.surveyReports3?.map((item) => (item.lookup_valuename != "TDP" || Number.isNaN(Number(item.survey_count)) ? 0 : parseInt(item.survey_count))).reduce((a, b) => a + b, 0) ?? 0,
                        dashboard.surveyReports3?.map((item) => (item.lookup_valuename != "JANASENA" || Number.isNaN(Number(item.survey_count)) ? 0 : parseInt(item.survey_count))).reduce((a, b) => a + b, 0) ?? 0,
                        dashboard.surveyReports3?.map((item) => (item.lookup_valuename != "BJP" || Number.isNaN(Number(item.survey_count)) ? 0 : parseInt(item.survey_count))).reduce((a, b) => a + b, 0) ?? 0,
                        dashboard.surveyReports3?.map((item) => (item.lookup_valuename != "Congress" || Number.isNaN(Number(item.survey_count)) ? 0 : parseInt(item.survey_count))).reduce((a, b) => a + b, 0) ?? 0,
                        dashboard.surveyReports3?.map((item) => (item.lookup_valuename != "Others" || Number.isNaN(Number(item.survey_count)) ? 0 : parseInt(item.survey_count))).reduce((a, b) => a + b, 0) ?? 0,
                        dashboard.surveyReports3?.map((item) => (item.lookup_valuename != "Not Traced" || Number.isNaN(Number(item.survey_count)) ? 0 : parseInt(item.survey_count))).reduce((a, b) => a + b, 0) ?? 0,
                        dashboard.surveyReports3?.map((item) => (item.lookup_valuename != "Death" || Number.isNaN(Number(item.survey_count)) ? 0 : parseInt(item.survey_count))).reduce((a, b) => a + b, 0) ?? 0,
                      ],
                    },
                  ]}
                  chartColors={[NETURALColor, YSRCPColor, TDPColor, JSPColor, BJPColor, CONGRESSColor, OTHERColor, NOTTRACEDColor, DEATHColor]}
                />
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={12}>
            <Card elevation={1}>
              <Box p={2}>
                <BarChartWidget
                  showDataLabelOnTop={true}
                  showLegend={false}
                  isStacked={false}
                  showBarTotal={false}
                  title="Voting Poll by Party"
                  sx={{ height: "100%" }}
                  columnWidth="90%"
                  chartLabels={["Neutral", "YCP", "TDP", "JSP", "BJP", "CONGRESS", "Others", "Not Traced", "Death"]}
                  chartColors={[
                    NETURALColor,
                    function ({ seriesIndex, dataPointIndex }) {
                      return [NETURALColor, YSRCPColor, TDPColor, JSPColor, BJPColor, CONGRESSColor, OTHERColor, NOTTRACEDColor, DEATHColor][dataPointIndex];
                    },
                  ]}
                  chartData={[
                    {
                      name: "Survey Count",
                      data: [
                        dashboard.surveyReports3?.map((item) => (item.lookup_valuename != "NEUTRAL" || Number.isNaN(Number(item.survey_count)) ? 0 : parseInt(item.survey_count - item.voted_count))).reduce((a, b) => a + b, 0) ?? 0,
                        dashboard.surveyReports3?.map((item) => (item.lookup_valuename != "YSRCP" || Number.isNaN(Number(item.survey_count)) ? 0 : parseInt(item.survey_count - item.voted_count))).reduce((a, b) => a + b, 0) ?? 0,
                        dashboard.surveyReports3?.map((item) => (item.lookup_valuename != "TDP" || Number.isNaN(Number(item.survey_count)) ? 0 : parseInt(item.survey_count - item.voted_count))).reduce((a, b) => a + b, 0) ?? 0,
                        dashboard.surveyReports3?.map((item) => (item.lookup_valuename != "JANASENA" || Number.isNaN(Number(item.survey_count)) ? 0 : parseInt(item.survey_count - item.voted_count))).reduce((a, b) => a + b, 0) ?? 0,
                        dashboard.surveyReports3?.map((item) => (item.lookup_valuename != "BJP" || Number.isNaN(Number(item.survey_count)) ? 0 : parseInt(item.survey_count - item.voted_count))).reduce((a, b) => a + b, 0) ?? 0,
                        dashboard.surveyReports3?.map((item) => (item.lookup_valuename != "Congress" || Number.isNaN(Number(item.survey_count)) ? 0 : parseInt(item.survey_count - item.voted_count))).reduce((a, b) => a + b, 0) ?? 0,
                        dashboard.surveyReports3?.map((item) => (item.lookup_valuename != "Others" || Number.isNaN(Number(item.survey_count)) ? 0 : parseInt(item.survey_count - item.voted_count))).reduce((a, b) => a + b, 0) ?? 0,
                        dashboard.surveyReports3?.map((item) => (item.lookup_valuename != "Not Traced" || Number.isNaN(Number(item.survey_count)) ? 0 : parseInt(item.survey_count - item.voted_count))).reduce((a, b) => a + b, 0) ?? 0,
                        dashboard.surveyReports3?.map((item) => (item.lookup_valuename != "Death" || Number.isNaN(Number(item.survey_count)) ? 0 : parseInt(item.survey_count - item.voted_count))).reduce((a, b) => a + b, 0) ?? 0,
                      ],
                    },
                    {
                      name: "Voting Count",
                      data: [
                        dashboard.surveyReports3?.map((item) => (item.lookup_valuename != "NEUTRAL" || Number.isNaN(Number(item.voted_count)) ? 0 : parseInt(item.voted_count))).reduce((a, b) => a + b, 0) ?? 0,
                        dashboard.surveyReports3?.map((item) => (item.lookup_valuename != "YSRCP" || Number.isNaN(Number(item.voted_count)) ? 0 : parseInt(item.voted_count))).reduce((a, b) => a + b, 0) ?? 0,
                        dashboard.surveyReports3?.map((item) => (item.lookup_valuename != "TDP" || Number.isNaN(Number(item.voted_count)) ? 0 : parseInt(item.voted_count))).reduce((a, b) => a + b, 0) ?? 0,
                        dashboard.surveyReports3?.map((item) => (item.lookup_valuename != "JSP" || Number.isNaN(Number(item.voted_count)) ? 0 : parseInt(item.voted_count))).reduce((a, b) => a + b, 0) ?? 0,
                        dashboard.surveyReports3?.map((item) => (item.lookup_valuename != "BJP" || Number.isNaN(Number(item.voted_count)) ? 0 : parseInt(item.voted_count))).reduce((a, b) => a + b, 0) ?? 0,
                        dashboard.surveyReports3?.map((item) => (item.lookup_valuename != "CONGRESS" || Number.isNaN(Number(item.voted_count)) ? 0 : parseInt(item.voted_count))).reduce((a, b) => a + b, 0) ?? 0,
                        dashboard.surveyReports3?.map((item) => (item.lookup_valuename != "Others" || Number.isNaN(Number(item.voted_count)) ? 0 : parseInt(item.voted_count))).reduce((a, b) => a + b, 0) ?? 0,
                        dashboard.surveyReports3?.map((item) => (item.lookup_valuename != "NOT TRACED" || Number.isNaN(Number(item.voted_count)) ? 0 : parseInt(item.voted_count))).reduce((a, b) => a + b, 0) ?? 0,
                        dashboard.surveyReports3?.map((item) => (item.lookup_valuename != "Death" || Number.isNaN(Number(item.voted_count)) ? 0 : parseInt(item.voted_count))).reduce((a, b) => a + b, 0) ?? 0,
                      ],
                    },

                    // {
                    //   name: "Completed",
                    //   data: [secondChartData.totalPartyVotes, ((secondChartData.totalPartyVotes / secondChartData.totalVotes) * 100).toFixed(2)],
                    // },
                    // {
                    //   name: "Pending",
                    //   data: [secondChartData.totalVotes - secondChartData.totalPartyVotes, (((secondChartData.totalVotes - secondChartData.totalPartyVotes) / secondChartData.totalVotes) * 100).toFixed(2)],
                    // },
                  ]}
                />
              </Box>
            </Card>
          </Grid>
          {account?.user.mandal_pk == null && (
            <>
              <Grid item xs={12} md={12}>
                <CustomizedTables
                  title={"Voting poll by Mandal & Party"}
                  labels={["S.No", "Mandal Name", "Total Voters", "Survey Count", "Voting Count", "Neutral", "YCP", "TDP", "JSP", "BJP", "CONGRESS", "Others", "Not Traced", "Death"]}
                  onRowClick={(index) => handleDivisionList(dashboard.votingSurveyResult?.voting_poll_result_by_constituency[index])}
                  rows={dashboard.votingSurveyResult?.voting_poll_result_by_constituency?.map((item, index) => {
                    const partyVotes = [parseInt(item.ysrcp ?? 0), parseInt(item.tdp ?? 0), parseInt(item.janasena ?? 0), parseInt(item.bjp ?? 0), parseInt(item.congress ?? 0)];
                    const maxVotes = Math.max(...partyVotes);
                    const minVotes = Math.min(...partyVotes);

                    return [
                      index + 1,
                      item.mandal_name,
                      item.total_voters_by_mandal ?? 0,
                      // parseInt(item.neutral) + parseInt(item.ysrcp) + parseInt(item.tdp) + parseInt(item.janasena) + parseInt(item.bjp) + parseInt(item.congress) + parseInt(item.others) + parseInt(item.not_traced) || 0,
                      item.survey_count ?? 0,
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
                    dashboard.votingSurveyResult?.all_totals?.total_voters_count ?? 0,
                    // dashboard.surveyReports3?.all_totals?.neutral_count +
                    //   dashboard.surveyReports3?.all_totals?.ycp_count +
                    //   dashboard.surveyReports3?.all_totals?.tdp_count +
                    //   dashboard.surveyReports3?.all_totals?.jsp_count +
                    //   dashboard.surveyReports3?.all_totals?.bjp_count +
                    //   dashboard.surveyReports3?.all_totals?.congress_count +
                    //   dashboard.surveyReports3?.all_totals?.others_count +
                    //   dashboard.surveyReports3?.all_totals?.not_traced_count,
                    dashboard.votingSurveyResult?.all_totals?.total_survey_count ?? 0,
                    dashboard.votingSurveyResult?.all_totals?.total_voting_count ?? 0,
                    dashboard.votingSurveyResult?.all_totals?.neutral_count ?? 0,
                    dashboard.votingSurveyResult?.all_totals?.ycp_count ?? 0,
                    dashboard.votingSurveyResult?.all_totals?.tdp_count ?? 0,
                    dashboard.votingSurveyResult?.all_totals?.jsp_count ?? 0,
                    dashboard.votingSurveyResult?.all_totals?.bjp_count ?? 0,
                    dashboard.votingSurveyResult?.all_totals?.congress_count ?? 0,
                    dashboard.votingSurveyResult?.all_totals?.others_count ?? 0,
                    dashboard.votingSurveyResult?.all_totals?.not_traced_count ?? 0,
                    dashboard.votingSurveyResult?.all_totals?.death_count ?? 0,
                  ]}
                />
              </Grid>
              <Grid item xs={12} md={12}>
                <CustomizedTables
                  title={"Voting poll % by Mandal & Party"}
                  labels={["S.No", "Mandal Name", "Neutral", "YCP", "TDP", "JSP", "BJP", "CONGRESS", "Others", "Not Traced", "Death", "Total"]}
                  rows={dashboard.votingSurveyResult?.voting_poll_result_by_constituency?.map((item, index) => {
                    const partyVotes = [parseFloat(item.ysrcp_percent ?? 0), parseFloat(item.tdp_percent ?? 0), parseFloat(item.janasena_percent ?? 0), parseFloat(item.bjp_percent ?? 0), parseFloat(item.congress_percent ?? 0)];
                    const maxVotes = Math.max(...partyVotes);
                    const minVotes = Math.min(...partyVotes);

                    return [
                      index + 1,
                      item.mandal_name,
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

          {isDivLoading && (
            <Box minHeight={200} display="flex" justifyContent="center" alignItems="center" width="100%">
              <CircularProgress />
            </Box>
          )}
          {!isDivLoading && resultDivisions != null && (
            <>
              <Grid item xs={12} md={12}>
                <CustomizedTables
                  title={`Voting poll by Divsion & Party - ${divTitle}`}
                  labels={["S.No", "Division Name", "Survey Count", "Voting Count", "Neutral", "YCP", "TDP", "JSP", "BJP", "CONGRESS", "Others", "Not Traced", "Death"]}
                  onRowClick={(index) => handleSachivalayamList(resultDivisions.voting_poll_result_by_division[index])}
                  rows={resultDivisions.voting_poll_result_by_division?.map((item, index) => {
                    const partyVotes = [parseInt(item.ysrcp ?? 0), parseInt(item.tdp ?? 0), parseInt(item.janasena ?? 0), parseInt(item.bjp ?? 0), parseInt(item.congress ?? 0)];
                    const maxVotes = Math.max(...partyVotes);
                    const minVotes = Math.min(...partyVotes);

                    return [
                      index + 1,
                      item.division_name,
                      // parseInt(item.neutral) + parseInt(item.ysrcp) + parseInt(item.tdp) + parseInt(item.janasena) + parseInt(item.bjp) + parseInt(item.congress) + parseInt(item.others) + parseInt(item.not_traced) || 0,
                      item.survey_count ?? 0,
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
                  title={`Voting poll % by Divsion & Party - ${divTitle}`}
                  labels={["S.No", "Division Name", "Neutral", "YCP", "TDP", "JSP", "BJP", "CONGRESS", "Others", "Not Traced", "Death", "Total"]}
                  rows={resultDivisions.voting_poll_result_by_division?.map((item, index) => {
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
                  title={`Voting poll by Sachivalayam & Party - ${sachiTitle}`}
                  labels={["S.No", "Sachivalayam Name", "Survey Count", "Voting Count", "Neutral", "YCP", "TDP", "JSP", "BJP", "CONGRESS", "Others", "Not Traced", "Death"]}
                  onRowClick={(index) => handlePartList(resultSachivalyams.voting_poll_result_by_sachivalayam[index])}
                  rows={resultSachivalyams.voting_poll_result_by_sachivalayam?.map((item, index) => {
                    const partyVotes = [parseInt(item.ysrcp ?? 0), parseInt(item.tdp ?? 0), parseInt(item.janasena ?? 0), parseInt(item.bjp ?? 0), parseInt(item.congress ?? 0)];
                    const maxVotes = Math.max(...partyVotes);
                    const minVotes = Math.min(...partyVotes);

                    return [
                      index + 1,
                      item.sachivalayam_name,
                      // parseInt(item.neutral) + parseInt(item.ysrcp) + parseInt(item.tdp) + parseInt(item.janasena) + parseInt(item.bjp) + parseInt(item.congress) + parseInt(item.others) + parseInt(item.not_traced) || 0,
                      item.survey_count ?? 0,
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
                  title={`Voting poll % by Sachivalayam & Party - ${sachiTitle}`}
                  labels={["S.No", "Sachivalayam Name", "Neutral", "YCP", "TDP", "JSP", "BJP", "CONGRESS", "Others", "Not Traced", "Death", "Total"]}
                  rows={resultSachivalyams.voting_poll_result_by_sachivalayam?.map((item, index) => {
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
                  title={`Voting poll by Part & Party - ${partsTitle}`}
                  labels={["S.No", "Part Name", "Survey Count", "Voting Count", "Neutral", "YCP", "TDP", "JSP", "BJP", "CONGRESS", "Others", "Not Traced", "Death"]}
                  rows={resultParts.voting_poll_result_by_parts?.map((item, index) => {
                    const partyVotes = [parseInt(item.ysrcp ?? 0), parseInt(item.tdp ?? 0), parseInt(item.janasena ?? 0), parseInt(item.bjp ?? 0), parseInt(item.congress ?? 0)];
                    const maxVotes = Math.max(...partyVotes);
                    const minVotes = Math.min(...partyVotes);

                    return [
                      index + 1,
                      item.part_no,
                      // parseInt(item.neutral) + parseInt(item.ysrcp) + parseInt(item.tdp) + parseInt(item.janasena) + parseInt(item.bjp) + parseInt(item.congress) + parseInt(item.others) + parseInt(item.not_traced) || 0,
                      item.survey_count ?? 0,
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
                  title={`Voting poll % by Part & Party - ${partsTitle}`}
                  labels={["S.No", "Part Name", "Neutral", "YCP", "TDP", "JSP", "BJP", "CONGRESS", "Others", "Not Traced", "Death", "Total"]}
                  rows={resultParts.voting_poll_result_by_parts?.map((item, index) => {
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
  getVotingResults,
  clearDashboardReducer,
})(VotingPollSurveyReportsList);
