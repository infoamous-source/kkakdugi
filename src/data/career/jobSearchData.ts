/**
 * 취업 준비 가이드 (cr-03) 데이터
 *
 * 한국에서 일하는 외국인 근로자/유학생을 위한 취업 정보.
 * 모든 텍스트: 한국어(주) + 영어(부), TOPIK 3-4 수준, 해요체.
 */

// ─── 타입 정의 ────────────────────────────────────────────────

export type PlatformCategory = 'government' | 'foreigner' | 'popular';

export interface JobPlatform {
  id: string;
  name: string;
  nameEn: string;
  url: string;
  category: PlatformCategory;
  emoji: string;
  description: string;
  descriptionEn: string;
  isGovernment: boolean;
}

export interface VisaJobInfo {
  visa: string;
  nameKo: string;
  nameEn: string;
  emoji: string;
  allowedJobs: string[];
  restrictions: string[];
  recommendedPlatforms: string[];
  tips: string[];
}

export interface DocumentCard {
  id: string;
  name: string;
  nameEn: string;
  emoji: string;
  isRequired: boolean;
}

export interface DocumentChecklistRound {
  jobType: string;
  jobTypeEn: string;
  emoji: string;
  requiredDocs: string[];
  allDocs: DocumentCard[];
}

export interface SubmissionTip {
  id: string;
  emoji: string;
  questionKo: string;
  questionEn: string;
  answerKo: string;
  answerEn: string;
}

// ─── 1. 취업 플랫폼 ───────────────────────────────────────────

export const JOB_PLATFORMS: JobPlatform[] = [
  // 정부공인 (Government-certified)
  {
    id: 'worknet',
    name: '워크넷',
    nameEn: 'Work Net',
    url: 'https://www.work.go.kr',
    category: 'government',
    emoji: '🏛️',
    description: '고용노동부에서 운영해요. 가장 공식적인 구직 사이트예요.',
    descriptionEn: 'Run by the Ministry of Employment and Labor. The most official job search site.',
    isGovernment: true,
  },
  {
    id: 'work24',
    name: '고용24',
    nameEn: 'Work 24',
    url: 'https://www.work24.go.kr',
    category: 'government',
    emoji: '🏢',
    description: '정부 취업 서비스를 한 곳에서 이용할 수 있어요. 훈련·복지·취업을 함께 찾아요.',
    descriptionEn: 'Access all government employment services in one place — training, welfare, and job search.',
    isGovernment: true,
  },
  {
    id: 'eps',
    name: '외국인고용관리시스템',
    nameEn: 'EPS (Employment Permit System)',
    url: 'https://eps.hrdkorea.or.kr',
    category: 'government',
    emoji: '🌐',
    description: 'E-9, H-2 비자로 한국에 온 분들을 위한 공식 고용 시스템이에요.',
    descriptionEn: 'Official employment system for those who came to Korea on E-9 or H-2 visas.',
    isGovernment: true,
  },

  // 외국인특화 (Foreigner-focused)
  {
    id: 'hikorea',
    name: '하이코리아',
    nameEn: 'Hi Korea',
    url: 'https://www.hikorea.go.kr',
    category: 'foreigner',
    emoji: '🇰🇷',
    description: '외국인을 위한 출입국·취업 정보를 한 번에 볼 수 있어요.',
    descriptionEn: 'Find immigration and employment information for foreigners all in one place.',
    isGovernment: false,
  },
  {
    id: 'koreajobs',
    name: '코리아잡스',
    nameEn: 'Korea Jobs',
    url: 'https://www.koreajobs.co.kr',
    category: 'foreigner',
    emoji: '💼',
    description: '외국인 구직자를 위한 전문 취업 플랫폼이에요. 영어 지원이 돼요.',
    descriptionEn: 'A dedicated job platform for foreign job seekers with English support.',
    isGovernment: false,
  },

  // 인기 (Popular)
  {
    id: 'saramin',
    name: '사람인',
    nameEn: 'Saramin',
    url: 'https://www.saramin.co.kr',
    category: 'popular',
    emoji: '🔍',
    description: '한국에서 가장 많이 쓰는 취업 사이트 중 하나예요. 다양한 직종이 있어요.',
    descriptionEn: 'One of the most widely used job sites in Korea. Covers a wide range of job types.',
    isGovernment: false,
  },
  {
    id: 'jobkorea',
    name: '잡코리아',
    nameEn: 'Job Korea',
    url: 'https://www.jobkorea.co.kr',
    category: 'popular',
    emoji: '🏆',
    description: '대기업·중견기업 채용 정보가 많아요. 이력서 서비스도 제공해요.',
    descriptionEn: 'Many listings from large and mid-sized companies. Also offers resume services.',
    isGovernment: false,
  },
  {
    id: 'indeed',
    name: '인디드코리아',
    nameEn: 'Indeed Korea',
    url: 'https://kr.indeed.com',
    category: 'popular',
    emoji: '🌍',
    description: '전 세계에서 쓰는 취업 사이트예요. 영어·한국어 모두 검색할 수 있어요.',
    descriptionEn: 'A globally used job site. You can search in both English and Korean.',
    isGovernment: false,
  },
  {
    id: 'albamon',
    name: '알바몬',
    nameEn: 'Albamon',
    url: 'https://www.albamon.com',
    category: 'popular',
    emoji: '⏰',
    description: '아르바이트(파트타임) 구직에 특화된 사이트예요. 단기·시간제 일자리가 많아요.',
    descriptionEn: 'Specialized for part-time (albait) job seekers. Many short-term and hourly positions.',
    isGovernment: false,
  },
];

