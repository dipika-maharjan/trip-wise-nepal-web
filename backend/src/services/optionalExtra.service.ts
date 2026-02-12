import { OptionalExtraRepository } from "../repositories/optionalExtra.repository";
import { AccommodationRepository } from "../repositories/accommodation.repository";
import { CreateOptionalExtraDTO, UpdateOptionalExtraDTO } from "../dtos/optionalExtra.dto";
import { HttpError } from "../errors/http-error";

const optionalExtraRepository = new OptionalExtraRepository();
const accommodationRepository = new AccommodationRepository();

export class OptionalExtraService {
    async createOptionalExtra(data: CreateOptionalExtraDTO) {
        try {
            const accommodation = await accommodationRepository.getAccommodationById(String(data.accommodationId));
            if (!accommodation) {
                throw new HttpError(404, "Accommodation not found");
            }
            return await optionalExtraRepository.createOptionalExtra(data);
        } catch (error: Error | any) {
            if (error instanceof HttpError) throw error;
            throw new HttpError(500, error.message || "Failed to create optional extra");
        }
    }

    async getOptionalExtraById(id: string) {
        try {
            const extra = await optionalExtraRepository.getOptionalExtraById(id);
            if (!extra) {
                throw new HttpError(404, "Optional extra not found");
            }
            return extra;
        } catch (error: Error | any) {
            if (error instanceof HttpError) throw error;
            throw new HttpError(500, error.message || "Failed to fetch optional extra");
        }
    }

    async getOptionalExtrasByAccommodation(accommodationId: string, activeOnly = true) {
        try {
            return await optionalExtraRepository.getOptionalExtrasByAccommodation(accommodationId, activeOnly);
        } catch (error: Error | any) {
            throw new HttpError(500, error.message || "Failed to fetch optional extras");
        }
    }

    async getAllOptionalExtras() {
        try {
            return await optionalExtraRepository.getAllOptionalExtras();
        } catch (error: Error | any) {
            throw new HttpError(500, error.message || "Failed to fetch optional extras");
        }
    }

    async updateOptionalExtra(id: string, data: UpdateOptionalExtraDTO) {
        try {
            const extra = await optionalExtraRepository.getOptionalExtraById(id);
            if (!extra) {
                throw new HttpError(404, "Optional extra not found");
            }
            if (data.accommodationId) {
                const accommodation = await accommodationRepository.getAccommodationById(String(data.accommodationId));
                if (!accommodation) {
                    throw new HttpError(404, "Accommodation not found");
                }
            }
            return await optionalExtraRepository.updateOptionalExtra(id, data);
        } catch (error: Error | any) {
            if (error instanceof HttpError) throw error;
            throw new HttpError(500, error.message || "Failed to update optional extra");
        }
    }

    async deleteOptionalExtra(id: string) {
        try {
            const extra = await optionalExtraRepository.getOptionalExtraById(id);
            if (!extra) {
                throw new HttpError(404, "Optional extra not found");
            }
            const isDeleted = await optionalExtraRepository.deleteOptionalExtra(id);
            if (!isDeleted) {
                throw new HttpError(500, "Failed to delete optional extra");
            }
            return { message: "Optional extra deleted successfully" };
        } catch (error: Error | any) {
            if (error instanceof HttpError) throw error;
            throw new HttpError(500, error.message || "Failed to delete optional extra");
        }
    }
}
