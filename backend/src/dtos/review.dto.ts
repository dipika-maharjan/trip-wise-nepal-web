import z from "zod";

export const CreateReviewDTO = z.object({
  accommodationId: z.string().min(1, "Accommodation ID is required"),
  rating: z.number().min(1).max(5),
  comment: z.string().min(1, "Comment is required"),
});

export type CreateReviewDTO = z.infer<typeof CreateReviewDTO>;