// ─── 2. 비자별 취업 가이드 ────────────────────────────────────

export const VISA_JOB_GUIDE: VisaJobInfo[] = [
  {
    visa: 'E-7',
    nameKo: '특정활동 (전문직)',
    nameEn: 'Specific Activity (Professional)',
    emoji: '👨‍💻',
    allowedJobs: [
      'IT 개발 (소프트웨어, 앱, 웹)',
      '기계·전자 엔지니어링',
      '외국어 강사 (영어 등)',
      '번역·통역',
      '기업 경영·마케팅 전문가',
      '의료·보건 전문직',
    ],
    restrictions: [
      '허가된 직종 안에서만 일할 수 있어요.',
      '직종을 바꾸려면 비자를 다시 받아야 해요.',
      '허가 범위를 벗어난 일을 하면 법 위반이에요.',
    ],
    recommendedPlatforms: ['saramin', 'jobkorea', 'indeed'],
    tips: [
      '취업할 회사에서 고용계약서를 먼저 받아요.',
      '출입국에 자격 심사를 신청해야 해요.',
      '학력·경력 증명서를 미리 번역해두면 좋아요.',
    ],
  },
  {
    visa: 'E-9',
    nameKo: '비전문취업',
    nameEn: 'Non-professional Employment',
    emoji: '🏭',
    allowedJobs: [
      '제조업 (공장)',
      '농업·축산업',
      '어업',
      '건설업',
      '서비스업 (일부)',
    ],
    restrictions: [
      '고용허가제(EPS)로 배정된 사업장에서만 일해요.',
      '마음대로 직장을 바꿀 수 없어요. 변경 횟수가 정해져 있어요.',
      '사업장 변경 시 고용센터에 신고해야 해요.',
    ],
    recommendedPlatforms: ['eps', 'worknet'],
    tips: [
      '사업장 변경이 필요할 때는 혼자 고민하지 말고 고용센터에 먼저 연락하세요.',
      '표준근로계약서를 꼭 받아두세요.',
      '한국어능력시험(TOPIK) 점수가 있으면 좋아요.',
    ],
  },
  {
    visa: 'F-2',
    nameKo: '거주',
    nameEn: '거주 Resident',
    emoji: '🏠',
    allowedJobs: [
      '대부분의 직종 가능해요.',
      '전문직, 사무직, 서비스직, 제조업 모두 돼요.',
    ],
    restrictions: [
      '단순 노무직 일부는 제한될 수 있어요.',
      '취업 전 비자 조건을 한 번 더 확인하세요.',
    ],
    recommendedPlatforms: ['saramin', 'jobkorea', 'worknet', 'indeed'],
    tips: [
      '비자 제한이 적으니 원하는 직종에 자유롭게 지원해요.',
      '사람인·잡코리아 이력서를 잘 만들어두면 좋아요.',
    ],
  },
  {
    visa: 'F-4',
    nameKo: '재외동포',
    nameEn: 'Overseas Korean',
    emoji: '🌏',
    allowedJobs: [
      '대부분의 직종 가능해요.',
      '전문직부터 서비스직까지 폭넓게 일할 수 있어요.',
    ],
    restrictions: [
      '단순 노무직(공장 생산직 등) 일부는 별도 허가가 필요해요.',
      '허용 업종 목록을 출입국에 확인하세요.',
    ],
    recommendedPlatforms: ['saramin', 'jobkorea', 'koreajobs', 'indeed'],
    tips: [
      '한국어를 잘하면 취업에 매우 유리해요.',
      '동포 커뮤니티 네트워크를 활용하면 일자리를 더 빨리 찾을 수 있어요.',
    ],
  },
  {
    visa: 'F-5',
    nameKo: '영주',
    nameEn: 'Permanent Resident',
    emoji: '⭐',
    allowedJobs: [
      '모든 직종에서 일할 수 있어요.',
      '한국인과 동일한 취업 권리가 있어요.',
    ],
    restrictions: [
      '특별한 취업 제한이 없어요.',
    ],
    recommendedPlatforms: ['saramin', 'jobkorea', 'worknet', 'indeed'],
    tips: [
      '영주권자는 취업 제한이 없으니 원하는 곳 어디든 지원하세요.',
      '국민연금, 건강보험 모두 의무 가입 대상이에요.',
    ],
  },
  {
    visa: 'F-6',
    nameKo: '결혼이민',
    nameEn: 'Marriage Immigrant',
    emoji: '💑',
    allowedJobs: [
      '모든 직종에서 일할 수 있어요.',
    ],
    restrictions: [
      '특별한 취업 제한이 없어요.',
    ],
    recommendedPlatforms: ['saramin', 'albamon', 'worknet', 'hikorea'],
    tips: [
      '가족센터에서 취업 교육과 취업 연계 서비스를 받을 수 있어요.',
      '한국어 교육과 자격증 취득을 지원받을 수 있어요.',
    ],
  },
  {
    visa: 'D-2',
    nameKo: '유학',
    nameEn: 'Student',
    emoji: '📚',
    allowedJobs: [
      '아르바이트 (파트타임)',
      '학교 관련 연구 보조',
    ],
    restrictions: [
      '주 20시간 이내만 일할 수 있어요.',
      '방학 중에는 주 40시간까지 가능해요.',
      '취업 활동을 하기 전에 학교에서 허가를 받아야 해요.',
      '시간을 넘기면 비자 문제가 생길 수 있어요.',
    ],
    recommendedPlatforms: ['albamon', 'indeed', 'saramin'],
    tips: [
      '아르바이트를 시작하기 전에 학교 국제처에 꼭 신고하세요.',
      '주 20시간을 넘지 않도록 근무 일정을 관리하세요.',
      '근로계약서를 반드시 받아두세요.',
    ],
  },
  {
    visa: 'D-4',
    nameKo: '어학연수',
    nameEn: 'Language Trainee',
    emoji: '🗣️',
    allowedJobs: [
      '아르바이트 (매우 제한적)',
    ],
    restrictions: [
      '원칙적으로 취업 활동이 안 돼요.',
      '일부 조건에서 주 10~20시간 이내 파트타임이 가능해요.',
      '반드시 출입국에 확인 후 일을 시작하세요.',
    ],
    recommendedPlatforms: ['hikorea'],
    tips: [
      '취업 전 출입국사무소에 허가 여부를 먼저 확인하세요.',
      '한국어 실력을 높이면 나중에 D-2로 변경해 더 많이 일할 수 있어요.',
    ],
  },
  {
    visa: 'H-2',
    nameKo: '방문취업 (재외동포)',
    nameEn: 'Working Visit (Overseas Korean)',
    emoji: '🏗️',
    allowedJobs: [
      '제조업 (공장)',
      '건설업',
      '농업·어업',
      '음식점 등 서비스업 일부',
      '청소·경비 등 단순 서비스',
    ],
    restrictions: [
      '허용된 업종과 직종 안에서만 일할 수 있어요.',
      '사업장 변경 횟수에 제한이 있어요.',
      '고용센터에 구직 신청을 해야 취업이 가능해요.',
    ],
    recommendedPlatforms: ['eps', 'worknet', 'work24'],
    tips: [
      '취업 전 가까운 고용센터에 방문해서 구직 등록을 하세요.',
      '한국어 능력 시험을 준비하면 취업 선택지가 넓어져요.',
    ],
  },
];

