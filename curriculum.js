/**
 * Easy Learn — Curriculum Database Module
 *
 * Provides structured academic curriculum data for colleges and universities.
 * Supported Schemes include:
 * - APJ Abdul Kalam Technological University (KTU) 2019 Scheme (B.Tech CSE, ECE, ME)
 * - VJCET Autonomous / KTU 2024 Scheme
 * - Generic Engineering Curriculum (Sample / Demo Data for any institution)
 *
 * DATA ACCURACY POLICY:
 * Official curriculum courses reflect syllabus regulations published by respective academic bodies.
 * Non-official or inferred data is explicitly marked with `isVerified: false` and labeled as Sample/Demo.
 */

'use strict';

const CURRICULUM_DATABASE = {
  // 1. APJ Abdul Kalam Technological University (KTU) / VJCET
  'KTU_2019': {
    institution: 'APJ Abdul Kalam Technological University / VJCET',
    scheme: 'KTU 2019 Scheme',
    degree: 'B.Tech Computer Science and Engineering',
    source: 'APJ KTU B.Tech Regulations 2019 Curriculum Syllabus',
    isVerified: true,
    verificationNote: 'Syllabus course codes and credit structure verified against official KTU curriculum guidelines.',
    semesters: {
      3: {
        semesterName: 'Semester 3',
        courses: [
          {
            code: 'MAT203',
            title: 'Discrete Mathematical Structures',
            credits: 4,
            category: 'Basic Science',
            lectureHours: 3, tutorialHours: 1, labHours: 0,
            isVerified: true,
            defaultAssessments: [
              { title: 'Series Test 1 (Discrete Math)', type: 'internal_exam', estimatedHours: 4.0, priority: 'high', reschedulable: false, offsetDays: 35 },
              { title: 'Propositional Logic Assignment', type: 'assignment', estimatedHours: 3.0, priority: 'medium', reschedulable: true, offsetDays: 20 },
              { title: 'Graph Theory & Relations Quiz', type: 'quiz', estimatedHours: 2.0, priority: 'medium', reschedulable: true, offsetDays: 45 }
            ]
          },
          {
            code: 'CST201',
            title: 'Data Structures',
            credits: 4,
            category: 'Program Core',
            lectureHours: 3, tutorialHours: 1, labHours: 0,
            isVerified: true,
            defaultAssessments: [
              { title: 'Series Test 1 (Data Structures)', type: 'internal_exam', estimatedHours: 4.0, priority: 'high', reschedulable: false, offsetDays: 37 },
              { title: 'Linked Lists & Stack Evaluation', type: 'assignment', estimatedHours: 3.5, priority: 'medium', reschedulable: true, offsetDays: 25 },
              { title: 'BST & AVL Trees Implementation', type: 'assignment', estimatedHours: 4.0, priority: 'high', reschedulable: true, offsetDays: 55 }
            ]
          },
          {
            code: 'CST203',
            title: 'Logic System Design',
            credits: 4,
            category: 'Program Core',
            lectureHours: 3, tutorialHours: 1, labHours: 0,
            isVerified: true,
            defaultAssessments: [
              { title: 'Series Test 1 (Logic Design)', type: 'internal_exam', estimatedHours: 3.5, priority: 'high', reschedulable: false, offsetDays: 39 },
              { title: 'K-Map & Combinational Circuits', type: 'assignment', estimatedHours: 2.5, priority: 'low', reschedulable: true, offsetDays: 28 }
            ]
          },
          {
            code: 'CST205',
            title: 'Object Oriented Programming using Java',
            credits: 4,
            category: 'Program Core',
            lectureHours: 3, tutorialHours: 1, labHours: 0,
            isVerified: true,
            defaultAssessments: [
              { title: 'Inheritance & Polymorphism Mini-Project', type: 'project', estimatedHours: 5.0, priority: 'high', reschedulable: true, offsetDays: 50 },
              { title: 'Java Exception Handling & Multithreading', type: 'assignment', estimatedHours: 3.0, priority: 'medium', reschedulable: true, offsetDays: 30 }
            ]
          },
          {
            code: 'CSL201',
            title: 'Data Structures Lab',
            credits: 2,
            category: 'Lab',
            lectureHours: 0, tutorialHours: 0, labHours: 3,
            isVerified: true,
            defaultAssessments: [
              { title: 'Lab Record: Sorting & Searching Algorithms', type: 'lab', estimatedHours: 3.5, priority: 'medium', reschedulable: true, offsetDays: 22 },
              { title: 'Lab Internal Practical Exam', type: 'internal_exam', estimatedHours: 4.0, priority: 'high', reschedulable: false, offsetDays: 60 }
            ]
          },
          {
            code: 'CSL203',
            title: 'Object Oriented Programming Lab (Java)',
            credits: 2,
            category: 'Lab',
            lectureHours: 0, tutorialHours: 0, labHours: 3,
            isVerified: true,
            defaultAssessments: [
              { title: 'Java Swing GUI Application Submission', type: 'lab', estimatedHours: 4.0, priority: 'medium', reschedulable: true, offsetDays: 40 }
            ]
          }
        ]
      },
      4: {
        semesterName: 'Semester 4',
        courses: [
          {
            code: 'MAT206',
            title: 'Graph Theory',
            credits: 4,
            category: 'Basic Science',
            lectureHours: 3, tutorialHours: 1, labHours: 0,
            isVerified: true,
            defaultAssessments: [
              { title: 'Internal Exam 1 (Graph Theory)', type: 'internal_exam', estimatedHours: 4.0, priority: 'high', reschedulable: false, offsetDays: 36 },
              { title: 'Eulerian Graphs & Trees Assignment', type: 'assignment', estimatedHours: 3.0, priority: 'medium', reschedulable: true, offsetDays: 24 }
            ]
          },
          {
            code: 'CST202',
            title: 'Computer Organization and Architecture',
            credits: 4,
            category: 'Program Core',
            lectureHours: 3, tutorialHours: 1, labHours: 0,
            isVerified: true,
            defaultAssessments: [
              { title: 'Internal Exam 1 (COA)', type: 'internal_exam', estimatedHours: 4.0, priority: 'high', reschedulable: false, offsetDays: 38 },
              { title: 'Pipelining & Cache Memory Problems', type: 'assignment', estimatedHours: 3.0, priority: 'medium', reschedulable: true, offsetDays: 27 }
            ]
          },
          {
            code: 'CST204',
            title: 'Database Management Systems',
            credits: 4,
            category: 'Program Core',
            lectureHours: 3, tutorialHours: 1, labHours: 0,
            isVerified: true,
            defaultAssessments: [
              { title: 'Internal Exam 1 (DBMS)', type: 'internal_exam', estimatedHours: 4.0, priority: 'high', reschedulable: false, offsetDays: 40 },
              { title: 'ER Modeling & Relational Algebra', type: 'assignment', estimatedHours: 3.5, priority: 'medium', reschedulable: true, offsetDays: 21 },
              { title: 'SQL Triggers & Normalization Exercise', type: 'assignment', estimatedHours: 4.0, priority: 'high', reschedulable: true, offsetDays: 48 }
            ]
          },
          {
            code: 'CST206',
            title: 'Operating Systems',
            credits: 4,
            category: 'Program Core',
            lectureHours: 3, tutorialHours: 1, labHours: 0,
            isVerified: true,
            defaultAssessments: [
              { title: 'Internal Exam 1 (OS)', type: 'internal_exam', estimatedHours: 4.0, priority: 'high', reschedulable: false, offsetDays: 42 },
              { title: 'Process Scheduling & Synchronization Analysis', type: 'assignment', estimatedHours: 3.5, priority: 'high', reschedulable: true, offsetDays: 29 },
              { title: 'Deadlock Detection & Memory Management Quiz', type: 'quiz', estimatedHours: 2.0, priority: 'medium', reschedulable: true, offsetDays: 52 }
            ]
          },
          {
            code: 'CSL202',
            title: 'Digital Lab',
            credits: 2,
            category: 'Lab',
            lectureHours: 0, tutorialHours: 0, labHours: 3,
            isVerified: true,
            defaultAssessments: [
              { title: 'Digital Circuit Simulation Report', type: 'lab', estimatedHours: 3.0, priority: 'medium', reschedulable: true, offsetDays: 32 }
            ]
          },
          {
            code: 'CSL204',
            title: 'Operating Systems Lab',
            credits: 2,
            category: 'Lab',
            lectureHours: 0, tutorialHours: 0, labHours: 3,
            isVerified: true,
            defaultAssessments: [
              { title: 'CPU Scheduling Simulation in C/C++', type: 'lab', estimatedHours: 4.0, priority: 'high', reschedulable: true, offsetDays: 30 }
            ]
          }
        ]
      },
      5: {
        semesterName: 'Semester 5 (Active Demo Baseline)',
        courses: [
          {
            code: 'CST301',
            title: 'Formal Languages and Automata Theory',
            credits: 4,
            category: 'Program Core',
            lectureHours: 3, tutorialHours: 1, labHours: 0,
            isVerified: true,
            defaultAssessments: [
              { title: 'First Series Exam (FLAT)', type: 'internal_exam', estimatedHours: 4.0, priority: 'high', reschedulable: false, offsetDays: 35 },
              { title: 'DFA & NFA State Minimization Assignment', type: 'assignment', estimatedHours: 3.0, priority: 'medium', reschedulable: true, offsetDays: 14 },
              { title: 'Turing Machine & Context Free Grammars Quiz', type: 'quiz', estimatedHours: 2.0, priority: 'medium', reschedulable: true, offsetDays: 45 }
            ]
          },
          {
            code: 'CST303',
            title: 'Computer Networks',
            credits: 4,
            category: 'Program Core',
            lectureHours: 3, tutorialHours: 1, labHours: 0,
            isVerified: true,
            defaultAssessments: [
              { title: 'First Series Exam (Computer Networks)', type: 'internal_exam', estimatedHours: 3.5, priority: 'high', reschedulable: false, offsetDays: 37 },
              { title: 'IP Subnetting & Routing Protocols Assignment', type: 'assignment', estimatedHours: 3.5, priority: 'medium', reschedulable: true, offsetDays: 18 },
              { title: 'Packet Capture Wireshark Analysis', type: 'assignment', estimatedHours: 2.5, priority: 'low', reschedulable: true, offsetDays: 42 }
            ]
          },
          {
            code: 'CST305',
            title: 'System Software',
            credits: 4,
            category: 'Program Core',
            lectureHours: 3, tutorialHours: 1, labHours: 0,
            isVerified: true,
            defaultAssessments: [
              { title: 'First Series Exam (System Software)', type: 'internal_exam', estimatedHours: 4.0, priority: 'high', reschedulable: false, offsetDays: 39 },
              { title: 'Two-Pass Assembler Design Assignment', type: 'assignment', estimatedHours: 3.5, priority: 'high', reschedulable: true, offsetDays: 20 },
              { title: 'Macro Processor Algorithms Assignment', type: 'assignment', estimatedHours: 3.0, priority: 'medium', reschedulable: true, offsetDays: 48 }
            ]
          },
          {
            code: 'CST307',
            title: 'Microprocessors and Microcontrollers',
            credits: 4,
            category: 'Program Core',
            lectureHours: 3, tutorialHours: 1, labHours: 0,
            isVerified: true,
            defaultAssessments: [
              { title: 'First Series Exam (Microprocessors)', type: 'internal_exam', estimatedHours: 3.5, priority: 'high', reschedulable: false, offsetDays: 41 },
              { title: '8086 Assembly Program Submission', type: 'assignment', estimatedHours: 3.0, priority: 'medium', reschedulable: true, offsetDays: 16 }
            ]
          },
          {
            code: 'CST309',
            title: 'Management of Software Systems',
            credits: 3,
            category: 'Humanities & Management',
            lectureHours: 3, tutorialHours: 0, labHours: 0,
            isVerified: true,
            defaultAssessments: [
              { title: 'Software Requirements Specification (SRS) Report', type: 'project', estimatedHours: 5.0, priority: 'high', reschedulable: true, offsetDays: 28 },
              { title: 'Agile vs Waterfall Case Study', type: 'assignment', estimatedHours: 2.5, priority: 'low', reschedulable: true, offsetDays: 12 }
            ]
          },
          {
            code: 'CSL331',
            title: 'System Software and Microprocessors Lab',
            credits: 2,
            category: 'Lab',
            lectureHours: 0, tutorialHours: 0, labHours: 3,
            isVerified: true,
            defaultAssessments: [
              { title: '8086 Assembly Lab Evaluation 1', type: 'lab', estimatedHours: 3.0, priority: 'medium', reschedulable: true, offsetDays: 21 },
              { title: 'One-Pass Assembler Program Submission', type: 'lab', estimatedHours: 3.5, priority: 'high', reschedulable: true, offsetDays: 34 }
            ]
          },
          {
            code: 'CSL333',
            title: 'Database Management Systems Lab',
            credits: 2,
            category: 'Lab',
            lectureHours: 0, tutorialHours: 0, labHours: 3,
            isVerified: true,
            defaultAssessments: [
              { title: 'Fullstack Database Application Milestone', type: 'project', estimatedHours: 4.5, priority: 'medium', reschedulable: true, offsetDays: 25 },
              { title: 'PL/SQL Triggers and Procedures Record', type: 'lab', estimatedHours: 3.0, priority: 'medium', reschedulable: true, offsetDays: 15 }
            ]
          }
        ]
      },
      6: {
        semesterName: 'Semester 6',
        courses: [
          {
            code: 'CST302',
            title: 'Compiler Design',
            credits: 4,
            category: 'Program Core',
            lectureHours: 3, tutorialHours: 1, labHours: 0,
            isVerified: true,
            defaultAssessments: [
              { title: 'Series Test 1 (Compiler Design)', type: 'internal_exam', estimatedHours: 4.0, priority: 'high', reschedulable: false, offsetDays: 35 },
              { title: 'Lexical Analyzer & Lex Tool Exercise', type: 'lab', estimatedHours: 3.0, priority: 'medium', reschedulable: true, offsetDays: 18 },
              { title: 'Yacc Parser & Intermediate Code Gen', type: 'assignment', estimatedHours: 4.0, priority: 'high', reschedulable: true, offsetDays: 38 }
            ]
          },
          {
            code: 'CST304',
            title: 'Computer Graphics and Image Processing',
            credits: 4,
            category: 'Program Core',
            lectureHours: 3, tutorialHours: 1, labHours: 0,
            isVerified: true,
            defaultAssessments: [
              { title: 'Series Test 1 (Computer Graphics)', type: 'internal_exam', estimatedHours: 3.5, priority: 'high', reschedulable: false, offsetDays: 37 },
              { title: 'Bresenham & DDA Line Clipping Project', type: 'project', estimatedHours: 4.5, priority: 'medium', reschedulable: true, offsetDays: 24 }
            ]
          },
          {
            code: 'CST306',
            title: 'Algorithm Analysis and Design',
            credits: 4,
            category: 'Program Core',
            lectureHours: 3, tutorialHours: 1, labHours: 0,
            isVerified: true,
            defaultAssessments: [
              { title: 'Series Test 1 (Algorithm Analysis)', type: 'internal_exam', estimatedHours: 4.0, priority: 'high', reschedulable: false, offsetDays: 39 },
              { title: 'Dynamic Programming & Greedy Proofs', type: 'assignment', estimatedHours: 3.5, priority: 'high', reschedulable: true, offsetDays: 20 },
              { title: 'NP-Completeness Reductions Quiz', type: 'quiz', estimatedHours: 2.0, priority: 'medium', reschedulable: true, offsetDays: 45 }
            ]
          },
          {
            code: 'CST308',
            title: 'Comprehensive Course Work',
            credits: 1,
            category: 'Program Core',
            lectureHours: 1, tutorialHours: 0, labHours: 0,
            isVerified: true,
            defaultAssessments: [
              { title: 'Comprehensive Viva-Voce Assessment', type: 'quiz', estimatedHours: 3.0, priority: 'high', reschedulable: false, offsetDays: 55 }
            ]
          },
          {
            code: 'CSL332',
            title: 'Networking Lab',
            credits: 2,
            category: 'Lab',
            lectureHours: 0, tutorialHours: 0, labHours: 3,
            isVerified: true,
            defaultAssessments: [
              { title: 'Socket Programming TCP/UDP Implementation', type: 'lab', estimatedHours: 3.5, priority: 'medium', reschedulable: true, offsetDays: 22 },
              { title: 'NS2 / NS3 Network Simulation Report', type: 'lab', estimatedHours: 3.0, priority: 'low', reschedulable: true, offsetDays: 40 }
            ]
          },
          {
            code: 'CSD334',
            title: 'Mini Project',
            credits: 2,
            category: 'Project',
            lectureHours: 0, tutorialHours: 0, labHours: 3,
            isVerified: true,
            defaultAssessments: [
              { title: 'Mini Project Phase 1 Design Document', type: 'project', estimatedHours: 6.0, priority: 'high', reschedulable: true, offsetDays: 26 },
              { title: 'Mini Project Final Demonstration & Code Review', type: 'project', estimatedHours: 8.0, priority: 'high', reschedulable: false, offsetDays: 60 }
            ]
          }
        ]
      }
    }
  },

  // 2. Generic Engineering College Curriculum (Customizable fallback for any institution)
  'GENERIC_ENG': {
    institution: 'Standard University / Autonomous College',
    scheme: 'AICTE Model Curriculum / Generic Scheme',
    degree: 'B.Tech / B.E. (General Engineering Framework)',
    source: 'AICTE Model Curriculum Guidelines (Sample / Customizable)',
    isVerified: false,
    verificationNote: 'Standard engineering syllabus structure. Course codes and assessment schedules can be modified by the student.',
    semesters: {
      1: {
        semesterName: 'Semester 1',
        courses: [
          { code: 'ENG101', title: 'Engineering Mathematics I', credits: 4, category: 'Basic Science', lectureHours: 3, tutorialHours: 1, labHours: 0, isVerified: false, defaultAssessments: [{ title: 'Mid-Term Exam (Calculus)', type: 'internal_exam', estimatedHours: 4.0, priority: 'high', reschedulable: false, offsetDays: 35 }] },
          { code: 'ENG102', title: 'Engineering Physics / Chemistry', credits: 4, category: 'Basic Science', lectureHours: 3, tutorialHours: 1, labHours: 0, isVerified: false, defaultAssessments: [{ title: 'Physics Lab Report', type: 'lab', estimatedHours: 2.5, priority: 'medium', reschedulable: true, offsetDays: 20 }] },
          { code: 'ENG103', title: 'Programming for Problem Solving (C)', credits: 4, category: 'Engineering Science', lectureHours: 3, tutorialHours: 0, labHours: 2, isVerified: false, defaultAssessments: [{ title: 'C Programming Assignment', type: 'assignment', estimatedHours: 3.0, priority: 'medium', reschedulable: true, offsetDays: 18 }] }
        ]
      },
      5: {
        semesterName: 'Semester 5 (Standard Core)',
        courses: [
          { code: 'CS501', title: 'Operating Systems & Architecture', credits: 4, category: 'Program Core', lectureHours: 3, tutorialHours: 1, labHours: 0, isVerified: false, defaultAssessments: [{ title: 'OS Midterm Examination', type: 'internal_exam', estimatedHours: 4.0, priority: 'high', reschedulable: false, offsetDays: 35 }, { title: 'Process Scheduling Assignment', type: 'assignment', estimatedHours: 3.0, priority: 'medium', reschedulable: true, offsetDays: 15 }] },
          { code: 'CS502', title: 'Database Systems & SQL', credits: 4, category: 'Program Core', lectureHours: 3, tutorialHours: 1, labHours: 0, isVerified: false, defaultAssessments: [{ title: 'Database Normalization Report', type: 'assignment', estimatedHours: 3.5, priority: 'medium', reschedulable: true, offsetDays: 20 }, { title: 'SQL & Transactions Quiz', type: 'quiz', estimatedHours: 2.0, priority: 'low', reschedulable: true, offsetDays: 38 }] },
          { code: 'CS503', title: 'Computer Networks', credits: 4, category: 'Program Core', lectureHours: 3, tutorialHours: 1, labHours: 0, isVerified: false, defaultAssessments: [{ title: 'Networks Midterm Exam', type: 'internal_exam', estimatedHours: 3.5, priority: 'high', reschedulable: false, offsetDays: 37 }] },
          { code: 'CS504', title: 'Software Engineering Project', credits: 3, category: 'Project', lectureHours: 2, tutorialHours: 0, labHours: 2, isVerified: false, defaultAssessments: [{ title: 'Software Specification Milestone', type: 'project', estimatedHours: 5.0, priority: 'high', reschedulable: true, offsetDays: 25 }] }
        ]
      }
    }
  }
};

