/**
 * 직장 매너 (Workplace Manner) — cr-04 데이터
 *
 * 외국인 근로자·유학생을 위한 한국 직장 문화 학습 데이터.
 * TOPIK 3-4 수준 한국어 + 영어 이중 언어.
 *
 * 4개 데이터 구조:
 * 1. MANNER_SCENARIOS  — 16개 시나리오 퀴즈 (4카테고리 × 4문항)
 * 2. WORKPLACE_TERMS   — 30개 직장 어휘 카드 (4카테고리)
 * 3. EMAIL_SITUATIONS  — 6개 비즈니스 이메일 템플릿 상황
 * 4. HONORIFIC_EXERCISES — 10개 반말→존댓말 변환 연습
 */

// ─────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────

export interface MannerChoice {
  id: string;
  textKo: string;
  textEn: string;
}

export interface MannerScenario {
  id: string;
  category: string;
  categoryEn: string;
  categoryEmoji: string;
  situationKo: string;
  situationEn: string;
  choices: MannerChoice[];
  correctId: string;
  explanationKo: string;
  explanationEn: string;
  points: number;
}

export interface WorkplaceTerm {
  id: string;
  category: string;
  categoryEn: string;
  termKo: string;
  termEn: string;
  definitionKo: string;
  definitionEn: string;
  exampleKo: string;
  exampleEn: string;
  emoji: string;
}

export interface EmailSituation {
  id: string;
  nameKo: string;
  nameEn: string;
  emoji: string;
  fields: string[];
  exampleSubject: string;
}

export interface HonorificExercise {
  id: string;
  casualKo: string;
  casualEn: string;
  correctHonorificKo: string;
  hintKo: string;
  difficulty: 1 | 2 | 3;
}

// ─────────────────────────────────────────────
// 1. MANNER_SCENARIOS
// ─────────────────────────────────────────────

