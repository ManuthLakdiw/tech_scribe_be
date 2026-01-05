// 👇 1. මෙතන 'express' වලින් Response එක import කරන්න
import { Request, Response } from 'express';
import { AuthRequest } from "../middlewares/auth";
import { Comment } from "../models/comment.model";


export const addComment = async (req: AuthRequest, res: Response) => {
    try {
        const { content, blogId, parentCommentId } = req.body;

        const newComment = new Comment({
            content,
            blog: blogId,
            author: req.user.sub,
            parentComment: parentCommentId || null
        });

        await newComment.save();

        await newComment.populate('author', 'fullname username profilePictureURL');

        return res.status(201).json({ message: "Comment added", comment: newComment });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error adding comment", error });
    }
};


export const getCommentsByBlog = async (req: Request, res: Response) => {
    try {
        const { blogId } = req.params;

        const comments = await Comment.find({ blog: blogId, isApproved: true })
            .populate('author', 'fullname username profilePictureURL')
            .sort({ createdAt: -1 })
            .lean();


        const commentMap: any = {};
        const roots: any[] = [];


        comments.forEach((comment: any) => {
            comment.replies = [];
            commentMap[comment._id.toString()] = comment;
        });

        comments.forEach((comment: any) => {
            if (comment.parentComment) {
                const parent = commentMap[comment.parentComment.toString()];
                if (parent) {
                    parent.replies.push(comment);
                    parent.replies.sort((a:any, b:any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                }
            } else {
                roots.push(comment);
            }
        });

        return res.status(200).json({ data: roots });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error fetching comments", error });
    }
};


export const getAllCommentsAdmin = async (req: AuthRequest, res: Response) => {
    try {
        const comments = await Comment.find()
            .populate('author', 'fullname username profilePictureURL')
            .populate('blog', 'title')
            .sort({ createdAt: -1 });

        return res.status(200).json({ data: comments });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching comments" });
    }
};

export const toggleCommentStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const comment = await Comment.findById(id);
        if (!comment) return res.status(404).json({ message: "Comment not found" });

        comment.isApproved = !comment.isApproved;
        await comment.save();

        return res.status(200).json({
            message: comment.isApproved ? "Comment Approved" : "Comment Blocked",
            comment
        });

    } catch (error) {
        return res.status(500).json({ message: "Error updating status" });
    }
};