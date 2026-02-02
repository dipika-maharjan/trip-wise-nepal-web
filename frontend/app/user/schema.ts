import z from "zod";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const updateUserSchema = z.object({
    firstName: z.string().min(2, { message: "Minimum 2 characters" }),
    lastName: z.string().min(2, { message: "Minimum 2 characters" }),
    email: z.string(),
    username: z.string().min(3, { message: "Minimum 3 characters" }),
    image: z
        .instanceof(File)
        .optional()
        .refine((file) => !file || file.size <= MAX_FILE_SIZE, {
            message: "Max file size is 5MB",
        })
        .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), {
            message: "Only .jpg, .jpeg, .png and .webp formats are supported",
        }),
})
export type UpdateUserData = z.infer<typeof updateUserSchema>;