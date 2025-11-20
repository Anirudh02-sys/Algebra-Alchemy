from __future__ import unicode_literals

import os
import json
from datetime import datetime
from functools import lru_cache

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib.auth import login
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

from dotenv import load_dotenv
from openai import OpenAI

from django.http import JsonResponse
from .mongo import db
from .question_generator import QuestionGenerator

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
question_gen = QuestionGenerator()


# ==================== EXISTING VIEWS ====================

def get_questions_by_difficulty(request, level):
    """Get questions from database by difficulty level"""
    docs = list(db["questions"].find({"difficulty": int(level)}, {"_id": 0}))
    return JsonResponse({"problems": docs})


def get_questions_by_type(request, q_type):
    """Get questions from database by type"""
    docs = list(db["questions"].find({"questionType": q_type}, {"_id": 0}))
    return JsonResponse({"problems": docs})


def get_questions_by_category(request, category_id):
    """Get questions from database by category"""
    docs = list(db["questions"].find({"categoryId": category_id}, {"_id": 0}))
    return JsonResponse({"problems": docs})


def get_all_questions(request):
    """Get all questions from database"""
    docs = list(db["questions"].find({}, {"_id": 0}))
    return JsonResponse({"problems": docs})


def isolating_problems(request):
    """Get isolating problems"""
    problems = list(db["questions"].find({}, {"_id": 0}))
    return JsonResponse({"problems": problems})


def tutor_dashboard(request):
    """Main tutor dashboard view"""
    return render(request, "tutor.html", {"active_page": "learn"})


def current_progress(request):
    """Current progress view"""
    user_id = str(request.user.id) if request.user.is_authenticated else "guest"
    stats = question_gen.get_performance_stats(user_id)
    return render(request, "current_progress.html", {
        "active_page": "progress",
        "stats": stats
    })


def learning_graph(request):
    """Learning graph view"""
    return render(request, "learning_graph.html", {"active_page": "graph"})


def calendar_view(request):
    """Calendar view"""
    return render(request, "calendar.html", {"active_page": "calendar"})


def question_generator_view(request):
    """UI for generating practice questions"""
    categories = [
        ("solving_for_x", "Solving for X"),
        ("reducing_fractions", "Reducing Fractions"),
        ("isolating_x_terms", "Isolating X-Terms"),
    ]
    question_types = [
        ("solve_equation", "Solve Equation"),
        ("word_problem", "Word Problem"),
        ("translate", "Translate Expression"),
    ]
    difficulty_levels = [
        (1, "Level 1 - Beginner"),
        (2, "Level 2 - Intermediate"),
        (3, "Level 3 - Advanced"),
    ]

    return render(
        request,
        "question_generator.html",
        {
            "active_page": "generator",
            "categories": categories,
            "question_types": question_types,
            "difficulty_levels": difficulty_levels,
        },
    )


# ==================== NEW AI-POWERED ENDPOINTS ====================

