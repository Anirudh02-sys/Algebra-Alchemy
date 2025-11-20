from __future__ import unicode_literals

import os
import json
from functools import lru_cache

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib.auth import login
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse

from dotenv import load_dotenv
from openai import OpenAI

from django.http import JsonResponse
from .mongo import db

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

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
