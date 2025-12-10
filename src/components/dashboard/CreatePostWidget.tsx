import React from 'react';
import { Image, Video, Paperclip, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const CreatePostWidget: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="bg-[#1E1E1E] rounded-xl border border-gold/20 p-4 mb-6 shadow-lg">
      <div className="flex gap-4">
        {/* User Avatar */}
        <img
          src={
            user?.avatar_url ||
            `https://ui-avatars.com/api/?name=${user?.name}&background=E6C65B&color=000`
          }
          alt="User"
          className="w-10 h-10 rounded-full object-cover border border-gold/50"
        />

        {/* Input Area */}
        <div className="flex-1">
          <input
            type="text"
            placeholder={`What's on your mind, ${user?.name?.split(' ')[0]}?`}
            className="w-full bg-black/40 border border-white/10 rounded-full px-4 py-2.5 text-gray-300 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/50 transition-all placeholder-gray-500"
          />
        </div>
      </div>

      <hr className="border-white/5 my-3" />

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-green-400 transition text-sm font-medium">
            <Image size={18} />
            <span className="hidden sm:inline">Photo</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-red-400 transition text-sm font-medium">
            <Video size={18} />
            <span className="hidden sm:inline">Video</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-blue-400 transition text-sm font-medium">
            <Paperclip size={18} />
            <span className="hidden sm:inline">File</span>
          </button>
        </div>

        <button className="bg-gold hover:bg-goldDark text-black px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition">
          <Send size={16} />
          Post
        </button>
      </div>
    </div>
  );
};

export default CreatePostWidget;
