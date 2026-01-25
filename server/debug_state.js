require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Notification = require('./src/models/Notification');

const debugState = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const madhu = await User.findOne({ rollNumber: 'madhu' });
        if (!madhu) { console.log('Madhu not found'); process.exit(0); }

        console.log('Madhu ID:', madhu._id.toString());
        console.log('Friend Requests Length:', madhu.friendRequests.length);

        madhu.friendRequests.forEach((req, i) => {
            console.log(`Request ${i}: From=${req.from}, Status=${req.status}`);
        });

        const notifications = await Notification.find({ recipient: madhu._id });
        console.log('Notifications Length:', notifications.length);
        notifications.forEach((n, i) => {
            console.log(`Notif ${i}: ID=${n._id}, Sender=${n.sender}, Type=${n.type}, Read=${n.isRead}`);

            // Explicit check
            const match = madhu.friendRequests.find(r => r.from.toString() === n.sender.toString());
            console.log(`  -> Match in requests? ${match ? 'YES' : 'NO'}`);
            if (match) console.log(`  -> Match Status: ${match.status}`);
        });

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

debugState();
