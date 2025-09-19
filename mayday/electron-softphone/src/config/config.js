const config = {
  development: {
    apiUrl: "http://localhost:8004",
    wsUrl: "ws://localhost:8004",
    baseUrl: "http://localhost:5173",
    sipWsUrl: "ws://13.234.18.2:8088/ws",
  },
  production: {
    apiUrl: "https://hugamara.com",
    wsUrl: "ws://hugamara.com",
    baseUrl: "https://hugamara.com",
    // sipWsUrl: "ws://13.234.18.2:8088/ws",
    sipWsUrl: "wss://hugamara.com/ws",
  },
};

const environment = process.env.NODE_ENV || "development";
export default config[environment];
