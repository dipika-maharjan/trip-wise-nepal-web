"use client";

import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { handleUpdateProfile } from "@/lib/actions/user-action";
import { Upload, User, Mail, UserCircle } from "lucide-react";

export default function UserProfile() {
  const { user, isAuthenticated, loading, checkAuth } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
      });
      
      if (user.imageUrl) {
        const finalImageUrl = user.imageUrl.startsWith("http")
          ? user.imageUrl
          : user.imageUrl.startsWith("/")
            ? `http://localhost:5050${user.imageUrl}`
            : `http://localhost:5050/uploads/${user.imageUrl}`;
        setImagePreview(finalImageUrl);
      } else {
        setImagePreview(null);
      }
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setRemoveImage(false);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      
      if (imageFile) {
        data.append("image", imageFile);
      }
      if (removeImage) {
        data.append("removeImage", "true");
      }

      const result = await handleUpdateProfile(user._id, data);
      
      if (result.success) {
        setSuccess("Profile updated successfully!");
        setIsEditing(false);
        // Refresh auth context to get updated user data
        await checkAuth();
      } else {
        setError(result.message || "Failed to update profile");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original user data
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
      });
      
      if (user.imageUrl) {
        const finalImageUrl = user.imageUrl.startsWith("http")
          ? user.imageUrl
          : user.imageUrl.startsWith("/")
            ? `http://localhost:5050${user.imageUrl}`
            : `http://localhost:5050/uploads/${user.imageUrl}`;
        setImagePreview(finalImageUrl);
      } else {
        setImagePreview(null);
      }
    }
    setImageFile(null);
    setRemoveImage(false);
    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  if (loading) {
    return (
      <div className="text-center py-10">Loading...</div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="px-6 py-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-[#0c7272] text-white rounded-lg hover:bg-[#0a5555] transition"
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Success/Error Messages */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-600 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Profile Image */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-[#0c7272]"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-[#0c7272] bg-[#0c7272] text-white flex items-center justify-center font-bold text-5xl">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
                {isEditing && (
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
                )}
              </div>
              {isEditing && (
                <div className="mt-4 flex flex-col items-center gap-3">
                  <p className="text-sm text-gray-500">
                    Click the icon to upload a new profile picture
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => document.getElementById("image-upload")?.click()}
                      className="px-4 py-2 text-sm font-medium border border-[#0c7272] text-[#0c7272] rounded-lg hover:bg-[#0c7272]/10 transition"
                    >
                      Change Photo
                    </button>
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="px-4 py-2 text-sm font-medium border border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition"
                      >
                        Remove Photo
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 gap-6">
              {/* Full Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <User size={16} />
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c7272] disabled:bg-gray-100"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Mail size={16} />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c7272] disabled:bg-gray-100"
                  required
                />
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex gap-4 mt-8">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-[#0c7272] text-white rounded-lg hover:bg-[#0a5555] transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            )}
          </form>

          {/* Additional Info (View Mode Only) */}
          {!isEditing && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Account Type:</span>
                  <span className="ml-2 font-semibold text-gray-800">
                    {user?.role === "admin" ? "Administrator" : "User"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Member Since:</span>
                  <span className="ml-2 font-semibold text-gray-800">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
