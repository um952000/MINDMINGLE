from langchain_huggingface import (
    HuggingFaceEndpoint,
    ChatHuggingFace
)

from django.conf import settings

llm = HuggingFaceEndpoint(
    repo_id="deepseek-ai/DeepSeek-R1",  #
    task="text-generation",
    huggingfacehub_api_token=settings.HF_TOKEN,
    max_new_tokens=512,       # Optional: control response length
    temperature=0.8,          # Optional: control creativity (0-1)
)

model = ChatHuggingFace(llm=llm)


def generate_ai_answer(doubt_title, doubt_content):

    prompt = f"""
You are a knowledgeable and helpful assistant on Mind Mingle, a community platform where students and curious minds ask questions on any topic.

A user has posted the following doubt:

Title: {doubt_title}

Description: {doubt_content}

Your task:
- Provide a clear, accurate, and complete answer to the above doubt
- The topic can be anything — programming, mathematics, physics, history, geography, travel, general knowledge, life advice, etc.
- Structure your answer with proper sections if the answer is long
- Use examples wherever helpful to make concepts easier to understand
- If the question involves code, include properly formatted code snippets
- If the question is ambiguous, address the most likely interpretation and mention alternatives
- If the question is general, provide a comprehensive overview of the topic
- Keep the tone friendly, approachable, and easy to understand for a student audience
- Do NOT cut the answer short — always provide a complete response
- Do NOT say "I am an AI" or refer to yourself — just answer directly

Answer:
"""

    response = model.invoke(prompt)

    return response.content