import { Brands, Inventory, Order, OrderItem, Products, TireSize, ProductSize, CarMake, CarModel, ProductCompatibility } from "@prisma/client";

export interface ProductWithBrand extends Products {
  brand: Brands;
}

export interface ProductWithDetails extends Products {
  brand: Brands;
  productSize: (ProductSize & { tireSize: TireSize })[];
  productCompatibility: (ProductCompatibility & { model: CarModel & { make: CarMake } })[];
}

export interface TireSizeWithProducts extends TireSize {
  products: (ProductSize & { product: Products })[];
}

export interface CarMakeWithModels extends CarMake {
  models: CarModel[];
}

export interface CarModelWithMake extends CarModel {
  make: CarMake;
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
