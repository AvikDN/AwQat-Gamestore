import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuthContext } from './AuthContext';
import authApiClient from '../services/auth-api-client';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCartContext = () => useContext(CartContext);

const darkStyle = {
  style: { 
    background: '#18181c', 
    color: '#fff', 
    border: '1px solid #27272a', 
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '600',
    padding: '10px 16px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
    minWidth: '220px',
    maxWidth: '340px',
    whiteSpace: 'nowrap',
  },
  success: { iconTheme: { primary: '#2ecc71', secondary: '#18181c' } },
  error: { iconTheme: { primary: '#ef4444', secondary: '#18181c' } }
};

export const CartProvider = ({ children }) => {
  const { user } = useAuthContext();
  const [cartItems, setCartItems] = useState([]);
  const [cartId, setCartId] = useState(null);

  const isAdmin = user?.groups?.includes('Admin');

  const fetchRemoteCart = async () => {
    if (isAdmin) return;
    
    try {
      const res = await authApiClient.get('/api/carts/');
      const cartData = Array.isArray(res.data) ? res.data[0] : res.data;
      if (cartData) {
        setCartId(cartData.id);
        setCartItems(cartData.items || []);
      }
    } catch (error) {
      console.error("Failed to fetch remote cart", error);
    }
  };

  const syncLocalCart = async () => {
    if (isAdmin) return;

    const localCart = JSON.parse(localStorage.getItem('guestCart')) || [];
    if (localCart.length === 0) {
      fetchRemoteCart();
      return;
    }

    try {
      const res = await authApiClient.get('/api/carts/');
      const cartData = Array.isArray(res.data) ? res.data[0] : res.data;
      const activeCartId = cartData?.id;

      if (!activeCartId) return;

      const existingRemoteItems = cartData.items || [];

      for (const localItem of localCart) {
        const gameId = localItem.gameId || localItem.game?.id;
        const match = existingRemoteItems.find(r => r.game?.id === gameId || r.game === gameId);
        if (!match) {
          await authApiClient.post(`/api/carts/${activeCartId}/items/`, {
            game: gameId,
            quantity: localItem.quantity
          });
        }
      }
      
      localStorage.removeItem('guestCart');
      await fetchRemoteCart();
    } catch (error) {
      console.error("Cart sync failed", error);
    }
  };

  useEffect(() => {
    if (user) {
      syncLocalCart();
    } else {
      const local = JSON.parse(localStorage.getItem('guestCart')) || [];
      setCartItems(local);
      setCartId(null);
    }
  }, [user]);

  const addToCart = async (gameData, quantity = 1) => {
    if (isAdmin) {
      toast.error("Use Client ID to use cart system", {
        style: darkStyle.style,
        iconTheme: darkStyle.error.iconTheme
      });
      return;
    }

    let gameId;
    let fullGameObj = null;

    if (typeof gameData === 'object' && gameData !== null) {
      gameId = gameData.id;
      fullGameObj = gameData;
    } else {
      gameId = gameData;
      try {
        const res = await authApiClient.get(`/api/games/${gameId}/`);
        fullGameObj = res.data;
      } catch (err) {
        fullGameObj = { id: gameId, title: "Game Item", price: 0 };
      }
    }

    const toastId = toast.loading("Adding to Cart...", { 
      style: darkStyle.style 
    });

    setCartItems(prevItems => {
      const existingIndex = prevItems.findIndex(item => {
        const itemGameId = item.game?.id || item.game || item.gameId;
        return itemGameId === gameId;
      });

      if (existingIndex >= 0) {
        const updated = [...prevItems];
        const currentQty = updated[existingIndex].quantity || 1;
        const newQty = currentQty + quantity;

        if (newQty <= 0) {
          return updated.filter((_, idx) => idx !== existingIndex);
        } else {
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: newQty
          };
        }
        return updated;
      } else if (quantity > 0) {
        return [...prevItems, {
          gameId: gameId,
          game: fullGameObj,
          quantity: quantity
        }];
      }
      return prevItems;
    });

    toast.success("Cart Updated", { 
      id: toastId, 
      style: darkStyle.style, 
      iconTheme: darkStyle.success.iconTheme 
    });

    if (user) {
      if (!cartId) return;
      try {
        await authApiClient.post(`/api/carts/${cartId}/items/`, {
          game: gameId,
          quantity: quantity
        });
        fetchRemoteCart();
      } catch (error) {
        console.error("Failed to update remote cart", error);
        fetchRemoteCart();
      }
    } else {
      setCartItems(currentItems => {
        localStorage.setItem('guestCart', JSON.stringify(currentItems));
        return currentItems;
      });
    }
  };

  const clearCart = async () => {
    if (isAdmin) return;

    localStorage.removeItem('guestCart');
    setCartItems([]);
    if (user && cartId) {
      try {
        await authApiClient.delete(`/api/carts/${cartId}/`);
        setCartId(null);
      } catch (error) {
        console.error("Failed to clear remote cart", error);
      }
    }
  };

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, fetchRemoteCart, totalItems, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};