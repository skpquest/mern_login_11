import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
// import icon from "../img/user.png";

const Dashboard = ({ auth: { user } }) => {
  return (
    <div style={{ marginTop: "10rem", textAlign: "center" }}>
      <h1>Welcome, {user && user.name}</h1>
      <img  className="img1"
      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJtM5N5th0CeR3fmEkV_3_1XGZO-11__6-_A&usqp=CAU"
      alt="new"
      />
    </div>
  );
};
Dashboard.propTypes = {
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps)(Dashboard);
