import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Box from "@mui/material/Box";
import { LoadingButton } from "@mui/lab";
import { download, generateCsv, mkConfig } from "export-to-csv";

const DownloadExcelSheet = ({ common, showpopup, getTableVotersData, handleClose }) => {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleDownload = async (limit) => {
    setIsLoading(true);
    var response = await getTableVotersData(limit);
    console.log("re12345", response);
    setIsLoading(false);

    const tableData = response.map((row, index) => {
      const party = common.parties.filter((item) => item.value == row.opinionparty);
      console.log("party12354648789", party, row.data);
      // const category = common.newCategory.filter((item) => item.value == row.data[12]);
      // console.log("category123", category);

      const voterType = common.voterTypes.filter((item) => item.value == row.voter_type);

      return {
        Slno: index + 1,
        Part_No: row?.part_no ?? "-",
        Part_Slno: row?.part_slno  ?? "-",
        Voter_Id: row?.voter_id ?? "-",
        Voter_Name: row?.voter_name ?? "-",
        Guardian: row?.guardian_type ?? "-",
        Guardian_Name: row?.guardian_name ?? "-",
        Gender: row?.gender_type ?? "-",
        Age: row?.voter_age ?? "-",
        Permanentaddress: ` ${row?.permenent_address ?? "-"} `,
        Phone: row?.voter_phone_no ?? "-",
        Religion: row?.religion_name ?? "-",
        Category: row?.category_name ?? "-",
        Caste: row?.caste_name ?? "-",
        Voter_Type: voterType[0]?.label ?? "-",
        Disability: row.disability == 1 ? "Yes" : "No",
        Govt_Employee: row.govt_employee == 1 ? "Yes" : "No",
        Residential: row.is_resident == 1 ? "Yes" : "No",
        Current_Address: row?.current_address ?? "-",
        State: row?.nr_state ?? "-",
        City: row?.nr_city ?? "-",
        Party: party[0]?.label ?? "-",
        Surveyed_By: row?.surveyed_by ?? "-",
      };
    });

    const csvConfig = mkConfig({ useKeysAsHeaders: true });
    const csv = generateCsv(csvConfig)(tableData);
    download(csvConfig)(csv);
    handleClose();
  };

  return (
    <React.Fragment>
      <Dialog
        open={showpopup}
        onClose={handleClose}
        PaperProps={{
          component: "form",
          onSubmit: (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries(formData.entries());
            const limit = formJson.limit;
            handleDownload(limit);
            // handleClose();
          },
        }}
      >
        <DialogTitle>Download</DialogTitle>
        <DialogContent>
          <DialogContentText>Download Excel Sheet (Max Limit: 60000)</DialogContentText>
          <Box p={1} />
          <TextField
            autoFocus
            required
            margin="dense"
            name="limit"
            label="Enter The Value"
            type="number"
            fullWidth
            inputProps={{
              max: 60000,
              min: 1,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <LoadingButton variant="contained" loading={isLoading} type="submit">
            Download Now
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default DownloadExcelSheet;
