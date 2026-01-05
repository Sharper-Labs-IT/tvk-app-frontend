import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { contentService } from '../../../services/contentService';
import type { IContent } from '../../../types/content';
import { Plus, Trash2, Eye, FileVideo, Image as ImageIcon, FileText, Lock } from 'lucide-react';
import ConfirmationModal from '../../../components/common/ConfirmationModal';

const PostListPage: React.FC = () => {
  const [contents, setContents] = useState<IContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Initial Fetch
  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    try {
      setLoading(true);
      const data = await contentService.getAll();
      // The API returns pagination data, we want the array in 'data'
      setContents(data.data);
    } catch (err) {
      setError('Failed to load posts.');
    } finally {
      setLoading(false);
    }
  };

  // Triggered when the user clicks the delete trash icon
  const initiateDelete = (id: number) => {
    setPostToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // Triggered when user clicks "Confirm" in the modal
  const handleConfirmDelete = async () => {
    if (!postToDelete) return;

    try {
      setIsDeleting(true);
      await contentService.delete(postToDelete);
      // Remove from UI immediately to avoid reload
      setContents(contents.filter((item) => item.id !== postToDelete));
      setIsDeleteModalOpen(false);
      setPostToDelete(null);
    } catch (err) {
      alert('Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setPostToDelete(null);
  };

  // Helper to get icon based on type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <FileVideo size={18} className="text-blue-400" />;
      case 'image':
        return <ImageIcon size={18} className="text-purple-400" />;
      default:
        return <FileText size={18} className="text-gray-400" />;
    }
  };

  if (loading) return <div className="text-white p-8 animate-pulse">Loading posts...</div>;
  if (error)
    return (
      <div className="text-red-400 p-8 border border-red-500/20 bg-red-500/10 rounded-lg m-8">
        {error}
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white font-serif tracking-wide">Post Management</h1>
        <Link
          to="/admin/posts/create"
          className="flex items-center gap-2 bg-gradient-to-r from-tvk-accent-gold-dark to-tvk-accent-gold hover:from-tvk-accent-gold hover:to-[#FFC43A] text-black px-5 py-2.5 rounded-lg font-bold shadow-lg shadow-gold/20 transition-all transform hover:scale-105"
        >
          <Plus size={20} />
          Create Post
        </Link>
      </div>

      <div className="bg-tvk-dark-card rounded-xl border border-white/10 overflow-hidden shadow-xl">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-white/5 text-gold font-medium uppercase text-xs tracking-wider">
            <tr>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {contents.map((post) => (
              <tr key={post.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4 font-medium text-white flex items-center gap-4">
                  {/* Thumbnail Preview */}
                  {post.file_url && (post.type === 'image' || post.type === 'video') ? (
                    <div className="h-12 w-12 rounded-lg bg-black overflow-hidden border border-white/10 flex-shrink-0">
                      {/* If it's a video, we show a generic icon or the image if available */}
                      {post.type === 'image' ? (
                        <img
                          src={post.file_url}
                          alt="thumbnail"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          <FileVideo size={20} />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 flex-shrink-0">
                      <FileText size={20} className="text-gray-500" />
                    </div>
                  )}
                  <span className="group-hover:text-gold transition-colors">{post.title}</span>
                </td>
                <td className="px-6 py-4 text-gray-300">
                  {post.category?.name || 'Uncategorized'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(post.type)}
                    <span className="capitalize">{post.type}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {post.is_premium ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gold/10 text-gold border border-gold/30">
                      <Lock size={10} /> PREMIUM
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-700/50 text-gray-300 border border-white/10">
                      FREE
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {/* Alignment Fix: Wrapped in flex container */}
                  <div className="flex items-center justify-end gap-2">
                    {/* View Details Link */}
                    <Link
                      to={`/admin/posts/${post.id}`}
                      className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </Link>

                    {/* Delete Button */}
                    <button
                      onClick={() => initiateDelete(post.id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {contents.length === 0 && !loading && (
          <div className="p-12 text-center flex flex-col items-center justify-center text-gray-500">
            <div className="bg-white/5 p-4 rounded-full mb-4">
              <FileText size={32} className="text-gray-600" />
            </div>
            <h3 className="text-lg text-white font-medium mb-1">No posts yet</h3>
            <p className="text-sm">Create your first post to get started.</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete Post"
        message="Are you sure you want to delete this post? This cannot be undone."
        confirmText="Delete Post"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isConfirming={isDeleting}
      />
    </div>
  );
};

export default PostListPage;
