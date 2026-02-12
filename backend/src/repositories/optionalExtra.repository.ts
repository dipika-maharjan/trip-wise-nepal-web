import { ClientSession } from "mongoose";
import { OptionalExtraModel, IOptionalExtra } from "../models/optionalExtra.model";
import { CreateOptionalExtraDTO, UpdateOptionalExtraDTO } from "../dtos/optionalExtra.dto";

export class OptionalExtraRepository {
    async createOptionalExtra(data: CreateOptionalExtraDTO): Promise<IOptionalExtra> {
        const extra = new OptionalExtraModel(data);
        return await extra.save();
    }

    async getOptionalExtraById(id: string, session?: ClientSession): Promise<IOptionalExtra | null> {
        return await OptionalExtraModel.findById(id).session(session ?? null);
    }

    async getOptionalExtrasByAccommodation(accommodationId: string, activeOnly = true): Promise<IOptionalExtra[]> {
        const filter: Record<string, any> = { accommodationId };
        if (activeOnly) {
            filter.isActive = true;
        }
        return await OptionalExtraModel.find(filter).sort({ createdAt: -1 });
    }

    async getAllOptionalExtras(): Promise<IOptionalExtra[]> {
        return await OptionalExtraModel.find({}).sort({ createdAt: -1 });
    }

    async updateOptionalExtra(id: string, data: UpdateOptionalExtraDTO): Promise<IOptionalExtra | null> {
        return await OptionalExtraModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    }

    async deleteOptionalExtra(id: string): Promise<boolean> {
        const result = await OptionalExtraModel.findByIdAndUpdate(id, { isActive: false }, { new: true });
        return result !== null;
    }
}
