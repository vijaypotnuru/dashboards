import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useEffect, useState } from "react";
import { Box, IconButton, Dialog, MenuItem, Grid, Radio, DialogContent, DialogTitle, FormControlLabel, DialogActions, Button, Typography, FormLabel, createFilterOptions } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import RadioGroup from "@mui/material/RadioGroup";
import Tooltip from "@material-ui/core/Tooltip";

import { PARTY_ID, casteList, getTicketColorByValue, phoneRegExp, religionList } from "../../constants";
import { LoadingButton } from "@mui/lab";
import EditIcon from "@mui/icons-material/Edit";
import { BJPRadio, CongressRadio, CustomRadio, JSPRadio, NeutralRadio, OthersRadio, TDPRadio, YCPRadio } from "./PartyRadioButtons";
import { FormProvider, RHFAutoComplete, RHFRadio, RHFTextField } from "../../components/hook-form";
import { connect } from "react-redux";
import { showAlert } from "../../actions/alert";
import { updateVoterDetails } from "../../actions/voter";
import { set } from "date-fns";

const filter = createFilterOptions();

const UpdateVoterDialog = ({ account, common, voterData, showAlert, updateVoterDetails, isActive, pageActions }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const [religion, setReligion] = useState(null);
  const [caste, setCaste] = useState(null);
  const [voterType, setVoterType] = useState(null);
  const [category, setCategory] = useState(null);
  console.log(category, "categodsdasry4512");
  // function titleCase(string) {
  //   return string
  //     .trim()
  //     .toLowerCase()
  //     .split(" ")
  //     .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  //     .join(" ");
  // }
  const isNew = voterData?.ticket_master_pk == null;
  const voterStatusId = voterData?.status_id == null;

  console.log("isVolunteer", voterStatusId);

  const titleCase = (str) => {
    str = str.trim(); // remove side spaces
    return str
      .toLowerCase()
      .split("")
      .map(function (char, index, arr) {
        if (index === 0 || arr[index - 1] === " ") {
          return char.toUpperCase();
        } else {
          return char;
        }
      })
      .join("");
  };

  useEffect(() => {
    if (open) {
      reset(defaultValues);
      setReligion(common.newReligion.find((e) => e.value == voterData.religion_id) ?? null);
      setCategory(common.newCategory.find((e) => e.value == voterData.category_id) ?? null);
      setCaste(common.newCaste.find((e) => e.value == voterData.caste_id) ?? null);
      setVoterType(common.voterTypes.find((e) => e.value == voterData.voter_type) ?? null);
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
    phone_no: Yup.string().matches(phoneRegExp, "Phone number is not valid").min(10, "Phone number must be at least 10 digits").required("Phone number is required"),
    is_resident: Yup.string().required("Resident status is required"),
    // religion_id: Yup.string().required("Religion is required"),
    // caste_id: Yup.string().required("Caste is required"),
    caste_name: Yup.string()
      .required("Caste is required")
      .transform((_, originalValue) => {
        return titleCase(originalValue);
      }),
    disability: Yup.string().required("Disability status is required"),
    govt_employee: Yup.string().required("Government employee status is required"),
    current_address: Yup.string(),
    permenent_address: Yup.string().required("Permanent address is required"),
    intrested_party: Yup.string().required("Interested party is required"),
    nr_state: Yup.string(),
    nr_city: Yup.string(),
    navaratnalu_id: Yup.string(),
    reason: Yup.string(),
    // voter_type: Yup.string().required("Voter type is required"),
  });

  const defaultValues = {
    phone_no: voterData.voter_phone_no ?? "",
    is_resident: voterData.is_resident ?? "",
    // religion_id: voterData.religion_id ?? "",
    // caste_id: voterData.caste_id ?? "",
    caste_name: voterData.caste_name ?? "",
    disability: voterData.disability ?? "",
    govt_employee: voterData.govt_employee ?? 2,
    current_address: voterData.current_address ?? "",
    permenent_address: voterData.permenent_address ?? "",
    intrested_party: voterData.opinionparty ?? "",
    nr_state: voterData.nr_state ?? "",
    nr_city: voterData.nr_city ?? "",
    navaratnalu_id: voterData.navaratnalu_id ?? "",
    reason: voterData.reason ?? "",

    // voter_type: voterData.voter_type ?? "",
  };

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });
  console.log("caste0007", caste);
  const { handleSubmit, reset, watch } = methods;
  const residential = watch(["is_resident"]);
  const intrestedParty = watch(["intrested_party"]);
  console.log(`intrestedParty123 ${intrestedParty[0]}`, intrestedParty[0], voterType);
  const onSubmit = async (data) => {
    if (data.intrested_party == null) {
      showAlert({ text: "Interested party is required" });
      return;
    }

    if (religion == null) {
      showAlert({ text: "Religion is required" });
      return;
    }

    if (category == null) {
      showAlert({ text: "Category is required" });
      return;
    }

    console.log("caste8585774", typeof caste);

    // if (typeof caste == "string") {
    //   setCaste({
    //     label: titleCase(caste),
    //     value: null,
    //   });
    //   return;
    // }

    // if (caste == null) {
    //   showAlert({ text: "Caste is required" });
    //   return;
    // }

    if (voterType == null) {
      showAlert({ text: "Voter type is required" });
      return;
    }

    setLoading(true);

    const jsonData = {
      ...data,
      volunteer_id: account.user.user_pk,
      voter_phone_no: data.phone_no,
      govt_employee: data.govt_employee == 2 ? null : data.govt_employee,
      religion_id: religion.value,
      religion_name: religion.label,
      caste_id: null,
      caste_name: data.caste_name,
      createdby: account.user.user_pk,
      updatedby: account.user.user_pk,
      category_id: category.value,
      voter_type: voterType.value,
      ticket_type: "survey",
    };

    var result = await updateVoterDetails(voterData.voter_pkk, jsonData, voterData, account);
    if (result) {
      showAlert({ text: "Voter updated", color: "success" });
      handleClose();
    }

    setLoading(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const iconColor = getTicketColorByValue(voterData.status_id);

  return (
    <>
      <IconButton
        onClick={() => setOpen(true)}
        sx={{
          p: 0,
          color: iconColor,
        }}
      >
        <EditIcon />
      </IconButton>

      <Dialog open={open} onClose={handleClose}>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle
            sx={{
              fontWeight: 600,
            }}
          >
            Voter Details
          </DialogTitle>
          <DialogContent>
            <Box py={1}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                <Typography>Voter ID: {voterData.voter_id}</Typography>
                <Typography>Name: {voterData.voter_name}</Typography>
              </Box>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={4} lg={4}>
                  <RHFTextField
                    name="phone_no"
                    label="Phone Number"
                    type="text"
                    required
                    inputProps={{ maxLength: 10 }}
                    onKeyDown={(event) => {
                      // Allow copy and paste operations
                      if (event.ctrlKey || event.metaKey) {
                        return;
                      }
                      if (!/[0-9]/.test(event.key) && !["Backspace", "ArrowRight", "ArrowLeft"].includes(event.key)) {
                        event.preventDefault();
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={8} lg={8}>
                  <RHFRadio
                    name="is_resident"
                    options={[
                      { label: "Is Residential", value: 1 },
                      { label: "Non-Residential", value: 0 },
                    ]}
                  />
                </Grid>
                {residential == 0 && (
                  <>
                    <Grid item xs={12} md={12} lg={12}>
                      <RHFTextField name="current_address" label="Current Address" required />
                    </Grid>
                    <Grid item xs={12} md={12} lg={6}>
                      <RHFTextField name="nr_state" label="State" required />
                    </Grid>
                    <Grid item xs={12} md={12} lg={6}>
                      <RHFTextField name="nr_city" label="City" required />
                    </Grid>
                  </>
                )}

                <Grid item xs={12} md={12} lg={12}>
                  <RHFTextField name="permenent_address" label="Permanent Address" disabled={true} />
                </Grid>

                <Grid item xs={12} md={4} lg={4}>
                  <RHFAutoComplete
                    required
                    freeSolo
                    name="religion_id"
                    label="Religion"
                    value={religion}
                    options={common.newReligion}
                    getOptionLabel={(option) => option.label}
                    isDialog={true}
                    onChange={(name, value) => {
                      setReligion(value);
                      setCategory(null);
                      setCaste(null);
                    }}
                    filterOptions={(options, params) => {
                      const filtered = filter(options, params);
                      const { inputValue } = params;
                      const isExisting = options.some((option) => inputValue === option.label);
                      if (inputValue !== "" && !isExisting) {
                        filtered.push({
                          value: null,
                          label: inputValue,
                        });
                      }

                      return filtered;
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={4} lg={4}>
                  <RHFAutoComplete
                    required
                    freeSolo
                    name="category_id"
                    label="Category"
                    value={category}
                    options={common.newCategory.filter((e) => e.religion_pk == religion?.value)}
                    getOptionLabel={(option) => option?.label}
                    isDialog={true}
                    onChange={(name, value) => {
                      setCategory(value);
                      setCaste(null);
                    }}
                    filterOptions={(options, params) => {
                      const filtered = filter(options, params);
                      const { inputValue } = params;
                      const isExisting = options.some((option) => inputValue === option.label);
                      if (inputValue !== "" && !isExisting) {
                        filtered.push({
                          value: null,
                          label: inputValue,
                        });
                      }

                      return filtered;
                    }}
                  />
                </Grid>

                {/* <Grid item xs={12} md={4} lg={4}>
                  <RHFAutoComplete
                    required
                    freeSolo
                    name="caste_id"
                    label="Caste"
                    value={caste}
                    options={common.newCaste.filter((e) => e.category_pk == category?.value)}
                    getOptionLabel={(option) => {
                      console.log("option963852741", option);
                      if (typeof option == "string") {
                        return titleCase(option);
                      }
                      return option.label;
                    }}
                    isDialog={true}
                    onChange={(name, value) => setCaste(value)}
                    filterOptions={(options, params) => {
                      const filtered = filter(options, params);
                      const { inputValue } = params;
                      const isExisting = options.some((option) => inputValue === option.label);
                      if (inputValue !== "" && !isExisting) {
                        filtered.push({
                          value: null,
                          label: titleCase(inputValue),
                        });
                      }

                      console.log("params852", params);
                      return filtered;
                    }}
                  />

              
                </Grid> */}
                <Grid item xs={12} md={4} lg={4}>
                  <RHFTextField name="caste_name" label="Caste" required />
                </Grid>
                <Grid item xs={12} md={6} lg={5}>
                  <RHFRadio
                    required
                    name="disability"
                    filedLabel="Disability (40% or Above)"
                    options={[
                      { label: "Yes", value: 1 },
                      { label: "No", value: 0 },
                    ]}
                  />
                </Grid>

                <Grid item xs={12} md={6} lg={7}>
                  <RHFRadio
                    required
                    name="govt_employee"
                    filedLabel="Govt Employee"
                    options={[
                      { label: "Yes", value: 1 },
                      { label: "No", value: 0 },
                    ]}
                  />
                </Grid>
                <Grid item xs={12} md={12} lg={12}>
                  <RHFRadio
                    filedLabel="Interested Party"
                    required
                    name="intrested_party"
                    labelPlacement="top"
                    options={common.parties.map((item, index) => ({
                      label: item.label,
                      value: item.value,
                      custom: <CustomRadio fontSize={22} customColor={item.color} disabled={pageActions.survey_perm != 1} />,
                    }))}
                    componentsProps={{ typography: { fontSize: 12 } }}
                    onChange={(e) => {
                      console.log("value5282", e.target.value);
                      const value = e.target.value;
                      if (value == 22 || value == 25 || value == 26) {
                        setVoterType({
                          label: "Not Applicable",
                          value: 197,
                        });
                      } else {
                        setVoterType(null);
                      }

                      if (value == 210) {
                        setVoterType({
                          label: "Not Applicable",
                          value: 197,
                        });

                        setReligion({
                          label: "Death",
                          value: 7,
                        });
                        setCategory({
                          label: "Death",
                          value: 23,
                        });

                        reset({
                          is_resident: 1,
                          disability: 0,
                          govt_employee: 0,
                          phone_no: "8888888888",
                          intrested_party: 210,
                          caste_name: "Death",
                        });
                      }
                    }}
                    // options={[
                    //   {
                    //     label: "Neutral",
                    //     value: PARTY_ID.NEUTRAL,
                    //     custom: <NeutralRadio fontSize={22} disabled={pageActions.survey_perm != 1} />,
                    //   },
                    //   {
                    //     label: "YSRCP",
                    //     value: PARTY_ID.YSRCP,
                    //     custom: <YCPRadio fontSize={22} disabled={pageActions.survey_perm != 1} />,
                    //   },
                    //   {
                    //     label: "TDP",
                    //     value: PARTY_ID.TDP,
                    //     custom: <TDPRadio fontSize={22} disabled={pageActions.survey_perm != 1} />,
                    //   },
                    //   {
                    //     label: "JSP",
                    //     value: PARTY_ID.JANASENA,
                    //     custom: <JSPRadio fontSize={22} disabled={pageActions.survey_perm != 1} />,
                    //   },
                    //   {
                    //     label: "Others",
                    //     value: PARTY_ID.BJP,
                    //     custom: <CongressRadio fontSize={22} disabled={pageActions.survey_perm != 1} />,
                    //   },
                    //   {
                    //     label: "Not Traced",
                    //     value: PARTY_ID.CONGRESS,
                    //     custom: <BJPRadio fontSize={22} disabled={pageActions.survey_perm != 1} />,
                    //   },
                    //   // {
                    //   //   label: "Others",
                    //   //   value: PARTY_ID.OTHERS,
                    //   //   custom: <OthersRadio fontSize={22} />,
                    //   // },
                    // ]}
                  />
                </Grid>
                <Grid item xs={12} md={6} lg={6}>
                  <RHFAutoComplete
                    required
                    freeSolo
                    name="voter_type"
                    label="Voter Type"
                    disabled={voterType?.value == 197}
                    value={voterType}
                    options={common.voterTypes.filter((e) => e.value != 197)}
                    getOptionLabel={(option) => option.label}
                    isDialog={true}
                    onChange={(name, value) => setVoterType(value)}
                  />

                  {/* <RHFTextField name="caste_id" label="Caste" select required>
                    {common.caste.map((item, index) => (
                      <MenuItem key={index} value={item.value}>
                        {item.label}
                      </MenuItem>
                    ))}
                  </RHFTextField> */}
                </Grid>
                {intrestedParty == 22 && (
                  <>
                    <Grid item xs={12} md={6} lg={6}>
                      <RHFTextField name="navaratnalu_id" label="Navaratnalu ID" select disabled={!isNew || !voterStatusId} required>
                        {common.navaratnalu.map((item, index) => (
                          <MenuItem key={index} value={item.navaratnalu_pk}>
                            {item.navaratnalu_name}
                          </MenuItem>
                        ))}
                      </RHFTextField>
                    </Grid>
                    <Grid item xs={12} md={6} lg={12}>
                      <RHFTextField name="reason" label="Write Reason..." fullWidth multiline rows={4} required disabled={!isNew || !voterStatusId} />
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleClose} variant="contained" color="error">
              Cancel
            </Button>
            <Tooltip title={pageActions.survey_perm != 1 ? "You don't have access to submit" : ""}>
              <span>
                <LoadingButton type="submit" variant="contained" loading={isLoading} disabled={pageActions.survey_perm != 1}>
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

export default connect(mapStateToProps, { showAlert, updateVoterDetails })(UpdateVoterDialog);
