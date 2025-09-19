import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Paper,
  Grid,
  Typography,
  InputAdornment,
  IconButton,
  Box,
  Switch,
  FormControlLabel,
  CircularProgress, // Added for loading state
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  ErrorOutline as ErrorIcon, // Added for error display
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import useAuth from "../hooks/useAuth";
// import reachmilogo from "../assets/images/reachmi-logo.svg"; // Placeholder path
import hugamaraLogo from "../assets/images/hugamara-dark-logo.svg"; // Placeholder path

const LoginMayday = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, isAuthenticated } = useAuth(); // include auth state
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [useLocalApp, setUseLocalApp] = useState(false); // Keep electron logic for now
  const [isElectronApp, setIsElectronApp] = useState(false);
  const [loginError, setLoginError] = useState(null); // Local state for error message

  // Electron-specific check (can be removed if not using Electron for dashboard)
  useEffect(() => {
    const checkElectron = () => {
      try {
        return window.electron !== undefined;
      } catch (e) {
        return false;
      }
    };
    setIsElectronApp(checkElectron());
  }, []);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleAppToggle = async (event) => {
    const useLocal = event.target.checked;
    setUseLocalApp(useLocal);
    // Keep electron logic for now
    if (isElectronApp && window.electron) {
      localStorage.setItem("useRemoteUrl", (!useLocal).toString());
      window.electron.send("set-url-preference", !useLocal);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError(null); // Clear previous errors
    try {
      const result = await login(username, password);
      if (result.user) {
        enqueueSnackbar("Login successful!", { variant: "success" });
        navigate("/dashboard", { replace: true }); // Navigate to dashboard on success
      }
    } catch (err) {
      // Error is thrown by useAuth login function on failure
      console.error("Login failed:", err);
      const errorMessage =
        err.message || "Login failed. Please check credentials.";
      setLoginError(errorMessage); // Set local error state
      enqueueSnackbar(errorMessage, {
        variant: "error",
      });
      // Clear password field on error
      setPassword("");
    }
  };

  // If already authenticated, skip login screen
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <Grid
      container
      alignItems="center"
      justifyContent="center"
      style={{ minHeight: "100vh", backgroundColor: "#f0f4f8" }}
    >
      <Grid item xs={11} sm={8} md={6} lg={4}>
        <Paper elevation={6} style={{ padding: "2rem" }}>
          {/* <Box textAlign="center" mb={2}>
            <Typography
              variant="h4"
              component="h1"
              // color="#E87D07"
              color="#000000"
              style={{
                fontWeight: "bolder",
                marginTop: "0.5rem",
                fontSize: "3rem",
              }}
            >
              Morven Consults
            </Typography>
          </Box> */}

          {/* Add Logo */}
          <img
            src={hugamaraLogo}
            alt="Mayday Logo"
            style={{
              width: "300px",
              height: "300px",
              objectFit: "contain",
              marginBottom: "-3rem",
              // center the logo
              display: "block",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          />
          {/* Stylish divider */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              margin: "1.5rem 0",
              "&::before, &::after": {
                content: '""',
                flex: 1,
                height: "1px",
                background:
                  "linear-gradient(90deg, transparent, #5f605f, transparent)",
              },
            }}
          >
            <Box
              sx={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#ccc",
                margin: "0 12px",
              }}
            />
          </Box>
          <Typography
            variant="h6"
            component="h2"
            style={{
              textAlign: "center",
              marginBottom: "1.5rem",
              color: "#555",
              fontWeight: "lighter",
              fontSize: "14px",
              fontFamily: "Arial, sans-serif",
              fontStyle: "italic",
            }}
          >
            Logon to manage Mayday Contact Center!
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin="normal"
              fullWidth
              required
              disabled={loading}
            />
            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              fullWidth
              required
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                      disabled={loading}
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Display Login Error Message */}
            {loginError && (
              <Box
                display="flex"
                alignItems="center"
                mt={1}
                mb={1}
                color="error.main"
              >
                <ErrorIcon fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="caption">{loginError}</Typography>
              </Box>
            )}

            {/* Electron specific toggle - keep for now */}
            {isElectronApp && (
              <FormControlLabel
                control={
                  <Switch
                    checked={useLocalApp}
                    onChange={handleAppToggle}
                    color="primary"
                    disabled={loading}
                  />
                }
                label="Use Local App"
                style={{ marginBottom: "1rem", display: "block" }}
              />
            )}
            <Button
              type="submit"
              sx={{
                backgroundColor: "#046577",
                "&:hover": {
                  backgroundColor: "#046577",
                },
              }}
              // color="warning"
              variant="contained"
              fullWidth
              disabled={loading} // Disable button while loading
              style={{ marginTop: "1rem", height: "40px" }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Log In"
              )}
            </Button>
          </form>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default LoginMayday;
