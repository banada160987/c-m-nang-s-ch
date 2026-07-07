import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Modality } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables in development
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // API constraints check
  app.post("/api/tts", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      console.log(`Generating TTS for text length: ${text.length}`);

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Kore" },
            },
          },
        },
      });

      // Fix voiceName to "Kore" as mentioned in SKILL.md
      // Actually, wait, "Kore" is an English voice. I'll just use "Aoede" or let the model pick. Let's use "Kore".

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) {
        throw new Error("No audio returned from Gemini API");
      }

      res.json({ audioBase64: base64Audio });
    } catch (error) {
      console.error("TTS Error:", error);
      res.status(500).json({ error: "Failed to generate speech" });
    }
  });

  app.post("/api/ask-ai", async (req, res) => {
    try {
      const { text, context } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const prompt = `Bạn là trợ lý AI của web đọc sách "Cẩm Nang Sách". Dưới đây là bối cảnh của cuốn sách người dùng đang đọc:\n\n${context}\n\nHãy trả lời câu hỏi sau của người dùng một cách thân thiện, ngắn gọn và hữu ích:\n\nCâu hỏi: ${text}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      res.json({ reply: response.text });
    } catch (error) {
      console.error("Ask AI Error:", error);
      res.status(500).json({ error: "Lỗi kết nối AI" });
    }
  });

  // Dictionary Tooltip
  app.post("/api/dictionary", async (req, res) => {
    try {
      const { word, context } = req.body;
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
      const prompt = `Bạn là một từ điển dành cho học sinh. Hãy giải thích ngắn gọn, dễ hiểu từ sau: "${word}". \n\nNgữ cảnh trong sách (nếu có): ${context}\n\nTrả lời ngắn gọn trong 1-2 câu.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      res.json({ definition: response.text });
    } catch (error) {
      console.error("Dictionary Error:", error);
      res.status(500).json({ error: "Lỗi kết nối AI" });
    }
  });

  // AI Mindmap Generator
  app.post("/api/generate-mindmap", async (req, res) => {
    try {
      const { context } = req.body;
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } }
      });
      
      const prompt = `Bạn là một chuyên gia vẽ sơ đồ tư duy. Hãy tóm tắt nội dung cuốn sách sau bằng cú pháp MERMAID (định dạng mindmap). 
Chỉ trả về ĐÚNG đoạn code mermaid (bắt đầu bằng chữ 'mindmap', không có dấu ngoặc kép hay markdown block \`\`\`).
Không giải thích gì thêm.
Nếu tên node có khoảng trắng, không cần dùng dấu ngoặc kép. Không dùng các ký tự đặc biệt như ngoặc đơn ( ) hay ngoặc vuông [ ] trong tên node để tránh lỗi cú pháp.

Mẫu cú pháp Mermaid chuẩn:
mindmap
  Root
    Node1
      SubNode1
    Node2

Nội dung cuốn sách:
${context}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      let mermaidCode = response.text.trim();
      // Remove markdown block if AI still includes it
      if (mermaidCode.startsWith('\`\`\`')) {
        mermaidCode = mermaidCode.replace(/^\`\`\`(mermaid)?\n?/, '').replace(/\n?\`\`\`$/, '');
      }

      res.json({ mermaid: mermaidCode });
    } catch (error) {
      console.error("Mindmap Error:", error);
      res.status(500).json({ error: "Lỗi tạo sơ đồ tư duy" });
    }
  });

  // AI Flashcards Generator
  app.post("/api/generate-flashcards", async (req, res) => {
    try {
      const { context } = req.body;
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } }
      });
      
      const prompt = `Bạn là một chuyên gia giáo dục. Hãy trích xuất từ khóa, nhân vật hoặc sự kiện quan trọng nhất từ nội dung cuốn sách sau và tạo ra 5-10 thẻ ghi nhớ (flashcard).
Trả về ĐÚNG định dạng JSON array chuẩn, không chứa markdown, không có chữ thừa.
Định dạng: [{"front": "mặt trước (câu hỏi/từ khóa)", "back": "mặt sau (câu trả lời/định nghĩa)"}]

Nội dung:
${context}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      let jsonStr = response.text.trim();
      if (jsonStr.startsWith('\`\`\`')) {
        jsonStr = jsonStr.replace(/^\`\`\`(json)?\n?/, '').replace(/\n?\`\`\`$/, '');
      }

      const flashcards = JSON.parse(jsonStr);
      res.json(flashcards);
    } catch (error) {
      console.error("Flashcard Error:", error);
      res.status(500).json({ error: "Lỗi tạo thẻ ghi nhớ" });
    }
  });

  // AI Book Matchmaker
  app.post("/api/suggest-book", async (req, res) => {
    try {
      const { age, query, booksContext } = req.body;
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } }
      });
      
      const prompt = `Bạn là một chuyên gia giáo dục và tâm lý trẻ em. Một phụ huynh/học sinh thuộc nhóm tuổi ${age} đang tìm sách với yêu cầu: "${query}".
Hãy phân tích yêu cầu này, và đối chiếu với danh sách sách hiện có dưới đây. Chọn ra 1-2 cuốn sách phù hợp nhất và giải thích ngắn gọn, thuyết phục lý do vì sao cuốn sách đó tốt cho sự phát triển của trẻ. Trả lời bằng tiếng Việt, xưng "Hệ thống" hoặc "Chuyên gia".
Danh sách sách hiện có:
${booksContext}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      res.json({ reply: response.text });
    } catch (error) {
      console.error("Suggest Book Error:", error);
      res.status(500).json({ error: "Lỗi tư vấn sách" });
    }
  });

  app.post("/api/generate-quiz", async (req, res) => {
    try {
      const { context } = req.body;
      if (!context) {
        return res.status(400).json({ error: "Context is required" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const prompt = `Dựa vào nội dung sách sau đây, hãy tạo ra đúng 3 câu hỏi trắc nghiệm để kiểm tra kiến thức người đọc.
Mỗi câu hỏi phải có 4 đáp án (A, B, C, D) và chỉ định rõ đáp án đúng.
Trả về dữ liệu dưới định dạng mảng JSON thuần túy (không có markdown).
Format yêu cầu:
[
  {
    "question": "Nội dung câu hỏi?",
    "options": ["A. Đáp án 1", "B. Đáp án 2", "C. Đáp án 3", "D. Đáp án 4"],
    "correctIndex": 0
  }
]

Nội dung sách:
${context}
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      let text = response.text || "[]";
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();

      res.json(JSON.parse(text));
    } catch (error) {
      console.error("Generate Quiz Error:", error);
      res.status(500).json({ error: "Failed to generate quiz" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve built files
    const distPath = path.join(process.cwd(), "dist");
    
    // Serve static files with proper caching
    app.use(express.static(distPath, {
      setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
          // Never cache index.html
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        } else {
          // Cache JS, CSS, images for a long time (Vite hashes filenames)
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      }
    }));
    
    // Fallback for React Router
    app.get("*", (req, res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const portNum = typeof PORT === 'string' ? parseInt(PORT, 10) : PORT;
  app.listen(portNum, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${portNum}`);
  });
}

startServer();
