import { create } from "zustand";
import { toast } from "sonner";

export interface CartItem {
  id: string;
  name: string;
  image: string;
  brand: string;
  unitPrice: number;
  discountedPrice?: number;
  tireSize: string;
  quantity: number;
}

export interface CustomerDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  remarks?: string;
  acceptedTerms: boolean;
}

export type DeliveryOption = "delivery" | "installation";

interface CartStore {
  items: CartItem[];
  deliveryOption: DeliveryOption | null;
  preferredSchedule: Date | null;
  customerDetails: CustomerDetails | null;
  addItem: (data: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  setDeliveryOption: (option: DeliveryOption) => void;
  setPreferredSchedule: (date: Date | null) => void;
  setCustomerDetails: (details: CustomerDetails) => void;
  removeAll: () => void;
}

const useCart = create<CartStore>((set, get) => ({
  items: [],
  deliveryOption: null,
  preferredSchedule: null,
  customerDetails: null,

  addItem: (data: CartItem) => {
    const currentItems = get().items;

    if (currentItems.length > 0) {
      // Replace the existing product with the new one
      if (currentItems[0].id !== data.id) {
        set({ items: [data] });
        toast.success(`Cart replaced with ${data.name}`);
      } else {
        // If same product, just update the quantity
        set({
          items: currentItems.map((item) =>
            item.id === data.id
              ? { ...item, quantity: item.quantity + data.quantity }
              : item
          ),
        });
        toast.success(`Updated quantity for ${data.name}`);
      }
    } else {
      set({ items: [data] });
      toast.success("Item added to cart");
    }
  },

  removeItem: (id: string) => {
    set({ items: get().items.filter((item) => item.id !== id) });
    toast.success("Item removed from cart");
  },

  updateQuantity: (id: string, quantity: number) => {
    set({
      items: get().items.map((item) =>
        item.id === id ? { ...item, quantity } : item
      ),
    });
    toast.success("Quantity updated");
  },

  setDeliveryOption: (option) => {
    set({ deliveryOption: option });
  },

  setPreferredSchedule: (date) => set({ preferredSchedule: date }),

  setCustomerDetails: (details) => set({ customerDetails: details }),

  removeAll: () =>
    set({
      items: [],
      deliveryOption: null,
      preferredSchedule: null,
      customerDetails: null,
    }),
}));

export default useCart;