export const MANNER_SCENARIOS: MannerScenario[] = [
  // ── 카테고리 1: 인사 예절 ──────────────────

  {
    id: 'greet_01',
    category: '인사 예절',
    categoryEn: 'Greetings',
    categoryEmoji: '🤝',
    situationKo: '아침에 복도에서 부장님을 만났어요. 어떻게 인사해야 할까요?',
    situationEn: 'You run into your department head in the hallway in the morning. How should you greet them?',
    choices: [
      { id: 'a', textKo: '고개만 살짝 끄덕인다', textEn: 'Just give a slight nod' },
      { id: 'b', textKo: '90도로 깊게 인사한다', textEn: 'Bow deeply at 90 degrees' },
      { id: 'c', textKo: '"안녕하세요"라고 말하며 허리를 숙여 인사한다', textEn: 'Say "Good morning" and bow from the waist' },
      { id: 'd', textKo: '못 본 척하고 지나간다', textEn: 'Pretend not to see them and walk past' },
    ],
    correctId: 'c',
    explanationKo:
      '한국 직장에서는 상사를 만났을 때 눈을 마주치고 가볍게 허리를 숙이며 "안녕하세요"라고 인사하는 것이 기본입니다. 90도 인사는 처음 만나거나 중요한 자리에서 쓰고, 복도처럼 가벼운 상황에서는 30~45도 정도면 충분합니다.',
    explanationEn:
      'In Korean workplaces, the standard greeting for a superior is to make eye contact, bow gently, and say "Annyeonghaseyo." A 90-degree bow is reserved for formal first meetings. A 30–45 degree bow is appropriate in casual hallway encounters.',
    points: 10,
  },
  {
    id: 'greet_02',
    category: '인사 예절',
    categoryEn: 'Greetings',
    categoryEmoji: '🤝',
    situationKo: '처음 만나는 거래처 담당자에게 명함을 드려야 해요. 어떻게 해야 할까요?',
    situationEn: 'You need to give your business card to a client contact you\'re meeting for the first time. What should you do?',
    choices: [
      { id: 'a', textKo: '한 손으로 명함을 건넨다', textEn: 'Hand over the card with one hand' },
      { id: 'b', textKo: '두 손으로 정중히 건네며 "잘 부탁드립니다"라고 말한다', textEn: 'Hand it over with both hands and say "I look forward to working with you"' },
    ],
    correctId: 'b',
    explanationKo:
      '명함은 반드시 두 손으로 드려야 합니다. 한 손으로 주면 실례가 됩니다. 받을 때도 두 손으로 받고, 바로 주머니에 넣지 않고 잠시 내용을 확인하는 것이 예의입니다.',
    explanationEn:
      'Business cards must always be exchanged with both hands. Handing it over with one hand is considered rude. When receiving a card, also use both hands and take a moment to read it before putting it away.',
    points: 10,
  },
  {
    id: 'greet_03',
    category: '인사 예절',
    categoryEn: 'Greetings',
    categoryEmoji: '🤝',
    situationKo: '퇴근 시간이 됐는데 선배가 아직 일하고 있어요. 어떻게 해야 할까요?',
    situationEn: 'It\'s time to leave work, but your senior colleague is still working. What should you do?',
    choices: [
      { id: 'a', textKo: '조용히 짐을 챙겨서 그냥 나간다', textEn: 'Quietly pack your things and leave without saying anything' },
      { id: 'b', textKo: '"먼저 퇴근하겠습니다. 수고하세요"라고 인사하고 나간다', textEn: 'Say "I\'ll be heading out first. Keep up the good work" and then leave' },
    ],
    correctId: 'b',
    explanationKo:
      '한국 직장 문화에서는 먼저 퇴근할 때 남아 있는 동료나 선배에게 인사를 하는 것이 기본 예절입니다. "먼저 실례하겠습니다" 또는 "먼저 퇴근하겠습니다"라고 짧게 인사하면 됩니다.',
    explanationEn:
      'In Korean workplace culture, it\'s basic etiquette to say goodbye to colleagues and seniors who are still working when you leave first. A short "I\'ll be heading out first" is perfectly appropriate.',
    points: 10,
  },
  {
    id: 'greet_04',
    category: '인사 예절',
    categoryEn: 'Greetings',
    categoryEmoji: '🤝',
    situationKo: '엘리베이터 안에 사장님과 단둘이 타게 됐어요. 어떻게 해야 할까요?',
    situationEn: 'You end up alone in the elevator with the company president. What should you do?',
    choices: [
      { id: 'a', textKo: '어색하지만 아무 말 없이 침묵한다', textEn: 'Stay silent even though it feels awkward' },
      { id: 'b', textKo: '"안녕하세요, 좋은 하루 되세요"라고 가볍게 인사한다', textEn: 'Greet lightly with "Hello, have a great day"' },
      { id: 'c', textKo: '스마트폰을 꺼내서 본다', textEn: 'Take out your smartphone and look at it' },
    ],
    correctId: 'b',
    explanationKo:
      '엘리베이터처럼 좁은 공간에서 상사와 마주쳤을 때는 간단히 인사를 나누는 것이 자연스럽습니다. 침묵은 어색하고, 스마트폰을 보는 것은 무례하게 보일 수 있습니다.',
    explanationEn:
      'When you find yourself in a small space like an elevator with a superior, a brief, friendly greeting is the natural thing to do. Staying completely silent is awkward, and looking at your phone can come across as rude.',
    points: 10,
  },

  // ── 카테고리 2: 회의 매너 ──────────────────

  {
    id: 'meeting_01',
    category: '회의 매너',
    categoryEn: 'Meetings',
    categoryEmoji: '📋',
    situationKo: '팀장님이 제시한 방향에 반대 의견이 있어요. 어떻게 말해야 할까요?',
    situationEn: 'You disagree with the direction your team leader suggested. How should you express your opinion?',
    choices: [
      { id: 'a', textKo: '"그건 틀렸어요. 제 말이 맞아요"라고 바로 말한다', textEn: 'Say directly "That\'s wrong. I think I\'m right"' },
      { id: 'b', textKo: '"좋은 의견이세요. 혹시 이런 방법도 괜찮을까요?"라고 부드럽게 제안한다', textEn: 'Suggest gently "Great point. Would this approach also work?"' },
    ],
    correctId: 'b',
    explanationKo:
      '한국 직장에서는 상사의 의견에 반대할 때 직접적으로 "틀렸다"고 말하면 관계가 나빠질 수 있습니다. 상대방 의견을 먼저 인정한 후, "혹시 이런 방법도 있지 않을까요?" 처럼 부드럽게 대안을 제시하는 것이 효과적입니다.',
    explanationEn:
      'In Korean workplaces, directly saying someone is "wrong" can damage relationships, especially with superiors. It\'s more effective to first acknowledge their point and then gently offer an alternative: "Perhaps this approach could also work?"',
    points: 10,
  },
  {
    id: 'meeting_02',
    category: '회의 매너',
    categoryEn: 'Meetings',
    categoryEmoji: '📋',
    situationKo: '회의 중에 전화가 왔어요. 어떻게 해야 할까요?',
    situationEn: 'Your phone rings during a meeting. What should you do?',
    choices: [
      { id: 'a', textKo: '바로 전화를 받는다', textEn: 'Answer the call immediately' },
      { id: 'b', textKo: '무음으로 바꾸고 나중에 확인한다', textEn: 'Switch to silent mode and check it later' },
    ],
    correctId: 'b',
    explanationKo:
      '회의 중 전화를 받는 것은 회의 참석자 전원에게 실례가 됩니다. 회의 전에 미리 무음이나 진동으로 바꿔두는 것이 좋고, 정말 중요한 전화가 예상된다면 미리 참석자에게 양해를 구하는 것이 예의입니다.',
    explanationEn:
      'Answering a call during a meeting is disrespectful to all participants. It\'s best to switch your phone to silent or vibrate before the meeting starts. If you\'re expecting an urgent call, let participants know in advance.',
    points: 10,
  },
  {
    id: 'meeting_03',
    category: '회의 매너',
    categoryEn: 'Meetings',
    categoryEmoji: '📋',
    situationKo: '회의에 5분 늦었어요. 회의실 문을 열고 들어갈 때 어떻게 해야 할까요?',
    situationEn: 'You\'re 5 minutes late to a meeting. What should you do when you open the door and enter?',
    choices: [
      { id: 'a', textKo: '방해가 될까 봐 조용히 빈 자리에 앉는다', textEn: 'Quietly sit down in an empty seat so as not to interrupt' },
      { id: 'b', textKo: '"죄송합니다, 늦었습니다"라고 짧게 인사한 후 자리에 앉는다', textEn: 'Briefly say "Sorry I\'m late" and then take a seat' },
    ],
    correctId: 'b',
    explanationKo:
      '늦었을 때 아무 말 없이 들어오는 것도 실례가 됩니다. 짧게 "죄송합니다"라고 말하고 조용히 자리에 앉으면 됩니다. 단, 발표 중이라면 빈 자리에 먼저 앉은 후 발표가 끝나면 사과하는 것이 방해가 덜 됩니다.',
    explanationEn:
      'Entering without a word is also considered rude. A brief "Sorry I\'m late" before taking your seat is appropriate. However, if a presentation is actively underway, sit down first and apologize when there\'s a natural pause to avoid further disruption.',
    points: 10,
  },
  {
    id: 'meeting_04',
    category: '회의 매너',
    categoryEn: 'Meetings',
    categoryEmoji: '📋',
    situationKo: '내 실수로 프로젝트에 문제가 생겼어요. 팀 회의에서 어떻게 해야 할까요?',
    situationEn: 'A project issue occurred because of your mistake. What should you do in the team meeting?',
    choices: [
      { id: 'a', textKo: '다른 사람이나 상황 탓으로 돌린다', textEn: 'Blame someone else or the circumstances' },
      { id: 'b', textKo: '솔직하게 인정하고 해결책을 함께 제시한다', textEn: 'Honestly acknowledge the mistake and present a solution' },
    ],
    correctId: 'b',
    explanationKo:
      '한국 직장 문화에서 실수를 솔직하게 인정하고 해결책을 제시하는 사람은 신뢰를 얻습니다. 남의 탓을 하면 팀 분위기를 망치고 신뢰를 잃게 됩니다. "제 실수였습니다. 다음과 같이 해결하겠습니다"라고 말하는 것이 가장 좋습니다.',
    explanationEn:
      'In Korean workplace culture, honestly admitting a mistake and offering a solution earns trust. Blaming others damages team morale and your credibility. The best approach is: "This was my mistake. Here\'s how I plan to fix it."',
    points: 10,
  },

  // ── 카테고리 3: 식사 자리 ──────────────────

  {
    id: 'dining_01',
    category: '식사 자리',
    categoryEn: 'Dining',
    categoryEmoji: '🍽️',
    situationKo: '회식에서 연장자에게 술을 따를 때 어떻게 해야 할까요?',
    situationEn: 'How should you pour a drink for an older or senior person at a company dinner?',
    choices: [
      { id: 'a', textKo: '한 손으로 편하게 따른다', textEn: 'Pour casually with one hand' },
      { id: 'b', textKo: '두 손으로 정중하게 따른다', textEn: 'Pour respectfully with both hands' },
    ],
    correctId: 'b',
    explanationKo:
      '한국에서는 연장자나 상사에게 음료를 따를 때 반드시 두 손을 사용합니다. 한 손으로 따르는 것은 무례하게 보일 수 있습니다. 받을 때도 잔을 두 손으로 들거나 한 손으로 잡고 다른 손을 팔뚝에 살짝 받쳐 드리면 됩니다.',
    explanationEn:
      'In Korea, you must always use both hands when pouring a drink for an elder or superior. Pouring with one hand is seen as disrespectful. When receiving, hold the glass with both hands or support your pouring arm with your other hand.',
    points: 10,
  },
  {
    id: 'dining_02',
    category: '식사 자리',
    categoryEn: 'Dining',
    categoryEmoji: '🍽️',
    situationKo: '부장님과 함께 식사할 때 밥을 먼저 먹기 시작해도 될까요?',
    situationEn: 'When dining with your department head, is it okay to start eating first?',
    choices: [
      { id: 'a', textKo: '배가 고프면 먼저 먹기 시작한다', textEn: 'Start eating if you\'re hungry' },
      { id: 'b', textKo: '윗사람이 먼저 수저를 드신 후에 시작한다', textEn: 'Wait until the senior person picks up their utensils first' },
    ],
    correctId: 'b',
    explanationKo:
      '한국 식사 예절에서는 연장자나 상사가 먼저 식사를 시작한 후에 아랫사람이 따라서 먹습니다. 이것은 오랜 유교 문화에서 온 전통으로, 직장 식사 자리에서도 지켜야 하는 기본 예절입니다.',
    explanationEn:
      'Korean dining etiquette requires that the eldest or most senior person begin eating first, after which others follow. This tradition rooted in Confucian culture is still observed in workplace dining settings.',
    points: 10,
  },
  {
    id: 'dining_03',
    category: '식사 자리',
    categoryEn: 'Dining',
    categoryEmoji: '🍽️',
    situationKo: '회식 자리에서 술을 마시지 못해요. 어떻게 해야 할까요?',
    situationEn: 'You can\'t drink alcohol at the company dinner. What should you do?',
    choices: [
      { id: 'a', textKo: '아무 말 없이 거부하고 잔을 뒤집어 놓는다', textEn: 'Refuse without a word and flip your glass over' },
      { id: 'b', textKo: '"죄송합니다, 술을 못 마셔요. 음료로 대신해도 될까요?"라고 정중히 말한다', textEn: 'Politely say "I\'m sorry, I can\'t drink. May I have a non-alcoholic drink instead?"' },
    ],
    correctId: 'b',
    explanationKo:
      '음주를 거부할 때도 예의 바르게 말하는 것이 중요합니다. 아무 말 없이 거부하거나 잔을 뒤집어 놓는 것은 실례가 될 수 있습니다. 건강상 이유, 종교적 이유, 또는 단순히 못 마신다고 솔직하게 말하면 대부분 이해해줍니다.',
    explanationEn:
      'Even when declining alcohol, it\'s important to do so politely. Refusing without explanation or flipping your glass can be seen as rude. Being honest — whether for health, religious, or personal reasons — is usually well understood.',
    points: 10,
  },
  {
    id: 'dining_04',
    category: '식사 자리',
    categoryEn: 'Dining',
    categoryEmoji: '🍽️',
    situationKo: '회의실에서 식사할 때 상석(가장 높은 사람이 앉는 자리)은 어디일까요?',
    situationEn: 'At a dining table in a meeting room, where is the seat of honor (for the most senior person)?',
    choices: [
      { id: 'a', textKo: '문에서 가장 먼 자리', textEn: 'The seat furthest from the door' },
      { id: 'b', textKo: '문에서 가장 가까운 자리', textEn: 'The seat closest to the door' },
    ],
    correctId: 'a',
    explanationKo:
      '한국에서 상석은 보통 문에서 가장 멀고 안쪽에 위치한 자리입니다. 이 자리가 가장 안전하고 편안하다는 인식에서 비롯된 전통입니다. 회식이나 중요한 식사 자리에서 상사를 안쪽 자리로 안내하는 것이 예의입니다.',
    explanationEn:
      'In Korea, the seat of honor is typically the one farthest from the door, in the innermost position. This comes from the traditional belief that this spot is the safest and most comfortable. At company dinners, guiding your superior to the inner seat is considered respectful.',
    points: 10,
  },

  // ── 카테고리 4: 직장 소통 ──────────────────

  {
    id: 'comm_01',
    category: '직장 소통',
    categoryEn: 'Communication',
    categoryEmoji: '💬',
    situationKo: '카카오톡으로 팀장님에게 업무 내용을 보고해야 해요. 어떻게 보내야 할까요?',
    situationEn: 'You need to report work progress to your team leader via KakaoTalk. How should you write the message?',
    choices: [
      { id: 'a', textKo: '"ㅇㅇ 건 처리 완료했음"', textEn: '"Done with that thing"' },
      { id: 'b', textKo: '"팀장님, OO 건 처리 완료되었습니다. 확인 부탁드립니다."', textEn: '"Team leader, I have completed the OO task. Please review when you have a moment."' },
    ],
    correctId: 'b',
    explanationKo:
      '직장에서 메신저를 사용할 때도 격식체(존댓말)를 사용해야 합니다. 상대방 호칭을 먼저 쓰고, 내용을 명확히 전달하고, 마무리 인사를 붙이는 것이 기본 형식입니다. 카카오톡이라도 업무 메시지는 이메일과 비슷한 예의가 필요합니다.',
    explanationEn:
      'Even when using messaging apps at work, formal polite language (존댓말) is required. The basic format is: address the recipient by title, clearly state the content, and close politely. Work messages on KakaoTalk require the same level of formality as email.',
    points: 10,
  },
  {
    id: 'comm_02',
    category: '직장 소통',
    categoryEn: 'Communication',
    categoryEmoji: '💬',
    situationKo: '업무 관련 이메일 제목을 쓸 때 어떻게 해야 할까요?',
    situationEn: 'How should you write the subject line of a work-related email?',
    choices: [
      { id: 'a', textKo: '"안녕하세요"', textEn: '"Hello"' },
      { id: 'b', textKo: '"[보고] OO 프로젝트 진행 현황 - 홍길동"', textEn: '"[Report] OO Project Progress Update – Gildong Hong"' },
    ],
    correctId: 'b',
    explanationKo:
      '이메일 제목은 내용을 한눈에 알 수 있도록 구체적으로 써야 합니다. [보고], [요청], [공지], [회의] 같은 분류 태그를 앞에 붙이고, 프로젝트명이나 주제 + 본인 이름을 포함하면 상대방이 빠르게 내용을 파악할 수 있습니다.',
    explanationEn:
      'Email subject lines should be specific enough to convey the content at a glance. Adding a category tag like [Report], [Request], or [Meeting], followed by the project name or topic and your name, helps the recipient quickly understand the message.',
    points: 10,
  },
  {
    id: 'comm_03',
    category: '직장 소통',
    categoryEn: 'Communication',
    categoryEmoji: '💬',
    situationKo: '상사에게 업무 지시를 받았는데 잘 이해가 안 됐어요. 어떻게 해야 할까요?',
    situationEn: 'You received work instructions from your superior but didn\'t fully understand them. What should you do?',
    choices: [
      { id: 'a', textKo: '대충 이해한 대로 해결해본다', textEn: 'Try to figure it out on your own with a rough understanding' },
      { id: 'b', textKo: '"죄송합니다, 한 번 더 설명해 주시겠어요?"라고 정중히 다시 물어본다', textEn: 'Politely ask "I\'m sorry, could you explain that once more?"' },
    ],
    correctId: 'b',
    explanationKo:
      '모른다고 다시 물어보는 것은 전혀 부끄러운 일이 아닙니다. 오히려 잘못 이해하고 작업을 진행하면 더 큰 문제가 생깁니다. "죄송합니다, 다시 한번 말씀해 주시겠어요?" 또는 "제가 이렇게 이해했는데 맞나요?"처럼 확인하는 것이 훨씬 좋습니다.',
    explanationEn:
      'Asking for clarification is never shameful. On the contrary, proceeding with a misunderstanding causes bigger problems. Saying "I\'m sorry, could you repeat that?" or "I understood it as X — is that correct?" is far better than guessing.',
    points: 10,
  },
  {
    id: 'comm_04',
    category: '직장 소통',
    categoryEn: 'Communication',
    categoryEmoji: '💬',
    situationKo: '퇴근 후 팀장님에게서 카카오톡 메시지가 왔어요 (긴급하지 않은 내용). 어떻게 해야 할까요?',
    situationEn: 'After work hours, your team leader sends you a KakaoTalk message (it\'s not urgent). What should you do?',
    choices: [
      { id: 'a', textKo: '바로 확인하고 즉시 답장한다', textEn: 'Check it immediately and reply right away' },
      { id: 'b', textKo: '확인은 하되 다음 날 출근 후에 답장한다', textEn: 'Read it but reply the next morning when you\'re back at work' },
    ],
    correctId: 'b',
    explanationKo:
      '긴급하지 않은 업무 메시지라면 퇴근 후 즉시 답장하지 않아도 됩니다. 다음 날 출근 후 "어제 메시지 확인했습니다"로 시작해서 답변하면 충분합니다. 단, 메시지에 "오늘 안에 답변 주세요"처럼 명시된 경우에는 당일 대응이 필요합니다.',
    explanationEn:
      'For non-urgent work messages, you don\'t need to reply immediately after work hours. Responding the next morning with "I saw your message yesterday" is fine. However, if the message explicitly says "please reply today," a same-day response is expected.',
    points: 10,
  },
];

