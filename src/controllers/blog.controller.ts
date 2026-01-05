import { Request, Response } from 'express';
import {Blog, BlogCategory, BlogStatus} from "../models/blog.model";
import {AuthRequest} from "../middlewares/auth";

export const createBlog = async (req: AuthRequest, res: Response) => {
    try {
        const { title, slug, excerpt, coverImage, category, content, status } = req.body;

        const existingSlug = await Blog.findOne({ slug });
        if (existingSlug) {
            return res.status(400).json({ message: "This URL slug is already taken. Please change it." });
        }

        if (category && category !== "" && !Object.values(BlogCategory).includes(category)) {
            return res.status(400).json({ message: "Invalid category selected." });
        }

        if (status === BlogStatus.PUBLISHED && (!category || category === "")) {
            return res.status(400).json({ message: "Category is required for publishing." });
        }

        const newPost = new Blog({
            title,
            slug,
            excerpt,
            coverImage,

            category: category === "" ? undefined : category,

            content,
            status: status === BlogStatus.PUBLISHED ? BlogStatus.PUBLISHED : BlogStatus.DRAFT,
            author: req.user.sub
        });

        const savedPost = await newPost.save();

        const msg = savedPost.status === BlogStatus.DRAFT
            ? "Draft saved successfully"
            : "Post published successfully";

        return res.status(201).json({ message: msg, post: savedPost });

    } catch (error: any) {
        console.error("Create Post Error:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({ message: "Validation Error", error: error.message });
        }

        return res.status(500).json({ message: "Something went wrong while creating the blog.", error });
    }
};

export const updateBlog = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { title, slug, excerpt, coverImage, category, content, status } = req.body;

        const blog = await Blog.findById(id);

        if (!blog) {
            return res.status(404).json({ message: "Blog post not found." });
        }

        if (blog.author.toString() !== req.user.sub) {
            return res.status(403).json({ message: "You are not authorized to update this post." });
        }

        if (slug && slug !== blog.slug) {
            const existingSlug = await Blog.findOne({ slug });
            if (existingSlug) {
                return res.status(400).json({ message: "This URL slug is already taken. Please change it." });
            }
            blog.slug = slug;
        }

        if (category && !Object.values(BlogCategory).includes(category)) {
            return res.status(400).json({ message: "Invalid category selected." });
        }


        if (title !== undefined) blog.title = title;
        if (excerpt !== undefined) blog.excerpt = excerpt;
        if (coverImage !== undefined) blog.coverImage = coverImage;
        if (category !== undefined) blog.category = category;
        if (content !== undefined) blog.content = content;

        if (status) {
            blog.status = status === BlogStatus.PUBLISHED ? BlogStatus.PUBLISHED : BlogStatus.DRAFT;
        }

        const updatedPost = await blog.save();

        return res.status(200).json({
            message: "Post updated successfully",
            post: updatedPost
        });

    } catch (error: any) {
        console.error("Update Post Error:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({ message: "Validation Error", error: error.message });
        }

        return res.status(500).json({ message: "Something went wrong while updating the blog.", error });
    }
};

export const deleteBlog = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const blog = await Blog.findById(id);

        if (!blog) {
            return res.status(404).json({ message: "Blog post not found." });
        }

        if (blog.author.toString() !== req.user.sub) {
            return res.status(403).json({ message: "You are not authorized to delete this post." });
        }

        await blog.deleteOne();

        return res.status(200).json({ message: "Post deleted successfully" });

    } catch (error) {
        console.error("Delete Post Error:", error);
        return res.status(500).json({ message: "Something went wrong while deleting the blog.", error });
    }
};


export const getPublishedBlogs = async (req: AuthRequest, res: Response) => {
    try {
        const publishedBlogs = await Blog.find({
            author: req.user.sub,
            status: "PUBLISHED"
        })
            .sort({ createdAt: -1 })

        return res.status(200).json({
            count: publishedBlogs.length,
            data: publishedBlogs
        });

    } catch (error) {
        console.error("Get Published Blogs Error:", error);
        return res.status(500).json({ message: "Something went wrong while fetching published blogs.", error });
    }
};

