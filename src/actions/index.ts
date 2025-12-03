/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import z from "zod";
import {
  BrandValidators,
  FaqsValidators,
  InventoryValidators,
  PolicyValidators,
  ProductValidators,
  PromotionValidators,
  StaffValidators,
  TipsGuidesValidators,
  CarMakeValidators,
  CarModelValidators,
  TireSizeValidators,
  FeedbackValidators,
} from "@/validators";
import db from "@/lib/db";
import { InventoryResponse, OrderWithOrderItem } from "@/types";
import { getStockStatus } from "@/lib/utils";
import { CartItem, CustomerDetails, DeliveryOption } from "@/hooks/use-cart";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { OrderCompleteHTML } from "@/components/email-template/order-complete";
import { sendMail } from "@/lib/nodemailer";
import { OrderStatusEmailHTML } from "@/components/email-template/order-status";
import { OrderRejectionEmailHTML } from "@/components/email-template/order-rejection";
import { OrderCancellationEmailHTML } from "@/components/email-template/order-cancellation";

export const createBrand = async (values: z.infer<typeof BrandValidators>) => {
  const parseValues = BrandValidators.parse(values);

  try {
    // Check if there is existing brand with the same name
    const existingBrand = await db.brands.findFirst({
      where: { name: parseValues.name },
    });

    if (existingBrand) {
      return { error: "Brand with this name already exists" };
    }

    const brand = await db.brands.create({
      data: parseValues,
    });

    return { success: "Brand created successfully", brand };
  } catch (error) {
    console.error("Error creating brand:", error);
    return { error: "Failed to create brand" };
  }
};

export const updateBrand = async (
  id: string,
  values: z.infer<typeof BrandValidators>
) => {
  const parseValues = BrandValidators.parse(values);

  try {
    const existingBrand = await db.brands.findFirst({
      where: { id },
    });

    if (!existingBrand) {
      return { error: "Brand not found" };
    }

    if (existingBrand.name !== parseValues.name) {
      const duplicateBrand = await db.brands.findFirst({
        where: { name: parseValues.name },
      });

      if (duplicateBrand) {
        return { error: "Another brand with this name already exists" };
      }
    }

    const updatedBrand = await db.brands.update({
      where: { id },
      data: parseValues,
    });

    return { success: "Brand updated successfully", brand: updatedBrand };
  } catch (error) {
    console.error("Error updating brand:", error);
    return { error: "Failed to update brand" };
  }
};

export const deleteBrand = async (id: string) => {
  try {
    const existingBrand = await db.brands.findFirst({
      where: { id },
    });

    if (!existingBrand) {
      return { error: "Brand not found" };
    }

    await db.brands.delete({
      where: { id },
    });
    return { success: "Brand deleted successfully" };
  } catch (error) {
    console.error("Error deleting brand:", error);
    return { error: "Failed to delete brand" };
  }
};

export const createProduct = async (
  values: z.infer<typeof ProductValidators>
) => {
  const parseValues = ProductValidators.parse(values);

  try {
    const existingProduct = await db.products.findFirst({
      where: { name: parseValues.name },
    });

    if (existingProduct) {
      return { error: "Product with this name already exists" };
    }

    // Extract tireSizeIds, tireSizePricing, and compatibilities before creating product
    const { tireSizeIds, tireSizePricing, compatibilities, ...productData } =
      parseValues;

    const product = await db.products.create({
      data: {
        ...productData,
        price: productData.price ?? 0, // Default to 0 if undefined
        tireSize: productData.tireSize ?? "", // Default to empty string if undefined
      },
    });

    // Create ProductSize relationships with pricing if tireSizePricing is provided
    if (tireSizePricing && tireSizePricing.length > 0) {
      await db.productSize.createMany({
        data: tireSizePricing.map((pricing) => ({
          productId: product.id,
          tireSizeId: pricing.tireSizeId,
          price: pricing.price,
          isClearanceSale: pricing.isClearanceSale || false,
          discountedPrice: pricing.discountedPrice,
        })),
      });
    } else if (tireSizeIds && tireSizeIds.length > 0) {
      // Fallback to old behavior if tireSizePricing is not provided
      await db.productSize.createMany({
        data: tireSizeIds.map((tireSizeId) => ({
          productId: product.id,
          tireSizeId,
          price: productData.price, // Use main product price
          isClearanceSale: productData.isClearanceSale || false,
          discountedPrice: productData.discountedPrice,
        })),
      });
    }

    // Create ProductCompatibility relationships if compatibilities are provided
    if (compatibilities && compatibilities.length > 0) {
      await db.productCompatibility.createMany({
        data: compatibilities.map((compat) => ({
          productId: product.id,
          modelId: compat.modelId,
          year: compat.year,
        })),
      });
    }

    return { success: "Product created successfully", product };
  } catch (error) {
    console.error("Error creating product:", error);
    return { error: "Failed to create product" };
  }
};

