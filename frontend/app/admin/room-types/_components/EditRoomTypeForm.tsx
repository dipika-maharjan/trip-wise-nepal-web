"use client";
import { useForm } from "react-hook-form";
import { RoomTypeData, RoomTypeSchema } from "@/app/admin/room-types/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { handleUpdateRoomType } from "@/lib/actions/admin/roomType-action";
import { getRoomTypeById } from "@/lib/api/roomType";
import { getActiveAccommodations } from "@/lib/api/accommodation";
import { useRouter } from "next/navigation";

interface Accommodation {
    _id: string;
    name: string;
}

interface EditRoomTypeFormProps {
    roomTypeId: string;
}

export default function EditRoomTypeForm({ roomTypeId }: EditRoomTypeFormProps) {
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
    const router = useRouter();

    const { register, handleSubmit, reset, formState: { errors } } = useForm<RoomTypeData>({
        resolver: zodResolver(RoomTypeSchema),
        defaultValues: {
            pricePerNight: 0,
            maxGuests: 0,
            totalRooms: 0,
            isActive: true,
        }
    });

    useEffect(() => {
        fetchData();
    }, [roomTypeId]);

    const fetchData = async () => {
        try {
            const [roomTypeResponse, accommodationsResponse] = await Promise.all([
                getRoomTypeById(roomTypeId),
                getActiveAccommodations()
            ]);

            if (roomTypeResponse.success) {
                const roomType = roomTypeResponse.data;
                reset({
                    accommodationId: typeof roomType.accommodationId === 'object' 
                        ? roomType.accommodationId._id 
                        : roomType.accommodationId,
                    name: roomType.name,
                    description: roomType.description || '',
                    pricePerNight: Number(roomType.pricePerNight),
                    maxGuests: Number(roomType.maxGuests),
                    totalRooms: Number(roomType.totalRooms),
                    isActive: roomType.isActive,
                });
            }

            if (accommodationsResponse.success) {
                setAccommodations(
                    Array.isArray(accommodationsResponse.data) 
                        ? accommodationsResponse.data 
                        : [accommodationsResponse.data]
                );
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to load room type");
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: RoomTypeData) => {
        setError(null);
        startTransition(async () => {
            try {
                const response = await handleUpdateRoomType(roomTypeId, data);

                if (!response.success) {
                    throw new Error(response.message || 'Update room type failed');
                }
                toast.success('Room type updated successfully');
                router.push('/admin/room-types');
            } catch (error: Error | any) {
                toast.error(error.message || 'Update room type failed');
                setError(error.message || 'Update room type failed');
            }
        });
    };

    if (loading) {
        return <div className="text-center py-10">Loading room type...</div>;
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Accommodation *</label>
                    <select
                        {...register("accommodationId")}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c7272]"
                    >
                        <option value="">Select Accommodation</option>
                        {accommodations.map((accommodation) => (
                            <option key={accommodation._id} value={accommodation._id}>
                                {accommodation.name}
                            </option>
                        ))}
                    </select>
                    {errors.accommodationId && (
                        <p className="text-sm text-red-600 mt-1">{errors.accommodationId.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Room Type Name *</label>
                    <input
                        type="text"
                        {...register("name")}
                        placeholder="e.g., Deluxe Room, Suite"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c7272]"
                    />
                    {errors.name && (
                        <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                        {...register("description")}
                        rows={3}
                        placeholder="Describe the room type features..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c7272]"
                    />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Price Per Night * (Rs)</label>
                        <input
                            type="number"
                            step="0.01"
                            {...register("pricePerNight", { valueAsNumber: true })}
                            placeholder="100.00"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c7272]"
                        />
                        {errors.pricePerNight && (
                            <p className="text-sm text-red-600 mt-1">{errors.pricePerNight.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Max Guests *</label>
                        <input
                            type="number"
                            {...register("maxGuests", { valueAsNumber: true })}
                            placeholder="2"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c7272]"
                        />
                        {errors.maxGuests && (
                            <p className="text-sm text-red-600 mt-1">{errors.maxGuests.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Total Rooms *</label>
                        <input
                            type="number"
                            {...register("totalRooms", { valueAsNumber: true })}
                            placeholder="10"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c7272]"
                        />
                        {errors.totalRooms && (
                            <p className="text-sm text-red-600 mt-1">{errors.totalRooms.message}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        {...register("isActive")}
                        className="w-4 h-4 text-[#0c7272] border-gray-300 rounded focus:ring-[#0c7272]"
                    />
                    <label className="text-sm font-medium">Active</label>
                </div>
            </div>

            <div className="flex gap-4">
                <button
                    type="submit"
                    disabled={pending}
                    className="px-6 py-2 bg-[#0c7272] text-white rounded-lg hover:bg-[#0a5555] transition disabled:opacity-50"
                >
                    {pending ? 'Updating...' : 'Update Room Type'}
                </button>
                <Link
                    href="/admin/room-types"
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                    Cancel
                </Link>
            </div>
        </form>
    );
}
