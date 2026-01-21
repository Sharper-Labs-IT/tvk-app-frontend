import React from 'react';
import { Camera, User, Edit, Check, X, MapPin, HelpCircle } from 'lucide-react';
import { getCountryFromMobile } from '../../utils/countryHelper';

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
    <div className="relative bg-[#1E1E1E] rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-yellow-500/20">
      <div className="h-48 md:h-64 bg-gradient-to-b from-gray-800 to-[#1E1E1E] relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
      </div>

      <div className="px-6 pb-8 pt-0 relative">
        <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 mb-6">
          <div className="relative group">
            <div className="w-32 h-32 md:w-44 md:h-44 rounded-full p-1 bg-[#1E1E1E]">
              <img
                src={
                  user?.avatar_url ||
                  `https://ui-avatars.com/api/?name=${
                    user?.name || 'User'
                  }&background=E6C65B&color=000&size=128`
                }
                alt="Profile"
                className="w-full h-full rounded-full object-cover border-4 border-yellow-500 shadow-lg bg-black"
              />
            </div>
            <button
              onClick={handleAvatarClick}
              className="absolute bottom-2 right-2 bg-yellow-500 text-black p-2.5 rounded-full hover:bg-white hover:scale-110 transition shadow-lg border-2 border-[#1E1E1E]"
            >
              <Camera size={18} />
            </button>
          </div>

          <div className="mt-4 md:mt-0 md:ml-6 flex-1 w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="w-full">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl md:text-4xl font-bold text-white tracking-wide drop-shadow-md">
                    {user?.name}
                  </h1>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                      isPremium
                        ? 'bg-purple-500/20 text-purple-400 border-purple-500/50'
                        : 'bg-gray-700/50 text-gray-400 border-gray-600'
                    }`}
                  >
                    {isPremium ? 'Premium' : 'Member'}
                  </span>
                </div>

                <div className="mt-2 mb-2">
                  {!isEditingNickname ? (
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-yellow-500" />
                      <span className="text-gray-300 text-sm">
                        @{user?.nickname || 'No nickname set'}
                      </span>
                      <button
                        id="tour-edit-nickname-btn"
                        onClick={() => {
                          setIsEditingNickname(true);
                          setNicknameInput(user?.nickname || '');
                        }}
                        className="text-yellow-500 hover:text-white transition"
                      >
                        <Edit size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="text"
                        value={nicknameInput}
                        onChange={(e) => setNicknameInput(e.target.value)}
                        className="bg-black/40 text-white text-sm px-2 py-1 rounded border border-white/10 outline-none w-48"
                        placeholder="Enter nickname"
                        maxLength={30}
                        disabled={isUpdatingNickname}
                      />
                      <button
                        onClick={handleNicknameUpdate}
                        className="p-1 bg-green-600 rounded text-white"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={handleCancelNicknameEdit}
                        className="p-1 bg-red-600 rounded text-white"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                  {nicknameError && <p className="text-red-500 text-xs mt-1">{nicknameError}</p>}
                  {nicknameSuccess && (
                    <p className="text-green-500 text-xs mt-1">{nicknameSuccess}</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <span className="text-gray-400 text-sm flex items-center gap-1">
                    <MapPin size={14} /> {countryName}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0 w-full sm:w-auto">
                <button
                  onClick={() => {
                    localStorage.removeItem('dashboard_tour_v1');
                    window.dispatchEvent(new Event('start-tour'));
                  }}
                  className="px-4 py-2.5 bg-yellow-500/10 hover:bg-yellow-500 text-yellow-500 hover:text-black border border-yellow-500 rounded-xl transition flex items-center justify-center gap-2 whitespace-nowrap"
                  title="Start Tour"
                >
                  <HelpCircle size={18} />
                  <span>Tour</span>
                </button>
                <button
                  onClick={onResetPassword}
                  className="px-6 py-2.5 bg-white/5 hover:bg-yellow-500 hover:text-black border border-white/10 hover:border-yellow-500 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 whitespace-nowrap"
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
