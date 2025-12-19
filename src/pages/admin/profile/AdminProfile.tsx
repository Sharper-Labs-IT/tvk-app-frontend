import React, { useState, useRef } from 'react';
import { Mail, Shield, Camera, Save, Edit2, Lock, Send, X, Key } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import {
  updateProfile,
  uploadAvatar,
  requestPasswordReset,
  confirmPasswordReset,
} from '../../../utils/api';
import MessageModal from '../../../components/common/MessageModal';
import ConfirmationModal from '../../../components/common/ConfirmationModal'; // ✅ Importing your Confirmation Modal

const AdminProfile: React.FC = () => {
  const { user, updateUser } = useAuth();

  // --- Local State ---
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Modals State
  const [showResetForm, setShowResetForm] = useState(false); // The form to enter code
  const [showConfirmModal, setShowConfirmModal] = useState(false); // ✅ Controls the Confirmation Modal

  // Message Modal State
  const [msgModal, setMsgModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success' as 'success' | 'error',
    autoClose: true,
  });

  // Form Data
  const userData = user as any;
  const [name, setName] = useState(userData?.name || '');
  const [mobile, setMobile] = useState(userData?.mobile || '');
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return <div className="text-white p-6">Loading profile...</div>;

  const currentAvatar =
    previewAvatar ||
    userData.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      userData.name
    )}&background=E6C65B&color=000&size=256`;

  // --- Helpers ---

  const showMessage = (
    title: string,
    message: string,
    type: 'success' | 'error' = 'success',
    autoClose = true
  ) => {
    setMsgModal({ isOpen: true, title, message, type, autoClose });
  };

  const closeMessage = () => {
    setMsgModal((prev) => ({ ...prev, isOpen: false }));
    // If we just successfully sent the code, open the form
    if (msgModal.title === 'Code Sent' && msgModal.type === 'success') {
      setShowResetForm(true);
    }
  };

  // --- Handlers ---

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPreviewAvatar(URL.createObjectURL(file));

      try {
        setIsLoading(true);
        const res = await uploadAvatar(file);
        updateUser({ avatar_url: res.avatar_url } as any);
        showMessage('Success', 'Profile picture updated successfully!', 'success');
      } catch (error) {
        setPreviewAvatar(null);
        showMessage('Error', 'Failed to upload image.', 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setIsLoading(true);
      await updateProfile({ name, mobile });
      updateUser({ name, mobile } as any);
      setIsEditing(false);
      showMessage('Success', 'Profile details updated successfully!', 'success');
    } catch (error) {
      showMessage('Error', 'Failed to update profile.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Opens the Confirmation Modal instead of window.confirm
  const handleInitiatePasswordReset = () => {
    setShowConfirmModal(true);
  };

  // 2. The actual API call (Executed when user clicks "Confirm" in the modal)
  const performPasswordResetCall = async () => {
    try {
      setResetLoading(true); // Shows loading on the modal button

      // Send the email
      await requestPasswordReset(userData.email);

      // Close confirm modal & Show Success Message
      setShowConfirmModal(false);
      showMessage('Code Sent', 'Please check your email for the verification code.', 'success');
    } catch (error) {
      setShowConfirmModal(false);
      showMessage('Error', 'Failed to send reset email. Please try again.', 'error');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <h1 className="text-3xl font-bold text-white font-serif mb-6">My Profile</h1>

      <div className="bg-tvk-dark-card border border-white/10 rounded-xl overflow-hidden relative">
        <div className="h-32 bg-gradient-to-r from-tvk-accent-gold-dark to-black/50 relative">
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        <div className="px-8 pb-8">
          <div className="relative -mt-16 mb-6 flex flex-col md:flex-row justify-between items-end gap-4">
            <div className="relative group">
              <img
                src={currentAvatar}
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-tvk-dark-card shadow-xl object-cover bg-neutral-800"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-tvk-dark-card rounded-full border border-white/10 text-gold hover:text-white transition-all cursor-pointer shadow-lg"
              >
                <Camera size={18} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            <div className="flex gap-3 mb-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
                >
                  <Edit2 size={16} /> Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 rounded-lg text-sm font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateProfile}
                    disabled={isLoading}
                    className="px-4 py-2 bg-gold text-black hover:bg-yellow-500 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-gold/20"
                  >
                    <Save size={16} /> {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider font-bold block mb-1">
                  Display Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-gold focus:outline-none"
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-white">{name}</h2>
                )}
                <p className="text-gold text-sm mt-1">{userData.roles?.[0] || 'Admin'}</p>
              </div>
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="p-2 bg-white/5 rounded-lg text-gold">
                    <Mail size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Email Address</p>
                    <p className="text-sm">{userData.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="p-2 bg-white/5 rounded-lg text-gold">
                    <Shield size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Mobile Number</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-sm text-white focus:border-gold focus:outline-none"
                      />
                    ) : (
                      <p className="text-sm">{mobile || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-black/20 rounded-xl p-6 border border-white/5">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Lock size={18} className="text-gold" />
                Security Settings
              </h3>
              <div className="space-y-4">
                <div className="flex flex-col gap-2 py-2 border-b border-white/5">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Password</span>
                    <span className="text-xs text-gray-500">Last changed: Unknown</span>
                  </div>

                  {/* Single Button to Start Process */}
                  <button
                    onClick={handleInitiatePasswordReset}
                    className="mt-2 w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-sm text-gray-300 flex items-center justify-center gap-2 transition-all group"
                  >
                    <Send size={14} className="group-hover:text-gold transition-colors" />
                    Change Password
                  </button>
                  <p className="text-[10px] text-gray-500 text-center">
                    Sends a verification code to your email.
                  </p>

                  <button
                    onClick={() => setShowResetForm(true)}
                    className="text-[10px] text-gray-600 hover:text-gold underline mt-1"
                  >
                    I already have a code
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- 1. Message Modal (Success/Error Feedback) --- */}
      <MessageModal
        isOpen={msgModal.isOpen}
        title={msgModal.title}
        message={msgModal.message}
        type={msgModal.type}
        onClose={closeMessage}
        autoCloseDelay={msgModal.autoClose ? 2000 : null}
      />

      {/* --- 2. Confirmation Modal (Replaces Browser Popup) --- */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        title="Change Password"
        message={`This will send a verification code to ${userData.email}. Do you want to continue?`}
        confirmText="Yes, Send Code"
        cancelText="Cancel"
        onConfirm={performPasswordResetCall}
        onCancel={() => setShowConfirmModal(false)}
        isConfirming={resetLoading}
      />

      {/* --- 3. Reset Password Form Modal --- */}
      {showResetForm && (
        <ResetPasswordModal
          email={userData.email}
          onClose={() => setShowResetForm(false)}
          onSuccess={() => {
            setShowResetForm(false);
            showMessage(
              'Success',
              'Password changed successfully! You may need to login again.',
              'success',
              true
            );
          }}
        />
      )}
    </div>
  );
};

// --- Sub-Component: Reset Password Form Modal ---
const ResetPasswordModal = ({
  email,
  onClose,
  onSuccess,
}: {
  email: string;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [formData, setFormData] = useState({
    token: '',
    password: '',
    password_confirmation: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.password_confirmation) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await confirmPasswordReset({
        email: email,
        token: formData.token,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid Token or Password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#121212] border border-white/10 rounded-xl w-full max-w-md p-6 relative shadow-2xl animate-in fade-in zoom-in duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={20} />
        </button>

        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <Key className="text-gold" size={20} />
          Set New Password
        </h3>
        <p className="text-xs text-gray-400 mb-6">
          Enter the verification code sent to <span className="text-gold">{email}</span>
        </p>

        {error && (
          <div className="mb-4 p-2 bg-red-900/20 border border-red-500/50 rounded text-red-200 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1 font-bold">Verification Code</label>
            <input
              type="text"
              className="w-full bg-black/50 border border-white/10 rounded p-2 text-white focus:border-gold focus:outline-none placeholder-gray-600"
              value={formData.token}
              onChange={(e) => setFormData({ ...formData, token: e.target.value })}
              placeholder="Paste code here"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1 font-bold">New Password</label>
            <input
              type="password"
              className="w-full bg-black/50 border border-white/10 rounded p-2 text-white focus:border-gold focus:outline-none"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1 font-bold">
              Confirm New Password
            </label>
            <input
              type="password"
              className="w-full bg-black/50 border border-white/10 rounded p-2 text-white focus:border-gold focus:outline-none"
              value={formData.password_confirmation}
              onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold text-black font-bold py-2 rounded mt-4 hover:bg-yellow-500 transition-colors flex justify-center gap-2"
          >
            {loading ? 'Updating...' : 'Set Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminProfile;
