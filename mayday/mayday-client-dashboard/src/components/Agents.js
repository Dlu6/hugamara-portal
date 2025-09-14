import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Fab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Divider,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useDispatch, useSelector } from "react-redux";
import IconButton from "@mui/material/IconButton";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useSnackbar } from "notistack";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Chip,
  Stack,
} from "@mui/material";
import licenseService from "../services/licenseService";
import { useNavigate } from "react-router-dom";
import { getSocket, connectWebSocket } from "../services/websocketService";
import useAuth from "../hooks/useAuth";

import NewAgentForm from "./forms/NewAgentForm";
import {
  agentDeleted,
  deleteAgent,
  fetchAgents,
} from "../features/agents/agentsSlice.js";
// import TableLoadingIndicator from "../assets/tableLoadingIndicator.json";
import ConfirmDeletionDialog from "../utils/ConfirmDeletionDialog";
import LoadingIndicator from "./common/LoadingIndicator";

const AgentsComponent = () => {
  const { agents, status, error, loading } = useSelector(
    (state) => state.agents
  );
  const dispatch = useDispatch();
  const { handleTokenInvalidation } = useAuth();
  const [sessionCounts, setSessionCounts] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(fetchAgents()).unwrap();
        const { data } = await licenseService.getCurrentWebRTCSessions();
        const sessions = Array.isArray(data?.data?.active_users)
          ? data.data.active_users
          : [];
        const counts = sessions.reduce((acc, session) => {
          acc[session.user_id] = (acc[session.user_id] || 0) + 1;
          return acc;
        }, {});
        setSessionCounts(counts);
      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.response && error.response.status === 401) {
          handleTokenInvalidation();
        }
      }
    };

    fetchData();

    const socket = getSocket();
    if (socket) {
      const handleLicenseUpdate = (data) => {
        console.log("License update received via WebSocket:", data);
        fetchData(); // Refetch data on update
      };

      socket.on("license:updated", handleLicenseUpdate);

      return () => {
        socket.off("license:updated", handleLicenseUpdate);
      };
    }
  }, [dispatch, handleTokenInvalidation]);

  const [open, setOpen] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState([]);

  const [anchorEl, setAnchorEl] = useState(null);
  const [currentAgentId, setCurrentAgentId] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [isDeleting, setIsDeleting] = useState(false);
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [activeSessions, setActiveSessions] = useState([]);
  const [sessionsAgent, setSessionsAgent] = useState(null);
  const [endingSessions, setEndingSessions] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchAgents())
      .unwrap()
      .catch((error) => {
        console.error("Fetch failed:", error);
      });
  }, [dispatch]);

  useEffect(() => {
    let socket = getSocket();

    if (!socket) {
      socket = connectWebSocket();
      if (!socket) {
        console.error("Failed to initialize WebSocket");
        return;
      }
    }

    const handleAgentDeleted = (deletedAgentId) => {
      dispatch(agentDeleted(deletedAgentId));
    };

    const handleAgentUpdated = () => {
      dispatch(fetchAgents());
    };

    socket.on("agent-deleted", handleAgentDeleted);
    socket.on("agent-updated", handleAgentUpdated);

    // Initial fetch
    dispatch(fetchAgents());

    return () => {
      if (socket) {
        socket.off("agent-deleted", handleAgentDeleted);
        socket.off("agent-updated", handleAgentUpdated);
      }
    };
  }, [dispatch]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Update handleNewAgent to refresh the agents list
  const handleNewAgent = async () => {
    try {
      await dispatch(fetchAgents()).unwrap(); // Refresh the agents list
      enqueueSnackbar("Agent created successfully", { variant: "success" });
      handleClose();
    } catch (error) {
      enqueueSnackbar("Error refreshing agents list", { variant: "error" });
    }
  };

  //Handle individual row checkbox change
  const handleCheckboxChange = (agentId) => {
    const currentIndex = selectedAgents.indexOf(agentId);
    const newSelectedAgents = [...selectedAgents];

    if (currentIndex === -1) {
      newSelectedAgents.push(agentId);
    } else {
      newSelectedAgents.splice(currentIndex, 1);
    }

    setSelectedAgents(newSelectedAgents);
  };

  //Check if all rows are selected
  const isAllSelected =
    agents.length > 0 && selectedAgents.length === agents.length;

  //Handle select all checkbox change
  const handleSelectAllClick = () => {
    if (isAllSelected) {
      setSelectedAgents([]);
    } else {
      setSelectedAgents(agents.map((agent) => agent.id));
    }
  };

  //More agent options
  const handleMenuClick = (event, agentId) => {
    setCurrentAgentId(agentId);
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const openSessionsModal = async (agent) => {
    setSessionsAgent(agent);
    setSessionsOpen(true);
    setSessionsLoading(true);
    try {
      const { data } = await licenseService.getCurrentWebRTCSessions();
      const list = Array.isArray(data?.data?.active_users)
        ? data.data.active_users
        : [];
      const filtered = agent?.id
        ? list.filter((s) => String(s.user_id) === String(agent.id))
        : list;
      setActiveSessions(filtered);
    } catch (e) {
      enqueueSnackbar(
        e?.response?.data?.message || "Failed to load active sessions",
        { variant: "error" }
      );
    } finally {
      setSessionsLoading(false);
    }
    handleMenuClose();
  };

  const handleEndSessionsForAgent = async () => {
    if (!sessionsAgent) return;
    setEndingSessions(true);
    try {
      await licenseService.cleanupUserSessions(
        sessionsAgent.id,
        "webrtc_extension"
      );
      // Refetch sessions after cleanup to confirm result
      try {
        const { data } = await licenseService.getCurrentWebRTCSessions();
        const list = Array.isArray(data?.data?.active_users)
          ? data.data.active_users
          : [];
        const filtered = list.filter(
          (s) => String(s.user_id) === String(sessionsAgent.id)
        );
        setActiveSessions(filtered);
      } catch (_) {}

      enqueueSnackbar("Sessions ended for user", { variant: "success" });
      setSessionsOpen(false);
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || "Failed to end sessions", {
        variant: "error",
      });
    } finally {
      setEndingSessions(false);
    }
  };

  //Delete agent account
  const showDeleteConfirmation = (agentId) => {
    setCurrentAgentId(agentId);
    setConfirmOpen(true);
    handleMenuClose();
  };

  const handleDeleteAgent = async () => {
    setIsDeleting(true);
    dispatch(deleteAgent(currentAgentId))
      .unwrap()
      .then(() => {
        enqueueSnackbar("Agent deleted successfully", { variant: "success" });
      })
      .catch((error) => {
        const errorMessage = error.message || "Failed to delete agent";
        enqueueSnackbar(errorMessage, { variant: "error" });
      })
      .finally(() => {
        setIsDeleting(false);
        setConfirmOpen(false);
      });
  };

  const handleEditAgent = (agentId, extension) => {
    navigate(`/agents/edit/${agentId}`, { state: { extension } });
  };

  // Modify the Menu component implementation
  const renderAgentMenu = (agent) => {
    const menuId = `menu-${agent.id}`;
    const isMenuOpen = Boolean(anchorEl) && currentAgentId === agent.id;

    return (
      <>
        <IconButton
          aria-label={`more options for ${agent.fullName}`}
          aria-controls={isMenuOpen ? menuId : undefined}
          aria-expanded={isMenuOpen}
          aria-haspopup="menu"
          onClick={(event) => handleMenuClick(event, agent.id)}
          size="small"
        >
          <MoreVertIcon />
        </IconButton>
        <Menu
          id={menuId}
          anchorEl={anchorEl}
          open={isMenuOpen}
          onClose={handleMenuClose}
          MenuListProps={{
            "aria-labelledby": `menu-button-${agent.id}`,
            role: "menu",
          }}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          slotProps={{
            paper: {
              elevation: 3,
              sx: { width: "20ch" },
            },
          }}
        >
          <MenuItem
            onClick={() => openSessionsModal(agent)}
            role="menuitem"
            sx={{ fontStyle: "italic", fontSize: "14px" }}
          >
            Manage Sessions
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleEditAgent(agent.id, agent.extension);
              handleMenuClose();
            }}
            role="menuitem"
            sx={{ fontStyle: "italic", fontSize: "14px" }}
          >
            Edit Agent
          </MenuItem>
          <MenuItem
            onClick={() => {
              showDeleteConfirmation(agent.id);
              handleMenuClose();
            }}
            role="menuitem"
            sx={{ fontStyle: "italic", fontSize: "14px", color: "#BD2A2E" }}
          >
            Delete Agent
          </MenuItem>
        </Menu>
      </>
    );
  };

  return (
    <>
      <Box sx={{ position: "relative", height: "100%", pb: 8 }}>
        {status === "failed" && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Error loading agents: {error}
          </Alert>
        )}

        {status === "loading" ? (
          <LoadingIndicator />
        ) : agents.length === 0 ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            No agents found. Create one using the + button below.
          </Alert>
        ) : (
          <Paper sx={{ width: "100%", overflowX: "auto" }}>
            <Table stickyHeader aria-label="agents table">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={
                        selectedAgents.length > 0 &&
                        selectedAgents.length < agents.length
                      }
                      checked={isAllSelected}
                      onChange={handleSelectAllClick}
                    />
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      color: "rgba(0, 0, 0, 0.54)",
                    }}
                  >
                    Avatar
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      color: "rgba(0, 0, 0, 0.54)",
                    }}
                  >
                    Full Name
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      color: "rgba(0, 0, 0, 0.54)",
                    }}
                  >
                    Username
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      color: "rgba(0, 0, 0, 0.54)",
                    }}
                  >
                    Typology
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      color: "rgba(0, 0, 0, 0.54)",
                    }}
                  >
                    Email
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      color: "rgba(0, 0, 0, 0.54)",
                    }}
                  >
                    Internal Number
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      color: "rgba(0, 0, 0, 0.54)",
                    }}
                  >
                    Active Sessions
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      color: "rgba(0, 0, 0, 0.54)",
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {agents.map((agent) => {
                  const isSelected = selectedAgents.indexOf(agent.id) !== -1;

                  return (
                    <TableRow key={agent.id} selected={isSelected} hover>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleCheckboxChange(agent.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Avatar>
                          {typeof agent.fullName === "string"
                            ? agent.fullName[0]
                            : "?"}
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        {agent.fullName || agent.name || "N/A"}
                      </TableCell>
                      <TableCell>{agent.username}</TableCell>
                      <TableCell>{agent.typology || "N/A"}</TableCell>
                      <TableCell>{agent.email}</TableCell>
                      <TableCell>{agent?.extension}</TableCell>
                      <TableCell>{sessionCounts[agent.id] || 0}</TableCell>
                      <TableCell>{renderAgentMenu(agent)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Paper>
        )}
        <Fab
          color="primary"
          aria-label="add"
          sx={{ position: "fixed", bottom: 16, right: 16 }}
          onClick={handleOpen}
        >
          <AddIcon />
        </Fab>
        <NewAgentForm
          open={open}
          handleClose={handleClose}
          handleNewAgent={handleNewAgent}
        />
      </Box>

      <Divider sx={{ my: 2 }} />
      <ConfirmDeletionDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeleteAgent}
        title={loading ? "Deleting Profile..." : "Confirm Deletion!"}
        message="Are you sure you want to delete this agent? This action cannot be undone."
        isDeleting={isDeleting}
      />

      <Dialog
        open={sessionsOpen}
        onClose={() => setSessionsOpen(false)}
        fullWidth
      >
        <DialogTitle>
          Active Sessions{sessionsAgent ? ` — ${sessionsAgent.username}` : ""}
        </DialogTitle>
        <DialogContent dividers>
          {sessionsLoading ? (
            <LoadingIndicator />
          ) : activeSessions.length === 0 ? (
            <Alert severity="info">No active sessions found.</Alert>
          ) : (
            <List>
              {activeSessions.map((s) => (
                <ListItem key={s.id} sx={{ display: "block" }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip label={s.status} size="small" />
                    <Chip
                      label={s.client_fingerprint?.slice(0, 8)}
                      size="small"
                    />
                    <Chip label={s.ip_address || "N/A"} size="small" />
                    <Chip
                      label={s.user_agent?.slice(0, 24) || "N/A"}
                      size="small"
                    />
                  </Stack>
                  <ListItemText
                    primary={`Started: ${s.start_time}`}
                    secondary={`Duration: ${s.duration}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSessionsOpen(false)}>Close</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleEndSessionsForAgent}
            disabled={sessionsLoading || endingSessions}
          >
            {endingSessions ? "Ending..." : "End All Sessions"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
export default AgentsComponent;
