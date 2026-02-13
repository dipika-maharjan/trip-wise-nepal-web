"use client";
import { useForm } from "react-hook-form";
import { OptionalExtraData, OptionalExtraSchema } from "@/app/admin/optional-extras/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { handleCreateOptionalExtra } from "@/lib/actions/admin/optionalExtra-action";
import { getActiveAccommodations } from "@/lib/api/accommodation";
import { useRouter } from "next/navigation";

interface Accommodation {
    _id: string;
    name: string;
}

export default function CreateOptionalExtraForm() {
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
    const router = useRouter();

    const handleZeroFocus = (event: React.FocusEvent<HTMLInputElement>) => {
        if (event.target.value === "0") {
            event.target.value = "";
        }
    };

    const { register, handleSubmit, reset, formState: { errors } } = useForm<OptionalExtraData>({
        resolver: zodResolver(OptionalExtraSchema),
        defaultValues: {
            isActive: true,
            priceType: "per_booking",
            price: 0,
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

    const onSubmit = async (data: OptionalExtraData) => {
        setError(null);
        startTransition(async () => {
            try {
                const response = await handleCreateOptionalExtra(data);

                if (!response.success) {
                    throw new Error(response.message || 'Create optional extra failed');
                }
                reset();
                toast.success('Optional extra created successfully');
                router.push('/admin/optional-extras');
            } catch (error: Error | any) {
                toast.error(error.message || 'Create optional extra failed');
                setError(error.message || 'Create optional extra failed');
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
                    <label className="block text-sm font-medium mb-2">Extra Name *</label>
                    <input
                        type="text"
                        {...register("name")}
                        placeholder="e.g., Airport Pickup, Breakfast"
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
                        placeholder="Describe this optional extra..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c7272]"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Price * (Rs)</label>
                        <input
                            type="number"
                            step="0.01"
                            {...register("price", { valueAsNumber: true })}
                            placeholder="30.00"
                            onFocus={handleZeroFocus}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c7272]"
                        />
                        {errors.price && (
                            <p className="text-sm text-red-600 mt-1">{errors.price.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Price Type *</label>
                        <select
                            {...register("priceType")}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c7272]"
                        >
                            <option value="per_booking">Per Booking</option>
                            <option value="per_person">Per Person</option>
                        </select>
                        {errors.priceType && (
                            <p className="text-sm text-red-600 mt-1">{errors.priceType.message}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                            Per Person = price × guests × nights | Per Booking = fixed price
                        </p>
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
                    {pending ? 'Creating...' : 'Create Optional Extra'}
                </button>
                <Link
                    href="/admin/optional-extras"
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                    Cancel
                </Link>
            </div>
        </form>
    );
}
