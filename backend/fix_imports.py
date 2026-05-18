import os
import glob
import re

def fix_imports(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # In api/schemas/curriculum.py: No relative imports.
    # In api/schemas/planning.py: No relative imports.
    # In api/dependencies.py: 
    #   from infrastructure -> from infrastructure
    #   from application -> from application
    # In api/routes/curriculum.py:
    #   from api.schemas -> from api.schemas
    #   from api.dependencies -> from api.dependencies
    #   from application -> from application
    # In api/routes/planning.py: same
    # In application/use_cases/curriculum_use_cases.py:
    #   from domain -> from domain
    # In application/use_cases/planning_use_cases.py:
    #   from domain -> from domain
    #   from application.use_cases.curriculum_use_cases -> from application.use_cases.curriculum_use_cases
    # In domain/services/*.py:
    #   from domain.entities -> from domain.entities
    #   from domain.services.dag_validator -> from domain.services.dag_validator
    # In infrastructure/db/supabase_client.py:
    #   from shared -> from shared
    # In infrastructure/db/repositories/*.py:
    #   from domain -> from domain
    
    replacements = {
        r"from \.\.\.\.domain": "from domain",
        r"from \.\.\.domain": "from domain",
        r"from \.\.\.application": "from application",
        r"from \.\.\.shared": "from shared",
        r"from \.\.infrastructure": "from infrastructure",
        r"from \.\.application": "from application",
        r"from \.\.entities": "from domain.entities",
        r"from \.\.schemas": "from api.schemas",
        r"from \.\.dependencies": "from api.dependencies",
        r"from \.dag_validator": "from domain.services.dag_validator",
        r"from \.toposort_service": "from domain.services.toposort_service",
        r"from \.critical_path": "from domain.services.critical_path",
        r"from \.curriculum_use_cases": "from application.use_cases.curriculum_use_cases",
        r"from \.course": "from domain.entities.course",
        r"from \.student": "from domain.entities.student",
    }
    
    new_content = content
    for pattern, repl in replacements.items():
        new_content = re.sub(pattern, repl, new_content)
        
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed {filepath}")

for root, _, files in os.walk('.'):
    for file in files:
        if file.endswith('.py'):
            fix_imports(os.path.join(root, file))

