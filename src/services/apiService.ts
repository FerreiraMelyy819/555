export interface ReadingMaterial {
  originalText: string;
  storyVersion: string;
  rhymeVersion: string;
  mindMap: string;
  qaVersion: { question: string; answer: string }[];
  readingNotes: {
    summary: string;
    paragraphSummaries: string[];
    goodWordsSentences: { text: string; explanation: string }[];
    idioms: { text: string; explanation: string }[];
    mainIdea: string;
    criticalThinking: { question: string; answer: string }[];
    reflectionTips: string;
  };
}

export async function processText(text: string): Promise<ReadingMaterial> {
  const response = await fetch("/api/process-text", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ text })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `服务器返回错误: ${response.status}`);
  }

  return response.json();
}
