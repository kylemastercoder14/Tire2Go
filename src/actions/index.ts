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
} from "@/validators";
import db from "@/lib/db";
import { InventoryResponse, OrderWithOrderItem } from "@/types";
import { getStockStatus } from "@/lib/utils";
import { CartItem, CustomerDetails, DeliveryOption } from "@/hooks/use-cart";
import { auth } from "@clerk/nextjs/server";
import { OrderCompleteHTML } from "@/components/email-template/order-complete";
import { sendMail } from "@/lib/nodemailer";

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

    const product = await db.products.create({
      data: parseValues,
    });
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

    const updatedProduct = await db.products.update({
      where: { id },
      data: parseValues,
    });
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
