import React from 'react';
import { Camera, User, Edit, Check, X, MapPin, HelpCircle } from 'lucide-react';
import { getCountryFromMobile } from '../../utils/countryHelper';
import { getStoryImageUrl } from '../../utils/storyUtils';

interface ProfileHeaderProps {
  user: any;
  isPremium: boolean;
  handleAvatarClick: () => void;

  isEditingNickname: boolean;
  nicknameInput: string;
  setNicknameInput: (val: string) => void;
  isUpdatingNickname: boolean;
  handleNicknameUpdate: () => void;
  handleCancelNicknameEdit: () => void;
  setIsEditingNickname: (val: boolean) => void;
  nicknameError: string;
  nicknameSuccess: string;
  onResetPassword: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  isPremium,
  handleAvatarClick,
  isEditingNickname,
  nicknameInput,
  setNicknameInput,
  isUpdatingNickname,
  handleNicknameUpdate,
  handleCancelNicknameEdit,
  setIsEditingNickname,
  nicknameError,
  nicknameSuccess,
  onResetPassword,
}) => {
  const countryName = getCountryFromMobile(user?.mobile);

  return (
    <div className="relative bg-[#1E1E1E] rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-yellow-500/20">
      {/* Background Banner */}
      <div className="h-32 sm:h-40 md:h-48 lg:h-64 bg-gradient-to-b from-gray-800 to-[#1E1E1E] relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
      </div>

      {/* Profile Content */}
      <div className="px-3 sm:px-4 md:px-6 pb-4 sm:pb-6 md:pb-8 pt-0 relative">
        <div className="flex flex-col lg:flex-row items-start lg:items-end -mt-12 sm:-mt-14 md:-mt-16 mb-4 sm:mb-6">
          {/* Avatar */}
          <div className="relative group mx-auto lg:mx-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 rounded-full p-1 bg-[#1E1E1E]">
              <img
                src={
                  getStoryImageUrl(user?.avatar_url) ||
                  `https://ui-avatars.com/api/?name=${
                    user?.name || 'User'
                  }&background=E6C65B&color=000&size=256`
                }
                alt="Profile"
                className="w-full h-full rounded-full object-cover border-2 sm:border-3 md:border-4 border-yellow-500 shadow-lg bg-black"
              />
            </div>
            <button
              onClick={handleAvatarClick}
              className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-yellow-500 text-black p-1.5 sm:p-2 md:p-2.5 rounded-full hover:bg-white hover:scale-110 transition shadow-lg border-2 border-[#1E1E1E] active:scale-95 touch-manipulation"
              aria-label="Change Avatar"
            >
              <Camera size={14} className="sm:hidden" />
              <Camera size={16} className="hidden sm:block md:hidden" />
              <Camera size={18} className="hidden md:block" />
            </button>
          </div>

          {/* Profile Info */}
          <div className="mt-4 lg:mt-0 lg:ml-6 flex-1 w-full">
            <div className="flex flex-col gap-4">
              {/* Name & Badge */}
              <div className="w-full text-center lg:text-left">
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2 sm:gap-3">
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-wide drop-shadow-md break-words max-w-full">
                    {user?.name}
                  </h1>
                  <span
                    className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider border ${
                      isPremium
                        ? 'bg-purple-500/20 text-purple-400 border-purple-500/50'
                        : 'bg-gray-700/50 text-gray-400 border-gray-600'
                    }`}
                  >
                    {isPremium ? 'Premium' : 'Member'}
                  </span>
                </div>

                {/* Nickname Section */}
                <div className="mt-2 mb-2 flex justify-center lg:justify-start">
                  {!isEditingNickname ? (
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-yellow-500 sm:w-4 sm:h-4" />
                      <span className="text-gray-300 text-xs sm:text-sm break-all">
                        @{user?.nickname || 'No nickname set'}
                      </span>
                      <button
                        id="tour-edit-nickname-btn"
                        onClick={() => {
                          setIsEditingNickname(true);
                          setNicknameInput(user?.nickname || '');
                        }}
                        className="text-yellow-500 hover:text-white transition touch-manipulation active:scale-95"
                        aria-label="Edit Nickname"
                      >
                        <Edit size={12} className="sm:w-3.5 sm:h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-2 flex-wrap justify-center lg:justify-start">
                      <input
                        type="text"
                        value={nicknameInput}
                        onChange={(e) => setNicknameInput(e.target.value)}
                        className="bg-black/40 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded border border-white/10 outline-none w-36 sm:w-48 focus:border-yellow-500/50 transition"
                        placeholder="Enter nickname"
                        maxLength={30}
                        disabled={isUpdatingNickname}
                      />
                      <button
                        onClick={handleNicknameUpdate}
                        className="p-1 sm:p-1.5 bg-green-600 hover:bg-green-500 rounded text-white active:scale-95 touch-manipulation transition"
                        aria-label="Save Nickname"
                      >
                        <Check size={12} className="sm:w-3.5 sm:h-3.5" />
                      </button>
                      <button
                        onClick={handleCancelNicknameEdit}
                        className="p-1 sm:p-1.5 bg-red-600 hover:bg-red-500 rounded text-white active:scale-95 touch-manipulation transition"
                        aria-label="Cancel Edit"
                      >
                        <X size={12} className="sm:w-3.5 sm:h-3.5" />
                      </button>
                    </div>
                  )}
                  {nicknameError && <p className="text-red-500 text-[10px] sm:text-xs mt-1 text-center lg:text-left">{nicknameError}</p>}
                  {nicknameSuccess && (
                    <p className="text-green-500 text-[10px] sm:text-xs mt-1 text-center lg:text-left">{nicknameSuccess}</p>
                  )}
                </div>

                {/* Location */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-2">
                  <span className="text-gray-400 text-xs sm:text-sm flex items-center gap-1">
                    <MapPin size={12} className="sm:w-3.5 sm:h-3.5" /> {countryName}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full lg:w-auto lg:ml-auto">
                <button
                  onClick={() => {
                    localStorage.removeItem('dashboard_tour_v1');
                    window.dispatchEvent(new Event('start-tour'));
                  }}
                  className="px-3 sm:px-4 py-2 sm:py-2.5 bg-yellow-500/10 hover:bg-yellow-500 text-yellow-500 hover:text-black border border-yellow-500 rounded-lg sm:rounded-xl transition flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap text-sm sm:text-base active:scale-95 touch-manipulation font-medium"
                  title="Start Tour"
                >
                  <HelpCircle size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
                  <span>Tour</span>
                </button>
                <button
                  onClick={onResetPassword}
                  className="px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 bg-white/5 hover:bg-yellow-500 hover:text-black border border-white/10 hover:border-yellow-500 text-white font-bold rounded-lg sm:rounded-xl transition flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap text-sm sm:text-base active:scale-95 touch-manipulation"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
