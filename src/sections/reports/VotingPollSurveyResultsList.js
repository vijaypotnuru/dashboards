import { useEffect, useState, useRef, useCallback } from "react";
import { Typography, Card, Stack, Grid, Switch, Divider, Box, CircularProgress, TextField, TableContainer, Table, TableRow, TableBody, TableHead, TableCell, TableFooter, Paper } from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { connect } from "react-redux";
import { showAlert } from "../../actions/alert";
import { LoadingButton } from "@mui/lab";
import SearchByFilter from "../common/SearchByFilter";
import { getOpinionResults, clearDashboardReducer, getVotingResults } from "../../actions/dashboard";
import { BarChartWidget } from "../common";
import { BJPColor, CONGRESSColor, JSPColor, NETURALColor, NOTTRACEDColor, OTHERColor, TDPColor, YSRCPColor } from "../../utils/constants";
import { PUBLIC_URL, ROWS_PER_PAGE_OPTION, searchFiltercolor } from "../../constants";
import { Link, useLocation } from "react-router-dom";
import { RHFAutoComplete } from "../../components/hook-form";
import { da, is } from "date-fns/locale";
import VotingPollSurveyList from "./VotingPollSurveyList";
import CustomMuiDataTable from "../../components/CustomMuiDataTable";
import { set } from "date-fns";
import * as Colors from "../../utils/constants";
import AnalyticsCard from "../common/AnalyticsCard";

