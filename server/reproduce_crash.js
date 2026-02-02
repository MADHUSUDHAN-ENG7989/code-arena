const io = require("socket.io-client");

const socket = io("http://localhost:5000");

socket.on("connect", () => {
    console.log("Connected to server");
    socket.emit("join_room", { roomId: "test", user: { _id: "123", name: "Test" } });
});

socket.on("disconnect", () => {
    console.log("Disconnected");
});

socket.on("connect_error", (err) => {
    console.log("Connection Error:", err.message);
});

setTimeout(() => {
    console.log("Exiting...");
    process.exit(0);
}, 5000);