@require_http_methods(["POST"])
@csrf_exempt
def generate_question_api(request):
    """
    Generate a new AI-powered question
    POST /api/generate-question/
    Body: {
        "category_id": "solving_for_x",  // optional
        "question_type": "word_problem",  // optional
        "difficulty": 2                   // optional
    }
    """
    try:
        # Get user ID
        user_id = str(request.user.id) if request.user.is_authenticated else "guest"
        
        # Parse request body
        data = json.loads(request.body) if request.body else {}
        category_id = data.get('category_id')
        question_type = data.get('question_type')
        difficulty = data.get('difficulty')
        custom_prompt = data.get('prompt')
        
        # Generate question
        question = question_gen.generate_question(
            user_id=user_id,
            category_id=category_id,
            question_type=question_type,
            difficulty=difficulty,
            custom_prompt=custom_prompt
        )
        
        return JsonResponse({
            'success': True,
            'question': question
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)



@require_http_methods(["GET"])
def example_question_api(request):
    """Fetch a representative MongoDB question for the given filters."""
    try:
        category_id = request.GET.get('category_id')
        question_type = request.GET.get('question_type')
        difficulty = request.GET.get('difficulty')

        query = {}
        if category_id:
            query['categoryId'] = category_id
        if question_type:
            query['questionType'] = question_type
        if difficulty:
            try:
                query['difficulty'] = int(difficulty)
            except ValueError:
                pass

        pipeline = [{"$match": query}] if query else []
        pipeline.append({"$sample": {"size": 1}})

        sample = list(db["questions"].aggregate(pipeline))
        if not sample:
            return JsonResponse({
                'success': False,
                'error': 'No example found for the selected filters.'
            }, status=404)

        example = sample[0]
        example.pop('_id', None)

        return JsonResponse({
            'success': True,
            'example': example
        })

    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@require_http_methods(["POST"])
@csrf_exempt
def validate_answer_api(request):
    """
    Validate student's answer
    POST /api/validate-answer/
    Body: {
        "question_id": "507f1f77bcf86cd799439011",
        "answer": "x = 4",
        "is_generated": true  // whether this is a generated question
    }
    """
    try:
        user_id = str(request.user.id) if request.user.is_authenticated else "guest"
        
        data = json.loads(request.body)
        question_id = data.get('question_id')
        answer = data.get('answer')
        is_generated = data.get('is_generated', True)
        
        if not question_id or not answer:
            return JsonResponse({
                'success': False,
                'error': 'Missing question_id or answer'
            }, status=400)
        
        # Validate answer
        validation = question_gen.validate_answer(
            question_id=question_id,
            user_answer=answer,
            user_id=user_id,
            is_generated=is_generated
        )
        
        return JsonResponse({
            'success': True,
            'validation': validation
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@require_http_methods(["GET"])
def get_student_stats(request):
    """
    Get student performance statistics
    GET /api/stats/
    """
    try:
        user_id = str(request.user.id) if request.user.is_authenticated else "guest"
        stats = question_gen.get_performance_stats(user_id)
        
        return JsonResponse({
            'success': True,
            'stats': stats
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@require_http_methods(["GET"])
def get_question_history_api(request):
    """
    Get student's question history
    GET /api/question-history/?limit=10
    """
    try:
        user_id = str(request.user.id) if request.user.is_authenticated else "guest"
        limit = int(request.GET.get('limit', 10))
        
        history = question_gen.get_question_history(user_id, limit)
        
        return JsonResponse({
            'success': True,
            'history': history
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@require_http_methods(["POST"])
@csrf_exempt
def get_next_practice_question(request):
    """
    Get next practice question (mix of AI-generated and existing)
    POST /api/next-practice-question/
    Body: {
        "category_id": "solving_for_x"  // optional
    }
    """
    try:
        user_id = str(request.user.id) if request.user.is_authenticated else "guest"
        
        data = json.loads(request.body) if request.body else {}
        category_id = data.get('category_id')
        
        # Get next practice question
        question = question_gen.get_next_practice_question(user_id)
        
        return JsonResponse({
            'success': True,
            'question': question
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@require_http_methods(["POST"])
@csrf_exempt
def chat_with_tutor(request):
    """
    Chat with AI tutor for help
    POST /api/chat-tutor/
    Body: {
        "message": "How do I solve 2x + 5 = 13?",
        "context": {  // optional
            "current_question": {...},
            "previous_messages": [...]
        }
    }
    """
    try:
        data = json.loads(request.body)
        message = data.get('message', '')
        context = data.get('context', {})
        
        # Build conversation context
        messages = [
            {
                "role": "system",
                "content": """You are a patient and encouraging algebra tutor for Algebra Alchemy. 
                Help students understand concepts by:
                1. Breaking down problems into simple steps
                2. Asking guiding questions to promote thinking
                3. Providing hints without giving away complete answers
                4. Using clear, simple language
                5. Encouraging students when they make progress
                6. Explaining WHY steps work, not just HOW
                
                Keep responses concise (2-3 sentences) and focused on the specific question."""
            }
        ]
        
        # Add context if available
        if context.get('current_question'):
            messages.append({
                "role": "system",
                "content": f"Current question context: {json.dumps(context['current_question'])}"
            })
        
        # Add previous messages if available
        for prev_msg in context.get('previous_messages', [])[-3:]:  # Last 3 messages
            messages.append(prev_msg)
        
        # Add current message
        messages.append({
            "role": "user",
            "content": message
        })
        
        # Get response from OpenAI
        response = client.chat.completions.create(
            model="gpt-4",
            messages=messages,
            temperature=0.7,
            max_tokens=300
        )
        
        tutor_response = response.choices[0].message.content
        
        return JsonResponse({
            'success': True,
            'response': tutor_response
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e),
            'response': "I'm having trouble right now. Please try asking your question again."
        }, status=500)


@require_http_methods(["POST"])
@csrf_exempt
def bulk_generate_questions(request):
    """
    Bulk generate questions for a category
    POST /api/bulk-generate/
    Body: {
        "category_id": "solving_for_x",
        "count": 5,
        "difficulties": [1, 2, 3]
    }
    """
    try:
        user_id = str(request.user.id) if request.user.is_authenticated else "admin"
        
        data = json.loads(request.body)
        category_id = data.get('category_id', 'solving_for_x')
        count = data.get('count', 5)
        difficulties = data.get('difficulties', [1, 2, 3])
        
        generated_questions = []
        
        for i in range(count):
            difficulty = difficulties[i % len(difficulties)]
            question = question_gen.generate_question(
                user_id=user_id,
                category_id=category_id,
                difficulty=difficulty
            )
            generated_questions.append(question)
        
        return JsonResponse({
            'success': True,
            'count': len(generated_questions),
            'questions': generated_questions
        })

    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@require_http_methods(["POST"])
@csrf_exempt
def save_generated_question(request):
    """Persist a generated question and any metadata into MongoDB."""
    try:
        user_id = str(request.user.id) if request.user.is_authenticated else "guest"
        payload = json.loads(request.body or "{}")
        question = payload.get("question")
        tags = payload.get("tags", [])

        if not isinstance(question, dict):
            return JsonResponse({
                'success': False,
                'error': 'Invalid question payload.'
            }, status=400)

        question.setdefault('user_id', user_id)
        question['saved_at'] = datetime.utcnow()
        question['source'] = question.get('source', 'generator-ui')
        question['is_generated'] = question.get('is_generated', True)
        if tags:
            question['tags'] = tags

        result = question_gen.generated_questions_collection.insert_one(question)

        return JsonResponse({
            'success': True,
            'id': str(result.inserted_id)
        })

    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


# ==================== UTILITY FUNCTIONS ====================

def get_student_progress_view(request):
    """
    Get comprehensive student progress for dashboard
    GET /api/student-progress/
    """
    try:
        user_id = str(request.user.id) if request.user.is_authenticated else "guest"
        progress = question_gen.get_student_progress(user_id)
        
        # Convert datetime to string for JSON serialization
        if progress.get('last_updated'):
            progress['last_updated'] = progress['last_updated'].isoformat()
        
        return JsonResponse({
            'success': True,
            'progress': progress
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)
