import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contentService } from '../../../services/contentService';
import type { IContent } from '../../../types/content';
import {
  ArrowLeft,
  Calendar,
  FileText,
  Lock,
  Download,
  Video,
  Edit,
  Image as ImageIcon,
  User,
  Trash2,
} from 'lucide-react';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import toast from 'react-hot-toast';

const PostDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [post, setPost] = useState<IContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPost(parseInt(id));
    }
  }, [id]);

  const fetchPost = async (postId: number) => {
    try {
      setLoading(true);
      const data = await contentService.getById(postId);
      setPost(data);
    } catch (err) {
      setError('Failed to load post details.');
    } finally {
      setLoading(false);
    }
  };

  // Triggered when user clicks the delete button
  const initiateDelete = () => {
    setIsDeleteModalOpen(true);
  };

  // Triggered when user clicks "Confirm" in the modal
  const handleConfirmDelete = async () => {
    if (!post) return;

    try {
      setDeleting(true);
      // Call API
      await contentService.delete(post.id);

      // Redirect on success
      navigate('/admin/posts');
    } catch (err: any) {
      // Handle Error
      const msg = err.response?.data?.message || 'Failed to delete post';
      toast.error(msg);
      setDeleting(false);
      setIsDeleteModalOpen(false); // Close modal on error so user can try again
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
  };

  if (loading)
    return (
      <div className="p-10 text-white text-center animate-pulse">Loading content details...</div>
    );
  if (error || !post)
    return <div className="p-10 text-red-400 text-center">{error || 'Post not found'}</div>;

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Header / Back Button */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/admin/posts')}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-white font-serif">Post Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Media Preview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-black rounded-xl overflow-hidden border border-white/10 shadow-2xl min-h-[300px] flex items-center justify-center relative">
            {/* 1. Video Player */}
            {post.type === 'video' && post.file_url ? (
              <video controls className="w-full h-auto max-h-[600px] bg-black">
                <source src={post.file_url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : post.type === 'image' && post.file_url ? (
              /* 2. Image Preview */
              <img src={post.file_url} alt={post.title} className="w-full h-auto object-contain" />
            ) : (
              /* 3. Fallback / File / Text */
              <div className="text-center p-10">
                {post.type === 'file' ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-6 bg-white/5 rounded-full">
                      <FileText size={48} className="text-gold" />
                    </div>
                    <p className="text-gray-400">This is a downloadable file.</p>
                    <a
                      href={post.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 bg-gold text-black px-6 py-2 rounded-lg font-bold hover:bg-yellow-500"
                    >
                      <Download size={20} /> Download File
                    </a>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-500">
                    <ImageIcon size={48} />
                    <p>No Media Preview Available</p>
                  </div>
                )}
              </div>
            )}

            {/* Premium Badge Overlay */}
            {post.is_premium && (
              <div className="absolute top-4 right-4 bg-gold text-black text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg z-10">
                <Lock size={12} /> PREMIUM CONTENT
              </div>
            )}
          </div>

          {/* Description Card */}
          <div className="bg-tvk-dark-card p-6 rounded-xl border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">Description</h2>
            <div className="prose prose-invert text-gray-300 max-w-none">
              {post.description ? (
                <p className="whitespace-pre-wrap leading-relaxed">{post.description}</p>
              ) : (
                <p className="text-gray-500 italic">No description provided.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Meta Data */}
        <div className="space-y-6">
          <div className="bg-tvk-dark-card p-6 rounded-xl border border-white/10">
            <h3 className="text-lg font-medium text-gold mb-6 uppercase tracking-wider">
              Post Information
            </h3>

            <div className="space-y-6">
              <div>
                <span className="text-gray-500 text-sm block mb-1">Title</span>
                <p className="text-white font-medium text-lg">{post.title}</p>
              </div>

              <div>
                <span className="text-gray-500 text-sm block mb-1">Category</span>
                <div className="inline-block bg-white/5 px-3 py-1 rounded-lg text-gray-300 border border-white/5">
                  {post.category?.name || 'Uncategorized'}
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div>
                  <span className="text-gray-500 text-sm block mb-1">Type</span>
                  <div className="flex items-center gap-2 text-white capitalize">
                    {post.type === 'video' && <Video size={16} className="text-blue-400" />}
                    {post.type === 'image' && <ImageIcon size={16} className="text-purple-400" />}
                    {post.type === 'file' && <FileText size={16} className="text-green-400" />}
                    {post.type === 'post' && <FileText size={16} className="text-gray-400" />}
                    {post.type}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 text-sm block mb-1">Status</span>
                  <span
                    className={post.is_premium ? 'text-gold font-bold' : 'text-green-400 font-bold'}
                  >
                    {post.is_premium ? 'Premium' : 'Free'}
                  </span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 mt-4 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <Calendar size={16} />
                  <span>Created: {new Date(post.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <User size={16} />
                  <span>Author ID: {post.created_by}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Card */}
          <div className="bg-tvk-dark-card p-6 rounded-xl border border-white/10">
            <h3 className="text-white font-medium mb-4">Quick Actions</h3>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate(`/admin/posts/${post.id}/edit`)}
                disabled={deleting}
                className="w-full bg-gold/10 hover:bg-gold/20 text-gold py-2 rounded-lg border border-gold/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Edit size={16} /> Edit Post
              </button>

              {/* Delete Button */}
              <button
                onClick={initiateDelete}
                disabled={deleting}
                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2 rounded-lg border border-red-500/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {deleting ? (
                  'Deleting...'
                ) : (
                  <>
                    <Trash2 size={16} /> Delete Post
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmText="Delete Post"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isConfirming={deleting}
      />
    </div>
  );
};

export default PostDetailsPage;
