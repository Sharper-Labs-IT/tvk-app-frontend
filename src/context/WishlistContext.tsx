import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { wishlistService } from '../services/wishlistService';
import type { WishlistItem } from '../services/wishlistService';
import toast from 'react-hot-toast';

interface WishlistContextType {
    wishlist: WishlistItem[];
    wishlistCount: number;
    addToWishlist: (productId: number) => Promise<void>;
    removeFromWishlist: (productId: number) => Promise<void>;
    toggleWishlist: (productId: number) => Promise<void>;
    isInWishlist: (productId: number) => boolean;
    isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { isLoggedIn } = useAuth();
    const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isLoggedIn) {
            fetchWishlist();
        } else {
            setWishlist([]);
        }
    }, [isLoggedIn]);

    const fetchWishlist = async () => {
        setIsLoading(true);
        try {
            const data = await wishlistService.getWishlist();
            setWishlist(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch wishlist', error);
        } finally {
            setIsLoading(false);
        }
    };

    const addToWishlist = async (productId: number) => {
        if (!isLoggedIn) {
            toast.error("Please login to use wishlist");
            return;
        }
        try {
            // Optimistic Update
            // We can't fully predict the response structure without a real product object, 
            // so we might just wait for refresh or simulate specific parts if critical.
            // For now, simpler to just await.
            await wishlistService.addToWishlist(productId);
            toast.success("Added to wishlist");
            fetchWishlist(); 
        } catch (error) {
            console.error(error);
            toast.error("Failed to add to wishlist");
        }
    };

    const removeFromWishlist = async (productId: number) => {
        try {
            setWishlist(prev => prev.filter(item => item.product_id !== productId));
            await wishlistService.removeFromWishlist(productId);
            toast.success("Removed from wishlist");
        } catch (error) {
            console.error(error);
            toast.error("Failed to remove from wishlist");
            fetchWishlist(); // Revert
        }
    };

    const toggleWishlist = async (productId: number) => {
        if (isInWishlist(productId)) {
            await removeFromWishlist(productId);
        } else {
            await addToWishlist(productId);
        }
    };

    const isInWishlist = (productId: number) => {
        return wishlist.some(item => item.product_id === productId);
    };

    return (
        <WishlistContext.Provider value={{
            wishlist,
            wishlistCount: wishlist.length,
            addToWishlist,
            removeFromWishlist,
            toggleWishlist,
            isInWishlist,
            isLoading
        }}>
            {children}
        </WishlistContext.Provider>
    );
};
