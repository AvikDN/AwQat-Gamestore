import React from 'react';
import { FaMinus, FaPlus, FaArrowRight } from 'react-icons/fa6';
import { FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useCartContext } from '../contexts/CartContext';

export default function CartDropdown({ isOpen, onClose }) {
  const { cartItems, addToCart } = useCartContext();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleProceedToOrder = () => {
    onClose();
    navigate('/dashboard/cart');
  };

  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const totalAmount = cartItems.reduce((acc, item) => {
    const game = item.game || item;
    const basePrice = parseFloat(game.price || item.price || 0);
    const discountVal = parseFloat(game.discount || 0);
    const unitPrice =
      discountVal > 0
        ? discountVal <= 100
          ? basePrice - (basePrice * discountVal) / 100
          : basePrice - discountVal
        : basePrice;
    return acc + unitPrice * item.quantity;
  }, 0);

  return (
    <div
      className={`
        absolute top-full mt-3 z-50 overflow-hidden text-white p-4
        right-0 w-[85vw] max-w-[340px] sm:max-w-none sm:w-96
        bg-[#18181c] border border-[#27272a] rounded-2xl shadow-2xl
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#27272a] pb-3 mb-3">
        <h3 className="font-extrabold text-base">Your Cart ({totalItemsCount})</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white p-1.5 -m-1.5 cursor-pointer"
          aria-label="Close cart"
        >
          <FaTimes size={18} />
        </button>
      </div>

      {/* Empty state */}
      {cartItems.length === 0 ? (
        <div className="py-8 text-center text-gray-400 text-sm">Your cart is empty.</div>
      ) : (
        <>
          {/* Cart items list */}
          <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-1">
            {cartItems.map((item, index) => {
              const game = typeof item.game === 'object' && item.game !== null ? item.game : item;
              const title = game.title || item.title || 'Game Item';
              const basePrice = parseFloat(game.price || item.price || 0);
              const discountVal = parseFloat(game.discount || item.discount || 0);
              const unitPrice =
                discountVal > 0
                  ? discountVal <= 100
                    ? basePrice - (basePrice * discountVal) / 100
                    : basePrice - discountVal
                  : basePrice;

              const image =
                game.images?.[0]?.image ||
                game.image ||
                item.image ||
                'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=200&auto=format&fit=crop';

              const itemId = item.id || item.gameId || game.id || index;

              return (
                <div
                  key={itemId}
                  className="flex items-center justify-between bg-[#121212] p-3 rounded-xl border border-[#27272a]"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <img
                      src={image}
                      alt={title}
                      className="w-12 h-12 object-cover rounded-lg bg-[#222] flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs sm:text-sm line-clamp-1">{title}</h4>
                      <span className="text-[#2ecc71] font-extrabold text-xs sm:text-sm">
                        {(unitPrice * item.quantity).toFixed(0)} ৳
                      </span>
                    </div>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <div className="flex h-8 sm:h-9 bg-[#222] rounded-lg overflow-hidden">
                      <button
                        onClick={() => addToCart(game, -1)}
                        className="w-8 sm:w-9 flex items-center justify-center bg-[#333] text-white hover:bg-[#555] cursor-pointer active:scale-95 transition-transform"
                        aria-label="Decrease quantity"
                      >
                        <FaMinus size={10} />
                      </button>
                      <span className="px-2.5 flex items-center text-xs sm:text-sm font-bold min-w-[24px] justify-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => addToCart(game, 1)}
                        className="w-8 sm:w-9 flex items-center justify-center bg-[#333] text-white hover:bg-[#555] cursor-pointer active:scale-95 transition-transform"
                        aria-label="Increase quantity"
                      >
                        <FaPlus size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-[#27272a] flex flex-col gap-3">
            <div className="flex justify-between items-center text-sm font-bold">
              <span>Total:</span>
              <span className="text-[#2ecc71] text-base sm:text-lg">
                {totalAmount.toFixed(0)} ৳
              </span>
            </div>

            <button
              onClick={handleProceedToOrder}
              className="w-full py-3 sm:py-2.5 bg-[#2ecc71] hover:bg-[#27ae60] text-black text-sm font-extrabold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md active:scale-[0.98]"
            >
              <span>Proceed to Order</span>
              <FaArrowRight size={12} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}