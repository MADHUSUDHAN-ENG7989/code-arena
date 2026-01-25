import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';

const InvitationListener = () => {
    const socket = useSocket();
    const navigate = useNavigate();
    const [invitation, setInvitation] = useState(null);

    useEffect(() => {
        if (!socket) return;

        socket.on('invitation', ({ roomId, hostName }) => {
            setInvitation({ roomId, hostName });
            // Auto-dismiss after 10 seconds if ignored
            setTimeout(() => setInvitation(null), 10000);
        });

        return () => {
            socket.off('invitation');
        };
    }, [socket]);

    if (!invitation) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[100] animate-in slide-in-from-bottom-5 duration-300">
            <div className="bg-[#151E2E] border border-indigo-500/50 p-4 rounded-xl shadow-2xl shadow-indigo-500/20 max-w-sm w-full">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                        ⚡
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-white mb-1">Arena Challenge!</h4>
                        <p className="text-sm text-gray-300 mb-3">
                            <span className="font-bold text-white">{invitation.hostName}</span> has invited you to a code duel.
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    navigate(`/arena/room/${invitation.roomId}`);
                                    setInvitation(null);
                                }}
                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors flex-1"
                            >
                                Accept
                            </button>
                            <button
                                onClick={() => setInvitation(null)}
                                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold rounded-lg transition-colors"
                            >
                                Ignore
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvitationListener;
