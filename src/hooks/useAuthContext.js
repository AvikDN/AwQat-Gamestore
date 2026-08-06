import { useContext } from "react";
import AuthContext from "../contexts/AuthContext.jsx";

const useAuthContext = () => {
  return useContext(AuthContext);
};

export default useAuthContext;