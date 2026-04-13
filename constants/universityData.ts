export interface College {
  id: string;
  name: string;
  shortName: string;
  icon: string; // Ionicons name
  color: string;
  programs: Program[];
}

export interface Program {
  id: string;
  name: string;
  collegeId: string;
}

export const UNIVERSITY_NAME = 'Wachemo University (WCU)';

export const COLLEGES: College[] = [
  {
    id: 'eng',
    name: 'College of Engineering and Technology',
    shortName: 'Engineering & Tech',
    icon: 'construct',
    color: '#4338ca',
    programs: [
      { id: 'arch', name: 'Architecture', collegeId: 'eng' },
      { id: 'civil', name: 'Civil Engineering', collegeId: 'eng' },
      { id: 'chem-eng', name: 'Chemical Engineering', collegeId: 'eng' },
      { id: 'cs', name: 'Computer Science', collegeId: 'eng' },
      { id: 'cotm', name: 'Construction Technology and Management', collegeId: 'eng' },
      { id: 'ece', name: 'Electrical and Computer Engineering', collegeId: 'eng' },
      { id: 'eme', name: 'Electro-Mechanical Engineering', collegeId: 'eng' },
      { id: 'geo', name: 'Geomatics Engineering', collegeId: 'eng' },
      { id: 'hwre', name: 'Hydraulic & Water Resource Engineering', collegeId: 'eng' },
      { id: 'it', name: 'Information Technology', collegeId: 'eng' },
      { id: 'is', name: 'Information Systems', collegeId: 'eng' },
      { id: 'me', name: 'Mechanical Engineering', collegeId: 'eng' },
      { id: 'se', name: 'Software Engineering', collegeId: 'eng' },
    ],
  },
  {
    id: 'med',
    name: 'College of Medicine and Health Sciences',
    shortName: 'Medicine & Health',
    icon: 'medkit',
    color: '#dc2626',
    programs: [
      { id: 'med-doc', name: 'Medicine', collegeId: 'med' },
      { id: 'nursing', name: 'Comprehensive Nursing', collegeId: 'med' },
      { id: 'pho', name: 'Public Health Officer', collegeId: 'med' },
      { id: 'midwifery', name: 'Midwifery', collegeId: 'med' },
      { id: 'mlt', name: 'Medical Laboratory Technology', collegeId: 'med' },
      { id: 'pharmacy', name: 'Pharmacy', collegeId: 'med' },
      { id: 'dental', name: 'Dental Medicine', collegeId: 'med' },
      { id: 'hi', name: 'Health Informatics', collegeId: 'med' },
      { id: 'surg-nursing', name: 'Surgical Nursing', collegeId: 'med' },
    ],
  },
  {
    id: 'agri',
    name: 'College of Agriculture Science',
    shortName: 'Agriculture',
    icon: 'leaf',
    color: '#16a34a',
    programs: [
      { id: 'animal', name: 'Animal Science', collegeId: 'agri' },
      { id: 'hort', name: 'Horticulture', collegeId: 'agri' },
      { id: 'nrm', name: 'Natural Resource Management', collegeId: 'agri' },
      { id: 'plant', name: 'Plant Science', collegeId: 'agri' },
      { id: 'env', name: 'Environmental Science', collegeId: 'agri' },
      { id: 'food', name: 'Food Science and Postharvest Technology', collegeId: 'agri' },
    ],
  },
  {
    id: 'ncs',
    name: 'College of Natural and Computational Sciences',
    shortName: 'Natural & Computational',
    icon: 'flask',
    color: '#7c3aed',
    programs: [
      { id: 'bio', name: 'Biology', collegeId: 'ncs' },
      { id: 'chem', name: 'Chemistry', collegeId: 'ncs' },
      { id: 'geol', name: 'Geology', collegeId: 'ncs' },
      { id: 'math', name: 'Mathematics', collegeId: 'ncs' },
      { id: 'phys', name: 'Physics', collegeId: 'ncs' },
      { id: 'stat', name: 'Statistics', collegeId: 'ncs' },
      { id: 'biotech', name: 'Biotechnology', collegeId: 'ncs' },
      { id: 'sport', name: 'Sport Science', collegeId: 'ncs' },
    ],
  },
  {
    id: 'biz',
    name: 'College of Business and Economics',
    shortName: 'Business & Economics',
    icon: 'briefcase',
    color: '#ea580c',
    programs: [
      { id: 'acfn', name: 'Accounting and Finance', collegeId: 'biz' },
      { id: 'econ', name: 'Economics', collegeId: 'biz' },
      { id: 'mgmt', name: 'Management', collegeId: 'biz' },
      { id: 'mktg', name: 'Marketing', collegeId: 'biz' },
      { id: 'padm', name: 'Public Administration', collegeId: 'biz' },
      { id: 'thm', name: 'Tourism and Hotel Management', collegeId: 'biz' },
    ],
  },
  {
    id: 'ssh',
    name: 'College of Social Sciences and Humanities',
    shortName: 'Social Sciences & Humanities',
    icon: 'people',
    color: '#0891b2',
    programs: [
      { id: 'law', name: 'Law', collegeId: 'ssh' },
      { id: 'socio', name: 'Sociology', collegeId: 'ssh' },
      { id: 'psych', name: 'Psychology', collegeId: 'ssh' },
      { id: 'polsci', name: 'Political Science', collegeId: 'ssh' },
      { id: 'geog', name: 'Geography', collegeId: 'ssh' },
      { id: 'journ', name: 'Journalism', collegeId: 'ssh' },
      { id: 'eng-lang', name: 'English', collegeId: 'ssh' },
      { id: 'local-lang', name: 'Local Language Studies', collegeId: 'ssh' },
    ],
  },
  {
    id: 'edu',
    name: 'College of Education and Behavioral Sciences',
    shortName: 'Education',
    icon: 'school',
    color: '#db2777',
    programs: [
      { id: 'special-needs', name: 'Special Needs and Inclusive Education', collegeId: 'edu' },
      { id: 'edu-lead', name: 'Educational Leadership', collegeId: 'edu' },
    ],
  },
];

/** Helper: find a college by ID */
export const getCollegeById = (id: string): College | undefined =>
  COLLEGES.find((c) => c.id === id);

/** Helper: find a program by ID across all colleges */
export const getProgramById = (id: string): Program | undefined => {
  for (const college of COLLEGES) {
    const program = college.programs.find((p) => p.id === id);
    if (program) return program;
  }
  return undefined;
};
