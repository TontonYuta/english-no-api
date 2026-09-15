import { RoleplayDialogueTurn, DialogueDifficulty } from '../types';

export interface ChatReplyParams {
  scenario: string;
  userRole: string;
  aiRole: string;
  history?: RoleplayDialogueTurn[];
  lastUserMessage: string;
  difficulty?: DialogueDifficulty;
}

export interface PredefinedScenario {
  id: string;
  icon: string;
  name: string;
  nameVi: string;
  scenario: string;
  userRole: string;
  aiRole: string;
  difficulty: DialogueDifficulty;
  sampleOpening: string;
}

export const POPULAR_CHAT_SCENARIOS: PredefinedScenario[] = [
  {
    id: 'cafe',
    icon: '☕',
    name: 'Coffee Shop & Bakery',
    nameVi: 'Quán Cà Phê & Bánh',
    scenario: 'Ordering an artisan coffee, requesting oat milk, light sweetness, and asking for Wi-Fi',
    userRole: 'Customer',
    aiRole: 'Artisan Barista',
    difficulty: 'A2',
    sampleOpening: 'Welcome to Artisan Brew! What can I craft for you today? Hot or iced?',
  },
  {
    id: 'airport',
    icon: '✈️',
    name: 'Airport Check-in & Baggage',
    nameVi: 'Quầy Check-in Sân Bay',
    scenario: 'Airport check-in with 2.5kg overweight baggage and tight boarding time',
    userRole: 'Passenger',
    aiRole: 'SkyWings Check-in Agent',
    difficulty: 'B1',
    sampleOpening: 'Good morning! Welcome to SkyWings International. May I have your passport and booking code, please?',
  },
  {
    id: 'interview',
    icon: '💼',
    name: 'Tech Job Interview',
    nameVi: 'Phỏng Vấn Lập Trình Viên',
    scenario: 'Software engineering interview discussing system architecture, trade-offs, and microservices',
    userRole: 'Candidate',
    aiRole: 'Engineering Director',
    difficulty: 'B2',
    sampleOpening: 'Hello, welcome to our engineering interview! Could you briefly introduce your background and a recent challenging project?',
  },
  {
    id: 'hotel',
    icon: '🏨',
    name: 'Hotel Front Desk',
    nameVi: 'Lễ Tân Khách Sạn',
    scenario: 'Late night check-in with room air conditioner broken and requesting a room change',
    userRole: 'Hotel Guest',
    aiRole: 'Duty Front Desk Manager',
    difficulty: 'B1',
    sampleOpening: 'Good evening! Welcome to the Grand Horizon Hotel. How may I assist you with your stay tonight?',
  },
  {
    id: 'restaurant',
    icon: '🍽️',
    name: 'Fine Dining Restaurant',
    nameVi: 'Nhà Hàng Ăn Tối',
    scenario: 'Ordering dinner, asking for chef specials, wine pairing, and dietary preferences',
    userRole: 'Diner',
    aiRole: 'Head Waiter',
    difficulty: 'B2',
    sampleOpening: 'Good evening and welcome to Le Bistro. Have you dined with us before, or may I present our seasonal tasting menu?',
  },
  {
    id: 'doctor',
    icon: '🏥',
    name: 'Medical Clinic & Doctor',
    nameVi: 'Phòng Khám Bác Sĩ',
    scenario: 'Describing persistent flu symptoms, mild fever, and getting medical advice and prescription',
    userRole: 'Patient',
    aiRole: 'General Physician',
    difficulty: 'B1',
    sampleOpening: 'Hello, please take a seat. What seems to be bothering you today, and how long have you had these symptoms?',
  },
  {
    id: 'shopping',
    icon: '🛍️',
    name: 'Fashion Retail Store',
    nameVi: 'Cửa Hàng Quần Áo',
    scenario: 'Shopping for a jacket, asking for a different size or color, and asking about store return policy',
    userRole: 'Shopper',
    aiRole: 'Fashion Consultant',
    difficulty: 'A2',
    sampleOpening: 'Hi there! Feel free to browse our autumn collection. Let me know if you need a different size or fitting room!',
  },
  {
    id: 'smalltalk',
    icon: '💬',
    name: 'Daily Casual Chit-Chat',
    nameVi: 'Trò Chuyện Đời Thường',
    scenario: 'Casual friendly chat about weekend plans, favorite movies, and learning English',
    userRole: 'Friend',
    aiRole: 'Friendly Native Speaker',
    difficulty: 'A2',
    sampleOpening: "Hey there! How's your day going so far? Got any exciting plans coming up for this weekend?",
  },
  {
    id: 'tutor',
    icon: '🎓',
    name: '1-on-1 English Tutor',
    nameVi: 'Gia Sư Tiếng Anh 1-1',
    scenario: 'Explaining natural English phrasing, correcting common mistakes, and practicing conversation',
    userRole: 'Eager Student',
    aiRole: 'Oxford English Tutor',
    difficulty: 'B1',
    sampleOpening: "Hello! I'm your English speaking coach today. What topic or grammar point would you like to practice together?",
  },
];

/**
 * Detects common grammatical or phrasing slips by English learners
 * and provides constructive, friendly feedback without breaking the flow.
 */
