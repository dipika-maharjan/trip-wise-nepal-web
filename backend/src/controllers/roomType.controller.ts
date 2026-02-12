import { Request, Response } from "express";
import { RoomTypeService } from "../services/roomType.service";
import { CreateRoomTypeDTO, UpdateRoomTypeDTO } from "../dtos/roomType.dto";
import z from "zod";

const roomTypeService = new RoomTypeService();

export class RoomTypeController {
    createRoomType = async (req: Request, res: Response) => {
        try {
            const parseData = CreateRoomTypeDTO.safeParse(req.body);
            if (!parseData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(parseData.error),
                });
            }

            const roomType = await roomTypeService.createRoomType(parseData.data);
            return res.status(201).json({
                success: true,
                message: "Room type created successfully",
                data: roomType,
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to create room type",
            });
        }
    };

    getRoomTypeById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const roomType = await roomTypeService.getRoomTypeById(id);
            return res.status(200).json({ success: true, data: roomType });
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to fetch room type",
            });
        }
    };

    getRoomTypes = async (req: Request, res: Response) => {
        try {
            const { accommodationId, includeInactive } = req.query;
            if (accommodationId) {
                const roomTypes = await roomTypeService.getRoomTypesByAccommodation(
                    String(accommodationId),
                    includeInactive !== "true"
                );
                return res.status(200).json({ success: true, data: roomTypes });
            }

            const roomTypes = await roomTypeService.getAllRoomTypes();
            return res.status(200).json({ success: true, data: roomTypes });
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to fetch room types",
            });
        }
    };

    updateRoomType = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const parseData = UpdateRoomTypeDTO.safeParse(req.body);
            if (!parseData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(parseData.error),
                });
            }

            const roomType = await roomTypeService.updateRoomType(id, parseData.data);
            return res.status(200).json({
                success: true,
                message: "Room type updated successfully",
                data: roomType,
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to update room type",
            });
        }
    };

    deleteRoomType = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const result = await roomTypeService.deleteRoomType(id);
            return res.status(200).json({
                success: true,
                message: result.message,
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to delete room type",
            });
        }
    };
}
