import React, { forwardRef, useImperativeHandle } from "react";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Grid, Stack } from "@mui/material";
import { RHFAutoComplete } from "../../components/hook-form";
import { LoadingButton } from "@mui/lab";

// import { ageDropdown } from "../../utils/dropdownconstants";
import { getVillagesBySachivalayamIdRoute, getVolunteerListRoute } from "../../utils/apis";
import ApiServices from "../../services/apiservices";

const SearchByFilter = forwardRef(
  (
    {
      account,
      common,
      addVoterVillage = false,
      defaultValues,
      onChanged,
      onSubmit,
      onReset,
      lg = 2,
      showDistrict = true,
      showConstituency = true,
      showMandal = true,
      mandalsList = null,
      showDivision = true,
      showSachivalayam = true,
      showPartNo = true,
      showGroup = false,
      showVillage = true,
      showOtherFilters = true,
      showSearchButton = true,
      showSurveyedBy = true,
      children,
      addVoterVillageLg,
      isNewVoter,
      isClearActive = false,
      showDuplicateButton = false,
      showVolunteer = false,
    },
    ref
  ) => {
    const [formValues, setFormValues] = useState({
      district: null,
      constituency: null,
      mandal: null,
      division: null,
      sachivalayam: null,
      partno: null,
      group: null,
      village: null,
      gender: null,
      religion: null,
      category: null,
      voterType: null,
      caste: null,
      disability: null,
      govt_employee: null,
      age: null,
      surveyedBy: null,
      volunteer: null,
    });

    const [addVoterVillageData, setAddVoterVillageData] = useState(null);
    const [errors, setErrors] = useState({
      district: null,
      constituency: null,
      mandal: null,
      division: null,
      sachivalayam: null,
      partno: null,
      group: null,
      village: null,
      volunteer: null,
    });
    const [isLoading, setLoading] = useState(false);
    const [submitFlag, setSubmitFlag] = useState(false);
    const [isLoadingVillage, setLoadingVillage] = useState(false);
    const [isVolunteerLoading, setVolunteerLoading] = useState(false);
    const [volunteerListData, setVolunteerListData] = useState([]);
    useEffect(() => {
      setIntialDefaultValues(true);
    }, [common]);

    /// addvoter
    let addVoterCall = 0;

    ///  see take reference from here
    useEffect(() => {
      console.log(addVoterCall++);
      // console.log("formValues.sachivalayam", formValues.sachivalayam);
      if (formValues.sachivalayam == null) return;

      const getVillagesBySachivalayamId = async () => {
        setLoadingVillage(true);
        const response = await ApiServices.postRequest(getVillagesBySachivalayamIdRoute, {
          sachivalayam_id: formValues.sachivalayam?.sachivalayam_id,
        });
        const data = response.data?.message ?? [];
        console.log("data", data);
        setAddVoterVillageData(data);
        setLoadingVillage(false);
      };
      if (isNewVoter) {
        getVillagesBySachivalayamId();
      }
    }, [formValues.sachivalayam]);

    useEffect(() => {
      const getVolunteerList = async () => {
        setVolunteerLoading(true);
        const response = await ApiServices.postRequest(getVolunteerListRoute, {
          sachivalayam_id: formValues.sachivalayam?.sachivalayam_id ?? null,
        });
        const data = response.data?.message ?? [];
        console.log("data", data);
        setVolunteerListData(data);
        setVolunteerLoading(false);
      };
      if (showVolunteer) {
        getVolunteerList();
      }
    }, [formValues.sachivalayam]);

    const setIntialDefaultValues = (allowSubmit) => {
      if (common?.mandals.length > 0) {
        if (account?.user.district_pk != null) {
          var initialDistrict = common?.districts[0];
          if (common?.districts.length > 0) {
            setFormValues((state) => ({ ...state, district: initialDistrict }));
          }
        }

        if (account?.user.consistency_pk != null) {
          var initialConstituency = common?.constituencies[0];
          if (common?.mandals.length > 0) {
            setFormValues((state) => ({ ...state, constituency: initialConstituency }));
          }
        }

        if (account?.user.mandal_pk != null) {
          var initialMandal = common?.mandals[0];
          if (common?.mandals.length > 0) {
            setFormValues((state) => ({ ...state, mandal: initialMandal }));
          }
        }

        if (account?.user.division_pk != null) {
          var initialDivision = common?.divisions.filter((e) => e.mandal_id == initialMandal?.mandal_id)[0];
          if (common?.divisions.length > 0) {
            setFormValues((state) => ({
              ...state,
              division: initialDivision ?? null,
            }));
          }
        }

        if (account?.user.sachivalayam_pk != null) {
          var initialSachivalayam = common?.sachivalayams.filter((e) => e.division_id == initialDivision?.division_id)[0];
          console.log("initialSachivalayam", initialSachivalayam);
          if (common?.sachivalayams.length > 0) {
            setFormValues((state) => ({
              ...state,
              sachivalayam: initialSachivalayam ?? null,
            }));
          }
        }

        if (account?.user.part_no != null) {
          var initialPart = common?.parts.filter((e) => e.sachivalayam_id == initialSachivalayam?.sachivalayam_id)[0];
          console.log("initialPart", initialPart);
          if (common?.parts.length > 0) {
            setFormValues((state) => ({
              ...state,
              partno: initialPart ?? null,
            }));
          }
        }

        if (account?.user.group_pk != null) {
          var initialGroup = common?.clustergroups.filter((e) => e.group_pk == account?.user.group_pk)[0];
          if (common?.clustergroups.length > 0) {
            setFormValues((state) => ({
              ...state,
              group: initialGroup ?? null,
            }));
          }
        }

        // var initialVillage = common?.villages.filter((e) => e.part_no == initialPart?.part_no)[0];
        // if (common?.villages.length > 0) {
        //   setFormValues((state) => ({
        //     ...state,
        //     village: initialVillage ?? null,
        //   }));
        // }

        if (defaultValues) {
          console.log(defaultValues);
          setFormValues((state) => ({
            ...state,
            district: defaultValues.district_id ? common?.districts.find((e) => e.district_id === defaultValues.district_id) : state.district,
            constituency: defaultValues.constituency_id ? common?.constituencies.find((e) => e.constituency_id === defaultValues.constituency_id) : state.constituency,
            mandal: defaultValues.mandal_id ? common?.mandals.find((e) => e.mandal_id === defaultValues.mandal_id) : state.mandal,
            division: defaultValues.division_id ? common?.divisions.find((e) => e.division_id === defaultValues.division_id) : state.division,
            sachivalayam: defaultValues.sachivalayam_id ? common?.sachivalayams.find((e) => e.sachivalayam_id === defaultValues.sachivalayam_id) : state.sachivalayam,
            village: defaultValues.village_id ? common?.villages.find((e) => e.village_id === defaultValues.village_id) : state.village,
            partno: defaultValues.part_no ? common?.parts.find((e) => e.part_no === defaultValues.part_no) : state.partno,
            group: defaultValues.group_id ? common?.clustergroups.find((e) => e.group_pk === defaultValues.group_id) : state.group,
          }));
        }

        if (allowSubmit) {
          setSubmitFlag(true);
        }
      }
    };

    const handleSubmit = async (showDuplicates) => {
      console.log(showDuplicates, "showDuplicates");
      if (onSubmit == null) return;

      const jsonData = {
        state_id: account?.user?.state_pk ?? null,
        district_id: formValues.district?.district_id ?? null,
        consistency_id: formValues.constituency?.consistency_id ?? null,
        mandal_id: formValues.mandal?.mandal_id ?? null,
        division_id: formValues.division?.division_id ?? null,
        sachivalayam_id: formValues.sachivalayam?.sachivalayam_id ?? null,
        part_no: formValues.partno?.part_no ?? null,
        group_id: formValues.group?.group_pk ?? null,
        village_id: formValues.village?.village_id ?? null,
        gender: formValues.gender?.value ?? null,
        religion_id: formValues.religion?.value ?? null,
        category_id: formValues.category?.value ?? null,
        voter_type: formValues.voterType?.value ?? null,
        caste_id: formValues.caste?.value ?? null,
        disability: formValues.disability?.value ?? null,
        govt_employee: formValues.govt_employee?.value ?? null,
        age: formValues.age?.value ?? "",
        surveyedby: formValues.surveyedBy?.surveyedby ?? null,
        volunteer: formValues.volunteer?.volunteer ?? null,
        showDuplicates: showDuplicates,
        designation_id: account?.user?.desgination_id ?? null,
        user_id: account?.user?.user_pk ?? null,
        auth_group_id: account?.user?.group_id ?? null,
      };

      console.log(jsonData);

      setLoading(true);

      await onSubmit(jsonData);

      setLoading(false);
    };

    const handleChange = (name, value) => {
      const values = {};
      values[name] = value;

      if (name == "district") {
        values["constituency"] = null;
        values["mandal"] = null;
        values["division"] = null;
        values["sachivalayam"] = null;
        values["partno"] = null;
        values["group"] = null;
        values["village"] = null;
        values["volunteer"] = null;
      }

      if (name == "constituency") {
        values["mandal"] = null;
        values["division"] = null;
        values["sachivalayam"] = null;
        values["partno"] = null;
        values["group"] = null;
        values["village"] = null;
        values["volunteer"] = null;
      }

      if (name == "mandal") {
        values["division"] = null;
        values["sachivalayam"] = null;
        values["partno"] = null;
        values["group"] = null;
        values["village"] = null;
        values["volunteer"] = null;
      }

      if (name == "division") {
        values["sachivalayam"] = null;
        values["partno"] = null;
        values["group"] = null;
        values["village"] = null;
        values["volunteer"] = null;
      }

      if (name == "sachivalayam") {
        values["partno"] = null;
        values["group"] = null;
        values["village"] = null;
        values["volunteer"] = null;
      }

      if (name == "partno") {
        values["group"] = null;
        values["village"] = null;
        values["volunteer"] = null;
      }
      if (name == "religion") {
        values["category"] = null;
        values["caste"] = null;
      }

      if (name == "category") {
        values["caste"] = null;
      }

      setFormValues((state) => ({ ...state, ...values }));
    };

    useEffect(() => {
      if (onChanged != null) onChanged(formValues);

      if (submitFlag) {
        handleSubmit();
        setSubmitFlag(false);
      }
    }, [formValues, submitFlag]);

    const handleReset = () => {
      setFormValues((state) => ({
        ...state,
        district: null,
        constituency: null,
        mandal: null,
        division: null,
        sachivalayam: null,
        partno: null,
        group: null,
        village: null,
        gender: null,
        religion: null,
        category: null,
        voterType: null,
        caste: null,
        disability: null,
        govt_employee: null,
        age: null,
        surveyedBy: null,
        volunteer: null,
      }));

      if (onReset != null) onReset();

      setIntialDefaultValues(true);
    };

    useImperativeHandle(ref, () => ({
      setErrors: (newErrors) => {
        setErrors((prevErrors) => ({
          ...prevErrors,
          ...newErrors,
        }));
      },
      submit: handleSubmit,
      reset: handleReset,
    }));

    // console.log("formValues in SearchFilter", formValues);

    // if formValues are null and isClearActive is true then clear button will be disabled
    // check if formValues are null
    // if formValues are null then set isClearActive to false
    // else set isClearActive to true
    console.log("formValue8527485s", formValues);
    const areFormValuesNull = Object.values(formValues).every((value) => value === null);
    return (
      <>
        {showDistrict && (
          <Grid item xs={12} md={6} lg={lg}>
            <RHFAutoComplete
              name="district"
              label="Select District"
              value={formValues.district}
              options={common?.districts}
              getOptionLabel={(option) => option.district_name}
              onChange={handleChange}
              loading={common?.isLoading}
              disabled={account?.user.district_pk != null}
              error={!!errors.district}
              helperText={errors.district}
            />
          </Grid>
        )}

        {showConstituency && (
          <Grid item xs={12} md={6} lg={lg}>
            <RHFAutoComplete
              name="constituency"
              label="Select Constituency"
              value={formValues.constituency}
              options={common?.constituencies.filter((e) => e.district_id == formValues?.district?.district_id)}
              getOptionLabel={(option) => option.consistency_name}
              onChange={handleChange}
              loading={common?.isLoading}
              disabled={account?.user.consistency_pk != null}
              error={!!errors.constituency}
              helperText={errors.constituency}
            />
          </Grid>
        )}

        {showMandal && (
          <Grid item xs={12} md={6} lg={lg}>
            <RHFAutoComplete
              name="mandal"
              label="Select Mandal"
              value={formValues.mandal}
              options={mandalsList ?? common?.mandals.filter((e) => e.consistency_id == formValues?.constituency?.consistency_id)}
              getOptionLabel={(option) => option.mandal_name}
              onChange={handleChange}
              loading={common?.isLoading}
              disabled={account?.user.mandal_pk != null}
              error={!!errors.mandal}
              helperText={errors.mandal}
            />
          </Grid>
        )}

        {showDivision && (
          <Grid item xs={12} md={6} lg={lg}>
            <RHFAutoComplete
              name="division"
              label="Select Division"
              value={formValues.division}
              options={common?.divisions.filter((e) => e.mandal_id == formValues?.mandal?.mandal_id)}
              getOptionLabel={(option) => option.division_name}
              onChange={handleChange}
              disabled={account?.user.division_pk != null}
              error={!!errors.division}
              helperText={errors.division}
            />
          </Grid>
        )}

        {showSachivalayam && (
          <Grid item xs={12} md={6} lg={lg}>
            <RHFAutoComplete
              name="sachivalayam"
              label="Select Sachivalayam"
              value={formValues.sachivalayam}
              options={common?.sachivalayams.filter((e) => e.division_id == formValues?.division?.division_id)}
              getOptionLabel={(option) => option.sachivalayam_name}
              onChange={handleChange}
              disabled={account?.user.sachivalayam_pk != null}
              error={!!errors.sachivalayam}
              helperText={errors.sachivalayam}
            />
          </Grid>
        )}

        {showPartNo && (
          <Grid item xs={12} md={6} lg={lg}>
            <RHFAutoComplete
              name="partno"
              label="Select Part/Booth No"
              value={formValues.partno}
              options={account?.user?.desgination_name === "MLA" && formValues?.mandal === null ? common?.parts : common?.parts.filter((e) => e.sachivalayam_id === formValues?.sachivalayam?.sachivalayam_id)}
              getOptionLabel={(option) => String(option.part_no)}
              onChange={handleChange}
              disabled={account.user.part_no != null}
              error={!!errors.partno}
              helperText={errors.partno}
            />
          </Grid>
        )}

        {showGroup && (
          <Grid item xs={12} md={6} lg={lg}>
            <RHFAutoComplete
              name="group"
              label="Select Cluster Group"
              value={formValues.group}
              options={common?.clustergroups?.filter((e) => e.part_pk == formValues?.partno?.part_no) || []}
              getOptionLabel={(option) => option.label}
              onChange={handleChange}
              disabled={account.user.group_pk != null}
              error={!!errors.group}
              helperText={errors.group}
            />
          </Grid>
        )}

        {/* {showPartNo && account?.user?.desgination_name != "MLA" && (
          <Grid item xs={12} md={6} lg={lg}>
            <RHFAutoComplete
              name="partno"
              label="Select Part/Booth No"
              value={formValues.partno}
              options={common?.parts.filter((e) => e.sachivalayam_id == formValues?.sachivalayam?.sachivalayam_id)}
              getOptionLabel={(option) => String(option.part_no)}
              onChange={handleChange}
              disabled={account.user.part_no != null}
              error={!!errors.partno}
              helperText={errors.partno}
            />
          </Grid>
        )}

        {showPartNo && formValues?.mandal !== null && account?.user?.desgination_name == "MLA" && (
          <Grid item xs={12} md={6} lg={lg}>
            <RHFAutoComplete
              name="partno"
              label="Select Part/Booth No"
              value={formValues.partno}
              options={common?.parts.filter((e) => e.sachivalayam_id == formValues?.sachivalayam?.sachivalayam_id)}
              getOptionLabel={(option) => String(option.part_no)}
              onChange={handleChange}
              disabled={account.user.part_no != null}
              error={!!errors.partno}
              helperText={errors.partno}
            />
          </Grid>
        )}

        {showPartNo && account?.user?.desgination_name == "MLA" && formValues?.mandal === null && (
          <Grid item xs={12} md={6} lg={lg}>
            <RHFAutoComplete
              name="partno"
              label="Select Part/Booth No"
              value={formValues.partno}
              options={common?.parts}
              getOptionLabel={(option) => String(option.part_no)}
              onChange={handleChange}
              error={!!errors.partno}
              helperText={errors.partno}
            />
          </Grid>
        )} */}

        {showVillage && (
          <Grid item xs={12} md={6} lg={addVoterVillageLg == undefined ? lg : addVoterVillageLg}>
            <RHFAutoComplete
              name="village"
              label="Select Village"
              value={formValues.village}
              options={common?.villages.filter((e) => e.part_no == formValues?.partno?.part_no)}
              getOptionLabel={(option) => option.village_name}
              onChange={handleChange}
              error={!!errors.village}
              helperText={errors.village}
              // disabled={account.user.village_pk != null}
            />
          </Grid>
        )}
        {addVoterVillage && (
          <Grid item xs={12} md={6} lg={lg}>
            <RHFAutoComplete
              name="village"
              label="Select Village"
              value={formValues.village}
              options={addVoterVillageData ?? []}
              getOptionLabel={(option) => option.village_name}
              onChange={handleChange}
              error={!!errors.village}
              loading={isLoadingVillage}
              helperText={errors.village}
              // disabled={account.user.village_pk != null}
            />
          </Grid>
        )}

        {showVolunteer && (
          <Grid item xs={12} md={6} lg={lg}>
            <RHFAutoComplete
              name="volunteer"
              label="Select Volunteer"
              value={formValues.volunteer}
              options={volunteerListData ?? []}
              getOptionLabel={(option) => option.user_displayname + " - " + option.volunteer_phonenumber}
              onChange={handleChange}
              error={!!errors.volunteer}
              loading={isVolunteerLoading}
              helperText={errors.volunteer}
            />
          </Grid>
        )}

        {showOtherFilters && (
          <>
            <Grid item xs={12} md={6} lg={lg}>
              <RHFAutoComplete
                name="gender"
                label="Select Gender"
                value={formValues.gender}
                options={[
                  {
                    label: "Male",
                    value: 13,
                  },
                  {
                    label: "Female",
                    value: 14,
                  },
                  {
                    label: "Transgender",
                    value: 15,
                  },
                ]}
                onChange={handleChange}
              />
            </Grid>{" "}
            <Grid item xs={12} md={6} lg={lg}>
              <RHFAutoComplete name="religion" label="Select Religion" value={formValues.religion} options={common?.newReligion} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} md={6} lg={lg}>
              <RHFAutoComplete name="category" label="Select Category" value={formValues.category} options={common?.newCategory?.filter((e) => e.religion_pk == formValues.religion?.value)} onChange={handleChange} />
            </Grid>
            {/* <Grid item xs={12} md={6} lg={lg}>
              <RHFAutoComplete name="caste" label="Select Caste" value={formValues.caste} options={common?.newCaste?.filter((e) => e.category_pk == formValues.category?.value)} onChange={handleChange} />
            </Grid> */}
            <Grid item xs={12} md={6} lg={lg}>
              <RHFAutoComplete name="voterType" label="Select Voter Type" value={formValues.voterType} options={common?.voterTypes} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} md={6} lg={lg}>
              <RHFAutoComplete
                name="disability"
                label="Disability (40% or above)"
                value={formValues.disability}
                options={[
                  {
                    label: "Yes",
                    value: true,
                  },
                  {
                    label: "No",
                    value: false,
                  },
                ]}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={lg}>
              <RHFAutoComplete
                name="govt_employee"
                label="Govt Employee"
                value={formValues.govt_employee}
                options={[
                  {
                    label: "Yes",
                    value: true,
                  },
                  {
                    label: "No",
                    value: false,
                  },
                ]}
                onChange={handleChange}
              />
            </Grid>{" "}
            <Grid item xs={12} md={6} lg={lg}>
              <RHFAutoComplete name="age" label="Select Age" value={formValues.age} options={common.ageDropdown} onChange={handleChange} />
            </Grid>
            {showSurveyedBy && (
              <>
                {/* // filter the surveyed by based on constituency_id or mandal_id or division_id or sachivalayam_id or part_no or village_id */}
                <Grid item xs={12} md={6} lg={lg}>
                  <RHFAutoComplete
                    name="surveyedBy"
                    label="Surveyed By"
                    value={formValues.surveyedBy}
                    options={
                      common?.surveyedBy
                        ? common.surveyedBy.filter((e) => {

                          console.log("formValues41211ewfdfjdbsjfb", formValues);
                            if (formValues && formValues.village != null) {
                              console.log("formValues.village", formValues.village?.village_id);
                              return e.village_id == formValues.village?.village_id;
                            }
                            // if (formValues && formValues.group != null) {
                            //   console.log("formValues.group", formValues.group?.group_pk);
                            //   return e.group_id == formValues.group?.group_pk;
                            // }

                            if (formValues && formValues.partno != null) {
                              console.log("formValues.partno", formValues.partno?.part_no);
                              return e.part_no == formValues.partno?.part_no;
                            }
                            if (formValues && formValues.sachivalayam != null) {
                              console.log("formValues.sachivalayam", formValues.sachivalayam?.sachivalayam_id);
                              return e.sachivalayam_id == formValues.sachivalayam?.sachivalayam_id;
                            }
                            if (formValues && formValues.division != null) {
                              console.log("formValues.division", formValues.division?.division_id);
                              return e.division_id == formValues.division?.division_id;
                            }
                            if (formValues && formValues.mandal != null) {
                              console.log("formValues.mandal", formValues.mandal?.mandal_id, e.mandal_id);
                              return e.mandal_id == formValues.mandal?.mandal_id;
                            }
                            if (formValues && formValues.constituency != null) {
                              console.log("formValues.constituency", formValues.constituency?.consistency_id);
                              return e.consistency_id == formValues.constituency?.consistency_id;
                            }
                            if (formValues && formValues.district != null) {
                              console.log("formValues.district", formValues.district?.district_id);
                              return e.district_id == formValues.district?.district_id;
                            }
                            console.log("account?.user.consistency_pk", formValues);
                            return e.consistency_id == account?.user.consistency_pk;
                          })
                        : []
                    }
                    onChange={handleChange}
                  />
                </Grid>
              </>
            )}
          </>
        )}

        {children}

        {showSearchButton && (
          <>
            <Grid item xs={12} md={6} lg={2}>
              <Stack direction="row" spacing={1}>
                <LoadingButton
                  loading={isLoading}
                  variant="contained"
                  onClick={() => {
                    handleSubmit(false);
                  }}
                >
                  Search
                </LoadingButton>
                <LoadingButton loading={isLoading} variant="contained" color="error" onClick={handleReset} disabled={areFormValuesNull && !isClearActive}>
                  Clear
                </LoadingButton>
              </Stack>
            </Grid>
          </>
        )}

        {showDuplicateButton && (
          <>
            <Grid item xs={12} md={6} lg={2}>
              <Stack direction="row" spacing={1}>
                <LoadingButton
                  loading={isLoading}
                  variant="contained"
                  onClick={() => {
                    handleSubmit(true);
                  }}
                >
                  Show Duplicates
                </LoadingButton>
              </Stack>
            </Grid>
          </>
        )}
      </>
    );
  }
);

const mapStateToProps = (state) => {
  return {
    account: state.auth,
    common: state.common,
  };
};

export default connect(mapStateToProps, null, null, { forwardRef: true })(SearchByFilter);
