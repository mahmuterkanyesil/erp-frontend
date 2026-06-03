import { z } from "zod"

export const createPurchaseOrderSchema = z.object({
  supplier_id: z.string().min(1),
  warehouse_id: z.string().min(1),
  source: z.enum(["MANUAL", "ORDER"]),
  expected_at: z.string().min(1),
  notes: z.string().optional(),
})

export const addOrderLineSchema = z.object({
  material_id: z.string().min(1),
  quantity: z.coerce.number().positive(),
  unit: z.string().min(1),
  unit_price: z.string().min(1),
})

export const goodsReceiptSchema = z.object({
  notes: z.string().optional(),
  lines: z
    .array(
      z.object({
        order_line_id: z.string().min(1),
        material_id: z.string().min(1),
        quantity: z.coerce.number().positive(),
        unit: z.string().min(1),
      }),
    )
    .min(1),
})

export const createRawMaterialSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  material_type: z.enum(["plastic_granule", "additive", "packaging", "semi_finished", "other"]),
  unit: z.string().min(1),
  description: z.string().optional(),
  min_stock_level: z.coerce.number().nonnegative().optional(),
})

export const updatePreferredSupplierSchema = z.object({
  supplier_id: z.string().min(1),
})

export const updateOrderLineSchema = z.object({
  quantity: z.coerce.number().positive(),
  unit_price: z.string().min(1),
})

export const replenishStockSchema = z.object({
  quantity: z.coerce.number().positive(),
  notes: z.string().optional(),
})

export const adjustStockSchema = z.object({
  delta: z.coerce.number().refine((v) => v !== 0, { message: "delta_nonzero" }),
  reason: z.string().min(1),
})

export type CreatePurchaseOrderValues = z.infer<typeof createPurchaseOrderSchema>
export type AddOrderLineValues = z.infer<typeof addOrderLineSchema>
export type GoodsReceiptValues = z.infer<typeof goodsReceiptSchema>
export type CreateRawMaterialValues = z.infer<typeof createRawMaterialSchema>
export type UpdatePreferredSupplierValues = z.infer<typeof updatePreferredSupplierSchema>
export type UpdateOrderLineValues = z.infer<typeof updateOrderLineSchema>
export type ReplenishStockValues = z.infer<typeof replenishStockSchema>
export type AdjustStockValues = z.infer<typeof adjustStockSchema>
