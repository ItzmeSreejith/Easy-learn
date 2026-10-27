# Easy Learn — Smart Academic Workload Optimizer & Personalized Study Companion

> **"Balance the deadlines. Improve the learning."**  
> Built for the VJCET Education Hackathon *"The Missing Piece"*

---

## 1. Problem Statement & Overview

College students in engineering and technical programs face recurring assessment bottlenecks where multiple assignments, laboratory submissions, online quizzes, and internal examinations converge on the same dates. This creates acute workload spikes, unnecessary stress, sub-optimal learning outcomes, and burnout.

**Easy Learn** is an autonomous, client-side academic schedule optimization engine and personalized study companion. It combines **curriculum syllabus data**, **personal daily study availability**, and a **deterministic constraint-satisfaction optimization algorithm** to distribute academic effort realistically while strictly protecting non-negotiable institutional examination dates.

---

## 2. Upgraded Core Features (Version 2.0)

### 2.1. Student Onboarding & Academic Profile
- **First-Time Welcome Wizard**: Guides students through a 4-step setup explaining how Easy Learn personalizes study planning.
- **Academic Details**: Captures Full Name, College / Institution (e.g., *Viswajyothi College of Engineering and Technology*), University / Academic System (e.g., *APJ Abdul Kalam Technological University*), Degree Program, Academic Year, Semester, and Curriculum Scheme.
- **Persistent Profile Management**: Profile can be edited at any time under **Account & Settings &rarr; Personal Profile**.

### 2.2. Curriculum-Driven Semester Workload (`curriculum.js`)
- **Structured Syllabus Data**: Supports degrees, regulations, semesters, course codes, course titles, credits, categories (Core, Lab, Basic Science, Humanities), and weekly lecture (L), tutorial (T), and laboratory (P) hours.
- **Supported Academic Schemes**:
  - *KTU 2019 Scheme (APJ Abdul Kalam Technological University / VJCET)*
  - *AICTE Model Curriculum / Generic Engineering College Framework*
- **Curriculum Accuracy & Verification Policy**:
  - Verified syllabus structures are tagged with a green **"Verified Scheme"** badge.
  - Sample or inferred curriculum structures are clearly labeled as **"Sample / Demo Data (Customizable)"**.
  - Students can add custom subjects, remove subjects, or switch semesters at any time.

### 2.3. Personalized Study Availability & Capacity Planning
- **Daily Study Availability Planner**: Interactive 7-day card grid allowing students to configure their realistic study hours for each day of the week (Monday through Sunday).
- **Daily Capacity Limit ($\tau$)**: Set maximum safe study load (default: 4.0h/day).
- **Study Capacity Pressure Meter**: Real-time gauge comparing required weekly preparation hours against configured available study hours.
- **Unavailable Periods**: Documents college hours (e.g. 9:00 AM – 4:15 PM) to guarantee no independent preparation is scheduled during institutional classes.

### 2.4. Assessments & Task Completion Tracking
- **Task Completion Status**: Checkbox toggle on dashboard and assessments table allowing students to mark tasks as completed (`completed: true`) with strikethrough styling and dynamic metric recalculation.
- **Confirmed vs. Estimated Dates**: Flags official university exam dates with an institutional lock badge (`🔒 Exam`).
- **Separation of Hours**: Scheduled teaching contact hours are kept cleanly distinct from independent assessment preparation hours.

### 2.5. Smart Schedule Optimizer & Preparation Pacing
- **Deterministic Greedy Load-Balancing**: Squashes workload peaks using a quadratic penalty on days exceeding the daily study threshold.
- **Strict Hard Constraints**:
  - $\forall a \in A, \quad earliestAllowedDate(a) \le currentDeadline(a) \le latestAllowedDate(a)$.
  - Internal exams and assessments marked with `reschedulable === false` remain 100% immovable.
- **Workload Conservation Theorem**: Total required academic effort is conserved ($\sum \text{Effort}_{before} \equiv \sum \text{Effort}_{after}$).
- **Preparation Pacing**: Explains the suggested study window before each milestone deadline, respecting daily study limits.
- **Approval & Snapshot Undo**: Proposed changes require student approval. A snapshot is stored in `localStorage`, enabling 1-click instant rollback.

### 2.6. In-App Notification Center
- **Bell Icon with Unread Counter Badge**: Header notification center displaying:
  - *Upcoming Deadline Reminders* (due within configured lead time).
  - *Workload Peak Alerts* (days exceeding daily capacity).
  - *Study Bottleneck Warnings* (when required prep hours exceed available study time before a deadline).
- Supports marking individual items as read, "Mark All as Read", and customizable quiet hours.

### 2.7. Complete Theme Customization (Light, Dark, System)
- Full CSS token-driven Light and Dark mode with accessible contrast.
- One-click Sun/Moon toggle in the topbar, or configurable under Account Preferences.

---

## 3. Technology Stack & Client-Side Architecture

