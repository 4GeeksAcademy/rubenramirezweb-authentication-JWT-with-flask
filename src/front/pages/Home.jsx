import React, { useEffect, useState } from "react"
import rigoImageUrl from "../assets/img/rigo-baby.jpg";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { Link } from "react-router-dom";

export const Home = () => {

	// const [ store, dispatch ] = useGlobalReducer();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [infoData, setInfoData] = useState();
	const [infoMe, setInfoMe] = useState();

	const handleLogin = async () => {
		const data = {
			"email": email,
			"password": password
		}

		try {
			const response = await fetch('https://studious-space-chainsaw-4jwpgv5qxx9p3qrr5-3001.app.github.dev/login', {
				method: 'POST',
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(data)
			});

			if (!response.ok) {
				throw new Error("Ocurrió un error, al llamar al endopint /login");
			};

			const dataResponse = await response.json();
			sessionStorage.setItem("access_token", dataResponse.access_token)
			setInfoData(dataResponse)
		} catch (error) {
			console.error(error)
		}
	};

	const handleMe = async () => {
		try {
			const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/me`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem('access_token')}`
				},
			});

			const data = await response.json();
			setInfoMe(data)
		} catch (error) {
			console.error(error)
		}
	};


	useEffect(() => {

	}, [])

	return (
		<div className="text-center mt-5">
			<div className="row vh-50">
				<h1>Welcome to my Web Site</h1>
				<h3 className="my-5">Don't have an account? No problem!!  Create one now.</h3>
			</div>
			<div>
				<Link to="/signup">
					<button type="button" className="btn btn-warning">Register Now!</button>
				</Link>
			</div>

		</div>
	);
}; 