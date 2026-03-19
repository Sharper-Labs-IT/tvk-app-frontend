import React, { useState, useEffect } from 'react';
import type { FanSelfie } from '../../types/fanSelfie';
import { fanSelfieService } from '../../services/fanSelfieService';
import Loader from '../Loader';
import { FaHeart, FaShare } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { getFullImageUrl } from '../../utils/imageUrl';

const PublicFeed: React.FC = () => {
    const [selfies, setSelfies] = useState<FanSelfie[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchSelfies = async (pageNum: number) => {
        try {
            setLoading(true);
            const response = await fanSelfieService.getPublicFeed(12, pageNum);
            if (response.data && Array.isArray(response.data.data)) {
                 if (pageNum === 1) {
                    setSelfies(response.data.data);
                } else {
                    setSelfies(prev => [...prev, ...response.data.data]);
                }
                setHasMore(response.data.current_page < response.data.last_page);
            }
        } catch (error) {
            console.error("Error fetching public feed:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSelfies(1);
    }, []);

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchSelfies(nextPage);
    };

    if (loading && page === 1) return <div className="flex justify-center p-10"><Loader /></div>;

    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold mb-6 text-center text-primary">Fan Gallery</h2>
            
            {selfies.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                    No public selfies yet. Be the first to share yours!
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {selfies.map((selfie) => (
                        <motion.div 
                            key={selfie.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700"
                        >
                            <div className="aspect-[3/4] relative group">
                                <img 
                                    src={selfie.generated_image_url ? getFullImageUrl(selfie.generated_image_url) : '/placeholder-selfie.jpg'} 
                                    alt="Fan Selfie with VJ" 
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                                    <button className="text-white hover:text-red-500 transition-colors">
                                        <FaHeart size={20} />
                                    </button>
                                    <button className="text-white hover:text-blue-400 transition-colors">
                                        <FaShare size={20} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-3">
                                <p className="text-sm text-gray-400">Generated on {new Date(selfie.created_at).toLocaleDateString()}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {hasMore && (
                <div className="flex justify-center mt-8">
                    <button 
                        onClick={loadMore}
                        disabled={loading}
                        className="px-6 py-2 bg-primary text-white rounded-full hover:bg-red-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Loading...' : 'Load More'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default PublicFeed;