export const updateProduct = async (
  id: string,
  values: z.infer<typeof ProductValidators>
) => {
  const parseValues = ProductValidators.parse(values);
  try {
    const existingProduct = await db.products.findFirst({
      where: { id },
    });

    if (!existingProduct) {
      return { error: "Product not found" };
    }

    if (existingProduct.name !== parseValues.name) {
      const duplicateProduct = await db.products.findFirst({
        where: { name: parseValues.name },
      });

      if (duplicateProduct) {
        return { error: "Another product with this name already exists" };
      }
    }

    // Extract tireSizeIds, tireSizePricing, and compatibilities before updating product
    const { tireSizeIds, tireSizePricing, compatibilities, ...productData } =
      parseValues;

    const updatedProduct = await db.products.update({
      where: { id },
      data: {
        ...productData,
        price: productData.price ?? 0, // Default to 0 if undefined
        tireSize: productData.tireSize ?? "", // Default to empty string if undefined
      },
    });

    // Update ProductSize relationships
    // Delete existing ProductSize records
    await db.productSize.deleteMany({
      where: { productId: id },
    });

    // Create new ProductSize records with pricing if tireSizePricing is provided
    if (tireSizePricing && tireSizePricing.length > 0) {
      await db.productSize.createMany({
        data: tireSizePricing.map((pricing) => ({
          productId: id,
          tireSizeId: pricing.tireSizeId,
          price: pricing.price,
          isClearanceSale: pricing.isClearanceSale || false,
          discountedPrice: pricing.discountedPrice,
        })),
      });
    } else if (tireSizeIds && tireSizeIds.length > 0) {
      // Fallback to old behavior if tireSizePricing is not provided
      await db.productSize.createMany({
        data: tireSizeIds.map((tireSizeId) => ({
          productId: id,
          tireSizeId,
          price: productData.price, // Use main product price
          isClearanceSale: productData.isClearanceSale || false,
          discountedPrice: productData.discountedPrice,
        })),
      });
    }

    // Update ProductCompatibility relationships
    // Delete existing ProductCompatibility records
    await db.productCompatibility.deleteMany({
      where: { productId: id },
    });

    // Create new ProductCompatibility records if compatibilities are provided
    if (compatibilities && compatibilities.length > 0) {
      await db.productCompatibility.createMany({
        data: compatibilities.map((compat) => ({
          productId: id,
          modelId: compat.modelId,
          year: compat.year,
        })),
      });
    }

    return { success: "Product updated successfully", product: updatedProduct };
  } catch (error) {
    console.error("Error updating product:", error);
    return { error: "Failed to update product" };
  }
};

export const deleteProduct = async (id: string) => {
  try {
    const existingProduct = await db.products.findFirst({
      where: { id },
    });

    if (!existingProduct) {
      return { error: "Product not found" };
    }

    // Delete dependent records first to avoid FK constraint violations
    await db.productSize.deleteMany({
      where: { productId: id },
    });

    await db.productCompatibility.deleteMany({
      where: { productId: id },
    });

    await db.inventory.deleteMany({
      where: { productId: id },
    });

    await db.cartItem.deleteMany({
      where: { productId: id },
    });

    await db.orderItem.deleteMany({
      where: { productId: id },
    });

    // Finally delete the product itself
    await db.products.delete({
      where: { id },
    });

    return { success: "Product deleted successfully" };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { error: "Failed to delete product" };
  }
};

export const createInventory = async (
  values: z.infer<typeof InventoryValidators>
) => {
  const parseValues = InventoryValidators.parse(values);

  try {
    const product = await db.products.findFirst({
      where: { id: parseValues.productId },
    });

    if (!product) {
      return { error: "Product not found" };
    }

    const existingInventory = await db.inventory.findFirst({
      where: { productId: parseValues.productId },
    });

    if (existingInventory) {
      return { error: "Inventory for this product already exists" };
    }

    // check if the quantity is more than maxStock
    if (
      parseValues.maxStock !== undefined &&
      parseValues.quantity > parseValues.maxStock
    ) {
      return { error: "Quantity cannot be more than max stock" };
    }

    // check if the quantity is less than minStock
    if (parseValues.quantity < parseValues.minStock) {
      return { error: "Quantity cannot be less than min stock" };
    }

    // check if the minStock is more than maxStock
    if (
      parseValues.maxStock !== undefined &&
      parseValues.minStock > parseValues.maxStock
    ) {
      return { error: "Min stock cannot be more than max stock" };
    }

    // check if the minStock is less than 0
    if (parseValues.minStock < 0) {
      return { error: "Min stock cannot be less than 0" };
    }

    // check if the quantity is less than 0
    if (parseValues.quantity < 0) {
      return { error: "Quantity cannot be less than 0" };
    }

    const inventory = await db.inventory.create({
      data: {
        productId: parseValues.productId,
        quantity: parseValues.quantity,
        minStock: parseValues.minStock,
        maxStock: parseValues.maxStock,
        sku: parseValues.sku,
      },
    });

    return { success: "Inventory created successfully", inventory };
  } catch (error) {
    console.error("Error creating inventory:", error);
    return { error: "Failed to create inventory" };
  }
};

export const updateInventory = async (
  id: string,
  values: z.infer<typeof InventoryValidators>
) => {
  const parseValues = InventoryValidators.parse(values);
  try {
    const existingInventory = await db.inventory.findFirst({
      where: { id },
    });

    if (!existingInventory) {
      return { error: "Inventory not found" };
    }

    const product = await db.products.findFirst({
      where: { id: parseValues.productId },
    });

    if (!product) {
      return { error: "Product not found" };
    }

    if (existingInventory.productId !== parseValues.productId) {
      const duplicateInventory = await db.inventory.findFirst({
        where: { productId: parseValues.productId },
      });

      if (duplicateInventory) {
        return { error: "Inventory for this product already exists" };
      }
    }

    // check if the quantity is more than maxStock
    if (
      parseValues.maxStock !== undefined &&
      parseValues.quantity > parseValues.maxStock
    ) {
      return { error: "Quantity cannot be more than max stock" };
    }

    // check if the quantity is less than minStock
    if (parseValues.quantity < parseValues.minStock) {
      return { error: "Quantity cannot be less than min stock" };
    }

    // check if the minStock is more than maxStock
    if (
      parseValues.maxStock !== undefined &&
      parseValues.minStock > parseValues.maxStock
    ) {
      return { error: "Min stock cannot be more than max stock" };
    }

    // check if the minStock is less than 0
    if (parseValues.minStock < 0) {
      return { error: "Min stock cannot be less than 0" };
    }

    // check if the quantity is less than 0
    if (parseValues.quantity < 0) {
      return { error: "Quantity cannot be less than 0" };
    }

    const updatedInventory = await db.inventory.update({
      where: { id },
      data: {
        productId: parseValues.productId,
        quantity: parseValues.quantity,
        minStock: parseValues.minStock,
        maxStock: parseValues.maxStock,
        sku: parseValues.sku,
      },
    });

    return {
      success: "Inventory updated successfully",
      inventory: updatedInventory,
    };
  } catch (error) {
    console.error("Error updating inventory:", error);
    return { error: "Failed to update inventory" };
  }
};

