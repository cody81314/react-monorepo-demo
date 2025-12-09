export async function askMahjongRule(query: string): Promise<string> {
  // TODO: Integrate with actual Google Gemini API
  console.log('Asking Gemini:', query);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`這是關於 "${query}" 的模擬 AI 回答。\n(請實作實際的 API 串接)`);
    }, 1000);
  });
}
