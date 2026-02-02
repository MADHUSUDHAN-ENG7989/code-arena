const socketIo = require('socket.io');

let io;

const rooms = new Map(); // Store room state: { roomId: { hostId, users: [], questionId, code } }

const initSocket = (server) => {
    io = socketIo(server, {
        cors: {
            origin: "*", // Allow all for now, refine later
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        socket.on('join_room', ({ roomId, user }) => {
            // Initialize room if not exists
            if (!rooms.has(roomId)) {
                const newRoom = {
                    hostId: user._id,
                    users: [],
                    question: null,
                    code: '',
                    pendingRequests: [],
                    invited: new Set() // Track invited users
                };
                newRoom.users.push(user);
                rooms.set(roomId, newRoom);
                socket.join(roomId);

                socket.emit('room_state', {
                    users: newRoom.users,
                    hostId: newRoom.hostId,
                    question: newRoom.question,
                    code: newRoom.code,
                    timer: { isRunning: false, timeLeft: 0, duration: 0 }
                });
                return;
            }

            const room = rooms.get(roomId);

            // Re-joining user
            if (room.users.find(u => u._id === user._id)) {
                socket.join(roomId);
                socket.emit('room_state', {
                    users: room.users,
                    hostId: room.hostId,
                    question: room.question,
                    code: room.code,
                    timer: {
                        isRunning: !!room.timerInterval,
                        timeLeft: room.timeLeft || 0,
                        duration: room.duration || 0
                    }
                });
                return;
            }

            // Check if user was invited
            if (room.invited && room.invited.has(user._id)) {
                room.users.push(user);
                socket.join(roomId);
                socket.emit('join_success', {
                    roomId,
                    roomState: {
                        users: room.users,
                        hostId: room.hostId,
                        question: room.question,
                        code: room.code,
                        timer: {
                            isRunning: !!room.timerInterval,
                            timeLeft: room.timeLeft || 0,
                            duration: room.duration || 0
                        }
                    }
                });
                socket.to(roomId).emit('user_joined', user);
                return;
            }

            // Direct Join - No approval needed
            room.users.push(user);
            socket.join(roomId);

            socket.emit('join_success', {
                roomId,
                roomState: {
                    users: room.users,
                    hostId: room.hostId,
                    question: room.question,
                    code: room.code,
                    timer: {
                        isRunning: !!room.timerInterval,
                        timeLeft: room.timeLeft || 0,
                        duration: room.duration || 0
                    }
                }
            });
            socket.to(roomId).emit('user_joined', user);

        });

        socket.on('finalize_join', ({ roomId }) => {
            socket.join(roomId);
        });

        socket.on('typing_start', ({ roomId, user }) => {
            socket.to(roomId).emit('user_typing', { user, isTyping: true });
        });

        socket.on('typing_stop', ({ roomId, user }) => {
            socket.to(roomId).emit('user_typing', { user, isTyping: false });
        });

        socket.on('leave_room', ({ roomId, userId }) => {
            const room = rooms.get(roomId);
            if (room) {
                room.users = room.users.filter(u => u._id !== userId);
                socket.to(roomId).emit('user_left', userId);
                socket.leave(roomId);

                // Clean up empty rooms
                if (room.users.length === 0) {
                    if (room.timerInterval) clearInterval(room.timerInterval);
                    rooms.delete(roomId);
                }
            }
        });

        socket.on('send_message', ({ roomId, message, user }) => {
            io.to(roomId).emit('receive_message', { user, message, timestamp: new Date() });
        });

        socket.on('code_change', ({ roomId, code }) => {
            const room = rooms.get(roomId);
            if (room) {
                // Store user's code privately (maybe for spectating later)
                // Do NOT broadcast to everyone
                // room.code = code; // No longer shared global code

                // Optional: Store per user
                const user = room.users.find(u => u._id === socket.userId); // Need to track socket.userId if possible, or pass userId
                // For now, just acknowledged.
            }
        });

        socket.on('submit_result', ({ roomId, userId, passed, total }) => {
            const room = rooms.get(roomId);
            if (room) {
                if (!room.leaderboard) room.leaderboard = [];

                // check if already submitted fully
                const existing = room.leaderboard.find(e => e.userId === userId);
                if (existing && existing.passed === existing.total) return; // Already finished

                // Update or Add
                if (existing) {
                    existing.passed = passed;
                    existing.total = total;
                    existing.lastSubmitTime = new Date();
                    if (passed === total && !existing.completionTime) {
                        existing.completionTime = new Date();
                    }
                } else {
                    room.leaderboard.push({
                        userId,
                        passed,
                        total,
                        completionTime: passed === total ? new Date() : null,
                        lastSubmitTime: new Date()
                    });
                }

                // Sort: 
                // 1. Completed (passed == total) -> Time (asc)
                // 2. Not completed -> Passed (desc)
                room.leaderboard.sort((a, b) => {
                    const aComplete = a.passed === a.total;
                    const bComplete = b.passed === b.total;

                    if (aComplete && bComplete) return a.completionTime - b.completionTime;
                    if (aComplete) return -1;
                    if (bComplete) return 1;
                    return b.passed - a.passed;
                });

                // Attach User Names
                const payload = room.leaderboard.map(entry => {
                    const u = room.users.find(u => u._id === entry.userId);
                    return { ...entry, name: u?.name || 'Unknown' };
                });

                io.to(roomId).emit('leaderboard_update', payload);

                // If someone completed it, maybe notify?
                if (passed === total) {
                    io.to(roomId).emit('user_completed', { userId, name: room.users.find(u => u._id === userId)?.name });
                }
            }
        });

        socket.on('change_question', ({ roomId, question }) => {
            const room = rooms.get(roomId);
            if (room) {
                room.question = question;
                room.leaderboard = []; // Reset leaderboard
                // room.code = question.starterCode?.javascript || '// Start coding...'; // Don't reset shared code
                io.to(roomId).emit('leaderboard_update', []);
                io.to(roomId).emit('question_updated', question);
            }
        });

        socket.on('start_timer', ({ roomId, duration }) => {
            const room = rooms.get(roomId);
            if (room) {
                if (room.timerInterval) clearInterval(room.timerInterval);

                room.duration = duration;
                room.timeLeft = duration;

                io.to(roomId).emit('timer_start', duration);

                room.timerInterval = setInterval(() => {
                    room.timeLeft -= 1;
                    io.to(roomId).emit('timer_tick', room.timeLeft);

                    if (room.timeLeft <= 0) {
                        clearInterval(room.timerInterval);
                        room.timerInterval = null;
                        io.to(roomId).emit('timer_stop');
                    }
                }, 1000);
            }
        });

        socket.on('stop_timer', ({ roomId }) => {
            const room = rooms.get(roomId);
            if (room && room.timerInterval) {
                clearInterval(room.timerInterval);
                room.timerInterval = null;
                io.to(roomId).emit('timer_stop');
            }
        });

        socket.on('invite_user', ({ targetUserId, roomId, hostName }) => {
            console.log(`Inviting user ${targetUserId} to room ${roomId} by ${hostName}`);
            const room = rooms.get(roomId);
            if (room) {
                if (!room.invited) room.invited = new Set();
                room.invited.add(targetUserId);
                console.log(`Added ${targetUserId} to invited list. Current invited:`, [...room.invited]);
            } else {
                console.log(`Room ${roomId} not found for invite`);
            }
            io.to(targetUserId).emit('invitation', { roomId, hostName });
        });

        // Join a personal room for notifications
        socket.on('register_user', (userId) => {
            console.log(`Registering user socket: ${userId} (socketId: ${socket.id})`);
            socket.join(userId);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
            // Handle cleanup if needed, but tough without userId tracked on socket instance
        });
    });
};


const sendNotification = (userId, notification) => {
    if (!io) return;
    io.to(userId).emit('new_notification', notification);
};

const getIO = () => io;

module.exports = { initSocket, sendNotification, getIO };
