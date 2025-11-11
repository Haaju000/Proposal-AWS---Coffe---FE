import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Cart Context
const CartContext = createContext();

// Cart Actions
const CART_ACTIONS = {
  ADD_TO_CART: 'ADD_TO_CART',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  LOAD_CART: 'LOAD_CART'
};

// Cart Reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.ADD_TO_CART: {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      } else {
        return {
          ...state,
          items: [...state.items, { ...action.payload, quantity: 1 }]
        };
      }
    }

    case CART_ACTIONS.REMOVE_FROM_CART: {
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };
    }

    case CART_ACTIONS.UPDATE_QUANTITY: {
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.id !== action.payload.id)
        };
      }

      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };
    }

    case CART_ACTIONS.CLEAR_CART: {
      return {
        ...state,
        items: []
      };
    }

    case CART_ACTIONS.LOAD_CART: {
      return {
        ...state,
        items: action.payload || []
      };
    }

    default:
      return state;
  }
};

// Initial State
const initialState = {
  items: []
};

// Cart Provider Component
export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('coffee_cart');
      if (savedCart) {
        const cartData = JSON.parse(savedCart);
        dispatch({ type: CART_ACTIONS.LOAD_CART, payload: cartData });
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
  }, []);

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    try {
      localStorage.setItem('coffee_cart', JSON.stringify(state.items));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [state.items]);

  // Cart Actions
  const addToCart = (item) => {
    dispatch({ type: CART_ACTIONS.ADD_TO_CART, payload: item });
  };

  const removeFromCart = (itemId) => {
    dispatch({ type: CART_ACTIONS.REMOVE_FROM_CART, payload: itemId });
  };

  const updateQuantity = (itemId, quantity) => {
    dispatch({ 
      type: CART_ACTIONS.UPDATE_QUANTITY, 
      payload: { id: itemId, quantity } 
    });
  };

  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
  };

  // Helper functions
  const getItemPrice = (price) => {
    return typeof price === 'string' ? 
      parseInt(price.replace(/[₫,]/g, '')) : 
      price;
  };

  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return state.items.reduce((total, item) => {
      let itemPrice = getItemPrice(item.price);
      
      // Add topping prices if any
      if (item.selectedToppings && item.selectedToppings.length > 0) {
        const toppingsPrice = item.selectedToppings.reduce((toppingTotal, topping) => {
          return toppingTotal + getItemPrice(topping.price);
        }, 0);
        itemPrice += toppingsPrice;
      }
      
      return total + (itemPrice * item.quantity);
    }, 0);
  };

  const getItemTotalPrice = (item) => {
    let basePrice = getItemPrice(item.price);
    
    // Add topping prices if any
    if (item.selectedToppings && item.selectedToppings.length > 0) {
      const toppingsPrice = item.selectedToppings.reduce((toppingTotal, topping) => {
        return toppingTotal + getItemPrice(topping.price);
      }, 0);
      basePrice += toppingsPrice;
    }
    
    return basePrice * item.quantity;
  };

  const getItemInCart = (itemId) => {
    return state.items.find(item => item.id === itemId);
  };

  const isItemInCart = (itemId) => {
    return state.items.some(item => item.id === itemId);
  };

  // Context value
  const value = {
    // State
    cartItems: state.items,
    cartItemCount: getTotalItems(),
    cartTotal: getTotalPrice(),
    
    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    
    // Helpers
    getItemPrice,
    getItemInCart,
    isItemInCart,
    getTotalItems,
    getTotalPrice,
    getItemTotalPrice
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// Custom hook to use cart context
export function useCart() {
  const context = useContext(CartContext);
  
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  
  return context;
}

export default CartContext;