"""
Question Generator Module for Algebra Alchemy
Integrates with existing MongoDB schema and generates adaptive questions
"""

import os
import json
from datetime import datetime
from typing import Dict, List, Optional
from dotenv import load_dotenv
from openai import OpenAI
from .mongo import db

load_dotenv()

class QuestionGenerator:
    """Generates adaptive algebra questions using OpenAI API"""
    
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.questions_collection = db['questions']
        self.student_progress_collection = db['student_progress']
        self.generated_questions_collection = db['generated_questions']
        
        # Category mappings from your existing schema
        self.categories = {
            "solving_for_x": "Solving for X",
            "reducing_fractions": "Reducing Fractions",
            "isolating_x_terms": "Isolating X-Terms",
        }
        
        self.question_types = {
            "word_problem": "Solve Word Problems",
            "solve_equation": "Solve Equations",
            "translate": "Translate Expressions/Equations"
        }
    
    def get_student_progress(self, user_id: str) -> Dict:
        """Retrieve student's current progress and performance"""
        progress = self.student_progress_collection.find_one({"user_id": user_id})
        if not progress:
            # Initialize new student
            progress = {
                "user_id": user_id,
                "skill_level": "beginner",
                "current_category": "solving_for_x",
                "categories_progress": {
                    "solving_for_x": {"attempted": 0, "correct": 0},
                    "reducing_fractions": {"attempted": 0, "correct": 0},
                    "isolating_x_terms": {"attempted": 0, "correct": 0}
                },
                "correct_streak": 0,
                "total_xp": 0,
                "last_updated": datetime.utcnow()
            }
            self.student_progress_collection.insert_one(progress)
        return progress
    
    def generate_question(
        self,
        user_id: str,
        category_id: Optional[str] = None,
        question_type: Optional[str] = None,
        difficulty: Optional[int] = None,
        custom_prompt: Optional[str] = None
    ) -> Dict:
        """
        Generate a new algebra question based on student's level
        
        Args:
            user_id: Student's user ID
            category_id: Category (solving_for_x, reducing_fractions, isolating_x_terms)
            question_type: Type (word_problem, solve_equation, translate)
            difficulty: Difficulty level 1-3
            
        Returns:
            Dictionary containing question data matching your schema
        """
        # Get student progress
        progress = self.get_student_progress(user_id)
        
        # Determine parameters
        if not category_id:
            category_id = progress.get('current_category', 'solving_for_x')
        if not difficulty:
            difficulty = self._determine_difficulty(progress, category_id)
        if not question_type:
            question_type = self._choose_question_type(progress)
        
        # Create prompt for OpenAI
        prompt = self._create_generation_prompt(
            category_id,
            question_type,
            difficulty,
            progress,
            custom_prompt
        )
        
        try:
            # Call OpenAI API
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert algebra question generator. Create educational questions following the exact JSON schema provided. Return ONLY valid JSON, no markdown formatting."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=1000
            )
            
            # Parse response
            content = response.choices[0].message.content.strip()
            # Remove markdown code blocks if present
            if content.startswith('```'):
                content = content.split('```')[1]
                if content.startswith('json'):
                    content = content[4:]
                content = content.strip()
            
            question_data = json.loads(content)

            # Ensure required metadata fields exist for downstream UI/state
            question_data.setdefault('categoryId', category_id)
            question_data.setdefault('categoryName', self.categories.get(category_id, category_id))
            question_data.setdefault('questionType', question_type)
            question_data.setdefault('questionTypeLabel', self.question_types.get(question_type, question_type))
            question_data.setdefault('difficulty', difficulty)

            # Normalize prompt and solution keys so the UI doesn't show blanks
            if 'prompt' not in question_data:
                if 'wordProblem' in question_data:
                    question_data['prompt'] = question_data['wordProblem']
                elif 'givenEquation' in question_data:
                    question_data['prompt'] = f"Solve the equation: {question_data['givenEquation']}"
                else:
                    question_data['prompt'] = question_data.get('question', '')

            if 'solution' not in question_data and 'correctTranslation' in question_data:
                question_data['solution'] = {
                    'answer': question_data['correctTranslation'],
                    'answerNumeric': question_data.get('answerNumeric'),
                    'steps': question_data.get('steps', [])
                }

            if question_data.get('questionType') == 'solve_equation':
                prompt_text = question_data.get('prompt', '')
                needs_equation = not question_data.get('givenEquation') or not any(ch.isdigit() for ch in prompt_text)
                if needs_equation:
                    fallback = self._default_equation_payload(difficulty)
                    question_data.setdefault('givenEquation', fallback['givenEquation'])
                    question_data['prompt'] = fallback['prompt']
                    question_data['solution'] = fallback['solution']
            
            # Add metadata
            question_data['user_id'] = user_id
            question_data['generated_at'] = datetime.utcnow()
            question_data['answered'] = False
            question_data['is_generated'] = True
            
            # Store in MongoDB
            result = self.generated_questions_collection.insert_one(question_data)
            question_data['_id'] = str(result.inserted_id)
            
            return question_data
            
        except Exception as e:
            print(f"Error generating question: {str(e)}")
            # Fallback to existing questions from database
            return self._get_fallback_question(category_id, difficulty)
    
    def _create_generation_prompt(
        self,
        category_id: str,
        question_type: str,
        difficulty: int,
        progress: Dict,
        custom_instructions: Optional[str] = None
    ) -> str:
        """Create detailed prompt for question generation"""
        
        category_name = self.categories.get(category_id, category_id)
        type_label = self.question_types.get(question_type, question_type)
        
        # Category-specific guidance
        category_guidance = {
            "solving_for_x": "Focus on solving linear equations with one variable",
            "reducing_fractions": "Create problems involving fractions that need simplification",
            "isolating_x_terms": "Focus on moving terms with variables to one side"
        }
        
        # Question type templates
        type_templates = {
            "word_problem": """
                - "wordProblem": Real-world scenario
                - "prompt": Instructions for the student
                - "equation": The mathematical equation
                - "solution": {
                    "answer": Final answer as string
                    "answerNumeric": Numeric value
                    "steps": Array of solution steps
                }
            """,
            "solve_equation": """
                - "prompt": "Solve the equation for x."
                - "givenEquation": The equation to solve
                - "solution": {
                    "answer": Final answer as string
                    "answerNumeric": Numeric value
                    "steps": Array of solution steps
                }
            """,
            "translate": """
                - "prompt": Sentence to translate
                - "expectedForm": "equation-in-x"
                - "correctTranslation": The algebraic equation
            """
        }
        
        prompt = f"""Generate ONE algebra question with these specifications:

**Category**: {category_name} ({category_id})
**Type**: {type_label} ({question_type})
**Difficulty**: {difficulty} (1=easy, 2=medium, 3=hard)
**Guidance**: {category_guidance.get(category_id, '')}

**Extra creator notes**: {custom_instructions or 'Keep concise and pedagogically sound.'}

**Required JSON Structure** (NO placeholders—use specific numbers and variables):
{{
    "categoryId": "{category_id}",
    "categoryName": "{category_name}",
    "questionType": "{question_type}",
    "questionTypeLabel": "{type_label}",
    {type_templates.get(question_type, '')},
    "kcTags": ["tag1", "tag2"],
    "dfTargets": ["DF1", "DF2"],
    "difficulty": {difficulty}
}}

**Example for solve_equation** (keep the same keys, change numbers):
{{
    "categoryId": "solving_for_x",
    "categoryName": "Solving for X",
    "questionType": "solve_equation",
    "questionTypeLabel": "Solve Equation",
    "prompt": "Solve the equation for x: 3x - 7 = 11.",
    "givenEquation": "3x - 7 = 11",
    "solution": {{
        "answer": "x = 6",
        "answerNumeric": 6,
        "steps": ["Add 7 to both sides: 3x = 18", "Divide by 3: x = 6"]
    }},
    "kcTags": ["linear-equations"],
    "dfTargets": ["DF1"],
    "difficulty": {difficulty}
}}

**Important Guidelines**:
1. Make the question educational and appropriate for difficulty level {difficulty}
2. Provide clear, step-by-step solutions
3. Use realistic numbers (avoid very large or complex decimals)
4. For word problems, create relatable real-world scenarios with numeric details
5. Ensure mathematical accuracy and that the prompt references the same equation you provide
6. Do not output generic stems like "Solve the equation for x" without including the actual equation
7. Return ONLY the JSON object, no additional text.

**Difficulty Guidelines**:
- Level 1: Single-step problems, small integers
- Level 2: Two-step problems, may include fractions
- Level 3: Multi-step problems, complex scenarios"""
        
        return prompt
    
    def _determine_difficulty(self, progress: Dict, category_id: str) -> int:
        """Determine appropriate difficulty based on student performance"""
        category_progress = progress.get('categories_progress', {}).get(category_id, {})
        attempted = category_progress.get('attempted', 0)
        correct = category_progress.get('correct', 0)
        
        if attempted == 0:
            return 1  # Start with easy
        
        accuracy = correct / attempted
        streak = progress.get('correct_streak', 0)
        
        # Adaptive difficulty logic
        if accuracy >= 0.8 and streak >= 3:
            return min(3, 2 + (streak // 5))  # Cap at 3
        elif accuracy >= 0.6:
            return 2
        else:
            return 1
    
    def _choose_question_type(self, progress: Dict) -> str:
        """Choose appropriate question type based on progress"""
        # Vary question types to keep learning diverse
        import random
        types = ["word_problem", "solve_equation", "translate"]
        weights = [0.4, 0.4, 0.2]  # More word problems and equations
        return random.choices(types, weights=weights)[0]
    
    def validate_answer(
        self, 
        question_id: str, 
        user_answer: str, 
        user_id: str,
        is_generated: bool = True
    ) -> Dict:
        """
        Validate student's answer and update progress
        
        Args:
            question_id: MongoDB ObjectId of the question
            user_answer: Student's submitted answer
            user_id: Student's user ID
            is_generated: Whether this is a generated question
            
        Returns:
            Dictionary with validation results and feedback
        """
        from bson.objectid import ObjectId
        
        # Retrieve question
        collection = self.generated_questions_collection if is_generated else self.questions_collection
        question = collection.find_one({"_id": ObjectId(question_id)})
        
        if not question:
            return {"error": "Question not found"}
        
        # Get correct answer
        if 'solution' in question:
            correct_answer = question['solution']['answer'].strip().lower()
        elif 'correctTranslation' in question:
            correct_answer = question['correctTranslation'].strip().lower()
        else:
            return {"error": "No answer found in question"}
        
        user_answer = user_answer.strip().lower()
        
        # Check if correct
        is_correct = self._compare_answers(correct_answer, user_answer)
        
        # Update question status
        collection.update_one(
            {"_id": ObjectId(question_id)},
            {
                "$set": {
                    "answered": True,
                    "user_answer": user_answer,
                    "is_correct": is_correct,
                    "answered_at": datetime.utcnow()
                }
            }
        )
        
        # Update student progress
        xp_earned = self._update_student_progress(
            user_id, 
            is_correct, 
            question.get('categoryId'),
            question.get('difficulty', 1)
        )
        
        # Prepare response
        response = {
            "is_correct": is_correct,
            "correct_answer": question.get('solution', {}).get('answer') or question.get('correctTranslation'),
            "user_answer": user_answer,
            "xp_earned": xp_earned
        }
        
        if 'solution' in question:
            response['solution_steps'] = question['solution'].get('steps', [])
        
        if not is_correct and 'wordProblem' in question:
            response['hint'] = f"Think about: {question['wordProblem']}"
        
        return response
    
    def _compare_answers(self, correct: str, user: str) -> bool:
        """Compare answers with flexibility for equivalent forms"""
        # Normalize
        correct = correct.replace(' ', '').replace('=', '')
        user = user.replace(' ', '').replace('=', '')
        
        # Direct match
        if correct == user:
            return True
        
        # Try to evaluate as expressions
        try:
            # Replace common patterns
            correct_eval = correct.replace('x', '*1').replace('^', '**')
            user_eval = user.replace('x', '*1').replace('^', '**')
            
            # Try numeric evaluation
            correct_val = eval(correct_eval)
            user_val = eval(user_eval)
            
            if isinstance(correct_val, (int, float)) and isinstance(user_val, (int, float)):
                return abs(correct_val - user_val) < 0.01
        except:
            pass
        
        # Check for fraction equivalence
        if '/' in correct and '/' in user:
            try:
                from fractions import Fraction
                return Fraction(correct) == Fraction(user)
            except:
                pass
        
        return False
    
    def _update_student_progress(
        self,
        user_id: str,
        is_correct: bool,
        category_id: str,
        difficulty: int
    ) -> int:
        """Update student progress and calculate XP"""
        progress = self.get_student_progress(user_id)
        
        # Calculate XP
        base_xp = difficulty * 10
        xp_earned = base_xp if is_correct else base_xp // 2
        
        # Update category progress
        category_progress = progress.get('categories_progress', {}).get(category_id, {"attempted": 0, "correct": 0})
        category_progress['attempted'] += 1
        if is_correct:
            category_progress['correct'] += 1
        
        # Update streak
        new_streak = progress.get('correct_streak', 0) + 1 if is_correct else 0
        
        # Update in database
        self.student_progress_collection.update_one(
            {"user_id": user_id},
            {
                "$set": {
                    f"categories_progress.{category_id}": category_progress,
                    "correct_streak": new_streak,
                    "last_updated": datetime.utcnow()
                },
                "$inc": {
                    "total_xp": xp_earned
                }
            }
        )

        return xp_earned

    def _default_equation_payload(self, difficulty: int) -> Dict:
        """Provide a concrete equation/solution pair for clarity in the UI."""
        examples = {
            1: {
                'givenEquation': '2x + 5 = 13',
                'prompt': 'Solve the equation for x: 2x + 5 = 13.',
                'solution': {
                    'answer': 'x = 4',
                    'answerNumeric': 4,
                    'steps': [
                        'Subtract 5 from both sides: 2x = 8',
                        'Divide both sides by 2: x = 4'
                    ]
                }
            },
            2: {
                'givenEquation': '3(x - 2) = 2x + 4',
                'prompt': 'Solve the equation for x: 3(x - 2) = 2x + 4.',
                'solution': {
                    'answer': 'x = 10',
                    'answerNumeric': 10,
                    'steps': [
                        'Distribute 3: 3x - 6 = 2x + 4',
                        'Subtract 2x from both sides: x - 6 = 4',
                        'Add 6 to both sides: x = 10'
                    ]
                }
            },
            3: {
                'givenEquation': '5x/2 - 3 = x + 7',
                'prompt': 'Solve the equation for x: (5x/2) - 3 = x + 7.',
                'solution': {
                    'answer': 'x = 20/3',
                    'answerNumeric': 20 / 3,
                    'steps': [
                        'Subtract x from both sides: (3x/2) - 3 = 7',
                        'Add 3 to both sides: 3x/2 = 10',
                        'Multiply both sides by 2/3: x = (10 * 2) / 3 ≈ 6.67'
                    ]
                }
            }
        }

        payload = examples.get(difficulty, examples[1]).copy()
        payload['solution'] = payload['solution'].copy()
        payload['solution']['steps'] = list(payload['solution'].get('steps', []))
        return payload
    
    def _get_fallback_question(self, category_id: str, difficulty: int) -> Dict:
        """Get a question from existing database as fallback"""
        question = self.questions_collection.find_one({
            "categoryId": category_id,
            "difficulty": difficulty
        })
        
        if not question:
            # Get any question from category
            question = self.questions_collection.find_one({"categoryId": category_id})
        
        if question:
            question['_id'] = str(question['_id'])
            question['is_generated'] = False
            return question
        
        # Ultimate fallback
        return {
            "categoryId": "solving_for_x",
            "categoryName": "Solving for X",
            "questionType": "solve_equation",
            "prompt": "Solve the equation for x.",
            "givenEquation": "2x + 5 = 13",
            "solution": {
                "answer": "x = 4",
                "answerNumeric": 4,
                "steps": [
                    "Subtract 5 from both sides: 2x = 8",
                    "Divide both sides by 2: x = 4"
                ]
            },
            "difficulty": 1,
            "is_generated": False
        }
    
    def get_question_history(self, user_id: str, limit: int = 10) -> List[Dict]:
        """Get student's generated question history"""
        questions = list(self.generated_questions_collection.find(
            {"user_id": user_id}
        ).sort("generated_at", -1).limit(limit))
        
        # Convert ObjectId to string
        for q in questions:
            q['_id'] = str(q['_id'])
        
        return questions
    
    def get_performance_stats(self, user_id: str) -> Dict:
        """Get detailed performance statistics"""
        progress = self.get_student_progress(user_id)
        
        # Calculate overall stats
        total_attempted = 0
        total_correct = 0
        
        categories_stats = {}
        for cat_id, cat_progress in progress.get('categories_progress', {}).items():
            attempted = cat_progress.get('attempted', 0)
            correct = cat_progress.get('correct', 0)
            
            total_attempted += attempted
            total_correct += correct
            
            categories_stats[cat_id] = {
                "name": self.categories.get(cat_id, cat_id),
                "attempted": attempted,
                "correct": correct,
                "accuracy": correct / attempted if attempted > 0 else 0
            }
        
        return {
            "overall": {
                "total_attempted": total_attempted,
                "total_correct": total_correct,
                "accuracy": total_correct / total_attempted if total_attempted > 0 else 0,
                "current_streak": progress.get('correct_streak', 0),
                "total_xp": progress.get('total_xp', 0)
            },
            "categories": categories_stats,
            "skill_level": progress.get('skill_level', 'beginner'),
            "current_category": progress.get('current_category', 'solving_for_x')
        }
    
    def get_next_practice_question(self, user_id: str) -> Dict:
        """Get next appropriate practice question (mix of generated and existing)"""
        import random
        
        progress = self.get_student_progress(user_id)
        category = progress.get('current_category', 'solving_for_x')
        
        # 50% chance to generate new question, 50% use existing
        if random.random() < 0.5:
            return self.generate_question(user_id, category_id=category)
        else:
            difficulty = self._determine_difficulty(progress, category)
            question = self._get_fallback_question(category, difficulty)
            return question