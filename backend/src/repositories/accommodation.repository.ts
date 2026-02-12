import { ClientSession } from "mongoose";
import { AccommodationModel, IAccommodation } from "../models/accommodation.model";
import { CreateAccommodationDTO, UpdateAccommodationDTO } from "../dtos/accommodation.dto";

export class AccommodationRepository {
    async createAccommodation(
        data: CreateAccommodationDTO & { createdBy: string }
    ): Promise<IAccommodation> {
        const accommodation = new AccommodationModel(data);
        return await accommodation.save();
    }

    async getAccommodationById(id: string, session?: ClientSession): Promise<IAccommodation | null> {
        return await AccommodationModel.findById(id).session(session ?? null);
    }

    async getAllAccommodations(filter?: any): Promise<IAccommodation[]> {
        return await AccommodationModel.find(filter || {}).sort({ createdAt: -1 });
    }

    async getActiveAccommodations(): Promise<IAccommodation[]> {
        return await AccommodationModel.find({ isActive: true }).sort({ createdAt: -1 });
    }

    async updateAccommodation(
        id: string,
        data: UpdateAccommodationDTO
    ): Promise<IAccommodation | null> {
        return await AccommodationModel.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });
    }

    async deleteAccommodation(id: string): Promise<boolean> {
        const result = await AccommodationModel.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );
        return result !== null;
    }

    async searchAccommodations(query: string): Promise<IAccommodation[]> {
        return await AccommodationModel.find({
            isActive: true,
            $or: [
                { name: { $regex: query, $options: "i" } },
                { address: { $regex: query, $options: "i" } },
                { overview: { $regex: query, $options: "i" } },
            ],
        });
    }

    async getAccommodationsByPriceRange(minPrice: number, maxPrice: number): Promise<IAccommodation[]> {
        return await AccommodationModel.find({
            pricePerNight: { $gte: minPrice, $lte: maxPrice },
            isActive: true,
        });
    }
}
