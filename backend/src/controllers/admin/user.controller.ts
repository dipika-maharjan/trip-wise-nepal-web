import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../../dtos/user.dto";
import { Request, Response, NextFunction } from "express";
import z from "zod";
import { AdminUserService } from "../../services/admin/user.service";

let adminUserService = new AdminUserService();

export class AdminUserController {
    async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            const parsedData = CreateUserDTO.safeParse(req.body); 
            if (!parsedData.success) {
                return res.status(400).json(
                    { success: false, message: z.prettifyError(parsedData.error) }
                )
            }
            let userData: any = parsedData.data;
            if(req.file){   
                userData = { ...userData, imageUrl: `/uploads/${req.file.filename}` };
            }
            const newUser = await adminUserService.createUser(userData);
            return res.status(201).json(
                { success: true, message: "User Created", data: newUser }
            );
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

    async getAllUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const { page, size, search }: { page?: string, size?: string, search?: string } = req.query;
            const { users, pagination } = await adminUserService.getAllUsersPaginated({
                page,
                size,
                search
            });
            return res.status(200).json(
                { success: true, data: users, pagination, message: "All Users Retrieved" }
            );
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

    async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.params.id;
            const parsedData = UpdateUserDTO.safeParse(req.body); 
            if (!parsedData.success) { 
                return res.status(400).json(
                    { success: false, message: z.prettifyError(parsedData.error) }
                )
            }
            
            let updateData: any = parsedData.data;
            if(req.file){   
                updateData = { ...updateData, imageUrl: `/uploads/${req.file.filename}` };
            }
            const updatedUser = await adminUserService.updateUser(userId, updateData);
            return res.status(200).json(
                { success: true, message: "User Updated", data: updatedUser }
            );
        }
        catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

    async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.params.id;
            const deleted = await adminUserService.deleteUser(userId);
            if (!deleted) {
                return res.status(404).json(
                    { success: false, message: "User not found" }
                );
            }
            return res.status(200).json(
                { success: true, message: "User Deleted" }
            );
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

    async getUserById(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.params.id;
            const user = await adminUserService.getUserById(userId);
            return res.status(200).json(
                { success: true, data: user, message: "Single User Retrieved" }
            );
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

}