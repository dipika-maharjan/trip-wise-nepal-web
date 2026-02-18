import z from "zod";

export const UpdateReviewDTO = z.object({
	rating: z.number().min(1).max(5).optional(),
	comment: z.string().min(1, "Comment is required").optional(),
});

export type UpdateReviewDTO = z.infer<typeof UpdateReviewDTO>;