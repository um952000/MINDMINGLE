from langchain_huggingface import (
    HuggingFaceEndpoint,
    ChatHuggingFace
)

from django.conf import settings


# llm = HuggingFaceEndpoint(
#     repo_id="deepseek-ai/DeepSeek-R1",
#     task="text-generation",
#     huggingfacehub_api_token=settings.HF_TOKEN,
# )

llm = HuggingFaceEndpoint(
    repo_id="mistralai/Mixtral-8x7B-v0.1",  # ← Change this ID
    task="text-generation",
    huggingfacehub_api_token=settings.HF_TOKEN,
    max_new_tokens=512,       # Optional: control response length
    temperature=0.8,          # Optional: control creativity (0-1)
)

model = ChatHuggingFace(llm=llm)


def generate_ai_answer(doubt_title, doubt_content):

    prompt = f"""
You are an expert programming mentor.

A student asked:

Title:
{doubt_title}

Description:
{doubt_content}

Give:
1. Clear explanation
2. Step-by-step solution
3. Corrected code if needed
4. Beginner-friendly response

Do not cut any part of the answer specially at the end. Provide a complete and detailed response.
"""

    response = model.invoke(prompt)

    return response.content