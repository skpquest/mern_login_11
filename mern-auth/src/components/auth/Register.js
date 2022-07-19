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
  const [userId, setUserId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [doVerification, setDoVerification] = useState(false);

  //   const navigate = useNavigate();

  const dispatch = useDispatch();

  //Signup Logic
  const handleSignup = async () => {

    try {


      const payload = {
        name: userName,
        email: userEmail,
        phoneNumber,
        password: userPassword,
      };
      //API Call signup
      const res = await axios.post("http://localhost:5000/users/", payload);
      // console.log("signup", res)

      if(res.data.success){
        // console.log("SUCCESS")
        setUserId(res.data.data.user.id)
        
        const payload = {
          email: userEmail,
          userId:res.data.data.user.id,
          type: "signup",
        };
        //API Call otp
        const response = await axios.post("http://localhost:5000/users/otp", payload);
        setDoVerification(true);
        console.log("otp", response);
      }
    } catch (err) {

    }
  };

  // Otp Verification Logic
  const verifyOtp = async () => {
    const payload = {
      userId,
      otp,

    };
    console.log(payload)
    //API Call
    const res = await axios.post(
      "http://localhost:5000/users/otpverification",
      payload
    );

    if(res.data.status==="VERIFIED"){
      window.location.replace("/login");
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
