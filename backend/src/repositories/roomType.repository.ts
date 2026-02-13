import { ClientSession } from "mongoose";
import { RoomTypeModel, IRoomType } from "../models/roomType.model";
import { CreateRoomTypeDTO, UpdateRoomTypeDTO } from "../dtos/roomType.dto";

export class RoomTypeRepository {
    async createRoomType(data: CreateRoomTypeDTO): Promise<IRoomType> {
        const roomType = new RoomTypeModel(data);
        return await roomType.save();
    }

    async getRoomTypeById(id: string, session?: ClientSession): Promise<IRoomType | null> {
        return await RoomTypeModel.findById(id).session(session ?? null);
    }

    async getRoomTypesByAccommodation(accommodationId: string, activeOnly = true): Promise<IRoomType[]> {
        const filter: Record<string, any> = { accommodationId };
        if (activeOnly) {
            filter.isActive = true;
        }
        return await RoomTypeModel.find(filter).sort({ createdAt: -1 });
    }

    async getAllRoomTypes(): Promise<IRoomType[]> {
        return await RoomTypeModel.find({}).populate("accommodationId").sort({ createdAt: -1 });
    }

    async updateRoomType(id: string, data: UpdateRoomTypeDTO): Promise<IRoomType | null> {
        return await RoomTypeModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    }

    async deleteRoomType(id: string): Promise<boolean> {
        const result = await RoomTypeModel.findByIdAndUpdate(id, { isActive: false }, { new: true });
        return result !== null;
    }
}
