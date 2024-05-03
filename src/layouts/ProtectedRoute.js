import React, { useEffect } from "react";
import { connect } from "react-redux";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { showAlert } from "../actions/alert";
import { authLogout } from "../actions/auth";

const ProtectedRoute = ({ type, auth, showAlert, authLogout }) => {
  const navigate = useNavigate();



  return <Outlet />;
};

const mapStateToProps = (state) => {
  return {
    auth: state.auth,
  };
};

export default connect(mapStateToProps, { showAlert, authLogout })(ProtectedRoute);