// ─── 3. 서류 체크리스트 게임 (3라운드) ────────────────────────

// 전체 서류 카드 풀 (라운드별 필요 여부는 isRequired로 다름)
const ALL_DOC_CARDS_FACTORY: DocumentCard[] = [
  { id: 'resume',        name: '이력서',         nameEn: 'Resume',                     emoji: '📄', isRequired: true },
  { id: 'cover_letter',  name: '자기소개서',     nameEn: 'Cover Letter',               emoji: '✍️', isRequired: false },
  { id: 'passport',      name: '여권 사본',       nameEn: 'Passport Copy',              emoji: '🛂', isRequired: true },
  { id: 'arc',           name: '외국인등록증 사본', nameEn: 'Alien Registration Card Copy', emoji: '🪪', isRequired: true },
  { id: 'diploma',       name: '졸업증명서',     nameEn: 'Graduation Certificate',     emoji: '🎓', isRequired: false },
  { id: 'transcript',    name: '성적증명서',     nameEn: 'Academic Transcript',        emoji: '📊', isRequired: false },
  { id: 'certificate',   name: '자격증 사본',     nameEn: 'Certificate Copy',           emoji: '🏅', isRequired: false },
  { id: 'health_check',  name: '건강검진서',     nameEn: 'Health Certificate',         emoji: '🏥', isRequired: true },
  { id: 'criminal',      name: '범죄경력증명서', nameEn: 'Criminal Background Check',  emoji: '🔒', isRequired: false },
  { id: 'bank',          name: '통장 사본',       nameEn: 'Bank Account Copy',          emoji: '🏦', isRequired: true },
  { id: 'photo',         name: '사진 (3×4)',     nameEn: 'Photo (3×4 cm)',             emoji: '📷', isRequired: true },
  { id: 'visa_confirm',  name: '비자확인서',     nameEn: 'Visa Confirmation',          emoji: '📋', isRequired: false },
  { id: 'reference',     name: '추천서',         nameEn: 'Reference Letter',           emoji: '📬', isRequired: false },
  { id: 'portfolio',     name: '포트폴리오',     nameEn: 'Portfolio',                  emoji: '🗂️', isRequired: false },
  { id: 'language',      name: '어학성적표',     nameEn: 'Language Test Score',        emoji: '🗣️', isRequired: false },
];

