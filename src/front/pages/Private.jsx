// Import necessary components from react-router-dom and other parts of the application.
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";  // Custom hook for accessing the global state.
import { useEffect } from "react";


export const PrivatePage = () => {
    // Access the global state and dispatch function using the useGlobalReducer hook.
    const { store, dispatch } = useGlobalReducer()
    const navigate = useNavigate();

    useEffect(() => {
        const checkToken = async () => {
          const token = sessionStorage.getItem("access_token");
    
          if (!token) {
            navigate("/login");
            return;
          }

          const response = await fetch("https://studious-space-chainsaw-4jwpgv5qxx9p3qrr5-3001.app.github.dev/private", {
            headers: {
              Authorization: "Bearer " + token
            }
          });
    
          if (!response.ok) {
            navigate("/login");
          }
        };
    
        checkToken();
      }, []);

    const handleLogout = () => {
        sessionStorage.removeItem("access_token"); // Elimina el token
        navigate("/"); // Redirige al Home
    };

    return (
        <div className="container vh-100">
            <div className="row h-50 mt-5 justify-content-center align-items-center" >
                <div className="col-4 border rounded shadow p-4 mb-5 bg-white">
                <span className="mb-3 mt-2 fs-3 d-flex justify-content-center">Congratulations!!</span>
                    <span className="mb-3 mt-2 fs-3 d-flex justify-content-center">Welcome to the Premium Zone</span>
                    <span className="mb-5 text-secondary fs-6 d-flex justify-content-center">Enjoy the best this month</span>
                  
                </div>
            </div>
        </div>
    );
};