export function detectGrammarFeedback(text: string): string | undefined {
  const clean = text.trim().toLowerCase();

  // "I am agree" / "I'm agree"
  if (/\b(i\s*am|i'm)\s+agree\b/i.test(clean)) {
    return "💡 Tip ngữ pháp: Dùng 'I agree' thay vì 'I am agree' ('agree' bản thân đã là động từ).";
  }

  // "I have ... years old"
  if (/\bi\s+have\s+\d+\s+years\s+old\b/i.test(clean)) {
    return "💡 Tip ngữ pháp: Trong tiếng Anh, nói tuổi dùng 'I am ... years old' hoặc 'I'm ...', không dùng động từ 'have'.";
  }

  // "look forward to hear"
  if (/\blook\s+forward\s+to\s+hear\b/i.test(clean)) {
    return "💡 Tip ngữ pháp: Cụm 'look forward to' đi với V-ing: 'look forward to hearing from you'.";
  }

  // "explain me"
  if (/\bexplain\s+me\b/i.test(clean)) {
    return "💡 Tip ngữ pháp: Động từ 'explain' cần giới từ 'to': 'Can you explain to me...' hoặc 'explain this to me'.";
  }

  // "informations" or "advices" (uncountable)
  if (/\b(informations|advices)\b/i.test(clean)) {
    return "💡 Tip từ vựng: 'Information' và 'advice' là danh từ không đếm được; dùng 'some information/advice' hoặc 'a piece of advice'.";
  }

  // "discuss about"
  if (/\bdiscuss\s+about\b/i.test(clean)) {
    return "💡 Tip ngữ pháp: 'Discuss' là ngoại động từ tác động trực tiếp: 'discuss the issue' thay vì 'discuss about'.";
  }

  // "depend of"
  if (/\bdepend\s+of\b/i.test(clean)) {
    return "💡 Tip ngữ pháp: Dùng giới từ 'on': 'It depends on...' thay vì 'depends of'.";
  }

  // "pay by cash"
  if (/\bpay\s+by\s+cash\b/i.test(clean)) {
    return "💡 Tip từ vựng: Người bản xứ thường nói 'pay in cash' (tiền mặt) hoặc 'pay by card' (thẻ).";
  }

  // "suggest me to"
  if (/\bsuggest\s+me\s+to\b/i.test(clean)) {
    return "💡 Tip cấu trúc: Dùng 'suggest that I do' hoặc 'recommend that I do' thay vì 'suggest me to'.";
  }

  // Subject-Verb Agreement: "he/she/it don't"
  if (/\b(he|she|it)\s+don't\b/i.test(clean)) {
    return "💡 Tip ngữ pháp: Với ngôi thứ ba số ít (he/she/it), dùng trợ động từ 'doesn't' thay vì 'don't'.";
  }

  // Double past: "didn't went / didn't knew / didn't saw"
  if (/\b(didn't|did not)\s+(went|knew|saw|had|came|bought|wrote|took)\b/i.test(clean)) {
    return "💡 Tip ngữ pháp: Sau trợ động từ 'didn't / did not', động từ chính luôn trở về nguyên mẫu (bare infinitive): didn't go, didn't know, didn't see...";
  }

  // "told that" without personal object (tell needs personal object: told me/us)
  if (/\btold\s+that\b/i.test(clean)) {
    return "💡 Tip ngữ pháp: 'Tell/told' cần tân ngữ chỉ người ('told me that'), nếu không có người nghe hãy dùng 'said that'.";
  }

  // "much people" / "much books"
  if (/\bmuch\s+(people|books|students|friends|items|cars)\b/i.test(clean)) {
    return "💡 Tip từ vựng: Danh từ đếm được số nhiều đi với 'many', không dùng 'much': 'many people', 'many books'.";
  }

  // "every people"
  if (/\bevery\s+people\b/i.test(clean)) {
    return "💡 Tip từ vựng: 'Every' đi với danh từ số ít ('everyone', 'every person'), không dùng 'every people'.";
  }

  // "since 2 years" (duration vs point in time)
  if (/\bsince\s+\d+\s+(years|months|days|hours|weeks)\b/i.test(clean)) {
    return "💡 Tip ngữ pháp: Nói về khoảng thời gian kéo dài dùng 'for' ('for 2 years'), 'since' chỉ dùng với mốc thời gian ('since 2022').";
  }

  // "borrow me"
  if (/\bborrow\s+me\b/i.test(clean)) {
    return "💡 Tip từ vựng: 'Borrow' là mượn về; nhờ người khác đưa đồ cho mình mượn hãy dùng 'lend me' hoặc 'Can I borrow...?'.";
  }

  // "learn me"
  if (/\blearn\s+me\b/i.test(clean)) {
    return "💡 Tip từ vựng: Dùng 'teach me' (dạy tôi), không dùng 'learn me'.";
  }

  return undefined;
}

/**
 * Generates the authentic opening line from the AI partner to kickstart a live chat.
 */
export function getOpeningChatMessage(params: {
  scenario: string;
  userRole: string;
  aiRole: string;
  dialogue?: RoleplayDialogueTurn[];
}): RoleplayDialogueTurn {
  const { scenario, userRole, aiRole, dialogue } = params;
  const now = new Date();
  const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const scenLower = (scenario || '').toLowerCase();

  // If a pre-scripted dialogue already has an opening partner turn, reuse it ONLY if it matches the scenario topic
  if (dialogue && dialogue.length > 0) {
    const firstTurn = dialogue[0];
    const isFirstUser = firstTurn.isUser ?? (
      firstTurn.speaker.toLowerCase().includes((userRole || '').toLowerCase()) ||
      firstTurn.speaker.toLowerCase().includes('you')
    );

    const firstTextLower = (firstTurn.text || '').toLowerCase();
    const isAirportTurn = firstTextLower.includes('skywings') || firstTextLower.includes('passport') || firstTextLower.includes('flight');
    const isAirportScenario = scenLower.includes('airport') || scenLower.includes('flight') || scenLower.includes('baggage');
    const isMismatched = isAirportTurn && !isAirportScenario;

    if (!isFirstUser && !isMismatched) {
      return {
        ...firstTurn,
        timestamp: firstTurn.timestamp || timestamp,
        isUser: false,
      };
    }
  }

  // Check matching predefined scenarios
  const matchedPredef = POPULAR_CHAT_SCENARIOS.find((p) =>
    scenLower.includes(p.id) ||
    scenLower.includes(p.name.toLowerCase()) ||
    scenLower.includes(p.nameVi.toLowerCase())
  );
  if (matchedPredef) {
    return {
      speaker: aiRole || matchedPredef.aiRole,
      text: matchedPredef.sampleOpening,
      translationVi: getOpeningTranslation(matchedPredef.id),
      audioTip: 'Natural, inviting conversational tone',
      usefulExpression: 'What can I craft for you today?',
      timestamp,
      isUser: false,
    };
  }

  // Airport check-in
  if (scenLower.includes('airport') || scenLower.includes('flight') || scenLower.includes('baggage') || scenLower.includes('gate')) {
    return {
      speaker: aiRole || 'Gate Agent',
      text: 'Good morning! Welcome to SkyWings Airlines check-in. May I please have your passport and booking reference code?',
      translationVi: 'Chào buổi sáng! Chào mừng quý khách đến quầy làm thủ tục SkyWings. Tôi có thể xin hộ chiếu và mã đặt vé của bạn được không?',
      audioTip: 'Polite welcoming intonation on greeting, rising on polite request',
      usefulExpression: 'May I please have your passport and booking reference code?',
      timestamp,
      isUser: false,
    };
  }

  // Job Interview
  if (scenLower.includes('interview') || scenLower.includes('job') || scenLower.includes('engineer') || scenLower.includes('candidate')) {
    return {
      speaker: aiRole || 'Lead Interviewer',
      text: "Hello, welcome to our engineering interview session! We're glad to have you here today. Could you briefly introduce your background and recent projects?",
      translationVi: 'Xin chào, chào mừng bạn đến với buổi phỏng vấn của chúng tôi! Rất vui được gặp bạn hôm nay. Bạn có thể giới thiệu ngắn gọn về kinh nghiệm và các dự án gần đây của mình không?',
      audioTip: 'Professional yet welcoming cadence; natural pause before the question',
      usefulExpression: 'Could you briefly introduce your background and recent projects?',
      timestamp,
      isUser: false,
    };
  }

  // Hotel
  if (scenLower.includes('hotel') || scenLower.includes('room') || scenLower.includes('concierge') || scenLower.includes('resort')) {
    return {
      speaker: aiRole || 'Front Desk Staff',
      text: 'Good evening! Welcome to the Grand Horizon Hotel. How may I assist you with your stay this evening?',
      translationVi: 'Chào buổi tối! Chào mừng quý khách đến khách sạn Grand Horizon. Tôi có thể hỗ trợ gì cho kỳ nghỉ của quý khách tối nay ạ?',
      audioTip: 'Warm and courteous hospitality tone',
      usefulExpression: 'How may I assist you with your stay this evening?',
      timestamp,
      isUser: false,
    };
  }

  // Restaurant / Cafe
  if (scenLower.includes('restaurant') || scenLower.includes('cafe') || scenLower.includes('coffee') || scenLower.includes('barista') || scenLower.includes('order')) {
    return {
      speaker: aiRole || 'Barista / Server',
      text: "Hello and welcome! A table for one, or what can I get started for you to drink today?",
      translationVi: 'Xin chào và chào mừng quý khách! Quý khách đi một mình hay tôi có thể lấy cho bạn đồ uống gì để bắt đầu hôm nay ạ?',
      audioTip: 'Upbeat friendly hospitality greeting',
      usefulExpression: 'What can I get started for you today?',
      timestamp,
      isUser: false,
    };
  }

  // Doctor / Health
  if (scenLower.includes('doctor') || scenLower.includes('clinic') || scenLower.includes('hospital') || scenLower.includes('health') || scenLower.includes('patient')) {
    return {
      speaker: aiRole || 'Doctor',
      text: 'Good afternoon. Please come in and take a seat. How have you been feeling lately, and what symptoms brought you in today?',
      translationVi: 'Chào buổi chiều. Mời bạn vào và ngồi xuống. Dạo này bạn cảm thấy thế nào, và có những triệu chứng gì khiến bạn đi khám hôm nay?',
      audioTip: 'Empathetic, attentive medical tone',
      usefulExpression: 'What symptoms brought you in today?',
      timestamp,
      isUser: false,
    };
  }

  // General fallback
  return {
    speaker: aiRole || 'Partner',
    text: `Hello! I'm your ${aiRole || 'conversation partner'} for today's practice on "${scenario}". I'm ready whenever you are—how would you like to begin?`,
    translationVi: `Xin chào! Tôi là ${aiRole || 'bạn đồng hành'} của bạn trong buổi luyện tập về "${scenario}". Tôi đã sẵn sàng—bạn muốn bắt đầu như thế nào?`,
    audioTip: 'Supportive and friendly conversational opening',
    usefulExpression: "I'm ready whenever you are",
    timestamp,
    isUser: false,
  };
}

function getOpeningTranslation(id: string): string {
  switch (id) {
    case 'cafe':
      return 'Chào mừng đến với tiệm cà phê! Hôm nay tôi có thể pha chế món gì cho bạn? Nóng hay đá ạ?';
    case 'airport':
      return 'Chào buổi sáng! Chào mừng quý khách đến với SkyWings. Tôi có thể xin hộ chiếu và mã đặt vé được không ạ?';
    case 'interview':
      return 'Xin chào, chào mừng bạn đến với buổi phỏng vấn! Bạn có thể giới thiệu đôi nét về bản thân và dự án gần nhất không?';
    case 'hotel':
      return 'Chào buổi tối! Chào mừng quý khách đến Grand Horizon Hotel. Tôi có thể hỗ trợ gì cho kỳ nghỉ của bạn tối nay?';
    case 'restaurant':
      return 'Chào buổi tối và chào mừng đến Le Bistro. Bạn đã từng dùng bữa tại đây chưa, hay để tôi giới thiệu thực đơn đặc biệt nhé?';
    case 'doctor':
      return 'Chào bạn, mời ngồi. Hôm nay bạn thấy khó chịu ở đâu, và những triệu chứng này đã kéo dài bao lâu rồi?';
    case 'shopping':
      return 'Xin chào! Cứ tự nhiên xem bộ sưu tập mùa thu nhé. Hãy báo tôi nếu bạn cần đổi size hoặc phòng thử đồ!';
    case 'smalltalk':
      return 'Chào bạn! Ngày hôm nay của bạn thế nào rồi? Cuối tuần này bạn có kế hoạch thú vị gì không?';
    case 'tutor':
      return 'Xin chào! Hôm nay tôi là giáo viên luyện nói tiếng Anh của bạn. Bạn muốn chúng ta cùng luyện chủ đề hay điểm ngữ pháp nào?';
    default:
      return 'Xin chào! Rất vui được luyện tập tiếng Anh cùng bạn hôm nay.';
  }
}

/**
 * Generates an in-character, conversational response from the AI partner
 * with natural spoken English, Vietnamese translation, audio tip, functional expression,
 * and grammar coaching feedback if slips are detected.
 */
export function generateContextualReply(params: ChatReplyParams): RoleplayDialogueTurn {
  const { scenario, userRole, aiRole, lastUserMessage, difficulty = 'B2' } = params;
  const msg = lastUserMessage.trim().toLowerCase();
  const now = new Date();
  const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Check for grammar feedback
  const grammarFeedback = detectGrammarFeedback(lastUserMessage);
  const scenLower = (scenario || '').toLowerCase();

  // 1. Cafe & Coffee Shop
  if (scenLower.includes('cafe') || scenLower.includes('coffee') || scenLower.includes('barista') || scenLower.includes('bakery')) {
    if (msg.includes('wifi') || msg.includes('wi-fi') || msg.includes('password') || msg.includes('internet')) {
      return {
        speaker: aiRole,
        text: "The Wi-Fi network is 'ArtisanBrew_Guest' and the password is 'FreshCoffee2026'. There are power outlets along the brick wall near the window if you need to charge your laptop!",
        translationVi: "Mạng Wi-Fi là 'ArtisanBrew_Guest' và mật khẩu là 'FreshCoffee2026'. Có các ổ cắm điện dọc theo bức tường gạch gần cửa sổ nếu bạn cần sạc máy tính xách tay nhé!",
        audioTip: "Clear, helpful customer service tone",
        usefulExpression: "power outlets along the wall",
        grammarFeedback,
        timestamp,
        isUser: false,
      };
    }
    if (msg.includes('milk') || msg.includes('oat') || msg.includes('almond') || msg.includes('soy') || msg.includes('sugar') || msg.includes('sweet')) {
      return {
        speaker: aiRole,
        text: "We have creamy oat milk, almond milk, and whole milk available. I can also do it half-sweet with organic agave syrup. Would you like a standard 12-ounce cup or a large 16-ounce?",
        translationVi: "Chúng tôi có sữa yến mạch béo ngậy, sữa hạnh nhân và sữa tươi nguyên kem. Tôi cũng có thể làm giảm nửa đường với siro thùa tự nhiên. Bạn muốn ly tiêu chuẩn 12-ounce hay ly lớn 16-ounce?",
        audioTip: "Rising pitch on cup size question: 'twelve-ounce or large sixteen-ounce?'",
        usefulExpression: "half-sweet with organic agave syrup",
        grammarFeedback,
        timestamp,
        isUser: false,
      };
    }
    if (msg.includes('pastry') || msg.includes('croissant') || msg.includes('cake') || msg.includes('eat') || msg.includes('food') || msg.includes('cookie')) {
      return {
        speaker: aiRole,
        text: "Our almond croissants and warm blueberry scones were just pulled out of the oven twenty minutes ago! Would you like me to warm one up on a plate for you?",
        translationVi: "Bánh sừng bò hạnh nhân và bánh scone việt quất ấm giòn của chúng tôi vừa mới ra lò 20 phút trước! Bạn có muốn tôi hâm nóng một chiếc lên đĩa cho bạn không?",
        audioTip: "Enthusiastic recommendation cadence",
        usefulExpression: "warm one up on a plate for you",
        grammarFeedback,
        timestamp,
        isUser: false,
      };
    }
    if (msg.includes('latte') || msg.includes('cappuccino') || msg.includes('espresso') || msg.includes('americano') || msg.includes('tea') || msg.includes('order')) {
      return {
        speaker: aiRole,
        text: "Wonderful choice! An iced oat vanilla latte has a rich espresso kick with smooth velvety microfoam. Would that be for here or to go?",
        translationVi: "Lựa chọn tuyệt vời! Một ly latte yến mạch vani đá có vị cà phê đậm đà kết hợp với lớp bọt sữa sánh mịn. Bạn dùng tại quán hay mang đi ạ?",
        audioTip: "Warm, prompt inquiry on 'for here or to go?'",
        usefulExpression: "Would that be for here or to go?",
        grammarFeedback,
        timestamp,
        isUser: false,
      };
    }
    if (msg.includes('pay') || msg.includes('card') || msg.includes('cash') || msg.includes('how much') || msg.includes('bill')) {
      return {
        speaker: aiRole,
        text: "That comes out to $5.25 total. You can tap your contactless card or Apple Pay right on the screen. Take a seat and I'll bring your drink right over when it's ready!",
        translationVi: "Tổng cộng là 5,25$. Bạn có thể chạm thẻ không tiếp xúc hoặc Apple Pay ngay trên màn hình. Mời bạn tìm chỗ ngồi và tôi sẽ mang đồ uống lại tận nơi khi xong nhé!",
        audioTip: "Polite payment prompt cadence",
        usefulExpression: "tap your contactless card right on the screen",
        grammarFeedback,
        timestamp,
        isUser: false,
      };
    }
  }

  // 2. Airport & Flight
  if (scenLower.includes('airport') || scenLower.includes('flight') || scenLower.includes('baggage') || scenLower.includes('check-in') || scenLower.includes('gate')) {
    if (msg.includes('overweight') || msg.includes('heavy') || msg.includes('kilo') || msg.includes('kg') || msg.includes('fee')) {
      return {
        speaker: aiRole,
        text: "I see your suitcase is about 2.5kg over the allowance. Since your flight boards shortly, you can either repack a few items into your carry-on or pay a small excess baggage fee of $25. Which would you prefer?",
        translationVi: "Tôi thấy kiện hành lý của bạn vượt quá mức quy định khoảng 2,5kg. Vì chuyến bay sắp khởi hành, bạn có thể chuyển bớt một vài món đồ sang hành lý xách tay hoặc thanh toán một khoản phí hành lý quá cước nhỏ là 25$. Bạn muốn chọn phương án nào?",
        audioTip: "Falling intonation on 'Which would you prefer?' for polite business inquiry",
        usefulExpression: "either repack ... or pay a small excess baggage fee",
        grammarFeedback,
        timestamp,
        isUser: false,
      };
    }
    if (msg.includes('carry-on') || msg.includes('repack') || msg.includes('take out') || msg.includes('bag')) {
      return {
        speaker: aiRole,
        text: "Sure thing! There's a bench right over there where you can rearrange your belongings. Once you're done, bring it straight back to this counter without waiting in line again.",
        translationVi: "Chắc chắn rồi! Ngay đằng kia có một chiếc ghế băng để bạn sắp xếp lại đồ đạc. Khi xong, hãy mang thẳng lại quầy này mà không cần xếp hàng lại đâu nhé.",
        audioTip: "Warm, supportive customer-service tone",
        usefulExpression: "bring it straight back to this counter without waiting in line",
        grammarFeedback,
        timestamp,
        isUser: false,
      };
    }
    if (msg.includes('seat') || msg.includes('window') || msg.includes('aisle') || msg.includes('row')) {
      return {
        speaker: aiRole,
        text: "Let me check our cabin map. I have an exit-row seat with extra legroom available, or a quiet window seat in row 12. Would you prefer the window or the aisle seat?",
        translationVi: "Để tôi kiểm tra sơ đồ khoang máy bay. Tôi có một chỗ ngồi ở hàng cửa thoát hiểm với khoảng để chân rộng rãi, hoặc một ghế cạnh cửa sổ yên tĩnh ở hàng 12. Bạn thích ghế cửa sổ hay lối đi hơn?",
        audioTip: "Courteous customer care pace",
        usefulExpression: "extra legroom / window or aisle seat",
        grammarFeedback,
        timestamp,
        isUser: false,
      };
    }
    if (msg.includes('pay') || msg.includes('fee') || msg.includes('card') || msg.includes('cash') || msg.includes('receipt')) {
      return {
        speaker: aiRole,
        text: "Certainly. You can tap your credit card or phone right on the payment terminal here. Here is your boarding pass: Gate 14B, boarding starts in fifteen minutes. Have a pleasant flight!",
        translationVi: "Dạ được chứ. Bạn có thể chạm thẻ tín dụng hoặc điện thoại ngay trên máy quẹt thẻ ở đây. Đây là thẻ lên máy bay của bạn: Cửa số 14B, bắt đầu lên máy bay sau 15 phút nữa. Chúc bạn có một chuyến bay vui vẻ!",
        audioTip: "Clear articulation of gate numbers and departure times",
        usefulExpression: "tap your credit card on the payment terminal",
        grammarFeedback,
        timestamp,
        isUser: false,
      };
    }
    if (msg.includes('passport') || msg.includes('ticket') || msg.includes('here') || msg.includes('code')) {
      return {
        speaker: aiRole,
        text: "Thank you very much. I have pulled up your reservation for the flight to London. Are you checking any luggage today, or do you only have carry-on bags?",
        translationVi: "Cảm ơn bạn rất nhiều. Tôi đã tìm thấy mã vé của bạn cho chuyến bay đến London. Bạn có gửi hành lý nào hôm nay không, hay bạn chỉ mang hành lý xách tay thôi?",
        audioTip: "Professional airport check-in cadence",
        usefulExpression: "I have pulled up your reservation",
        grammarFeedback,
        timestamp,
        isUser: false,
      };
    }
  }

  // 3. Tech Job Interview
  if (scenLower.includes('interview') || scenLower.includes('engineer') || scenLower.includes('technical') || scenLower.includes('job') || scenLower.includes('candidate')) {
    if (msg.includes('architecture') || msg.includes('microservice') || msg.includes('server') || msg.includes('scale') || msg.includes('database')) {
      return {
        speaker: aiRole,
        text: "That's a very pragmatic architectural decision. When decoupling that service, how did you manage database transactions and prevent eventual consistency issues across distributed nodes?",
        translationVi: "Đó là một quyết định kiến trúc rất thực tế. Khi tách riêng dịch vụ đó, bạn đã quản lý các giao dịch cơ sở dữ liệu và ngăn chặn các sự cố về tính nhất quán cuối cùng giữa các nút phân tán như thế nào?",
        audioTip: "Emphasis on 'pragmatic' and 'eventual consistency'",
        usefulExpression: "manage database transactions and prevent eventual consistency issues",
        grammarFeedback,
        timestamp,
        isUser: false,
      };
    }
    if (msg.includes('redis') || msg.includes('cache') || msg.includes('queue') || msg.includes('kafka') || msg.includes('failover')) {
      return {
        speaker: aiRole,
        text: "Excellent breakdown. Caching and message queues definitely alleviate peak read latency. How did your monitoring stack alert you before bottlenecks impacted the end-user experience?",
        translationVi: "Phân tích xuất sắc. Bộ nhớ đệm và hàng đợi tin nhắn chắc chắn giúp giảm thiểu độ trễ đọc vào giờ cao điểm. Hệ thống giám sát của bạn đã cảnh báo trước khi các điểm nghẽn làm ảnh hưởng đến trải nghiệm người dùng cuối như thế nào?",
        audioTip: "Enthusiastic professional engagement",
        usefulExpression: "alleviate peak read latency",
        grammarFeedback,
        timestamp,
        isUser: false,
      };
    }
    if (msg.includes('conflict') || msg.includes('team') || msg.includes('disagree') || msg.includes('deadline')) {
      return {
        speaker: aiRole,
        text: "Handling cross-functional alignment under tight deadlines is a crucial leadership skill. Can you share an example of how you persuaded stakeholders when engineering trade-offs were required?",
        translationVi: "Xử lý sự đồng thuận liên phòng ban dưới áp lực thời hạn gấp là kỹ năng lãnh đạo cốt lõi. Bạn có thể chia sẻ một ví dụ về cách bạn thuyết phục các bên liên quan khi cần đánh đổi kỹ thuật không?",
        audioTip: "Calm, thoughtful behavioral query cadence",
        usefulExpression: "handling cross-functional alignment under tight deadlines",
        grammarFeedback,
        timestamp,
        isUser: false,
      };
    }
    if (msg.includes('introduce') || msg.includes('experience') || msg.includes('background') || msg.includes('year') || msg.includes('work')) {
      return {
        speaker: aiRole,
        text: "That is impressive experience. Leading system design while maintaining production reliability requires balanced technical trade-offs. What was the single most challenging production outage you resolved?",
        translationVi: "Kinh nghiệm thực sự ấn tượng. Dẫn dắt thiết kế hệ thống trong khi duy trì độ tin cậy vận hành đòi hỏi sự cân bằng kỹ thuật sâu sắc. Sự cố sập production thách thức nhất mà bạn từng xử lý là gì?",
        audioTip: "Inquisitive, encouraging demeanor",
        usefulExpression: "balanced technical trade-offs",
        grammarFeedback,
        timestamp,
        isUser: false,
      };
    }
  }

  // 4. Hotel Front Desk
  if (scenLower.includes('hotel') || scenLower.includes('room') || scenLower.includes('complaint') || scenLower.includes('guest')) {
    if (msg.includes('air conditioner') || msg.includes('ac') || msg.includes('hot water') || msg.includes('broken') || msg.includes('noise')) {
      return {
        speaker: aiRole,
        text: "I am deeply sorry for that inconvenience after your long journey! That is certainly not our usual standard. I am immediately upgrading you to an Executive Suite on the 8th floor, and our bellhop will help transfer your bags right away.",
        translationVi: "Tôi vô cùng xin lỗi về sự bất tiện này sau chuyến đi dài của bạn! Đây chắc chắn không phải tiêu chuẩn thường thấy của chúng tôi. Tôi lập tức nâng cấp phòng cho bạn lên phòng Suite Executive ở tầng 8, và nhân viên hành lý sẽ hỗ trợ chuyển đồ giúp bạn ngay bây giờ.",
        audioTip: "Sincere apologetic inflection followed by swift proactive resolution",
        usefulExpression: "immediately upgrading you to an Executive Suite",
        grammarFeedback,
        timestamp,
        isUser: false,
      };
    }
    if (msg.includes('breakfast') || msg.includes('time') || msg.includes('gym') || msg.includes('pool')) {
      return {
        speaker: aiRole,
        text: "Complimentary buffet breakfast is served on the 2nd floor from 6:30 AM to 10:00 AM. The fitness center and infinity pool on the rooftop are open 24 hours with your room keycard.",
        translationVi: "Bữa sáng tự chọn miễn phí được phục vụ tại tầng 2 từ 6:30 sáng đến 10:00 sáng. Trung tâm thể dục và hồ bơi vô cực trên tầng thượng mở cửa 24/24 bằng thẻ từ của bạn.",
        audioTip: "Warm concierge delivery",
        usefulExpression: "complimentary buffet breakfast is served",
        grammarFeedback,
        timestamp,
        isUser: false,
      };
    }
    if (msg.includes('checkout') || msg.includes('check out') || msg.includes('late') || msg.includes('leave')) {
      return {
        speaker: aiRole,
        text: "Standard checkout is at 11:00 AM, but I can gladly extend complimentary late checkout until 1:00 PM for you today. If your flight is in the evening, we'd also be happy to store your luggage securely.",
        translationVi: "Giờ trả phòng tiêu chuẩn là 11:00 trưa, nhưng tôi rất sẵn lòng gia hạn trả phòng muộn miễn phí đến 1:00 chiều cho bạn hôm nay. Nếu chuyến bay của bạn vào buổi tối, chúng tôi cũng sẵn lòng giữ hành lý an toàn cho bạn.",
        audioTip: "Reassuring hospitality tone",
        usefulExpression: "extend complimentary late checkout",
        grammarFeedback,
        timestamp,
        isUser: false,
      };
    }
  }

  // 5. Medical Clinic & Doctor
  if (scenLower.includes('doctor') || scenLower.includes('clinic') || scenLower.includes('hospital') || scenLower.includes('patient') || scenLower.includes('sick')) {
    if (msg.includes('fever') || msg.includes('headache') || msg.includes('cough') || msg.includes('throat') || msg.includes('stomach')) {
      return {
        speaker: aiRole,
        text: "I understand. A mild fever along with a persistent cough often points to an acute viral upper respiratory infection. Have you experienced any shortness of breath or chills, and are you allergic to any medications?",
        translationVi: "Tôi hiểu rồi. Sốt nhẹ kèm theo ho dai dẳng thường là dấu hiệu của nhiễm trùng đường hô hấp trên do virus cấp tính. Bạn có bị khó thở hoặc ớn lạnh không, và bạn có dị ứng với loại thuốc nào không?",
        audioTip: "Attentive, caring clinical tone",
        usefulExpression: "allergic to any medications",
        grammarFeedback,
        timestamp,
        isUser: false,
      };
    }
    if (msg.includes('prescription') || msg.includes('medicine') || msg.includes('pill') || msg.includes('dosage') || msg.includes('pharmacy')) {
      return {
        speaker: aiRole,
        text: "I'll write you a prescription for an anti-inflammatory and a cough suppressant. Take one tablet after breakfast and one after dinner for five days. Be sure to drink plenty of warm fluids and get adequate bed rest.",
        translationVi: "Tôi sẽ kê đơn thuốc kháng viêm và thuốc giảm ho cho bạn. Uống một viên sau bữa sáng và một viên sau bữa tối trong 5 ngày. Nhớ uống nhiều nước ấm và nghỉ ngơi đầy đủ nhé.",
        audioTip: "Clear, reassuring instructional cadence",
        usefulExpression: "take one tablet after breakfast and one after dinner",
        grammarFeedback,
        timestamp,
        isUser: false,
      };
    }
  }

  // 6. English Tutor / Grammar Assistant
  if (scenLower.includes('tutor') || scenLower.includes('grammar') || scenLower.includes('coach') || scenLower.includes('learn')) {
    return {
      speaker: aiRole,
      text: `That is a great phrase to practice! A native speaker might also say: "I'd love to follow up on this." How would you like to put that into another sentence for our next challenge?`,
      translationVi: `Đó là một cụm từ rất hay để luyện tập! Người bản xứ cũng có thể nói: "I'd love to follow up on this." Bạn có muốn thử ghép cụm từ này vào một câu khác cho thử thách tiếp theo không?`,
      audioTip: "Encouraging educational tone with clear pronunciation models",
      usefulExpression: "put that into another sentence",
      grammarFeedback,
      timestamp,
      isUser: false,
    };
  }

  // Universal Greetings
  if (msg.includes('hello') || msg.includes('hi ') || msg === 'hi' || msg.includes('good morning') || msg.includes('good afternoon')) {
    return {
      speaker: aiRole,
      text: `Hello! Thank you for reaching out. As the ${aiRole}, I'm glad to assist you with our ${scenario}. How can I help you get started?`,
      translationVi: `Xin chào! Cảm ơn bạn đã liên hệ. Với tư cách là ${aiRole}, tôi rất vui được hỗ trợ bạn về ${scenario}. Tôi có thể giúp gì cho bạn ngay bây giờ?`,
      audioTip: "Friendly, open pitch on greeting",
      usefulExpression: "glad to assist you with ...",
      grammarFeedback,
      timestamp,
      isUser: false,
    };
  }

  // Appreciation / Thanks
  if (msg.includes('thank') || msg.includes('appreciate') || msg.includes('great') || msg.includes('awesome')) {
    return {
      speaker: aiRole,
      text: "You're very welcome! It's an absolute pleasure working through this with you. Is there anything else you'd like to clarify or double-check?",
      translationVi: "Không có chi đâu bạn! Tôi rất vui khi được cùng bạn xử lý việc này. Bạn có còn điều gì muốn làm rõ hay kiểm tra lại không?",
      audioTip: "Rising inflection on 'double-check?'",
      usefulExpression: "It's an absolute pleasure",
      grammarFeedback,
      timestamp,
      isUser: false,
    };
  }

  // Question Responses
  if (msg.includes('?') || msg.startsWith('how') || msg.startsWith('what') || msg.startsWith('why') || msg.startsWith('can') || msg.startsWith('could') || msg.startsWith('is it')) {
    return {
      speaker: aiRole,
      text: `That's a very fair point to bring up. From my perspective as the ${aiRole}, we can definitely find a smooth solution that accommodates your needs. Let me outline our next steps.`,
      translationVi: `Đó là một câu hỏi rất thỏa đáng. Từ góc nhìn của tôi với vai trò là ${aiRole}, chúng ta hoàn toàn có thể tìm ra một giải pháp thuận lợi đáp ứng nhu cầu của bạn. Để tôi phác thảo các bước tiếp theo nhé.`,
      audioTip: "Professional confidence; pause after 'point to bring up'",
      usefulExpression: "smooth solution that accommodates your needs",
      grammarFeedback,
      timestamp,
      isUser: false,
    };
  }

  // General conversational adaptive reply
  return {
    speaker: aiRole,
    text: `I completely understand what you're saying. Given our current situation with ${scenario}, let's make sure we address this efficiently so you feel confident moving forward.`,
    translationVi: `Tôi hoàn toàn hiểu điều bạn đang nói. Xét theo tình huống hiện tại về ${scenario}, chúng ta hãy đảm bảo xử lý việc này một cách hiệu quả để bạn cảm thấy an tâm tiếp tục nhé.`,
    audioTip: "Steady, reassuring vocal cadence",
    usefulExpression: "address this efficiently so you feel confident",
    grammarFeedback,
    timestamp,
    isUser: false,
  };
}

/**
 * Returns scenario-specific starter suggestions to help the user reply easily.
 */
export function getChatQuickReplies(scenario: string, aiRole: string): string[] {
  const scen = (scenario || '').toLowerCase();

  if (scen.includes('cafe') || scen.includes('coffee') || scen.includes('barista')) {
    return [
      "Can I get a large iced oat latte, half-sweet please?",
      "Do you have any fresh almond croissants today?",
      "Could you tell me the guest Wi-Fi password?",
      "Can I pay with Apple Pay or card?",
    ];
  }

  if (scen.includes('airport') || scen.includes('flight') || scen.includes('baggage')) {
    return [
      "Can I repack some items into my carry-on bag?",
      "How much is the overweight fee per kilogram?",
      "Will I still make it to Gate 14B on time?",
      "Could I request a window seat with extra legroom?",
    ];
  }

  if (scen.includes('interview') || scen.includes('job') || scen.includes('engineer')) {
    return [
      "We implemented Redis caching to handle 50,000 requests per second.",
      "Could you tell me more about the engineering team's current roadmap?",
      "I prioritized fault tolerance and automated failover in our cluster.",
      "What is the team's approach to technical debt and code reviews?",
    ];
  }

  if (scen.includes('hotel') || scen.includes('room') || scen.includes('complaint')) {
    return [
      "The air conditioner isn't working and there's no hot water.",
      "Could you please move me to another quiet room tonight?",
      "What time is complimentary breakfast served in the morning?",
      "Is it possible to request a late checkout until 1:00 PM?",
    ];
  }

  if (scen.includes('restaurant') || scen.includes('dinner') || scen.includes('dining')) {
    return [
      "What seasonal dish does the chef recommend tonight?",
      "Could we get a bottle of sparkling water for the table?",
      "Could you please tell us if this dish contains dairy or nuts?",
      "May we have the check, and can we split it between two cards?",
    ];
  }

  if (scen.includes('doctor') || scen.includes('clinic') || scen.includes('health')) {
    return [
      "I've had a persistent fever and cough for the past three days.",
      "Should I take this medication before or after meals?",
      "Are there any side effects I should watch out for?",
      "Thank you doctor, I will follow your instructions and rest.",
    ];
  }

  if (scen.includes('shopping') || scen.includes('store') || scen.includes('clothes')) {
    return [
      "Do you have this jacket in medium size or in navy blue?",
      "Where are the fitting rooms located?",
      "Is this item currently on sale or eligible for discount?",
      "What is your return policy if it doesn't fit properly?",
    ];
  }

  return [
    "Could you please elaborate on that point?",
    "I understand, that works perfectly for me.",
    "What would you recommend we do next?",
    "Thank you for clarifying the details!",
  ];
}
