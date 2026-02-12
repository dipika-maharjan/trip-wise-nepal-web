import { Request, Response } from "express";
import { OptionalExtraService } from "../services/optionalExtra.service";
import { CreateOptionalExtraDTO, UpdateOptionalExtraDTO } from "../dtos/optionalExtra.dto";
import z from "zod";

const optionalExtraService = new OptionalExtraService();

export class OptionalExtraController {
    createOptionalExtra = async (req: Request, res: Response) => {
        try {
            const parseData = CreateOptionalExtraDTO.safeParse(req.body);
            if (!parseData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(parseData.error),
                });
            }

            const extra = await optionalExtraService.createOptionalExtra(parseData.data);
            return res.status(201).json({
                success: true,
                message: "Optional extra created successfully",
                data: extra,
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to create optional extra",
            });
        }
    };

    getOptionalExtraById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const extra = await optionalExtraService.getOptionalExtraById(id);
            return res.status(200).json({ success: true, data: extra });
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to fetch optional extra",
            });
        }
    };

    getOptionalExtras = async (req: Request, res: Response) => {
        try {
            const { accommodationId, includeInactive } = req.query;
            if (accommodationId) {
                const extras = await optionalExtraService.getOptionalExtrasByAccommodation(
                    String(accommodationId),
                    includeInactive !== "true"
                );
                return res.status(200).json({ success: true, data: extras });
            }

            const extras = await optionalExtraService.getAllOptionalExtras();
            return res.status(200).json({ success: true, data: extras });
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to fetch optional extras",
            });
        }
    };

    updateOptionalExtra = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const parseData = UpdateOptionalExtraDTO.safeParse(req.body);
            if (!parseData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(parseData.error),
                });
            }

            const extra = await optionalExtraService.updateOptionalExtra(id, parseData.data);
            return res.status(200).json({
                success: true,
                message: "Optional extra updated successfully",
                data: extra,
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to update optional extra",
            });
        }
    };

    deleteOptionalExtra = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const result = await optionalExtraService.deleteOptionalExtra(id);
            return res.status(200).json({
                success: true,
                message: result.message,
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to delete optional extra",
            });
        }
    };
}
