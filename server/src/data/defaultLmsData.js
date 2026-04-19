export const DEFAULT_LMS_DATA = {
  // NOTE: These are intentionally empty starter payloads.
  // Admins can populate/manage them via the Admin Content editor.
  dashboard: {
    progress: {
      courseId: '',
      courseCode: '',
      courseTitle: '',
      progressPct: 0,
      completedUnits: 0,
      totalUnits: 0,
      nextUp: '',
      eta: '',
    },
    notifications: [],
    activeMaterial: null,
  },

  courses: {
    courses: [],
  },

  materials: {
    materials: [],
  },

  'knowledge-hub': {
    items: [],
  },

  schedule: {
    classes: [],
  },

  recordings: {
    recordings: [],
  },

  results: {
    results: [],
  },

  policy: {
    sections: [],
  },

  profile: {
    profile: {
      name: '',
      avatarDataUri: '',
      program: '',
      studentId: '',
      email: '',
      phone: '',
      cohort: '',
    },
  },

  help: {
    contact: {
      email: '',
      phone: '',
      hours: '',
    },
    tickets: [],
  },
};
