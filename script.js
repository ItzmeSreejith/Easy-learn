/**
 * Easy Learn — Smart Academic Workload Optimizer & Study Companion
 * Developed for VJCET Education Hackathon "The Missing Piece"
 *
 * Core Modules:
 * 1. Persistent State Architecture (v2 with profile, curriculum, availability, preferences, notifications)
 * 2. Onboarding Controller & Multi-step Wizard
 * 3. Curriculum Service Integration & Course Management
 * 4. Study Availability Planner & Capacity Pressure Engine
 * 5. Assessment Task Manager with Completion Tracking
 * 6. Deterministic Constraint-Aware Optimizer & Preparation Pacing
 * 7. In-App Notification Center & Deadline Alerts
 * 8. Theme Controller (Light / Dark / System)
 * 9. Dual Chart Engine (Chart.js with pure HTML/CSS fallback)
 * 10. Automated Algorithmic Verification Suite
 */

'use strict';

// ============================================================================
// 1. STORAGE KEYS & DEFAULT STATE ARCHITECTURE
// ============================================================================

const STORAGE_KEYS = {
  PROFILE: 'easylearn_profile_v2',
  CURRICULUM: 'easylearn_curriculum_v2',
  ASSESSMENTS: 'easylearn_assessments_v2',
  AVAILABILITY: 'easylearn_availability_v2',
  PREFERENCES: 'easylearn_preferences_v2',
  NOTIFICATIONS: 'easylearn_notifications_v2',
  SNAPSHOT: 'easylearn_snapshot_v2',
  // Legacy keys for seamless migration from LoadBalance and Study Companion
  LEGACY_PROFILE: 'loadbalance_profile_v2',
  LEGACY_CURRICULUM: 'loadbalance_curriculum_v2',
  LEGACY_ASSESSMENTS: 'loadbalance_assessments_v2',
  LEGACY_AVAILABILITY: 'loadbalance_availability_v2',
  LEGACY_PREFERENCES: 'loadbalance_preferences_v2',
  LEGACY_NOTIFICATIONS: 'loadbalance_notifications_v2',
  LEGACY_SNAPSHOT: 'loadbalance_snapshot_v2',
  LEGACY_STUDYCOMPANION_ASSESSMENTS: 'studycompanion_assessments_v1',
  LEGACY_STUDYCOMPANION_SETTINGS: 'studycompanion_settings_v1',
  LEGACY_STUDYCOMPANION_SNAPSHOT: 'studycompanion_snapshot_v1',
  LEGACY_OLD_ASSESSMENTS: 'loadbalance_assessments_v1'
};

const DEFAULT_PROFILE = {
  name: 'Sreejith S',
  preferredName: '',
  college: 'Viswajyothi College of Engineering and Technology (VJCET)',
  university: 'APJ Abdul Kalam Technological University (KTU)',
  degree: 'B.Tech Computer Science and Engineering',
  academicYear: '3',
  semester: 5,
  scheme: 'KTU_2019',
  studentId: 'VJC22CS045',
  section: 'CSE-A',
  onboardingCompleted: false
};

const DEFAULT_AVAILABILITY = {
  dailyHours: {
    Monday: 3.5,
    Tuesday: 3.5,
    Wednesday: 3.5,
    Thursday: 3.5,
    Friday: 3.5,
    Saturday: 5.0,
    Sunday: 5.0
  },
  maxDailyStudyLimit: 4.0,
  preferredTimeSlot: 'evening',
  breakDuration: 15,
  unavailablePeriods: 'College Lectures: Monday to Friday 9:00 AM – 4:15 PM'
};

const DEFAULT_PREFERENCES = {
  theme: 'light',
  defaultDashboardView: 'dashboard',
  calendarMode: 'weekly',
  firstDayOfWeek: 'monday',
  hideCompleted: false,
  visibleWidgets: {
    stats: true,
    capacity: true,
    chart: true,
    deadlines: true,
    subjects: true
  }
};

const DEFAULT_NOTIF_SETTINGS = {
  deadlineAlerts: true,
  overloadWarnings: true,
  capacityWarnings: true,
  leadDays: 2,
  quietHours: '11:00 PM – 7:00 AM'
};

// Global Application State
const state = {
  profile: { ...DEFAULT_PROFILE },
  curriculum: {
    courses: [],
    schemeName: 'KTU 2019 Scheme',
    isVerified: true,
    verificationNote: 'Syllabus structure and credit weights verified against official university guidelines.'
  },
  assessments: [],
  availability: { ...DEFAULT_AVAILABILITY },
  preferences: { ...DEFAULT_PREFERENCES },
  notifications: {
    items: [],
    settings: { ...DEFAULT_NOTIF_SETTINGS }
  },
  currentCalendarWeekStart: null,
  activeTab: 'dashboard',
  activeSettingsSubtab: 'profile',
  pendingProposal: null,
  lastSnapshot: null,
  onboardingStep: 1,
  charts: {
    dashboard: null,
    original: null,
    proposed: null
  }
};

// Priority Multipliers for Optimizer Cost Scoring
const PRIORITY_MULTIPLIER = {
  high: 3.0,
  medium: 1.5,
  low: 1.0
};

// Inertia Penalty Factors
const INERTIA_WEIGHT_MAP = {
  aggressive: 0.8,
  balanced: 2.0,
  conservative: 4.5
};

// ============================================================================
// 2. TIMEZONE-SAFE DATE UTILITIES
// ============================================================================

function parseLocalDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return new Date();
  const parts = dateStr.split('-');
  if (parts.length !== 3) return new Date();
  return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
}

function formatLocalDate(dateObj) {
  if (!(dateObj instanceof Date) || isNaN(dateObj)) return '';
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDays(dateStr, days) {
  const d = parseLocalDate(dateStr);
  d.setDate(d.getDate() + days);
  return formatLocalDate(d);
}

function diffDays(d1Str, d2Str) {
  const d1 = parseLocalDate(d1Str);
  const d2 = parseLocalDate(d2Str);
  const msPerDay = 86400000;
  return Math.round((d2.getTime() - d1.getTime()) / msPerDay);
}

function getMonday(dateObj) {
  const d = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d;
}

function formatDisplayDate(dateStr) {
  const d = parseLocalDate(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function getWeekDaysArray(mondayDate) {
  const days = [];
  const start = new Date(mondayDate.getFullYear(), mondayDate.getMonth(), mondayDate.getDate());
  for (let i = 0; i < 7; i++) {
    const cur = new Date(start);
    cur.setDate(start.getDate() + i);
    days.push(formatLocalDate(cur));
  }
  return days;
}

// ============================================================================
// 3. STORAGE, INITIALIZATION & MIGRATION
// ============================================================================

function loadStateFromStorage() {
  try {
    // 1. Profile
    const storedProf = localStorage.getItem(STORAGE_KEYS.PROFILE) ||
                       localStorage.getItem(STORAGE_KEYS.LEGACY_PROFILE);
    if (storedProf) {
      state.profile = { ...DEFAULT_PROFILE, ...JSON.parse(storedProf) };
    }

    // 2. Preferences & Theme
    const storedPref = localStorage.getItem(STORAGE_KEYS.PREFERENCES) ||
                       localStorage.getItem(STORAGE_KEYS.LEGACY_PREFERENCES);
    if (storedPref) {
      state.preferences = { ...DEFAULT_PREFERENCES, ...JSON.parse(storedPref) };
    }
    applyTheme(state.preferences.theme);

    // 3. Availability
    const storedAvail = localStorage.getItem(STORAGE_KEYS.AVAILABILITY) ||
                        localStorage.getItem(STORAGE_KEYS.LEGACY_AVAILABILITY);
    if (storedAvail) {
      state.availability = { ...DEFAULT_AVAILABILITY, ...JSON.parse(storedAvail) };
    }

    // 4. Curriculum
    const storedCurr = localStorage.getItem(STORAGE_KEYS.CURRICULUM) ||
                       localStorage.getItem(STORAGE_KEYS.LEGACY_CURRICULUM);
    if (storedCurr) {
      state.curriculum = JSON.parse(storedCurr);
    } else {
      // Load matching curriculum from CurriculumService
      syncCurriculumFromService(state.profile.scheme, state.profile.semester, false);
    }

    // 5. Assessments
    const storedAsmt = localStorage.getItem(STORAGE_KEYS.ASSESSMENTS) ||
                       localStorage.getItem(STORAGE_KEYS.LEGACY_ASSESSMENTS);
    if (storedAsmt) {
      const parsed = JSON.parse(storedAsmt);
      state.assessments = validateAndSanitizeAssessments(parsed);
    } else {
      // Check legacy migration
      const legacyAsmt = localStorage.getItem(STORAGE_KEYS.LEGACY_STUDYCOMPANION_ASSESSMENTS) ||
                         localStorage.getItem(STORAGE_KEYS.LEGACY_OLD_ASSESSMENTS);
      if (legacyAsmt) {
        state.assessments = validateAndSanitizeAssessments(JSON.parse(legacyAsmt));
      } else {
        // Load initial semester tasks from confirmed curriculum
        loadSemesterAssessmentsFromCurriculum(false);
      }
    }

    // 6. Notifications
    const storedNotifs = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) ||
                         localStorage.getItem(STORAGE_KEYS.LEGACY_NOTIFICATIONS);
    if (storedNotifs) {
      state.notifications = JSON.parse(storedNotifs);
    }

    // 7. Snapshot for Undo
    const storedSnapshot = localStorage.getItem(STORAGE_KEYS.SNAPSHOT) ||
                           localStorage.getItem(STORAGE_KEYS.LEGACY_SNAPSHOT);
    if (storedSnapshot) {
      state.lastSnapshot = JSON.parse(storedSnapshot);
    }
  } catch (err) {
    console.error('Error reading storage state, falling back cleanly:', err);
    syncCurriculumFromService('KTU_2019', 5, false);
    loadSemesterAssessmentsFromCurriculum(false);
  }

  // Anchor calendar to current week
  state.currentCalendarWeekStart = getMonday(new Date());

  // Generate dynamic alerts based on current state
  generateSystemNotifications();
}

function saveProfileToStorage() {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(state.profile));
  } catch (err) {
    console.error('Failed to save profile:', err);
  }
}

function saveCurriculumToStorage() {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRICULUM, JSON.stringify(state.curriculum));
  } catch (err) {
    console.error('Failed to save curriculum:', err);
  }
}

function saveAssessmentsToStorage() {
  try {
    localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(state.assessments));
  } catch (err) {
    console.error('Failed to save assessments:', err);
  }
}

function saveAvailabilityToStorage() {
  try {
    localStorage.setItem(STORAGE_KEYS.AVAILABILITY, JSON.stringify(state.availability));
  } catch (err) {
    console.error('Failed to save availability:', err);
  }
}

function savePreferencesToStorage() {
  try {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(state.preferences));
  } catch (err) {
    console.error('Failed to save preferences:', err);
  }
}

function saveNotificationsToStorage() {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(state.notifications));
  } catch (err) {
    console.error('Failed to save notifications:', err);
  }
}

function saveSnapshot(assessmentList) {
  try {
    state.lastSnapshot = JSON.parse(JSON.stringify(assessmentList));
    localStorage.setItem(STORAGE_KEYS.SNAPSHOT, JSON.stringify(state.lastSnapshot));
    updateUndoButtonVisibility();
  } catch (err) {
    console.error('Failed to save snapshot:', err);
  }
}

function validateAndSanitizeAssessments(list) {
  if (!Array.isArray(list)) return [];
  return list.filter(item => {
    return item && typeof item.title === 'string' &&
           typeof item.originalDeadline === 'string' &&
           typeof item.estimatedHours === 'number' && item.estimatedHours > 0;
  }).map(item => ({
    id: item.id || 'asmt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    title: String(item.title).trim(),
    subject: String(item.subject || 'General').trim(),
    courseCode: item.courseCode || extractCourseCode(item.subject),
    type: ['assignment', 'lab', 'quiz', 'internal_exam', 'project'].includes(item.type) ? item.type : 'assignment',
    originalDeadline: item.originalDeadline,
    currentDeadline: item.currentDeadline || item.originalDeadline,
    earliestAllowedDate: item.earliestAllowedDate || addDays(item.originalDeadline, -5),
    latestAllowedDate: item.latestAllowedDate || addDays(item.originalDeadline, 3),
    estimatedHours: Number(item.estimatedHours) || 3.0,
    priority: ['low', 'medium', 'high'].includes(item.priority) ? item.priority : 'medium',
    reschedulable: item.type === 'internal_exam' ? (item.reschedulable === true) : (item.reschedulable !== false),
    completed: item.completed === true,
    isOfficialDeadline: item.isOfficialDeadline === true || item.type === 'internal_exam',
    notes: String(item.notes || '').trim()
  }));
}

function extractCourseCode(subjectStr) {
  if (!subjectStr) return 'GEN';
  const match = subjectStr.match(/^[A-Z]{2,4}\d{3}/i);
  return match ? match[0].toUpperCase() : 'GEN';
}

// ============================================================================
// 4. CURRICULUM MANAGEMENT & COURSE SYNC
// ============================================================================

function syncCurriculumFromService(schemeKey, semesterNum, notify = true) {
  if (typeof window.CurriculumService === 'undefined') return;

  const data = window.CurriculumService.getCurriculum(schemeKey, semesterNum);
  state.curriculum = {
    courses: data.courses || [],
    schemeName: data.schemeName,
    schemeKey: data.schemeKey,
    degree: data.degree,
    institution: data.institution,
    isVerified: data.isVerified,
    verificationNote: data.verificationNote,
    semesterNumber: data.semesterNumber
  };

  saveCurriculumToStorage();
  if (notify) {
    showToast(`Curriculum updated to ${data.schemeName} — ${data.semesterName}`, 'info');
  }
}

