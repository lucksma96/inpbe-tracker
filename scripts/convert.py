import json
import pandas as pd

# 1. Load the CSV
file_path = "curriculum.csv"
df = pd.read_csv(file_path)

curriculum = []
m_idx = 1

# 2. Group by Module
for m_name, m_group in df.groupby('Módulo', sort=False):
    module = {
        "moduleId": f"m{m_idx}",
        # Strip "Módulo 1 - " prefix for cleaner UI titles
        "title": m_name.split(' - ', 1)[-1] if ' - ' in m_name else m_name,
        "courses": []
    }

    c_idx = 1
    # 3. Group by Course
    for c_name, c_group in m_group.groupby('Curso', sort=False):
        course = {
            "courseId": f"m{m_idx}-c{c_idx}",
            # Strip "Curso 1 - " prefix
            "title": c_name.split(' - ', 1)[-1] if ' - ' in c_name else c_name,
            "lessons": []
        }

        l_idx = 1
        # 4. Loop over Lessons
        for _, row in c_group.iterrows():
            lesson_name = row['Aula']
            lesson = {
                "lessonId": f"m{m_idx}-c{c_idx}-l{l_idx}",
                # Strip "Aula 1 - " prefix
                "title": lesson_name.split(' - ', 1)[-1] if ' - ' in str(lesson_name) else str(lesson_name),
                "durationMinutes": int(row['Duração (min)']) if pd.notna(row['Duração (min)']) else 0
            }
            course["lessons"].append(lesson)
            l_idx += 1

        module["courses"].append(course)
        c_idx += 1

    curriculum.append(module)
    m_idx += 1

# 5. Save to JSON file
with open('../src/assets/curriculum.json', 'w', encoding='utf-8') as f:
    json.dump(curriculum, f, indent=2, ensure_ascii=False)

print("Successfully converted lessons to curriculum.json!")
