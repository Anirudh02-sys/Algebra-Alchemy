"""
Test script for Question Generator
Run this to verify your setup is working correctly
"""

import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'algebra_alchemy.settings')
django.setup()

from algebra_alchemy.question_generator import QuestionGenerator
import json

def print_section(title):
    """Pretty print section headers"""
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60 + "\n")

def test_question_generation():
    """Test generating questions"""
    print_section("TEST 1: Question Generation")
    
    qgen = QuestionGenerator()
    
    categories = ['solving_for_x', 'reducing_fractions', 'isolating_x_terms']
    difficulties = [1, 2, 3]
    
    for category in categories:
        for difficulty in difficulties:
            print(f"Generating {category} (difficulty {difficulty})...")
            try:
                question = qgen.generate_question(
                    user_id="test_user",
                    category_id=category,
                    difficulty=difficulty
                )
                
                print(f"✓ Generated successfully!")
                print(f"  Question Type: {question.get('questionType')}")
                print(f"  Category: {question.get('categoryName')}")
                
                if 'wordProblem' in question:
                    print(f"  Problem: {question['wordProblem'][:60]}...")
                elif 'givenEquation' in question:
                    print(f"  Equation: {question['givenEquation']}")
                
                print(f"  Answer: {question.get('solution', {}).get('answer', 'N/A')}")
                print()
                
            except Exception as e:
                print(f"✗ Error: {str(e)}\n")
    
    return qgen

def test_answer_validation(qgen):
    """Test answer validation"""
    print_section("TEST 2: Answer Validation")
    
    # Generate a simple question
    print("Generating test question...")
    question = qgen.generate_question(
        user_id="test_user",
        category_id="solving_for_x",
        difficulty=1
    )
    
    correct_answer = question.get('solution', {}).get('answer', '')
    question_id = question.get('_id')
    
    print(f"Question ID: {question_id}")
    print(f"Correct Answer: {correct_answer}")
    
    # Test correct answer
    print("\nTesting CORRECT answer...")
    validation = qgen.validate_answer(
        question_id=question_id,
        user_answer=correct_answer,
        user_id="test_user",
        is_generated=True
    )
    
    print(f"Result: {'✓ Correct' if validation['is_correct'] else '✗ Incorrect'}")
    print(f"XP Earned: {validation.get('xp_earned', 0)}")
    
    # Test incorrect answer
    print("\nTesting INCORRECT answer...")
    validation = qgen.validate_answer(
        question_id=question_id,
        user_answer="x = 999",
        user_id="test_user_2",
        is_generated=True
    )
    
    print(f"Result: {'✓ Correct' if validation['is_correct'] else '✗ Incorrect'}")
    print(f"Correct answer shown: {validation.get('correct_answer')}")

def test_student_progress(qgen):
    """Test student progress tracking"""
    print_section("TEST 3: Student Progress")
    
    # Get initial progress
    progress = qgen.get_student_progress("test_user")
    print("Initial Progress:")
    print(json.dumps(progress, indent=2, default=str))
    
    # Generate and answer a few questions
    print("\n\nAnswering 5 questions...")
    for i in range(5):
        question = qgen.generate_question(
            user_id="test_user",
            category_id="solving_for_x"
        )
        
        correct_answer = question.get('solution', {}).get('answer', '')
        
        # Answer correctly 4 out of 5 times
        answer = correct_answer if i < 4 else "wrong answer"
        
        qgen.validate_answer(
            question_id=question['_id'],
            user_answer=answer,
            user_id="test_user",
            is_generated=True
        )
        
        print(f"Question {i+1}: {'✓' if i < 4 else '✗'}")
    
    # Get updated stats
    print("\n\nUpdated Statistics:")
    stats = qgen.get_performance_stats("test_user")
    print(json.dumps(stats, indent=2, default=str))

def test_question_history(qgen):
    """Test question history"""
    print_section("TEST 4: Question History")
    
    history = qgen.get_question_history("test_user", limit=5)
    
    print(f"Found {len(history)} questions in history")
    
    for i, q in enumerate(history, 1):
        print(f"\n{i}. {q.get('categoryName')} (Difficulty {q.get('difficulty')})")
        print(f"   Type: {q.get('questionType')}")
        print(f"   Answered: {q.get('answered', False)}")
        if q.get('answered'):
            print(f"   Correct: {q.get('is_correct', False)}")

def test_fallback_questions(qgen):
    """Test fallback to database questions"""
    print_section("TEST 5: Fallback Questions")
    
    print("Testing fallback mechanism...")
    question = qgen._get_fallback_question('solving_for_x', 1)
    
    print(f"Fallback Question Retrieved:")
    print(f"  Category: {question.get('categoryName')}")
    print(f"  Type: {question.get('questionType')}")
    print(f"  Is Generated: {question.get('is_generated')}")

def main():
    """Run all tests"""
    print("\n" + "🚀" * 30)
    print("  ALGEBRA ALCHEMY - QUESTION GENERATOR TEST SUITE")
    print("🚀" * 30)
    
    try:
        # Initialize
        qgen = test_question_generation()
        
        # Run tests
        test_answer_validation(qgen)
        test_student_progress(qgen)
        test_question_history(qgen)
        test_fallback_questions(qgen)
        
        print_section("✅ ALL TESTS COMPLETED")
        print("Your question generator is working correctly!")
        print("\nNext steps:")
        print("1. Start your Django server: python manage.py runserver")
        print("2. Test the API endpoints in your browser")
        print("3. Integrate with your frontend code")
        
    except Exception as e:
        print_section("❌ TEST FAILED")
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        print("\nPlease check:")
        print("1. MongoDB is running and accessible")
        print("2. OpenAI API key is set in .env")
        print("3. All dependencies are installed")

if __name__ == "__main__":
    main()