- **Frontend Core**: Semantic HTML5, CSS3 with custom design tokens, Vanilla JavaScript (ES6+).
- **Data Persistence**: Browser `localStorage` utilizing a clean, versioned data model (`easylearn_*_v2` with seamless backward compatibility for existing records).
- **Visualization**: **Chart.js v4.4** via CDN, with an **automatic pure HTML/CSS fallback bar chart** for guaranteed offline resilience.
- **Zero-Backend / Privacy by Design**: All student data, study availability, and assessments are stored locally in the student's browser. No private records are sent to external cloud databases.

---

## 4. Local Setup & Running Instructions

### Direct Browser Launch
Simply double-click [`index.html`](file:///c:/Users/SreejithS/Desktop/Hackathon/index.html) or right-click & choose **Open with Browser** (Chrome, Edge, Firefox, Safari).

### Local Static Server (Recommended)
If using Python 3:
```bash
python -m http.server 8080
```
Then visit `http://localhost:8080` in your web browser.

---

## 5. Data Model Specification (`localStorage` v2)

| Key | Description |
|---|---|
| `easylearn_profile_v2` | Student name, college, university, degree, year, semester, regulation scheme, student ID, section, and onboarding status. |
| `easylearn_curriculum_v2` | Enrolled semester courses, course codes, credits, lecture/lab hours, and verification metadata. |
| `easylearn_assessments_v2` | List of tasks with deadlines, prep hours, priority, reschedulability, completion status, and notes. |
| `easylearn_availability_v2` | Monday–Sunday available study hours, maximum daily limit ($\tau$), preferred timeslot, and break duration. |
| `easylearn_preferences_v2` | Active theme (`light`/`dark`), landing view, first day of week, completed task visibility, and widget toggles. |
| `easylearn_notifications_v2` | In-app notification queue and reminder lead time preferences. |
| `easylearn_snapshot_v2` | Rollback snapshot before the most recent applied optimization. |

*Note: Backward-compatible fallback support automatically migrates existing `loadbalance_*` and `studycompanion_*` keys.*

---

## 6. How to Add Verified Curriculum Data

Curriculum data is maintained modularly in [`curriculum.js`](file:///c:/Users/SreejithS/Desktop/Hackathon/curriculum.js).

To add an official university regulation:
1. Open [`curriculum.js`](file:///c:/Users/SreejithS/Desktop/Hackathon/curriculum.js).
2. Add a new scheme key to `CURRICULUM_DATABASE`:
```javascript
'MY_COLLEGE_2026': {
  institution: 'My College of Engineering',
  scheme: '2026 Autonomous Regulation',
  degree: 'B.Tech Information Technology',
  source: 'Academic Council Syllabus Document 2026',
  isVerified: true,
  verificationNote: 'Official syllabus reference approved by Academic Council.',
  semesters: {
    5: {
      semesterName: 'Semester 5',
      courses: [
        {
          code: 'IT301',
          title: 'Cloud Computing & DevOps',
          credits: 4,
          category: 'Program Core',
          lectureHours: 3, tutorialHours: 1, labHours: 0,
          isVerified: true,
          defaultAssessments: [
            { title: 'Series Test 1', type: 'internal_exam', estimatedHours: 4.0, priority: 'high', reschedulable: false, offsetDays: 35 }
          ]
        }
      ]
    }
  }
}
```
3. Register the key in `CurriculumService.getAvailableSchemes()`. The scheme will immediately appear in the student onboarding and settings dropdowns!

---

## 7. Local vs. Cloud LMS Integration Roadmap

| Feature Area | Current Client-Side MVP | Future Cloud LMS Backend Integration |
|---|---|---|
| **Data Storage** | Browser `localStorage` (Isolated, private, zero-cost) | Secure PostgreSQL / MongoDB cloud database with user accounts |
| **Authentication** | Local Profile Identification | Institutional SSO / OAuth2 (Google Workspace, Microsoft Entra, Moodle) |
| **Curriculum Sync** | Modular `curriculum.js` database | Real-time REST / GraphQL API sync from university academic portals |
| **Notifications** | In-app notification drawer & alerts | Push notifications, automated email summaries, and SMS deadline reminders |
| **Cross-Device Sync**| JSON Export & Import backups | Seamless real-time sync across mobile, laptop, and tablet devices |

---

## 8. Verification & Test Suite

Open the **"Algorithm & Tests"** tab in the application to execute the live automated unit tests directly in your browser:
- **Test 1**: *Fixed Internal Exam Immutability* (Ensures exams never move under clash conditions).
- **Test 2**: *Strict Date Window Boundaries* ($earliest \le deadline \le latest$).
- **Test 3**: *Mathematical Workload Conservation* ($\sum \text{Effort}_{before} \equiv \sum \text{Effort}_{after}$).
- **Test 4**: *Peak Workload & Overload Reduction* (Squashes dangerous 9.5h peaks down to daily threshold).
- **Test 5**: *Determinism & Idempotence* (Runs duplicate passes to guarantee 100% reproducible proposals).
- **Test 6**: *Snapshot Rollback & Undo Guarantee* (Verifies snapshot serialization and state restoration).

---

Developed with ❤️ for education fairness at **VJCET**.