// ─────────────────────────────────────────────
// 2. WORKPLACE_TERMS
// ─────────────────────────────────────────────

export const WORKPLACE_TERMS: WorkplaceTerm[] = [
  // ── 일상 (Daily) ──────────────────────────

  {
    id: 'daily_01',
    category: '일상',
    categoryEn: 'Daily',
    termKo: '출근',
    termEn: 'Going to work',
    definitionKo: '직장에 출발하거나 도착하는 것',
    definitionEn: 'Leaving for or arriving at your workplace',
    exampleKo: '오늘 출근 시간이 9시예요.',
    exampleEn: 'My start time today is 9 AM.',
    emoji: '🏢',
  },
  {
    id: 'daily_02',
    category: '일상',
    categoryEn: 'Daily',
    termKo: '퇴근',
    termEn: 'Leaving work',
    definitionKo: '업무를 마치고 직장에서 나오는 것',
    definitionEn: 'Finishing work and leaving the workplace',
    exampleKo: '오늘 퇴근이 늦을 것 같아요.',
    exampleEn: 'I think I\'ll be leaving work late today.',
    emoji: '🚪',
  },
  {
    id: 'daily_03',
    category: '일상',
    categoryEn: 'Daily',
    termKo: '야근',
    termEn: 'Overtime / Working late',
    definitionKo: '정해진 퇴근 시간보다 늦게까지 일하는 것',
    definitionEn: 'Working past your regular finishing time',
    exampleKo: '마감 때문에 또 야근을 해야 해요.',
    exampleEn: 'I have to work overtime again because of the deadline.',
    emoji: '🌙',
  },
  {
    id: 'daily_04',
    category: '일상',
    categoryEn: 'Daily',
    termKo: '칼퇴',
    termEn: 'Sharp exit / Leaving exactly on time',
    definitionKo: '퇴근 시간에 딱 맞춰 바로 나가는 것 (칼같이 퇴근)',
    definitionEn: 'Leaving work at exactly the scheduled time, not a minute late',
    exampleKo: '오늘은 약속이 있어서 칼퇴할 거예요.',
    exampleEn: 'I have plans today so I\'m leaving right on time.',
    emoji: '⚡',
  },
  {
    id: 'daily_05',
    category: '일상',
    categoryEn: 'Daily',
    termKo: '회의',
    termEn: 'Meeting',
    definitionKo: '여러 사람이 모여 업무를 의논하는 것',
    definitionEn: 'A gathering of people to discuss work matters',
    exampleKo: '오후 2시에 팀 회의가 있어요.',
    exampleEn: 'There\'s a team meeting at 2 PM.',
    emoji: '📋',
  },
  {
    id: 'daily_06',
    category: '일상',
    categoryEn: 'Daily',
    termKo: '보고',
    termEn: 'Reporting',
    definitionKo: '상사에게 업무 진행 상황이나 결과를 알리는 것',
    definitionEn: 'Informing your superior of work progress or results',
    exampleKo: '팀장님께 프로젝트 진행 상황을 보고했어요.',
    exampleEn: 'I reported the project status to my team leader.',
    emoji: '📊',
  },
  {
    id: 'daily_07',
    category: '일상',
    categoryEn: 'Daily',
    termKo: '결재',
    termEn: 'Approval',
    definitionKo: '문서나 계획에 상사가 허가해 주는 것',
    definitionEn: 'A superior\'s official approval of a document or plan',
    exampleKo: '휴가 신청서에 결재를 받아야 해요.',
    exampleEn: 'I need to get my leave application approved.',
    emoji: '✅',
  },
  {
    id: 'daily_08',
    category: '일상',
    categoryEn: 'Daily',
    termKo: '휴가',
    termEn: 'Paid leave / Vacation',
    definitionKo: '회사에서 허락하는 쉬는 날',
    definitionEn: 'Approved days off from work',
    exampleKo: '이번 주에 연차 휴가를 쓸 거예요.',
    exampleEn: 'I\'m using my annual leave this week.',
    emoji: '🏖️',
  },

  // ── 회의 (Meeting) ────────────────────────

  {
    id: 'meeting_term_01',
    category: '회의',
    categoryEn: 'Meeting',
    termKo: '안건',
    termEn: 'Agenda item',
    definitionKo: '회의에서 의논할 주제나 문제',
    definitionEn: 'A topic or issue to be discussed in a meeting',
    exampleKo: '오늘 회의 안건이 뭐예요?',
    exampleEn: 'What\'s on the agenda for today\'s meeting?',
    emoji: '📌',
  },
  {
    id: 'meeting_term_02',
    category: '회의',
    categoryEn: 'Meeting',
    termKo: '브리핑',
    termEn: 'Briefing',
    definitionKo: '중요한 정보를 짧게 요약해서 전달하는 것',
    definitionEn: 'A short summary of important information',
    exampleKo: '아침에 5분 브리핑이 있어요.',
    exampleEn: 'There\'s a 5-minute briefing in the morning.',
    emoji: '📣',
  },
  {
    id: 'meeting_term_03',
    category: '회의',
    categoryEn: 'Meeting',
    termKo: '피드백',
    termEn: 'Feedback',
    definitionKo: '상대방의 일에 대해 의견이나 평가를 말해주는 것',
    definitionEn: 'Giving opinions or evaluation on someone\'s work',
    exampleKo: '발표 후 팀장님께 피드백을 받았어요.',
    exampleEn: 'I received feedback from my team leader after the presentation.',
    emoji: '💬',
  },
  {
    id: 'meeting_term_04',
    category: '회의',
    categoryEn: 'Meeting',
    termKo: '데드라인',
    termEn: 'Deadline',
    definitionKo: '일을 끝내야 하는 마지막 날짜 또는 시간',
    definitionEn: 'The final date or time by which work must be completed',
    exampleKo: '이 보고서 데드라인이 언제예요?',
    exampleEn: 'What\'s the deadline for this report?',
    emoji: '⏰',
  },
  {
    id: 'meeting_term_05',
    category: '회의',
    categoryEn: 'Meeting',
    termKo: '어젠다',
    termEn: 'Agenda',
    definitionKo: '회의에서 다룰 내용의 목록이나 순서',
    definitionEn: 'The list or order of topics to be covered in a meeting',
    exampleKo: '회의 전에 어젠다를 미리 공유해 주세요.',
    exampleEn: 'Please share the agenda before the meeting.',
    emoji: '🗒️',
  },
  {
    id: 'meeting_term_06',
    category: '회의',
    categoryEn: 'Meeting',
    termKo: '팔로업',
    termEn: 'Follow-up',
    definitionKo: '이전에 논의한 내용을 확인하거나 추가로 처리하는 것',
    definitionEn: 'Checking on or continuing something previously discussed',
    exampleKo: '지난 회의 팔로업이 필요해요.',
    exampleEn: 'We need to follow up on the previous meeting.',
    emoji: '🔄',
  },

  // ── 식사 (Dining) ─────────────────────────

  {
    id: 'dining_term_01',
    category: '식사',
    categoryEn: 'Dining',
    termKo: '회식',
    termEn: 'Company dinner / Team dinner',
    definitionKo: '회사 팀원들이 함께 식사하거나 술을 마시는 자리',
    definitionEn: 'A social dinner or drinking gathering with work colleagues',
    exampleKo: '오늘 저녁에 팀 회식이 있어요.',
    exampleEn: 'There\'s a team dinner tonight.',
    emoji: '🍻',
  },
  {
    id: 'dining_term_02',
    category: '식사',
    categoryEn: 'Dining',
    termKo: '단체식사',
    termEn: 'Group meal',
    definitionKo: '여러 사람이 함께 하는 식사',
    definitionEn: 'A meal shared by a group of people',
    exampleKo: '점심에 단체식사가 있어요.',
    exampleEn: 'We have a group lunch today.',
    emoji: '🍱',
  },
  {
    id: 'dining_term_03',
    category: '식사',
    categoryEn: 'Dining',
    termKo: '상석',
    termEn: 'Seat of honor',
    definitionKo: '가장 높은 지위의 사람이 앉는 자리 (보통 문에서 먼 안쪽)',
    definitionEn: 'The seat reserved for the most senior person, usually farthest from the door',
    exampleKo: '상석에 부장님을 모셨어요.',
    exampleEn: 'We seated the department head in the place of honor.',
    emoji: '👑',
  },
  {
    id: 'dining_term_04',
    category: '식사',
    categoryEn: 'Dining',
    termKo: '건배',
    termEn: 'Toast (cheers)',
    definitionKo: '잔을 들고 서로의 건강이나 성공을 바라며 마시는 것',
    definitionEn: 'Raising glasses and drinking to each other\'s health or success',
    exampleKo: '"건배!" 하면서 잔을 부딪혔어요.',
    exampleEn: 'We clinked glasses and said "Geonbae (Cheers)!"',
    emoji: '🥂',
  },
  {
    id: 'dining_term_05',
    category: '식사',
    categoryEn: 'Dining',
    termKo: '2차',
    termEn: 'Second venue / After-party',
    definitionKo: '회식에서 첫 번째 장소 이후 이동해서 계속하는 자리',
    definitionEn: 'Moving to a second location to continue the gathering after the main dinner',
    exampleKo: '"2차는 어디 갈까요?" 라고 물어봤어요.',
    exampleEn: '"Where should we go for round two?" they asked.',
    emoji: '🎤',
  },
  {
    id: 'dining_term_06',
    category: '식사',
    categoryEn: 'Dining',
    termKo: '한턱',
    termEn: 'Treating someone / Picking up the tab',
    definitionKo: '한 사람이 다른 사람들의 식사나 음료 비용을 내주는 것',
    definitionEn: 'One person paying for everyone else\'s food or drinks',
    exampleKo: '승진 기념으로 팀원들에게 한턱 냈어요.',
    exampleEn: 'I treated my team to celebrate my promotion.',
    emoji: '💳',
  },
  {
    id: 'dining_term_07',
    category: '식사',
    categoryEn: 'Dining',
    termKo: '각자계산',
    termEn: 'Going Dutch / Splitting the bill',
    definitionKo: '각자 자기 몫을 따로 내는 것',
    definitionEn: 'Each person paying for their own share',
    exampleKo: '오늘은 각자계산으로 하자.',
    exampleEn: 'Let\'s split the bill today.',
    emoji: '🪙',
  },

  // ── 인간관계 (Relations) ──────────────────

  {
    id: 'rel_01',
    category: '인간관계',
    categoryEn: 'Relations',
    termKo: '선배',
    termEn: 'Senior colleague',
    definitionKo: '나보다 먼저 입사했거나 나이가 많은 직장 동료',
    definitionEn: 'A colleague who joined the company before you or is older',
    exampleKo: '선배에게 모르는 것을 물어봤어요.',
    exampleEn: 'I asked my senior colleague about something I didn\'t know.',
    emoji: '👤',
  },
  {
    id: 'rel_02',
    category: '인간관계',
    categoryEn: 'Relations',
    termKo: '후배',
    termEn: 'Junior colleague',
    definitionKo: '나보다 나중에 입사했거나 나이가 어린 직장 동료',
    definitionEn: 'A colleague who joined after you or is younger',
    exampleKo: '후배가 질문을 했을 때 친절하게 알려줬어요.',
    exampleEn: 'I kindly explained things when my junior colleague asked.',
    emoji: '🧑',
  },
  {
    id: 'rel_03',
    category: '인간관계',
    categoryEn: 'Relations',
    termKo: '동기',
    termEn: 'Same-year colleague / Peer',
    definitionKo: '같은 해에 같은 회사에 입사한 동료',
    definitionEn: 'A colleague who joined the company in the same year',
    exampleKo: '동기들이랑 점심을 같이 먹었어요.',
    exampleEn: 'I had lunch with my same-year colleagues.',
    emoji: '👥',
  },
  {
    id: 'rel_04',
    category: '인간관계',
    categoryEn: 'Relations',
    termKo: '상사',
    termEn: 'Superior / Boss',
    definitionKo: '나보다 직급이 높은 사람',
    definitionEn: 'A person with a higher rank or position than yours',
    exampleKo: '상사에게 결재를 받았어요.',
    exampleEn: 'I got approval from my superior.',
    emoji: '👔',
  },
  {
    id: 'rel_05',
    category: '인간관계',
    categoryEn: 'Relations',
    termKo: '부하',
    termEn: 'Subordinate',
    definitionKo: '나보다 직급이 낮은 사람',
    definitionEn: 'A person with a lower rank or position than yours',
    exampleKo: '팀장으로서 부하 직원을 잘 이끌어야 해요.',
    exampleEn: 'As a team leader, I need to guide my subordinates well.',
    emoji: '🧑‍💼',
  },
  {
    id: 'rel_06',
    category: '인간관계',
    categoryEn: 'Relations',
    termKo: '팀장',
    termEn: 'Team leader',
    definitionKo: '팀을 이끄는 책임자',
    definitionEn: 'The person in charge of leading a team',
    exampleKo: '팀장님께 보고를 드렸어요.',
    exampleEn: 'I gave a report to my team leader.',
    emoji: '🏅',
  },
  {
    id: 'rel_07',
    category: '인간관계',
    categoryEn: 'Relations',
    termKo: '눈치',
    termEn: 'Social awareness / Reading the room',
    definitionKo: '상황이나 분위기를 빠르게 파악하는 능력',
    definitionEn: 'The ability to quickly read social situations and unspoken expectations',
    exampleKo: '눈치가 빠른 사람은 직장에서 잘 적응해요.',
    exampleEn: 'People who are good at reading the room adapt well in the workplace.',
    emoji: '👁️',
  },
  {
    id: 'rel_08',
    category: '인간관계',
    categoryEn: 'Relations',
    termKo: '갑질',
    termEn: 'Workplace bullying / Power abuse',
    definitionKo: '권력이나 지위를 이용해서 약자를 괴롭히거나 부당하게 대우하는 행동',
    definitionEn: 'Using power or status to mistreat or bully those in a weaker position',
    exampleKo: '갑질을 당하면 회사 내 신고 센터에 상담할 수 있어요.',
    exampleEn: 'If you experience workplace bullying, you can contact the company\'s reporting center.',
    emoji: '🚫',
  },
];