export const deleteInventory = async (id: string) => {
  try {
    const existingInventory = await db.inventory.findFirst({
      where: { id },
    });

    if (!existingInventory) {
      return { error: "Inventory not found" };
    }

    await db.inventory.delete({
      where: { id },
    });

    return { success: "Inventory deleted successfully" };
  } catch (error) {
    console.error("Error deleting inventory:", error);
    return { error: "Failed to delete inventory" };
  }
};

export const updateStockQuantity = async (
  id: string,
  quantity: number
): Promise<InventoryResponse> => {
  const existingInventory = await db.inventory.findUnique({ where: { id } });
  if (!existingInventory) throw new Error("Inventory not found");

  if (quantity < 0) throw new Error("Quantity cannot be less than 0");
  if (
    existingInventory.maxStock != null &&
    quantity > existingInventory.maxStock
  ) {
    throw new Error("Quantity cannot be more than max stock");
  }

  const updatedInventory = await db.inventory.update({
    where: { id },
    data: {
      quantity,
      status: getStockStatus(quantity, existingInventory.minStock),
    },
  });

  return {
    success: "Stock updated successfully",
    inventory: updatedInventory,
  };
};

export const updateMinimumStock = async (
  id: string,
  minStock: number
): Promise<InventoryResponse> => {
  const existingInventory = await db.inventory.findUnique({ where: { id } });
  if (!existingInventory) throw new Error("Inventory not found");

  if (minStock < 0) throw new Error("Minimum stock cannot be less than 0");
  if (
    existingInventory.maxStock != null &&
    minStock > existingInventory.maxStock
  ) {
    throw new Error("Minimum stock cannot be more than max stock");
  }

  const updatedInventory = await db.inventory.update({
    where: { id },
    data: {
      minStock,
      status: getStockStatus(existingInventory.quantity, minStock),
    },
  });

  return {
    success: "Minimum stock updated successfully",
    inventory: updatedInventory,
  };
};

export const updateMaximumStock = async (
  id: string,
  maxStock: number
): Promise<InventoryResponse> => {
  const existingInventory = await db.inventory.findUnique({ where: { id } });
  if (!existingInventory) throw new Error("Inventory not found");

  if (maxStock < 0) throw new Error("Maximum stock cannot be less than 0");
  if (maxStock < existingInventory.minStock) {
    throw new Error("Maximum stock cannot be less than min stock");
  }
  if (existingInventory.quantity > maxStock) {
    throw new Error("Maximum stock cannot be less than current quantity");
  }

  const updatedInventory = await db.inventory.update({
    where: { id },
    data: {
      maxStock,
      status: getStockStatus(
        existingInventory.quantity,
        existingInventory.minStock
      ),
    },
  });

  return {
    success: "Maximum stock updated successfully",
    inventory: updatedInventory,
  };
};

export const createTipsGuides = async (
  values: z.infer<typeof TipsGuidesValidators>
) => {
  const parseValues = TipsGuidesValidators.parse(values);

  try {
    const tipsGuides = await db.tipsGuides.create({
      data: parseValues,
    });

    return { success: "Tips & guides created successfully", tipsGuides };
  } catch (error) {
    console.error("Error creating tips & guides:", error);
    return { error: "Failed to create tips & guides" };
  }
};

export const updateTipsGuides = async (
  id: string,
  values: z.infer<typeof TipsGuidesValidators>
) => {
  const parseValues = TipsGuidesValidators.parse(values);

  try {
    const existingTipsGuides = await db.tipsGuides.findFirst({
      where: { id },
    });

    if (!existingTipsGuides) {
      return { error: "Tips & guides not found" };
    }

    const updatedTipsGuides = await db.tipsGuides.update({
      where: { id },
      data: parseValues,
    });

    return {
      success: "Tips & guides updated successfully",
      tipsGuides: updatedTipsGuides,
    };
  } catch (error) {
    console.error("Error updating tips & guides:", error);
    return { error: "Failed to update tips & guides" };
  }
};

export const deleteTipsGuides = async (id: string) => {
  try {
    const existingTipsGuides = await db.tipsGuides.findFirst({
      where: { id },
    });

    if (!existingTipsGuides) {
      return { error: "Tips & guides not found" };
    }

    await db.tipsGuides.delete({
      where: { id },
    });

    return { success: "Tips & guides deleted successfully" };
  } catch (error) {
    console.error("Error deleting tips & guides:", error);
    return { error: "Failed to delete tips & guides" };
  }
};

export const createFaqs = async (values: z.infer<typeof FaqsValidators>) => {
  const parseValues = FaqsValidators.parse(values);

  try {
    const faqs = await db.faqs.create({
      data: parseValues,
    });

    return { success: "FAQs created successfully", faqs };
  } catch (error) {
    console.error("Error creating FAQs:", error);
    return { error: "Failed to create FAQs" };
  }
};

export const updateFaqs = async (
  id: string,
  values: z.infer<typeof FaqsValidators>
) => {
  const parseValues = FaqsValidators.parse(values);

  try {
    const existingFaqs = await db.faqs.findFirst({
      where: { id },
    });

    if (!existingFaqs) {
      return { error: "FAQs not found" };
    }

    const updatedFaqs = await db.faqs.update({
      where: { id },
      data: parseValues,
    });

    return {
      success: "FAQs updated successfully",
      faqs: updatedFaqs,
    };
  } catch (error) {
    console.error("Error updating FAQs:", error);
    return { error: "Failed to update FAQs" };
  }
};

