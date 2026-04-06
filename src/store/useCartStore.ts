import { create } from 'zustand';

export interface CartVariantInfo {
  variantId: string | null;
  variantName: string | null;
  priceModifier: number;
}

export interface CartItem {
  cartItemId: string; // Unique ID for the cart line item
  menuItemId: string;
  name: string;
  basePrice: number;
  quantity: number;
  isDeal: boolean;
  dealId: string | null;
  variantInfo: CartVariantInfo | null;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateQuantity: (cartItemId: string, change: number) => void;
  removeItem: (cartItemId: string) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTax: () => number;
  getServiceCharge: () => number;
  getDiscount: () => number;
  getTotal: () => number;
}

// Generate a simple unique ID for cart items to differentiate same items with different variants
const generateId = () => Math.random().toString(36).substr(2, 9);

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (newItem) => set((state) => {
    // Check if the exact same item with the exact same variant already exists
    const existingIndex = state.items.findIndex(
      (item) => 
        item.menuItemId === newItem.menuItemId && 
        item.isDeal === newItem.isDeal && 
        item.dealId === newItem.dealId &&
        (item.variantInfo?.variantId === newItem.variantInfo?.variantId)
    );

    if (existingIndex >= 0) {
      // Increment quantity of existing item
      const newItems = [...state.items];
      newItems[existingIndex].quantity += newItem.quantity;
      return { items: newItems };
    }

    // Add new item with a unique cart ID
    return { 
      items: [...state.items, { ...newItem, cartItemId: generateId() }] 
    };
  }),

  updateQuantity: (cartItemId, change) => set((state) => {
    const newItems = state.items.map(item => {
      if (item.cartItemId === cartItemId) {
        const newQuantity = Math.max(0, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(item => item.quantity > 0); // Automatically remove if quantity hits 0

    return { items: newItems };
  }),

  removeItem: (cartItemId) => set((state) => ({
    items: state.items.filter(item => item.cartItemId !== cartItemId)
  })),

  clearCart: () => set({ items: [] }),

  getSubtotal: () => {
    return get().items.reduce((total, item) => {
      const itemPrice = item.basePrice + (item.variantInfo?.priceModifier || 0);
      return total + (itemPrice * item.quantity);
    }, 0);
  },

  getTax: () => {
    // Assuming 0% tax for now as per UI
    return 0;
  },

  getServiceCharge: () => {
    // Assuming 0% service charge as per UI
    return 0;
  },

  getDiscount: () => {
    // Assuming 0% discount as per UI
    return 0;
  },

  getTotal: () => {
    const subtotal = get().getSubtotal();
    const tax = get().getTax();
    const serviceCharge = get().getServiceCharge();
    const discount = get().getDiscount();
    return subtotal + tax + serviceCharge - discount;
  }
}));
