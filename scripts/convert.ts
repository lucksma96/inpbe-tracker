import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { parse } from "csv-parse/sync";
import console from "console";

interface Lesson {
    lessonId: string;
    title: string;
    durationMinutes: number;
}

interface Course {
    courseId: string;
    title: string;

    lessons: Array<Lesson>;
}

interface Module {
    moduleId: string;
    title: string;

    courses: Array<Course>;
}

type Row = {
    Módulo: string;
    Curso: string;
    Aula: string;
    Duração: number;
};

const csvPath = join(import.meta.dirname, "curriculum.csv");
const jsonPath = join(import.meta.dirname, "../src/assets/curriculum.json");

const fileContent = readFileSync(csvPath, "utf-8");
const records: Array<Row> = parse(fileContent, { columns: true, skip_empty_lines: true, cast: true });

let moduleIdx = 1;

const modules: Record<string, Module> = {};
const courses: Record<string, Course> = {};
const titleDash = " - ";

for (const row of records) {
    const modulo = row.Módulo;
    let module = modules[modulo];
    if (!module) {
        const moduleTitle = modulo.split(titleDash).pop() || modulo;
        modules[modulo] = {
            moduleId: `m${moduleIdx}`,
            title: moduleTitle,
            courses: [],
        };
        module = modules[modulo];
        moduleIdx++;
    }

    const curso = row.Curso;
    const courseKey = `${modulo}-${curso}`;
    let course = courses[courseKey];
    if (!course) {
        const courseIdx = module.courses.length + 1;
        const courseTitle = curso.split(titleDash).pop() || curso;
        courses[courseKey] = {
            courseId: `${module.moduleId}-c${courseIdx}`,
            title: courseTitle,
            lessons: [],
        };
        course = courses[courseKey];

        modules[modulo].courses.push(course);
    }

    const lessonIdx = course.lessons.length + 1;
    const aula = row.Aula;
    const duration = row.Duração;
    const lessonTitle = aula.split(titleDash).pop() || aula;
    const lesson: Lesson = {
        lessonId: `${course.courseId}-l${lessonIdx}`,
        title: lessonTitle,
        durationMinutes: duration,
    };

    course.lessons.push(lesson);
}

const curriculum: Array<Module> = Object.values(modules);

writeFileSync(jsonPath, JSON.stringify(curriculum, null, 2), { encoding: "utf8" });

console.log(`Successfully converted lessons to ${jsonPath}`);
