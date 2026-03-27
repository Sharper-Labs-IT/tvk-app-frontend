import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fanSelfieService } from '../../services/fanSelfieService';
import type { GenerateSelfieResponse, UsageStatus } from '../../types/fanSelfie';
import { FaUpload, FaMagic, FaExchangeAlt } from 'react-icons/fa';
import Loader from '../Loader';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

interface GenerateSelfieProps {
  onSuccess: (newSelfie: any) => void;
  usage: UsageStatus | null;
  loadingUsage: boolean;
}

const GenerateSelfie: React.FC<GenerateSelfieProps> = ({ onSuccess, usage, loadingUsage }) => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Basic validation
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
        toast.error('Only JPG, PNG and WEBP files are allowed');
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile) return;

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const response: GenerateSelfieResponse = await fanSelfieService.generateSelfie(selectedFile);
      if (response.status === 'success') {
        toast.success(response.message);
        onSuccess(response.data);
        // Clear selection
        setSelectedFile(null);
        setPreview(null);
      }
    } catch (error: any) {
      console.error("Generation error:", error);
      const msg = error.response?.data?.message || "Failed to generate selfie. Please try again.";
      setGenerationError(msg);
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center p-8 bg-gray-800 rounded-xl border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">Login to Generate Selfies</h3>
        <p className="text-gray-400 mb-6">You need to be logged in to create AI selfies with VJ.</p>
        <a href="/login" className="px-6 py-2 bg-primary text-white rounded-full hover:bg-red-700 transition">
          Login Now
        </a>
      </div>
    );
  }

  if (loadingUsage) {
    return <div className="p-10 flex justify-center"><Loader /></div>;
  }

  // Check limits
  if (usage && usage.remaining <= 0) {
    return (
      <div className="text-center p-8 bg-gray-800 rounded-xl border border-red-900/50">
        <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaExchangeAlt className="text-red-500 text-2xl" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Daily Limit Reached</h3>
        <p className="text-gray-400 mb-4">
          You've used all your {usage.limit} generations for today.
          <br />
          Resets in: <span className="text-primary font-mono">{new Date(usage.resets_at).toLocaleTimeString()}</span>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-gray-900/50 p-4 sm:p-6 md:p-8 rounded-2xl border border-gray-800 backdrop-blur-sm">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center text-primary flex items-center justify-center gap-3">
        <FaMagic className="animate-pulse" /> Create Your Selfie
      </h2>
      
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-stretch justify-center">
        {/* Upload Area */}
        <div className="w-full lg:w-1/2">
          <label 
            htmlFor="photo-upload" 
            className={`
              relative flex flex-col items-center justify-center w-full min-h-[300px] h-full border-2 border-dashed rounded-xl cursor-pointer 
              transition-all duration-300 group overflow-hidden
              ${preview ? 'border-primary bg-gray-900 shadow-lg shadow-primary/20' : 'border-gray-600 hover:border-gray-400 hover:bg-gray-800'}
            `}
          >
            {preview ? (
              <>
                <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover rounded-lg transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <p className="text-white font-semibold flex items-center gap-2">
                    <FaExchangeAlt /> Change Photo
                  </p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 mb-4 rounded-full bg-gray-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FaUpload className="w-8 h-8 text-primary" />
                </div>
                <p className="mb-2 text-lg text-gray-300 font-semibold">Click to upload</p>
                <p className="text-sm text-gray-500">JPG, PNG or WEBP (Max. 10MB)</p>
              </div>
            )}
            <input id="photo-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          </label>
        </div>

        {/* Controls */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6 justify-center">
          <div className="bg-gray-800/80 p-5 md:p-6 rounded-xl border border-gray-700 shadow-inner">
            <h4 className="font-semibold text-white mb-3 text-lg flex items-center gap-2">
               📌 Instructions:
            </h4>
            <ul className="text-sm md:text-base text-gray-300 list-none space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span> Upload a clear photo of your face.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span> Ensure good lighting.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span> Avoid wearing sunglasses or hats.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span> Face the camera directly.
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center px-2">
              <span className="text-sm text-gray-400">Generations remaining today</span>
              <span className="bg-gray-800 px-3 py-1 rounded-full text-white font-bold text-sm">
                {usage?.remaining || 0} / {usage?.limit || 3}
              </span>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!selectedFile || isGenerating}
              className={`
                w-full py-4 px-6 rounded-full font-bold text-white text-lg shadow-xl transition-all duration-300 transform
                ${!selectedFile || isGenerating 
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-red-600 via-primary to-red-600 hover:from-red-500 hover:via-red-600 hover:to-red-500 hover:-translate-y-1 hover:shadow-primary/40 background-animate'}
              `}
              style={{ backgroundSize: '200% auto' }}
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-3">
                  <Loader size="sm" /> 
                  <span className="animate-pulse">Processing Magic...</span>
                </span>
              ) : (
                'Generate Magic Selfie ✨'
              )}
            </button>
            
            {generationError && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm text-center mt-1 bg-red-900/20 py-2 rounded-lg"
              >
                {generationError}
              </motion.p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateSelfie;