export const deleteFaqs = async (id: string) => {
  try {
    const existingFaqs = await db.faqs.findFirst({
      where: { id },
    });

    if (!existingFaqs) {
      return { error: "FAQs not found" };
    }

    await db.faqs.delete({
      where: { id },
    });

    return { success: "FAQs deleted successfully" };
  } catch (error) {
    console.error("Error deleting FAQs:", error);
    return { error: "Failed to delete FAQs" };
  }
};

export const createStaff = async (values: z.infer<typeof StaffValidators>) => {
  const parseValues = StaffValidators.parse(values);

  try {
    // Check if there is existing staff with the same email
    const existingStaff = await db.staff.findFirst({
      where: { email: parseValues.email },
    });

    if (existingStaff) {
      return { error: "Staff with this email already exists" };
    }

    const staff = await db.staff.create({
      data: parseValues,
    });

    return { success: "Staff created successfully", staff };
  } catch (error) {
    console.error("Error creating staff:", error);
    return { error: "Failed to create staff" };
  }
};

export const updateStaff = async (
  id: string,
  values: z.infer<typeof StaffValidators>
) => {
  const parseValues = StaffValidators.parse(values);

  try {
    const existingStaff = await db.staff.findFirst({
      where: { id },
    });

    if (!existingStaff) {
      return { error: "Staff not found" };
    }

    if (existingStaff.email !== parseValues.email) {
      const duplicateStaff = await db.staff.findFirst({
        where: { email: parseValues.email },
      });

      if (duplicateStaff) {
        return { error: "Another staff member with this email already exists" };
      }
    }

    const updatedStaff = await db.staff.update({
      where: { id },
      data: parseValues,
    });

    return { success: "Staff updated successfully", staff: updatedStaff };
  } catch (error) {
    console.error("Error updating staff:", error);
    return { error: "Failed to update staff" };
  }
};

export const deleteStaff = async (id: string) => {
  try {
    const existingStaff = await db.staff.findFirst({
      where: { id },
    });

    if (!existingStaff) {
      return { error: "Staff not found" };
    }

    await db.staff.delete({
      where: { id },
    });

    return { success: "Staff deleted successfully" };
  } catch (error) {
    console.error("Error deleting staff:", error);
    return { error: "Failed to delete staff" };
  }
};

export const createPolicy = async (
  values: z.infer<typeof PolicyValidators>
) => {
  const parseValues = PolicyValidators.parse(values);

  try {
    // Check if there is existing policy with the same type
    const existingPolicy = await db.policies.findFirst({
      where: { type: parseValues.type },
    });

    if (existingPolicy) {
      return { error: "Policy with this type already exists" };
    }

    const policy = await db.policies.create({
      data: parseValues,
    });

    return { success: "Policy created successfully", policy };
  } catch (error) {
    console.error("Error creating policy:", error);
    return { error: "Failed to create policy" };
  }
};

export const updatePolicy = async (
  id: string,
  values: z.infer<typeof PolicyValidators>
) => {
  const parseValues = PolicyValidators.parse(values);

  try {
    const existingPolicy = await db.policies.findFirst({
      where: { id },
    });

    if (!existingPolicy) {
      return { error: "Policy not found" };
    }

    if (existingPolicy.type !== parseValues.type) {
      const duplicatePolicy = await db.policies.findFirst({
        where: { type: parseValues.type },
      });
      if (duplicatePolicy) {
        return { error: "Another policy with this type already exists" };
      }
    }

    const updatedPolicy = await db.policies.update({
      where: { id },
      data: parseValues,
    });

    return { success: "Policy updated successfully", policy: updatedPolicy };
  } catch (error) {
    console.error("Error updating policy:", error);
    return { error: "Failed to update policy" };
  }
};

export const deletePolicy = async (id: string) => {
  try {
    const existingPolicy = await db.policies.findFirst({
      where: { id },
    });

    if (!existingPolicy) {
      return { error: "Policy not found" };
    }

    await db.policies.delete({
      where: { id },
    });

    return { success: "Policy deleted successfully" };
  } catch (error) {
    console.error("Error deleting policy:", error);
    return { error: "Failed to delete policy" };
  }
};

export const getPolicyByType = async (type: string) => {
  try {
    const policy = await db.policies.findFirst({
      where: { type },
      orderBy: { updatedAt: "desc" }, // Get the most recent one if multiple exist
    });

    if (!policy) {
      return { error: "Policy not found" };
    }

    return { success: "Policy fetched successfully", data: policy };
  } catch (error) {
    console.error("Error fetching policy:", error);
    return { error: "Failed to fetch policy" };
  }
};

export const createPromotion = async (
  values: z.infer<typeof PromotionValidators>
) => {
  const parseValues = PromotionValidators.parse(values);

  try {
    const promotion = await db.promotions.create({
      data: parseValues,
    });
    return { success: "Promotion created successfully", promotion };
  } catch (error) {
    console.error("Error creating promotion:", error);
    return { error: "Failed to create promotion" };
  }
};

export const updatePromotion = async (
  id: string,
  values: z.infer<typeof PromotionValidators>
) => {
  const parseValues = PromotionValidators.parse(values);
  try {
    const existingPromotion = await db.promotions.findFirst({
      where: { id },
    });

    if (!existingPromotion) {
      return { error: "Promotion not found" };
    }

    const updatedPromotion = await db.promotions.update({
      where: { id },
      data: parseValues,
    });
    return {
      success: "Promotion updated successfully",
      promotion: updatedPromotion,
    };
  } catch (error) {
    console.error("Error updating promotion:", error);
    return { error: "Failed to update promotion" };
  }
};

export const deletePromotion = async (id: string) => {
  try {
    const existingPromotion = await db.promotions.findFirst({
      where: { id },
    });

    if (!existingPromotion) {
      return { error: "Promotion not found" };
    }

    await db.promotions.delete({
      where: { id },
    });

    return { success: "Promotion deleted successfully" };
  } catch (error) {
    console.error("Error deleting promotion:", error);
    return { error: "Failed to delete promotion" };
  }
};

