import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export const Navbar = () => {
	const [isLoggedIn, setIsLoggedIn] = useState(false)
	const navigate = useNavigate();

	useEffect(() => {
		const token = sessionStorage.getItem("access_token")
		setIsLoggedIn(!!token);  // true si hay token, false si no

	}, [])

	const handleLogout = () => {
		sessionStorage.removeItem("access_token")
		setIsLoggedIn(false);
		navigate("/")
	}

	return (
		<nav className="navbar navbar-light bg-light">
			<div className="container">
				<div>
					<Link to="/">
						<span className="btn btn-light">Home</span>
					</Link>
				</div>
				<div className="d-flex flex">
					{isLoggedIn ? (
						<div className="me-3">
							<button className="btn btn-danger" onClick={handleLogout}>Log out</button>
						</div>
					) : (
						<>
							<div className="me-3">
								<Link to="/login">
									<span className="btn btn-light">Log in</span>
								</Link>
							</div>

							<div>
								<span className="lh-lg border border-secondary"></span>
							</div>
							<div className="ms-3">
								<Link to="/signup">
									<button className="btn btn-light">Register</button>
								</Link>
							</div>
						</>
					)}
				</div>
			</div>
		</nav>
	);
};