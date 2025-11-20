from sympy import *
import re

def normalize_expr(expr):
    """Cleans whitespace and Unicode issues."""
    return expr.replace("−", "-").replace(" ", "")

def parse_equation(equation):
    """Splits equation into sympy-parsable LHS and RHS."""
    equation = normalize_expr(equation)
    if "=" not in equation:
        raise ValueError("Invalid equation")
    lhs, rhs = equation.split("=")
    return lhs, rhs

def solve_equation(equation):
    lhs, rhs = parse_equation(equation)
    x = symbols('x')
    sol = solve(Eq(sympify(lhs), sympify(rhs)), x)
    return sol

def check_equation_equivalence(student_eq, correct_eq):
    """Returns True if student equation is algebraically equivalent."""
    try:
        x = symbols('x')
        lhs_s, rhs_s = parse_equation(student_eq)
        lhs_c, rhs_c = parse_equation(correct_eq)

        diff = simplify((sympify(lhs_s) - sympify(rhs_s)) - 
                        (sympify(lhs_c) - sympify(rhs_c)))
        return diff == 0
    except:
        return False

def classify_common_error(student_eq, correct_eq):
    """Detect common algebra mistakes."""
    if "+" in student_eq and "-" in correct_eq:
        return "sign_error"
    if "(x" in correct_eq and "*" in student_eq:
        return "distribution_error"
    if "/" in student_eq and "*" in correct_eq:
        return "inverse_operation_error"
    return "unknown"
