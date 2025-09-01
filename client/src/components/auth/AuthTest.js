import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout, getCurrentUser } from "../../store/slices/authSlice";

const AuthTest = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading, error, token } = useSelector(
    (state) => state.auth
  );

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleRefreshUser = () => {
    dispatch(getCurrentUser());
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Authentication Test</h2>

      <div className="space-y-4">
        <div>
          <strong>Authentication Status:</strong>{" "}
          {isAuthenticated ? "✅ Authenticated" : "❌ Not Authenticated"}
        </div>

        <div>
          <strong>Loading:</strong> {loading ? "🔄 Loading..." : "✅ Ready"}
        </div>

        <div>
          <strong>Token:</strong>{" "}
          {token ? `✅ Present (${token.substring(0, 20)}...)` : "❌ Missing"}
        </div>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <strong>Error:</strong>{" "}
            {typeof error === "string"
              ? error
              : error?.message || "Unknown error"}
          </div>
        )}

        {user && (
          <div className="p-4 bg-green-100 border border-green-400 rounded">
            <h3 className="font-bold mb-2">User Information:</h3>
            <p>
              <strong>Name:</strong> {user.firstName} {user.lastName}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Role:</strong> {user.role}
            </p>
            <p>
              <strong>Outlet:</strong> {user.outlet?.name || "N/A"}
            </p>
            <p>
              <strong>Permissions:</strong> {user.permissions?.length || 0}{" "}
              permissions
            </p>
          </div>
        )}

        <div className="flex space-x-4">
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => (window.location.href = "/login")}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Go to Login
            </button>
          )}

          {isAuthenticated && (
            <button
              onClick={handleRefreshUser}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Refresh User Data
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthTest;
