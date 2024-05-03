import ReactApexChart from "react-apexcharts";
import { Box, Card, CardHeader } from "@mui/material";
import { fNumber } from "../../utils/formatNumber";
import { useChart } from "../../components/chart";

export default function BarChartWidget({
  title,
  subheader,
  chartLabels,
  chartData,
  chartColors,
  distributed = false,
  withCard = true,
  showInsideValue = true,
  columnWidth,
  showBarTotal = true,
  isStacked = true,
  showLegend = true,
  showDataLabelOnTop = false,
  ...other
}) {
  const showDataLabelValue = showDataLabelOnTop
    ? {
        offsetY: -20,
        style: {
          colors: ["#000000"],
        },
      }
    : {};

  const chartOptions = useChart({
    chart: { stacked: isStacked },
    colors: chartColors,
    dataLabels: {
      enabled: showInsideValue,
      ...showDataLabelValue,
    },
    plotOptions: {
      bar: {
        borderRadius: 2,
        distributed: distributed,
        columnWidth: columnWidth,

        dataLabels: {
          position: "top",
          total: {
            enabled: showBarTotal,
          },
        },
      },
    },
    legend: {
      show: showLegend,
    },
    xaxis: {
      categories: chartLabels,
      tickAmount: 6,
      labels: {
        rotate: 0,
        style: {
          fontSize: "10px",
        },
      },
    },
  });

  // function updateFontSize() {
  //   if (window.innerWidth < 600) {
  //     chartOptions.xaxis.labels.style.fontSize = "8px";
  //   } else if (window.innerWidth < 900) {
  //     chartOptions.xaxis.labels.style.fontSize = "10px";
  //   } else {
  //     chartOptions.xaxis.labels.style.fontSize = "12px";
  //   }
  // }

  // // listen for window resize events
  // window.addEventListener("resize", updateFontSize);
  // // initial font size update
  // updateFontSize();
  const chartComponent = <ReactApexChart type="bar" series={chartData} options={chartOptions} height={352} />;

  if (withCard)
    return (
      <Card
        style={{
          boxShadow: "0px 0px 5px #969696",
        }}
        {...other}
      >
        <CardHeader title={title} subheader={subheader} />

        <Box sx={{ mx: 3 }} dir="ltr">
          {chartComponent}
        </Box>
      </Card>
    );

  return chartComponent;
}
