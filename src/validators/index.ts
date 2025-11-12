import z from "zod";

export const BrandValidators = z.object({
  name: z.string().min(2, { message: "Name is required." }),
  description: z.string().min(10, { message: "Description is required." }),
  logo: z.string().min(1, { message: "Logo URL is required." }),
  thumbnail: z.string().min(1, { message: "Thumbnail URL is required." }),
  type: z.string().min(1, { message: "Type is required." }),
});

export const ProductValidators = z.object({
  name: z.string().min(2, { message: "Name is required." }),
  description: z.string().min(10, { message: "Description is required." }),
  price: z.number().min(0, { message: "Price must be at least 0." }).optional(),
  isClearanceSale: z.boolean().optional(),
  discountedPrice: z.number().optional(),
  images: z
    .array(z.string())
    .min(1, { message: "At least one image is required." }),
  inclusion: z.string().min(10, { message: "Inclusion details are required." }),
  warranty: z.string().min(10, { message: "Warranty details are required." }),
  tireSize: z.string().optional(),
  brandId: z.string().min(1, { message: "Brand is required." }),
  tireSizeIds: z.array(z.string()).optional(),
  tireSizePricing: z
    .array(
      z.object({
        tireSizeId: z.string().min(1, { message: "Tire size is required." }),
        price: z.number().min(0, { message: "Price must be at least 0." }),
        isClearanceSale: z.boolean().optional(),
        discountedPrice: z.number().optional(),
      })
    )
    .optional(),
  compatibilities: z
    .array(
      z.object({
        modelId: z.string().min(1, { message: "Car model is required." }),
        year: z.number().min(1900).max(2100, { message: "Invalid year." }),
      })
    )
    .optional(),
});

export const InventoryValidators = z.object({
  productId: z.string().min(2, { message: "Product is required." }),
  quantity: z.number().min(0, { message: "Quantity must be at least 0." }),
  minStock: z.number().min(0, { message: "Minimum stock must be at least 0." }),
  maxStock: z.number().optional(),
  sku: z.string().optional(),
});

export const TipsGuidesValidators = z.object({
  title: z.string().min(2, { message: "Title is required." }),
  content: z.string().min(10, { message: "Content is required." }),
  thumbnail: z.string().min(1, { message: "Thumbnail URL is required." }),
  category: z.string().min(1, { message: "Category is required." }),
});

export const FaqsValidators = z.object({
  question: z.string().min(2, { message: "Question is required." }),
  answer: z.string().min(10, { message: "Answer is required." }),
});

export const StaffValidators = z.object({
  firstName: z.string().min(2, { message: "First name is required." }),
  lastName: z.string().min(2, { message: "Last name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  role: z.string().min(2, { message: "Role is required." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
});

export const PolicyValidators = z.object({
  type: z.string().min(2, { message: "Type is required." }),
  content: z.string().min(2, { message: "Content is required." }),
});

export const SalesValidators = z.object({
  name: z.string().min(2, { message: "Name is required" }),
  description: z.string().optional(),
});

export const PromotionValidators = z.object({
  name: z.string().min(2, { message: "Name is required." }),
  description: z.string().min(10, { message: "Description is required." }),
  criteria: z.string().min(10, { message: "Criteria is required." }),
  thumbnail: z.string().min(10, { message: "Thumbnail is required." }),
  startDate: z.date(),
  endDate: z.date(),
});

export const CarMakeValidators = z.object({
  name: z.string().min(2, { message: "Name is required." }),
});

export const CarModelValidators = z.object({
  name: z.string().min(2, { message: "Name is required." }),
  makeId: z.string().min(1, { message: "Car make is required." }),
});

export const TireSizeValidators = z.object({
  width: z.number().min(1, { message: "Width must be at least 1." }),
  ratio: z.number().optional(),
  diameter: z.number().optional(),
});
