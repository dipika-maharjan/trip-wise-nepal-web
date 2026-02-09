import { Request, Response } from "express";
import { AccommodationService } from "../services/accommodation.service";
import { CreateAccommodationDTO, UpdateAccommodationDTO } from "../dtos/accommodation.dto";
import z from "zod";

const accommodationService = new AccommodationService();

export class AccommodationController {
    async createAccommodation(req: Request, res: Response) {
        try {
            const parseData = CreateAccommodationDTO.safeParse(req.body);
            if (!parseData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(parseData.error),
                });
            }

            const adminId = (req.user as { _id?: string } | undefined)?._id;
            if (!adminId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }

            const newAccommodation = await accommodationService.createAccommodation({
                ...parseData.data,
                createdBy: adminId,
            });
            return res.status(201).json({
                success: true,
                message: "Accommodation created successfully",
                data: newAccommodation,
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal server error",
            });
        }
    }

    async getAccommodationById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const accommodation = await accommodationService.getAccommodationById(id);
            return res.status(200).json({
                success: true,
                data: accommodation,
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal server error",
            });
        }
    }

    async getAllAccommodations(req: Request, res: Response) {
        try {
            const accommodations = await accommodationService.getAllAccommodations();
            return res.status(200).json({
                success: true,
                data: accommodations,
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal server error",
            });
        }
    }

    async getActiveAccommodations(req: Request, res: Response) {
        try {
            const accommodations = await accommodationService.getActiveAccommodations();
            return res.status(200).json({
                success: true,
                data: accommodations,
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal server error",
            });
        }
    }

    async updateAccommodation(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const parseData = UpdateAccommodationDTO.safeParse(req.body);
            if (!parseData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(parseData.error),
                });
            }

            const updatedAccommodation = await accommodationService.updateAccommodation(
                id,
                parseData.data
            );
            return res.status(200).json({
                success: true,
                message: "Accommodation updated successfully",
                data: updatedAccommodation,
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal server error",
            });
        }
    }

    async deleteAccommodation(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const result = await accommodationService.deleteAccommodation(id);
            return res.status(200).json({
                success: true,
                message: result.message,
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal server error",
            });
        }
    }

    async searchAccommodations(req: Request, res: Response) {
        try {
            const { query } = req.query;
            if (!query || typeof query !== "string") {
                return res.status(400).json({
                    success: false,
                    message: "Search query is required",
                });
            }
            const results = await accommodationService.searchAccommodations(query);
            return res.status(200).json({
                success: true,
                data: results,
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal server error",
            });
        }
    }

    async getAccommodationsByPrice(req: Request, res: Response) {
        try {
            const { minPrice, maxPrice } = req.query;
            if (!minPrice || !maxPrice) {
                return res.status(400).json({
                    success: false,
                    message: "Min and max price are required",
                });
            }
            const accommodations = await accommodationService.getAccommodationsByPriceRange(
                parseFloat(minPrice as string),
                parseFloat(maxPrice as string)
            );
            return res.status(200).json({
                success: true,
                data: accommodations,
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal server error",
            });
        }
    }
}