export const getDraftBlogs = async (req: AuthRequest, res: Response) => {
    try {
        const draftBlogs = await Blog.find({
            author: req.user.sub,
            status: "DRAFT"
        })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: draftBlogs.length,
            data: draftBlogs
        });

    } catch (error) {
        console.error("Get Draft Blogs Error:", error);
        return res.status(500).json({ message: "Something went wrong while fetching draft blogs.", error });
    }
};

export const getBlogBySlug = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;


        const blog = await Blog.findOne({ slug }).populate("author", "fullname username profilePictureURL");

        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        blog.views += 1;

        await blog.save();

        return res.status(200).json({ data: blog });

    } catch (error) {
        console.error("Get Blog By Slug Error:", error);
        return res.status(500).json({ message: "Server Error" });
    }
};

export const getAllPostsAdmin = async (req: AuthRequest, res: Response) => {
    try {
        const posts = await Blog.find()
            .populate('author', 'fullname username')
            .sort({ createdAt: -1 });

        return res.status(200).json({ data: posts });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching posts", error });
    }
};

export const togglePostStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { type } = req.body; // 'featured' or 'blocked'

        const post = await Blog.findById(id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        if (type === 'featured') {
            post.isFeatured = !post.isFeatured;
        } else if (type === 'blocked') {
            if (post.status === BlogStatus.BLOCKED) {
                post.status = BlogStatus.PUBLISHED;
            } else {
                post.status = BlogStatus.BLOCKED;
                post.isFeatured = false;
            }
        }

        await post.save();
        return res.status(200).json({ message: "Post status updated", post });

    } catch (error) {
        return res.status(500).json({ message: "Error updating post status", error });
    }
};

export const getAllBlogs = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 9;
        const search = req.query.search as string || "";
        const category = req.query.category as string || "";
        const sort = req.query.sort as string || "latest";

        const query: any = { status: BlogStatus.PUBLISHED };

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { content: { $regex: search, $options: "i" } }
            ];
        }

        if (category && category !== "All") {
            query.category = category;
        }

        let sortOptions: any = { createdAt: -1 };
        if (sort === "views") sortOptions = { views: -1 };
        if (sort === "likes") sortOptions = { likes: -1 };
        if (sort === "oldest") sortOptions = { createdAt: 1 };

        const blogs = await Blog.find(query)
            .populate("author", "fullname username profilePictureURL")
            .sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Blog.countDocuments(query);

        return res.status(200).json({
            data: blogs,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasMore: page * limit < total
            }
        });

    } catch (error) {
        console.error("Get All Blogs Error:", error);
        return res.status(500).json({ message: "Server Error" });
    }
};

export const getCategoryCounts = async (req: Request, res: Response) => {
    try {
        const counts = await Blog.aggregate([
            { $match: { status: BlogStatus.PUBLISHED } },
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);

        const countMap: Record<string, number> = {};
        counts.forEach(c => {
            if (c._id) countMap[c._id] = c.count;
        });

        return res.status(200).json({ data: countMap });

    } catch (error) {
        console.error("Category Count Error:", error);
        return res.status(500).json({ message: "Server Error" });
    }
};


export const getBlogsByCategory = async (req: Request, res: Response) => {
    try {
        const { category } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 9;

        const query = {
            status: BlogStatus.PUBLISHED,
            category: { $regex: new RegExp(`^${category.replace(/-/g, ' ')}$`, 'i') }
        };

        const blogs = await Blog.find(query)
            .populate("author", "fullname username profilePictureURL")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Blog.countDocuments(query);

        return res.status(200).json({
            data: blogs,
            pagination: {
                total,
                page,
                limit,
                hasMore: page * limit < total
            }
        });

    } catch (error) {
        console.error("Get Blogs By Category Error:", error);
        return res.status(500).json({ message: "Server Error" });
    }
};