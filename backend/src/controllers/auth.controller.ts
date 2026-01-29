import { UserService } from "../services/user.service";
import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../dtos/user.dto";
import { Request, Response } from "express";
import z from "zod";

let userService = new UserService();
export class AuthController {
    async register(req: Request, res: Response) {
        try {
            const parsedData = CreateUserDTO.safeParse(req.body); 
            if (!parsedData.success) {
                return res.status(400).json(
                    { success: false, message: z.prettifyError(parsedData.error) }
                )
            }
            const userData: CreateUserDTO = parsedData.data;
            const newUser = await userService.createUser(userData);
            return res.status(201).json(
                { success: true, message: "User Created", data: newUser }
            );
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

    async login(req: Request, res: Response) {
        try {
            const parsedData = LoginUserDTO.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json(
                    { success: false, message: z.prettifyError(parsedData.error) }
                )
            }
            const loginData: LoginUserDTO = parsedData.data;
            const { token, user } = await userService.loginUser(loginData);
            // Ensure imageUrl is always present and also provide as profilePicture for frontend
            let userObj = user.toObject ? user.toObject() : { ...user };
            userObj.profilePicture = userObj.imageUrl || "default-profile.png";
            return res.status(200).json(
                { success: true, message: "Login successful", data: userObj, token }
            );

        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

    async getProfile(req: Request, res: Response){
        try{
            const userId = req.user?._id; //from auth middleware
            if(!userId){
                return res.status(401).json(
                    {success: false, message: "User Id Not found"}
                );
            }
            const user = await userService.getUserById(userId);
            return res.status(200).json(
                {success: true, data: user, message: "User profile fetched successfully"}
            );
        }catch(error: Error | any){
            return res.status(error.statusCode || 500).json(
                {success: false, message: error.message || "Internal Server Error"}
            );
        }
    }

    async updateProfile(req: Request, res: Response) {
        try{
            const userId = req.user?._id;
            if(!userId){
                return res.status(400).json(
                    { success: false, message: "User Id Not found" }
                );
            }
            const parsedData = UpdateUserDTO.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json(
                    { success: false, message: z.prettifyError(parsedData.error) }
                ); // z.prettifyError - better error messages (zod)
            }
            if(req.file){
                parsedData.data.imageUrl = req.file.filename;
            } else if (!parsedData.data.imageUrl) {
                parsedData.data.imageUrl = "default-profile.png";
            }
            const updatedUser = await userService.updateUser(userId, parsedData.data);
            return res.status(200).json(
                { success: true, data: updatedUser, message: "User profile updated successfully" }
            );
        }catch(error: Error | any){
            return res.status(error.statusCode || 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

    async updateUserById(req: Request, res: Response) {
        try{
            const userId = req.params.id;
            if(!userId){
                return res.status(400).json(
                    { success: false, message: "User Id Not found" }
                );
            }
            const parsedData = UpdateUserDTO.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json(
                    { success: false, message: z.prettifyError(parsedData.error) }
                );
            }
            if(req.file){
                parsedData.data.imageUrl = req.file.filename;
            } else if (!parsedData.data.imageUrl) {
                parsedData.data.imageUrl = "default-profile.png";
            }
            const updatedUser = await userService.updateUser(userId, parsedData.data);
            return res.status(200).json(
                { success: true, data: updatedUser, message: "User updated successfully" }
            );
        }catch(error: Error | any){
            return res.status(error.statusCode || 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }
    
}