// ─────────────────────────────────────────────
// 3. EMAIL_SITUATIONS
// ─────────────────────────────────────────────

export const EMAIL_SITUATIONS: EmailSituation[] = [
  {
    id: 'email_leave',
    nameKo: '휴가 신청',
    nameEn: 'Leave Request',
    emoji: '🏖️',
    fields: ['휴가 기간 (시작일~종료일)', '휴가 이유 (선택)', '업무 인수인계 담당자'],
    exampleSubject: '[휴가 신청] 연차 사용 요청 - 홍길동 (4/21~4/23)',
  },
  {
    id: 'email_report',
    nameKo: '업무 보고',
    nameEn: 'Work Report',
    emoji: '📊',
    fields: ['보고 대상 프로젝트/업무명', '진행 현황 (완료/진행 중/예정)', '특이사항 또는 요청사항'],
    exampleSubject: '[보고] OO 프로젝트 주간 진행 현황 - 홍길동',
  },
  {
    id: 'email_meeting',
    nameKo: '회의 요청',
    nameEn: 'Meeting Request',
    emoji: '📅',
    fields: ['회의 목적', '희망 날짜 및 시간 (2~3개)', '예상 소요 시간', '참석 요청 인원'],
    exampleSubject: '[회의 요청] OO 건 검토 미팅 일정 확인 요청 - 홍길동',
  },
  {
    id: 'email_thanks',
    nameKo: '감사 인사',
    nameEn: 'Thank You',
    emoji: '🙏',
    fields: ['감사한 이유 또는 도움 받은 내용', '앞으로의 다짐 또는 마무리 인사'],
    exampleSubject: '[감사] 프로젝트 지원에 감사드립니다 - 홍길동',
  },
  {
    id: 'email_apology',
    nameKo: '사과',
    nameEn: 'Apology',
    emoji: '😔',
    fields: ['실수 또는 문제 내용', '발생 원인 (간략히)', '해결 방안 또는 재발 방지 계획'],
    exampleSubject: '[사과] OO 업무 처리 지연에 대한 사과 말씀 - 홍길동',
  },
  {
    id: 'email_resignation',
    nameKo: '퇴사 인사',
    nameEn: 'Resignation Goodbye',
    emoji: '👋',
    fields: ['마지막 근무일', '함께 일하며 감사한 점', '향후 연락처 (선택)'],
    exampleSubject: '[인사] 퇴사 인사 말씀 드립니다 - 홍길동',
  },
];

