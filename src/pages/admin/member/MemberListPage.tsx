import React, { useEffect, useState } from 'react';
import { adminMemberService } from '../../../services/adminMemberService';
import type { User } from '../../../types/user';
import Loader from '../../../components/Loader';
import { CheckCircle, XCircle, Trash2, Ban } from 'lucide-react';
import { toast } from 'react-hot-toast';

const MemberListPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<User[]>([]);

  // Function to fetch members (defined outside useEffect so we can reuse it)
  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await adminMemberService.getUsers(1);

      // Filter for regular members (users who do NOT have admin/moderator roles)
      const filteredMembers = data.users.data.filter(
        (user) => !user.roles.some((r) => r.name === 'admin' || r.name === 'moderator')
      );
      setMembers(filteredMembers);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Handle Ban / Activate Logic
  const handleToggleStatus = async (user: User) => {
    const action = user.status === 'active' ? 'BAN' : 'ACTIVATE';

    if (!window.confirm(`Are you sure you want to ${action} this member (${user.name})?`)) {
      return;
    }

    try {
      if (user.status === 'active') {
        await adminMemberService.banUser(user.id);
        toast.success('Member has been banned.');
      } else {
        await adminMemberService.activateUser(user.id);
        toast.success('Member has been activated.');
      }
      // Refresh the list to show new status
      fetchMembers();
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.error || 'Action failed';
      toast.error(msg);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Member Management</h1>
          <p className="text-gray-400">View and manage registered members</p>
        </div>
        <div className="bg-white/5 px-4 py-2 rounded-lg border border-white/10 text-sm text-gray-400">
          Total Members: <span className="text-white font-bold">{members.length}</span>
        </div>
      </div>

      <div className="bg-tvk-dark-card rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-gray-400 border-b border-white/10">
            <tr>
              <th className="p-4">Member</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Status</th>
              <th className="p-4">Joined At</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-300 divide-y divide-white/10">
            {members.length > 0 ? (
              members.map((member) => (
                <tr key={member.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold overflow-hidden">
                        {member.avatar ? (
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          member.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-white">{member.name}</div>
                        <div className="text-xs text-gray-500">@{member.nickname}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">{member.email}</div>
                    <div className="text-xs text-gray-500">{member.mobile}</div>
                  </td>
                  <td className="p-4">
                    {member.status === 'active' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                        <CheckCircle size={12} /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                        <Ban size={12} /> Banned
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {new Date(member.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(member)}
                      className={`p-2 rounded-lg transition-colors border ${
                        member.status === 'active'
                          ? 'text-red-400 hover:bg-red-500/10 border-transparent hover:border-red-500/20'
                          : 'text-green-400 hover:bg-green-500/10 border-transparent hover:border-green-500/20'
                      }`}
                      title={member.status === 'active' ? 'Ban Member' : 'Activate Member'}
                    >
                      {member.status === 'active' ? (
                        <Trash2 size={18} />
                      ) : (
                        <CheckCircle size={18} />
                      )}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  No members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MemberListPage;