const ALL_DOC_CARDS_OFFICE: DocumentCard[] = [
  { id: 'resume',        name: '이력서',         nameEn: 'Resume',                     emoji: '📄', isRequired: true },
  { id: 'cover_letter',  name: '자기소개서',     nameEn: 'Cover Letter',               emoji: '✍️', isRequired: true },
  { id: 'passport',      name: '여권 사본',       nameEn: 'Passport Copy',              emoji: '🛂', isRequired: true },
  { id: 'arc',           name: '외국인등록증 사본', nameEn: 'Alien Registration Card Copy', emoji: '🪪', isRequired: true },
  { id: 'diploma',       name: '졸업증명서',     nameEn: 'Graduation Certificate',     emoji: '🎓', isRequired: true },
  { id: 'transcript',    name: '성적증명서',     nameEn: 'Academic Transcript',        emoji: '📊', isRequired: false },
  { id: 'certificate',   name: '자격증 사본',     nameEn: 'Certificate Copy',           emoji: '🏅', isRequired: false },
  { id: 'health_check',  name: '건강검진서',     nameEn: 'Health Certificate',         emoji: '🏥', isRequired: false },
  { id: 'criminal',      name: '범죄경력증명서', nameEn: 'Criminal Background Check',  emoji: '🔒', isRequired: false },
  { id: 'bank',          name: '통장 사본',       nameEn: 'Bank Account Copy',          emoji: '🏦', isRequired: false },
  { id: 'photo',         name: '사진 (3×4)',     nameEn: 'Photo (3×4 cm)',             emoji: '📷', isRequired: true },
  { id: 'visa_confirm',  name: '비자확인서',     nameEn: 'Visa Confirmation',          emoji: '📋', isRequired: true },
  { id: 'reference',     name: '추천서',         nameEn: 'Reference Letter',           emoji: '📬', isRequired: false },
  { id: 'portfolio',     name: '포트폴리오',     nameEn: 'Portfolio',                  emoji: '🗂️', isRequired: false },
  { id: 'language',      name: '어학성적표',     nameEn: 'Language Test Score',        emoji: '🗣️', isRequired: true },
];

