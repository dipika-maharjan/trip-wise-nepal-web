import z from "zod";
import { OptionalExtraSchema } from "../types/optionalExtra.type";

export const CreateOptionalExtraDTO = OptionalExtraSchema.pick({
    accommodationId: true,
    name: true,
    description: true,
    price: true,
    priceType: true,
    isActive: true,
});

export type CreateOptionalExtraDTO = z.infer<typeof CreateOptionalExtraDTO>;

export const UpdateOptionalExtraDTO = OptionalExtraSchema.partial();
export type UpdateOptionalExtraDTO = z.infer<typeof UpdateOptionalExtraDTO>;
