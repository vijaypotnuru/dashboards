import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useEffect, useState } from "react";
import { Box, IconButton, Dialog, MenuItem, Grid, Radio, DialogContent, DialogTitle, FormControlLabel, DialogActions, Button, Typography, FormLabel, createFilterOptions } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import RadioGroup from "@mui/material/RadioGroup";
import Tooltip from "@material-ui/core/Tooltip";
import NoteAltIcon from "@mui/icons-material/NoteAlt";
import { PARTY_ID, casteList, getTicketColorByValue, phoneRegExp, religionList } from "../../constants";
import { LoadingButton } from "@mui/lab";
import EditIcon from "@mui/icons-material/Edit";
import { BJPRadio, CongressRadio, JSPRadio, NeutralRadio, OthersRadio, TDPRadio, YCPRadio } from "./PartyRadioButtons";
import { FormProvider, RHFAutoComplete, RHFRadio, RHFTextField } from "../../components/hook-form";
import { connect } from "react-redux";
import { showAlert } from "../../actions/alert";
import { updateVoterDetails } from "../../actions/voter";

const filter = createFilterOptions();

const WriteVottingReason = ({ account, common, voterData, showAlert, updateVoterDetails, isActive, pageActions }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const [religion, setReligion] = useState(null);
  const [caste, setCaste] = useState(null);

  useEffect(() => {
    if (open) {
      reset(defaultValues);
      setReligion(common.religion.find((e) => e.value == voterData.religion_id) ?? null);
      setCaste(common.caste.find((e) => e.value == voterData.caste_id) ?? null);
    }
  }, [open]);

  // const schema = Yup.object().shape({
  //   phone_no: Yup.string()
  //     .matches(phoneRegExp, "Phone number is not valid")
  //     .min(10, "Phone number must be at least 10 digits")
  //     .required("Phone number is required"),
  //   is_resident: Yup.string().required("Resident status is required"),
  //   religion_id: Yup.string().required("Religion is required"),
  //   caste_id: Yup.string().required("Caste is required"),
  //   disability: Yup.string().required("Disability status is required"),
  //   govt_employee: Yup.string().required(
  //     "Government employee status is required"
  //   ),
  //   current_address: Yup.string().required("Current address is required"),
  //   permenent_address: Yup.string().required("Permanent address is required"),
  //   intrested_party: Yup.string().required("Interested party is required"),
  // });

  const schema = Yup.object().shape({
    reason: Yup.string().required("Reason is required"),
  });

  const defaultValues = {
    reason: voterData?.voting_reason ?? "",
  };

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const { handleSubmit, reset, watch } = methods;

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      console.log("data2345678tyuyuuyu", data);

      const jsonData = {
        ...data,
        navaratnalu_id: 10,
        volunteer_id: account.user.user_pk,
        createdby: account.user.user_pk,
        updatedby: account.user.user_pk,
        voting_reason: data.reason,
        status_id: 1,
        ticket_type: "voting",
      };

      console.log("jsonData744444444", jsonData);

      var result = await updateVoterDetails(voterData.voter_pkk, jsonData, voterData, account);

      showAlert({ text: "Voting Reason Submit", color: "success" });
      handleClose();

      setLoading(false);
    } catch (error) {
      console.log("error", error);
      showAlert({ text: "Something went wrong", color: "error" });
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const iconColor = getTicketColorByValue(voterData.status_id);
  console.log("voterData", voterData);

  return (
    <>
      <IconButton
        onClick={() => setOpen(true)}
        // sx={{
        //   p: 0,
        //   color: iconColor,
        // }}
      >
        <NoteAltIcon />
      </IconButton>

      <Dialog open={open} onClose={handleClose}>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle
            sx={{
              fontWeight: 600,
            }}
          >
            Write Reason
          </DialogTitle>
          <DialogContent>
            <Box py={1}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3, width: "100%" }}>
                <Typography
                  sx={{
                    marginRight: 28,
                  }}
                >
                  Voter ID: {voterData.voter_id}
                </Typography>
                <Typography sx={{}}>Name: {voterData.voter_name}</Typography>
              </Box>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={12} lg={12}>
                  <RHFTextField name="reason" label="Write Reason..." fullWidth multiline rows={4} disabled={voterData?.voting_reason != null} />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleClose} variant="contained" color="error">
              Cancel
            </Button>
            <Tooltip title={pageActions.survey_perm != 1 ? "You don't have access to submit" : ""}>
              <span>
                <LoadingButton type="submit" variant="contained" loading={isLoading} disabled={pageActions.survey_perm != 1 || voterData?.voting_reason != null}>
                  Submit
                </LoadingButton>
              </span>
            </Tooltip>
          </DialogActions>
        </FormProvider>
      </Dialog>
    </>
  );
};

const mapStateToProps = (state) => {
  return {
    common: state.common,
    account: state.auth,
  };
};

export default connect(mapStateToProps, { showAlert, updateVoterDetails })(WriteVottingReason);
