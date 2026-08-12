import { Navigate } from "react-router";
import { useAuthContext } from "../contexts/AuthContext";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] bg-transparent">
        <span className="loading loading-spinner loading-lg text-[#2ecc71]"></span>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;