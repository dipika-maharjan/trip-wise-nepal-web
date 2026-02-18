import mongoose from "mongoose";
import z from "zod";

export const ReviewSchema = z.object({
  userId: z.union([z.string().min(1), z.instanceof(mongoose.Types.ObjectId)]),
  accommodationId: z.union([z.string().min(1), z.instanceof(mongoose.Types.ObjectId)]),
  rating: z.number().min(1).max(5),
  comment: z.string().min(1),
});

export type Review = z.infer<typeof ReviewSchema>;
