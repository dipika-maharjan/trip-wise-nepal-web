import { z } from "zod";

// Validates login form fields
export const loginSchema = z.object({
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

//type inferred from loginSchema => automatically creates a ts type based on the schema
export type LoginData = z.infer<typeof loginSchema>;

// Validates registration form fields
export const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm Password must be at least 6 characters"),
})
//extra validation to check if password and confirmPassword match
.refine((data) => data.password === data.confirmPassword,{
    path: ["confirmPassword"],
    message: "Passwords do not match",
});

//type inferred from registerSchema
export type RegisterData = z.infer<typeof registerSchema>;