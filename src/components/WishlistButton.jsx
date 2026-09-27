import React from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa6';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuthContext } from '../contexts/AuthContext';

export default function WishlistButton({ game, className = '', iconSize = 'text-sm' }) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { user } = useAuthContext();

  if (!game || !game.id) return null;

  const active = isWishlisted(game.id);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Please log in to save games to your wishlist.');
      return;
    }

    toggleWishlist(game);
  };

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.88 }}
      onClick={handleClick}
      title={active ? 'Remove from wishlist' : 'Add to wishlist'}
      className={`relative flex items-center justify-center p-2 rounded-xl transition-all duration-200 cursor-pointer backdrop-blur-md ${
        active
          ? 'bg-rose-500/20 border border-rose-500/40 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
          : 'bg-[#18181c]/80 hover:bg-[#222228] border border-[#27272a] text-zinc-400 hover:text-white hover:border-[#383838]'
      } ${className}`}
    >
      <motion.div
        key={active ? 'active' : 'inactive'}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
      >
        {active ? (
          <FaHeart className={`${iconSize} text-rose-500`} />
        ) : (
          <FaRegHeart className={`${iconSize}`} />
        )}
      </motion.div>
    </motion.button>
  );
}