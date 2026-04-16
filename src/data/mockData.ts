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

export const communityPosts: CommunityPost[] = [
  {
    id: '1',
    title: '위례 수학학원 한 달 다닌 후기',
    content:
      '아이랑 같이 상담받고 등록했는데 숙제 관리가 꽤 꼼꼼한 편이에요. 숙제가 많은 날은 힘들어했지만 적응하고 나니 개념 설명이 잘 들어온다고 하더라고요.',
    author: '위례맘23',
    userType: 'parent',
    date: '2026-03-10',
    createdAt: '2026-03-10T09:00:00+09:00',
    likes: 24,
    comments: 8,
    tags: ['수학', '초등', '후기'],
    mentionedAcademies: ['1'],
    region: '위례',
    link: {
      url: 'https://blog.naver.com/example-wirye',
      title: '학원 블로그',
    },
  },
  {
    id: '2',
    title: '태평 영어학원 비교해보신 분 계실까요?',
    content:
      '상담을 두 군데 받아봤는데 커리큘럼과 숙제량 차이가 커서 고민 중이에요. 회화 중심인지 내신 중심인지 실제로 다녀본 분들의 의견이 궁금합니다.',
    author: '태평학부모',
    userType: 'parent',
    date: '2026-03-08',
    createdAt: '2026-03-08T18:20:00+09:00',
    likes: 15,
    comments: 5,
    tags: ['영어', '비교', '상담'],
    mentionedAcademies: ['2'],
    region: '태평',
  },
  {
    id: '3',
    title: '중등 올라가기 전에 과학 선행 어디가 좋을까요?',
    content:
      '중학교 올라가기 전에 과학 선행을 조금 해두고 싶어요. 개념 설명이 쉬운 곳인지, 실험형 수업이 있는지 궁금해서 추천 부탁드립니다.',
    author: '공부고민중',
    userType: 'student',
    date: '2026-03-05',
    createdAt: '2026-03-05T14:10:00+09:00',
    likes: 9,
    comments: 12,
    tags: ['과학', '선행', '중등'],
    mentionedAcademies: ['3'],
    region: '위례',
  },
];

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
