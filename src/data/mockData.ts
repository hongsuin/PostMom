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
  reviews: Array<{ author: string; text: string; rating: number; keywords: string[]; userType?: 'student' | 'parent' | 'academy' }>;
}

export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  author: string;
  userType?: 'student' | 'parent' | 'academy';
  date: string;
  likes: number;
  comments: number;
  tags: string[];
  mentionedAcademies: string[];
}

export interface Lead {
  id: string;
  academyName: string;
  parentName: string; // masked
  childGrade: string;
  subject: string;
  requestType: '상담' | '레벨테스트';
  status: '신규' | '진행중' | '완료';
  date: string;
  phone: string; // masked
}

import academiesJson from './academies.json';

export const academies: Academy[] = academiesJson as Academy[];

export const communityPosts: CommunityPost[] = [
  {
    id: '1',
    title: '매쓰피아 수학학원 1년 다닌 후기',
    content: '안녕하세요! 저희 아이가 매쓰피아 수학학원을 1년 다녔는데 성적이 많이 올랐어요. 선생님들이 정말 꼼꼼하게 봐주시고, 특히 개념 설명이 탁월하더라고요. 처음에는 반에 학생 수가 많을까봐 걱정했는데 소수정예라 아이 개별 관리가 잘 됩니다.',
    author: '위례맘123',
    userType: 'parent' as const,
    date: '2026-03-10',
    likes: 24,
    comments: 8,
    tags: ['수학', '위례', '후기'],
    mentionedAcademies: ['1'],
  },
  {
    id: '2',
    title: '영어나라 vs 다른 영어학원 비교해봤어요',
    content: '영어나라 어학원이랑 근처 다른 학원 비교해봤는데요. 영어나라는 원어민 강사가 상주해서 실제 회화 연습이 정말 많이 돼요. 가격은 좀 있지만 그만한 값어치는 하는 것 같아요. 내신 관리도 잘 되고 있어서 만족합니다.',
    author: '분당학부모',
    userType: 'parent' as const,
    date: '2026-03-08',
    likes: 15,
    comments: 5,
    tags: ['영어', '비교', '원어민'],
    mentionedAcademies: ['2'],
  },
  {
    id: '3',
    title: '중학교 입학 전 과학 선행 어디가 좋을까요?',
    content: '이번에 아이가 중학교 들어가는데 과학 선행을 시키고 싶어서요. 사이언스랩이 실험 위주라고 들었는데 실제로 다니시는 분 계신가요? 중1 물리 과정 어떤지 궁금합니다.',
    author: '새내기맘',
    userType: 'student' as const,
    date: '2026-03-05',
    likes: 9,
    comments: 12,
    tags: ['과학', '선행', '중학교'],
    mentionedAcademies: ['3'],
  },
];

// 로그인한 학원 운영자 정보 (단일 학원)
export const myAcademy = {
  name: '매쓰피아 수학학원',
  subject: '수학',
  owner: '김수학',
  phone: '031-123-4567',
  address: '경기 성남시 수정구 위례중앙로 100',
  email: 'admin@postmom.kr',
};

export const adminLeads: Lead[] = [
  {
    id: '1',
    academyName: '매쓰피아 수학학원',
    parentName: '김*영',
    childGrade: '중2',
    subject: '수학',
    requestType: '상담',
    status: '신규',
    date: '2026-03-15',
    phone: '010-****-5678',
  },
  {
    id: '2',
    academyName: '매쓰피아 수학학원',
    parentName: '이*수',
    childGrade: '초6',
    subject: '수학',
    requestType: '레벨테스트',
    status: '진행중',
    date: '2026-03-14',
    phone: '010-****-1234',
  },
  {
    id: '3',
    academyName: '매쓰피아 수학학원',
    parentName: '박*민',
    childGrade: '중1',
    subject: '수학',
    requestType: '상담',
    status: '완료',
    date: '2026-03-12',
    phone: '010-****-9012',
  },
];
