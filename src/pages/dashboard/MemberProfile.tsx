import React, { useState, useRef, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  MapPin,
  Calendar,
  Mail,
  Phone,
  Edit,
  ShieldCheck,
  Trophy,
  Crown,
  Camera,
  Lock,
  Star,
  Gamepad2,
  // MERGE: Combined icons from both branches
  User,
  Check,
  X,
  Coins,
  Sparkles,
  Flame,
  Medal,
  Zap,
  Ticket,
  Award,
} from 'lucide-react';
import { userService } from '../../services/userService';
import EditProfileModal from '../../components/dashboard/EditProfileModal';
import ResetPasswordModal from '../../components/dashboard/ResetPasswordModal';
import NicknameConfirmModal from '../../components/dashboard/NicknameConfirmModal';

// --- 1. DYNAMIC URL CONFIGURATION ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const CLEAN_BASE_URL = API_BASE_URL.replace(/\/$/, '');
const STORAGE_BASE_URL = CLEAN_BASE_URL;

const MemberProfile: React.FC = () => {
  const { user, login, token, refreshUser } = useAuth();

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isResetPassOpen, setIsResetPassOpen] = useState(false);

  // File upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // --- MERGE: Keep Nickname State from 'development' ---
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState(user?.nickname || '');
  const [isUpdatingNickname, setIsUpdatingNickname] = useState(false);
  const [nicknameError, setNicknameError] = useState('');
  const [nicknameSuccess, setNicknameSuccess] = useState('');
  const [showNicknameConfirmModal, setShowNicknameConfirmModal] = useState(false);

  // Stats
  const totalPoints = user?.points || 0;
  const gamesPlayed = user?.game_participation?.length || 0;
  const badgeCount = user?.badges?.length || 0;

  // Calculate Trophies
  const trophyCount = useMemo(() => {
    if (!user?.trophies) return 0;
    if (Array.isArray(user.trophies)) return user.trophies.length;
    return Object.values(user.trophies).reduce((acc: number, group: any) => acc + group.length, 0);
  }, [user?.trophies]);

  // Helper: Format Date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Helper: Avatar Upload
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const response = await userService.updateAvatar(file);
      if (token && user) {
        // Update local state immediately
        login(token, { ...user, avatar_url: response.avatar_url });
        // Refresh from backend to ensure consistency across app
        await refreshUser();
      }
    } catch (error) {
      alert('Failed to update profile picture.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // --- MERGE: Subscription Logic (Used 'development' version as it is more robust) ---
  const isPremium = useMemo(() => {
    if (!user) return false;
    
    // Check membership_type (frontend standard)
    if (user.membership_type === 'premium' || user.membership_type === 'vip') return true;
    
    // Check membership_tier (backend field) - only specific premium tiers
    const premiumTiers = ['super_fan', 'superfan', 'premium', 'vip', 'gold', 'platinum'];
    if (user.membership_tier && premiumTiers.includes(user.membership_tier.toLowerCase())) return true;
    
    // Check roles array for premium/super_fan/vip role names (but NOT just 'member')
    if (user.roles && Array.isArray(user.roles)) {
      const premiumRoleNames = ['premium', 'vip', 'super_fan', 'superfan', 'super-fan', 'admin'];
      const hasPremiumRole = user.roles.some((role: any) => {
        const roleName = (role.name?.toLowerCase() || role.toLowerCase?.() || '').trim();
        return premiumRoleNames.includes(roleName);
      });
      if (hasPremiumRole) return true;
    }
    
    return false;
  }, [user]);

  // --- MERGE: Nickname Logic (From 'development') ---
  
  // Nickname update handler - Show confirmation modal
  const handleNicknameUpdate = () => {
    if (!nicknameInput.trim()) {
      setNicknameError('Nickname cannot be empty');
      return;
    }

    if (nicknameInput === user?.nickname) {
      setIsEditingNickname(false);
      return;
    }

    // Clear any previous errors and show confirmation modal
    setNicknameError('');
    setShowNicknameConfirmModal(true);
  };

  // Actual nickname update after confirmation
  const confirmNicknameUpdate = async () => {
    setIsUpdatingNickname(true);
    setNicknameSuccess('');
    setNicknameError('');

    try {
      const response = await userService.updateNickname(nicknameInput.trim());
      
      // Determine the change status before updating
      const coinsDeducted = response.coins_deducted || 0;
      const previousChanges = user?.nickname_changes || 0;
      
      // Refresh from backend to get the latest user data
      await refreshUser();

      // Set success message based on the change
      if (coinsDeducted > 0) {
        setNicknameSuccess(`Nickname updated! ${coinsDeducted} coins deducted.`);
      } else if (!isPremium && previousChanges === 0) {
        setNicknameSuccess('Nickname updated! (Free change used)');
      } else {
        setNicknameSuccess('Nickname updated successfully!');
      }

      setIsEditingNickname(false);
      setShowNicknameConfirmModal(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setNicknameSuccess(''), 3000);
    } catch (error: any) {
      console.error('Nickname update error:', error);
      const errorMsg = error.response?.data?.message || 'Failed to update nickname';
      setNicknameError(errorMsg);
      setShowNicknameConfirmModal(false);
    } finally {
      setIsUpdatingNickname(false);
    }
  };

  const handleCancelNicknameEdit = () => {
    setNicknameInput(user?.nickname || '');
    setIsEditingNickname(false);
    setNicknameError('');
    setNicknameSuccess('');
  };

  const calculateDaysLeft = () => {
    if (!user?.membership?.end_date) return 0;
    const end = new Date(user.membership.end_date).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((end - now) / (1000 * 3600 * 24));
    return diff > 0 ? diff : 0;
  };

  // Helper: Construct Badge Image URL (Backend fallback)
  const getBadgeImageUrl = (iconPath?: string) => {
    if (!iconPath) return null;
    if (iconPath.startsWith('http')) return iconPath;
    return `${STORAGE_BASE_URL}/${iconPath}`;
  };

  // --- MERGE: Badge Visuals Helper (From 'thilanka1') ---
  const getBadgeVisuals = (badgeName: string) => {
    const name = badgeName.toLowerCase().trim();

    if (name.includes('new member')) {
      return { icon: Sparkles, color: 'text-blue-400', bg: 'bg-blue-500/20' };
    }
    if (name.includes('verified')) {
      return { icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
    }
    if (name.includes('premium')) {
      return { icon: Crown, color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    }
    if (name.includes('event')) {
      return { icon: Ticket, color: 'text-pink-400', bg: 'bg-pink-500/20' };
    }
    if (name.includes('top performer')) {
      return { icon: Medal, color: 'text-orange-400', bg: 'bg-orange-500/20' };
    }
    if (name.includes('super fan')) {
      return { icon: Flame, color: 'text-red-500', bg: 'bg-red-500/20' };
    }
    if (name.includes('legend')) {
      return { icon: Zap, color: 'text-purple-400', bg: 'bg-purple-500/20' };
    }

    // Default Fallback
    return { icon: Star, color: 'text-gold', bg: 'bg-gold/20' };
  };

  return (
    <div className="space-y-6">
      {/* --- Main Profile Card --- */}
      <div className="relative bg-[#1E1E1E] rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-gold/20">
        {/* Cover Photo */}
        <div className="h-48 md:h-64 bg-gradient-to-b from-gray-800 to-[#1E1E1E] relative group">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
        </div>

        {/* Profile Info Area */}
        <div className="px-6 pb-8 pt-0 relative">
          {/* Header: Avatar + Name + Actions */}
          <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 mb-6">
            {/* Avatar Image */}
            <div className="relative group">
              <div className="w-32 h-32 md:w-44 md:h-44 rounded-full p-1 bg-[#1E1E1E]">
                <img
                  src={
                    user?.avatar_url ||
                    `https://ui-avatars.com/api/?name=${user?.name}&background=E6C65B&color=000&size=128`
                  }
                  alt="Profile"
                  className={`w-full h-full rounded-full object-cover border-4 border-gold shadow-lg bg-black ${
                    isUploadingAvatar ? 'opacity-50' : ''
                  }`}
                />
                {isUploadingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
                  </div>
                )}
              </div>

              {/* Edit Avatar Trigger */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png, image/jpeg, image/jpg"
              />
              <button
                onClick={handleAvatarClick}
                disabled={isUploadingAvatar}
                className="absolute bottom-2 right-2 bg-gold text-black p-2.5 rounded-full hover:bg-white hover:scale-110 transition shadow-lg border-2 border-[#1E1E1E]"
              >
                <Camera size={18} />
              </button>
            </div>

            {/* Name & Role */}
            <div className="mt-4 md:mt-0 md:ml-6 flex-1 w-full">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="w-full">
                  <h1 className="text-3xl md:text-4xl font-bold text-white font-zentry tracking-wide drop-shadow-md">
                    {user?.name}
                  </h1>
                  
                  {/* Nickname Section */}
                  <div className="mt-2 mb-2">
                    {!isEditingNickname ? (
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gold" />
                        <span className="text-gray-300 text-sm">
                          @{user?.nickname || 'No nickname set'}
                        </span>
                        <button
                          onClick={() => {
                            setIsEditingNickname(true);
                            setNicknameInput(user?.nickname || '');
                          }}
                          className={`text-gold hover:text-white transition ${
                            !isPremium && user?.nickname_changes !== 0 && (user?.coins || 0) < 2000 ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          title={
                            !isPremium && user?.nickname_changes !== 0 && (user?.coins || 0) < 2000
                              ? 'You need 2000 coins to change your nickname again.'
                              : 'Edit nickname'
                          }
                          disabled={!isPremium && user?.nickname_changes !== 0 && (user?.coins || 0) < 2000}
                        >
                          <Edit size={14} />
                        </button>
                        {!isPremium && (
                          <span className="text-xs text-gray-500">
                            ({user?.nickname_changes === 0 ? '1 free change' : '2000 coins per change'})
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10">
                          <User size={16} className="text-gold" />
                          <input
                            type="text"
                            value={nicknameInput}
                            onChange={(e) => setNicknameInput(e.target.value)}
                            className="bg-transparent text-white text-sm outline-none w-48"
                            placeholder="Enter nickname"
                            maxLength={30}
                            disabled={isUpdatingNickname}
                          />
                        </div>
                        <button
                          onClick={handleNicknameUpdate}
                          disabled={isUpdatingNickname}
                          className="p-1.5 bg-green-600 hover:bg-green-500 text-white rounded transition disabled:opacity-50"
                          title="Save"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={handleCancelNicknameEdit}
                          disabled={isUpdatingNickname}
                          className="p-1.5 bg-red-600 hover:bg-red-500 text-white rounded transition disabled:opacity-50"
                          title="Cancel"
                        >
                          <X size={16} />
                        </button>
                        {!isPremium && user?.nickname_changes !== 0 && (
                          <div className="flex items-center gap-1 text-xs text-yellow-500">
                            <Coins size={12} />
                            <span>2000</span>
                          </div>
                        )}
                      </div>
                    )}
                    {nicknameError && (
                      <p className="text-red-500 text-xs mt-1">{nicknameError}</p>
                    )}
                    {nicknameSuccess && (
                      <p className="text-green-500 text-xs mt-1">{nicknameSuccess}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    {/* Render Roles Safely */}
                    {user?.roles?.map((role, idx) => {
                      const roleName = typeof role === 'string' ? role : role.name;
                      return (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-sm font-bold capitalize"
                        >
                          <ShieldCheck size={14} />
                          {roleName}
                        </span>
                      );
                    })}

                    <span className="text-gray-400 text-sm flex items-center gap-1">
                      <MapPin size={14} /> Sri Lanka
                    </span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-2 md:mt-0">
                  <button
                    onClick={() => setIsEditProfileOpen(true)}
                    className="px-6 py-2.5 bg-white/5 hover:bg-gold hover:text-black border border-white/10 hover:border-gold text-white font-bold rounded-xl transition flex items-center gap-2"
                  >
                    <Edit size={16} /> Edit Profile
                  </button>
                  <button
                    onClick={() => setIsResetPassOpen(true)}
                    className="px-4 py-2.5 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-white border border-white/10 rounded-xl transition"
                    title="Change Password"
                  >
                    <Lock size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-white/10 mb-8" />

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Info & Subscription */}
            <div className="lg:col-span-1 space-y-6">
              {/* Info Box */}
              <div className="bg-black/40 p-5 rounded-xl border border-white/5">
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

              {/* SUBSCRIPTION WIDGET */}
              <div
                className={`p-5 rounded-xl border relative overflow-hidden ${
                  isPremium
                    ? 'bg-gradient-to-br from-purple-900/40 to-black border-purple-500/50'
                    : 'bg-black/40 border-white/10'
                }`}
              >
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <Crown size={64} className={isPremium ? 'text-purple-500' : 'text-gray-500'} />
                </div>

                <h3
                  className={`text-lg font-bold mb-1 ${
                    isPremium ? 'text-purple-400' : 'text-gray-400'
                  }`}
                >
                  Current Plan
                </h3>

                <p className="text-2xl font-bold text-white mb-1 capitalize">
                  {user?.membership_tier} Tier
                </p>

                {isPremium ? (
                  <>
                    <p className="text-sm text-green-400 mb-4 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      Active • {calculateDaysLeft()} days left
                    </p>
                    <button className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white transition rounded-lg font-bold text-sm">
                      Manage Subscription
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-gray-400 mb-4">
                      Upgrade to unlock exclusive contents.
                    </p>
                    <button className="w-full py-2.5 bg-transparent border border-gold text-gold hover:bg-gold hover:text-black transition rounded-lg font-bold text-sm uppercase tracking-wider">
                      Upgrade Now
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Right Column: Game Stats */}
            <div className="lg:col-span-2 space-y-6">
              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-center">
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                    Total Points
                  </p>
                  <p className="text-2xl font-bold text-gold">{totalPoints}</p>
                </div>
                <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-center">
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                    Games Played
                  </p>
                  <p className="text-2xl font-bold text-white">{gamesPlayed}</p>
                </div>
                <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-center">
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Trophies</p>
                  <p className="text-2xl font-bold text-white">{trophyCount}</p>
                </div>
              </div>

              {/* Achievements Section - UPDATED TO MAP ICONS FROM FRONTEND */}
              <div className="bg-black/40 rounded-xl border border-white/5 p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Trophy className="text-gold" size={20} /> Achievements
                </h3>

                {badgeCount === 0 && trophyCount === 0 ? (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    <p>No achievements yet. Play games to earn them!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Render Badges */}
                    {user?.badges?.map((badge) => {
                      const backendImageUrl = getBadgeImageUrl(badge.icon);
                      // Get visuals based on name (if image is missing/broken)
                      const {
                        icon: BadgeIcon,
                        color: iconColor,
                        bg: iconBg,
                      } = getBadgeVisuals(badge.name);

                      return (
                        <div
                          key={badge.id}
                          className="bg-white/5 p-3 rounded-lg flex flex-col items-center text-center group hover:bg-white/10 transition border border-transparent hover:border-white/10"
                        >
                          <div className="w-16 h-16 mb-2 flex items-center justify-center">
                            {/* Priority 1: Backend Image */}
                            {backendImageUrl ? (
                              <img
                                src={backendImageUrl}
                                alt={badge.name}
                                className="w-full h-full object-contain drop-shadow-lg"
                                onError={(e) => {
                                  // Hide image and show fallback div immediately
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                  e.currentTarget.nextElementSibling?.classList.add('flex');
                                }}
                              />
                            ) : null}

                            {/* Priority 2: Frontend Mapped Icon (Shown if no URL or Error) */}
                            <div
                              className={`${
                                backendImageUrl ? 'hidden' : 'flex'
                              } w-14 h-14 rounded-full items-center justify-center shadow-lg ${iconBg} ${iconColor} ring-1 ring-white/10`}
                            >
                              <BadgeIcon size={28} strokeWidth={2} />
                            </div>
                          </div>

                          <span className="text-white text-sm font-bold">{badge.name}</span>
                          <span className="text-gray-500 text-xs mt-1 font-mono">
                            {badge.points_required} PTS
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Game History List */}
              {user?.game_participation && user.game_participation.length > 0 ? (
                <div className="bg-black/40 rounded-xl border border-white/5 p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Gamepad2 className="text-purple-400" size={20} /> Recent Games
                  </h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {user.game_participation.map((game, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5 hover:border-purple-500/30 transition"
                      >
                        <div>
                          <p className="text-white font-bold">
                            {game.game?.name || 'Unknown Game'}
                          </p>
                          <p className="text-xs text-gray-400">Score: {game.score}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gold font-bold">+{game.coins} Coins</p>
                          <p className="text-xs text-green-400 uppercase">{game.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Empty State if no games */
                <div className="bg-black/40 rounded-xl border border-white/5 p-8 text-center flex flex-col items-center justify-center min-h-[200px]">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 text-gray-500">
                    <Trophy size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Game History</h3>
                  <p className="text-gray-400 max-w-sm mx-auto mb-6">
                    Start playing games to earn points, unlock badges, and climb the leaderboard!
                  </p>
                  <button className="px-6 py-2 bg-white/10 hover:bg-gold hover:text-black text-white rounded-lg transition font-medium border border-white/10 hover:border-gold">
                    Browse Games Library
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Render Modals */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        currentName={user?.name || ''}
      />

      <ResetPasswordModal isOpen={isResetPassOpen} onClose={() => setIsResetPassOpen(false)} />

      <NicknameConfirmModal
        isOpen={showNicknameConfirmModal}
        onClose={() => {
          setShowNicknameConfirmModal(false);
          setNicknameError('');
        }}
        onConfirm={confirmNicknameUpdate}
        nickname={nicknameInput}
        isPremium={isPremium}
        hasFreeChange={!user?.nickname_changes || user.nickname_changes === 0}
        currentCoins={user?.coins || 0}
        cost={2000}
        isLoading={isUpdatingNickname}
      />
    </div>
  );
};

export default MemberProfile;