const ALL_DOC_CARDS_SERVICE: DocumentCard[] = [
  { id: 'resume',        name: '이력서',         nameEn: 'Resume',                     emoji: '📄', isRequired: true },
  { id: 'cover_letter',  name: '자기소개서',     nameEn: 'Cover Letter',               emoji: '✍️', isRequired: false },
  { id: 'passport',      name: '여권 사본',       nameEn: 'Passport Copy',              emoji: '🛂', isRequired: true },
  { id: 'arc',           name: '외국인등록증 사본', nameEn: 'Alien Registration Card Copy', emoji: '🪪', isRequired: true },
  { id: 'diploma',       name: '졸업증명서',     nameEn: 'Graduation Certificate',     emoji: '🎓', isRequired: false },
  { id: 'transcript',    name: '성적증명서',     nameEn: 'Academic Transcript',        emoji: '📊', isRequired: false },
  { id: 'certificate',   name: '자격증 사본',     nameEn: 'Certificate Copy',           emoji: '🏅', isRequired: false },
  { id: 'health_check',  name: '건강검진서',     nameEn: 'Health Certificate',         emoji: '🏥', isRequired: true },
  { id: 'criminal',      name: '범죄경력증명서', nameEn: 'Criminal Background Check',  emoji: '🔒', isRequired: false },
  { id: 'bank',          name: '통장 사본',       nameEn: 'Bank Account Copy',          emoji: '🏦', isRequired: false },
  { id: 'photo',         name: '사진 (3×4)',     nameEn: 'Photo (3×4 cm)',             emoji: '📷', isRequired: true },
  { id: 'visa_confirm',  name: '비자확인서',     nameEn: 'Visa Confirmation',          emoji: '📋', isRequired: false },
  { id: 'reference',     name: '추천서',         nameEn: 'Reference Letter',           emoji: '📬', isRequired: false },
  { id: 'portfolio',     name: '포트폴리오',     nameEn: 'Portfolio',                  emoji: '🗂️', isRequired: false },
  { id: 'language',      name: '어학성적표',     nameEn: 'Language Test Score',        emoji: '🗣️', isRequired: false },
];

export const DOCUMENT_CHECKLIST_ROUNDS: DocumentChecklistRound[] = [
  {
    jobType: '공장',
    jobTypeEn: 'Factory / Manufacturing',
    emoji: '🏭',
    requiredDocs: ['resume', 'passport', 'arc', 'health_check', 'bank', 'photo'],
    allDocs: ALL_DOC_CARDS_FACTORY,
  },
  {
    jobType: '사무직',
    jobTypeEn: 'Office Job',
    emoji: '💼',
    requiredDocs: ['resume', 'cover_letter', 'passport', 'arc', 'diploma', 'photo', 'visa_confirm', 'language'],
    allDocs: ALL_DOC_CARDS_OFFICE,
  },
  {
    jobType: '서비스직',
    jobTypeEn: 'Service Job',
    emoji: '🛎️',
    requiredDocs: ['resume', 'passport', 'arc', 'health_check', 'photo'],
    allDocs: ALL_DOC_CARDS_SERVICE,
  },
];

