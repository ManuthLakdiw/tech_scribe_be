import { Request, Response } from 'express';
import cloudinary from './../config/cloudinary.config'
import {User} from "../models/user.model";
import bcrypt from "bcryptjs"
import {signAccessToken, signRefreshToken} from "../utils/tokens";
import {AuthRequest} from "../middlewares/auth";
import {sendEmail} from "../utils/send.email";
import {getPasswordResetTemplate} from "../templates/email.template";
import jwt from "jsonwebtoken";


export const registerUser = async (req:Request, res:Response) => {

    try {

        const {fullname, username, email, password, color} = req.body;


        const existingEmail = await User.findByEmail(email)
        if (existingEmail) {
            return res.status(409).json({ message: "Email already exists!" });
        }

        const existingUsername = await User.findByUsername(username)
        if (existingUsername) {
            return res.status(409).json({ message: "Username already taken!" });
        }

        let imageURL;

        if (req.file) {
            const result:any = await new Promise((resolve, reject) => {
                const UPLOAD_STREAM = cloudinary.uploader.upload_stream({folder: "techScribe/usersProfileImg"}, (error, result) => {
                    if (error) {
                        console.error(error);
                        reject(error);
                    } else {
                        console.log(result);
                        resolve(result);
                    }
                })
                UPLOAD_STREAM.end(req?.file?.buffer)
            })
            imageURL = result.secure_url;
        }

        const hashPassword = await bcrypt.hash(password, 10)

        const user = new User({
            fullname,
            username,
            email,
            password: hashPassword,
            color,
            profilePictureURL: imageURL
        })

        await user.save();

        res.status(201).json({
            message: "Account created successfully!",
            data: user
        })
    }catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({message: error.message});
        } else {
            console.error(error);
            res.status(500).json({message: "Something went wrong"});
        }
    }
};

export const loginUser = async (req:Request, res:Response) => {

    try {

        const {email, password} = req.body;

        const existingUser = await User.findByEmail(email)

        if (!existingUser) {
            return res.status(401).json({message: "Invalid credentials"})
        }

        const isPasswordValid = await bcrypt.compare(password, existingUser.password)

        if (!isPasswordValid) {
            return res.status(401).json({message: "Invalid credentials"})
        }

        const accessToken = signAccessToken(existingUser)
        const refreshToken = signRefreshToken(existingUser)

        res.status(200).json({
            message: "User logged in successfully!",
            accessToken,
            refreshToken,
            user: existingUser
        })

    }catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getUserProfile = async (req:AuthRequest, res:Response) => {
   try {
       if (!req.user) {
           return res.status(401).json({message: "Unauthorized"})
       }

       const user = await User.findById(req.user.sub).select("-password")
       console.log(user)

       res.status(200).json(user)
   }catch (error) {
       res.status(500).json({ message: "Internal server error" });

   }
}

export const refreshToken = async (req:Request, res:Response) => {
    try {
        const {token} = req.body
        console.log("Received Token:", token);
        if (!token) {
            return res.status(400).json({message: "No refresh token provided"})
        }

        const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string)

        const user = await User.findById(payload.sub)

        if (!user) {
            return res.status(404).json({message: "User not found"})
        }

        const accessToken = signAccessToken(user)

        res.status(200).json({accessToken})

    }catch (error:any) {
        console.error("Refresh Token Error:", error);
        res.status(500).json({message: "Internal server error"})
    }
}


export const forgotPassword = async (req:Request, res:Response) => {
    const { email } = req.body;

    try {
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetPasswordOtp = otp;
        user.resetPasswordExpires = new Date(Date.now() + 2 * 60 * 1000);
        await user.save();

        try {
            const htmlContent = getPasswordResetTemplate(otp);
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Code - TechScribe',
                html: htmlContent,
            });

            return res.status(200).json({ message: "Reset code sent to your email" });

        } catch (emailError) {
            console.log("Email failed, rolling back DB changes...");
            user.resetPasswordOtp = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
            return res.status(500).json({ message: "Email could not be sent. Please try again later." });
        }

    }catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}


export const verifyOTP = async (req: Request, res: Response) => {
    const { email, code } = req.body;

    try {
        const user = await User.findOne({
            email,
            resetPasswordOtp: code,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid code or code has expired" });
        }

        user.resetPasswordExpires = new Date(Date.now() + 5 * 60 * 1000);
        await user.save();

        return res.status(200).json({ message: "OTP Verified successfully" });

    } catch (error) {
        console.error("Verify OTP Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    const { email, code, newPassword } = req.body;

    try {

        const user = await User.findOne({
            email,
            resetPasswordOtp: code,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Session expired. Please try again." });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        user.resetPasswordOtp = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        return res.status(200).json({ message: "Password reset successfully" });

    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
    try {
        const currentUserId = req.user.sub;

        const users = await User.find({ _id: { $ne: currentUserId } })
            .select("-password -resetPasswordOtp -resetPasswordExpires")
            .sort({ createdAt: -1 });

        return res.status(200).json({ data: users });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching users", error });
    }
};

export const toggleUserStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.isActive = !user.isActive;

        await user.save();

        const statusMessage = user.isActive ? "User activated" : "User blocked";

        return res.status(200).json({ message: statusMessage, isActive: user.isActive });

    } catch (error) {
        return res.status(500).json({ message: "Error updating user status", error });
    }
};
