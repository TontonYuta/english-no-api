import { RoleplayDialogueTurn, DialogueDifficulty } from '../types';

export interface ChatReplyParams {
  scenario: string;
  userRole: string;
  aiRole: string;
  history?: RoleplayDialogueTurn[];
  lastUserMessage: string;
  difficulty?: DialogueDifficulty;
}

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

  // If a pre-scripted dialogue already has an opening partner turn, reuse its rich context
  if (dialogue && dialogue.length > 0) {
    const firstTurn = dialogue[0];
    const isFirstUser = firstTurn.isUser ?? (
      firstTurn.speaker.toLowerCase().includes(userRole.toLowerCase()) ||
      firstTurn.speaker.toLowerCase().includes('you')
    );
    if (!isFirstUser) {
      return {
        ...firstTurn,
        timestamp: firstTurn.timestamp || timestamp,
        isUser: false,
      };
    }
  }

  const scenLower = scenario.toLowerCase();

  // Airport check-in
  if (scenLower.includes('airport') || scenLower.includes('flight') || scenLower.includes('baggage')) {
    return {
      speaker: aiRole || 'Gate Agent',
      text: "Good morning! Welcome to SkyWings Airlines check-in. May I please have your passport and booking reference code?",
      translationVi: "Chào buổi sáng! Chào mừng quý khách đến quầy làm thủ tục hãng hàng không SkyWings. Tôi có thể xem hộ chiếu và mã đặt chỗ của bạn được không?",
      audioTip: "Polite welcoming intonation on greeting, rising on polite request",
      usefulExpression: "May I please have your passport and booking reference code?",
      timestamp,
      isUser: false,
    };
  }

  // Job Interview
  if (scenLower.includes('interview') || scenLower.includes('job') || scenLower.includes('engineer')) {
    return {
      speaker: aiRole || 'Lead Interviewer',
      text: "Hello, welcome to our engineering interview session! We're glad to have you here today. Could you briefly introduce your background and recent architectural projects?",
      translationVi: "Xin chào, chào mừng bạn đến với buổi phỏng vấn kỹ thuật của chúng tôi! Rất vui được gặp bạn hôm nay. Bạn có thể giới thiệu ngắn gọn về kinh nghiệm và các dự án kiến trúc gần đây của mình không?",
      audioTip: "Professional yet welcoming cadence; natural pause before the question",
      usefulExpression: "Could you briefly introduce your background and recent projects?",
      timestamp,
      isUser: false,
    };
  }

  // Hotel
  if (scenLower.includes('hotel') || scenLower.includes('room') || scenLower.includes('concierge')) {
    return {
      speaker: aiRole || 'Front Desk Staff',
      text: "Good evening! Welcome to the Grand Horizon Hotel. How may I assist you with your stay this evening?",
      translationVi: "Chào buổi tối! Chào mừng quý khách đến khách sạn Grand Horizon. Tôi có thể hỗ trợ gì cho kỳ nghỉ của quý khách tối nay ạ?",
      audioTip: "Warm and courteous hospitality tone",
      usefulExpression: "How may I assist you with your stay this evening?",
      timestamp,
      isUser: false,
    };
  }

  // Restaurant / Cafe
  if (scenLower.includes('restaurant') || scenLower.includes('order') || scenLower.includes('cafe')) {
    return {
      speaker: aiRole || 'Server',
      text: "Hello and welcome! A table for one, or are you joining a group? Here is today's menu, can I get you something refreshing to drink first?",
      translationVi: "Xin chào và chào mừng quý khách! Bàn cho một người, hay quý khách đi cùng đoàn ạ? Đây là thực đơn hôm nay, tôi có thể lấy cho bạn đồ uống mát mẻ nào trước không?",
      audioTip: "Upbeat friendly restaurant greeting",
      usefulExpression: "Can I get you something refreshing to drink first?",
      timestamp,
      isUser: false,
    };
  }

  // General fallback
  return {
    speaker: aiRole || 'Partner',
    text: `Hello! I'm your ${aiRole} for today's session on "${scenario}". I'm ready whenever you are—how would you like to begin?`,
    translationVi: `Xin chào! Tôi là ${aiRole} của bạn trong buổi luyện tập "${scenario}". Tôi đã sẵn sàng—bạn muốn bắt đầu như thế nào?`,
    audioTip: "Supportive and friendly conversational opening",
    usefulExpression: "I'm ready whenever you are",
    timestamp,
    isUser: false,
  };
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

  // 1. Scenario-specific contextual matching
  const scenLower = scenario.toLowerCase();

  // Airport check-in scenario
  if (scenLower.includes('airport') || scenLower.includes('flight') || scenLower.includes('baggage') || scenLower.includes('check-in')) {
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
        text: "Thank you very much. I have pulled up your reservation for the 10:45 flight to Tokyo. Are you checking any luggage today, or do you only have carry-on bags?",
        translationVi: "Cảm ơn bạn rất nhiều. Tôi đã tìm thấy mã vé của bạn cho chuyến bay lúc 10:45 đến Tokyo. Bạn có gửi hành lý nào hôm nay không, hay bạn chỉ mang hành lý xách tay thôi?",
        audioTip: "Professional airport check-in cadence",
        usefulExpression: "I have pulled up your reservation",
        grammarFeedback,
        timestamp,
        isUser: false,
      };
    }
  }

  // Tech interview scenario
  if (scenLower.includes('interview') || scenLower.includes('engineer') || scenLower.includes('technical') || scenLower.includes('job')) {
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
    if (msg.includes('introduce') || msg.includes('experience') || msg.includes('background') || msg.includes('year') || msg.includes('work')) {
      return {
        speaker: aiRole,
        text: "That is impressive experience. Leading system design while maintaining production reliability requires balanced technical trade-offs. What was the single most challenging production outage you resolved?",
        translationVi: "Đó là những kinh nghiệm rất ấn tượng. Vừa dẫn dắt thiết kế hệ thống vừa đảm bảo độ ổn định sản phẩm đòi hỏi sự đánh đổi kỹ thuật hợp lý. Sự cố dừng hệ thống thách thức nhất mà bạn từng khắc phục là gì?",
        audioTip: "Attentive interviewer tone; pause before key question",
        usefulExpression: "balanced technical trade-offs",
        grammarFeedback,
        timestamp,
        isUser: false,
      };
    }
  }

  // Hotel complaint / concierge scenario
  if (scenLower.includes('hotel') || scenLower.includes('room') || scenLower.includes('complaint') || scenLower.includes('air-condition') || scenLower.includes('water')) {
    if (msg.includes('air') || msg.includes('cold') || msg.includes('hot') || msg.includes('water') || msg.includes('noise') || msg.includes('broken')) {
      return {
        speaker: aiRole,
        text: "I am deeply sorry for this unacceptable inconvenience, especially after such a late arrival. I am immediately upgrading you to an Executive Suite on the 8th floor, and breakfast will be complimentary during your entire stay.",
        translationVi: "Tôi vô cùng xin lỗi vì sự bất tiện không đáng có này, đặc biệt là khi bạn đến muộn như vậy. Tôi sẽ ngay lập tức nâng hạng phòng cho bạn lên phòng Executive Suite ở tầng 8, và bữa sáng sẽ hoàn toàn miễn phí trong suốt kỳ nghỉ của bạn.",
        audioTip: "Sincere empathetic tone; apologize promptly without making excuses",
        usefulExpression: "immediately upgrading you to an Executive Suite",
        grammarFeedback,
        timestamp,
        isUser: false,
      };
    }
    if (msg.includes('thank') || msg.includes('appreciate') || msg.includes('key') || msg.includes('suite')) {
      return {
        speaker: aiRole,
        text: "You are most welcome! Here are the new keys to Room 802. Our bellhop will assist with transferring your luggage right away. Please don't hesitate to dial 0 if you need anything at all.",
        translationVi: "Rất hân hạnh được phục vụ quý khách! Đây là chìa khóa mới cho phòng 802. Nhân viên hành lý sẽ hỗ trợ chuyển đồ của bạn ngay. Xin đừng ngần ngại bấm phím 0 nếu bạn cần bất kỳ điều gì nhé.",
        audioTip: "Warm, accommodating customer care cadence",
        usefulExpression: "Please don't hesitate to dial 0",
        grammarFeedback,
        timestamp,
        isUser: false,
      };
    }
  }

  // 2. Intent-based conversational replies
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

  if (msg.includes('?') || msg.startsWith('how') || msg.startsWith('what') || msg.startsWith('why') || msg.startsWith('can') || msg.startsWith('could') || msg.startsWith('is it')) {
    return {
      speaker: aiRole,
      text: `That's a very fair point to bring up. From my perspective as the ${aiRole}, we can definitely find a mutually agreeable solution that accommodates your schedule. Let me outline our next steps.`,
      translationVi: `Đó là một câu hỏi rất thỏa đáng. Từ góc nhìn của tôi với vai trò là ${aiRole}, chúng ta hoàn toàn có thể tìm ra một giải pháp hai bên cùng đồng thuận phù hợp với lịch trình của bạn. Để tôi phác thảo các bước tiếp theo nhé.`,
      audioTip: "Professional confidence; pause after 'point to bring up'",
      usefulExpression: "mutually agreeable solution that accommodates your schedule",
      grammarFeedback,
      timestamp,
      isUser: false,
    };
  }

  // General conversational response maintaining role
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
  const scen = scenario.toLowerCase();

  if (scen.includes('airport') || scen.includes('flight') || scen.includes('baggage')) {
    return [
      "Can I repack some items into my carry-on bag?",
      "How much is the overweight fee per kilogram?",
      "Will I still make it to Gate 14B on time?",
      "Here is my passport and reservation confirmation.",
    ];
  }

  if (scen.includes('interview') || scen.includes('job') || scen.includes('engineer')) {
    return [
      "We implemented Redis caching to handle 50,000 requests per second.",
      "Could you tell me more about the engineering team's current roadmap?",
      "I prioritized fault tolerance and automated failover in our cluster.",
      "That is a great question regarding database sharding and consistency.",
    ];
  }

  if (scen.includes('hotel') || scen.includes('room') || scen.includes('complaint')) {
    return [
      "The air conditioner isn't working and there's no hot water.",
      "Could you please move me to another quiet room tonight?",
      "I appreciate your quick assistance with this issue.",
      "What time is complimentary breakfast served in the morning?",
    ];
  }

  return [
    "Could you please elaborate on that point?",
    "I understand, that works perfectly for me.",
    "What would you recommend we do next?",
    "Thank you for clarifying the details!",
  ];
}