export const placeOrder = async (data: {
  items: CartItem[];
  preferredSchedule: Date | null;
  customerDetails: CustomerDetails;
  deliveryOption: DeliveryOption;
  totalAmount: number;
  discountedAmount?: number;
}) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { error: "You must log in first before you checkout" };
    }

    const user = await db.users.findUnique({ where: { authId: userId } });

    if (!user) {
      return { error: "User not found" };
    }

    const fullName = `${data.customerDetails.firstName} ${data.customerDetails.lastName}`;

    // Create order
    const response = await db.order.create({
      data: {
        userId: user.id,
        totalAmount: data.totalAmount,
        discountedAmount: data.discountedAmount ?? 0,
        name: fullName,
        email: data.customerDetails.email,
        phoneNumber: data.customerDetails.phone,
        orderOption: data.deliveryOption,
        preferredDate: data.preferredSchedule || new Date(),
        remarks: data.customerDetails.remarks,
      },
    });

    // Insert order items
    await db.orderItem.createMany({
      data: data.items.map((item) => ({
        orderId: response.id,
        productId: item.id,
        quantity: item.quantity,
        price: item.unitPrice,
      })),
    });

    // Fetch order with items to return
    const orderWithItems = await db.order.findUnique({
      where: { id: response.id },
      include: {
        orderItem: {
          include: { product: { include: { brand: true } } },
        },
      },
    });

    await sendOrderCompletedEmail(
      orderWithItems as OrderWithOrderItem,
      data.customerDetails.email
    );

    return { success: "Order placed successfully", order: orderWithItems };
  } catch (error) {
    console.error("Error placing order:", error);
    return { error: "Failed to place order" };
  }
};

export const sendOrderCompletedEmail = async (
  order: OrderWithOrderItem,
  email: string
) => {
  try {
    const htmlContent = await OrderCompleteHTML({
      order,
    });

    await sendMail(
      email,
      `Your order has been completed`,
      `Your order "${order.id}" has been completed.`,
      htmlContent
    );

    return { success: "Email has been sent." };
  } catch (error) {
    console.error("Error sending product status email:", error);
    return { message: "An error occurred. Please try again." };
  }
};

export async function updateOrderStatus(orderId: string, status: string) {
  const now = new Date();

  let updateData: any = { status };

  switch (status.toUpperCase()) {
    case "PROCESSING":
      updateData.processingAt = now;
      break;
    case "SHIPPED":
      updateData.shippedAt = now;
      break;
    case "COMPLETED":
      updateData.completedAt = now;
      break;
    case "PENDING":
      updateData = {
        status,
        processingAt: null,
        shippedAt: null,
        completedAt: null,
      };
      break;
  }

  const order = await db.order.update({
    where: { id: orderId },
    data: updateData,
    include: {
      orderItem: { include: { product: { include: { brand: true } } } },
    },
  });

  // ✅ send email notification
  await sendOrderStatusEmail(order, order.email);

  return order;
}

export const sendOrderStatusEmail = async (
  order: OrderWithOrderItem,
  email: string
) => {
  try {
    const htmlContent = await OrderStatusEmailHTML({
      order,
    });

    await sendMail(
      email,
      `Your order has been ${order.status}`,
      `Your order "${order.id}" has been ${order.status}.`,
      htmlContent
    );

    return { success: "Email has been sent." };
  } catch (error) {
    console.error("Error sending product status email:", error);
    return { message: "An error occurred. Please try again." };
  }
};

export async function toggleOrderPayment(
  orderId: string,
  status: "PAID" | "FAILED"
) {
  try {
    const order = await db.order.update({
      where: { id: orderId },
      data: { paymentStatus: status },
    });

    return { success: true, order };
  } catch (error) {
    console.error(error);
    return { error: "Failed to update payment status" };
  }
}

export const deleteOrder = async (id: string) => {
  try {
    const existingOrder = await db.order.findFirst({
      where: { id },
    });

    if (!existingOrder) {
      return { error: "Order not found" };
    }

    await db.order.delete({
      where: { id },
    });

    await db.orderItem.deleteMany({
      where: { orderId: id },
    });

    return { success: "Order deleted successfully" };
  } catch (error) {
    console.error("Error deleting order:", error);
    return { error: "Failed to delete order" };
  }
};

// Archive orders manually (for admin use)
export const archiveOrdersManually = async () => {
  try {
    // Import the function dynamically to avoid circular dependencies
    const cronModule = await import("@/lib/cron");
    if (typeof cronModule.archiveOldOrders === "function") {
      await cronModule.archiveOldOrders();
      return { success: "Orders archived successfully" };
    } else {
      return { error: "Archive function not available" };
    }
  } catch (error) {
    console.error("Error manually archiving orders:", error);
    return { error: "Failed to archive orders" };
  }
};

// Get archived orders count
export const getArchivedOrdersCount = async () => {
  try {
    const count = await db.order.count({
      where: {
        isArchived: true,
      },
    });

    return { success: true, count };
  } catch (error) {
    console.error("Error getting archived orders count:", error);
    return { error: "Failed to get archived orders count" };
  }
};

// Get orders that will be archived soon (within 7 days)
export const getOrdersToArchiveSoon = async () => {
  try {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const orders = await db.order.count({
      where: {
        isArchived: false,
        createdAt: {
          gte: thirtyDaysAgo,
          lt: sevenDaysFromNow,
        },
      },
    });

    return { success: true, count: orders };
  } catch (error) {
    console.error("Error getting orders to archive soon:", error);
    return { error: "Failed to get orders to archive soon" };
  }
};

