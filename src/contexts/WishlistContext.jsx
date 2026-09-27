import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FaHeart, FaCircleCheck, FaCircleXmark } from 'react-icons/fa6';
import AuthApiClient from '../services/auth-api-client';
import { useAuthContext } from './AuthContext';

const WishlistContext = createContext(null);

// Helper for consistent custom notifications
const showWishlistToast = (message, type = 'success') => {
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#18181c] border border-[#27272a] shadow-[0_10px_30px_rgba(0,0,0,0.8)] pointer-events-auto w-70 select-none`}
    >
      <div className="shrink-0 flex items-center justify-center">
        {type === 'success' ? (
          <FaCircleCheck className="text-[#2ecc71] text-base" />
        ) : type === 'remove' ? (
          <FaHeart className="text-zinc-500 text-base" />
        ) : (
          <FaCircleXmark className="text-rose-500 text-base" />
        )}
      </div>

      <p className="text-xs font-semibold text-white truncate flex-1 m-0">
        {message}
      </p>
    </div>
  ), {
    duration: 3500,
  });
};

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthContext();

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlistItems([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await AuthApiClient.get('/api/wishlist/');
      const items = Array.isArray(res.data) ? res.data : (res.data.results || []);
      setWishlistItems(items);
    } catch (error) {
      if (error.response?.status === 401) {
        setWishlistItems([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isWishlisted = useCallback((gameId) => {
    return wishlistItems.some(
      (item) => Number(item.game) === Number(gameId) || Number(item.game_details?.id) === Number(gameId)
    );
  }, [wishlistItems]);

  const toggleWishlist = async (game) => {
    if (!user) {
      showWishlistToast('Please log in to save items', 'error');
      return;
    }

    const gameId = game.id;
    const currentlySaved = isWishlisted(gameId);

    // Optimistic UI update
    if (currentlySaved) {
      setWishlistItems((prev) =>
        prev.filter((item) => Number(item.game) !== Number(gameId) && Number(item.game_details?.id) !== Number(gameId))
      );
    } else {
      setWishlistItems((prev) => [
        { id: `temp-${Date.now()}`, game: gameId, game_details: game, created_at: new Date().toISOString() },
        ...prev,
      ]);
    }

    try {
      const res = await AuthApiClient.post('/api/wishlist/toggle/', { game_id: gameId });
      
      if (res.data.status === 'added') {
        showWishlistToast(`Added ${game.title} to wishlist!`, 'success');
      } else {
        showWishlistToast(`Removed ${game.title} from wishlist`, 'remove');
      }
      fetchWishlist();
    } catch (error) {
      fetchWishlist();
      showWishlistToast('Failed to update wishlist', 'error');
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        setWishlistItems,
        isWishlisted,
        toggleWishlist,
        isLoading,
        fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};