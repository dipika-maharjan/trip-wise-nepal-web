import { RoomTypeRepository } from "../repositories/roomType.repository";
import { AccommodationRepository } from "../repositories/accommodation.repository";
import { CreateRoomTypeDTO, UpdateRoomTypeDTO } from "../dtos/roomType.dto";
import { HttpError } from "../errors/http-error";

const roomTypeRepository = new RoomTypeRepository();
const accommodationRepository = new AccommodationRepository();

export class RoomTypeService {
    async createRoomType(data: CreateRoomTypeDTO) {
        try {
            const accommodation = await accommodationRepository.getAccommodationById(String(data.accommodationId));
            if (!accommodation) {
                throw new HttpError(404, "Accommodation not found");
            }
            return await roomTypeRepository.createRoomType(data);
        } catch (error: Error | any) {
            if (error instanceof HttpError) throw error;
            throw new HttpError(500, error.message || "Failed to create room type");
        }
    }

    async getRoomTypeById(id: string) {
        try {
            const roomType = await roomTypeRepository.getRoomTypeById(id);
            if (!roomType) {
                throw new HttpError(404, "Room type not found");
            }
            return roomType;
        } catch (error: Error | any) {
            if (error instanceof HttpError) throw error;
            throw new HttpError(500, error.message || "Failed to fetch room type");
        }
    }

    async getRoomTypesByAccommodation(accommodationId: string, activeOnly = true) {
        try {
            return await roomTypeRepository.getRoomTypesByAccommodation(accommodationId, activeOnly);
        } catch (error: Error | any) {
            throw new HttpError(500, error.message || "Failed to fetch room types");
        }
    }

    async getAllRoomTypes() {
        try {
            return await roomTypeRepository.getAllRoomTypes();
        } catch (error: Error | any) {
            throw new HttpError(500, error.message || "Failed to fetch room types");
        }
    }

    async updateRoomType(id: string, data: UpdateRoomTypeDTO) {
        try {
            const roomType = await roomTypeRepository.getRoomTypeById(id);
            if (!roomType) {
                throw new HttpError(404, "Room type not found");
            }
            if (data.accommodationId) {
                const accommodation = await accommodationRepository.getAccommodationById(String(data.accommodationId));
                if (!accommodation) {
                    throw new HttpError(404, "Accommodation not found");
                }
            }
            return await roomTypeRepository.updateRoomType(id, data);
        } catch (error: Error | any) {
            if (error instanceof HttpError) throw error;
            throw new HttpError(500, error.message || "Failed to update room type");
        }
    }

    async deleteRoomType(id: string) {
        try {
            const roomType = await roomTypeRepository.getRoomTypeById(id);
            if (!roomType) {
                throw new HttpError(404, "Room type not found");
            }
            const isDeleted = await roomTypeRepository.deleteRoomType(id);
            if (!isDeleted) {
                throw new HttpError(500, "Failed to delete room type");
            }
            return { message: "Room type deleted successfully" };
        } catch (error: Error | any) {
            if (error instanceof HttpError) throw error;
            throw new HttpError(500, error.message || "Failed to delete room type");
        }
    }
}
