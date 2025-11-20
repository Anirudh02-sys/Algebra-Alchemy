"""
URL configuration for algebra_alchemy project.
"""
from django.contrib import admin
from django.urls import path, re_path
from django.contrib.auth import views as auth_views
from .views import *

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # ==================== MAIN PAGES ====================
    path("", tutor_dashboard, name="tutor-dashboard"),
    path("progress/", current_progress, name="current-progress"),
    path("graph/", learning_graph, name="learning-graph"),
    path("calendar/", calendar_view, name="calendar"),
    
    # ==================== EXISTING API ENDPOINTS ====================
    path("api/isolating/", isolating_problems, name="isolating-problems"),
    path("api/questions/", get_all_questions, name="all-questions"),
    path("api/questions/category/<str:category_id>/", get_questions_by_category, name="questions-by-category"),
    path("api/questions/type/<str:q_type>/", get_questions_by_type, name="questions-by-type"),
    path("api/questions/difficulty/<int:level>/", get_questions_by_difficulty, name="questions-by-difficulty"),
    
    # ==================== NEW AI-POWERED ENDPOINTS ====================
    
    # Question Generation
    path("api/generate-question/", generate_question_api, name="generate-question"),
    path("api/next-practice-question/", get_next_practice_question, name="next-practice-question"),
    path("api/bulk-generate/", bulk_generate_questions, name="bulk-generate"),
    
    # Answer Validation
    path("api/validate-answer/", validate_answer_api, name="validate-answer"),
    
    # Student Progress & Stats
    path("api/stats/", get_student_stats, name="student-stats"),
    path("api/student-progress/", get_student_progress_view, name="student-progress"),
    path("api/question-history/", get_question_history_api, name="question-history"),
    
    # AI Tutor Chat
    path("api/chat-tutor/", chat_with_tutor, name="chat-tutor"),
]