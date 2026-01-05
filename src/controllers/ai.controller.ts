import { Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export const generateContent = async (req: Request, res: Response) => {
    try {
        const { text, category } = req.body;

        if (!category) {
            return res.status(400).json({ message: "Category is required for AI generation" });
        }

        const prompt = `
            You are an expert technical blog writer. 
            Create a comprehensive blog post about "${category}".
            Focus specifically on this topic/context: "${text || category}".
            
            Return the response STRICTLY as a valid JSON object without any markdown formatting (\`\`\`json).
            The JSON object must have these exact keys:
            {
                "title": "A catchy, SEO-friendly title",
                "slug": "url-friendly-slug-example",
                "excerpt": "A short engaging summary (2-3 sentences)",
                "content": "Full blog post content in Markdown format. Include headers, bold text, and code blocks where necessary."
            }
        `;

        const aiResponse = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    maxOutputTokens: 5000,
                    temperature: 0.7
                }
            },
            {
                headers: { "Content-Type": "application/json" }
            }
        );

        let generatedText = aiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        generatedText = generatedText.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsedData = JSON.parse(generatedText);

        const randomSeed = Math.floor(Math.random() * 100000);

        const imagePrompt = `professional stock photo of ${category} technology concept, modern computer screen with coding, office background, 4k resolution, cinematic lighting, photorealistic`;

        const encodedPrompt = encodeURIComponent(imagePrompt);

        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=720&nologo=true&seed=${randomSeed}&model=flux`;

        const finalResponse = {
            ...parsedData,
            coverImage: imageUrl
        };

        return res.status(200).json({
            message: "Content generated successfully",
            data: finalResponse
        });

    } catch (error: any) {
        console.error("AI Generation Error:", error);

        if (error instanceof SyntaxError) {
            return res.status(500).json({ message: "AI response was incomplete (JSON Parse Error). Try again." });
        }

        if (error.response && error.response.status === 429) {
            return res.status(429).json({
                message: "AI service is busy (Rate Limit Exceeded). Please wait 1 minute and try again."
            });
        }

        return res.status(500).json({ message: "Failed to generate content" });
    }
};