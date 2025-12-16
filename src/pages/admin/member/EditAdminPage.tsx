import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import type { User } from '../../../types/user';
import { adminMemberService } from '../../../services/adminMemberService';
import { ArrowLeft, Shield, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const EditAdminPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // We expect user data passed via state to avoid refetching.
  // In a real app, you might want to fetch by ID if state is missing.
  const user = location.state?.user as User;

  const [loading, setLoading] = useState(false);
  const [currentRoles, setCurrentRoles] = useState<string[]>(user?.roles.map((r) => r.name) || []);

  if (!user) {
    return <div className="p-8 text-white">Error: User not found. Please go back to list.</div>;
  }

  const handleRoleChange = async (roleName: string, action: 'add' | 'remove') => {
    setLoading(true);
    try {
      if (action === 'add') {
        await adminMemberService.assignRole(user.id, roleName);
        setCurrentRoles([...currentRoles, roleName]);
        toast.success(`Role ${roleName} assigned`);
      } else {
        await adminMemberService.removeRole(user.id, roleName);
        setCurrentRoles(currentRoles.filter((r) => r !== roleName));
        toast.success(`Role ${roleName} removed`);
      }
    } catch (error: any) {
      toast.error('Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  const handleBanActivate = async () => {
    if (!confirm(`Are you sure you want to change status for ${user.name}?`)) return;
    setLoading(true);
    try {
      if (user.status === 'active') {
        await adminMemberService.banUser(user.id);
        toast.success('User banned');
      } else {
        await adminMemberService.activateUser(user.id);
        toast.success('User activated');
      }
      navigate('/admin/members/admins');
    } catch (error) {
      toast.error('Action failed');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={20} /> Back to List
      </button>

      <div className="bg-tvk-dark-card border border-white/10 rounded-xl p-8 space-y-8">
        {/* Header Info */}
        <div className="flex items-start gap-6 pb-6 border-b border-white/10">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-2xl font-bold text-gold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{user.name}</h1>
            <p className="text-gray-400">{user.email}</p>
            <p className="text-gray-500 text-sm mt-1">{user.mobile}</p>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="text-blue-400 shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-blue-200">
            You cannot edit Name, Email, or Mobile here. The user must update their own profile
            settings. You can only manage Roles and Account Status.
          </div>
        </div>

        {/* Role Management */}
        <div>
          <h3 className="text-lg font-bold text-white mb-4">Manage Roles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['admin', 'moderator', 'member'].map((role) => {
              const hasRole = currentRoles.includes(role);
              return (
                <div
                  key={role}
                  className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5"
                >
                  <span className="capitalize text-white font-medium">{role}</span>
                  <button
                    onClick={() => handleRoleChange(role, hasRole ? 'remove' : 'add')}
                    disabled={loading}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      hasRole
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                    }`}
                  >
                    {hasRole ? 'Remove' : 'Assign'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-6 border-t border-white/10">
          <h3 className="text-lg font-bold text-red-400 mb-4">Danger Zone</h3>
          <div className="flex items-center justify-between p-4 border border-red-500/20 rounded-lg bg-red-500/5">
            <div>
              <p className="text-white font-medium">
                Account Status: <span className="uppercase">{user.status}</span>
              </p>
              <p className="text-sm text-gray-400">Suspend or Activate this user's access.</p>
            </div>
            <button
              onClick={handleBanActivate}
              disabled={loading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-colors ${
                user.status === 'active'
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {user.status === 'active' ? (
                <>
                  <Trash2 size={18} /> Ban User
                </>
              ) : (
                <>
                  <CheckCircle size={18} /> Activate User
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditAdminPage;
