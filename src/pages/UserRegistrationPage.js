import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Grid, Container, Typography, Box, TextField, Card, FormControlLabel, MenuItem } from "@mui/material";
import Page from "../components/Page";
import { connect } from "react-redux";
import { LoadingButton } from "@mui/lab";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckBox } from "@mui/icons-material";
import { createUsersRoute } from "../utils/apis";
import { useEffect, useRef, useState } from "react";
import instance from "../utils/axios";
import { set } from "date-fns";
import { showAlert } from "../actions/alert";
import { FormProvider, RHFTextField } from "../components/hook-form";
import SearchByFilter from "../sections/common/SearchByFilter";
import { phoneRegExp } from "../constants";
import ApiServices from "../services/apiservices";
import Tooltip from "@material-ui/core/Tooltip";

const PRIORITY1 = [33, 34, 35, 36, 37, 38, 207];
const PRIORITY2 = [34, 35, 36, 37, 38, 207];
const PRIORITY3 = [35, 36, 37, 38, 207];
const PRIORITY4 = [36, 38, 207];
const PRIORITY5 = [207];
const ADMIN_PRIORITY = [30, 31, 111];

const UserRegistrationPage = ({ account, common, showAlert }) => {
  const userPermission = account.user && account.user.permissions ? account.user.permissions : [];
  const pageActions = userPermission.filter((p) => p.page_id === 134)[0];
  console.log("pageActions1", pageActions);

  const props = useLocation().state;
  const navigate = useNavigate();
  const filterRef = useRef(null);

  const [filterValues, setFilterValues] = useState(null);
  const [isLoading, setLoading] = useState(false);

  const pageName = props?.userData == null ? "Add User" : "Edit User";

  const schema = Yup.object().shape({
    user_displayname: Yup.string().required("Full name is required"),
    username: Yup.string()
      .required("User Name is required")
      .test("firstChar", "Username should start with 6 to 9", (value) => {
        return /^[6-9]/.test(value);
      })
      .matches(phoneRegExp, "User Name is not valid"),
    // password: Yup.string().required("Password is required").min(8, "Password must be at least 8 characters"),
    phone_no: Yup.string().test("phone_no", "Phone number is not valid", function (value) {
      if (!value || value.length === 0) {
        return true;
      }
      return phoneRegExp.test(value);
    }),
    age: Yup.string(),
    email: Yup.string().email(),
    district_id: Yup.string().required("District id is required"),
    constituency_id: Yup.string().required("Constituency id is required"),
    designation_id: Yup.string().required("Designation id is required"),
  });

  const defaultValues = {
    user_displayname: props?.userData?.user_displayname ?? "",
    username: props?.userData?.username ?? "",
    // password: props?.userData?.password ?? "",
    phone_no: props?.userData?.phone_no ?? "",
    age: props?.userData?.age ?? "",
    email: props?.userData?.email ?? "",
    district_id: props?.userData?.district_id ?? account.user?.district_pk,
    constituency_id: props?.userData?.consistency_id ?? account.user?.consistency_pk,
    designation_id: props?.userData?.designation_id ?? "",
    mandal_id: props?.userData?.mandal_id ?? "",
    division_id: props?.userData?.division_id ?? "",
    sachivalayam_id: props?.userData?.sachivalayam_id ?? "",
    part_no: props?.userData?.part_no ?? null,
    group_id: props?.userData?.group_id ?? null,
    village_id: props?.userData?.village_id ?? null,
  };

  console.log("deffsfdfsdaultValues", props);
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const { handleSubmit, reset, watch, resetField } = methods;
  const designation_id = watch("designation_id");

  const onSubmit = async (data) => {
    var hasErrors = false;
    filterRef.current.setErrors({
      mandal: null,
      division: null,
      sachivalayam: null,
      partno: null,
      group: null,
    });
    const designationId = Number(data.designation_id);

    if (PRIORITY1.includes(designationId) && !filterValues["mandal"]) {
      filterRef.current.setErrors({ mandal: "Mandal is required" });
      hasErrors = true;
    }

    if (PRIORITY2.includes(designation_id) && !filterValues["division"]) {
      filterRef.current.setErrors({ division: "Division is required" });
      hasErrors = true;
    }

    if (PRIORITY3.includes(designation_id) && !filterValues["sachivalayam"]) {
      filterRef.current.setErrors({ sachivalayam: "Sachivalayam is required" });
      hasErrors = true;
    }

    if (PRIORITY4.includes(designation_id) && !filterValues["partno"]) {
      filterRef.current.setErrors({ partno: "Part no is required" });
      hasErrors = true;
    }

    if (PRIORITY5.includes(designation_id) && !filterValues["group"]) {
      filterRef.current.setErrors({ group: "Group is required" });
      hasErrors = true;
    }

    if (hasErrors) return;

    setLoading(true);
    try {
      var jsonData = {
        ...data,
        district_id: data.district_id,
        consistency_id: data.constituency_id,
        age: data.age == "" ? null : data.age,
        state_id: account.user?.state_pk ?? null,
        // district_id: account.user?.district_pk ?? null,
        // consistency_id: account.user?.consistency_pk ?? null,
        mandal_id: filterValues.mandal?.mandal_id ?? null,
        division_id: filterValues.division?.division_id ?? null,
        sachivalayam_id: filterValues.sachivalayam?.sachivalayam_id ?? null,
        part_no: filterValues.partno?.part_no ?? null,
        group_id: filterValues.group?.group_pk ?? null,
        village_id: filterValues.village?.village_id ?? null,
      };

      console.log("jsonData in add User", jsonData);

      if (props?.userData != null) {
        await ApiServices.putRequest(`${createUsersRoute}/${props.userData.user_pk}`, { ...jsonData, updatedby: account.user?.user_pk });
        showAlert({ text: "User updated successfully", color: "success" });
        navigate(-1);
      } else {
        await ApiServices.postRequest(createUsersRoute, { ...jsonData, createdby: account.user?.user_pk });
        showAlert({ text: "User added successfully", color: "success" });
        reset();
        filterRef.current.reset();
        setFilterValues(null);
      }

      setLoading(false);
    } catch (error) {
      showAlert({ text: error.response?.data?.error ?? "Something went wrong" });
      setLoading(false);
    }
  };

  let district_id = watch("district_id");

  let addUserConstituencyId = watch("constituency_id");

  console.log("addUserConstituencyId", addUserConstituencyId);

  console.log(
    "sddadaadasdweucmwjnwds",
    addUserConstituencyId,
    common.constituencies.filter((item) => item.district_id == district_id)
  );

  return (
    <Page title={pageName}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Container maxWidth="xl">
          <Typography variant="h4" sx={{ mb: 1 }}>
            {pageName}
          </Typography>

          <Card sx={{ p: 3 }}>
            <Typography sx={{ pb: 2 }}>Basic Info</Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6} lg={3}>
                <RHFTextField
                  name="district_id"
                  label="Select District*"
                  disabled={!ADMIN_PRIORITY.includes(account.user?.desgination_id)}
                  select
                  onChange={() => {
                    resetField("constituency_id");
                  }}
                >
                  {common.districts?.map((item, index) => (
                    <MenuItem key={index} value={item.district_id}>
                      {item.district_name}
                    </MenuItem>
                  ))}
                </RHFTextField>
              </Grid>

              <Grid item xs={12} md={6} lg={3}>
                <RHFTextField name="constituency_id" label="Select Constituency*" disabled={!ADMIN_PRIORITY.includes(account.user?.desgination_id)} select>
                  {common.constituencies
                    .filter((item) => item.district_id == district_id)
                    ?.map((item, index) => (
                      <MenuItem key={index} value={item.consistency_id}>
                        {item.consistency_name}
                      </MenuItem>
                    ))}
                </RHFTextField>
              </Grid>

              <Grid item xs={12} md={6} lg={3}>
                <RHFTextField name="user_displayname" label="Full name *" />
              </Grid>

              <Grid item xs={12} md={6} lg={3}>
                <RHFTextField
                  name="username"
                  label="Username/Phone Number *"
                  inputProps={{ maxLength: 10 }}
                  onKeyDown={(event) => {
                    // Allow copy and paste operations
                    if (event.ctrlKey || event.metaKey) {
                      return;
                    }
                    if (!/[0-9]/.test(event.key) && !["Backspace", "ArrowRight", "ArrowLeft"].includes(event.key)) {
                      event.preventDefault();
                    }
                    if (event.key === "Enter") {
                      document.getElementsByName("phone_no")[0].focus();
                    }
                  }}
                />
              </Grid>

              {/* <Grid item xs={12} md={6} lg={3}>
                <RHFTextField name="password" label="Password *" />
              </Grid> */}

              <Grid item xs={12} md={6} lg={3}>
                <RHFTextField
                  name="phone_no"
                  label="Office Phone Number"
                  inputProps={{ maxLength: 10 }}
                  onKeyDown={(event) => {
                    // Allow copy and paste operations
                    if (event.ctrlKey || event.metaKey) {
                      return;
                    }
                    if (!/[0-9]/.test(event.key) && !["Backspace", "ArrowRight", "ArrowLeft"].includes(event.key)) {
                      event.preventDefault();
                    }
                    if (event.key === "Enter") {
                      document.getElementsByName("age")[0].focus();
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6} lg={3}>
                <RHFTextField
                  name="age"
                  label="Age"
                  onInput={(event) => {
                    // Replace any non-numeric characters with an empty string
                    event.target.value = event.target.value.replace(/[^0-9]/g, "");
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6} lg={3}>
                <RHFTextField name="email" label="Email" />
              </Grid>
            </Grid>
          </Card>

          <Card sx={{ p: 3, mt: 1 }}>
            <Typography sx={{ pb: 2 }}>Assign Designation</Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6} lg={3}>
                <RHFTextField
                  name="designation_id"
                  label="Select Designation*"
                  select
                  onChange={() => {
                    setFilterValues(null);
                    filterRef.current.reset();
                  }}
                >
                  {common.designation?.map((item, index) => (
                    <MenuItem key={index} value={item.value}>
                      {item.label}
                    </MenuItem>
                  ))}
                </RHFTextField>
              </Grid>

              <SearchByFilter
                mandalsList={common.mandals.filter((item) => item.consistency_id == addUserConstituencyId)}
                ref={filterRef}
                lg={3}
                defaultValues={defaultValues}
                showDistrict={false}
                showConstituency={false}
                showMandal={PRIORITY1.includes(designation_id)}
                showDivision={PRIORITY2.includes(designation_id)}
                showSachivalayam={PRIORITY3.includes(designation_id)}
                showPartNo={PRIORITY4.includes(designation_id)}
                showGroup={PRIORITY5.includes(designation_id)}
                showVillage={false}
                showOtherFilters={false}
                showSearchButton={false}
                onChanged={(value) => setFilterValues(value)}
              />
            </Grid>
          </Card>

          <Box sx={{ pt: 2, textAlign: "end" }}>
            <Tooltip title={pageActions.add_perm != 1 ? "You don't have access to Create User" : ""}>
              <span>
                <LoadingButton type="submit" variant="contained" loading={isLoading} disabled={pageActions.add_perm != 1}>
                  Submit
                </LoadingButton>
              </span>
            </Tooltip>
          </Box>

          {/* <Card sx={{ p: 3, mt: 1 }}>
            <Typography sx={{ pb: 2 }}>Assign Authority</Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6} lg={2}>
                <FormControlLabel control={<CheckBox />} label="View" />
              </Grid>
              <Grid item xs={12} md={6} lg={2}>
                <FormControlLabel control={<CheckBox />} label="Add" />
              </Grid>
              <Grid item xs={12} md={6} lg={2}>
                <FormControlLabel control={<CheckBox />} label="Update" />
              </Grid>
              <Grid item xs={12} md={6} lg={2}>
                <FormControlLabel control={<CheckBox />} label="Delete" />
              </Grid>

              <Grid
                item
                xs={12}
                md={6}
                lg={2}
                sx={{
                  marginLeft: "auto",
                }}
              >
                {userData === null ? (
                  <LoadingButton
                    loading={isLoading}
                    onClick={handleSubmit}
                    variant="contained"
                    sx={{
                      padding: "15px 40px",
                    }}
                  >
                    Submit
                  </LoadingButton>
                ) : (
                  <LoadingButton
                    loading={isLoading}
                    onClick={handleEditComplete}
                    variant="contained"
                    sx={{
                      padding: "15px 20px",
                    }}
                  >
                    Update Details
                  </LoadingButton>
                )}
              </Grid>
            </Grid>
          </Card> */}
        </Container>
      </FormProvider>
    </Page>
  );
};

const mapStateToProps = (state) => {
  return {
    account: state.auth,
    common: state.common,
  };
};

export default connect(mapStateToProps, { showAlert })(UserRegistrationPage);