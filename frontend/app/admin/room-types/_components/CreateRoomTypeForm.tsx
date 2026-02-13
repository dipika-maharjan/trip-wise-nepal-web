"use client";
import { useForm } from "react-hook-form";
import { RoomTypeData, RoomTypeSchema } from "@/app/admin/room-types/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { handleCreateRoomType } from "@/lib/actions/admin/roomType-action";
import { getActiveAccommodations } from "@/lib/api/accommodation";
import { useRouter } from "next/navigation";

interface Accommodation {
    _id: string;
    name: string;
}

export default function CreateRoomTypeForm() {
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
    const router = useRouter();

    const handleZeroFocus = (event: React.FocusEvent<HTMLInputElement>) => {
        if (event.target.value === "0") {
            event.target.value = "";
        }
    };

    const { register, handleSubmit, reset, formState: { errors } } = useForm<RoomTypeData>({
        resolver: zodResolver(RoomTypeSchema),
        defaultValues: {
            isActive: true,
            pricePerNight: 0,
            maxGuests: 0,
            totalRooms: 0,
        }
    });

    useEffect(() => {
        fetchAccommodations();
    }, []);

    const fetchAccommodations = async () => {
        try {
            const response = await getActiveAccommodations();
            if (response.success) {
                setAccommodations(Array.isArray(response.data) ? response.data : [response.data]);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to load accommodations");
        }
    };

    const onSubmit = async (data: RoomTypeData) => {
        setError(null);
        startTransition(async () => {
            try {
                const response = await handleCreateRoomType(data);

                if (!response.success) {
                    throw new Error(response.message || 'Create room type failed');
                }
                reset();
                toast.success('Room type created successfully');
                router.push('/admin/room-types');
            } catch (error: Error | any) {
                toast.error(error.message || 'Create room type failed');
                setError(error.message || 'Create room type failed');
            }
        });
    };

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
                    {errors.description && (
                        <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                    )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Price Per Night * (Rs)</label>
                        <input
                            type="number"
                            step="0.01"
                            {...register("pricePerNight", { valueAsNumber: true })}
                            placeholder="100.00"
                            onFocus={handleZeroFocus}
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
                            onFocus={handleZeroFocus}
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
                            onFocus={handleZeroFocus}
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
                    {pending ? 'Creating...' : 'Create Room Type'}
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
