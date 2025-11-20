from __future__ import unicode_literals

import os
import json
from functools import lru_cache

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib.auth import login
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.http import JsonResponse

from dotenv import load_dotenv
from openai import OpenAI

from django.http import JsonResponse
from .mongo import db

from .math_engine import solve_equation, check_equation_equivalence, classify_common_error

from algebra_alchemy.llm_question_generator import generate_new_question_from_examples


load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))



GEN_SCHEMA = """
You are an Algebra problem generator.  
Output STRICT JSON ONLY.  

Required schema:
{
  "categoryId": "...",
  "categoryName": "...",
  "questionType": "...",
  "questionTypeLabel": "...",
  "wordProblem": "...",
  "prompt": "...",
  "equation": "...",
  "solution": {
    "answer": "...",
    "answerNumeric": number,
    "steps": ["...", "..."]
  },
  "kcTags": ["tag1", "tag2"],
  "dfTargets": ["DF1", "DF2"],
  "difficulty": 1
}

Rules:
- DO NOT include _id
- DO NOT include givenEquation
- Steps must be valid algebra
- difficulty is 1–3
- JSON only, no explanation.
"""

def fetch_example_questions(category, k=3):
    """Pull 3 examples from Mongo to use in prompt."""
    examples = list(db["questions"].find(
        {"categoryId": category},
        {"_id": 0}
    ).limit(k))

    return examples


def generate_question_from_examples(category, difficulty):
    examples = fetch_example_questions(category)

    msg_examples = json.dumps(examples, indent=2)

    user_prompt = f"""
Here are example questions from category '{category}':

{msg_examples}

Now create ONE new question matching the same style and structure.
Difficulty: {difficulty}

Return ONLY JSON following the required schema.
"""

    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": GEN_SCHEMA},
            {"role": "user", "content": user_prompt}
        ],
        max_tokens=250
    )

    raw = resp.choices[0].message.content.strip()

    try:
        data = json.loads(raw)
    except Exception:
        return None  # let the view handle error gracefully

    return data



@csrf_exempt
def generate_question_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=400)

    try:
        category = request.POST.get("category", "solving_for_x")
        difficulty = int(request.POST.get("difficulty", 1))

        print("➡️ Category:", category)
        print("➡️ Difficulty:", difficulty)

        # Use the CORRECT generator (from examples)
        from .views import generate_question_from_examples
        new_q = generate_question_from_examples(category, difficulty)

        if new_q is None:
            return JsonResponse({"error": "LLM failed to create valid JSON"}, status=500)

        # Ensure no _id before insertion
        new_q.pop("_id", None)

        inserted = db["questions"].insert_one(new_q)

        return JsonResponse({
            "status": "ok",
            "inserted_id": str(inserted.inserted_id),
            "question": new_q
        })

    except Exception as e:
        print("❌ ERROR:", e)
        return JsonResponse({"error": str(e)}, status=500)



def render_question_gen_page(request):
    return render(request, "question_generator.html")

def get_questions_by_difficulty(request, level):
    docs = list(db["questions"].find({"difficulty": int(level)}, {"_id": 0}))
    return JsonResponse({"problems": docs})

def get_questions_by_type(request, q_type):
    docs = list(db["questions"].find({"questionType": q_type}, {"_id": 0}))
    return JsonResponse({"problems": docs})


def get_questions_by_category(request, category_id):
    docs = list(db["questions"].find({"categoryId": category_id}, {"_id": 0}))
    return JsonResponse({"problems": docs})

def get_all_questions(request):
    docs = list(db["questions"].find({}, {"_id": 0}))
    return JsonResponse({"problems": docs})

def isolating_problems(request):
    problems = list(db["questions"].find({}, {"_id": 0}))
    return JsonResponse({"problems": problems})


def sendmessage(request):
    if request.method == "POST":
        user = request.user
        participant = get_or_create_participant(user)

        mode = participant.mode
        studentmessage = request.POST["message"]

        # Branch on mode
        if mode == "tutor_asks":
            return handle_tutor_mode(request, participant, studentmessage)
        else:
            return handle_student_mode(request, participant, studentmessage)