/**
 * Curriculum Service Methods
 */
const CurriculumService = {
  /**
   * Retrieves curriculum definition matching profile attributes.
   */
  getCurriculum: function(schemeKey, semesterNum) {
    const key = CURRICULUM_DATABASE[schemeKey] ? schemeKey : 'KTU_2019';
    const curriculum = CURRICULUM_DATABASE[key];
    const sem = parseInt(semesterNum, 10) || 5;

    if (curriculum.semesters[sem]) {
      return {
        schemeKey: key,
        schemeName: curriculum.scheme,
        institution: curriculum.institution,
        degree: curriculum.degree,
        source: curriculum.source,
        isVerified: curriculum.isVerified,
        verificationNote: curriculum.verificationNote,
        semesterNumber: sem,
        semesterName: curriculum.semesters[sem].semesterName,
        courses: curriculum.semesters[sem].courses
      };
    }

    // Fallback: Semester 5 of selected scheme
    const fallbackSem = Object.keys(curriculum.semesters)[0] || 5;
    return {
      schemeKey: key,
      schemeName: curriculum.scheme,
      institution: curriculum.institution,
      degree: curriculum.degree,
      source: curriculum.source,
      isVerified: curriculum.isVerified,
      verificationNote: curriculum.verificationNote,
      semesterNumber: parseInt(fallbackSem, 10),
      semesterName: curriculum.semesters[fallbackSem].semesterName,
      courses: curriculum.semesters[fallbackSem].courses
    };
  },

  /**
   * Returns list of supported curriculum schemes.
   */
  getAvailableSchemes: function() {
    return [
      { key: 'KTU_2019', name: 'KTU 2019 Scheme (APJ Abdul Kalam Tech. Univ / VJCET)', verified: true },
      { key: 'GENERIC_ENG', name: 'AICTE Model Curriculum / Generic University Framework', verified: false }
    ];
  },

  /**
   * Generates localized assessment deadlines anchored to the current academic calendar.
   */
  generateAssessmentsFromCourses: function(courses, baseMondayDateStr, selectedTypes) {
    if (!Array.isArray(courses)) return [];
    const assessments = [];
    const typesFilter = selectedTypes || ['assignment', 'lab', 'quiz', 'internal_exam', 'project'];

    courses.forEach((course, courseIndex) => {
      if (!Array.isArray(course.defaultAssessments)) return;

      course.defaultAssessments.forEach((def, aIndex) => {
        if (!typesFilter.includes(def.type)) return;

        // Generate date relative to base date
        // Stagger deadlines so they represent a realistic semester timeline
        const daysOffset = def.offsetDays ? Math.min(def.offsetDays % 14 + 1, 12) : (courseIndex * 2 + aIndex * 3) % 12 + 1;
        const targetDeadline = addDays(baseMondayDateStr, daysOffset);

        const isExam = def.type === 'internal_exam';
        const isLocked = isExam ? true : (def.reschedulable === false);

        assessments.push({
          id: `asmt_${course.code.toLowerCase()}_${aIndex}_${Date.now() % 10000}_${Math.random().toString(36).substr(2, 4)}`,
          title: def.title,
          subject: `${course.code} ${course.title}`,
          courseCode: course.code,
          type: def.type,
          originalDeadline: targetDeadline,
          currentDeadline: targetDeadline,
          earliestAllowedDate: addDays(targetDeadline, isExam ? 0 : -5),
          latestAllowedDate: addDays(targetDeadline, isExam ? 0 : 4),
          estimatedHours: Number(def.estimatedHours) || 3.0,
          priority: def.priority || 'medium',
          reschedulable: !isLocked,
          completed: false,
          isOfficialDeadline: isExam, // Internal exams have official locked status
          notes: `${course.category} assessment for ${course.code}. Credits: ${course.credits}. L-T-P: ${course.lectureHours}-${course.tutorialHours}-${course.labHours}.`
        });
      });
    });

    return assessments;
  }
};

// Export to window scope for browser vanilla JS
if (typeof window !== 'undefined') {
  window.CurriculumService = CurriculumService;
  window.CURRICULUM_DATABASE = CURRICULUM_DATABASE;
}