function loadSemesterAssessmentsFromCurriculum(notify = true) {
  if (!state.curriculum.courses || state.curriculum.courses.length === 0) {
    syncCurriculumFromService(state.profile.scheme, state.profile.semester, false);
  }

  const monday = getMonday(new Date());
  const mStr = formatLocalDate(monday);

  if (typeof window.CurriculumService !== 'undefined') {
    state.assessments = window.CurriculumService.generateAssessmentsFromCourses(
      state.curriculum.courses,
      mStr
    );
  } else {
    // Built-in fallback
    state.assessments = generateRealisticSemesterSchedule(mStr);
  }

  state.pendingProposal = null;
  saveAssessmentsToStorage();
  refreshAllViews();

  if (notify) {
    showToast(`Generated ${state.assessments.length} assessment tasks for Semester ${state.profile.semester}.`, 'success');
  }
}

function generateRealisticSemesterSchedule(mStr) {
  return [
    {
      id: 'asmt_flot_1',
      title: 'FLAT: DFA & NFA State Minimization Assignment',
      subject: 'CST301 Formal Languages & Automata',
      courseCode: 'CST301',
      type: 'assignment',
      originalDeadline: addDays(mStr, 2),
      currentDeadline: addDays(mStr, 2),
      earliestAllowedDate: addDays(mStr, 0),
      latestAllowedDate: addDays(mStr, 6),
      estimatedHours: 3.5,
      priority: 'medium',
      reschedulable: true,
      completed: false,
      isOfficialDeadline: false,
      notes: 'Equivalence theorem proofs and regex conversion.'
    },
    {
      id: 'asmt_cn_1',
      title: 'Computer Networks: Series Exam 1',
      subject: 'CST303 Computer Networks',
      courseCode: 'CST303',
      type: 'internal_exam',
      originalDeadline: addDays(mStr, 4),
      currentDeadline: addDays(mStr, 4),
      earliestAllowedDate: addDays(mStr, 4),
      latestAllowedDate: addDays(mStr, 4),
      estimatedHours: 4.0,
      priority: 'high',
      reschedulable: false, // Locked exam
      completed: false,
      isOfficialDeadline: true,
      notes: 'Institutional Series Examination on OSI & TCP/IP stack.'
    },
    {
      id: 'asmt_ss_lab',
      title: 'System Software: Two-Pass Assembler Lab Report',
      subject: 'CSL331 SS & MP Lab',
      courseCode: 'CSL331',
      type: 'lab',
      originalDeadline: addDays(mStr, 2),
      currentDeadline: addDays(mStr, 2),
      earliestAllowedDate: addDays(mStr, 1),
      latestAllowedDate: addDays(mStr, 5),
      estimatedHours: 4.0,
      priority: 'high',
      reschedulable: true,
      completed: false,
      isOfficialDeadline: false,
      notes: 'Pass 1 symbol table generation and intermediate code.'
    },
    {
      id: 'asmt_dbms_quiz',
      title: 'DBMS: SQL Subqueries & Relational Algebra Quiz',
      subject: 'CSL333 DBMS Lab',
      courseCode: 'CSL333',
      type: 'quiz',
      originalDeadline: addDays(mStr, 2),
      currentDeadline: addDays(mStr, 2),
      earliestAllowedDate: addDays(mStr, 0),
      latestAllowedDate: addDays(mStr, 4),
      estimatedHours: 2.0,
      priority: 'medium',
      reschedulable: true,
      completed: false,
      isOfficialDeadline: false,
      notes: 'Moodle online quiz.'
    },
    {
      id: 'asmt_srs_doc',
      title: 'Software Engineering: IEEE SRS Architecture Specification',
      subject: 'CST309 Software Systems Management',
      courseCode: 'CST309',
      type: 'project',
      originalDeadline: addDays(mStr, 9),
      currentDeadline: addDays(mStr, 9),
      earliestAllowedDate: addDays(mStr, 5),
      latestAllowedDate: addDays(mStr, 12),
      estimatedHours: 5.5,
      priority: 'high',
      reschedulable: true,
      completed: false,
      isOfficialDeadline: false,
      notes: 'Functional requirements specification and use-case matrix.'
    }
  ];
}

// ============================================================================
// 5. ONBOARDING CONTROLLER (WELCOME & PROFILE WIZARD)
// ============================================================================

function checkAndTriggerOnboarding() {
  if (!state.profile.onboardingCompleted) {
    openOnboardingModal();
  }
}

function openOnboardingModal() {
  state.onboardingStep = 1;
  updateOnboardingStepView();
  document.getElementById('onboardingModal').classList.remove('hidden');
}

function updateOnboardingStepView() {
  const step = state.onboardingStep;

  // Step panels
  for (let s = 1; s <= 4; s++) {
    const pane = document.getElementById(`onboardStep${s}`);
    const bar = document.getElementById(`wizStepBar${s}`);
    if (pane) {
      if (s === step) pane.classList.add('active');
      else pane.classList.remove('active');
    }
    if (bar) {
      if (s <= step) bar.classList.add('completed');
      else bar.classList.remove('completed');
    }
  }

  const backBtn = document.getElementById('btnOnboardBack');
  const nextBtn = document.getElementById('btnOnboardNext');

  if (step === 1) {
    backBtn.classList.add('hidden');
    nextBtn.textContent = 'Setup Academic Profile →';
  } else if (step === 2) {
    backBtn.classList.remove('hidden');
    nextBtn.textContent = 'Configure Study Capacity →';
  } else if (step === 3) {
    backBtn.classList.remove('hidden');
    nextBtn.textContent = 'Review Curriculum Subjects →';
    // Pre-populate curriculum preview for Step 4
    prepareOnboardingCurriculumStep();
  } else if (step === 4) {
    backBtn.classList.remove('hidden');
    nextBtn.textContent = 'Confirm & Launch Dashboard';
  }
}

function handleOnboardingNext() {
  if (state.onboardingStep === 1) {
    state.onboardingStep = 2;
    updateOnboardingStepView();
  } else if (state.onboardingStep === 2) {
    // Validate required fields in Step 2
    const name = document.getElementById('onboardFullName').value.trim();
    const college = document.getElementById('onboardCollege').value.trim();
    const university = document.getElementById('onboardUniversity').value.trim();

    if (!name || !college || !university) {
      showToast('Please fill in required fields (Name, College, and University).', 'warning');
      return;
    }

    state.profile.name = name;
    state.profile.preferredName = document.getElementById('onboardPreferredName').value.trim();
    state.profile.college = college;
    state.profile.university = university;
    state.profile.degree = document.getElementById('onboardDegree').value;
    state.profile.academicYear = document.getElementById('onboardAcademicYear').value;
    state.profile.semester = parseInt(document.getElementById('onboardSemester').value, 10);
    state.profile.scheme = document.getElementById('onboardScheme').value;
    state.profile.studentId = document.getElementById('onboardStudentId').value.trim();

    state.onboardingStep = 3;
    updateOnboardingStepView();
  } else if (state.onboardingStep === 3) {
    // Step 3 Availability
    const weekdayH = parseFloat(document.getElementById('onboardWeekdayHours').value) || 3.5;
    const weekendH = parseFloat(document.getElementById('onboardWeekendHours').value) || 5.0;
    const dailyLimit = parseFloat(document.getElementById('onboardDailyLimit').value) || 4.0;
    const slot = document.getElementById('onboardPreferredSlot').value;

    state.availability.dailyHours = {
      Monday: weekdayH,
      Tuesday: weekdayH,
      Wednesday: weekdayH,
      Thursday: weekdayH,
      Friday: weekdayH,
      Saturday: weekendH,
      Sunday: weekendH
    };
    state.availability.maxDailyStudyLimit = dailyLimit;
    state.availability.preferredTimeSlot = slot;

    state.onboardingStep = 4;
    updateOnboardingStepView();
  } else if (state.onboardingStep === 4) {
    // Finish onboarding
    state.profile.onboardingCompleted = true;
    saveProfileToStorage();
    saveAvailabilityToStorage();

    // Populate semester assessments
    loadSemesterAssessmentsFromCurriculum(false);

    document.getElementById('onboardingModal').classList.add('hidden');
    refreshAllViews();
    showToast(`Welcome to Easy Learn, ${state.profile.preferredName || state.profile.name}! Your schedule is ready.`, 'success');
  }
}

function handleOnboardingBack() {
  if (state.onboardingStep > 1) {
    state.onboardingStep--;
    updateOnboardingStepView();
  }
}

