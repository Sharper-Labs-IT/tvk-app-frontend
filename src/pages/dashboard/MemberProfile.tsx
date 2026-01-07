import React, { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import axiosClient from '../../api/axiosClient';
import { toast } from 'react-hot-toast';
import { Mail, Phone, Calendar, AlertTriangle, Trash2 } from 'lucide-react';


import ResetPasswordModal from '../../components/dashboard/ResetPasswordModal';
import NicknameConfirmModal from '../../components/dashboard/NicknameConfirmModal';
import DeleteAccountModal from '../../components/dashboard/DeleteAccountModal';
import ProfileHeader from '../../components/dashboard/ProfileHeader';
import GameStats from '../../components/dashboard/GameStats';
import SubscriptionWidget from '../../components/dashboard/SubscriptionWidget';

import MembershipPaymentModal from '../../components/MembershipPaymentModal';
import MembershipCancelModal from '../../components/MembershipCancelModal';
import MembershipCancelledSuccessModal from '../../components/MembershipCancelSuccessfulModal';

import type { Plan } from '../../types/plan';

// --- SYSTEM NICKNAME TITLES ---
const SYSTEM_TITLE_PREFIXES = ['mr', 'mrs', 'ms', 'miss', 'mx', 'dr', 'prof', 'rev', 'sir', 'dame'];

const MemberProfile: React.FC = () => {
  const { user, login, token, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [isResetPassOpen, setIsResetPassOpen] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState(user?.nickname || '');
  const [isUpdatingNickname, setIsUpdatingNickname] = useState(false);
  const [nicknameError, setNicknameError] = useState('');
  const [nicknameSuccess, setNicknameSuccess] = useState('');
  const [showNicknameConfirmModal, setShowNicknameConfirmModal] = useState(false);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false); // State for cancel loading
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // --- DELETE ACCOUNT STATE ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Robust Date Formatter ---
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recent';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Recent';

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // --- PREMIUM LOGIC ---
  const isPremium = useMemo(() => {
    if (!user) return false;
    if (user.membership?.plan_id && Number(user.membership.plan_id) > 1) return true;
    const premiumTiers = ['super_fan', 'superfan', 'premium', 'vip'];
    if (
      user.membership_tier &&
      premiumTiers.includes(user.membership_tier.toLowerCase().replace(/\s+/g, '_'))
    )
      return true;
    return false;
  }, [user]);

  // --- NEW: SYSTEM PATTERN CHECK (FREE CHANGE LOGIC) ---
  const hasFreeChange = useMemo(() => {
    if (!user?.nickname) return true;

    const lowerNick = user.nickname.toLowerCase();

    // Check if the current nickname starts with a title followed by a dash (system pattern)
    // This allows one free change if they currently have a system-generated name.
    const isSystemPattern = SYSTEM_TITLE_PREFIXES.some((title) =>
      lowerNick.startsWith(`${title}-`)
    );

    return isSystemPattern;
  }, [user?.nickname]);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // 🛡️ Security: Client-side Rate Limiting (60s cooldown)
    const lastUpload = localStorage.getItem('last_avatar_update');
    if (lastUpload) {
      const remaining = 60000 - (Date.now() - Number(lastUpload));
      if (remaining > 0) {
        toast.error(`Please wait ${Math.ceil(remaining / 1000)}s before uploading again.`);
        return;
      }
    }

    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      const response = await userService.updateAvatar(file);
      
      localStorage.setItem('last_avatar_update', Date.now().toString()); // Set cooldown

      if (token && user) {
        login(token, { ...user, avatar_url: response.avatar_url });
        await refreshUser();
      }
      toast.success('Profile picture updated!');
    } catch (error) {
      toast.error('Failed to update profile picture.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleNicknameUpdate = () => {
    if (!nicknameInput.trim()) {
      setNicknameError('Nickname cannot be empty');
      return;
    }
    if (nicknameInput === user?.nickname) {
      setIsEditingNickname(false);
      return;
    }
    setNicknameError('');
    setShowNicknameConfirmModal(true);
  };

  const confirmNicknameUpdate = async () => {
    // 🛡️ Security: Client-side Rate Limiting (60s cooldown)
    const lastUpdate = localStorage.getItem('last_nickname_update');
    if (lastUpdate) {
      const remaining = 60000 - (Date.now() - Number(lastUpdate));
      if (remaining > 0) {
        setNicknameError(`Change limit: Please wait ${Math.ceil(remaining / 1000)}s.`);
        setShowNicknameConfirmModal(false);
        return;
      }
    }

    setIsUpdatingNickname(true);
    setNicknameSuccess('');
    setNicknameError('');
    try {
      const response = await userService.updateNickname(nicknameInput.trim());
      
      // Set cooldown on success
      localStorage.setItem('last_nickname_update', Date.now().toString());

      await refreshUser();

      const coins = response.coins_deducted || 0;
      setNicknameSuccess(
        coins > 0 ? `Updated! ${coins} coins deducted.` : 'Nickname updated successfully!'
      );

      setIsEditingNickname(false);
      setShowNicknameConfirmModal(false);
      toast.success('Nickname updated!');
      setTimeout(() => setNicknameSuccess(''), 3000);
    } catch (error: any) {
      const serverMessage = error.response?.data?.message || '';

      // FIX: Replace generic backend message with specific "already taken" text
      if (
        serverMessage === 'Failed to update nickname' ||
        serverMessage.toLowerCase().includes('taken') ||
        serverMessage.toLowerCase().includes('exists')
      ) {
        setNicknameError('nickname already taken, choose another one');
      } else {
        setNicknameError(serverMessage || 'nickname already taken, choose another one');
      }
    } finally {
      setIsUpdatingNickname(false);
    }
  };

  const SUPER_FAN_PLAN: Plan = {
    id: 2,
    name: 'Super Fan',
    price: '9.99',
    description: 'Ultimate Experience',
    status: 1,
    duration_days: 30,
    benefits: ['All Access'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const handleUpgradeClick = () => navigate('/membership');
  const handleCancelClick = () => setIsCancelModalOpen(true);

  // Updated to accept password
  const confirmCancelMembership = async (password: string) => {
    setIsCancelling(true);
    try {
      await axiosClient.post('/membership/cancel', { password });
      await refreshUser();
      setIsSuccessModalOpen(true);
      setIsCancelModalOpen(false);
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || 'Failed to cancel membership.';
      toast.error(msg);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDeleteAccountConfirm = async (password: string) => {
    setIsDeleting(true);
    setDeleteError('');
    try {
      await userService.deleteAccount(password);
      // Force logout
      localStorage.clear();
      window.location.href = '/login';
    } catch (error: any) {
      setDeleteError(error.response?.data?.message || 'Failed to delete account. Wrong password?');
      setIsDeleting(false);
    }
  };

  const handlePaymentSuccess = async () => {
    toast.success('Welcome to the Super Fan Club!');
    await refreshUser();
    setIsPaymentModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <ProfileHeader
        user={user}
        isPremium={isPremium}
        isUploadingAvatar={isUploadingAvatar}
        fileInputRef={fileInputRef}
        handleFileChange={handleFileChange}
        handleAvatarClick={handleAvatarClick}
        isEditingNickname={isEditingNickname}
        nicknameInput={nicknameInput}
        setNicknameInput={setNicknameInput}
        isUpdatingNickname={isUpdatingNickname}
        handleNicknameUpdate={handleNicknameUpdate}
        handleCancelNicknameEdit={() => {
          setIsEditingNickname(false);
          setNicknameInput(user?.nickname || '');
        }}
        setIsEditingNickname={setIsEditingNickname}
        nicknameError={nicknameError}
        nicknameSuccess={nicknameSuccess}
        onResetPassword={() => setIsResetPassOpen(true)}
      />

      <hr className="border-slate-800 mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700/50 shadow-lg">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              Contact Info
            </h3>
            <ul className="space-y-4 text-slate-300 text-sm">
              <li className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
                <Mail size={18} className="text-yellow-500 shrink-0" />
                <span className="truncate" title={user?.email}>
                  {user?.email}
                </span>
              </li>
              <li className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
                <Phone size={18} className="text-yellow-500 shrink-0" />
                <span>{user?.mobile || 'No mobile added'}</span>
              </li>
              <li className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
                <Calendar size={18} className="text-yellow-500 shrink-0" />
                <span>Joined {formatDate(user?.created_at)}</span>
              </li>
            </ul>
          </div>

          <SubscriptionWidget
            user={user}
            isPremium={isPremium}
            onUpgradeClick={handleUpgradeClick}
            onCancelClick={handleCancelClick}
          />
        </div>

        <GameStats user={user} />
      </div>
      {/* --- DANGER ZONE (GDPR Compliance) --- */}
      <div className="mt-12 bg-red-950/20 border border-red-900/40 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
           <div>
             <h3 className="text-xl font-bold text-red-500 flex items-center gap-2 mb-2">
               <AlertTriangle size={24} /> Danger Zone
             </h3>
             <p className="text-sm text-gray-400 max-w-xl">
               Permanently delete your account and all associated data. This action cannot be undone.
               You will lose all coins, badges, and game history immediately.
             </p>
           </div>
           
           <button 
             onClick={() => setIsDeleteModalOpen(true)}
             className="px-6 py-3 bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/50 text-red-500 rounded-xl font-bold transition flex items-center gap-2"
           >
             <Trash2 size={18} /> Delete Account
           </button>
        </div>
      </div>

      {/* --- MODALS --- */}
      {/* <EditProfileModal
      <EditProfileModal
 development
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        currentName={user?.name || ''}
      /> */}
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
        hasFreeChange={hasFreeChange}
        currentCoins={user?.coins || 0}
        cost={2000}
        isLoading={isUpdatingNickname}
        error={nicknameError}
      />

      <MembershipPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        plan={SUPER_FAN_PLAN}
        onSuccess={handlePaymentSuccess}
        currency={'GBP'}
      />

      <MembershipCancelModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={confirmCancelMembership}
        isLoading={isCancelling}
      />

      <DeleteAccountModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAccountConfirm}
        isLoading={isDeleting}
        error={deleteError}
      />

      <MembershipCancelledSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
      />
    </div>
  );
};

export default MemberProfile;
