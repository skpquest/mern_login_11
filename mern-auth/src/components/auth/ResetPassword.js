import { Link, Redirect } from "react-router-dom";


const ResetPassword = () => {
    
    return (
		<div className="register-form">
		<br/><br/>
			<h1 className="heading">Reset Password</h1>
			
			<br />
			<form className="form" >
				
				<div className="form-group">
					<input
						type="email"
						placeholder="Email Address"
						name="email"
						
					/>
				</div>
				<div className="form-group">
					<input
						type="password"
						placeholder="Password"
						name="password"
						minLength="6"
						
					/>
				</div>
				<div className="form-group">
					<input
						type="password"
						placeholder="Confirm Password"
						name="password2"
						minLength="6"
						
					/>
				</div>
				<input type="submit" className="btn1" value="Reset Password" />
			</form>
			<p className="link">
				Already have an account? <Link to="/login">Sign In</Link>
			</p>
		</div>
	);
}
export default ResetPassword;