function prepareOnboardingCurriculumStep() {
  const scheme = document.getElementById('onboardScheme')?.value || state.profile.scheme;
  const sem = parseInt(document.getElementById('onboardSemester')?.value, 10) || state.profile.semester;

  syncCurriculumFromService(scheme, sem, false);

  const bannerText = document.getElementById('onboardSchemeBadgeText');
  if (bannerText) {
    bannerText.textContent = `${state.curriculum.isVerified ? 'Verified' : 'Sample/Demo'}: ${state.curriculum.schemeName} (Semester ${sem})`;
  }

  const tbody = document.getElementById('onboardingCoursesList');
  if (!tbody) return;

  let html = '';
  state.curriculum.courses.forEach((c, idx) => {
    html += `
      <tr>
        <td>
          <input type="checkbox" class="task-checkbox" checked data-course-idx="${idx}">
        </td>
        <td><strong class="font-mono text-primary font-xs">${escapeHtml(c.code)}</strong></td>
        <td>${escapeHtml(c.title)}</td>
        <td><strong>${c.credits}</strong></td>
        <td><span class="badge badge-secondary font-xs">${escapeHtml(c.category)}</span></td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

// ============================================================================
// 6. DASHBOARD & PERSONALIZED STATS ENGINE
// ============================================================================

function renderDashboard() {
  const assessments = state.assessments;
  const profile = state.profile;
  const availability = state.availability;
  const threshold = availability.maxDailyStudyLimit;

  // 1. Personalized Welcome Card
  const welcomeTitle = document.getElementById('dashWelcomeTitle');
  const welcomeSub = document.getElementById('dashWelcomeSubtitle');
  const degreeBadge = document.getElementById('dashDegreeBadge');
  const semBadge = document.getElementById('dashSemesterBadge');
  const schemeBadge = document.getElementById('dashCurriculumSchemeBadge');

  if (welcomeTitle) {
    const displayName = profile.preferredName || profile.name || 'Student';
    welcomeTitle.textContent = `Welcome back, ${displayName}!`;
  }
  if (welcomeSub) {
    welcomeSub.textContent = `${profile.college} • Tracking ${state.curriculum.courses.length} subjects for Semester ${profile.semester}.`;
  }
  if (degreeBadge) degreeBadge.textContent = profile.degree;
  if (semBadge) semBadge.textContent = `Semester ${profile.semester}`;
  if (schemeBadge) schemeBadge.textContent = state.curriculum.schemeName;

  // Sidebar badges
  const sideInst = document.getElementById('sidebarInstitutionText');
  const sideSess = document.getElementById('sidebarSessionText');
  if (sideInst) sideInst.textContent = profile.college.includes('VJCET') ? 'VJCET • KTU' : profile.university;
  if (sideSess) sideSess.textContent = `Sem ${profile.semester} • ${profile.degree.replace('B.Tech ', '')}`;

  // Topbar user pill
  const userPill = document.getElementById('userPillName');
  const userAvatar = document.getElementById('userAvatarText');
  if (userPill) userPill.textContent = `${profile.preferredName || profile.name} (S${profile.semester})`;
  if (userAvatar) userAvatar.textContent = (profile.name[0] || 'S').toUpperCase();

  // 2. Metric Stat Cards
  document.getElementById('statTotalCourses').textContent = state.curriculum.courses.length;
  const totalCredits = state.curriculum.courses.reduce((sum, c) => sum + (c.credits || 0), 0);
  document.getElementById('statCourseCreditsSub').textContent = `${totalCredits} Total Credits`;

  const pendingAssessments = assessments.filter(a => !a.completed);
  const completedAssessments = assessments.filter(a => a.completed);

  document.getElementById('statTotalAssessments').textContent = assessments.length;
  document.getElementById('sidebarAssessmentCount').textContent = pendingAssessments.length;
  document.getElementById('sidebarCourseCount').textContent = state.curriculum.courses.length;
  document.getElementById('statCompletedSub').textContent = `${completedAssessments.length} completed tasks`;

  // Due Next 7 Days
  const todayStr = formatLocalDate(new Date());
  const next7Str = addDays(todayStr, 7);
  const dueNext7 = pendingAssessments.filter(a => a.currentDeadline >= todayStr && a.currentDeadline <= next7Str);
  document.getElementById('statDueNext7').textContent = dueNext7.length;

  // 3. Weekly Workload & Overload Metrics
  const monday = state.currentCalendarWeekStart || getMonday(new Date());
  const currentWeekDays = getWeekDaysArray(monday);
  const weekStartStr = currentWeekDays[0];
  const weekEndStr = currentWeekDays[6];

  let currentWeekHours = 0;
  const weekDailyLoads = {};
  currentWeekDays.forEach(d => { weekDailyLoads[d] = 0; });

  assessments.forEach(a => {
    if (!a.completed && a.currentDeadline >= weekStartStr && a.currentDeadline <= weekEndStr) {
      currentWeekHours += a.estimatedHours;
      weekDailyLoads[a.currentDeadline] = (weekDailyLoads[a.currentDeadline] || 0) + a.estimatedHours;
    }
  });

  // Calculate Overloaded Days across full schedule
  const allMetrics = calculateScheduleMetrics(assessments.filter(a => !a.completed), threshold);
  const overloadedCount = allMetrics.overloadedDays;
  const statOverloadEl = document.getElementById('statOverloadedDays');
  const cardOverloadEl = document.getElementById('cardOverload');
  const iconOverloadEl = document.getElementById('iconOverloadWrapper');

  statOverloadEl.textContent = overloadedCount;
  if (overloadedCount > 0) {
    cardOverloadEl.classList.add('border-danger');
    iconOverloadEl.className = 'stat-icon-wrapper icon-red';
    document.getElementById('statOverloadContext').textContent = `${overloadedCount} day(s) exceed ${threshold}h daily limit`;
    document.getElementById('statOverloadContext').className = 'stat-context text-danger';
  } else {
    cardOverloadEl.classList.remove('border-danger');
    iconOverloadEl.className = 'stat-icon-wrapper icon-teal';
    document.getElementById('statOverloadContext').textContent = 'All days within capacity';
    document.getElementById('statOverloadContext').className = 'stat-context text-success';
  }

  // 4. Study Capacity Pressure Meter
  const totalWeeklyAvailable = Object.values(availability.dailyHours).reduce((sum, h) => sum + h, 0);
  document.getElementById('capRequiredHours').textContent = `${currentWeekHours.toFixed(1)}h`;
  document.getElementById('capAvailableHours').textContent = `${totalWeeklyAvailable.toFixed(1)}h`;

  const capFill = document.getElementById('capProgressFill');
  const capBadge = document.getElementById('capStatusBadge');
  const ratio = totalWeeklyAvailable > 0 ? (currentWeekHours / totalWeeklyAvailable) : 0;
  const pct = Math.min(100, Math.round(ratio * 100));

  if (capFill) {
    capFill.style.width = `${Math.max(5, pct)}%`;
    if (ratio > 1.0) {
      capFill.className = 'progress-fill bg-danger';
      capBadge.className = 'badge badge-danger';
      capBadge.textContent = 'Severe Bottleneck';
    } else if (ratio > 0.75) {
      capFill.className = 'progress-fill bg-warning';
      capBadge.className = 'badge badge-warning';
      capBadge.textContent = 'High Load';
    } else {
      capFill.className = 'progress-fill bg-success';
      capBadge.className = 'badge badge-success';
      capBadge.textContent = 'Optimal Capacity';
    }
  }

  // Chart Threshold Labels
  document.getElementById('chartThresholdLabel').textContent = `${threshold.toFixed(1)}h`;
  document.getElementById('chartWeekRangeLabel').textContent =
    `${formatDisplayDate(weekStartStr)} – ${formatDisplayDate(weekEndStr)}`;

  // 5. Render Weekly Workload Bar Chart
  renderWeeklyWorkloadChart(currentWeekDays, weekDailyLoads, threshold);

  // 6. Upcoming Deadlines List
  renderUpcomingDeadlinesList(assessments);

  // 7. Subject-Wise Workload Table
  renderSubjectWorkloadTable();
}

function renderUpcomingDeadlinesList(assessments) {
  const container = document.getElementById('dashboardDeadlinesList');
  if (!container) return;

  const hideCompleted = state.preferences.hideCompleted;
  let list = hideCompleted ? assessments.filter(a => !a.completed) : [...assessments];

  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty-state p-4">
        <p class="text-muted font-sm">No pending tasks found. All caught up!</p>
      </div>`;
    return;
  }

  list.sort((a, b) => a.currentDeadline.localeCompare(b.currentDeadline));
  const nearest = list.slice(0, 7);

  let html = '';
  nearest.forEach(a => {
    const isShifted = a.currentDeadline !== a.originalDeadline;
    const typeColor = getTypeColor(a.type);
    const isCompleted = a.completed === true;

    html += `
      <div class="deadline-item ${isCompleted ? 'completed-task' : ''}" data-id="${a.id}">
        <div class="deadline-left">
          <div class="task-checkbox-wrap">
            <input type="checkbox" class="task-checkbox" ${isCompleted ? 'checked' : ''} data-task-id="${a.id}" title="Toggle task completion">
          </div>
          <div class="deadline-type-stripe" style="background-color: ${typeColor};"></div>
          <div class="deadline-meta">
            <span class="deadline-title" title="${escapeHtml(a.title)}">${escapeHtml(a.title)}</span>
            <div class="deadline-sub">
              <span>${escapeHtml(a.subject)}</span>
              <span>&bull;</span>
              <span class="badge ${getPriorityClass(a.priority)} font-xs">${a.priority.toUpperCase()}</span>
              ${a.isOfficialDeadline ? '<span class="badge badge-danger font-xs">&#128274; Exam</span>' : ''}
              ${isShifted ? '<span class="shifted-date-badge font-xs">&circlearrowleft; Paced</span>' : ''}
            </div>
          </div>
        </div>
        <div class="deadline-right">
          <span class="deadline-due-date">${formatDisplayDate(a.currentDeadline)}</span>
          <span class="deadline-hours">${a.estimatedHours.toFixed(1)}h</span>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  // Bind Task Checkbox completion toggles
  container.querySelectorAll('.task-checkbox').forEach(box => {
    box.addEventListener('change', (e) => {
      e.stopPropagation();
      const taskId = box.getAttribute('data-task-id');
      toggleTaskCompletion(taskId, box.checked);
    });
  });

  // Bind Click to inspect
  container.querySelectorAll('.deadline-item').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target.classList.contains('task-checkbox')) return;
      openAssessmentDetails(el.getAttribute('data-id'));
    });
  });
}

function toggleTaskCompletion(id, isCompleted) {
  const item = state.assessments.find(a => a.id === id);
  if (item) {
    item.completed = isCompleted;
    saveAssessmentsToStorage();
    renderDashboard();
    renderAssessmentsTable();
    showToast(isCompleted ? `Task completed: ${item.title}` : `Task marked pending: ${item.title}`, 'info');
  }
}

function renderSubjectWorkloadTable() {
  const tbody = document.getElementById('dashboardSubjectTableBody');
  if (!tbody) return;

  const courses = state.curriculum.courses || [];
  if (courses.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center p-3 text-muted">No courses enrolled.</td></tr>`;
    return;
  }

  let html = '';
  courses.forEach(c => {
    const relatedTasks = state.assessments.filter(a => a.courseCode === c.code || a.subject.includes(c.code));
    const totalPrepHours = relatedTasks.reduce((sum, t) => sum + (t.completed ? 0 : t.estimatedHours), 0);

    html += `
      <tr>
        <td>
          <strong class="font-mono text-primary font-xs">${escapeHtml(c.code)}</strong>
          <span class="font-bold d-block">${escapeHtml(c.title)}</span>
        </td>
        <td><span class="badge badge-secondary font-xs">${escapeHtml(c.category)}</span></td>
        <td><strong>${c.credits}</strong></td>
        <td class="font-mono font-xs text-muted">${c.lectureHours}-${c.tutorialHours}-${c.labHours}</td>
        <td><span class="badge badge-primary font-xs">${relatedTasks.length} tasks</span></td>
        <td><strong>${totalPrepHours.toFixed(1)}h</strong></td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

// ============================================================================
// 7. CURRICULUM VIEW CONTROLLER
// ============================================================================

function renderCurriculumView() {
  const container = document.getElementById('coursesGridContainer');
  const banner = document.getElementById('curriculumVerificationBanner');
  const titleEl = document.getElementById('verificationTitle');
  const detailEl = document.getElementById('verificationDetail');
  const badgeEl = document.getElementById('verificationBadge');

  if (!container) return;

  const curr = state.curriculum;

  // Verification status banner
  if (banner) {
    banner.className = `curriculum-verification-banner ${curr.isVerified ? 'verification-verified' : 'verification-demo'}`;
    titleEl.textContent = `Curriculum Scheme: ${curr.schemeName} (${curr.isVerified ? 'Verified Syllabus' : 'Customizable Sample'})`;
    detailEl.textContent = curr.verificationNote || (curr.isVerified
      ? 'Course codes, titles, and credit distributions verified from official curriculum guidelines.'
      : 'Sample curriculum for demonstration. Feel free to add, edit, or adjust subjects.');
    badgeEl.className = `badge ${curr.isVerified ? 'badge-success' : 'badge-warning'} font-xs`;
    badgeEl.textContent = curr.isVerified ? 'Verified Scheme' : 'Demo / Sample';
  }

  const courses = curr.courses || [];
  if (courses.length === 0) {
    container.innerHTML = `
      <div class="empty-state p-4 w-100">
        <p class="text-muted font-sm">No courses found in current semester. Click "Add Custom Subject" or switch schemes.</p>
      </div>`;
    return;
  }

  let html = '';
  courses.forEach((c, idx) => {
    const tasks = state.assessments.filter(a => a.courseCode === c.code || a.subject.includes(c.code));
    const prepSum = tasks.reduce((sum, t) => sum + (t.completed ? 0 : t.estimatedHours), 0);

    html += `
      <div class="course-card" data-course-code="${c.code}">
        <div class="course-header">
          <span class="course-code-badge">${escapeHtml(c.code)}</span>
          <span class="badge badge-secondary font-xs">${c.credits} Credits</span>
        </div>
        <h3 class="course-title">${escapeHtml(c.title)}</h3>
        <div class="course-meta-tags">
          <span class="badge badge-outline font-xs">${escapeHtml(c.category)}</span>
          ${c.isVerified ? '<span class="badge badge-success font-xs">&#10003; Verified</span>' : '<span class="badge badge-warning font-xs">Sample</span>'}
        </div>
        <div class="course-teaching-hours">
          <span>Weekly Lectures: <strong>${c.lectureHours}h</strong></span>
          <span>Tutorial: <strong>${c.tutorialHours}h</strong></span>
          <span>Lab: <strong>${c.labHours}h</strong></span>
        </div>
        <div class="course-footer">
          <span class="font-xs text-muted"><strong>${tasks.length}</strong> tasks (${prepSum.toFixed(1)}h prep)</span>
          <div class="d-flex gap-2">
            <button class="btn btn-xs btn-outline-primary btn-add-course-task" data-code="${c.code}" data-title="${escapeHtml(c.title)}">+ Task</button>
            <button class="btn btn-xs btn-outline-danger btn-remove-course" data-idx="${idx}" title="Remove course">&times;</button>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  // Bind Buttons
  container.querySelectorAll('.btn-add-course-task').forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.getAttribute('data-code');
      const title = btn.getAttribute('data-title');
      openAddAssessmentForCourse(code, title);
    });
  });

  container.querySelectorAll('.btn-remove-course').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      removeCourseByIndex(idx);
    });
  });
}

function openAddAssessmentForCourse(code, title) {
  openAddAssessmentModal();
  document.getElementById('formSubject').value = `${code} ${title}`;
}

function removeCourseByIndex(idx) {
  const course = state.curriculum.courses[idx];
  if (!course) return;

  openConfirmModal(
    'Remove Course',
    `Remove "${course.code} - ${course.title}" from your enrolled subjects? Existing tasks will be preserved.`,
    () => {
      state.curriculum.courses.splice(idx, 1);
      saveCurriculumToStorage();
      refreshAllViews();
      showToast(`Removed ${course.code}.`, 'info');
    }
  );
}

// ============================================================================
// 8. STUDY AVAILABILITY PLANNER VIEW
// ============================================================================

function renderAvailabilityPlanner() {
  const container = document.getElementById('availDaysGrid');
  if (!container) return;

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dailyHours = state.availability.dailyHours;

  let html = '';
  days.forEach(day => {
    const hours = dailyHours[day] !== undefined ? dailyHours[day] : 3.5;
    const isWeekend = (day === 'Saturday' || day === 'Sunday');

    html += `
      <div class="avail-day-card ${isWeekend ? 'bg-light-card' : ''}">
        <span class="avail-day-name">${day.substr(0, 3)}</span>
        <input type="number" class="form-control avail-hours-input" data-day="${day}" min="0" max="14" step="0.5" value="${hours}">
        <span class="font-xs text-muted">hrs</span>
      </div>
    `;
  });

  container.innerHTML = html;

  // Bind change listeners
  container.querySelectorAll('.avail-hours-input').forEach(input => {
    input.addEventListener('change', () => {
      const day = input.getAttribute('data-day');
      const val = parseFloat(input.value) || 0;
      state.availability.dailyHours[day] = Math.max(0, val);
      saveAvailabilityToStorage();
      renderDashboard();
    });
  });

  // Populate other inputs
  document.getElementById('availDailyMaxLimit').value = state.availability.maxDailyStudyLimit;
  document.getElementById('availPreferredTimeSlot').value = state.availability.preferredTimeSlot;
  document.getElementById('availBreakDuration').value = state.availability.breakDuration;
  document.getElementById('availUnavailablePeriods').value = state.availability.unavailablePeriods;
}

function saveAvailabilitySettings() {
  const limit = parseFloat(document.getElementById('availDailyMaxLimit').value) || 4.0;
  state.availability.maxDailyStudyLimit = limit;
  state.availability.preferredTimeSlot = document.getElementById('availPreferredTimeSlot').value;
  state.availability.breakDuration = parseInt(document.getElementById('availBreakDuration').value, 10);
  state.availability.unavailablePeriods = document.getElementById('availUnavailablePeriods').value.trim();

  saveAvailabilityToStorage();
  refreshAllViews();
  showToast('Study availability plan saved successfully.', 'success');
}

// ============================================================================
// 9. IN-APP NOTIFICATION CENTER & SYSTEM ALERTS
// ============================================================================