// ─── 4. 서류 제출 팁 (플립카드 6장) ──────────────────────────

export const SUBMISSION_TIPS: SubmissionTip[] = [
  {
    id: 'tip_email_subject',
    emoji: '📧',
    questionKo: '이메일 제목은 어떻게 써요?',
    questionEn: 'How do I write the email subject?',
    answerKo:
      '[지원] 직무명_이름 형식으로 써요.\n예: [지원] 생산직_응우옌민투안\n제목만 봐도 어떤 지원자인지 알 수 있어야 해요.',
    answerEn:
      'Use the format: [Application] Job Title_Your Name\nEx: [Application] Production_Nguyen Minh Tuan\nThe recruiter should know who you are just from the subject line.',
  },
  {
    id: 'tip_file_name',
    emoji: '🗂️',
    questionKo: '파일 이름은 어떻게 정해요?',
    questionEn: 'How should I name my files?',
    answerKo:
      '이름_서류종류.pdf 형식으로 저장해요.\n예: 응우옌민투안_이력서.pdf\n파일 이름이 "이력서.pdf"이면 담당자가 혼동할 수 있어요.',
    answerEn:
      'Save files as: YourName_DocumentType.pdf\nEx: NguyenMinhTuan_Resume.pdf\nA generic name like "resume.pdf" can confuse the recruiter.',
  },
  {
    id: 'tip_file_format',
    emoji: '📑',
    questionKo: '어떤 파일 형식으로 보내요?',
    questionEn: 'What file format should I use?',
    answerKo:
      'PDF로 보내는 게 가장 좋아요.\nPDF는 어떤 컴퓨터에서 열어도 글자와 디자인이 그대로 보여요.\nHWP나 Word 파일은 상대 컴퓨터에 따라 다르게 보일 수 있어요.',
    answerEn:
      'PDF is the best choice.\nPDF looks the same on any computer — fonts and layout stay intact.\nHWP or Word files may look different depending on the other person\'s computer.',
  },
  {
    id: 'tip_photo_spec',
    emoji: '📷',
    questionKo: '증명사진 규격이 어떻게 돼요?',
    questionEn: 'What are the photo requirements?',
    answerKo:
      '3×4 cm 사진을 준비해요. (명함 크기보다 약간 작아요)\n배경은 흰색이나 밝은 색이에요.\n모자나 선글라스를 쓰면 안 돼요.\n최근 6개월 이내에 찍은 사진이어야 해요.',
    answerEn:
      'Prepare a 3×4 cm photo (slightly smaller than a business card).\nBackground should be white or light-colored.\nNo hats or sunglasses.\nMust be taken within the last 6 months.',
  },
  {
    id: 'tip_deadline',
    emoji: '⏰',
    questionKo: '마감일에 딱 맞춰 보내도 돼요?',
    questionEn: 'Is it okay to send right before the deadline?',
    answerKo:
      '마감일 하루 전에 보내는 게 좋아요.\n마감 직전에는 인터넷 오류나 서류 누락이 생길 수 있어요.\n미리 보내면 여유 있게 수정할 수 있어요.',
    answerEn:
      'It\'s better to send one day before the deadline.\nRight before the deadline, internet errors or missing documents can happen.\nSending early gives you time to fix any mistakes.',
  },
  {
    id: 'tip_follow_up',
    emoji: '🤝',
    questionKo: '서류를 보낸 후 연락해도 돼요?',
    questionEn: 'Can I follow up after submitting?',
    answerKo:
      '3~5 영업일 후에 정중하게 연락해도 좋아요.\n"지원서를 잘 받으셨는지 확인하고 싶어서 연락드렸어요." 라고 하면 좋아요.\n너무 자주 연락하면 오히려 안 좋을 수 있어요.',
    answerEn:
      'It\'s fine to politely follow up after 3–5 business days.\nYou can say: "I\'m writing to confirm you received my application."\nContacting too often may leave a negative impression.',
  },
];
