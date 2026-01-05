import mongoose, { Schema, Document } from 'mongoose';

export enum RequestStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

export interface IAuthorRequest extends Document {
    user: mongoose.Types.ObjectId;
    email: string;
    phoneNumber: string;
    qualifications: string;
    reason: string;
    portfolioUrl: string;
    sampleWriting: string;
    documentUrl?: string;
    status: RequestStatus;
    createdAt: Date;
}

const authorRequestSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    qualifications: { type: String, required: true },
    reason: { type: String, required: true },
    portfolioUrl: { type: String, default: "" },
    sampleWriting: { type: String, default: "" },
    documentUrl: { type: String, default: "" },
    status: {
        type: String,
        enum: Object.values(RequestStatus),
        default: RequestStatus.PENDING
    }
}, { timestamps: true });

export const AuthorRequest = mongoose.model<IAuthorRequest>('AuthorRequest', authorRequestSchema);