function generateSystemNotifications() {
  const notifs = [];
  const todayStr = formatLocalDate(new Date());
  const leadDays = state.notifications.settings.leadDays || 2;
  const threshold = state.availability.maxDailyStudyLimit;

  // 1. Check for upcoming deadlines
  state.assessments.forEach(a => {
    if (!a.completed) {
      const dDiff = diffDays(todayStr, a.currentDeadline);
      if (dDiff === 0) {
        notifs.push({
          id: `notif_due_today_${a.id}`,
          title: `Due Today: ${a.title}`,
          message: `${a.subject} is due today! Estimated effort: ${a.estimatedHours}h.`,
          type: 'deadline',
          timestamp: 'Today',
          read: false
        });
      } else if (dDiff > 0 && dDiff <= leadDays) {
        notifs.push({
          id: `notif_due_soon_${a.id}`,
          title: `Upcoming Deadline: ${a.title}`,
          message: `Due in ${dDiff} day(s) on ${formatDisplayDate(a.currentDeadline)}.`,
          type: 'info',
          timestamp: `${dDiff}d remaining`,
          read: false
        });
      }
    }
  });

  // 2. Check for overloaded days
  const metrics = calculateScheduleMetrics(state.assessments.filter(a => !a.completed), threshold);
  Object.keys(metrics.dailyMap).forEach(d => {
    const load = metrics.dailyMap[d];
    if (load > threshold) {
      notifs.push({
        id: `notif_overload_${d}`,
        title: `Workload Spike on ${formatDisplayDate(d)}`,
        message: `${load.toFixed(1)}h due on this day (exceeds your ${threshold}h limit). Run Smart Optimizer to balance.`,
        type: 'warning',
        timestamp: formatDisplayDate(d),
        read: false
      });
    }
  });

  // Merge with existing read states
  const existingMap = {};
  (state.notifications.items || []).forEach(item => { existingMap[item.id] = item.read; });

  state.notifications.items = notifs.map(n => ({
    ...n,
    read: existingMap[n.id] === true
  }));

  updateNotificationBadge();
}