// ─────────────────────────────────────────────
// 4. HONORIFIC_EXERCISES
// ─────────────────────────────────────────────

export const HONORIFIC_EXERCISES: HonorificExercise[] = [
  {
    id: 'hon_01',
    casualKo: '이거 해.',
    casualEn: 'Do this.',
    correctHonorificKo: '이것 좀 해주실 수 있으세요?',
    hintKo: '"해" → "해주세요" 또는 "해주실 수 있으세요?"로 바꾸면 됩니다.',
    difficulty: 1,
  },
  {
    id: 'hon_02',
    casualKo: '밥 먹었어?',
    casualEn: 'Did you eat?',
    correctHonorificKo: '식사하셨어요?',
    hintKo: '"밥" → "식사", "먹었어?" → "하셨어요?"로 바꾸면 됩니다.',
    difficulty: 1,
  },
  {
    id: 'hon_03',
    casualKo: '나 먼저 갈게.',
    casualEn: 'I\'m going first.',
    correctHonorificKo: '먼저 가보겠습니다.',
    hintKo: '"나" 대신 "저", "갈게" → "가겠습니다"로 바꾸면 됩니다.',
    difficulty: 2,
  },
  {
    id: 'hon_04',
    casualKo: '그거 왜 그래?',
    casualEn: 'Why is that like that?',
    correctHonorificKo: '그 부분은 어떻게 된 건지 여쭤봐도 될까요?',
    hintKo: '직접적인 질문 대신 "여쭤봐도 될까요?"처럼 완곡하게 표현하는 것이 중요합니다.',
    difficulty: 3,
  },
  {
    id: 'hon_05',
    casualKo: '잠깐 기다려.',
    casualEn: 'Wait a moment.',
    correctHonorificKo: '잠시만 기다려 주시겠어요?',
    hintKo: '"기다려" → "기다려 주시겠어요?"처럼 상대방에게 부탁하는 형식으로 바꿉니다.',
    difficulty: 1,
  },
  {
    id: 'hon_06',
    casualKo: '이거 언제 해줘?',
    casualEn: 'When will you do this?',
    correctHonorificKo: '이 건은 언제쯤 처리해 주실 수 있을까요?',
    hintKo: '"이거" → "이 건", "해줘?" → "처리해 주실 수 있을까요?"로 격식체로 바꿉니다.',
    difficulty: 2,
  },
  {
    id: 'hon_07',
    casualKo: '오늘 바빠?',
    casualEn: 'Are you busy today?',
    correctHonorificKo: '오늘 시간이 괜찮으세요?',
    hintKo: '"바빠?" 대신 "시간이 괜찮으세요?"처럼 더 부드럽고 간접적인 표현을 씁니다.',
    difficulty: 2,
  },
  {
    id: 'hon_08',
    casualKo: '그 자료 보내줘.',
    casualEn: 'Send me that document.',
    correctHonorificKo: '해당 자료를 공유해 주시겠어요?',
    hintKo: '"그 자료" → "해당 자료", "보내줘" → "공유해 주시겠어요?"로 바꿉니다.',
    difficulty: 2,
  },
  {
    id: 'hon_09',
    casualKo: '내가 틀렸어.',
    casualEn: 'I was wrong.',
    correctHonorificKo: '제가 잘못 이해한 것 같습니다. 죄송합니다.',
    hintKo: '"내가" → "제가", "틀렸어" → "잘못 이해한 것 같습니다"처럼 사과 표현을 붙여 더 공손하게 합니다.',
    difficulty: 3,
  },
  {
    id: 'hon_10',
    casualKo: '그거 말고 다른 거 없어?',
    casualEn: 'Isn\'t there something other than that?',
    correctHonorificKo: '혹시 다른 방법이나 대안도 있으실까요?',
    hintKo: '"그거 말고" → "혹시", "없어?" → "있으실까요?"처럼 완곡하고 격식체로 전환합니다.',
    difficulty: 3,
  },
];
