import academiesJson from './academies.json';

export interface Academy {
  id: string;
  name: string;
  subject: string;
  location: string;
  rating: number;
  reviewCount: number;
  priceRange: string;
  tags: string[];
  description: string;
  phone: string;
  address: string;
  schedule: string;
  summary: string;
  targetGrade: string;
  classSize: string;
  teachingStyle: string;
  monthlyCost: string;
  distance: string;
  parking: boolean;
  curriculum: { elementary: string[]; middle: string[]; high: string[] };
  learningFlow: string[];
  teacherCount: number;
  teacherProfiles: Array<{ name: string; experience: string; specialty: string }>;
  additionalCosts: Array<{ item: string; cost: string }>;
  refundPolicy: string;
  reviewKeywords: string[];
  reviews: Array<{
    author: string;
    text: string;
    rating: number;
    keywords: string[];
    userType?: 'student' | 'parent' | 'academy';
  }>;
}

export type CommunityRegion = '위례' | '태평';

export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  author: string;
  userId?: string | null;
  browserId?: string | null;
  userType?: 'student' | 'parent' | 'academy';
  date: string;
  createdAt?: string;
  likes: number;
  comments: number;
  tags: string[];
  mentionedAcademies: string[];
  region: CommunityRegion;
  link?: {
    url: string;
    title: string;
  };
}

export interface Lead {
  id: string;
  academyName: string;
  parentName: string;
  childGrade: string;
  subject: string;
  requestType: '상담' | '레벨테스트';
  status: '신규' | '진행중' | '완료';
  date: string;
  phone: string;
}

export const academies: Academy[] = academiesJson as Academy[];

export const communityPosts: CommunityPost[] = [];

export const myAcademy = {
  name: '위례 수학학원',
  subject: '수학',
  owner: '김수학',
  phone: '031-123-4567',
  address: '경기 성남시 수정구 위례광장로 100',
  email: 'admin@postmom.kr',
};

export const adminLeads: Lead[] = [
  {
    id: '1',
    academyName: '위례 수학학원',
    parentName: '김*영',
    childGrade: '중1',
    subject: '수학',
    requestType: '상담',
    status: '신규',
    date: '2026-03-15',
    phone: '010-****-5678',
  },
  {
    id: '2',
    academyName: '위례 수학학원',
    parentName: '이*민',
    childGrade: '초6',
    subject: '수학',
    requestType: '레벨테스트',
    status: '진행중',
    date: '2026-03-14',
    phone: '010-****-1234',
  },
  {
    id: '3',
    academyName: '위례 수학학원',
    parentName: '박*아',
    childGrade: '중2',
    subject: '수학',
    requestType: '상담',
    status: '완료',
    date: '2026-03-12',
    phone: '010-****-9012',
  },
];