// Get order by ID and email for tracking (public access)
export const getOrderForTracking = async (orderId: string, email: string) => {
  try {
    const order = await db.order.findFirst({
      where: {
        id: orderId,
        email: email.toLowerCase().trim(),
      },
      include: {
        orderItem: {
          include: {
            product: {
              include: {
                brand: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return {
        error: "Order not found. Please check your order ID and email.",
      };
    }

    return { success: "Order found", data: order };
  } catch (error) {
    console.error("Error fetching order for tracking:", error);
    return { error: "Failed to fetch order. Please try again." };
  }
};

// Get all orders for the current logged-in user
export const getUserOrders = async () => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { error: "You must be logged in to view your orders" };
    }

    // Find user in database
    const user = await db.users.findUnique({ where: { authId: userId } });

    if (!user) {
      return { error: "User not found" };
    }

    // Fetch all orders for this user
    const orders = await db.order.findMany({
      where: {
        userId: user.id,
        isArchived: false, // Only show active orders
      },
      orderBy: {
        createdAt: "desc", // Most recent first
      },
      include: {
        orderItem: {
          include: {
            product: {
              include: {
                brand: true,
              },
            },
          },
        },
      },
    });

    return { success: "Orders fetched successfully", data: orders };
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return { error: "Failed to fetch orders. Please try again." };
  }
};

export async function rejectOrder(orderId: string, reason: string) {
  try {
    const order = await db.order.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED",
        paymentStatus: "FAILED",
        reasonCancelled: reason,
        cancelledAt: new Date(),
      },
      include: {
        orderItem: {
          include: {
            product: {
              include: { brand: true },
            },
          },
        },
      },
    });

    await sendOrderRejectionEmail(order, order.email);

    return { success: true, order };
  } catch (error) {
    console.error(error);
    return { error: "Failed to reject order" };
  }
}

export const sendOrderRejectionEmail = async (
  order: OrderWithOrderItem,
  email: string
) => {
  try {
    const htmlContent = await OrderRejectionEmailHTML({
      order,
    });

    await sendMail(
      email,
      `Your order has been REJECTED`,
      `Your order "${order.id}" has been rejected. Reason: ${order.reasonCancelled}`,
      htmlContent
    );

    return { success: "Email has been sent." };
  } catch (error) {
    console.error("Error sending product status email:", error);
    return { message: "An error occurred. Please try again." };
  }
};

export async function cancelOrder(orderId: string, reason: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { error: "Unauthorized" };
    }

    // Find user in database
    const user = await db.users.findUnique({
      where: { authId: userId },
    });

    if (!user) {
      return { error: "User not found" };
    }

    // Get the order and verify ownership and status
    const order = await db.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return { error: "Order not found" };
    }

    // Verify the order belongs to the current user
    if (order.userId !== user.id) {
      return { error: "Unauthorized - You can only cancel your own orders" };
    }

    // Only allow cancellation of PENDING orders
    if (order.status !== "PENDING") {
      return { error: "Only pending orders can be cancelled" };
    }

    // Update the order with cancellation details
    const cancelledOrder = await db.order.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED",
        reasonCancelled: reason,
        cancelledAt: new Date(),
      },
      include: {
        orderItem: {
          include: {
            product: {
              include: { brand: true },
            },
          },
        },
      },
    });

    // Send cancellation confirmation email
    await sendOrderCancellationEmail(cancelledOrder, order.email);

    return { success: "Order cancelled successfully", order: cancelledOrder };
  } catch (error) {
    console.error("Error cancelling order:", error);
    return { error: "Failed to cancel order" };
  }
}

export const sendOrderCancellationEmail = async (
  order: OrderWithOrderItem,
  email: string
) => {
  try {
    const htmlContent = await OrderCancellationEmailHTML({
      order,
    });

    await sendMail(
      email,
      `Your order has been CANCELLED`,
      `Your order "${order.id}" has been cancelled. Reason: ${order.reasonCancelled}`,
      htmlContent
    );

    return { success: "Email has been sent." };
  } catch (error) {
    console.error("Error sending cancellation email:", error);
    return { message: "An error occurred. Please try again." };
  }
};

// CarMake CRUD
export const createCarMake = async (
  values: z.infer<typeof CarMakeValidators>
) => {
  const parseValues = CarMakeValidators.parse(values);

  try {
    const existingCarMake = await db.carMake.findFirst({
      where: { name: parseValues.name },
    });

    if (existingCarMake) {
      return { error: "Car make with this name already exists" };
    }

    const carMake = await db.carMake.create({
      data: parseValues,
    });

    return { success: "Car make created successfully", carMake };
  } catch (error) {
    console.error("Error creating car make:", error);
    return { error: "Failed to create car make" };
  }
};

export const updateCarMake = async (
  id: string,
  values: z.infer<typeof CarMakeValidators>
) => {
  const parseValues = CarMakeValidators.parse(values);

  try {
    const existingCarMake = await db.carMake.findFirst({
      where: { id },
    });

    if (!existingCarMake) {
      return { error: "Car make not found" };
    }

    if (existingCarMake.name !== parseValues.name) {
      const duplicateCarMake = await db.carMake.findFirst({
        where: { name: parseValues.name },
      });

      if (duplicateCarMake) {
        return { error: "Another car make with this name already exists" };
      }
    }

    const updatedCarMake = await db.carMake.update({
      where: { id },
      data: parseValues,
    });

    return {
      success: "Car make updated successfully",
      carMake: updatedCarMake,
    };
  } catch (error) {
    console.error("Error updating car make:", error);
    return { error: "Failed to update car make" };
  }
};

export const deleteCarMake = async (id: string) => {
  try {
    const existingCarMake = await db.carMake.findFirst({
      where: { id },
    });

    if (!existingCarMake) {
      return { error: "Car make not found" };
    }

    await db.carMake.delete({
      where: { id },
    });

    return { success: "Car make deleted successfully" };
  } catch (error) {
    console.error("Error deleting car make:", error);
    return { error: "Failed to delete car make" };
  }
};

