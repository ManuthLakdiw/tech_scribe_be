import mongoose, { Document, Schema, Model } from "mongoose";

export enum Role {
    ADMIN = "ADMIN",
    USER = "USER",
    AUTHOR = "AUTHOR"
}

export interface IUser extends Document {
    fullname: string;
    email: string;
    username: string;
    password: string;
    profilePictureURL?: string;
    color: string;
    roles: Role[];
    resetPasswordOtp?: string;
    resetPasswordExpires?: Date;
    isActive: boolean;
}


interface IUserModel extends Model<IUser> {
    findByEmail(email: string): Promise<IUser | null>;
    findByUsername(username: string): Promise<IUser | null>;
}

const userSchema: Schema = new Schema(
    {
        fullname: { type: String, required: true },
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        email: { type: String, required: true, unique: true, uppercase: false },
        profilePictureURL: { type: String, default: "" },
        color: { type: String, default: "from-indigo-500 to-purple-600" },
        roles: {
            type: [String],
            enum: Object.values(Role),
            default: [Role.USER]
        },
        resetPasswordOtp: { type: String },
        resetPasswordExpires: { type: Date },
        isActive: {
            type: Boolean,
            default: true
        },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
        },
        toObject: {
            virtuals: true
        },
    }
);

userSchema.statics.findByEmail = async function (email: string):Promise<IUser | null> {
    return this.findOne({ email });
};

userSchema.statics.findByUsername = async function (username: string):Promise<IUser | null> {
    return this.findOne({ username });
}
userSchema.virtual("shortName").get(function (this:IUser) {
    if (!this.fullname) return "";

    const names = this.fullname.trim().split(" ");

    let initials = names[0].charAt(0).toUpperCase();

    if (names.length > 1) {
        initials += names[1].charAt(0).toUpperCase();
    }

    return initials;
})


export const User = mongoose.model<IUser, IUserModel>("User", userSchema, "users")