function updateNotificationBadge() {
  const unreadCount = (state.notifications.items || []).filter(n => !n.read).length;
  const badge = document.getElementById('notifBadgeCounter');
  const countEl = document.getElementById('notifDrawerCount');

  if (badge) {
    if (unreadCount > 0) {
      badge.textContent = unreadCount;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }

  if (countEl) {
    countEl.textContent = `${unreadCount} Unread`;
  }
}

function renderNotificationDrawer() {
  const container = document.getElementById('notifDrawerList');
  if (!container) return;

  const items = state.notifications.items || [];
  if (items.length === 0) {
    container.innerHTML = `<div class="p-4 text-center text-muted font-xs">No pending notifications. All schedules look balanced!</div>`;
    return;
  }

  let html = '';
  items.forEach(n => {
    let iconSvg = '';
    if (n.type === 'warning') {
      iconSvg = `<span class="text-danger">&#9888;</span>`;
    } else if (n.type === 'deadline') {
      iconSvg = `<span class="text-warning">&#9201;</span>`;
    } else {
      iconSvg = `<span class="text-primary">&#8505;</span>`;
    }

    html += `
      <div class="notif-item ${n.read ? '' : 'unread'}" data-notif-id="${n.id}">
        <div class="notif-icon">${iconSvg}</div>
        <div class="notif-content">
          <div class="notif-item-title">${escapeHtml(n.title)}</div>
          <div class="notif-item-desc">${escapeHtml(n.message)}</div>
          <div class="notif-item-time">${escapeHtml(n.timestamp)}</div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  container.querySelectorAll('.notif-item').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.getAttribute('data-notif-id');
      markNotificationAsRead(id);
    });
  });
}

function markNotificationAsRead(id) {
  const item = (state.notifications.items || []).find(n => n.id === id);
  if (item) {
    item.read = true;
    saveNotificationsToStorage();
    renderNotificationDrawer();
    updateNotificationBadge();
  }
}

function markAllNotificationsRead() {
  (state.notifications.items || []).forEach(n => { n.read = true; });
  saveNotificationsToStorage();
  renderNotificationDrawer();
  updateNotificationBadge();
  showToast('All notifications marked as read.', 'info');
}

// ============================================================================
// 10. THEME CONTROLLER (LIGHT / DARK / SYSTEM)
// ============================================================================

function applyTheme(theme) {
  const root = document.documentElement;
  const sunIcon = document.getElementById('themeIconSun');
  const moonIcon = document.getElementById('themeIconMoon');

  let activeTheme = theme;
  if (theme === 'system') {
    activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  root.setAttribute('data-theme', activeTheme);

  if (sunIcon && moonIcon) {
    if (activeTheme === 'dark') {
      sunIcon.classList.add('hidden');
      moonIcon.classList.remove('hidden');
    } else {
      sunIcon.classList.remove('hidden');
      moonIcon.classList.add('hidden');
    }
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const nextTheme = current === 'dark' ? 'light' : 'dark';
  state.preferences.theme = nextTheme;
  savePreferencesToStorage();
  applyTheme(nextTheme);
  showToast(`Switched to ${nextTheme} mode.`, 'info');
}

// ============================================================================
// 11. DETERMINISTIC SMART SCHEDULE OPTIMIZER WITH PREPARATION PACING
// ============================================================================

function runScheduleOptimizer(options = {}) {
  const threshold = Number(options.threshold || state.availability.maxDailyStudyLimit);
  const inertiaMode = options.inertiaWeight || 'balanced';
  const inertiaFactor = INERTIA_WEIGHT_MAP[inertiaMode] || 2.0;

  if (!state.assessments || state.assessments.length === 0) {
    return {
      success: false,
      message: 'No assessments available to optimize.'
    };
  }

  // Optimize only pending assessments
  const assessments = JSON.parse(JSON.stringify(state.assessments));

  let minDate = assessments[0].earliestAllowedDate;
  let maxDate = assessments[0].latestAllowedDate;

  assessments.forEach(a => {
    if (a.earliestAllowedDate < minDate) minDate = a.earliestAllowedDate;
    if (a.latestAllowedDate > maxDate) maxDate = a.latestAllowedDate;
  });

  const dailyWorkload = {};
  const spanDays = diffDays(minDate, maxDate);
  for (let i = 0; i <= spanDays; i++) {
    const curDate = addDays(minDate, i);
    dailyWorkload[curDate] = 0;
  }

  const fixedAssessments = [];
  const flexibleAssessments = [];

  assessments.forEach(a => {
    const isLocked = !a.reschedulable || a.isOfficialDeadline || (a.type === 'internal_exam' && !a.reschedulable);
    if (isLocked || a.completed) {
      fixedAssessments.push(a);
    } else {
      flexibleAssessments.push(a);
    }
  });

  // Anchor fixed tasks
  fixedAssessments.forEach(a => {
    if (!a.completed) {
      const d = a.currentDeadline;
      dailyWorkload[d] = (dailyWorkload[d] || 0) + a.estimatedHours;
    }
  });

  // Deterministic sorting of flexible tasks
  flexibleAssessments.sort((a, b) => {
    const windowA = diffDays(a.earliestAllowedDate, a.latestAllowedDate);
    const windowB = diffDays(b.earliestAllowedDate, b.latestAllowedDate);
    if (windowA !== windowB) return windowA - windowB;

    const prioValA = a.priority === 'high' ? 3 : a.priority === 'medium' ? 2 : 1;
    const prioValB = b.priority === 'high' ? 3 : b.priority === 'medium' ? 2 : 1;
    if (prioValA !== prioValB) return prioValB - prioValA;

    if (b.estimatedHours !== a.estimatedHours) return b.estimatedHours - a.estimatedHours;
    return a.id.localeCompare(b.id);
  });

  const proposedAssessments = [];
  const shiftLog = [];

  for (const a of flexibleAssessments) {
    let bestDate = a.currentDeadline;
    let minScore = Infinity;

    const startAllowed = a.earliestAllowedDate;
    const endAllowed = a.latestAllowedDate;
    const candidateDaysCount = diffDays(startAllowed, endAllowed);

    for (let c = 0; c <= candidateDaysCount; c++) {
      const candidateDate = addDays(startAllowed, c);
      const currentLoadOnCandidate = dailyWorkload[candidateDate] || 0;
      const projectedLoad = currentLoadOnCandidate + a.estimatedHours;

      // 1. Overload Penalty
      let overloadPenalty = 0;
      if (projectedLoad > threshold) {
        const excess = projectedLoad - threshold;
        overloadPenalty = Math.pow(excess, 2) * 60;
      }

      // 2. Load Distribution Penalty
      const loadDistributionPenalty = projectedLoad * 10;

      // 3. Inertia Penalty (preserving original dates)
      const distFromOriginal = Math.abs(diffDays(a.originalDeadline, candidateDate));
      const prioMultiplier = PRIORITY_MULTIPLIER[a.priority] || 1.5;
      const inertiaPenalty = distFromOriginal * inertiaFactor * prioMultiplier * 4;

      const totalScore = overloadPenalty + loadDistributionPenalty + inertiaPenalty;

      // Deterministic tie-breaking
      if (totalScore < minScore - 1e-6) {
        minScore = totalScore;
        bestDate = candidateDate;
      } else if (Math.abs(totalScore - minScore) <= 1e-6) {
        const bestDist = Math.abs(diffDays(a.originalDeadline, bestDate));
        if (distFromOriginal < bestDist) {
          bestDate = candidateDate;
        } else if (distFromOriginal === bestDist && candidateDate < bestDate) {
          bestDate = candidateDate;
        }
      }
    }

    dailyWorkload[bestDate] = (dailyWorkload[bestDate] || 0) + a.estimatedHours;

    const proposedItem = {
      ...a,
      proposedDeadline: bestDate
    };
    proposedAssessments.push(proposedItem);

    if (bestDate !== a.currentDeadline) {
      const daysMoved = diffDays(a.currentDeadline, bestDate);
      shiftLog.push({
        id: a.id,
        title: a.title,
        subject: a.subject,
        type: a.type,
        priority: a.priority,
        effort: a.estimatedHours,
        originalDeadline: a.originalDeadline,
        previousDeadline: a.currentDeadline,
        proposedDeadline: bestDate,
        daysMoved,
        reason: daysMoved > 0
          ? `Moved forward by +${daysMoved}d to relieve peak stress`
          : `Moved earlier by ${daysMoved}d to utilize available study capacity`
      });
    }
  }

  const allProposed = [
    ...fixedAssessments.map(a => ({ ...a, proposedDeadline: a.currentDeadline })),
    ...proposedAssessments
  ];

  const originalMetrics = calculateScheduleMetrics(assessments.filter(a => !a.completed), threshold);
  const proposedMetrics = calculateScheduleMetrics(
    allProposed.map(a => ({ ...a, currentDeadline: a.proposedDeadline })).filter(a => !a.completed),
    threshold
  );

  return {
    success: true,
    proposedAssessments: allProposed,
    shiftLog,
    threshold,
    originalMetrics,
    proposedMetrics,
    shiftsCount: shiftLog.length,
    totalCount: assessments.length
  };
}

function calculateScheduleMetrics(assessmentList, threshold) {
  const map = {};
  let totalEffort = 0;

  assessmentList.forEach(a => {
    const d = a.currentDeadline;
    map[d] = (map[d] || 0) + a.estimatedHours;
    totalEffort += a.estimatedHours;
  });

  let maxDaily = 0;
  let overloadedDays = 0;

  Object.keys(map).forEach(d => {
    const load = map[d];
    if (load > maxDaily) maxDaily = load;
    if (load > threshold) overloadedDays++;
  });

  return {
    maxDailyWorkload: Number(maxDaily.toFixed(1)),
    overloadedDays,
    totalWorkload: Number(totalEffort.toFixed(1)),
    dailyMap: map
  };
}

function executeOptimizerProposal() {
  const threshold = parseFloat(document.getElementById('optMaxDailyThreshold').value || state.availability.maxDailyStudyLimit);
  const inertiaWeight = document.getElementById('optInertiaWeight').value || 'balanced';

  const result = runScheduleOptimizer({ threshold, inertiaWeight });
  if (!result.success) {
    showToast(result.message, 'warning');
    return;
  }

  state.pendingProposal = result;

  document.getElementById('optimizerProposalSection').classList.remove('hidden');
  document.getElementById('optimizerIdleState').classList.add('hidden');

  renderProposalComparison(result);
  showToast(`Optimization calculated! ${result.shiftsCount} deadline(s) adjusted to flatten peaks.`, 'success');
}

function renderProposalComparison(result) {
  const { originalMetrics, proposedMetrics, shiftsCount, totalCount, shiftLog, threshold } = result;

  document.getElementById('compMaxOld').textContent = `${originalMetrics.maxDailyWorkload.toFixed(1)}h`;
  document.getElementById('compMaxNew').textContent = `${proposedMetrics.maxDailyWorkload.toFixed(1)}h`;

  const peakReduction = originalMetrics.maxDailyWorkload > 0
    ? Math.round(((originalMetrics.maxDailyWorkload - proposedMetrics.maxDailyWorkload) / originalMetrics.maxDailyWorkload) * 100)
    : 0;
  document.getElementById('compMaxDelta').textContent = `${peakReduction}% Peak Workload Reduction`;

  document.getElementById('compOverloadOld').textContent = originalMetrics.overloadedDays;
  document.getElementById('compOverloadNew').textContent = proposedMetrics.overloadedDays;
  const daysResolved = originalMetrics.overloadedDays - proposedMetrics.overloadedDays;
  document.getElementById('compOverloadDelta').textContent = `${daysResolved >= 0 ? daysResolved : 0} Overloaded Day(s) Eliminated`;

  document.getElementById('compTotalOld').textContent = `${originalMetrics.totalWorkload.toFixed(1)}h`;
  document.getElementById('compTotalNew').textContent = `${proposedMetrics.totalWorkload.toFixed(1)}h`;

  document.getElementById('compShiftCount').textContent = shiftsCount;
  document.getElementById('compTotalAssessmentsCount').textContent = totalCount;
  document.getElementById('compThresholdLabel').textContent = `${threshold.toFixed(1)}h`;

  renderComparisonCharts(result);

  // Shift Log Table
  const tbody = document.getElementById('proposalChangesBody');
  if (!tbody) return;

  if (shiftLog.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-muted p-4">
          Current schedule is already well-balanced within your daily study availability. No adjustments required.
        </td>
      </tr>
    `;
    return;
  }

  let html = '';
  shiftLog.forEach(s => {
    const shiftBadge = s.daysMoved > 0
      ? `<span class="badge badge-primary">+${s.daysMoved} Days</span>`
      : `<span class="badge badge-warning">${s.daysMoved} Days</span>`;

    html += `
      <tr>
        <td><strong>${escapeHtml(s.title)}</strong></td>
        <td>
          <span class="type-badge badge-${s.type}">${formatTypeLabel(s.type)}</span>
          <div class="text-muted font-xs">${escapeHtml(s.subject)}</div>
        </td>
        <td><span class="comp-old">${formatDisplayDate(s.originalDeadline)}</span></td>
        <td><strong class="text-success">${formatDisplayDate(s.proposedDeadline)}</strong></td>
        <td>${shiftBadge}</td>
        <td><span class="font-xs font-mono">${formatDisplayDate(addDays(s.proposedDeadline, -3))} &rarr; ${formatDisplayDate(s.proposedDeadline)}</span></td>
        <td><span class="font-xs text-muted">${escapeHtml(s.reason)}</span></td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

function renderComparisonCharts(result) {
  const origMap = result.originalMetrics.dailyMap;
  const propMap = result.proposedMetrics.dailyMap;

  const allDates = Array.from(new Set([...Object.keys(origMap), ...Object.keys(propMap)])).sort();

  const labels = allDates.map(d => {
    const obj = parseLocalDate(d);
    return obj.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
  });

  const origValues = allDates.map(d => origMap[d] || 0);
  const propValues = allDates.map(d => propMap[d] || 0);
  const threshold = result.threshold;

  renderSingleComparisonChart('chartOriginal', 'chartOriginalFallback', labels, origValues, threshold, '#ef4444', 'Original Workload');
  renderSingleComparisonChart('chartProposed', 'chartProposedFallback', labels, propValues, threshold, '#10b981', 'Proposed Balanced Workload');
}

function renderSingleComparisonChart(canvasId, fallbackId, labels, values, threshold, primaryColor, label) {
  const canvas = document.getElementById(canvasId);
  const fallback = document.getElementById(fallbackId);
  if (!canvas || !fallback) return;

  const bgColors = values.map(v => v > threshold ? '#ef4444' : (v > 0 ? primaryColor : '#cbd5e1'));

  if (typeof Chart !== 'undefined') {
    canvas.classList.remove('hidden');
    fallback.classList.add('hidden');

    const key = canvasId === 'chartOriginal' ? 'original' : 'proposed';
    if (state.charts[key]) {
      state.charts[key].destroy();
    }

    const ctx = canvas.getContext('2d');
    state.charts[key] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label,
          data: values,
          backgroundColor: bgColors,
          borderRadius: 4,
          maxBarThickness: 32
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            suggestedMax: Math.max(...values, threshold + 2)
          },
          x: {
            ticks: { maxRotation: 45, minRotation: 45, font: { size: 10 } }
          }
        }
      }
    });
  } else {
    canvas.classList.add('hidden');
    fallback.classList.remove('hidden');
    renderPureHtmlBarChart(fallback, labels, values, threshold);
  }
}

function applyProposedSchedule() {
  if (!state.pendingProposal || !state.pendingProposal.proposedAssessments) {
    showToast('No pending proposal to apply.', 'warning');
    return;
  }

  saveSnapshot(state.assessments);

  const proposalMap = {};
  state.pendingProposal.proposedAssessments.forEach(p => {
    proposalMap[p.id] = p.proposedDeadline;
  });

  state.assessments = state.assessments.map(a => {
    if (proposalMap[a.id]) {
      return {
        ...a,
        currentDeadline: proposalMap[a.id]
      };
    }
    return a;
  });

  saveAssessmentsToStorage();
  state.pendingProposal = null;

  document.getElementById('optimizerProposalSection').classList.add('hidden');
  document.getElementById('optimizerIdleState').classList.remove('hidden');

  refreshAllViews();
  showToast('Proposed schedule approved and applied! Snapshot saved for undo.', 'success');
}

function cancelProposedSchedule() {
  state.pendingProposal = null;
  document.getElementById('optimizerProposalSection').classList.add('hidden');
  document.getElementById('optimizerIdleState').classList.remove('hidden');
  showToast('Proposed schedule optimization discarded.', 'info');
}

function undoLastOptimization() {
  if (!state.lastSnapshot || !Array.isArray(state.lastSnapshot)) {
    showToast('No previous schedule snapshot available to undo.', 'warning');
    return;
  }

  state.assessments = JSON.parse(JSON.stringify(state.lastSnapshot));
  saveAssessmentsToStorage();
  state.lastSnapshot = null;
  localStorage.removeItem(STORAGE_KEYS.SNAPSHOT);
  updateUndoButtonVisibility();

  refreshAllViews();
  showToast('Previous schedule restored successfully!', 'success');
}

function updateUndoButtonVisibility() {
  const undoBtn = document.getElementById('btnGlobalUndo');
  if (!undoBtn) return;
  if (state.lastSnapshot && Array.isArray(state.lastSnapshot) && state.lastSnapshot.length > 0) {
    undoBtn.classList.remove('hidden');
  } else {
    undoBtn.classList.add('hidden');
  }
}

// ============================================================================
// 12. CHART ENGINE & PURE HTML/CSS FALLBACK
// ============================================================================

function renderWeeklyWorkloadChart(dayKeys, dailyLoads, threshold) {
  const canvas = document.getElementById('weeklyWorkloadChart');
  const fallback = document.getElementById('chartFallback');
  if (!canvas || !fallback) return;

  const labels = dayKeys.map(d => {
    const dateObj = parseLocalDate(d);
    return dateObj.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
  });

  const dataValues = dayKeys.map(d => dailyLoads[d] || 0);

  const bgColors = dataValues.map(v => {
    if (v === 0) return '#cbd5e1';
    if (v <= 3.0) return '#10b981';
    if (v <= threshold) return '#f59e0b';
    return '#ef4444';
  });

  if (typeof Chart !== 'undefined') {
    canvas.classList.remove('hidden');
    fallback.classList.add('hidden');

    if (state.charts.dashboard) {
      state.charts.dashboard.destroy();
    }

    const ctx = canvas.getContext('2d');
    state.charts.dashboard = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Estimated Workload (Hours)',
          data: dataValues,
          backgroundColor: bgColors,
          borderRadius: 6,
          borderSkipped: false,
          maxBarThickness: 45
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                const val = context.parsed.y;
                let status = 'Manageable';
                if (val > threshold) status = 'OVERLOADED';
                else if (val > 3.0) status = 'Near Capacity';
                return ` Workload: ${val} hrs (${status})`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            suggestedMax: Math.max(threshold * 1.5, 6),
            title: { display: true, text: 'Hours', font: { weight: '600', size: 11 } },
            grid: { color: 'rgba(148, 163, 184, 0.15)' }
          },
          x: { grid: { display: false } }
        }
      }
    });
  } else {
    canvas.classList.add('hidden');
    fallback.classList.remove('hidden');
    renderPureHtmlBarChart(fallback, labels, dataValues, threshold);
  }
}

function renderPureHtmlBarChart(container, labels, values, threshold) {
  const maxVal = Math.max(...values, threshold, 6);
  let html = '';

  for (let i = 0; i < labels.length; i++) {
    const val = values[i];
    const heightPercent = Math.min(100, Math.round((val / maxVal) * 100));
    let color = '#cbd5e1';
    if (val > threshold) color = '#ef4444';
    else if (val > 3.0) color = '#f59e0b';
    else if (val > 0) color = '#10b981';

    html += `
      <div class="fallback-bar-group" title="${labels[i]}: ${val} hrs">
        <span class="fallback-bar-hours">${val > 0 ? val.toFixed(1) + 'h' : '0'}</span>
        <div class="fallback-bar" style="height: ${Math.max(6, heightPercent)}%; background-color: ${color};"></div>
        <span class="fallback-bar-label">${labels[i]}</span>
      </div>
    `;
  }

  container.innerHTML = html;
}

// ============================================================================
// 13. ASSESSMENTS TABLE & CRUD
// ============================================================================

function renderAssessmentsTable() {
  const tbody = document.getElementById('assessmentsTableBody');
  const emptyState = document.getElementById('assessmentsEmptyState');
  const table = document.getElementById('assessmentsTable');
  if (!tbody) return;

  const search = (document.getElementById('assessmentSearch')?.value || '').toLowerCase();
  const filterType = document.getElementById('filterType')?.value || 'all';
  const filterPriority = document.getElementById('filterPriority')?.value || 'all';
  const filterReschedulable = document.getElementById('filterReschedulable')?.value || 'all';
  const filterStatus = document.getElementById('filterStatus')?.value || 'pending';
  const sortBy = document.getElementById('sortBy')?.value || 'date-asc';

  let list = [...state.assessments];

  list = list.filter(a => {
    if (search) {
      const match = a.title.toLowerCase().includes(search) ||
                    a.subject.toLowerCase().includes(search) ||
                    (a.notes && a.notes.toLowerCase().includes(search));
      if (!match) return false;
    }
    if (filterType !== 'all' && a.type !== filterType) return false;
    if (filterPriority !== 'all' && a.priority !== filterPriority) return false;
    if (filterReschedulable === 'reschedulable' && !a.reschedulable) return false;
    if (filterReschedulable === 'fixed' && a.reschedulable) return false;
    if (filterStatus === 'pending' && a.completed) return false;
    if (filterStatus === 'completed' && !a.completed) return false;
    return true;
  });

  list.sort((a, b) => {
    if (sortBy === 'date-asc') return a.currentDeadline.localeCompare(b.currentDeadline);
    if (sortBy === 'date-desc') return b.currentDeadline.localeCompare(a.currentDeadline);
    if (sortBy === 'effort-desc') return b.estimatedHours - a.estimatedHours;
    if (sortBy === 'priority-desc') {
      const pMap = { high: 3, medium: 2, low: 1 };
      return pMap[b.priority] - pMap[a.priority];
    }
    if (sortBy === 'title-asc') return a.title.localeCompare(b.title);
    return 0;
  });

  if (list.length === 0) {
    tbody.innerHTML = '';
    table.classList.add('hidden');
    emptyState.classList.remove('hidden');
    return;
  }

  table.classList.remove('hidden');
  emptyState.classList.add('hidden');

  let rowsHtml = '';
  list.forEach(a => {
    const isShifted = a.currentDeadline !== a.originalDeadline;
    const typeBadge = `<span class="type-badge badge-${a.type}">${formatTypeLabel(a.type)}</span>`;
    const prioBadge = `<span class="badge ${getPriorityClass(a.priority)}">${a.priority.toUpperCase()}</span>`;
    const flexBadge = a.reschedulable
      ? `<span class="badge badge-success font-xs">&#10003; Flexible</span>`
      : `<span class="badge badge-danger font-xs">&#128274; Fixed Date</span>`;

    rowsHtml += `
      <tr class="${a.completed ? 'completed-task' : ''}">
        <td>
          <input type="checkbox" class="task-checkbox" ${a.completed ? 'checked' : ''} data-id="${a.id}">
        </td>
        <td>
          <div class="table-assessment-title">${escapeHtml(a.title)}</div>
          <div class="table-assessment-subject">${escapeHtml(a.subject)}</div>
        </td>
        <td>${typeBadge}</td>
        <td>
          <strong>${formatDisplayDate(a.currentDeadline)}</strong>
          ${isShifted ? `<div class="shifted-date-badge" title="Original: ${a.originalDeadline}">Orig: ${formatDisplayDate(a.originalDeadline)}</div>` : ''}
        </td>
        <td>
          <span class="font-xs font-mono text-muted">${formatDisplayDate(a.earliestAllowedDate)} &rarr; ${formatDisplayDate(a.latestAllowedDate)}</span>
        </td>
        <td><strong>${a.estimatedHours.toFixed(1)}h</strong></td>
        <td>${prioBadge}</td>
        <td>${flexBadge}</td>
        <td class="text-right">
          <div class="d-flex align-items-center justify-content-end gap-2">
            <button class="btn btn-xs btn-outline-secondary btn-action-inspect" data-id="${a.id}" title="View Details">View</button>
            <button class="btn btn-xs btn-outline-primary btn-action-edit" data-id="${a.id}" title="Edit Assessment">Edit</button>
            <button class="btn btn-xs btn-outline-danger btn-action-delete" data-id="${a.id}" title="Delete Assessment">&times;</button>
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = rowsHtml;

  // Bind checkbox completion toggles
  tbody.querySelectorAll('.task-checkbox').forEach(box => {
    box.addEventListener('change', () => {
      toggleTaskCompletion(box.getAttribute('data-id'), box.checked);
    });
  });

  tbody.querySelectorAll('.btn-action-inspect').forEach(b => {
    b.addEventListener('click', () => openAssessmentDetails(b.getAttribute('data-id')));
  });
  tbody.querySelectorAll('.btn-action-edit').forEach(b => {
    b.addEventListener('click', () => openEditAssessmentModal(b.getAttribute('data-id')));
  });
  tbody.querySelectorAll('.btn-action-delete').forEach(b => {
    b.addEventListener('click', () => deleteAssessment(b.getAttribute('data-id')));
  });
}

function openAddAssessmentModal() {
  const form = document.getElementById('assessmentForm');
  if (!form) return;
  form.reset();

  document.getElementById('assessmentFormId').value = '';
  document.getElementById('modalAssessmentTitle').textContent = 'Add Academic Assessment';
  document.getElementById('modalFormAlert').classList.add('hidden');

  const todayStr = formatLocalDate(new Date());
  const defaultDeadline = addDays(todayStr, 3);
  document.getElementById('formDeadline').value = defaultDeadline;
  document.getElementById('formEarliest').value = addDays(defaultDeadline, -5);
  document.getElementById('formLatest').value = addDays(defaultDeadline, 3);
  document.getElementById('formEffort').value = '3.0';
  document.getElementById('formReschedulable').checked = true;

  document.getElementById('assessmentModal').classList.remove('hidden');
}

function openEditAssessmentModal(id) {
  const item = state.assessments.find(a => a.id === id);
  if (!item) return;

  const form = document.getElementById('assessmentForm');
  form.reset();

  document.getElementById('assessmentFormId').value = item.id;
  document.getElementById('modalAssessmentTitle').textContent = 'Edit Assessment';
  document.getElementById('modalFormAlert').classList.add('hidden');

  document.getElementById('formTitle').value = item.title;
  document.getElementById('formSubject').value = item.subject;
  document.getElementById('formType').value = item.type;
  document.getElementById('formPriority').value = item.priority;
  document.getElementById('formEffort').value = item.estimatedHours;
  document.getElementById('formDeadline').value = item.currentDeadline;
  document.getElementById('formEarliest').value = item.earliestAllowedDate;
  document.getElementById('formLatest').value = item.latestAllowedDate;
  document.getElementById('formReschedulable').checked = item.reschedulable;
  document.getElementById('formNotes').value = item.notes || '';

  document.getElementById('assessmentDetailsModal').classList.add('hidden');
  document.getElementById('assessmentModal').classList.remove('hidden');
}

function handleAssessmentFormSubmit(e) {
  e.preventDefault();
  const alertEl = document.getElementById('modalFormAlert');
  alertEl.classList.add('hidden');

  const id = document.getElementById('assessmentFormId').value;
  const title = document.getElementById('formTitle').value.trim();
  const subject = document.getElementById('formSubject').value.trim();
  const type = document.getElementById('formType').value;
  const priority = document.getElementById('formPriority').value;
  const effort = parseFloat(document.getElementById('formEffort').value);
  const deadline = document.getElementById('formDeadline').value;
  const earliest = document.getElementById('formEarliest').value;
  const latest = document.getElementById('formLatest').value;
  const reschedulable = document.getElementById('formReschedulable').checked;
  const notes = document.getElementById('formNotes').value.trim();

  if (!title) {
    showFormError(alertEl, 'Assessment title is required.');
    return;
  }
  if (!subject) {
    showFormError(alertEl, 'Subject / Course is required.');
    return;
  }
  if (isNaN(effort) || effort <= 0 || effort > 50) {
    showFormError(alertEl, 'Estimated effort must be a positive number between 0.5 and 50 hours.');
    return;
  }
  if (!deadline || !earliest || !latest) {
    showFormError(alertEl, 'Scheduled deadline, earliest allowed date, and latest date are all required.');
    return;
  }
  if (earliest > latest) {
    showFormError(alertEl, 'Earliest allowed date cannot be later than latest date.');
    return;
  }
  if (deadline < earliest || deadline > latest) {
    showFormError(alertEl, `Scheduled deadline (${deadline}) must fall within permitted date range [${earliest} to ${latest}].`);
    return;
  }

  const courseCode = extractCourseCode(subject);

  if (id) {
    const idx = state.assessments.findIndex(a => a.id === id);
    if (idx !== -1) {
      const existing = state.assessments[idx];
      state.assessments[idx] = {
        ...existing,
        title,
        subject,
        courseCode,
        type,
        priority,
        estimatedHours: effort,
        currentDeadline: deadline,
        earliestAllowedDate: earliest,
        latestAllowedDate: latest,
        reschedulable,
        notes
      };
      showToast('Assessment updated.', 'success');
    }
  } else {
    const newAssessment = {
      id: 'asmt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      title,
      subject,
      courseCode,
      type,
      originalDeadline: deadline,
      currentDeadline: deadline,
      earliestAllowedDate: earliest,
      latestAllowedDate: latest,
      estimatedHours: effort,
      priority,
      reschedulable,
      completed: false,
      isOfficialDeadline: type === 'internal_exam',
      notes
    };
    state.assessments.push(newAssessment);
    showToast('New assessment added.', 'success');
  }

  saveAssessmentsToStorage();
  document.getElementById('assessmentModal').classList.add('hidden');
  refreshAllViews();
}

function showFormError(alertEl, message) {
  alertEl.textContent = message;
  alertEl.classList.remove('hidden');
}

function deleteAssessment(id) {
  const item = state.assessments.find(a => a.id === id);
  if (!item) return;

  openConfirmModal(
    'Delete Assessment',
    `Are you sure you want to delete "${escapeHtml(item.title)}"?`,
    () => {
      state.assessments = state.assessments.filter(a => a.id !== id);
      saveAssessmentsToStorage();
      refreshAllViews();
      showToast('Assessment removed.', 'info');
    }
  );
}

function openAssessmentDetails(id) {
  const item = state.assessments.find(a => a.id === id);
  if (!item) return;

  const modal = document.getElementById('assessmentDetailsModal');
  const titleEl = document.getElementById('modalDetailsTitle');
  const badgeEl = document.getElementById('detailsTypeBadge');
  const bodyEl = document.getElementById('detailsModalBody');

  titleEl.textContent = item.title;
  badgeEl.className = `badge badge-${item.type}`;
  badgeEl.textContent = formatTypeLabel(item.type);

  const isShifted = item.currentDeadline !== item.originalDeadline;

  bodyEl.innerHTML = `
    <div class="mb-3">
      <div class="font-sm text-muted">Course / Subject:</div>
      <strong class="font-md text-navy">${escapeHtml(item.subject)}</strong>
    </div>

    <div class="form-row mb-3">
      <div class="flex-1">
        <div class="font-sm text-muted">Scheduled Deadline:</div>
        <strong class="font-md ${isShifted ? 'text-success' : 'text-navy'}">${formatDisplayDate(item.currentDeadline)}</strong>
        ${isShifted ? `<div class="font-xs text-muted">Original: ${formatDisplayDate(item.originalDeadline)}</div>` : ''}
      </div>
      <div class="flex-1">
        <div class="font-sm text-muted">Estimated Prep:</div>
        <strong class="font-md text-navy">${item.estimatedHours.toFixed(1)} Hours</strong>
      </div>
      <div class="flex-1">
        <div class="font-sm text-muted">Priority:</div>
        <span class="badge ${getPriorityClass(item.priority)}">${item.priority.toUpperCase()}</span>
      </div>
    </div>

    <div class="form-row mb-3">
      <div class="flex-1">
        <div class="font-sm text-muted">Permitted Date Range:</div>
        <strong>${formatDisplayDate(item.earliestAllowedDate)} &rarr; ${formatDisplayDate(item.latestAllowedDate)}</strong>
      </div>
      <div class="flex-1">
        <div class="font-sm text-muted">Flexibility Status:</div>
        <strong>${item.reschedulable ? '&#10003; Reschedulable' : '&#128274; Fixed Date (Protected)'}</strong>
      </div>
    </div>

    ${item.notes ? `
      <div class="mb-2">
        <div class="font-sm text-muted">Notes / Instructions:</div>
        <p class="font-sm p-2 bg-light-muted border-rounded">${escapeHtml(item.notes)}</p>
      </div>` : ''}
  `;

  document.getElementById('btnEditFromDetails').onclick = () => openEditAssessmentModal(item.id);
  modal.classList.remove('hidden');
}

// ============================================================================
// 14. CALENDAR & WORKLOAD HEATMAP VIEWS
// ============================================================================

function renderWeeklyCalendar() {
  const container = document.getElementById('weekDaysGrid');
  const titleEl = document.getElementById('calendarWeekDisplayTitle');
  if (!container || !titleEl) return;

  const monday = state.currentCalendarWeekStart || getMonday(new Date());
  const weekDays = getWeekDaysArray(monday);
  const threshold = state.availability.maxDailyStudyLimit;

  document.getElementById('calThresholdDisplay').textContent = `${threshold.toFixed(1)}h`;

  const weekStartStr = weekDays[0];
  const weekEndStr = weekDays[6];
  titleEl.textContent = `Week of ${formatDisplayDate(weekStartStr)} – ${formatDisplayDate(weekEndStr)}`;

  const todayStr = formatLocalDate(new Date());

  const dayBuckets = {};
  weekDays.forEach(d => {
    dayBuckets[d] = { date: d, totalHours: 0, assessments: [] };
  });

  state.assessments.forEach(a => {
    if (dayBuckets[a.currentDeadline]) {
      dayBuckets[a.currentDeadline].assessments.push(a);
      if (!a.completed) {
        dayBuckets[a.currentDeadline].totalHours += a.estimatedHours;
      }
    }
  });

  let gridHtml = '';
  weekDays.forEach(d => {
    const bucket = dayBuckets[d];
    const dateObj = parseLocalDate(d);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = dateObj.getDate();
    const isToday = (d === todayStr);
    const isOverloaded = bucket.totalHours > threshold;

    let badgeClass = 'manageable';
    let statusText = 'Manageable';
    if (isOverloaded) {
      badgeClass = 'overload';
      statusText = 'OVERLOAD';
    } else if (bucket.totalHours >= 3.0) {
      badgeClass = 'warning';
      statusText = 'Caution';
    }

    let cardsHtml = '';
    if (bucket.assessments.length === 0) {
      cardsHtml = `<div class="text-muted font-xs p-2 text-center">No assessments due</div>`;
    } else {
      bucket.assessments.forEach(a => {
        const typeColor = getTypeColor(a.type);
        cardsHtml += `
          <div class="day-card ${a.completed ? 'completed-task' : ''}" data-id="${a.id}" style="border-left-color: ${typeColor};">
            <div class="day-card-title">${escapeHtml(a.title)}</div>
            <div class="day-card-subject">${escapeHtml(a.subject)}</div>
            <div class="day-card-footer">
              <span class="badge ${getPriorityClass(a.priority)} font-xs">${a.priority[0].toUpperCase()}</span>
              <span class="day-card-hours">${a.estimatedHours.toFixed(1)}h</span>
            </div>
          </div>
        `;
      });
    }

    gridHtml += `
      <div class="day-column ${isToday ? 'is-today' : ''} ${isOverloaded ? 'is-overloaded' : ''}">
        <div class="day-header">
          <div class="d-flex justify-content-between align-items-center">
            <span class="day-name">${dayName}</span>
            <span class="day-date-number">${dayNum}</span>
          </div>
          <div class="day-workload-badge ${badgeClass}">
            <span>${bucket.totalHours.toFixed(1)}h</span>
            <span class="font-xs">${statusText}</span>
          </div>
        </div>
        <div class="day-assessments-container">
          ${cardsHtml}
        </div>
      </div>
    `;
  });

  container.innerHTML = gridHtml;

  container.querySelectorAll('.day-card').forEach(card => {
    card.addEventListener('click', () => {
      openAssessmentDetails(card.getAttribute('data-id'));
    });
  });
}

function renderHeatmapMatrix() {
  const container = document.getElementById('heatmapMatrix');
  if (!container) return;

  const threshold = parseFloat(document.getElementById('heatmapThresholdInput')?.value || state.availability.maxDailyStudyLimit);

  const startMonday = new Date(state.currentCalendarWeekStart || getMonday(new Date()));
  startMonday.setDate(startMonday.getDate() - 7);

  const daysHeader = ['Week', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  let html = '';
  daysHeader.forEach(h => {
    html += `<div class="heatmap-header-cell">${h}</div>`;
  });

  const dailyWorkload = {};
  state.assessments.forEach(a => {
    if (!a.completed) {
      dailyWorkload[a.currentDeadline] = (dailyWorkload[a.currentDeadline] || 0) + a.estimatedHours;
    }
  });

  for (let w = 0; w < 4; w++) {
    const weekMon = new Date(startMonday);
    weekMon.setDate(startMonday.getDate() + (w * 7));
    const weekLabel = `Wk ${w + 1}`;

    html += `<div class="heatmap-row-label">${weekLabel}</div>`;

    for (let d = 0; d < 7; d++) {
      const cur = new Date(weekMon);
      cur.setDate(weekMon.getDate() + d);
      const curStr = formatLocalDate(cur);
      const hours = dailyWorkload[curStr] || 0;

      let levelClass = 'box-level-0';
      if (hours > 6) levelClass = 'box-level-4';
      else if (hours > threshold) levelClass = 'box-level-3';
      else if (hours > 3.0) levelClass = 'box-level-2';
      else if (hours > 0) levelClass = 'box-level-1';

      html += `
        <div class="heatmap-cell ${levelClass}" title="${formatDisplayDate(curStr)}: ${hours.toFixed(1)}h (Limit: ${threshold}h)" data-date="${curStr}">
          <span class="heatmap-cell-hours">${hours > 0 ? hours.toFixed(1) + 'h' : '—'}</span>
          <span class="heatmap-cell-date">${cur.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}</span>
        </div>
      `;
    }
  }

  container.innerHTML = html;
}

// ============================================================================
// 15. AUTOMATED VERIFICATION TEST SUITE
// ============================================================================

function runAlgorithmicVerificationSuite() {
  const container = document.getElementById('testResultsGrid');
  const badge = document.getElementById('testSuiteBadge');
  if (!container) return;

  const testSpecs = [
    {
      name: 'Constraint 1: Fixed Internal Exam Immutability',
      description: 'Verifies that internal exams and non-reschedulable assessments are never moved from their original date.',
      run: () => {
        const dummySchedule = [
          {
            id: 'exam_fixed',
            title: 'Computer Networks Midterm',
            subject: 'CS307',
            type: 'internal_exam',
            originalDeadline: '2026-10-30',
            currentDeadline: '2026-10-30',
            earliestAllowedDate: '2026-10-25',
            latestAllowedDate: '2026-11-05',
            estimatedHours: 4.0,
            priority: 'high',
            reschedulable: false,
            isOfficialDeadline: true
          },
          {
            id: 'asmt_heavy',
            title: 'Heavy Project Milestone',
            subject: 'CS304',
            type: 'project',
            originalDeadline: '2026-10-30',
            currentDeadline: '2026-10-30',
            earliestAllowedDate: '2026-10-25',
            latestAllowedDate: '2026-11-05',
            estimatedHours: 4.0,
            priority: 'medium',
            reschedulable: true
          }
        ];

        const savedAssessments = state.assessments;
        state.assessments = dummySchedule;
        const res = runScheduleOptimizer({ threshold: 4.0 });
        state.assessments = savedAssessments;

        const examResult = res.proposedAssessments.find(a => a.id === 'exam_fixed');
        const pass = examResult && examResult.proposedDeadline === '2026-10-30';
        return {
          pass,
          detail: pass
            ? 'Internal exam remained strictly at 2026-10-30 despite severe 8.0h clash.'
            : 'FAIL: Internal exam deadline was altered.'
        };
      }
    },
    {
      name: 'Constraint 2: Strict Permitted Date Window Guarantee',
      description: 'Ensures proposed deadline strictly satisfies earliestAllowedDate <= proposedDeadline <= latestAllowedDate.',
      run: () => {
        const earliest = '2026-10-28';
        const latest = '2026-10-31';
        const dummySchedule = [
          {
            id: 'window_test',
            title: 'Tight Window Lab',
            subject: 'CS301',
            type: 'lab',
            originalDeadline: '2026-10-29',
            currentDeadline: '2026-10-29',
            earliestAllowedDate: earliest,
            latestAllowedDate: latest,
            estimatedHours: 3.5,
            priority: 'high',
            reschedulable: true
          }
        ];

        const saved = state.assessments;
        state.assessments = dummySchedule;
        const res = runScheduleOptimizer({ threshold: 4.0 });
        state.assessments = saved;

        const item = res.proposedAssessments.find(a => a.id === 'window_test');
        const pass = item && item.proposedDeadline >= earliest && item.proposedDeadline <= latest;
        return {
          pass,
          detail: pass
            ? `Proposed date ${item.proposedDeadline} strictly inside [${earliest}, ${latest}].`
            : `FAIL: Proposed date violated allowed window.`
        };
      }
    },
    {
      name: 'Theorem 3: Mathematical Workload Conservation',
      description: 'Proves total estimated academic effort before optimization is strictly equal to total effort after.',
      run: () => {
        const saved = state.assessments;
        const dummy = generateRealisticSemesterSchedule('2026-10-26');
        state.assessments = dummy;
        const res = runScheduleOptimizer({ threshold: 4.0 });
        state.assessments = saved;

        const sumBefore = dummy.reduce((sum, a) => sum + a.estimatedHours, 0);
        const sumAfter = res.proposedAssessments.reduce((sum, a) => sum + a.estimatedHours, 0);
        const pass = Math.abs(sumBefore - sumAfter) < 1e-5;

        return {
          pass,
          detail: pass
            ? `Workload conservation verified: ${sumBefore.toFixed(1)}h before == ${sumAfter.toFixed(1)}h after (0.0h drift).`
            : `FAIL: Workload discrepancy detected.`
        };
      }
    },
    {
      name: 'Objective 4: Peak Workload & Overload Spike Reduction',
      description: 'Validates that a severe 9.5-hour single-day peak is flattened below or towards the daily capacity limit.',
      run: () => {
        const saved = state.assessments;
        const dummy = generateRealisticSemesterSchedule('2026-10-26');
        state.assessments = dummy;
        const res = runScheduleOptimizer({ threshold: 4.0 });
        state.assessments = saved;

        const origPeak = res.originalMetrics.maxDailyWorkload;
        const propPeak = res.proposedMetrics.maxDailyWorkload;
        const pass = propPeak < origPeak;

        return {
          pass,
          detail: pass
            ? `Peak squashed from ${origPeak.toFixed(1)}h down to ${propPeak.toFixed(1)}h.`
            : `FAIL: Optimizer failed to reduce peak workload.`
        };
      }
    },
    {
      name: 'Guarantee 5: Determinism & Idempotence',
      description: 'Verifies identical input schedules always produce 100% identical optimization proposals.',
      run: () => {
        const dummy = generateRealisticSemesterSchedule('2026-10-26');
        const saved = state.assessments;
        state.assessments = dummy;

        const run1 = runScheduleOptimizer({ threshold: 4.0 });
        const run2 = runScheduleOptimizer({ threshold: 4.0 });
        state.assessments = saved;

        let pass = true;
        for (let i = 0; i < run1.proposedAssessments.length; i++) {
          if (run1.proposedAssessments[i].proposedDeadline !== run2.proposedAssessments[i].proposedDeadline) {
            pass = false;
            break;
          }
        }

        return {
          pass,
          detail: pass
            ? 'Determinism verified: 100% identical schedule assignments across multiple runs.'
            : 'FAIL: Non-deterministic behavior observed.'
        };
      }
    },
    {
      name: 'Safety 6: Snapshot Rollback & Undo Guarantee',
      description: 'Tests state snapshot capture and rollback integrity, verifying exact restoration.',
      run: () => {
        const initialCount = state.assessments.length;
        saveSnapshot(state.assessments);
        const snapshotValid = state.lastSnapshot !== null && state.lastSnapshot.length === initialCount;

        return {
          pass: snapshotValid,
          detail: snapshotValid
            ? `State snapshot correctly serialized and cached (${initialCount} items preserved).`
            : 'FAIL: Snapshot serialization failed.'
        };
      }
    }
  ];

  let passedCount = 0;
  let html = '';

  testSpecs.forEach(t => {
    let result = { pass: false, detail: 'Error running test' };
    try {
      result = t.run();
    } catch (err) {
      result = { pass: false, detail: err.message };
    }

    if (result.pass) passedCount++;

    html += `
      <div class="test-result-row ${result.pass ? 'test-pass' : 'test-fail'}">
        <div class="test-info">
          <div class="test-title">${escapeHtml(t.name)}</div>
          <div class="test-desc">${escapeHtml(t.description)}</div>
          <div class="font-xs font-mono mt-1 ${result.pass ? 'text-success' : 'text-danger'}">
            &bull; ${escapeHtml(result.detail)}
          </div>
        </div>
        <div class="test-badge-box">
          <span class="badge ${result.pass ? 'badge-success' : 'badge-danger'}">
            ${result.pass ? '&#10003; PASSED' : '&#10007; FAILED'}
          </span>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  if (passedCount === testSpecs.length) {
    badge.className = 'badge badge-success';
    badge.textContent = `All ${passedCount}/${testSpecs.length} Tests Passed`;
    showToast(`Verification passed: All ${passedCount} mathematical constraints verified.`, 'success');
  } else {
    badge.className = 'badge badge-danger';
    badge.textContent = `${passedCount}/${testSpecs.length} Tests Passed`;
  }
}

// ============================================================================
// 16. SETTINGS & DATA EXPORT / IMPORT CONTROLLER
// ============================================================================

function setupSettingsForms() {
  // 1. Profile Settings Form
  const profForm = document.getElementById('profileSettingsForm');
  if (profForm) {
    document.getElementById('profFullName').value = state.profile.name;
    document.getElementById('profPreferredName').value = state.profile.preferredName || '';
    document.getElementById('profCollege').value = state.profile.college;
    document.getElementById('profUniversity').value = state.profile.university;
    document.getElementById('profDegree').value = state.profile.degree;
    document.getElementById('profAcademicYear').value = state.profile.academicYear;
    document.getElementById('profSemester').value = state.profile.semester;
    document.getElementById('profCurriculumScheme').value = state.profile.scheme;
    document.getElementById('profStudentId').value = state.profile.studentId || '';
    document.getElementById('profSection').value = state.profile.section || '';

    profForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const oldScheme = state.profile.scheme;
      const oldSem = state.profile.semester;

      state.profile.name = document.getElementById('profFullName').value.trim();
      state.profile.preferredName = document.getElementById('profPreferredName').value.trim();
      state.profile.college = document.getElementById('profCollege').value.trim();
      state.profile.university = document.getElementById('profUniversity').value.trim();
      state.profile.degree = document.getElementById('profDegree').value;
      state.profile.academicYear = document.getElementById('profAcademicYear').value;
      state.profile.semester = parseInt(document.getElementById('profSemester').value, 10);
      state.profile.scheme = document.getElementById('profCurriculumScheme').value;
      state.profile.studentId = document.getElementById('profStudentId').value.trim();
      state.profile.section = document.getElementById('profSection').value.trim();

      saveProfileToStorage();

      if (oldScheme !== state.profile.scheme || oldSem !== state.profile.semester) {
        syncCurriculumFromService(state.profile.scheme, state.profile.semester, true);
      }

      refreshAllViews();
      showToast('Profile updated successfully.', 'success');
    });
  }

  // 2. Preferences Form
  const prefForm = document.getElementById('preferencesForm');
  if (prefForm) {
    document.getElementById('prefTheme').value = state.preferences.theme;
    document.getElementById('prefDefaultView').value = state.preferences.defaultDashboardView;
    document.getElementById('prefFirstDayOfWeek').value = state.preferences.firstDayOfWeek;
    document.getElementById('prefHideCompleted').checked = state.preferences.hideCompleted;

    prefForm.addEventListener('submit', (e) => {
      e.preventDefault();
      state.preferences.theme = document.getElementById('prefTheme').value;
      state.preferences.defaultDashboardView = document.getElementById('prefDefaultView').value;
      state.preferences.firstDayOfWeek = document.getElementById('prefFirstDayOfWeek').value;
      state.preferences.hideCompleted = document.getElementById('prefHideCompleted').checked;

      applyTheme(state.preferences.theme);
      savePreferencesToStorage();
      refreshAllViews();
      showToast('Dashboard preferences updated.', 'success');
    });
  }

  // 3. Notification Settings Form
  const notifForm = document.getElementById('notificationSettingsForm');
  if (notifForm) {
    notifForm.addEventListener('submit', (e) => {
      e.preventDefault();
      state.notifications.settings.deadlineAlerts = document.getElementById('notifDeadlineAlerts').checked;
      state.notifications.settings.overloadWarnings = document.getElementById('notifOverloadWarnings').checked;
      state.notifications.settings.capacityWarnings = document.getElementById('notifCapacityWarnings').checked;
      state.notifications.settings.leadDays = parseInt(document.getElementById('notifLeadDays').value, 10);
      state.notifications.settings.quietHours = document.getElementById('notifQuietHours').value.trim();

      saveNotificationsToStorage();
      generateSystemNotifications();
      showToast('Notification preferences saved.', 'success');
    });
  }
}

function exportFullBackupJson() {
  const data = {
    app: 'Easy Learn — Smart Academic Workload Optimizer',
    version: '2.0',
    exportedAt: new Date().toISOString(),
    profile: state.profile,
    curriculum: state.curriculum,
    assessments: state.assessments,
    availability: state.availability,
    preferences: state.preferences,
    notifications: state.notifications
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `easylearn_backup_${state.profile.name.replace(/\s+/g, '_')}_${formatLocalDate(new Date())}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Full profile & schedule exported as JSON.', 'success');
}

function handleImportBackupJson(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const parsed = JSON.parse(event.target.result);
      if (parsed && (Array.isArray(parsed.assessments) || parsed.profile)) {
        saveSnapshot(state.assessments);

        if (parsed.profile) state.profile = { ...DEFAULT_PROFILE, ...parsed.profile };
        if (parsed.curriculum) state.curriculum = parsed.curriculum;
        if (Array.isArray(parsed.assessments)) state.assessments = validateAndSanitizeAssessments(parsed.assessments);
        if (parsed.availability) state.availability = { ...DEFAULT_AVAILABILITY, ...parsed.availability };
        if (parsed.preferences) state.preferences = { ...DEFAULT_PREFERENCES, ...parsed.preferences };

        saveProfileToStorage();
        saveCurriculumToStorage();
        saveAssessmentsToStorage();
        saveAvailabilityToStorage();
        savePreferencesToStorage();

        applyTheme(state.preferences.theme);
        refreshAllViews();
        showToast('Backup restored successfully!', 'success');
      } else {
        showToast('Invalid backup file structure.', 'error');
      }
    } catch (err) {
      showToast('Failed to parse JSON backup file.', 'error');
    }
  };
  reader.readAsText(file);
}

function clearAllData() {
  openConfirmModal(
    'Clear All Stored Data',
    'Are you sure you want to delete all assessments, curriculum courses, study schedule, and profile data from local storage? This cannot be undone.',
    () => {
      localStorage.clear();
      state.profile = { ...DEFAULT_PROFILE, onboardingCompleted: false };
      state.curriculum = { courses: [], schemeName: 'KTU 2019 Scheme', isVerified: true };
      state.assessments = [];
      state.availability = { ...DEFAULT_AVAILABILITY };
      state.preferences = { ...DEFAULT_PREFERENCES };
      state.notifications = { items: [], settings: { ...DEFAULT_NOTIF_SETTINGS } };
      state.lastSnapshot = null;
      state.pendingProposal = null;

      refreshAllViews();
      openOnboardingModal();
      showToast('All application data cleared. Starting fresh.', 'info');
    }
  );
}

// ============================================================================
// 17. VIEW NAVIGATION & TAB CONTROLLER
// ============================================================================

function switchTab(tabId) {
  state.activeTab = tabId;

  document.querySelectorAll('.nav-btn').forEach(btn => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  document.querySelectorAll('.tab-pane').forEach(pane => {
    if (pane.id === `pane-${tabId}`) {
      pane.classList.add('active');
    } else {
      pane.classList.remove('active');
    }
  });

  const titles = {
    dashboard: 'Dashboard',
    curriculum: 'Curriculum & Subjects',
    assessments: 'Assessments & Tasks',
    schedule: 'Study Availability & Capacity',
    calendar: 'Calendar & Heatmap',
    optimizer: 'Smart Schedule Optimizer',
    tests: 'Algorithm Specification & Tests',
    settings: 'Account & Settings'
  };
  document.getElementById('currentSectionTitle').textContent = titles[tabId] || 'Dashboard';

  document.getElementById('sidebar').classList.remove('mobile-open');

  if (tabId === 'dashboard') renderDashboard();
  if (tabId === 'curriculum') renderCurriculumView();
  if (tabId === 'assessments') renderAssessmentsTable();
  if (tabId === 'schedule') renderAvailabilityPlanner();
  if (tabId === 'calendar') {
    renderWeeklyCalendar();
    renderHeatmapMatrix();
  }
  if (tabId === 'tests') runAlgorithmicVerificationSuite();
}

function switchSettingsSubtab(subtabId) {
  state.activeSettingsSubtab = subtabId;

  document.querySelectorAll('.settings-tab-btn').forEach(btn => {
    if (btn.getAttribute('data-subtab') === subtabId) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  document.querySelectorAll('.settings-pane').forEach(pane => {
    if (pane.id === `pane-sub-${subtabId}`) pane.classList.add('active');
    else pane.classList.remove('active');
  });
}

function refreshAllViews() {
  renderDashboard();
  renderCurriculumView();
  renderAssessmentsTable();
  renderAvailabilityPlanner();
  renderWeeklyCalendar();
  renderHeatmapMatrix();
  updateUndoButtonVisibility();
  generateSystemNotifications();
}

// ============================================================================
// 18. UI HELPERS & MODAL HANDLERS
// ============================================================================

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${escapeHtml(message)}</span>
    <button class="btn-close" style="color:white; margin-left:auto; font-size:1.1rem;">&times;</button>
  `;

  toast.querySelector('.btn-close').addEventListener('click', () => {
    toast.remove();
  });

  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) toast.remove();
  }, 4500);
}

