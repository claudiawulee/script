// Each tab is a tutoring session
// each session has a list of classes that are tutored during that session
window.CLASS_TABS = [
  {
    id: "sun-afternoon",
    title: "Sunday (1:30 - 4:30 PM)",
    classes: ["ECO100", "ECO202", "EGR154", "MAT104", "R-Programming"]
  },
  {
    id: "sun-evening",
    title: "Sunday (7:30 - 10:30 PM)",
    classes: ["CHM202", "ECO101", "MAT201", "MAT202", "EGR153", "ORF245", "PHY102", "PHY104"]
  },
  {
    id: "mon-evening",
    title: "Monday (7:30 - 10:30 PM)",
    classes: ["CHM215", "CHM304", "MAT103", "MAT175", "MOL214", "R-Programming"]
  },
  {
    id: "tue-evening",
    title: "Tuesday (7:30 - 10:30 PM)",
    classes: ["CHM202", "ECO100", "ECO101", "ECO202", "EGR154", "MAT104", "MAT202"]
  },
  {
    id: "wed-evening",
    title: "Wednesday (7:30 - 10:30 PM)",
    classes: ["CHM304", "COS126", "COS217", "COS226", "EGR153", "MAT103", "MAT201", "MOL214", "ORF245", "PHY104"]
  }
];


// Combines all classes across tabs and removes duplicates
window.getAllClassIds = function () {
  const allClasses = [];

  window.CLASS_TABS.forEach(tab => {
    tab.classes.forEach(classId => {
      // Only add if not already included
      if (!allClasses.includes(classId)) {
        allClasses.push(classId);
      }
    });
  });

  return allClasses;
};


// Returns list of classes for a given tab ID
window.getClassesForTab = function (tabId) {
  const tab = window.CLASS_TABS.find(t => t.id === tabId);

  if (tab) {
    return tab.classes;
  }

  return [];
};


// Creates an object where each class starts with 0 tutors/students
window.buildDefaultState = function () {
  const state = {};
  const allClasses = window.getAllClassIds();

  allClasses.forEach(room => {
    state[room] = {
      tutors: 0,
      students: 0
    };
  });

  return state;
};