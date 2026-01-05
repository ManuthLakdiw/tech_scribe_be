import mongoose, {Schema} from "mongoose";

export enum BlogStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    BLOCKED = 'BLOCKED'
}

export enum BlogCategory {
    AI_ML = 'AI&ML',
    WEb_DEVELOPMENT = 'Web Development',
    MOBILE_DEVELOPMENT = 'Mobile Development',
    SYSTEM_DESIGN = 'System Design',
    DEVOPS = 'DevOps',
    BACKEND_DEVELOPMENT = 'Backend Development',
    FRONTEND_DEVELOPMENT = 'Frontend Development',
    DATA_SCIENCE = 'Data Science',
    DATABASE = 'Database'
}

export interface IBlog {
    title: string;
    slug: string;
    excerpt: string;
    coverImage: string;
    category: BlogCategory;
    content: string;
    author: mongoose.Types.ObjectId;
    status: BlogStatus;
    views: number;
    isFeatured?: boolean;
}

const blogSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
            required: function(this: IBlog) { return this.status === BlogStatus.PUBLISHED; }
        },
        excerpt: {
            type: String,
            trim: true,
            required: function(this: IBlog) { return this.status === BlogStatus.PUBLISHED; }
        },
        coverImage: {
            type: String,
            trim: true,
            required: function(this: IBlog) { return this.status === BlogStatus.PUBLISHED; }
        },
        content: {
            type: String,
            trim: true,
            required: function(this: IBlog) { return this.status === BlogStatus.PUBLISHED; }
        },
        category: {
            type: String,
            enum: Object.values(BlogCategory),
            required: function(this: IBlog) { return this.status === BlogStatus.PUBLISHED; }
        },

        author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        isFeatured: { type: Boolean, default: false },

        status: {
            type: String,
            enum: Object.values(BlogStatus),
            default: BlogStatus.DRAFT
        },

        views: { type: Number, default: 0 }
    },
    {
        timestamps: true,
    }
);

export const Blog = mongoose.model<IBlog>("Blog", blogSchema, "blogs")

