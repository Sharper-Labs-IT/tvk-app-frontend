import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Calendar, Mail, Phone, Edit, ShieldCheck, Trophy, Crown } from 'lucide-react';

const MemberProfile: React.FC = () => {
  const { user } = useAuth();

  // Helper for formatting date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* --- Main Profile Card --- */}
      {/* CHANGED: Used bg-[#1E1E1E] (Dark Grey) to pop against the black background */}
      {/* ADDED: Gold border and shadow for visibility */}
      <div className="relative bg-[#1E1E1E] rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-gold/20">
        {/* 1. Cover Photo Section */}
        <div className="h-48 md:h-64 bg-gradient-to-b from-gray-800 to-[#1E1E1E] relative group">
          {/* Pattern overlay for texture */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>

          {/* Edit Cover Button */}
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className="bg-black/60 hover:bg-black/80 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm flex items-center gap-2 border border-white/10 shadow-lg">
              <Edit size={14} /> Edit Cover
            </button>
          </div>
        </div>

        {/* 2. Profile Info Area */}
        <div className="px-6 pb-8 pt-0 relative">
          {/* Header Layout: Avatar + Name + Actions */}
          <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 mb-6">
            {/* Avatar Image */}
            <div className="relative group">
              <div className="w-32 h-32 md:w-44 md:h-44 rounded-full p-1 bg-[#1E1E1E]">
                {' '}
                {/* Ring to match card bg */}
                <img
                  src={
                    user?.avatar_url ||
                    `https://ui-avatars.com/api/?name=${user?.name}&background=E6C65B&color=000&size=128`
                  }
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover border-4 border-gold shadow-lg bg-black"
                />
              </div>
              {/* Edit Avatar Button */}
              <button className="absolute bottom-2 right-2 bg-gold text-black p-2.5 rounded-full hover:bg-white hover:scale-110 transition shadow-lg border-2 border-[#1E1E1E]">
                <Edit size={18} />
              </button>
            </div>

            {/* Name & Role Section */}
            <div className="mt-4 md:mt-0 md:ml-6 flex-1 w-full">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white font-zentry tracking-wide drop-shadow-md">
                    {user?.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-sm font-bold">
                      <ShieldCheck size={14} />
                      {user?.roles?.map((r) => r.name).join(' & ') || 'Member'}
                    </span>
                    <span className="text-gray-400 text-sm flex items-center gap-1">
                      <MapPin size={14} /> Sri Lanka
                    </span>
                  </div>
                </div>

                {/* Main Action Buttons */}
                <div className="flex gap-3 mt-2 md:mt-0">
                  <button className="px-6 py-2.5 bg-gold hover:bg-goldDark text-black font-bold rounded-xl transition shadow-lg shadow-gold/10 transform hover:-translate-y-0.5">
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-white/10 mb-8" />

          {/* 3. Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Stats & Intro */}
            <div className="lg:col-span-1 space-y-6">
              {/* About / Intro Box */}
              <div className="bg-black/40 p-5 rounded-xl border border-white/5 hover:border-gold/20 transition-colors">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">About</h3>
                <ul className="space-y-4 text-gray-300 text-sm">
                  <li className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition">
                    <Mail size={18} className="text-gold shrink-0" />
                    <span className="truncate" title={user?.email}>
                      {user?.email}
                    </span>
                  </li>
                  <li className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition">
                    <Phone size={18} className="text-gold shrink-0" />
                    <span>{user?.mobile || 'No mobile added'}</span>
                  </li>
                  <li className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition">
                    <Calendar size={18} className="text-gold shrink-0" />
                    <span>Joined {formatDate(user?.created_at)}</span>
                  </li>
                </ul>
              </div>

              {/* Membership Status Widget */}
              <div className="bg-gradient-to-br from-gold/10 to-transparent p-5 rounded-xl border border-gold/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <Crown size={64} className="text-gold" />
                </div>
                <h3 className="text-lg font-bold text-gold mb-1">Current Plan</h3>
                <p className="text-2xl font-bold text-white mb-1">Free Tier</p>
                <p className="text-xs text-gray-400 mb-4">Upgrade to unlock exclusive contents.</p>

                <button className="w-full py-2.5 bg-transparent border border-gold text-gold hover:bg-gold hover:text-black transition rounded-lg font-bold text-sm uppercase tracking-wider">
                  Upgrade Now
                </button>
              </div>
            </div>

            {/* Right Column: Game History / Feed Placeholder */}
            <div className="lg:col-span-2 space-y-6">
              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-center">
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                    Total Points
                  </p>
                  <p className="text-2xl font-bold text-gold">0</p>
                </div>
                <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-center">
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                    Games Played
                  </p>
                  <p className="text-2xl font-bold text-white">0</p>
                </div>
                <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-center">
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Events Won</p>
                  <p className="text-2xl font-bold text-white">0</p>
                </div>
              </div>

              {/* Game History Empty State */}
              <div className="bg-black/40 rounded-xl border border-white/5 p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 text-gray-500">
                  <Trophy size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Game History Yet</h3>
                <p className="text-gray-400 max-w-sm mx-auto mb-6">
                  Start playing games to earn points, unlock badges, and climb the leaderboard!
                </p>
                <button className="px-6 py-2 bg-white/10 hover:bg-gold hover:text-black text-white rounded-lg transition font-medium border border-white/10 hover:border-gold">
                  Browse Games Library
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberProfile;
