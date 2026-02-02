
const io = require("socket.io-client");

const socket = io("http://localhost:5000");

socket.on("connect", () => {
    console.log("Connected to server");
    socket.emit("join_room", { roomId: "test_room", user: { _id: "123", name: "Test User" } });

    setTimeout(() => {
        console.log("Starting timer...");
        socket.emit("start_timer", { roomId: "test_room", duration: 5 });
    }, 1000);

    setTimeout(() => {
        console.log("Leaving room...");
        socket.emit("leave_room", { roomId: "test_room", userId: "123" });
        // socket.disconnect();
    }, 3000);
});

socket.on("connect_error", (err) => {
    console.log("Connection Error:", err.message);
});

socket.on("disconnect", () => {
    console.log("Disconnected");
});

setTimeout(() => {
    console.log("Exiting...");
    process.exit(0);
}, 6000);