def tutor_dashboard(request):
    # client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    return render(request, "tutor.html", {"active_page": "learn"})


def current_progress(request):
    return render(request, "current_progress.html", {"active_page": "progress"})


def learning_graph(request):
    return render(request, "learning_graph.html", {"active_page": "graph"})


def calendar_view(request):
    return render(request, "calendar.html", {"active_page": "calendar"})

# question answer handlers:
@csrf_exempt
def check_answer(request):
    data = json.loads(request.body)
    question_type = data.get("questionType")
    student = data.get("studentAnswer")
    correct = data.get("correctAnswer")  # from Mongo
    equation = data.get("givenEquation")

    # --- Translation Type (text → equation) ---
    if question_type == "translate":
        is_correct = check_equation_equivalence(student, correct)
        return JsonResponse({
            "isCorrect": is_correct,
            "errorType": None if is_correct else "translation_mismatch",
            "hint": None if is_correct else "Your equation isn’t equivalent. Check signs and operations."
        })

    # --- Solve Equation ---
    if question_type == "solve_equation":
        try:
            student_sol = solve_equation(student)
            correct_sol = solve_equation(correct)

            is_correct = student_sol == correct_sol

            return JsonResponse({
                "isCorrect": is_correct,
                "studentSolution": str(student_sol),
                "correctSolution": str(correct_sol),
                "hint": None if is_correct else "Your solution does not solve the equation correctly."
            })
        except Exception as e:
            return JsonResponse({
                "isCorrect": False,
                "errorType": "invalid_equation",
                "hint": "Your equation cannot be parsed. Check parentheses and syntax."
            })

    # --- Isolating X Terms (equation transformation) ---
    if question_type == "isolation":
        is_correct = check_equation_equivalence(student, correct)
        classification = None if is_correct else classify_common_error(student, correct)

        return JsonResponse({
            "isCorrect": is_correct,
            "errorType": classification,
            "hint": error_hint(classification)
        })

    return JsonResponse({"error": "Unsupported question type"}, status=400)

def error_hint(errorType):
    hints = {
        "sign_error": "When you move a term across the equals sign, its sign flips.",
        "distribution_error": "Be sure to distribute the coefficient across each term inside the parentheses.",
        "inverse_operation_error": "Use inverse operations: if the equation divides by 5, multiply both sides by 5.",
        "translation_mismatch": "Check if the verbal sentence matches the algebraic structure you wrote.",
    }
    return hints.get(errorType, "Check your steps carefully.")


@csrf_exempt
def check_answer(request):
    data = json.loads(request.body)

    qtype = data.get("questionType")  # "expression"
    student = data.get("studentAnswer", "")
    correct = data.get("correctAnswer", "")

    from sympy import Eq, simplify
    from sympy.parsing.sympy_parser import parse_expr        

    try:
        # Parse equations
        left_s, right_s = student.split("=")
        left_c, right_c = correct.split("=")

        eq_student = Eq(parse_expr(left_s), parse_expr(right_s))
        eq_correct = Eq(parse_expr(left_c), parse_expr(right_c))

        # SymPy determines equivalence
        is_correct = simplify(eq_student.lhs - eq_student.rhs) == \
                     simplify(eq_correct.lhs - eq_correct.rhs)

    except Exception as e:
        is_correct = False

    if is_correct:
        return JsonResponse({"isCorrect": True})

    # ❌ Wrong → ask GPT for hint
    hint = generate_hint(student, correct)
    return JsonResponse({"isCorrect": False, "hint": hint})

def generate_hint(student, correct):
    prompt = f"""
    A middle-school student wrote this algebraic equation:

    Student: {student}
    Correct equation: {correct}

    Explain the smallest mistake they made.
    Give ONE short hint, not the solution.
    """

    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=60,
    )

    return resp.choices[0].message.content.strip()

