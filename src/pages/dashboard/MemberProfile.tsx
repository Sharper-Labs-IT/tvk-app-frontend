import React, { useState, useRef, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import axiosClient from '../../api/axiosClient';
import { toast } from 'react-hot-toast';
import { Mail, Phone, Calendar } from 'lucide-react';

import EditProfileModal from '../../components/dashboard/EditProfileModal';
import ResetPasswordModal from '../../components/dashboard/ResetPasswordModal';
import NicknameConfirmModal from '../../components/dashboard/NicknameConfirmModal';
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

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
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
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

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
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      const response = await userService.updateAvatar(file);
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
    setIsUpdatingNickname(true);
    setNicknameSuccess('');
    setNicknameError('');
    try {
      const response = await userService.updateNickname(nicknameInput.trim());
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

  const handleUpgradeClick = () => setIsPaymentModalOpen(true);
  const handleCancelClick = () => setIsCancelModalOpen(true);

  const confirmCancelMembership = async () => {
    try {
      await axiosClient.post('/membership/cancel');
      await refreshUser();
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error(error);
      toast.error('Failed to cancel membership. Please try again.');
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
        onEditProfile={() => setIsEditProfileOpen(true)}
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
      />

      <MembershipCancelledSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
      />
    </div>
  );
};

export default MemberProfile;
