import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // DeepSeek API Proxy
  app.post("/api/process-text", async (req, res) => {
    const { text } = req.body;
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "DEEPSEEK_API_KEY is not configured" });
    }

    try {
      const systemInstruction = `你是专为小学 1-2 年级孩子打造的「美文精读小老师」。
全程语言活泼童趣、口语化、无生僻字、无复杂长句、适合孩子朗读表演，100% 贴合原文，不额外超纲拓展。

你需要输出以下内容，以 JSON 格式返回：
1. originalText: 【文章朗读版】严格按照原文逐字逐句完整内容。
2. storyVersion: 【故事朗读版】用温柔讲故事口吻复述。并在正文末尾紧接着补充 2-3个本课重点生字词，格式为：“重点生字词：1. 字词(拼音)：组词 | 2. 字词(拼音)：组词”。
3. rhymeVersion: 【儿歌背诵版】提取核心知识点改编为简短押韵儿歌。
4. mindMap: 【思维导图】生成清晰简洁、层级分明的思维导图纯文本结构。要求：提取文章核心主题作为一级标题，按逻辑拆分关键要点作为二级分支，语言简短、易懂、无长句，用纯文本层级结构呈现，不添加多余解释。
5. qaVersion: 【百科问答版】5-8组一问一答，数组对象 [{question, answer}]。
6. readingNotes: 【精读笔记】包含：
   - summary: 文章主要内容概括
   - paragraphSummaries: 每个自然段内容概括 (数组)
   - goodWordsSentences: 好词好句摘抄及简单解释 (数组对象 [{text, explanation}])
   - idioms: 成语摘抄及简单解释 (数组对象 [{text, explanation}])
   - mainIdea: 中心思想或小道理
   - criticalThinking: 3个适合小朋友的思辨问题带答案 (数组对象 [{question, answer}])
   - reflectionTips: 简单读后感思路建议`;

      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: text }
          ],
          response_format: { type: "json_object" }
        })
      });

      const data = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error(data.error?.message || "No response content from DeepSeek");
      }

      let resultText = data.choices[0].message.content;
      
      // Clean up markdown code blocks if the model included them
      resultText = resultText.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
      
      res.json(JSON.parse(resultText));
    } catch (error) {
      console.error("DeepSeek API error:", error);
      res.status(500).json({ error: "Failed to process text" });
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
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