const VotingPollSurveyResultsList = ({ dashboard, getOpinionResults, getVotingResults, clearDashboardReducer, account, common }) => {
  const [filterValues, setFilterValues] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [reset, setReset] = useState(false);

  const [voterHeader, setVoterHeader] = useState([]);
  const [percentageHeader, setPercentageHeader] = useState([]);
  const [voterResultData, setVoterResultData] = useState([]);
  const [percentageResultData, setPercentageResultData] = useState([]);

  const [otherFilterValues, setOtherFilterValues] = useState({
    district_id: null,
    consistency_id: null,
    intrested_party: null,
    is_resident: null,
  });

  useEffect(() => {
    clearDashboardReducer();
  }, []);

  useEffect(() => {
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

    calculateVotingResult();
  }, [dashboard.votingSurveyResult]);

  const calculateVotingResult = (result) => {
    var headerList = [];
    var headerList2 = [];
    const result_byconstituency_total = [];
    const percentage_byconstituency_total = [];

    if (Array.isArray(dashboard?.votingSurveyResult)) {
      dashboard?.votingSurveyResult.forEach((item) => {
        var index = headerList.findIndex((x) => x.id === item.lookup_pk);
        if (index === -1) {
          headerList.push({ id: item.lookup_pk, name: item.lookup_valuename });
        }

        var cons_index = result_byconstituency_total.findIndex((e) => e.constituency_pk === item.constituency_pk);

        if (cons_index !== -1) {
          if (item.survey_count != null) {
            var interested_index = result_byconstituency_total[cons_index].interested_party.findIndex((e) => e.id === item.interested_party);
            if (interested_index != -1) {
              var count = result_byconstituency_total[cons_index].interested_party[interested_index].votes + Number(item.survey_count);
              result_byconstituency_total[cons_index].interested_party[interested_index].votes = count;
              result_byconstituency_total[cons_index].interested_party[interested_index].percent = (count / item.cons_voters_count) * 100;
            } else {
              result_byconstituency_total[cons_index].interested_party.push({
                id: item.lookup_pk,
                name: item.lookup_valuename,
                votes: Number(item.survey_count),
                percent: (Number(item.survey_count) / item.cons_voters_count) * 100,
              });
            }
          }

          if (item.voted_count != null) {
            var voted_index = result_byconstituency_total[cons_index].voted_party.findIndex((e) => e.id === item.voted_party);
            if (voted_index != -1) {
              result_byconstituency_total[cons_index].voted_party[voted_index].votes += Number(item.voted_count);
            } else {
              result_byconstituency_total[cons_index].voted_party.push({
                id: item.lookup_pk,
                name: item.lookup_valuename,
                votes: Number(item.voted_count),
                percent: (Number(item.voted_count) / item.cons_voters_count) * 100,
              });
            }
          }

          // interested_party_total[cons_index].push({
          //   party_name: item.party_name,
          //   party_votes: item.party_votes,
          // });
        } else {
          var newItem = {
            ...item,
            district_pk: item.district_pk,
            district_name: item.district_name,
            constituency_pk: item.constituency_pk,
            constituency_name: item.constituency_name,
            interested_party:
              item.survey_count != null
                ? [
                    {
                      id: item.lookup_pk,
                      name: item.lookup_valuename,
                      votes: Number(item.survey_count),
                      percent: (Number(item.survey_count) / item.cons_voters_count) * 100,
                    },
                  ]
                : [],
            voted_party:
              item.voted_count != null
                ? [
                    {
                      id: item.lookup_pk,
                      name: item.lookup_valuename,
                      votes: Number(item.voted_count),
                      percent: (Number(item.voted_count) / item.cons_voters_count) * 100,
                    },
                  ]
                : [],
            cons_voters_count: item.cons_voters_count,
          };

          console.log("newItem", newItem);

          result_byconstituency_total.push(newItem);
        }
      });
    } else {
      console.error("dashboard.votingSurveyResult is not an array");
    }

    console.log("result_byconstituency_total", result_byconstituency_total);

    const filteredData = result_byconstituency_total.map((item) => {
      console.log("itesdasdadadm", item);
      const newInterestedParty = item.interested_party.filter((item) => item.id !== null);
      const newVotedParty = item.voted_party.filter((item) => item.id !== null);
      return {
        ...item,
        interested_party: newInterestedParty,
        voted_party: newVotedParty,
      };
    });

    const newHeaderList = headerList.filter((item) => item.id !== null);
    console.log("headerLi7777st8888888", newHeaderList);
    setVoterHeader(newHeaderList);
    setVoterResultData(filteredData);
  };

  const handleSubmit = async (filterValues) => {
    const jsonData = {
      ...filterValues,
      intrested_party: otherFilterValues.intrested_party?.value ?? null,
      is_resident: otherFilterValues.is_resident?.value ?? null,
    };

    await getVotingResults(jsonData);
  };

  let isClearActive = otherFilterValues.intrested_party != null || otherFilterValues.is_resident != null;

  const columns = [
    {
      name: "district_name",
      label: "District",
    },
    {
      name: "constituency_no",
      label: "Constituency No",
    },
    {
      name: "constituency_name",
      label: "Constituency",
      options: {
        customBodyRender: (value, tableMeta, updateValue) => {
          console.log("546126546516531216323213", tableMeta.rowData[5]);
          const filterParties = tableMeta.rowData[6].filter((item) => item.id !== 22 && item.id !== 25 && item.id !== 26);
          const highestParty = tableMeta.rowData[6].find((item) => item?.isHighest == true);

          console.log("highestParty", highestParty);

          if (highestParty) {
            if (highestParty.id == 25 || highestParty.id == 26 || highestParty.id == 22) {
              return (
                <Typography
                  sx={{
                    display: "flex",
                  }}
                >
                  {<Link to="/voting-poll-survey/reports">{value}</Link>} <PersonOutlineIcon sx={{ width: "20px", height: "20px", marginLeft: "8px" }} />
                </Typography>
              );
            }

            return (
              <Typography
                sx={{
                  display: "flex",
                }}
              >
                {<Link to="/voting-poll-survey/reports">{value}</Link>} <Box component="img" src={PUBLIC_URL + `/static/partieslogos/${highestParty.id}.png`} sx={{ width: "20px", height: "20px", marginLeft: "8px" }} />
              </Typography>
            );
          }
          return (
            <Typography variant="body2" color="textSecondary">
              {<Link to="/voting-poll-survey/reports">{value}</Link>}
            </Typography>
          );
        },
      },
    },
    {
      name: "cons_voters_count",
      label: "Constituency Votes",
    },
    {
      name: "interested_party",
      label: "Opinion Survey",
      options: {
        customBodyRender: (value, tableMeta, updateValue) => {
          let total = 0;

          for (let item of value) {
            total += item.votes;
          }

          return total;
        },
      },
    },
    {
      name: "voted_party",
      label: "Voting Count",
      options: {
        customBodyRender: (value, tableMeta, updateValue) => {
          let total = 0;

          for (let item of value) {
            total += item.votes;
          }

          return total;
        },
      },
    },
    ...voterHeader.map((item) => ({
      name: "voted_party",
      label: item.name,
      options: {
        customBodyRender: (value, tableMeta, updateValue) => {
          // let total = 0;

          console.log("value4789651320", value);

          let voteCount = value.find((x) => x.id === item.id)?.votes ?? 0;
          console.log("voteCount", voteCount);

          // find if this party is higher than other parties if it is true then show arrow up else show arrow down

          // let isHigher =
          //   value.find((x) => x.id === item.id)?.votes >
          //   Math.max(
          //     ...value.map((x) => {
          //       let sameParty = x.id === item.id;
          //       if (sameParty) {
          //         return 0;
          //       }
          //       console.log("x_votes", x);
          //       return x.votes;
          //     })
          //   );

          // this wrong let try another approach ok
          let otherParties = value.filter((x) => x.id !== item.id);
          let findTheSameVotes = otherParties.map((x) => x.votes);

          let isHigher = value.find((x) => x.id === item.id)?.isHighest ?? false;

          console.log("isHigher123", isHigher, "voted_party", value);

          const currentParty = value.find((x) => x.id === item.id);
          if (currentParty) {
            if (currentParty.id == 22 || currentParty.id == 25 || currentParty.id == 26) {
              console.log("currentParty", currentParty);
              return (
                <>
                  {voteCount} {isHigher ? "" : <ArrowDropDownIcon style={{ color: "red" }} />}
                </>
              );
            }
          }

          return (
            <>
              {voteCount} {isHigher ? <ArrowDropUpIcon style={{ color: "green" }} /> : <ArrowDropDownIcon style={{ color: "red" }} />}
            </>
          );
        },
      },
    })),
  ];

  const options = {
    elevation: 0,
    selectableRows: "none",
    responsive: "standard",
    rowsPerPageOptions: ROWS_PER_PAGE_OPTION,
    rowsPerPage: 100,
    download: false,
    print: false,
    viewColumns: false,
    filter: false,
  };

  const columns2 = [
    {
      name: "district_name",
      label: "District",
    },
    {
      name: "constituency_no",
      label: "Constituency No",
    },
    {
      name: "constituency_name",
      label: "Constituency",
      options: {
        customBodyRender: (value, tableMeta, updateValue) => {
          const filterParties = tableMeta.rowData[6].filter((item) => item.id !== 22 && item.id !== 25 && item.id !== 26);
          const highestParty = tableMeta.rowData[6].find((item) => item?.isHighest == true);
          console.log("highestPar845612ty", highestParty);

          console.log("highestParty", highestParty);

          if (highestParty) {
            if (highestParty.id == 25 || highestParty.id == 26 || highestParty.id == 22) {
              return (
                <Typography
                  sx={{
                    display: "flex",
                  }}
                >
                  {value} <PersonOutlineIcon sx={{ width: "20px", height: "20px", marginLeft: "8px" }} />
                </Typography>
              );
            }
            return (
              <Typography
                sx={{
                  display: "flex",
                }}
              >
                {value} <Box component="img" src={PUBLIC_URL + `/static/partieslogos/${highestParty.id}.png`} sx={{ width: "20px", height: "20px", marginLeft: "8px" }} />
              </Typography>
            );
          }
          return (
            <Typography variant="body2" color="textSecondary">
              {value}
            </Typography>
          );
        },
      },
    },
    {
      name: "cons_voters_count",
      label: "Total Votes",
    },

    {
      name: "interested_party",
      label: "Opinion",
      options: {
        customBodyRender: (value, tableMeta, updateValue) => {
          let total = 0;

          for (let item of value) {
            total += item.votes;
          }

          let result = (total / tableMeta.rowData[3]) * 100;

          if (isNaN(result)) {
            return "0%";
          } else {
            return result.toFixed(2) + "%";
          }
        },
      },
    },
    {
      name: "voted_party",
      label: "Voting",
      options: {
        customBodyRender: (value, tableMeta, updateValue) => {
          let total = 0;

          for (let item of value) {
            total += item.votes;
          }

          let result = (total / tableMeta.rowData[3]) * 100;

          if (isNaN(result)) {
            return "0%";
          } else {
            return result.toFixed(2) + "%";
          }
        },
      },
    },
    ...voterHeader.map((item) => ({
      name: "voted_party",
      label: item.name,
      options: {
        customBodyRender: (value, tableMeta, updateValue) => {
          let voteCount = value.find((x) => x.id === item.id)?.percent?.toFixed(2) ?? 0;

          let isHigher = value.find((x) => x.id === item.id)?.isHighest ?? false;

          console.log("isHighe485612r", isHigher, "voted_party", value);

          const currentParty = value.find((x) => x.id === item.id);
          if (currentParty) {
            if (currentParty.id == 22 || currentParty.id == 25 || currentParty.id == 26) {
              console.log("currentParty", currentParty);
              return (
                <>
                  {voteCount + "%"} {isHigher ? "" : <ArrowDropDownIcon style={{ color: "red" }} />}
                </>
              );
            }
          }

          return (
            <>
              {voteCount + "%"} {isHigher ? <ArrowDropUpIcon style={{ color: "green" }} /> : <ArrowDropDownIcon style={{ color: "red" }} />}
            </>
          );
        },
      },
    })),
  ];

  console.log("voterResultDat4561320a4512", voterResultData);
  console.log("voterHeader", voterHeader);
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

  voterResultData.forEach((item, index) => {
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
          const partyIndex = voterResultData[index].voted_party.findIndex((party) => party.id === firstParty.id);

          console.log("highestParty7894651", voterResultData[index].voted_party[partyIndex], partyIndex);
          voterResultData[index].voted_party[partyIndex].isHighest = true;
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

  console.log("voterResultData54564", voterResultData);

  console.log("845612efds6541efwds651", (((secondChartData?.totalPartyVotes || 0) / (secondChartData?.totalVotes || 1)) * 100).toFixed(2));

  let sortedParties = [...(common?.parties ?? [])].sort((a, b) => a.label.localeCompare(b.label));

  return (
    <>
      <Card sx={{ p: 3, backgroundColor: searchFiltercolor }}>
        <Grid container spacing={2} alignItems="center">
          <SearchByFilter
            showDistrict={true}
            showMandal={false}
            showDivision={false}
            showSachivalayam={false}
            showPartNo={false}
            showVillage={false}
            showOtherFilters={false}
            isClearActive={isClearActive}
            onSubmit={handleSubmit}
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

      {!dashboard.isLoading && dashboard.votingSurveyResult && (
        <Grid container spacing={1}>
          <Grid item xs={12} md={6}>
            <Card elevation={1}>
              <Box p={2}>
                <BarChartWidget
                  showInsideValue={false}
                  title="Leading by Party"
                  distributed={true}
                  chartLabels={[...partiesWithScores.map((item) => item.name)]}
                  chartData={[
                    {
                      name: "Total",
                      data: [...partiesWithScores.map((item) => item.score)],
                    },
                  ]}
                  chartColors={[...partiesWithScores.map((item) => item.color)]}
                />
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card elevation={1}>
              <Box p={2}>
                <BarChartWidget
                  columnWidth="50%"
                  isStacked={false}
                  title="Voting Poll Status"
                  sx={{ height: "100%" }}
                  chartLabels={["Count", "Percentage"]}
                  chartColors={[Colors.CancelColor, Colors.OpenColor]}
                  chartData={[
                    {
                      name: "Completed",
                      data: [secondChartData?.totalPartyVotes, (((secondChartData?.totalPartyVotes || 0) / (secondChartData?.totalVotes || 1)) * 100).toFixed(2)],
                      // data: [secondChartData?.totalPartyVotes],
                    },
                    {
                      name: "Pending",
                      data: [secondChartData?.totalVotes - secondChartData?.totalPartyVotes, (((secondChartData?.totalVotes - secondChartData?.totalPartyVotes || 0) / (secondChartData?.totalVotes || 1)) * 100).toFixed(2)],
                      // data: [secondChartData?.totalVotes - secondChartData?.totalPartyVotes],
                    },
                  ]}
                />
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={12}>
            <Box p={2} />
            <AnalyticsCard
              names={["State Level Voters", "Voting Completed", "Voting Pending"]}
              values={[dashboard?.surveyReportCardData?.state_lavel_voters ?? 0, dashboard?.surveyReportCardData?.voting_completed ?? 0, dashboard?.surveyReportCardData?.voting_pending ?? 0]}
            />
            <Box p={2} />
            <CustomMuiDataTable title="" columns={columns} data={voterResultData} options={options} />
            <Box p={2} />
            <CustomMuiDataTable title="" columns={columns2} data={voterResultData} options={options} />
          </Grid>
        </Grid>
      )}
    </>
  );
};

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
})(VotingPollSurveyResultsList);