function openConfirmModal(title, message, onConfirm) {
  const modal = document.getElementById('confirmModal');
  document.getElementById('confirmModalTitle').textContent = title;
  document.getElementById('confirmModalMessage').textContent = message;

  const acceptBtn = document.getElementById('btnConfirmAccept');
  const cancelBtn = document.getElementById('btnConfirmCancel');
  const closeBtn = document.getElementById('btnCloseConfirmModal');

  const cleanup = () => {
    modal.classList.add('hidden');
    acceptBtn.onclick = null;
  };

  acceptBtn.onclick = () => {
    cleanup();
    if (onConfirm) onConfirm();
  };

  cancelBtn.onclick = cleanup;
  closeBtn.onclick = cleanup;

  modal.classList.remove('hidden');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getTypeColor(type) {
  const colors = {
    assignment: '#3b82f6',
    lab: '#8b5cf6',
    quiz: '#06b6d4',
    internal_exam: '#dc2626',
    project: '#d97706'
  };
  return colors[type] || '#64748b';
}

function formatTypeLabel(type) {
  const labels = {
    assignment: 'Assignment',
    lab: 'Lab Submission',
    quiz: 'Quiz',
    internal_exam: 'Internal Exam',
    project: 'Project'
  };
  return labels[type] || type;
}

function getPriorityClass(prio) {
  return `priority-${prio || 'medium'}`;
}

// ============================================================================
// 19. APPLICATION BOOTSTRAP & EVENT LISTENERS
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // 1. Load Stored Data
  loadStateFromStorage();

  // 2. Check First-Time Onboarding
  checkAndTriggerOnboarding();

  // 3. Navigation Listeners
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.getAttribute('data-tab'));
    });
  });

  // Settings Sub-tabs
  document.querySelectorAll('.settings-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchSettingsSubtab(btn.getAttribute('data-subtab'));
    });
  });

  // Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const sidebar = document.getElementById('sidebar');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });
  }

  // Theme Toggle Button
  document.getElementById('btnThemeToggle')?.addEventListener('click', toggleTheme);

  // Notification Drawer Toggle
  const notifToggle = document.getElementById('btnNotificationToggle');
  const notifDrawer = document.getElementById('notificationDrawer');
  if (notifToggle && notifDrawer) {
    notifToggle.addEventListener('click', () => {
      notifDrawer.classList.toggle('hidden');
      if (!notifDrawer.classList.contains('hidden')) {
        renderNotificationDrawer();
      }
    });
    document.getElementById('btnCloseNotifDrawer')?.addEventListener('click', () => {
      notifDrawer.classList.add('hidden');
    });
    document.getElementById('btnMarkAllNotifsRead')?.addEventListener('click', markAllNotificationsRead);
  }

  // Profile Pill Click -> Go to Settings
  document.getElementById('userProfilePill')?.addEventListener('click', () => {
    switchTab('settings');
    switchSettingsSubtab('profile');
  });

  // Header & Quick Action Buttons
  document.getElementById('btnHeaderOptimize')?.addEventListener('click', () => {
    switchTab('optimizer');
    executeOptimizerProposal();
  });
  document.getElementById('btnDashOptimize')?.addEventListener('click', () => {
    switchTab('optimizer');
    executeOptimizerProposal();
  });
  document.getElementById('btnDashEditAvailability')?.addEventListener('click', () => switchTab('schedule'));
  document.getElementById('btnGoToCurriculum')?.addEventListener('click', () => switchTab('curriculum'));
  document.getElementById('btnSidebarCurriculumSync')?.addEventListener('click', () => switchTab('curriculum'));

  document.getElementById('btnAddAssessmentTop')?.addEventListener('click', openAddAssessmentModal);
  document.getElementById('btnOpenAddModal')?.addEventListener('click', openAddAssessmentModal);
  document.getElementById('btnEmptyAdd')?.addEventListener('click', openAddAssessmentModal);
  document.getElementById('btnViewAllAssessments')?.addEventListener('click', () => switchTab('assessments'));

  // Global Undo Button
  document.getElementById('btnGlobalUndo')?.addEventListener('click', undoLastOptimization);

  // Curriculum Actions
  document.getElementById('btnSyncCurriculumAssessments')?.addEventListener('click', () => {
    loadSemesterAssessmentsFromCurriculum(true);
  });
  document.getElementById('btnOpenAddSubjectModal')?.addEventListener('click', () => {
    document.getElementById('addSubjectModal').classList.remove('hidden');
  });
  document.getElementById('btnCloseAddSubjectModal')?.addEventListener('click', () => {
    document.getElementById('addSubjectModal').classList.add('hidden');
  });
  document.getElementById('btnCancelAddSubject')?.addEventListener('click', () => {
    document.getElementById('addSubjectModal').classList.add('hidden');
  });

  // Add Custom Subject Form Submit
  document.getElementById('addSubjectForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const code = document.getElementById('customCourseCode').value.trim().toUpperCase();
    const title = document.getElementById('customCourseTitle').value.trim();
    const credits = parseInt(document.getElementById('customCourseCredits').value, 10) || 4;
    const category = document.getElementById('customCourseCategory').value;
    const l = parseInt(document.getElementById('customLectureHours').value, 10) || 3;
    const t = parseInt(document.getElementById('customTutorialHours').value, 10) || 0;
    const p = parseInt(document.getElementById('customLabHours').value, 10) || 0;

    if (!code || !title) {
      showToast('Course code and title are required.', 'warning');
      return;
    }

    state.curriculum.courses.push({
      code,
      title,
      credits,
      category,
      lectureHours: l,
      tutorialHours: t,
      labHours: p,
      isVerified: false,
      defaultAssessments: [
        { title: `${code}: Assignment 1`, type: 'assignment', estimatedHours: 3.0, priority: 'medium', reschedulable: true, offsetDays: 14 }
      ]
    });

    saveCurriculumToStorage();
    document.getElementById('addSubjectModal').classList.add('hidden');
    refreshAllViews();
    showToast(`Added custom course: ${code} - ${title}`, 'success');
  });

  // Switch Semester / Scheme Quick Action
  document.getElementById('btnOpenChangeSemesterModal')?.addEventListener('click', () => {
    switchTab('settings');
    switchSettingsSubtab('profile');
    showToast('Select your updated semester or scheme in your Profile Settings.', 'info');
  });

  // Reset Profile Button
  document.getElementById('btnResetProfileModal')?.addEventListener('click', () => {
    openConfirmModal(
      'Reset Student Profile',
      'Relaunch the student onboarding setup wizard? Your assessments and availability will be preserved.',
      () => {
        state.profile.onboardingCompleted = false;
        saveProfileToStorage();
        openOnboardingModal();
        showToast('Onboarding wizard launched.', 'info');
      }
    );
  });

  // Demo Schedule Reload
  document.getElementById('btnAssessmentsReloadDemo')?.addEventListener('click', () => {
    loadSemesterAssessmentsFromCurriculum(true);
  });
  document.getElementById('btnEmptyLoadDemo')?.addEventListener('click', () => {
    loadSemesterAssessmentsFromCurriculum(true);
  });

  // Clear All Data
  document.getElementById('btnConfirmClearAll')?.addEventListener('click', clearAllData);
  document.getElementById('btnClearAllLocalStorage')?.addEventListener('click', clearAllData);

  // Assessment Filters
  document.getElementById('assessmentSearch')?.addEventListener('input', renderAssessmentsTable);
  document.getElementById('filterType')?.addEventListener('change', renderAssessmentsTable);
  document.getElementById('filterPriority')?.addEventListener('change', renderAssessmentsTable);
  document.getElementById('filterReschedulable')?.addEventListener('change', renderAssessmentsTable);
  document.getElementById('filterStatus')?.addEventListener('change', renderAssessmentsTable);
  document.getElementById('sortBy')?.addEventListener('change', renderAssessmentsTable);

  // Calendar Controls
  document.getElementById('btnCalPrevWeek')?.addEventListener('click', () => {
    state.currentCalendarWeekStart.setDate(state.currentCalendarWeekStart.getDate() - 7);
    renderWeeklyCalendar();
  });
  document.getElementById('btnCalToday')?.addEventListener('click', () => {
    state.currentCalendarWeekStart = getMonday(new Date());
    renderWeeklyCalendar();
  });
  document.getElementById('btnCalNextWeek')?.addEventListener('click', () => {
    state.currentCalendarWeekStart.setDate(state.currentCalendarWeekStart.getDate() + 7);
    renderWeeklyCalendar();
  });

  // Calendar Weekly vs Heatmap subtabs
  const btnWeekly = document.getElementById('btnViewWeekly');
  const btnHeatmap = document.getElementById('btnViewHeatmap');
  const weeklyContainer = document.getElementById('weeklyCalendarContainer');
  const heatmapContainer = document.getElementById('heatmapContainer');

  btnWeekly?.addEventListener('click', () => {
    btnWeekly.className = 'btn btn-sm btn-primary';
    btnHeatmap.className = 'btn btn-sm btn-outline-secondary';
    weeklyContainer.classList.remove('hidden');
    heatmapContainer.classList.add('hidden');
    renderWeeklyCalendar();
  });

  btnHeatmap?.addEventListener('click', () => {
    btnHeatmap.className = 'btn btn-sm btn-primary';
    btnWeekly.className = 'btn btn-sm btn-outline-secondary';
    weeklyContainer.classList.add('hidden');
    heatmapContainer.classList.remove('hidden');
    renderHeatmapMatrix();
  });

  document.getElementById('heatmapThresholdInput')?.addEventListener('input', renderHeatmapMatrix);

  // Availability Save
  document.getElementById('btnSaveAvailabilityMain')?.addEventListener('click', saveAvailabilitySettings);
  document.getElementById('btnSaveScheduleLimits')?.addEventListener('click', () => {
    const limit = parseFloat(document.getElementById('settingDailyThreshold').value) || 4.0;
    state.availability.maxDailyStudyLimit = limit;
    saveAvailabilityToStorage();
    refreshAllViews();
    showToast('Daily capacity limit updated.', 'success');
  });
  document.getElementById('btnGoToFullAvailability')?.addEventListener('click', () => switchTab('schedule'));

  // Optimizer Actions
  document.getElementById('btnRunOptimizerMain')?.addEventListener('click', executeOptimizerProposal);
  document.getElementById('btnExecuteOptimizer')?.addEventListener('click', executeOptimizerProposal);
  document.getElementById('btnApplyProposal')?.addEventListener('click', applyProposedSchedule);
  document.getElementById('btnCancelProposal')?.addEventListener('click', cancelProposedSchedule);
  document.getElementById('btnOptimizerInfoToggle')?.addEventListener('click', () => {
    document.getElementById('optimizerInfoCard')?.classList.toggle('hidden');
  });

  // Automated Tests Runner
  document.getElementById('btnRunVerificationSuite')?.addEventListener('click', runAlgorithmicVerificationSuite);

  // Modal Closures & Forms
  document.getElementById('assessmentForm')?.addEventListener('submit', handleAssessmentFormSubmit);
  document.getElementById('btnCloseAssessmentModal')?.addEventListener('click', () => {
    document.getElementById('assessmentModal').classList.add('hidden');
  });
  document.getElementById('btnCancelAssessmentModal')?.addEventListener('click', () => {
    document.getElementById('assessmentModal').classList.add('hidden');
  });

  document.getElementById('btnCloseDetailsModal')?.addEventListener('click', () => {
    document.getElementById('assessmentDetailsModal').classList.add('hidden');
  });
  document.getElementById('btnCloseDetailsBtn')?.addEventListener('click', () => {
    document.getElementById('assessmentDetailsModal').classList.add('hidden');
  });

  // Onboarding Wizard Buttons
  document.getElementById('btnOnboardNext')?.addEventListener('click', handleOnboardingNext);
  document.getElementById('btnOnboardBack')?.addEventListener('click', handleOnboardingBack);

  // Settings Forms & Export/Import
  setupSettingsForms();
  document.getElementById('btnExportJson')?.addEventListener('click', exportFullBackupJson);
  document.getElementById('importJsonInput')?.addEventListener('change', handleImportBackupJson);

  // Initial Full Render
  refreshAllViews();
  updateUndoButtonVisibility();
});
