import { AccommodationRepository } from "../repositories/accommodation.repository";
import { CreateAccommodationDTO, UpdateAccommodationDTO } from "../dtos/accommodation.dto";
import { HttpError } from "../errors/http-error";

const accommodationRepository = new AccommodationRepository();

export class AccommodationService {
    async createAccommodation(data: CreateAccommodationDTO & { createdBy: string }) {
        try {
            const newAccommodation = await accommodationRepository.createAccommodation(data);
            return newAccommodation;
        } catch (error: Error | any) {
            throw new HttpError(500, error.message || "Failed to create accommodation");
        }
    }

    async getAccommodationById(id: string) {
        try {
            const accommodation = await accommodationRepository.getAccommodationById(id);
            if (!accommodation) {
                throw new HttpError(404, "Accommodation not found");
            }
            return accommodation;
        } catch (error: Error | any) {
            if (error instanceof HttpError) throw error;
            throw new HttpError(500, error.message || "Failed to get accommodation");
        }
    }

    async getAllAccommodations() {
        try {
            return await accommodationRepository.getAllAccommodations();
        } catch (error: Error | any) {
            throw new HttpError(500, error.message || "Failed to fetch accommodations");
        }
    }

    async getActiveAccommodations() {
        try {
            return await accommodationRepository.getActiveAccommodations();
        } catch (error: Error | any) {
            throw new HttpError(500, error.message || "Failed to fetch active accommodations");
        }
    }

    async updateAccommodation(id: string, data: UpdateAccommodationDTO) {
        try {
            const accommodation = await accommodationRepository.getAccommodationById(id);
            if (!accommodation) {
                throw new HttpError(404, "Accommodation not found");
            }
            const updatedAccommodation = await accommodationRepository.updateAccommodation(id, data);
            return updatedAccommodation;
        } catch (error: Error | any) {
            if (error instanceof HttpError) throw error;
            throw new HttpError(500, error.message || "Failed to update accommodation");
        }
    }

    async deleteAccommodation(id: string) {
        try {
            const accommodation = await accommodationRepository.getAccommodationById(id);
            if (!accommodation) {
                throw new HttpError(404, "Accommodation not found");
            }
            const isDeleted = await accommodationRepository.deleteAccommodation(id);
            if (!isDeleted) {
                throw new HttpError(500, "Failed to delete accommodation");
            }
            return { message: "Accommodation deleted successfully" };
        } catch (error: Error | any) {
            if (error instanceof HttpError) throw error;
            throw new HttpError(500, error.message || "Failed to delete accommodation");
        }
    }

    async searchAccommodations(query: string) {
        try {
            if (!query || query.trim().length === 0) {
                throw new HttpError(400, "Search query is required");
            }
            return await accommodationRepository.searchAccommodations(query);
        } catch (error: Error | any) {
            if (error instanceof HttpError) throw error;
            throw new HttpError(500, error.message || "Failed to search accommodations");
        }
    }

    async getAccommodationsByPriceRange(minPrice: number, maxPrice: number) {
        try {
            if (minPrice < 0 || maxPrice < 0) {
                throw new HttpError(400, "Price range must be positive");
            }
            if (minPrice > maxPrice) {
                throw new HttpError(400, "Min price cannot be greater than max price");
            }
            return await accommodationRepository.getAccommodationsByPriceRange(minPrice, maxPrice);
        } catch (error: Error | any) {
            if (error instanceof HttpError) throw error;
            throw new HttpError(500, error.message || "Failed to fetch accommodations by price range");
        }
    }
}
