// Import necessary components from react-router-dom and other parts of the application.
import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react"
import useGlobalReducer from "../hooks/useGlobalReducer";  // Custom hook for accessing the global state.

export const Login = () => {
  // Access the global state and dispatch function using the useGlobalReducer hook.
  const { store, dispatch } = useGlobalReducer()

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [infoData, setInfoData] = useState();
  const [infoMe, setInfoMe] = useState();
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

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

      const dataResponse = await response.json();

      if (!response.ok) {
        setErrorMessage(dataResponse.msg || "Error al iniciar sesión");
        return;
      }

      sessionStorage.setItem("access_token", dataResponse.access_token)
      setErrorMessage(""); // Limpiar error previo
      setInfoData(dataResponse)

      window.location.href = "/private"; // esto recarga la página completamente
      // navigate("/private");

    } catch (error) {
      console.error(error)
    }
  };

  return (
    <div className="container vh-100">
      <div className="row h-50 mt-5 justify-content-center align-items-center" >
        <div className="col-4 border rounded shadow p-4 mb-5 bg-white">
          <span className="mb-3 mt-2 fs-3 d-flex justify-content-center">Welcome</span>
          <span className="mb-5 text-secondary fs-6">Enter your email and password below to login to your account</span>
          <form>
            <div className="mb-3 mt-4">
              <label htmlFor="exampleInputEmail1" className="form-label">Email address</label>
              <input type="email" onChange={(e) => { setEmail(e.target.value) }} className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="name@example.com" />
            </div>
            <div className="mb-3">
              <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
              <input type="password" onChange={(e) => { setPassword(e.target.value) }} className="form-control" id="exampleInputPassword1" />
            </div>
            {errorMessage && (  // Mensaje de alerta por si el usuario quiere ingresar con un email y/o password incorrectos.  
              <div className="alert alert-danger text-center mt-3" role="alert">
                {errorMessage}
              </div>
            )}
            <div className="d-grid">
              <button type="button" onClick={handleLogin} className="btn btn-warning w-100">Log in</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
