import {
  Brands,
  ForwardedMessage,
  Inventory,
  Order,
  OrderItem,
  Products,
  Users,
} from "@prisma/client";

export interface ProductWithBrand extends Products {
  brand: Brands;
}

export interface BrandWithProducts extends Brands {
  products: Products[];
}

export interface InventoryWithProduct extends Inventory {
  product: ProductWithBrand;
}

export interface InventoryResponse {
  success?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inventory?: any;
  error?: string;
}

export type SearchBySize = {
  [width: string]: {
    [aspect: string]: number[];
  };
};

export type SearchByCar = {
  make: string;
  models: {
    [model: string]: number[];
  };
};

export interface OrderWithOrderItem extends Order {
  orderItem: (OrderItem & {
    product: Products & { brand: Brands };
  })[];
}

export interface ForwardedMessageWithUser extends ForwardedMessage {
  user: Users | null;
}
