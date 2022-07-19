// import React, { useState } from "react";
// import { connect } from "react-redux";
// import { Link, Redirect } from "react-router-dom";
// import { register } from "../../actions/auth";
// import PropTypes from "prop-types";
// import Alert from "../layout/Alert";
// import { setAlert } from "../../actions/alert";

// const Register = ({ setAlert, register, isAuthenticated }) => {
// 	const [formData, setFormData] = useState({
// 		name: "",
// 		email: "",
// 		password: "",
// 		password2: "",
// 	});

// 	const { name, email, password, password2 } = formData;

// 	const onChange = (e) =>
// 		setFormData({ ...formData, [e.target.name]: e.target.value });

// 	const onSubmit = async (e) => {
// 		console.log("Form data", e);
// 		e.preventDefault();
// 		if (password !== password2) {
// 			setAlert("Password do not match", "danger");
// 		} else {
// 			register({ name, email, password });
// 		}
// 	};

// 	// Redirect if logged in
// 	if (isAuthenticated) {
// 		return <Redirect to="/dashboard" />;
// 	}

// 	return (
// 		<div className="register-form">
// 			<h1 className="heading">Sign Up</h1>
// 			<p className="lead">
// 				<i className="fas fa-user"></i> Create Your Account
// 			</p>
// 			<Alert />
// 			<br />
// 			<form className="form" onSubmit={(e) => onSubmit(e)}>
// 				<div className="form-group">
// 					<input
// 						type="text"
// 						placeholder="Name"
// 						name="name"
// 						value={name}
// 						onChange={(e) => onChange(e)}
// 					/>
// 				</div>
// 				<div className="form-group">
// 					<input
// 						type="email"
// 						placeholder="Email Address"
// 						name="email"
// 						value={email}
// 						onChange={(e) => onChange(e)}
// 					/>
// 				</div>
// 				<div className="form-group">
// 					<input
// 						type="password"
// 						placeholder="Password"
// 						name="password"
// 						minLength="6"
// 						value={password}
// 						onChange={(e) => onChange(e)}
// 					/>
// 				</div>
// 				<div className="form-group">
// 					<input
// 						type="password"
// 						placeholder="Confirm Password"
// 						name="password2"
// 						minLength="6"
// 						value={password2}
// 						onChange={(e) => onChange(e)}
// 					/>
// 				</div>
// 				<input type="submit" className="btn1" value="Register" />
// 			</form>
// 			<p className="link">
// 				Already have an account? <Link to="/login">Sign In</Link>
// 			</p>
// 		</div>
// 	);
// };

// Register.propTypes = {
// 	setAlert: PropTypes.func.isRequired,
// 	register: PropTypes.func.isRequired,
// 	isAuthenticated: PropTypes.bool,
// };

// const mapStateToProps = (state) => ({
// 	isAuthenticated: state.auth.isAuthenticated,
// });

// export default connect(mapStateToProps, { setAlert, register })(Register);

import { useState } from "react";
import { Button } from "react-bootstrap";
import { Link, Redirect } from "react-router-dom";
import { useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";
import axios from "axios";
import Alert from "../layout/Alert";

function Register(props) {
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [doVerification, setDoVerification] = useState(false);

  //   const navigate = useNavigate();

  const dispatch = useDispatch();

  //Signup Logic
  const handleSignup = async () => {
    const payload = {
      name: userName,
      email: userEmail,
      phoneNumber,
      password: userPassword,
    };
    //API Call signup
    const res = await axios.post("http://localhost:5000/users/", payload);
    if (res.status === 200) {
      setDoVerification(true);
      const payload = {
        email: userEmail,
        type: "signup",
      };
      //API Call otp
      const res = await axios.post("http://localhost:5000/users/otp", payload);
      console.log(res);
    }
  };

  // Otp Verification Logic
  const verifyOtp = async () => {
    const payload = {
      email: userEmail,
      otp,
      type: "Signup",
    };

    //API Call
    const res = await axios.post(
      "http://localhost:5000/users/otpverification",
      payload
    );
    if (res.status === 200) {
      <Link to="/login"></Link>;
      // navigate("/login");
    }

    console.log(res);
  };

  return (
    <div className="register-form">
      <h1 className="heading">Sign Up</h1>
      <p className="lead">
        <i className="fas fa-user"></i> Create Your Account
      </p>
      <Alert />
      <div className="form">
        {!doVerification && (
          <>
            <div className="form-group">
              <input
                type="text"
                name="name"
                required={true}
                className="customInputField"
                id="name"
                value={userName}
                placeholder="Name"
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <input
                type="email"
                name="email"
                required={true}
                className="customInputField"
                id="email"
                value={userEmail}
                placeholder="Email id"
                onChange={(e) => setUserEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <input
                type="number"
                name="phone"
                required={true}
                className="customInputField"
                id="phone"
                value={phoneNumber}
                placeholder="Phone"
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                name="password"
                required={true}
                className="customInputField"
                id="password"
                value={userPassword}
                placeholder="Password"
                onChange={(e) => setUserPassword(e.target.value)}
              />
            </div>
          </>
        )}
        {doVerification && (
          <div className="form-group">
            <input
              type="number"
              required={true}
              name="otp"
              className="customInputField"
              id="otp"
              value={otp}
              placeholder="Enter OTP"
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>
        )}
        <p style={{ textAlign: "center" }}>
          Already have an account? <a href="/login">Sign in</a>
        </p>
        <div className="form-group">
          {doVerification ? (
            <Button className="btn1" type="submit" onClick={verifyOtp}>
              Verify Otp
            </Button>
          ) : (
            <Button className="btn1" type="submit" onClick={handleSignup}>
              Signup
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Register;
