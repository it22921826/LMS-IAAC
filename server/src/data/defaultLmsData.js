const STUDENT = {
  name: 'Dilan Augustine',
  firstName: 'Dilan',
  avatarDataUri:
    "data:image/svg+xml;utf8,<?xml version='1.0' encoding='UTF-8'?>\n<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'>\n  <defs>\n    <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>\n      <stop offset='0' stop-color='%23e2e8f0'/>\n      <stop offset='1' stop-color='%23cbd5e1'/>\n    </linearGradient>\n  </defs>\n  <rect width='96' height='96' rx='48' fill='url(%23g)'/>\n  <circle cx='48' cy='38' r='16' fill='%2394a3b8'/>\n  <path d='M16 88c6-18 20-28 32-28s26 10 32 28' fill='%2394a3b8'/>\n</svg>",
};

export const DEFAULT_LMS_DATA = {
  'student.me': STUDENT,

  dashboard: {
    student: STUDENT,

    // Dashboard v2 (primary)
    progress: {
      courseId: 'ppl',
      courseCode: 'PPL-101',
      courseTitle: 'Private Pilot License',
      progressPct: 75,
      completedUnits: 9,
      totalUnits: 12,
      nextUp: 'Solo Navigation Briefing',
      eta: '2 weeks',
    },
    notifications: [
      {
        id: 'n-1',
        type: 'warning',
        title: 'Updated Student Policy: Flight Line Safety',
        message: 'Please review updated guidance before your next on-campus practical session.',
        date: 'Apr 09, 2026',
        action: { label: 'Open policy', href: '/policy' },
      },
      {
        id: 'n-2',
        type: 'info',
        title: 'Knowledge Hub: New ICAO Chart Pack Released',
        message: 'The latest chart pack is live with updated airspace and approach references.',
        date: 'Apr 06, 2026',
        action: { label: 'Go to Hub', href: '/knowledge-hub' },
      },
      {
        id: 'n-3',
        type: 'success',
        title: 'New full-flight simulator available',
        message: 'Book advanced training sessions for enhanced procedural practice.',
        date: 'Apr 12, 2026',
      },
    ],
    activeMaterial: {
      id: 'mat-2',
      name: 'Meteorology Lecture',
      type: 'Video',
      courseTitle: 'Aviation Meteorology',
      progressPct: 30,
      lastSeen: 'Apr 15, 2026',
      moduleTitle: 'Weather fronts & METAR decoding',
      resumeHref: '/materials',
    },

    // Legacy fields (kept for compatibility / migration)
    materials: [
      { id: 'm1', name: 'Boeing 737 Flight Manual v3.2', type: 'PDF' },
      { id: 'm2', name: 'Meteorology Lecture', type: 'Video' },
    ],
    upcomingClasses: [
      { id: 'c1', name: 'Nav 101', when: 'Tuesday 10 AM' },
      { id: 'c2', name: 'Air Law', when: 'Wednesday 2 PM' },
    ],
    news: [
      {
        title: 'IAAC Acquires New Full-Flight Simulator',
        date: 'Apr 12, 2026',
        snippet:
          'A new simulator is now available for advanced training sessions and enhanced procedural practice.',
      },
      {
        title: 'Updated Student Policy: Flight Line Safety',
        date: 'Apr 09, 2026',
        snippet: 'Please review updated guidance before your next on-campus practical session.',
      },
      {
        title: 'Knowledge Hub: New ICAO Chart Pack Released',
        date: 'Apr 06, 2026',
        snippet: 'The latest chart pack is live with updated airspace and approach references.',
      },
    ],
  },

  courses: {
    courses: [
      { id: 'ppl', title: 'Private Pilot License', code: 'PPL-101', progressPct: 75 },
      { id: 'met', title: 'Aviation Meteorology', code: 'MET-201', progressPct: 40 },
      { id: 'law', title: 'Air Law', code: 'LAW-110', progressPct: 60 },
    ],
  },

  materials: {
    materials: [
      { id: 'mat-1', name: 'Boeing 737 Flight Manual v3.2', type: 'PDF', visibility: 'Assigned' },
      { id: 'mat-2', name: 'Meteorology Lecture', type: 'Video', visibility: 'Assigned' },
      { id: 'mat-3', name: 'Radio Telephony Notes', type: 'PDF', visibility: 'Optional' },
    ],
  },

  'knowledge-hub': {
    items: [
      { id: 'kh-1', title: 'Flight Checklists', href: '#' },
      { id: 'kh-2', title: 'ICAO Charts', href: '#' },
      { id: 'kh-3', title: 'Enroute Reports', href: '#' },
    ],
  },

  schedule: {
    classes: [
      { id: 'sc-1', name: 'Nav 101', when: 'Tuesday 10 AM', location: 'Room A2' },
      { id: 'sc-2', name: 'Air Law', when: 'Wednesday 2 PM', location: 'Room B1' },
      { id: 'sc-3', name: 'Meteorology', when: 'Friday 11 AM', location: 'Room C3' },
    ],
  },

  recordings: {
    recordings: [
      { id: 'r-1', title: 'Meteorology Lecture (Week 2)', date: 'Apr 10, 2026', href: '#' },
      { id: 'r-2', title: 'Air Law Revision', date: 'Apr 08, 2026', href: '#' },
    ],
  },

  results: {
    results: [
      { id: 'e-1', exam: 'Nav 101 Quiz', date: 'Apr 05, 2026', score: '18/20', status: 'Passed' },
      { id: 'e-2', exam: 'Air Law Midterm', date: 'Mar 28, 2026', score: '72%', status: 'Passed' },
    ],
  },

  policy: {
    sections: [
      {
        id: 'p-1',
        title: 'Flight Line Safety',
        body:
          'Always follow instructor guidance on the flight line, wear required PPE, and maintain situational awareness around moving aircraft.',
      },
      {
        id: 'p-2',
        title: 'Attendance',
        body:
          'Students are expected to attend all scheduled sessions. Notify the program office in advance when you cannot attend.',
      },
    ],
  },

  profile: {
    profile: {
      ...STUDENT,
      studentId: 'IAAC-2026-0142',
      email: 'dilan.augustine@example.com',
      phone: '+94 00 000 0000',
      cohort: 'Apr 2026',
      program: 'Private Pilot License',
    },
  },

  help: {
    contact: {
      email: 'helpdesk@iaac.example.com',
      phone: '+94 00 000 0000',
      hours: 'Mon–Fri, 9:00–17:00',
    },
    tickets: [
      { id: 't-1', subject: 'Unable to access recordings', status: 'Open', date: 'Apr 11, 2026' },
      { id: 't-2', subject: 'Course material link broken', status: 'Resolved', date: 'Apr 07, 2026' },
    ],
  },
};
