# from __future__ import unicode_literals

# import os
# import json
# from functools import lru_cache

from django.shortcuts import render, redirect, get_object_or_404
# from django.contrib.auth.decorators import login_required
# from django.contrib.auth.models import User
# from django.contrib.auth import login
# from django.views.decorators.csrf import ensure_csrf_cookie
# from django.http import JsonResponse

# from dotenv import load_dotenv
# from openai import OpenAI


# load_dotenv()
# client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# def sendmessage(request):
#     if request.method == "POST":
#         user = request.user
#         participant = get_or_create_participant(user)

#         mode = participant.mode
#         studentmessage = request.POST["message"]

#         # Branch on mode
#         if mode == "tutor_asks":
#             return handle_tutor_mode(request, participant, studentmessage)
#         else:
#             return handle_student_mode(request, participant, studentmessage)

def tutor_dashboard(request):
    # client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    return render(request, "tutor.html")
