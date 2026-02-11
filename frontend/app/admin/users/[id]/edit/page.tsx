"use client";

import { useEffect, useState } from "react";
import { getUserById, updateUser } from "@/lib/api/admin/user";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Upload } from "lucide-react";
import { toast } from "react-toastify";

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    imageUrl?: string;
}

export default function UserEditPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "user",
    });

    useEffect(() => {
        if (id) {
            fetchUser();
        }
    }, [id]);

    const fetchUser = async () => {
        try {
            const response = await getUserById(id);
            if (response.success) {
                setUser(response.data);
                setFormData({
                    name: response.data.name,
                    email: response.data.email,
                    role: response.data.role,
                });
                if (response.data.imageUrl) {
                    setImagePreview(`http://localhost:5050/uploads/${response.data.imageUrl}`);
                }
            }
        } catch (err: any) {
            setError(err.message || "Failed to fetch user");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSaving(true);

        try {
            const data = new FormData();
            data.append("name", formData.name);
            data.append("email", formData.email);
            data.append("role", formData.role);

            if (imageFile) {
                data.append("image", imageFile);
            }

            const response = await updateUser(id, data);

            if (response.success) {
                toast.success("User updated successfully");
                router.push(`/admin/users/${id}`);
            }
        } catch (err: any) {
            setError(err.message || "Failed to update user");
            toast.error(err.message || "Failed to update user");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="text-center py-10">Loading user...</div>;
    }

    if (error && !user) {
        return (
            <div className="space-y-4">
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                    {error}
                </div>
                <Link
                    href="/admin/users"
                    className="inline-flex items-center gap-2 text-[#0c7272] hover:underline"
                >
                    <ArrowLeft size={16} />
                    Back to Users
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <Link
                href={`/admin/users/${id}`}
                className="inline-flex items-center gap-2 text-[#0c7272] hover:underline"
            >
                <ArrowLeft size={16} />
                Back to User
            </Link>

            {/* Edit Form */}
            <div className="bg-white rounded-lg shadow p-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit User: {user?.name}</h1>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Profile Image */}
                    <div className="flex flex-col items-center">
                        <div className="relative">
                            <img
                                src={imagePreview || `http://localhost:5050/uploads/default-profile.png`}
                                alt="Profile"
                                className="w-32 h-32 rounded-full object-cover border-4 border-[#0c7272]"
                            />
                            <label
                                htmlFor="image-upload"
                                className="absolute bottom-0 right-0 bg-[#0c7272] text-white p-2 rounded-full cursor-pointer hover:bg-[#0a5555] transition"
                            >
                                <Upload size={20} />
                                <input
                                    id="image-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">Click the icon to upload a new image</p>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c7272]"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c7272]"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Role
                            </label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c7272]"
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 px-6 py-3 bg-[#0c7272] text-white rounded-lg hover:bg-[#0a5555] transition disabled:opacity-50"
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                        <Link
                            href={`/admin/users/${id}`}
                            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-center"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}