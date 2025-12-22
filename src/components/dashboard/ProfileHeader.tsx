import React from 'react';
import { Camera, User, Edit, Check, X, ShieldCheck, MapPin, Lock } from 'lucide-react';
import { getCountryFromMobile } from '../../utils/countryHelper';

interface ProfileHeaderProps {
  user: any;
  isPremium: boolean;
  isUploadingAvatar: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
  onEditProfile: () => void;
  onResetPassword: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  isPremium,
  isUploadingAvatar,
  fileInputRef,
  handleFileChange,
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
  onEditProfile,
  onResetPassword,
}) => {
  const countryName = getCountryFromMobile(user?.mobile);

  return (
    // FIX 1: Lighter Background (Slate-900) & Visible Border for contrast against black dashboard
    <div className="relative bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700/50">
      {/* Cover Photo - Added gradient overlay for text readability */}
      <div className="h-48 md:h-64 bg-gradient-to-b from-slate-800 to-slate-900 relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
      </div>

      <div className="px-6 pb-8 pt-0 relative">
        <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 mb-6">
          {/* Avatar Section */}
          <div className="relative group shrink-0">
            <div className="w-32 h-32 md:w-44 md:h-44 rounded-full p-1.5 bg-slate-900 ring-4 ring-slate-800">
              <img
                src={
                  user?.avatar_url ||
                  `https://ui-avatars.com/api/?name=${
                    user?.name || 'User'
                  }&background=E6C65B&color=000&size=128`
                }
                alt="Profile"
                className={`w-full h-full rounded-full object-cover border-4 border-yellow-500/80 shadow-2xl bg-black ${
                  isUploadingAvatar ? 'opacity-50' : ''
                }`}
              />
              {isUploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
            <button
              onClick={handleAvatarClick}
              disabled={isUploadingAvatar}
              className="absolute bottom-2 right-2 bg-yellow-500 text-black p-2.5 rounded-full hover:bg-white hover:scale-110 transition shadow-lg border-2 border-slate-900"
            >
              <Camera size={18} />
            </button>
          </div>

          <div className="mt-4 md:mt-0 md:ml-6 flex-1 w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="w-full">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl md:text-4xl font-bold text-white tracking-wide drop-shadow-md">
                    {user?.name}
                  </h1>

                  {/* FIX 2: One Single Badge for Status */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-lg border ${
                      isPremium
                        ? 'bg-purple-600 text-white border-purple-400 shadow-purple-500/30'
                        : 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50'
                    }`}
                  >
                    {isPremium ? 'Premium' : 'Member'}
                  </span>
                </div>

                <div className="mt-2 mb-2">
                  {!isEditingNickname ? (
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-yellow-500" />
                      <span className="text-slate-300 text-sm">
                        @{user?.nickname || 'No nickname set'}
                      </span>
                      <button
                        onClick={() => {
                          setIsEditingNickname(true);
                          setNicknameInput(user?.nickname || '');
                        }}
                        className="text-yellow-500 hover:text-white transition opacity-60 hover:opacity-100"
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

                {/* Roles List */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {user?.roles
                    // FIX 3: Filter out "Member" so it doesn't show twice
                    ?.filter((r: any) => {
                      const rName = typeof r === 'string' ? r : r.name;
                      return rName.toLowerCase() !== 'member';
                    })
                    .map((role: any, idx: number) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-600 text-slate-300 text-xs font-bold capitalize"
                      >
                        <ShieldCheck size={12} className="text-blue-400" />{' '}
                        {typeof role === 'string' ? role : role.name}
                      </span>
                    ))}

                  {/* Country Display */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-600 text-slate-300 text-xs font-bold">
                    <MapPin size={12} className="text-red-400" /> {countryName}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4 md:mt-0 shrink-0">
                <button
                  onClick={onEditProfile}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 font-semibold rounded-xl transition flex items-center gap-2 shadow-lg"
                >
                  <Edit size={16} /> <span className="hidden md:inline">Edit Profile</span>
                </button>
                <button
                  onClick={onResetPassword}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-red-900/30 text-slate-400 hover:text-red-400 border border-slate-600 rounded-xl transition shadow-lg"
                  title="Reset Password"
                >
                  <Lock size={18} />
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
