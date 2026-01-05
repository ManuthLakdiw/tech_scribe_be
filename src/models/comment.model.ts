import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
    content: string;
    author: mongoose.Types.ObjectId;
    blog: mongoose.Types.ObjectId;
    parentComment: mongoose.Types.ObjectId | null;
    replies?: IComment[];
    isApproved: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const commentSchema: Schema = new Schema(
    {
        content: {
            type: String,
            required: true,
            trim: true
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        blog: {
            type: Schema.Types.ObjectId,
            ref: 'Blog',
            required: true
        },
        parentComment: {
            type: Schema.Types.ObjectId,
            ref: 'Comment',
            default: null
        },
        isApproved: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);


export const Comment = mongoose.model<IComment>('Comment', commentSchema, "comments");