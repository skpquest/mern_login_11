import { Link } from "react-router-dom";


const Forget = () => {
  return(<>
     <div className="login-form">
     <br/><br/>
      <h1 className="heading">Forget Password</h1>
      
      <br />
      <form className="form" >
        <div className="form-group">
          <input
            type="email"
            placeholder=" Enter Email Address"
            name="email" 
            required
          />
        </div>
        
        <input type="submit" className="btn1" value="Send OTP" />
      </form>
      <p className="link">
        Don't have an account? <Link to="/register">Sign Up</Link>
      </p>
      <p className="link">
         <Link to="/Forget">Forget Password ?</Link>
      </p>
    </div>
  </>)
}
export default Forget;