// CarModel CRUD
export const createCarModel = async (
  values: z.infer<typeof CarModelValidators>
) => {
  const parseValues = CarModelValidators.parse(values);

  try {
    const existingCarModel = await db.carModel.findFirst({
      where: {
        name: parseValues.name,
        makeId: parseValues.makeId,
      },
    });

    if (existingCarModel) {
      return { error: "Car model with this name already exists for this make" };
    }

    const carModel = await db.carModel.create({
      data: parseValues,
    });

    return { success: "Car model created successfully", carModel };
  } catch (error) {
    console.error("Error creating car model:", error);
    return { error: "Failed to create car model" };
  }
};

export const updateCarModel = async (
  id: string,
  values: z.infer<typeof CarModelValidators>
) => {
  const parseValues = CarModelValidators.parse(values);
  try {
    const existingCarModel = await db.carModel.findFirst({
      where: { id },
    });

    if (!existingCarModel) {
      return { error: "Car model not found" };
    }

    if (
      existingCarModel.name !== parseValues.name ||
      existingCarModel.makeId !== parseValues.makeId
    ) {
      const duplicateCarModel = await db.carModel.findFirst({
        where: {
          name: parseValues.name,
          makeId: parseValues.makeId,
        },
      });

      if (duplicateCarModel) {
        return {
          error:
            "Another car model with this name already exists for this make",
        };
      }
    }

    const updatedCarModel = await db.carModel.update({
      where: { id },
      data: parseValues,
    });

    return {
      success: "Car model updated successfully",
      carModel: updatedCarModel,
    };
  } catch (error) {
    console.error("Error updating car model:", error);
    return { error: "Failed to update car model" };
  }
};

export const deleteCarModel = async (id: string) => {
  try {
    const existingCarModel = await db.carModel.findFirst({
      where: { id },
    });

    if (!existingCarModel) {
      return { error: "Car model not found" };
    }

    await db.carModel.delete({
      where: { id },
    });

    return { success: "Car model deleted successfully" };
  } catch (error) {
    console.error("Error deleting car model:", error);
    return { error: "Failed to delete car model" };
  }
};

// TireSize CRUD
export const createTireSize = async (
  values: z.infer<typeof TireSizeValidators>
) => {
  const parseValues = TireSizeValidators.parse(values);

  try {
    const existingTireSize = await db.tireSize.findFirst({
      where: {
        width: parseValues.width,
        ratio: parseValues.ratio,
        diameter: parseValues.diameter,
      },
    });

    if (existingTireSize) {
      return {
        error: "Tire size with these specifications already exists",
      };
    }

    const tireSize = await db.tireSize.create({
      data: parseValues,
    });

    return { success: "Tire size created successfully", tireSize };
  } catch (error) {
    console.error("Error creating tire size:", error);
    return { error: "Failed to create tire size" };
  }
};

export const updateTireSize = async (
  id: string,
  values: z.infer<typeof TireSizeValidators>
) => {
  const parseValues = TireSizeValidators.parse(values);
  try {
    const existingTireSize = await db.tireSize.findFirst({
      where: { id },
    });

    if (!existingTireSize) {
      return { error: "Tire size not found" };
    }

    const duplicateTireSize = await db.tireSize.findFirst({
      where: {
        width: parseValues.width,
        ratio: parseValues.ratio,
        diameter: parseValues.diameter,
        id: { not: id },
      },
    });

    if (duplicateTireSize) {
      return {
        error: "Another tire size with these specifications already exists",
      };
    }

    const updatedTireSize = await db.tireSize.update({
      where: { id },
      data: parseValues,
    });

    return {
      success: "Tire size updated successfully",
      tireSize: updatedTireSize,
    };
  } catch (error) {
    console.error("Error updating tire size:", error);
    return { error: "Failed to update tire size" };
  }
};

export const deleteTireSize = async (id: string) => {
  try {
    const existingTireSize = await db.tireSize.findFirst({
      where: { id },
    });

    if (!existingTireSize) {
      return { error: "Tire size not found" };
    }

    await db.tireSize.delete({
      where: { id },
    });

    return { success: "Tire size deleted successfully" };
  } catch (error) {
    console.error("Error deleting tire size:", error);
    return { error: "Failed to delete tire size" };
  }
};

// Get tire sizes for search (formatted as SEARCH_BY_SIZE structure)
export const getTireSizesForSearch = async () => {
  try {
    const tireSizes = await db.tireSize.findMany({
      orderBy: [{ width: "asc" }, { ratio: "asc" }, { diameter: "asc" }],
    });

    // Transform to SEARCH_BY_SIZE format: { width: { ratio: [diameters] } }
    const searchBySize: { [key: string]: { [key: string]: number[] } } = {};

    tireSizes.forEach((ts) => {
      const width = ts.width.toString();

      if (!searchBySize[width]) {
        searchBySize[width] = {};
      }

      if (ts.ratio !== null && ts.ratio !== undefined) {
        const ratio = ts.ratio.toString();
        if (!searchBySize[width][ratio]) {
          searchBySize[width][ratio] = [];
        }

        if (ts.diameter !== null && ts.diameter !== undefined) {
          if (!searchBySize[width][ratio].includes(ts.diameter)) {
            searchBySize[width][ratio].push(ts.diameter);
          }
        }
      }
    });

    // Sort diameters in each ratio
    Object.keys(searchBySize).forEach((width) => {
      Object.keys(searchBySize[width]).forEach((ratio) => {
        searchBySize[width][ratio].sort((a, b) => a - b);
      });
    });

    return { success: "Tire sizes fetched", data: searchBySize };
  } catch (error) {
    console.error("Error fetching tire sizes for search:", error);
    return { error: "Failed to fetch tire sizes" };
  }
};

