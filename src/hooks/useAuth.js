import { useState, useEffect, useCallback } from "react";
import authApiClient from "../services/auth-api-client";

const useAuth = () => {
  const [authTokens, setAuthTokens] = useState(
    () => JSON.parse(localStorage.getItem("authTokens")) || null
  );
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // track restoration
  const [errorMsg, setErrorMsg] = useState("");

  const saveTokens = (tokens) => {
    setAuthTokens(tokens);
    localStorage.setItem("authTokens", JSON.stringify(tokens));
  };

  const clearTokens = () => {
    setAuthTokens(null);
    localStorage.removeItem("authTokens");
  };

  const fetchUserProfile = useCallback(
    async (tokens = authTokens) => {
      if (!tokens?.access) return null;
      try {
        const res = await authApiClient.get("/auth/users/me/", {
          headers: { Authorization: `JWT ${tokens.access}` },
        });
        setUser(res.data);
        return res.data;
      } catch (err) {
        console.error("Fetch user error:", err.response || err.message);
        // don't clear user yet — maybe token expired, handle with refresh
        return null;
      } finally {
        setLoading(false);
      }
    },
    [authTokens]
  );

  // Restore user on mount
  useEffect(() => {
    if (authTokens) fetchUserProfile();
    else setLoading(false);
  }, [authTokens, fetchUserProfile]);

  const loginUser = async ({ email, password }) => {
    setErrorMsg("");
    try {
      const res = await authApiClient.post("/auth/jwt/create/", {
        email,
        password,
      });
      saveTokens(res.data);
      await fetchUserProfile(res.data);
      return { success: true };
    } catch (err) {
      const fieldErrors = err.response?.data || {};
      return { success: false, fieldErrors, message: err.message };
    }
  };

  const logoutUser = () => {
    clearTokens();
    setUser(null);
  };

  const registerUser = async (userData) => {
    setErrorMsg("");
    try {
      await authApiClient.post("/auth/users/", userData);
      return { success: true, message: "Registration successful." };
    } catch (err) {
      return { success: false, message: err.response?.data || err.message };
    }
  };

  return {
    user,
    authTokens,
    loading,
    errorMsg,
    loginUser,
    logoutUser,
    registerUser,
    fetchUserProfile,
  };
};

export default useAuth;