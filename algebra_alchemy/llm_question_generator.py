from openai import OpenAI
client = OpenAI()

import json
import re

def extract_json(raw):
    match = re.search(r"```json(.*?)```", raw, re.S)
    if match:
        raw = match.group(1)
    return raw.strip()


def generate_new_question_from_examples(category, difficulty, examples):
    example_text = "\n".join([
        f"- Q: {ex['question']}\n  A: {ex['answer']}"
        for ex in examples
    ])

    prompt = f"""
You are an expert algebra tutor.

Here are example questions and answers from our dataset:

{example_text}

Now generate 1 NEW algebra question that matches the SAME structure,
same category ({category}), and difficulty ({difficulty}).

Return STRICT JSON ONLY:

{{
  "question": "...",
  "answer": "..."
}}

DO NOT include explanations.
"""

    response = client.responses.create(
        model="gpt-4.1-mini",
        input=prompt
    )

    raw = response.output_text
    raw = extract_json(raw)
    return json.loads(raw)
