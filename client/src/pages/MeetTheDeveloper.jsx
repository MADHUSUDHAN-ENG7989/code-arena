import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import { LuLinkedin, LuInstagram, LuCode, LuServer, LuDatabase, LuZap } from 'react-icons/lu';

const MeetTheDeveloper = () => {
    return (
        <MainLayout minimal={true}>
            <div className="space-y-12 pb-12">
                {/* Hero Section */}
                <div className="relative overflow-hidden rounded-3xl bg-[#151E2E] border border-gray-800 p-8 text-center">
                    <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

                    <div className="relative z-10">
                        <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 font-mono text-xs border border-indigo-500/20 mb-4">
                            Constructed with Passion
                        </span>
                        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                            Behind the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Code</span>
                        </h1>
                        <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
                            Method Code wasn't just built to run code—it was verified to master it. A platform designed for the next generation of developers.
                        </p>
                    </div>
                </div>

                {/* Developer Profile */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="order-2 md:order-1">
                        <div className="bg-[#151E2E] rounded-2xl border border-gray-800 p-8 hover:border-indigo-500/30 transition-all duration-300">
                            <h2 className="text-2xl font-bold text-white mb-2">The Developer</h2>
                            <h3 className="text-xl text-indigo-400 font-medium mb-4">Hi, I'm Madhu 👋</h3>
                            <p className="text-gray-400 mb-6 leading-relaxed">
                                I built this platform to bridge the gap between learning algorithms and mastering them in a real-time, competitive environment. My focus is on creating seamless, high-performance web experiences.
                            </p>
                            <p className="text-gray-400 mb-6 leading-relaxed border-l-4 border-indigo-500 pl-4 py-1 bg-indigo-500/5 rounded-r-lg">
                                Have ideas or found a bug? I'd love to hear from you! Feel free to connect and message me on <span className="text-indigo-400 font-semibold">LinkedIn</span> for any feedback or improvements.
                            </p>

                            <div className="flex gap-4">
                                <a href="https://www.linkedin.com/in/madhusudhanchilumula" target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-gray-800 text-gray-400 hover:text-blue-400 hover:bg-gray-700 transition-colors">
                                    <LuLinkedin size={24} />
                                </a>
                                <a href="https://www.instagram.com/madhusudhan___o?igsh=OHV1eTZ6dG1tMHJq" target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-gray-800 text-gray-400 hover:text-pink-400 hover:bg-gray-700 transition-colors">
                                    <LuInstagram size={24} />
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="order-1 md:order-2 flex justify-center">
                        <div className="relative w-64 h-64">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                            <div className="relative w-full h-full rounded-full bg-gray-900 border-4 border-indigo-500/30 overflow-hidden flex items-center justify-center">
                                {/* Real Avatar */}
                                <img src="/madhu.jpeg" alt="Madhu" className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tech Stack */}
                <div>
                    <h2 className="text-2xl font-bold text-white mb-8 text-center">Powering the Platform</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <TechCard icon={<LuCode />} title="Frontend" desc="React + Tailwind" color="text-cyan-400" />
                        <TechCard icon={<LuServer />} title="Backend" desc="Node.js + Express" color="text-green-400" />
                        <TechCard icon={<LuDatabase />} title="Database" desc="MongoDB" color="text-emerald-400" />
                        <TechCard icon={<LuZap />} title="Realtime" desc="Socket.io" color="text-yellow-400" />
                    </div>
                </div>

                <div className="text-center pt-8">
                    <Link to="/" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>
        </MainLayout>
    );
};

const TechCard = ({ icon, title, desc, color }) => (
    <div className="bg-[#0B1120] p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors text-center group">
        <div className={`text-4xl mb-3 ${color} group-hover:scale-110 transition-transform duration-300`}>
            {icon}
        </div>
        <h3 className="text-white font-bold mb-1">{title}</h3>
        <p className="text-sm text-gray-500">{desc}</p>
    </div>
);

export default MeetTheDeveloper;
