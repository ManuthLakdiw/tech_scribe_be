import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import {AuthorRequest, RequestStatus} from "../models/author.request.model";
import cloudinary from './../config/cloudinary.config'
import {Role, User} from "../models/user.model";


export const createAuthorRequest = async (req: AuthRequest, res: Response) => {
    try {
        const {
            email,
            phoneNumber,
            qualifications,
            reason,
            portfolioUrl,
            sampleWriting
        } = req.body;

        let documentUrl = "";

        if (req.file) {
            const isImage = req.file.mimetype.startsWith('image/');
            const resourceType = isImage ? 'image' : 'raw';

            const result: any = await new Promise((resolve, reject) => {
                const UPLOAD_STREAM = cloudinary.uploader.upload_stream(
                    {
                        folder: "techScribe/author_documents",
                        resource_type: resourceType
                    },
                    (error, result) => {
                        if (error) {
                            console.error("Cloudinary Error:", error);
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    }
                );
                UPLOAD_STREAM.end(req?.file?.buffer);
            });
            documentUrl = result.secure_url;
        }

        const newRequest = new AuthorRequest({
            user: req.user.sub,
            email,
            phoneNumber,
            qualifications,
            reason,
            portfolioUrl,
            sampleWriting,
            documentUrl,
            status: RequestStatus.PENDING,
        });

        await newRequest.save();

        return res.status(201).json({
            message: "Author request submitted successfully!",
            data: newRequest
        });

    } catch (error) {
        console.error("Submission Error:", error);
        return res.status(500).json({ message: "Internal server error", error });
    }
};

export const getMyAuthorRequest = async (req: AuthRequest, res: Response) => {
    try {
        const request = await AuthorRequest.findOne({ user: req.user.sub });
        return res.status(200).json({ data: request });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching request status" });
    }
};

export const getAllRequests = async (req: AuthRequest, res: Response) => {
    try {
        const requests = await AuthorRequest.find()
            .populate('user', 'fullname username profilePictureURL email')
            .sort({ createdAt: -1 });

        return res.status(200).json({ data: requests });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching requests" });
    }
};

export const updateRequestStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const request = await AuthorRequest.findById(id);
        if (!request) return res.status(404).json({ message: "Request not found" });

        request.status = status;
        await request.save();

        if (status === RequestStatus.APPROVED) {
            await User.findByIdAndUpdate(request.user, {
                $addToSet: { roles: Role.AUTHOR }
            });
        }

        return res.status(200).json({ message: `Request ${status.toLowerCase()}`, request });

    } catch (error) {
        return res.status(500).json({ message: "Error updating request" });
    }
};