// Get car makes, models, and years for search (formatted as SEARCH_BY_CAR structure)
export const getCarDataForSearch = async () => {
  try {
    const carMakes = await db.carMake.findMany({
      include: {
        models: {
          include: {
            compatibilities: true,
          },
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });

    // Transform to SEARCH_BY_CAR format: [{ make: string, models: { model: [years] } }]
    const searchByCar = carMakes.map((make) => {
      const modelsMap: { [key: string]: number[] } = {};

      make.models.forEach((model) => {
        // Get unique years from both the model's years field and product compatibilities
        const years = new Set<number>();

        // First, add years from the CarModel's years field (primary source)
        if (
          model.years &&
          Array.isArray(model.years) &&
          model.years.length > 0
        ) {
          model.years.forEach((year) => {
            years.add(year);
          });
        }

        // Then, add years from product compatibilities as a supplement
        model.compatibilities.forEach((compat) => {
          if (compat.year) {
            years.add(compat.year);
          }
        });

        // Include ALL models, even if they don't have years yet
        // This allows users to see all available models for each brand
        modelsMap[model.name] = Array.from(years).sort((a, b) => a - b);
      });

      return {
        make: make.name,
        models: modelsMap,
      };
    });

    // Show all makes, even if they don't have models with years yet
    // This allows users to see all available car makes
    return { success: "Car data fetched", data: searchByCar };
  } catch (error) {
    console.error("Error fetching car data for search:", error);
    return { error: "Failed to fetch car data" };
  }
};

// Feedback CRUD
export const submitFeedback = async (
  values: z.infer<typeof FeedbackValidators>
) => {
  const parseValues = FeedbackValidators.parse(values);

  try {
    const { userId } = await auth();

    if (!userId) {
      return { error: "You must be logged in to submit feedback" };
    }

    const user = await db.users.findUnique({ where: { authId: userId } });

    if (!user) {
      return { error: "User not found" };
    }

    const feedback = await db.feedback.create({
      data: {
        userId: user.id,
        rating: parseValues.rating,
        comment: parseValues.comment || null,
      },
    });

    return {
      success: "Feedback submitted successfully! Thank you for your input.",
      feedback,
    };
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return { error: "Failed to submit feedback" };
  }
};

// Ticket CRUD
export const updateTicket = async (
  id: string,
  values: {
    status?: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  }
) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { error: "Unauthorized" };
    }

    // Check if user is admin
    const user = await db.users.findUnique({
      where: { authId: userId },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return { error: "Forbidden - Admin access required" };
    }

    // Check if ticket exists
    const existingTicket = await db.ticket.findUnique({
      where: { id },
    });

    if (!existingTicket) {
      return { error: "Ticket not found" };
    }

    const ticket = await db.ticket.update({
      where: { id },
      data: values,
    });

    return { success: "Ticket updated successfully", ticket };
  } catch (error) {
    console.error("Error updating ticket:", error);
    return { error: "Failed to update ticket" };
  }
};

export const deleteTicket = async (id: string) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { error: "Unauthorized" };
    }

    // Check if user is admin
    const user = await db.users.findUnique({
      where: { authId: userId },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return { error: "Forbidden - Admin access required" };
    }

    // Check if ticket exists
    const ticket = await db.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return { error: "Ticket not found" };
    }

    // Delete ticket
    await db.ticket.delete({
      where: { id },
    });

    return { success: "Ticket deleted successfully" };
  } catch (error) {
    console.error("Error deleting ticket:", error);
    return { error: "Failed to delete ticket" };
  }
};

export const deleteFeedback = async (id: string) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { error: "Unauthorized" };
    }

    // Check if user is admin
    const user = await db.users.findUnique({
      where: { authId: userId },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return { error: "Forbidden - Admin access required" };
    }

    // Check if feedback exists
    const feedback = await db.feedback.findUnique({
      where: { id },
    });

    if (!feedback) {
      return { error: "Feedback not found" };
    }

    // Delete feedback
    await db.feedback.delete({
      where: { id },
    });

    return { success: "Feedback deleted successfully" };
  } catch (error) {
    console.error("Error deleting feedback:", error);
    return { error: "Failed to delete feedback" };
  }
};

// Get feedback for testimonials (public access - no auth required)
export const getTestimonials = async () => {
  try {
    // Fetch feedback with comments and user information
    const feedbacks = await db.feedback.findMany({
      where: {
        comment: {
          not: null,
        },
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            authId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10, // Limit to 10 most recent testimonials
    });

    // Transform feedback to testimonial format
    // Fetch user images from Clerk in parallel
    const testimonialsWithImages = await Promise.all(
      feedbacks.map(async (feedback) => {
        let avatarUrl: string | null = null;

        // Try to get Clerk user image if authId exists
        if (feedback.user.authId) {
          try {
            const clerk = await clerkClient();
            const clerkUser = await clerk.users.getUser(feedback.user.authId);
            avatarUrl = clerkUser.imageUrl || null;
          } catch (error) {
            // If Clerk API fails, avatarUrl remains null
            console.error(
              `Error fetching Clerk user image for ${feedback.user.authId}:`,
              error
            );
            avatarUrl = null;
          }
        }

        // If no image from Clerk or authId is null, use fallback
        if (!avatarUrl) {
          // Generate avatar URL based on name initials (using UI Avatars service)
          avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
            `${feedback.user.firstName}+${feedback.user.lastName}`
          )}&background=c02b2b&color=fff&size=256&bold=true`;
        }

        // Create designation (without star count, as we'll show stars separately)
        const getDesignation = (rating: number) => {
          if (rating >= 4) return "Very Satisfied Customer";
          if (rating >= 3) return "Satisfied Customer";
          return "Customer";
        };

        return {
          quote: feedback.comment || "",
          name: `${feedback.user.firstName} ${feedback.user.lastName}`,
          designation: getDesignation(feedback.rating),
          rating: feedback.rating,
          src: avatarUrl,
        };
      })
    );

    return {
      success: "Testimonials fetched successfully",
      data: testimonialsWithImages,
    };
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return { error: "Failed to fetch testimonials" };
  }
};
