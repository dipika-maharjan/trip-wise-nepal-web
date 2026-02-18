import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  userId: mongoose.Types.ObjectId;
  accommodationId: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}


const ReviewSchema: Schema = new Schema<IReview>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    accommodationId: { type: mongoose.Schema.Types.ObjectId, ref: "Accommodation", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

// Indexes for uniqueness and performance
ReviewSchema.index({ userId: 1, accommodationId: 1 }, { unique: true });
ReviewSchema.index({ accommodationId: 1 });
ReviewSchema.index({ createdAt: -1 });

export const ReviewModel = mongoose.model<IReview>("Review", ReviewSchema);
