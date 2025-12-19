import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminMemberService } from '../../../services/adminMemberService';
import type { User } from '../../../types/user';
import Loader from '../../../components/Loader';
import { Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminListPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState<User[]>([]);

  // Fetch users
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      // Note: Backend currently returns all users. We filter client-side for now.
      const data = await adminMemberService.getUsers(1);

      // Filter only admins and moderators
      const filteredAdmins = data.users.data.filter((user) =>
        user.roles.some((r) => r.name === 'admin' || r.name === 'moderator')
      );

      setAdmins(filteredAdmins);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleToggleStatus = async (user: User) => {
    if (
      !confirm(
        `Are you sure you want to ${user.status === 'active' ? 'BAN' : 'ACTIVATE'} this user?`
      )
    )
      return;

    try {
      if (user.status === 'active') {
        await adminMemberService.banUser(user.id);
        toast.success('Admin banned successfully');
      } else {
        await adminMemberService.activateUser(user.id);
        toast.success('Admin activated successfully');
      }
      fetchAdmins(); // Refresh list
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Action failed');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Management</h1>
          <p className="text-gray-400">Manage administrators and moderators</p>
        </div>
        <Link
          to="/admin/members/admins/create"
          className="flex items-center gap-2 px-4 py-2 bg-gold text-black font-bold rounded-lg hover:bg-yellow-500 transition-colors"
        >
          <Plus size={20} />
          Add New Admin
        </Link>
      </div>

      {/* Table */}
      <div className="bg-tvk-dark-card rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-gray-400 border-b border-white/10">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4">Joined</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-300 divide-y divide-white/10">
            {admins.length > 0 ? (
              admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gold font-bold">
                        {admin.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-white">{admin.name}</div>
                        <div className="text-sm text-gray-500">{admin.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {admin.roles.map((role) => (
                      <span
                        key={role.id}
                        className="inline-block px-2 py-1 text-xs font-bold rounded bg-blue-500/20 text-blue-400 mr-2 uppercase"
                      >
                        {role.name}
                      </span>
                    ))}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${
                        admin.status === 'active'
                          ? 'bg-green-500/10 text-green-400 border-green-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}
                    >
                      {admin.status === 'active' ? (
                        <CheckCircle size={12} />
                      ) : (
                        <XCircle size={12} />
                      )}
                      {admin.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {new Date(admin.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/admin/members/admins/edit/${admin.id}`}
                        state={{ user: admin }} // Pass user data to edit page to avoid re-fetching
                        className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="Edit Roles"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => handleToggleStatus(admin)}
                        className={`p-2 rounded-lg transition-colors ${
                          admin.status === 'active'
                            ? 'text-red-400 hover:bg-red-500/10'
                            : 'text-green-400 hover:bg-green-500/10'
                        }`}
                        title={admin.status === 'active' ? 'Ban Admin' : 'Activate Admin'}
                      >
                        {admin.status === 'active' ? (
                          <Trash2 size={18} />
                        ) : (
                          <CheckCircle size={18} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  No admins found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminListPage;
