import React, { useState } from "react";
import { connect } from "react-redux";
import { Link, Redirect } from "react-router-dom";
import { register,res } from "../../actions/auth";
import PropTypes from "prop-types";
import Alert from "../layout/Alert";
import { setAlert } from "../../actions/alert";
// import axios from "axios";
// import toast from "react-hot-toast";
// import { useNavigate } from "react-router-dom";


const Register = ({ setAlert, register, isAuthenticated }) => {
	// const [otp, setOtp] = useState("");
    // const [doVerification, setDoVerification] = useState(false);
    // const navigate = useNavigate();

	//signup otp
	// const handleSignup = async () => {
	// 		if(res.status === 200){
    //             const res = await axios.post("send-otp api");
    //             console.log(res);
    //             toast.success("Otp Sent to Email.");
    //         } else {
    //             toast.error("Something went wrong. Try Again!");
    //         }
     
    // };

	// otp vrification
	// const verifyOtp = async () => {
    //     try {
    //         if (otp === "" || email === "") {
    //             toast.error("Fill Otp to verify!");
    //             return;
    //         }
    //         const payload = {
    //             email: email,
    //             otp,
    //             type: "Signup",
    //         };

    //         //API Call
    //         const res = await axios.post(
    //             "verify-otp api",
    //             payload
    //         );
    //         if (res.status === 200) {
    //             //verify otp
    //             toast.success("Signup Successful.");
    //             // setLogin(true);
    //             navigate("/login")
    //         } else {
    //             toast.error("Something went wrong. Try Again!");
    //         }
    //         console.log(res);
    //     } catch (err) {
    //         toast.error("Invalid Otp!");
    //     }
    // };

	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		password2: "",
	});

	const { name, email, password, password2 } = formData;

	const onChange = (e) =>
		setFormData({ ...formData, [e.target.name]: e.target.value });

	const onSubmit = async (e) => {
		console.log("Form data", e);
		e.preventDefault();
		if (password !== password2) {
			setAlert("Password do not match", "danger");
		} else {
			register({ name, email, password });
		}
	};

	// Redirect if logged in
	if (isAuthenticated) {
		return <Redirect to="/dashboard" />;
	}

	return (
		<div className="register-form">
		<br/><br/>
			<h1 className="heading">Sign Up</h1>
			<p className="lead">
				<i className="fas fa-user"></i> Create Your Account
			</p>
			<Alert />
			<br />
			<form className="form" onSubmit={(e) => onSubmit(e)}>
				<div className="form-group">
					<input
						type="text"
						placeholder="Name"
						name="name"
						value={name}
						onChange={(e) => onChange(e)}
					/>
				</div>
				<div className="form-group">
					<input
						type="email"
						placeholder="Email Address"
						name="email"
						value={email}
						onChange={(e) => onChange(e)}
					/>
				</div>
				<div className="form-group">
					<input
						type="password"
						placeholder="Password"
						name="password"
						minLength="6"
						value={password}
						onChange={(e) => onChange(e)}
					/>
				</div>
				<div className="form-group">
					<input
						type="password"
						placeholder="Confirm Password"
						name="password2"
						minLength="6"
						value={password2}
						onChange={(e) => onChange(e)}
					/>
				</div>
				<input type="submit" className="btn1" value="Register" />
			</form>
			<p className="link">
				Already have an account? <Link to="/login">Sign In</Link>
			</p>
		</div>
	);
};

Register.propTypes = {
	setAlert: PropTypes.func.isRequired,
	register: PropTypes.func.isRequired,
	isAuthenticated: PropTypes.bool,
};

const mapStateToProps = (state) => ({
	isAuthenticated: state.auth.isAuthenticated,
});

export default connect(mapStateToProps, { setAlert, register })(Register);
