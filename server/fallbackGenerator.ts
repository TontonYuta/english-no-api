import {
  TaskType,
  TaskResult,
  WritingResult,
  VocabResult,
  RoleplayResult,
  QuizResult,
  QuizQuestion,
  ToeicLessonResult,
  GrammarLessonResult,
  ReadingLessonResult,
  ListeningLessonResult,
  ReflexChallengeResult
} from '../src/types';

export function generateRealisticFallback(taskType: TaskType, inputData: Record<string, unknown>): TaskResult {
  switch (taskType) {
    case 'writing': {
      const essay = (inputData.essay as string) || '';
      const topic = (inputData.topic as string) || 'General English Writing';
      const wordCount = essay.trim().split(/\s+/).filter(Boolean).length;
      
      const isHighBand = wordCount > 120 && /furthermore|consequently|nevertheless|ubiquitous|imperative/i.test(essay);

      const writingData: WritingResult = {
        cefrBand: isHighBand ? 'C1 (Effective Operational Proficiency)' : 'B2 (Vantage)',
        summary: `Your essay demonstrates a clear communicative purpose with generally cohesive paragraphing. To reach an elite C1/C2 band, focus on reducing repetitive sentence frames and replacing mechanical transition phrases with nuanced academic collocations.`,
        scoreBreakdown: {
          taskAchievement: isHighBand ? 7.5 : 6.5,
          coherenceCohesion: isHighBand ? 7.0 : 6.0,
          lexicalResource: isHighBand ? 7.5 : 6.5,
          grammaticalRange: isHighBand ? 7.0 : 6.0,
          overallBand: isHighBand ? 7.5 : 6.5,
        },
        corrections: [
          {
            original: 'In my opinion, people should to pay more attention on this matter.',
            suggested: 'In my view, individuals ought to pay closer attention to this pressing issue.',
            type: 'grammar',
            explanation: 'Modal verb "should" is followed by bare infinitive without "to". Furthermore, "attention" collocates with the preposition "to", not "on".',
          },
          {
            original: 'Technology make our life more easier and comfortable.',
            suggested: 'Technological advancements render our daily lives substantially more manageable and convenient.',
            type: 'collocation',
            explanation: 'Double comparative error ("more easier" -> "easier"). Upgrading "make our life" to "render our daily lives" enhances formal academic register.',
          },
          {
            original: 'Nowadays there are many problems happening in big cities.',
            suggested: 'Contemporary urban centers are increasingly confronted with an array of multifaceted challenges.',
            type: 'style',
            explanation: '"Nowadays" is overused in student writing. Substituting "contemporary" and framing the sentence around the topic noun elevates academic credibility.',
          },
          {
            original: 'Government must do something to resolve it as soon as possible.',
            suggested: 'Policymakers must enact decisive regulatory interventions without delay.',
            type: 'collocation',
            explanation: 'Vague phrases like "do something" weaken argumentative essays. Use domain-specific verbal collocations like "enact interventions".',
          },
        ],
        vocabularyUpgrades: [
          {
            originalWord: 'big problem',
            upgradedWord: 'pressing dilemma / systemic predicament',
            context: 'Use when describing intricate socio-economic dilemmas.',
            level: 'C1',
          },
          {
            originalWord: 'help a lot',
            upgradedWord: 'facilitate substantial improvement',
            context: 'Formal replacement for casual impact expressions.',
            level: 'C1',
          },
          {
            originalWord: 'good effect',
            upgradedWord: 'favorable repercussion / salubrious impact',
            context: 'Academic cause-and-effect argumentation.',
            level: 'C2',
          },
          {
            originalWord: 'important thing',
            upgradedWord: 'paramount imperative',
            context: 'Emphasizing crucial requirements in concluding remarks.',
            level: 'C2',
          },
        ],
        improvedRewrite: `In contemporary discourse, the multifaceted impact of ${topic.toLowerCase()} remains a subject of considerable debate. While conventional wisdom often posits that modern innovations merely simplify routine tasks, empirical evidence suggests a far more profound transformation. By examining both systemic efficiencies and human behavioral shifts, it becomes evident that sustainable progress hinges upon proactive governance and individual accountability. Moving forward, policymakers and civil society must collaborate to cultivate an ecosystem wherein advancements are harnessed ethically and equitably.`,
      };

      return { type: 'writing', data: writingData };
    }

    case 'vocab': {
      const rawTerm = ((inputData.term as string) || 'cut corners').trim();
      const termLower = rawTerm.toLowerCase();

      // Specialized lookup for common idioms, else dynamic intelligent structure
      if (termLower.includes('corner')) {
        const vocabData: VocabResult = {
          term: 'Cut corners',
          ipa: '/ˌkʌt ˈkɔːr.nɚz/',
          partOfSpeech: 'Idiomatic verbal phrase',
          vietnameseMeaning: 'Đi đường tắt, làm ẩu/đốt cháy giai đoạn nhằm tiết kiệm tiền bạc, công sức nhưng dẫn đến chất lượng kém hoặc rủi ro.',
          nuances: 'Carries a strong negative connotation implying negligence, compromised safety standards, or shoddy workmanship. Native speakers use it to criticize organizations or individuals who prioritize short-term profit over excellence.',
          register: 'informal',
          examples: [
            {
              en: 'The airline was heavily fined after investigators discovered they had been cutting corners on mandatory aircraft maintenance.',
              vi: 'Hãng hàng không đã bị phạt nặng sau khi các thanh tra viên phát hiện họ đã cắt bớt quy trình bảo trì máy bay bắt buộc.',
              contextNote: 'Used in corporate governance and safety investigation contexts.',
            },
            {
              en: 'When constructing a high-rise foundation, cutting corners is simply not an option—any defect could be catastrophic.',
              vi: 'Khi thi công móng nhà cao tầng, việc làm ẩu đốt cháy giai đoạn tuyệt đối không phải là một lựa chọn—bất kỳ sai sót nào cũng có thể gây thảm họa.',
              contextNote: 'Demonstrates emphatic negation in civil engineering.',
            },
            {
              en: 'I know we have a tight deadline, but let us not cut corners on user testing; our reputation is on the line.',
              vi: 'Tôi biết chúng ta đang gấp tiến độ, nhưng đừng làm qua loa khâu thử nghiệm người dùng; uy tín của chúng ta đang bị đe dọa đấy.',
              contextNote: 'Collaborative workplace decision-making tone.',
            },
          ],
          commonTraps: [
            'Do NOT use "cut corner" in the singular—the phrase is almost always pluralized as "cut corners".',
            'Do NOT confuse with taking a legitimate shortcut (e.g. "take a shortcut" can be positive/neutral, whereas "cut corners" is almost inherently flawed).',
            'Avoid passive voice ("corners were cut by him"); active voice ("management cut corners") is far more natural.',
          ],
          collocations: [
            'Refuse to cut corners',
            'Tempted to cut corners',
            'Accused of cutting corners',
            'Cut corners on safety / quality',
          ],
        };
        return { type: 'vocab', data: vocabData };
      }

      const vocabData: VocabResult = {
        term: rawTerm,
        ipa: `/${rawTerm.toLowerCase().replace(/[^a-z]/g, '')}/`,
        partOfSpeech: 'Lexical expression / Idiomatic phrase',
        vietnameseMeaning: `Ý nghĩa chiều sâu của "${rawTerm}": Diễn đạt trạng thái, hành động có tính chất đặc trưng trong giao tiếp bản xứ.`,
        nuances: `Native speakers deploy "${rawTerm}" to convey specific emotional resonance. It balances pragmatic clarity with natural contextual color.`,
        register: 'idiomatic',
        examples: [
          {
            en: `To excel in high-stakes negotiations, one must master the art of "${rawTerm}" without appearing confrontational.`,
            vi: `Để thành công trong các cuộc đàm phán quan trọng, người ta phải nắm vững nghệ thuật sử dụng "${rawTerm}" mà không tỏ ra đối đầu.`,
            contextNote: 'Professional and strategic context.',
          },
          {
            en: `Her spontaneous decision to embrace "${rawTerm}" paid off handsomely during the final presentation.`,
            vi: `Quyết định bộc phát áp dụng "${rawTerm}" của cô ấy đã mang lại kết quả mỹ mãn trong buổi thuyết trình cuối cùng.`,
            contextNote: 'Academic and workplace triumph tone.',
          },
          {
            en: `Unless you grasp the cultural nuances behind "${rawTerm}", you risk being misunderstood by native listeners.`,
            vi: `Trừ khi bạn nắm được sắc thái văn hóa đằng sau "${rawTerm}", bạn có nguy cơ bị người nghe bản xứ hiểu lầm.`,
            contextNote: 'Cross-cultural communicative insight.',
          },
        ],
        commonTraps: [
          `Do not translate literally word-for-word into Vietnamese, as the figurative meaning will be distorted.`,
          `Be mindful of the prepositional dependencies associated with "${rawTerm}".`,
          `Avoid inserting it into overly formal academic journal abstracts unless qualified.`,
        ],
        collocations: [
          `Embrace the concept of ${rawTerm}`,
          `Demonstrate a knack for ${rawTerm}`,
          `Mastering ${rawTerm} in context`,
          `A quintessential example of ${rawTerm}`,
        ],
      };
      return { type: 'vocab', data: vocabData };
    }

    case 'roleplay': {
      const scenario = (inputData.scenario as string) || 'Airport Check-in with Excess Baggage';
      const userRole = (inputData.userRole as string) || 'Passenger';
      const aiRole = (inputData.aiRole as string) || 'Check-in Agent';
      const difficulty = (inputData.difficulty as any) || 'B2';
      const scenLower = scenario.toLowerCase();

      let roleplayData: RoleplayResult;

      // 1. Cafe & Coffee Shop
      if (scenLower.includes('cafe') || scenLower.includes('coffee') || scenLower.includes('barista') || scenLower.includes('bakery')) {
        roleplayData = {
          scenario,
          userRole,
          aiRole,
          dialogue: [
            {
              speaker: aiRole,
              text: `Good morning! Welcome to Artisan Brew. What can I craft for you today? Hot or iced?`,
              translationVi: `Chào buổi sáng! Chào mừng bạn đến với Artisan Brew. Hôm nay tôi có thể pha chế món gì cho bạn? Dùng nóng hay đá ạ?`,
              audioTip: `Upbeat, welcoming greeting with rising intonation on "Hot or iced?".`,
              usefulExpression: `What can I craft for you today?`,
            },
            {
              speaker: userRole,
              text: `Hi! I'd love a large iced latte with oat milk, please. Could you also make it half-sweet?`,
              translationVi: `Chào bạn! Cho tôi một ly latte đá size lớn với sữa yến mạch nhé. Bạn làm giúp tôi giảm nửa đường được không?`,
              audioTip: `Clear enunciation of customization: "half-sweet with oat milk".`,
              usefulExpression: `I'd love a [item] with [milk/flavor], please.`,
            },
            {
              speaker: aiRole,
              text: `You got it—large iced oat latte, half-sweet with agave. Would you like to pair that with a warm almond croissant?`,
              translationVi: `Đã rõ—latte đá yến mạch size lớn, giảm nửa ngọt với siro thùa. Bạn có muốn dùng kèm bánh sừng bò hạnh nhân nóng giòn không?`,
              audioTip: `Casual, inviting upsell cadence.`,
              usefulExpression: `Would you like to pair that with...?`,
            },
            {
              speaker: userRole,
              text: `That sounds tempting! I'll take one. Also, could I have the Wi-Fi password for working on my laptop?`,
              translationVi: `Nghe hấp dẫn quá! Cho tôi một chiếc nhé. À, bạn cho tôi xin mật khẩu Wi-Fi để làm việc trên máy tính được không?`,
              audioTip: `Polite request with friendly cadence.`,
              usefulExpression: `Could I have the Wi-Fi password for...?`,
            },
            {
              speaker: aiRole,
              text: `Certainly! The network is 'ArtisanBrew_Guest' and the password is 'FreshCoffee2026'. That's $7.50 total. Tap your card right here!`,
              translationVi: `Dạ được chứ! Mạng là 'ArtisanBrew_Guest' và mật khẩu là 'FreshCoffee2026'. Tổng cộng là 7.50$. Bạn chạm thẻ ngay đây nhé!`,
              audioTip: `Clear, swift payment instruction.`,
              usefulExpression: `Tap your card right here.`,
            },
          ],
          keyVocabulary: [
            { term: 'Half-sweet', meaning: 'Giảm nửa lượng đường/ngọt', usage: 'I prefer my matcha latte half-sweet.' },
            { term: 'Pair with', meaning: 'Dùng kèm, kết hợp món', usage: 'Would you like to pair your cappuccino with a muffin?' },
            { term: 'Oat milk substitute', meaning: 'Sữa yến mạch thay thế', usage: 'Most modern coffee shops offer oat milk at a small surcharge.' },
          ],
          culturalTips: [
            'In modern Western specialty cafes, customizing milk type (oat, almond, soy) and sweetness level is standard practice and welcomed by baristas.',
            'Always specify "for here" or "to go" early so the barista selects the appropriate glassware or compostable cup.',
          ],
          followUpChallenge: `Practice asking the barista: "Excuse me, where are the power outlets located?"`,
        };
      }
      // 2. Tech Job Interview
      else if (scenLower.includes('interview') || scenLower.includes('engineer') || scenLower.includes('technical') || scenLower.includes('job')) {
        roleplayData = {
          scenario,
          userRole,
          aiRole,
          dialogue: [
            {
              speaker: aiRole,
              text: `Hello and welcome to our engineering interview! Could you start by briefly walking us through a challenging architectural system you designed?`,
              translationVi: `Xin chào và chào mừng bạn đến với buổi phỏng vấn kỹ thuật! Bạn có thể bắt đầu bằng việc tóm tắt một hệ thống kiến trúc đầy thách thức mà bạn từng thiết kế không?`,
              audioTip: `Professional, measured executive interview tone.`,
              usefulExpression: `walking us through a challenging system`,
            },
            {
              speaker: userRole,
              text: `Certainly. In my last role, we decomposed a monolithic payment platform into asynchronous event-driven microservices using Redis and Kafka.`,
              translationVi: `Chắc chắn rồi. Ở vị trí trước đây, chúng tôi đã tách nền tảng thanh toán đơn khối thành các microservice hướng sự kiện bất đồng bộ sử dụng Redis và Kafka.`,
              audioTip: `Confident, steady technical pitch.`,
              usefulExpression: `decomposed a monolith into event-driven microservices`,
            },
            {
              speaker: aiRole,
              text: `Impressive. When dealing with asynchronous events, how did you guarantee transaction atomicity and prevent data inconsistency during network partitions?`,
              translationVi: `Rất ấn tượng. Khi xử lý các sự kiện bất đồng bộ, bạn đã đảm bảo tính nguyên tử của giao dịch và chống bất nhất dữ liệu khi mạng bị phân tách như thế nào?`,
              audioTip: `Inquisitive follow-up with technical depth.`,
              usefulExpression: `guarantee transaction atomicity during network partitions`,
            },
            {
              speaker: userRole,
              text: `We adopted the Outbox pattern combined with idempotent consumer handlers to ensure exactly-once processing semantics without distributed deadlocks.`,
              translationVi: `Chúng tôi đã áp dụng mô hình Transactional Outbox kết hợp với các bộ xử lý tiêu thụ có tính lũy thừa để đảm bảo ngữ nghĩa xử lý chính xác một lần mà không gây bế tắc phân tán.`,
              audioTip: `Clear architectural explanation with technical terminology.`,
              usefulExpression: `idempotent consumer handlers to ensure exactly-once processing`,
            },
            {
              speaker: aiRole,
              text: `That is a very sound engineering trade-off. Do you have any questions for me about our infrastructure stack or team culture?`,
              translationVi: `Đó là một sự đánh đổi kỹ thuật rất chuẩn xác. Bạn có câu hỏi nào cho tôi về hạ tầng công nghệ hoặc văn hóa đội ngũ của chúng tôi không?`,
              audioTip: `Open and welcoming closing question.`,
              usefulExpression: `sound engineering trade-off`,
            },
          ],
          keyVocabulary: [
            { term: 'Monolithic vs Microservices', meaning: 'Kiến trúc nguyên khối đối chiếu kiến trúc dịch vụ nhỏ', usage: 'Decomposing the monolith reduced deployment friction.' },
            { term: 'Idempotent handler', meaning: 'Bộ xử lý có tính lũy thừa (chạy nhiều lần kết quả vẫn nhất quán)', usage: 'Idempotent webhooks prevent double-charging users.' },
            { term: 'Sound trade-off', meaning: 'Sự đánh đổi hợp lý, chuẩn xác', usage: 'Accepting eventual consistency was a sound engineering trade-off.' },
          ],
          culturalTips: [
            'In Western tech interviews, using the STAR method (Situation, Task, Action, Result) helps present complex technical solutions cleanly.',
            'Always prepare 2-3 thoughtful questions for the interviewer at the end to demonstrate genuine interest in the company roadmap.',
          ],
          followUpChallenge: `Practice asking the director: "What is the single biggest engineering bottleneck your team is tackling this quarter?"`,
        };
      }
      // 3. Hotel Front Desk
      else if (scenLower.includes('hotel') || scenLower.includes('room') || scenLower.includes('guest') || scenLower.includes('resort')) {
        roleplayData = {
          scenario,
          userRole,
          aiRole,
          dialogue: [
            {
              speaker: aiRole,
              text: `Good evening! Welcome to the Grand Horizon. How was your journey, and how may I assist you with check-in tonight?`,
              translationVi: `Chào buổi tối! Chào mừng quý khách đến Grand Horizon. Chuyến đi của quý khách thế nào, và tôi có thể hỗ trợ quý khách làm thủ tục nhận phòng tối nay ra sao ạ?`,
              audioTip: `Polite, warm hospitality cadence.`,
              usefulExpression: `How may I assist you with check-in tonight?`,
            },
            {
              speaker: userRole,
              text: `Good evening. I have a reservation under Clark. However, I just went up to room 402 and the air conditioning is not turning on.`,
              translationVi: `Chào anh/chị. Tôi có phòng đặt dưới tên Clark. Tuy nhiên tôi vừa lên phòng 402 và điều hòa không thể bật lên được.`,
              audioTip: `Firm but courteous complaint tone.`,
              usefulExpression: `the air conditioning is not turning on`,
            },
            {
              speaker: aiRole,
              text: `I am so terribly sorry for that frustration after your long trip! Let me immediately relocate you to a Deluxe Suite on the 7th floor with a peaceful garden view.`,
              translationVi: `Tôi vô cùng xin lỗi vì sự phiền toái này sau chuyến đi dài của quý khách! Để tôi chuyển phòng ngay cho quý khách sang phòng Deluxe Suite ở tầng 7 với hướng nhìn ra vườn yên tĩnh.`,
              audioTip: `Sincere apology and proactive immediate solution.`,
              usefulExpression: `relocate you to a Deluxe Suite`,
            },
            {
              speaker: userRole,
              text: `Thank you, that is very generous of you. Could I also request late checkout tomorrow around 1:00 PM?`,
              translationVi: `Cảm ơn bạn, bạn thật chu đáo. Tôi có thể xin trả phòng muộn vào khoảng 1:00 chiều mai được không?`,
              audioTip: `Appreciative, polite request tone.`,
              usefulExpression: `request late checkout tomorrow around 1:00 PM`,
            },
            {
              speaker: aiRole,
              text: `Done! I have activated your new keycards and updated your checkout to 1:00 PM with our compliments. Our porter will carry your luggage up right now.`,
              translationVi: `Đã xong ạ! Tôi đã kích hoạt thẻ khóa mới và cập nhật giờ trả phòng thành 1:00 chiều tặng kèm quý khách. Nhân viên phụ trách sẽ mang hành lý lên giúp quý khách ngay bây giờ.`,
              audioTip: `Warm customer assurance tone.`,
              usefulExpression: `with our compliments (miễn phí đãi ngộ)`,
            },
          ],
          keyVocabulary: [
            { term: 'Relocate to a suite', meaning: 'Chuyển đổi phòng sang phòng hạng sang', usage: 'The hotel relocated the guest to a high-floor suite.' },
            { term: 'Late checkout with compliments', meaning: 'Trả phòng muộn miễn phí đãi ngộ', usage: 'We granted a 2-hour late checkout with our compliments.' },
            { term: 'Porter / Bellhop', meaning: 'Nhân viên chuyển hành lý tại khách sạn', usage: 'The porter took our luggage up to the room.' },
          ],
          culturalTips: [
            'Polite, composed complaints at hotels usually yield much better upgrades and goodwill than aggressive confrontations.',
          ],
          followUpChallenge: `Say: "Could you please give me two extra room keycards and show me where breakfast is served?"`,
        };
      }
      // 4. Default / Airport Check-in
      else {
        roleplayData = {
          scenario,
          userRole,
          aiRole,
          dialogue: [
            {
              speaker: aiRole,
              text: `Good morning! Welcome to SkyWings International. May I have your passport and booking reference, please?`,
              translationVi: `Chào buổi sáng quý khách! Chào mừng đến với SkyWings International. Tôi có thể xin hộ chiếu và mã đặt chỗ của quý khách được không ạ?`,
              audioTip: `Warm, hospitable cadence with polite rising intonation on "please?".`,
              usefulExpression: `May I have your... please?`,
            },
            {
              speaker: userRole,
              text: `Good morning. Here is my passport and e-ticket. I'm flying to London Heathrow on flight SW402.`,
              translationVi: `Chào anh/chị. Đây là hộ chiếu và vé điện tử của tôi. Tôi bay đi London Heathrow trên chuyến SW402.`,
              audioTip: `Clear enunciation of flight numbers: "SW four-zero-two".`,
              usefulExpression: `I'm flying to [Destination] on flight...`,
            },
            {
              speaker: aiRole,
              text: `Thank you, Mr. Clark. I see your reservation. Could you please place your checked luggage onto the scale?`,
              translationVi: `Cảm ơn quý khách. Tôi đã thấy thông tin đặt chỗ. Quý khách vui lòng đặt hành lý ký gửi lên cân giúp tôi ạ?`,
              audioTip: `Stress on "scale" to guide customer action.`,
              usefulExpression: `Could you please place your [item] onto...`,
            },
            {
              speaker: userRole,
              text: `Sure thing, here it goes... Ah, it seems I'm at 25.4 kilograms. My allowance is 23 kg. Is there any leeway, or will I be charged an overweight fee?`,
              translationVi: `Được chứ, đặt lên đây rồi... Ồ, có vẻ hành lý của tôi là 25,4 kg. Hạn mức của tôi là 23 kg. Có thể linh động được không, hay tôi sẽ bị tính phí quá cước?`,
              audioTip: `Polite, inquiring tone on "Is there any leeway...?"`,
              usefulExpression: `Is there any leeway? (Có thể linh hoạt/châm chước được không?)`,
            },
            {
              speaker: aiRole,
              text: `I understand your concern. The airline policy permits up to 1 kg margin, but 2.4 kg exceeds the threshold. However, if you can transfer some heavier items into your carry-on bag, you will avoid the $75 penalty fee entirely.`,
              translationVi: `Tôi rất hiểu sự băn khoăn của quý khách. Quy định cho phép sai số tối đa 1 kg, nhưng 2,4 kg thì vượt quá mức. Tuy nhiên nếu quý khách có thể chuyển bớt đồ nặng sang hành lý xách tay, quý khách sẽ tránh được khoản phí phạt 75 USD.`,
              audioTip: `Empathetic tone transitioning into helpful solution offering.`,
              usefulExpression: `Avoid the penalty fee entirely`,
            },
            {
              speaker: userRole,
              text: `That is brilliant advice! I have a winter coat and two hardback books right on top. Let me step aside, redistribute the weight, and come straight back to your counter.`,
              translationVi: `Lời khuyên tuyệt vời quá! Tôi có chiếc áo khoác mùa đông và hai cuốn sách bìa cứng ngay trên cùng. Để tôi đứng sang một bên, chia lại trọng lượng rồi quay lại quầy của bạn ngay nhé.`,
              audioTip: `Enthusiastic and appreciative intonation.`,
              usefulExpression: `Step aside and redistribute the weight`,
            },
            {
              speaker: aiRole,
              text: `Take your time! Once you've rearranged it, just approach the side lane and I will tag your bag and issue your boarding pass immediately. Have a safe journey!`,
              translationVi: `Cứ thong thả quý khách nhé! Khi sắp xếp xong, quý khách chỉ cần lại làn bên cạnh, tôi sẽ gắn thẻ hành lý và xuất thẻ lên máy bay ngay cho quý khách. Chúc quý khách chuyến đi thượng lộ bình an!`,
              audioTip: `Warm concluding sign-off with friendly smile in voice.`,
              usefulExpression: `Tag your bag and issue your boarding pass`,
            },
          ],
          keyVocabulary: [
            {
              term: 'Allowance / Leeway',
              meaning: 'Hạn mức cho phép / Khoảng dung sai, sự linh hoạt',
              usage: 'Is there any leeway on the weight allowance?',
            },
            {
              term: 'Redistribute the weight',
              meaning: 'Sắp xếp phân bổ lại trọng lượng hành lý',
              usage: 'Common practical tactic at check-in counters to avoid excess fees.',
            },
            {
              term: 'Tag the bag',
              meaning: 'Dán thẻ hành lý định danh (luggage tag)',
              usage: 'The agent tags your bag with flight barcodes.',
            },
          ],
          culturalTips: [
            'In Western airports, asking "Is there any leeway?" politely is acceptable, but demanding or arguing about strict airline safety weight limits is considered rude and counterproductive.',
            'Always thank counter agents for pragmatic advice; showing cooperation often leads to them waiving marginal excess fees.',
          ],
          followUpChallenge: `Practice roleplaying the moment you return with the 22.8 kg suitcase: say "Thanks for waiting, I managed to get it down to 22.8 kg!"`,
        };
      }

      return { type: 'roleplay', data: roleplayData };
    }

    case 'quiz': {
      const topic = (inputData.topic as string) || 'Conditionals & Word Form in Business';
      const difficulty = (inputData.difficulty as string) || 'Upper-Intermediate (B2)';
      const questionCount = Math.max(3, Math.min(30, Number(inputData.questionCount) || 5));
      const quizType = (inputData.quizType as string) || 'mixed';

      // Grammar question bank
      const grammarBank: QuizQuestion[] = [
        {
          id: 1,
          question: 'Had the weather conditions _______ so volatile, the harbor authorities would not have suspended the ferry services.',
          options: ['had not been', 'not were', 'not been', 'haven’t been'],
          correctAnswerIndex: 2,
          explanation: 'This is an inverted Third Conditional expressing an unreal past condition. The standard form "If the weather had not been..." becomes "Had the weather not been..." via subject-auxiliary inversion.',
          grammarRule: 'Third Conditional Inversion with Negative Adverbial',
          category: 'grammar',
        },
        {
          id: 2,
          question: 'Were the company _______ its current expansion strategy, substantial venture capital would be required immediately.',
          options: ['pursues', 'to pursue', 'pursued', 'has pursued'],
          correctAnswerIndex: 1,
          explanation: 'In Second Conditional inversion, "If the company pursued..." is formally inverted into "Were + subject + to-infinitive": "Were the company to pursue...".',
          grammarRule: 'Formal Inversion of Second Conditional with "Were + to-infinitive"',
          category: 'grammar',
        },
        {
          id: 3,
          question: 'Should any unexpected discrepancies _______ during the audit, please inform the financial controller without delay.',
          options: ['arises', 'will arise', 'arose', 'arise'],
          correctAnswerIndex: 3,
          explanation: 'Inverted First Conditional with "Should" replaces "If any unexpected discrepancies should arise". After the modal auxiliary "Should", the verb must remain in bare infinitive form ("arise").',
          grammarRule: 'First Conditional Inversion with Modal "Should"',
          category: 'grammar',
        },
        {
          id: 4,
          question: 'If she _______ for that scholarship last year, she _______ studying at Cambridge right now.',
          options: [
            'didn’t apply / wouldn’t be',
            'hadn’t applied / wouldn’t be',
            'hadn’t applied / wouldn’t have been',
            'wouldn’t apply / isn’t',
          ],
          correctAnswerIndex: 1,
          explanation: 'This is a Mixed Conditional: a past condition ("last year" -> Past Perfect "hadn\'t applied") with a present result ("right now" -> would + bare infinitive "wouldn\'t be studying").',
          grammarRule: 'Mixed Conditional (Past Condition -> Present Consequence)',
          category: 'grammar',
        },
        {
          id: 5,
          question: 'Provided that all safety protocols _______ adhered to, the plant will resume full operations on Monday.',
          options: ['were strictly', 'are strictly', 'will be strictly', 'would be strictly'],
          correctAnswerIndex: 1,
          explanation: '"Provided that" acts as a conditional conjunction equivalent to "if". In present-future conditionals, the conditional clause takes the present simple ("are strictly adhered to").',
          grammarRule: 'Conditional Conjunctions ("Provided that / As long as")',
          category: 'grammar',
        },
      ];

      // Vocabulary question bank
      const vocabBank: QuizQuestion[] = [
        {
          id: 6,
          question: 'The management made every effort to be _______ to the client’s special requests regarding the delivery schedule.',
          options: ['accommodate', 'accommodation', 'accommodating', 'accommodatingly'],
          correctAnswerIndex: 2,
          explanation: 'Sau linking verb "to be", ta cần tính từ "accommodating" (sẵn lòng giúp đỡ, chu đáo) để bổ nghĩa cho chủ ngữ.',
          grammarRule: 'Word Form: Linking Verb + Adjective Complement',
          category: 'vocab',
          sourceTerm: 'Accommodate',
        },
        {
          id: 7,
          question: 'The signing of the merger contract is strictly _______ upon obtaining regulatory clearance from the antitrust bureau.',
          options: ['contingency', 'contingent', 'contingently', 'contingence'],
          correctAnswerIndex: 1,
          explanation: 'Cấu trúc "be contingent upon" (tùy thuộc vào) cần tính từ "contingent" đứng sau to be và bổ nghĩa bởi trạng từ strictly.',
          grammarRule: 'Collocation & Word Form: Be Contingent Upon',
          category: 'vocab',
          sourceTerm: 'Contingent upon',
        },
        {
          id: 8,
          question: 'All employees must carefully review the contractual _______ before endorsing the partnership memorandum.',
          options: ['stipulations', 'stipulates', 'stipulating', 'stipulatedly'],
          correctAnswerIndex: 0,
          explanation: 'Sau tính từ "contractual", ta cần một danh từ số nhiều "stipulations" (các điều khoản quy định) làm tân ngữ của động từ review.',
          grammarRule: 'Word Form: Adjective + Noun Object',
          category: 'vocab',
          sourceTerm: 'Stipulation',
        },
        {
          id: 9,
          question: 'Please provide an official written _______ of your attendance by Friday noon.',
          options: ['confirm', 'confirmation', 'confirmed', 'confirming'],
          correctAnswerIndex: 1,
          explanation: 'Sau các tính từ "official written", ta cần một danh từ "confirmation" (sự xác nhận) để tạo thành cụm danh từ hoàn chỉnh.',
          grammarRule: 'Word Form: Noun phrase modification',
          category: 'vocab',
          sourceTerm: 'Confirm',
        },
        {
          id: 10,
          question: 'The department head commended Sarah for working so _______ with her teammates on the quarterly project.',
          options: ['colleague', 'collegial', 'collegially', 'colleagueship'],
          correctAnswerIndex: 2,
          explanation: 'Động từ "working" kết hợp với phó từ "collegially" (với tinh thần đồng nghiệp, hợp tác) để chỉ cách thức làm việc.',
          grammarRule: 'Word Form: Verb + Adverb of Manner',
          category: 'vocab',
          sourceTerm: 'Colleague',
        },
      ];

      // Assemble questions based on quizType
      let pool: QuizQuestion[] = [];
      if (quizType === 'vocab') {
        pool = [...vocabBank];
      } else if (quizType === 'grammar') {
        pool = [...grammarBank];
      } else {
        // Mixed: interleave grammar and vocab
        const maxLen = Math.max(grammarBank.length, vocabBank.length);
        for (let i = 0; i < maxLen; i++) {
          if (i < vocabBank.length) pool.push(vocabBank[i]);
          if (i < grammarBank.length) pool.push(grammarBank[i]);
        }
      }

      // Build the final question list according to questionCount
      const selectedQuestions: QuizQuestion[] = [];
      for (let i = 0; i < questionCount; i++) {
        const base = pool[i % pool.length];
        selectedQuestions.push({
          ...base,
          id: i + 1,
        });
      }

      const quizData: QuizResult = {
        topic,
        difficulty,
        questions: selectedQuestions,
      };

      return { type: 'quiz', data: quizData };
    }

    case 'toeic_lesson': {
      const userLevel = (inputData.userLevel as string) || 'A1';
      const topic = (inputData.topic as string) || (userLevel === 'A1' ? 'First Day at the Office' : 'Contract Renewal & Vendor Negotiation');
      const vocabMethod = (inputData.vocabMethod as string) || 'core';
      const isStoryReadingMode =
        vocabMethod === 'reading' ||
        inputData.situationType === 'story' ||
        inputData.modeFocus === 'reading' ||
        /truyện|story|bài đọc|reading|câu chuyện|anecdote|cảm hứng|inspire/i.test(topic);

      if (isStoryReadingMode) {
        if (userLevel === 'A1') {
          const a1StoryData: ToeicLessonResult = {
            topic: topic || 'A Small Habit That Sparked Joy',
            userLevel: 'A1',
            situationType: 'story',
            vocabMethod: 'reading',
            situationTitle: 'A Small Habit That Sparked Joy (Thói Quen Nhỏ Thay Đổi Cuộc Sống)',
            scenarioText:
              'Every morning, Lan enjoys a peaceful routine in her small kitchen. She prepares warm tea and writes down three good things in her journal. This simple practice fills her with deep gratitude. She discovers that every single day brings new opportunities when started with a positive attitude.',
            scenarioTranslationVi:
              'Mỗi buổi sáng, Lan tận hưởng một thói quen yên bình trong căn bếp nhỏ của mình. Cô chuẩn bị tách trà ấm và viết ra ba điều tốt đẹp vào cuốn nhật ký. Thói quen giản dị này lấp đầy trong cô lòng biết ơn sâu sắc. Cô khám phá ra rằng mỗi ngày trôi qua đều mang lại những cơ hội mới khi bắt đầu bằng một thái độ tích cực.',
            targetWords: [
              {
                term: 'Routine',
                ipa: '/ruːˈtiːn/',
                vietnamesePhonetic: 'ru-tin',
                partOfSpeech: 'noun (countable/uncountable)',
                vietnameseMeaning: 'Thói quen hàng ngày, nếp sinh hoạt đều đặn',
                wordFamily: 'routine (n) - routinely (adv)',
                wordFamilyDetails: {
                  noun: 'routine',
                  nounMeaning: 'Thói quen, lịch trình thường lệ',
                  adjective: 'routine',
                  adjectiveMeaning: 'Thông thường, theo thói quen',
                  adverb: 'routinely',
                  adverbMeaning: 'Một cách thường lệ, đều đặn',
                },
                synonyms: [
                  { word: 'habit', meaning: 'Thói quen', nuance: 'Thói quen cá nhân hình thành tự nhiên' },
                  { word: 'practice', meaning: 'Tập quán, thói quen', nuance: 'Hành động lặp đi lặp lại có chủ đích' },
                ],
                wordFormExercise: {
                  sentence: 'Doctors recommend exercising _______ to maintain physical health.',
                  options: ['routine', 'routines', 'routinely', 'routined'],
                  correctIndex: 2,
                  targetForm: 'adverb',
                  explanation: "Bổ nghĩa cho động từ 'exercising', ta cần một trạng từ 'routinely' (một cách đều đặn)."
                },
                exampleSentence: 'Every morning, Lan enjoys a peaceful routine in her small kitchen.',
                exampleTranslation: 'Mỗi buổi sáng, Lan tận hưởng một thói quen yên bình trong căn bếp nhỏ của mình.',
                simpleBreakdown: 'Lan enjoys (Lan tận hưởng) + a peaceful routine (một thói quen yên bình).',
                etsTrapTip: 'Người Việt hay phát âm nuốt âm "t" ở giữa. Hãy đọc rõ: "ru-TIN".'
              },
              {
                term: 'Gratitude',
                ipa: '/ˈɡræt̬.ə.tuːd/',
                vietnamesePhonetic: 'go-ra-ti-tiu-đ',
                partOfSpeech: 'noun (uncountable)',
                vietnameseMeaning: 'Lòng biết ơn, sự trân trọng',
                wordFamily: 'gratitude (n) - grateful (adj) - gratefully (adv)',
                wordFamilyDetails: {
                  noun: 'gratitude',
                  nounMeaning: 'Lòng biết ơn',
                  adjective: 'grateful',
                  adjectiveMeaning: 'Biết ơn, trân trọng',
                  adverb: 'gratefully',
                  adverbMeaning: 'Một cách biết ơn, cảm kích',
                },
                synonyms: [
                  { word: 'thankfulness', meaning: 'Sự biết ơn', nuance: 'Từ đồng nghĩa thân mật hơn' },
                  { word: 'appreciation', meaning: 'Sự trân trọng, đánh giá cao', nuance: 'Dùng phổ biến trong cả công sở' },
                ],
                wordFormExercise: {
                  sentence: 'She expressed her sincere _______ to everyone who assisted her.',
                  options: ['grateful', 'gratefully', 'gratitude', 'grating'],
                  correctIndex: 2,
                  targetForm: 'noun',
                  explanation: "Sau tính từ sở hữu 'her' và tính từ 'sincere', ta cần một danh từ 'gratitude' (lòng biết ơn)."
                },
                exampleSentence: 'This simple practice fills her with deep gratitude.',
                exampleTranslation: 'Thói quen giản dị này lấp đầy trong cô lòng biết ơn sâu sắc.',
                simpleBreakdown: 'fills her (lấp đầy cô) + with deep gratitude (với lòng biết ơn sâu sắc).',
                etsTrapTip: 'Lưu ý tính từ tương ứng là "grateful" (viết là -ful, không phải -full).'
              },
              {
                term: 'Positive',
                ipa: '/ˈpɑː.zə.tɪv/',
                vietnamesePhonetic: 'po-zờ-típ',
                partOfSpeech: 'adjective',
                vietnameseMeaning: 'Tích cực, lạc quan, có lợi',
                wordFamily: 'positivity (n) - positive (adj) - positively (adv)',
                wordFamilyDetails: {
                  noun: 'positivity',
                  nounMeaning: 'Sự tích cực, năng lượng tích cực',
                  adjective: 'positive',
                  adjectiveMeaning: 'Tích cực, lạc quan',
                  adverb: 'positively',
                  adverbMeaning: 'Một cách tích cực',
                },
                synonyms: [
                  { word: 'optimistic', meaning: 'Lạc quan', nuance: 'Nhìn về tương lai với niềm tin tốt đẹp' },
                  { word: 'constructive', meaning: 'Mang tính xây dựng', nuance: 'Dùng trong góp ý công việc' },
                ],
                wordFormExercise: {
                  sentence: 'Maintaining a _______ attitude helps employees overcome daily challenges.',
                  options: ['positive', 'positively', 'positivity', 'positiveness'],
                  correctIndex: 0,
                  targetForm: 'adjective',
                  explanation: "Đứng trước danh từ 'attitude' (thái độ), ta cần một tính từ 'positive' để bổ nghĩa."
                },
                exampleSentence: 'Every single day brings new opportunities when started with a positive attitude.',
                exampleTranslation: 'Mỗi ngày đều mang lại những cơ hội mới khi bắt đầu bằng một thái độ tích cực.',
                simpleBreakdown: 'a positive attitude = một thái độ tích cực.',
                etsTrapTip: 'Trọng âm rơi vào âm tiết đầu: /ˈPɑː.zə.tɪv/.'
              }
            ],
            interactiveChallenge: {
              prompt: 'Theo bài đọc trên, điều gì giúp Lan bắt đầu một ngày mới tràn ngập niềm vui và lòng biết ơn?',
              options: [
                'Uống cà phê đặc và vội vã đi làm ngay',
                'Thói quen uống trà ấm và viết ra ba điều tốt đẹp vào nhật ký',
                'Kiểm tra email công việc liên tục từ sáng sớm',
                'Ngủ nướng thêm để tránh mệt mỏi'
              ],
              correctIndex: 1,
              explanation: 'Bài đọc chỉ rõ: "She prepares warm tea and writes down three good things in her journal. This simple practice fills her with deep gratitude."',
              takeawayTip: 'Học từ vựng qua câu chuyện giàu cảm xúc giúp não bộ ghi nhớ sâu hơn 3 lần so với học vẹt từng từ riêng lẻ.'
            }
          };
          return { type: 'toeic_lesson', data: a1StoryData };
        } else {
          // B1 / B2 Story Fallback
          const bStoryData: ToeicLessonResult = {
            topic: topic || 'Stepping Beyond the Comfort Zone',
            userLevel: (userLevel as any) || 'B1',
            situationType: 'story',
            vocabMethod: 'reading',
            situationTitle: 'Stepping Beyond the Comfort Zone (Bước Ra Khỏi Vùng An Toàn)',
            scenarioText:
              'When Minh decided to transition into clean technology, he encountered immense uncertainty. However, actively embracing the challenge became a pivotal turning point in his career. Through remarkable resilience and continuous self-reflection, he mastered sustainable design principles and now leads community initiatives with boundless enthusiasm.',
            scenarioTranslationVi:
              'Khi Minh quyết định chuyển hướng sang lĩnh vực công nghệ sạch, anh từng đối mặt với sự bất định tột cùng. Tuy nhiên, việc chủ động đón nhận thách thức đã trở thành bước ngoặt then chốt trong sự nghiệp của anh. Nhờ sự kiên cường đáng nể và tinh thần tự nhìn nhận liên tục, anh đã làm chủ các nguyên lý thiết kế bền vững và hiện đang dẫn dắt các sáng kiến cộng đồng với lòng nhiệt huyết vô bờ.',
            targetWords: [
              {
                term: 'Embrace',
                ipa: '/ɪmˈbreɪs/',
                vietnamesePhonetic: 'im-bờ-rây-s',
                partOfSpeech: 'verb (transitive)',
                vietnameseMeaning: 'Đón nhận, nắm bắt cơ hội hoặc thay đổi một cách tích cực',
                wordFamily: 'embrace (v/n)',
                wordFamilyDetails: {
                  noun: 'embrace',
                  nounMeaning: 'Cái ôm; sự đón nhận',
                  verb: 'embrace',
                  verbMeaning: 'Đón nhận, nắm bắt, bao gồm',
                },
                synonyms: [
                  { word: 'welcome', meaning: 'Nhiệt liệt chào đón', nuance: 'Thái độ cởi mở với cái mới' },
                  { word: 'adopt', meaning: 'Áp dụng, tiếp nhận', nuance: 'Dùng cho phương pháp, công nghệ mới' },
                ],
                wordFormExercise: {
                  sentence: 'Successful leaders willingly _______ technological changes rather than resisting them.',
                  options: ['embrace', 'embraced', 'embracing', 'embraces'],
                  correctIndex: 0,
                  targetForm: 'verb',
                  explanation: "Chủ ngữ số nhiều 'leaders' đi cùng trạng từ 'willingly' cần một động từ nguyên thể 'embrace'."
                },
                exampleSentence: 'Actively embracing the challenge became a pivotal turning point.',
                exampleTranslation: 'Việc chủ động đón nhận thách thức đã trở thành bước ngoặt then chốt.',
                simpleBreakdown: 'embracing (đón nhận) + the challenge (thách thức).',
                etsTrapTip: 'Trong tiếng Anh học thuật và kinh doanh, "embrace" thường mang nghĩa đón nhận thay đổi/ý tưởng, không chỉ là cái ôm thể chất.'
              },
              {
                term: 'Pivotal',
                ipa: '/ˈpɪv.ə.t̬əl/',
                vietnamesePhonetic: 'pi-vơ-tồ',
                partOfSpeech: 'adjective',
                vietnameseMeaning: 'Then chốt, mang tính chất bước ngoặt quyết định',
                wordFamily: 'pivot (n/v) - pivotal (adj) - pivotally (adv)',
                wordFamilyDetails: {
                  noun: 'pivot',
                  nounMeaning: 'Trục xoay, điểm tựa then chốt',
                  verb: 'pivot',
                  verbMeaning: 'Xoay trục, đổi hướng chiến lược',
                  adjective: 'pivotal',
                  adjectiveMeaning: 'Then chốt, có tính bước ngoặt',
                },
                synonyms: [
                  { word: 'crucial', meaning: 'Cực kỳ quan trọng', nuance: 'Quyết định sự thành bại' },
                  { word: 'decisive', meaning: 'Mang tính quyết định', nuance: 'Dẫn tới kết quả chung cuộc' },
                ],
                wordFormExercise: {
                  sentence: 'Her mentorship played a _______ role in the startup’s rapid international expansion.',
                  options: ['pivot', 'pivoting', 'pivotal', 'pivotally'],
                  correctIndex: 2,
                  targetForm: 'adjective',
                  explanation: "Đứng trước danh từ 'role', ta cần một tính từ 'pivotal' (then chốt)."
                },
                exampleSentence: 'Embracing the challenge became a pivotal turning point in his career.',
                exampleTranslation: 'Đón nhận thách thức đã trở thành bước ngoặt then chốt trong sự nghiệp của anh.',
                simpleBreakdown: 'a pivotal turning point = một bước ngoặt then chốt.',
                etsTrapTip: 'Cụm collocation kinh điển: "play a pivotal role in something" (đóng vai trò then chốt).'
              },
              {
                term: 'Resilience',
                ipa: '/rɪˈzɪl.jəns/',
                vietnamesePhonetic: 'ri-zi-li-ơn-s',
                partOfSpeech: 'noun (uncountable)',
                vietnameseMeaning: 'Khả năng phục hồi, kiên cường vượt qua nghịch cảnh',
                wordFamily: 'resilience (n) - resilient (adj) - resiliently (adv)',
                wordFamilyDetails: {
                  noun: 'resilience',
                  nounMeaning: 'Sự kiên cường, khả năng phục hồi',
                  adjective: 'resilient',
                  adjectiveMeaning: 'Kiên cường, bền bỉ',
                  adverb: 'resiliently',
                  adverbMeaning: 'Một cách kiên cường',
                },
                synonyms: [
                  { word: 'perseverance', meaning: 'Sự kiên trì, bền bỉ', nuance: 'Không bỏ cuộc dù gặp khó' },
                  { word: 'toughness', meaning: 'Sự rắn rỏi, kiên cường', nuance: 'Khả năng chịu đựng áp lực' },
                ],
                wordFormExercise: {
                  sentence: 'The entire team demonstrated remarkable _______ during the economic downturn.',
                  options: ['resilience', 'resilient', 'resiliently', 'resile'],
                  correctIndex: 0,
                  targetForm: 'noun',
                  explanation: "Sau tính từ 'remarkable' (đáng nể), ta cần một danh từ 'resilience' làm tân ngữ cho 'demonstrated'."
                },
                exampleSentence: 'Through remarkable resilience and continuous self-reflection, he mastered sustainable design.',
                exampleTranslation: 'Nhờ sự kiên cường đáng nể và tinh thần tự nhìn nhận liên tục, anh đã làm chủ thiết kế bền vững.',
                simpleBreakdown: 'Through remarkable resilience = Nhờ sự kiên cường đáng nể.',
                etsTrapTip: 'Danh từ là "resilience", tính từ là "resilient". Tránh dùng lẫn lộn.'
              }
            ],
            interactiveChallenge: {
              prompt: 'Theo câu chuyện, yếu tố nào đóng vai trò là "bước ngoặt then chốt" (pivotal turning point) trong sự nghiệp của Minh?',
              options: [
                'Tránh né mọi rủi ro để giữ sự ổn định an toàn',
                'Chủ động đón nhận thách thức và sự bất định (embracing the challenge)',
                'Chờ đợi người khác giao việc và hướng dẫn từng bước',
                'Bỏ cuộc ngay khi gặp sự hoài nghi bản thân'
              ],
              correctIndex: 1,
              explanation: 'Câu chuyện nêu rõ: "However, actively embracing the challenge became a pivotal turning point in his career."',
              takeawayTip: 'Học từ vựng qua câu chuyện truyền cảm hứng giúp bạn ghi nhớ cả cấu trúc Collocation sống động trong ngữ cảnh thực tế.'
            }
          };
          return { type: 'toeic_lesson', data: bStoryData };
        }
      }

      if (userLevel === 'A1') {
        const a1Data: ToeicLessonResult = {
          topic: 'First Day at the Office & Meeting Colleagues',
          userLevel: 'A1',
          situationType: 'email',
          situationTitle: 'Welcome to the Team & Meeting Schedule',
          scenarioText:
            'Good morning Alex. Welcome to our office! Please check your meeting schedule for today. If you need any help, your colleague Sarah is ready to assist you.',
          scenarioTranslationVi:
            'Chào buổi sáng Alex. Chào mừng bạn đến với văn phòng của chúng tôi! Vui lòng kiểm tra lịch họp của bạn cho ngày hôm nay. Nếu bạn cần bất kỳ sự giúp đỡ nào, đồng nghiệp Sarah sẵn sàng hỗ trợ bạn.',
          targetWords: [
            {
              term: 'Schedule',
              ipa: '/ˈskedʒ.uːl/',
              vietnamesePhonetic: 'x-két-giu-ồ',
              partOfSpeech: 'noun (countable)',
              vietnameseMeaning: 'Lịch trình, thời gian biểu làm việc',
              wordFamily: 'schedule (n - lịch) / schedule (v - lên lịch)',
              wordFamilyDetails: {
                noun: 'schedule',
                nounMeaning: 'Lịch trình, thời khóa biểu',
                verb: 'schedule',
                verbMeaning: 'Lên lịch, sắp xếp thời gian',
                adjective: 'scheduled',
                adjectiveMeaning: 'Đã được lên lịch',
              },
              synonyms: [
                { word: 'timetable', meaning: 'Thời gian biểu', nuance: 'Dùng cho tàu xe, lớp học' },
                { word: 'agenda', meaning: 'Chương trình nghị sự', nuance: 'Lịch trình cuộc họp' },
              ],
              wordFormExercise: {
                sentence: 'The project manager asked the team to _______ the weekly status meeting.',
                options: ['schedule', 'scheduled', 'scheduling', 'scheduler'],
                correctIndex: 0,
                targetForm: 'verb',
                explanation: "Sau cấu trúc 'ask someone to + V (bare infinitive)', ta cần một động từ nguyên thể 'schedule'."
              },
              toeicParaphrase: 'schedule ≈ timetable, agenda',
              exampleSentence: 'I have a busy schedule this morning.',
              exampleTranslation: 'Sáng nay tôi có một lịch trình rất bận rộn.',
              simpleBreakdown: 'I (Chủ ngữ) + have (có) + a busy schedule (một lịch trình bận rộn).',
              etsTrapTip: 'Người Việt hay đọc sai âm đầu "sk-". Hãy phát âm âm "s" nhẹ rồi sang "két".'
            },
            {
              term: 'Colleague',
              ipa: '/ˈkɑː.liːɡ/',
              vietnamesePhonetic: 'co-li-g (âm g nhẹ ở cuối)',
              partOfSpeech: 'noun (countable)',
              vietnameseMeaning: 'Đồng nghiệp cùng công ty',
              wordFamily: 'colleague (n)',
              wordFamilyDetails: {
                noun: 'colleague',
                nounMeaning: 'Đồng nghiệp',
                adjective: 'collegial',
                adjectiveMeaning: 'Mang tính đồng nghiệp, hợp tác',
                adverb: 'collegially',
                adverbMeaning: 'Một cách hợp tác',
              },
              synonyms: [
                { word: 'coworker', meaning: 'Đồng nghiệp', nuance: 'Từ phổ biến trong tiếng Anh Mỹ' },
                { word: 'peer', meaning: 'Người cùng cấp bậc', nuance: 'Đồng đẳng về trình độ hoặc chức vụ' },
              ],
              wordFormExercise: {
                sentence: 'Mr. David works well with all of his _______ in the sales department.',
                options: ['colleague', 'colleagues', 'collegial', 'collegially'],
                correctIndex: 1,
                targetForm: 'noun',
                explanation: "Sau lượng từ 'all of his', ta cần một danh từ đếm được số nhiều 'colleagues' chỉ người."
              },
              toeicParaphrase: 'colleague ≈ coworker, teammate',
              exampleSentence: 'Sarah is my new colleague in marketing.',
              exampleTranslation: 'Sarah là đồng nghiệp mới của tôi ở phòng marketing.',
              simpleBreakdown: 'Sarah (Tên người) + is (là) + my new colleague (đồng nghiệp mới của tôi).',
              etsTrapTip: 'Đừng đọc thành "cô-lê-gơ". Trọng âm rơi vào âm tiết thứ nhất "co-".'
            },
            {
              term: 'Confirm',
              ipa: '/kənˈfɜːrm/',
              vietnamesePhonetic: 'cơn-fơm (kéo dài âm fơm)',
              partOfSpeech: 'verb',
              vietnameseMeaning: 'Xác nhận (lịch hẹn, email, thông tin)',
              wordFamily: 'confirm (v) - confirmation (n - sự xác nhận)',
              wordFamilyDetails: {
                noun: 'confirmation',
                nounMeaning: 'Sự xác nhận, chứng thực',
                verb: 'confirm',
                verbMeaning: 'Xác nhận, khẳng định',
                adjective: 'confirmed',
                adjectiveMeaning: 'Đã được xác nhận',
              },
              synonyms: [
                { word: 'verify', meaning: 'Xác minh độ chính xác', nuance: 'Kiểm tra tính đúng đắn của dữ liệu' },
                { word: 'validate', meaning: 'Công nhận tính hợp lệ', nuance: 'Kiểm tra về mặt quy định, hiệu lực' },
              ],
              wordFormExercise: {
                sentence: 'Please send an email _______ of your hotel booking as soon as possible.',
                options: ['confirm', 'confirmation', 'confirmed', 'confirming'],
                correctIndex: 1,
                targetForm: 'noun',
                explanation: "Cụm danh từ 'email confirmation' (sự xác nhận qua email) cần danh từ 'confirmation' làm danh từ chính."
              },
              toeicParaphrase: 'confirm ≈ verify, check',
              exampleSentence: 'Please confirm the meeting time by email.',
              exampleTranslation: 'Vui lòng xác nhận giờ họp qua email.',
              simpleBreakdown: 'Please (Xin vui lòng) + confirm (xác nhận) + the meeting time (giờ họp).',
              etsTrapTip: 'Trong đề thi TOEIC, sau "Please" luôn là động từ nguyên mẫu không chia: "Please confirm".'
            }
          ],
          interactiveChallenge: {
            prompt: 'Tình huống A1: Đồng nghiệp hỏi bạn: "Do you have time for a quick meeting at 2 PM?" (Bạn có thời gian cho cuộc họp nhanh lúc 2 giờ chiều không?). Nếu bạn bận, câu trả lời nào lịch sự và đúng nhất?',
            options: [
              'No, I go now.',
              'I am sorry, I am busy at 2 PM. Can we meet at 3 PM?',
              'Why you ask me?',
              'Meeting is bad today.'
            ],
            correctIndex: 1,
            explanation: 'Câu 2 là phản hồi chuẩn mực, lịch sự nhất: vừa xin lỗi khéo léo ("I am sorry, I am busy"), vừa đưa ra giờ thay thế hợp lý ("Can we meet at 3 PM?"). Cấu trúc đơn giản, đúng ngữ pháp A1.',
            takeawayTip: 'Khi từ chối lịch hẹn trong công sở, luôn kèm lời xin lỗi ngắn và đề xuất một mốc giờ khác.'
          }
        };
        return { type: 'toeic_lesson', data: a1Data };
      }

      const toeicData: ToeicLessonResult = {
        topic,
        userLevel: 'B2',
        situationType: 'email',
        situationTitle: 'Urgent: Revised Terms for Q3 Software Licensing Agreement',
        scenarioText:
          'Following our preliminary discussion yesterday, we are prepared to accommodate your request for a 10% volume discount. However, final approval is strictly contingent upon your team submitting the signed service level agreement before Friday. Please review the attached stipulations and confirm if they align with your corporate compliance guidelines.',
        scenarioTranslationVi:
          'Sau cuộc thảo luận sơ bộ ngày hôm qua, chúng tôi sẵn sàng đáp ứng yêu cầu chiết khấu 10% theo số lượng của quý công ty. Tuy nhiên, sự chấp thuận cuối cùng hoàn toàn phụ thuộc vào việc đội ngũ của quý vị nộp lại thỏa thuận mức dịch vụ đã ký trước thứ Sáu. Vui lòng xem xét các điều khoản đính kèm và xác nhận xem chúng có phù hợp với các quy chuẩn tuân thủ của doanh nghiệp quý vị hay không.',
        targetWords: [
          {
            term: 'Accommodate',
            ipa: '/əˈkɑː.mə.deɪt/',
            partOfSpeech: 'verb (transitive)',
            vietnameseMeaning: 'Đáp ứng, thu xếp thỏa đáng (nguyện vọng, yêu cầu, lịch trình)',
            wordFamily: 'accommodate (v) - accommodation (n) - accommodating (adj)',
            wordFamilyDetails: {
              noun: 'accommodation',
              nounMeaning: 'Chỗ ở; sự đáp ứng/thu xếp',
              verb: 'accommodate',
              verbMeaning: 'Đáp ứng, thu xếp thỏa đáng',
              adjective: 'accommodating',
              adjectiveMeaning: 'Sẵn lòng giúp đỡ, chu đáo',
              adverb: 'accommodatingly',
              adverbMeaning: 'Một cách chu đáo, niềm nở',
            },
            synonyms: [
              { word: 'cater to', meaning: 'Phục vụ, đáp ứng nhu cầu', nuance: 'Nhấn mạnh việc thỏa mãn thị hiếu hoặc yêu cầu đặc biệt' },
              { word: 'fulfill', meaning: 'Hoàn thành, đáp ứng', nuance: 'Thường dùng cho tiêu chuẩn, nghĩa vụ hoặc mong đợi' },
            ],
            wordFormExercise: {
              sentence: 'The hotel management made every effort to be _______ to our special requests.',
              options: ['accommodate', 'accommodation', 'accommodating', 'accommodatingly'],
              correctIndex: 2,
              targetForm: 'adjective',
              explanation: "Sau động từ liên kết 'to be', ta cần một tính từ 'accommodating' (chu đáo, sẵn lòng giúp đỡ) để bổ nghĩa cho chủ ngữ."
            },
            toeicParaphrase: 'accommodate ≈ cater to, fulfill, meet (a demand/need)',
            exampleSentence: 'The conference organizers were happy to accommodate our special dietary requests.',
            exampleTranslation: 'Ban tổ chức hội nghị rất sẵn lòng đáp ứng các yêu cầu ăn uống đặc biệt của chúng tôi.',
            etsTrapTip:
              'Trong TOEIC, thí sinh hay nhầm "accommodate" chỉ là "cung cấp chỗ ở". Đề thi Part 7 thường dùng nghĩa bóng: "accommodate changes/requests" (đáp ứng thay đổi/yêu cầu).'
          },
          {
            term: 'Contingent upon',
            ipa: '/kənˈtɪn.dʒənt əˈpɑːn/',
            partOfSpeech: 'adjective phrase',
            vietnameseMeaning: 'Phụ thuộc vào, tùy thuộc vào điều kiện nào đó',
            wordFamily: 'contingency (n - phương án dự phòng) - contingent (adj)',
            wordFamilyDetails: {
              noun: 'contingency',
              nounMeaning: 'Sự việc bất ngờ, phương án dự phòng',
              adjective: 'contingent',
              adjectiveMeaning: 'Tùy thuộc vào điều kiện tiên quyết',
              adverb: 'contingently',
              adverbMeaning: 'Một cách ngẫu nhiên, tùy thuộc',
            },
            synonyms: [
              { word: 'dependent on', meaning: 'Phụ thuộc vào', nuance: 'Dùng phổ biến trong cả văn nói và viết' },
              { word: 'conditional upon', meaning: 'Tùy thuộc vào điều kiện', nuance: 'Mang tính pháp lý, hợp đồng chính thức' },
            ],
            wordFormExercise: {
              sentence: 'The year-end bonus is strictly _______ upon achieving our quarterly revenue target.',
              options: ['contingency', 'contingent', 'contingently', 'contingence'],
              correctIndex: 1,
              targetForm: 'adjective',
              explanation: "Cấu trúc 'is strictly contingent upon' cần tính từ 'contingent' theo sau to be và trạng từ strictly."
            },
            toeicParaphrase: 'contingent upon ≈ dependent on, subject to, conditional upon',
            exampleSentence: 'The merger is contingent upon receiving regulatory approval from the antitrust commission.',
            exampleTranslation: 'Thương vụ sáp nhập phụ thuộc vào việc nhận được sự chấp thuận từ ủy ban chống độc quyền.',
            etsTrapTip:
              'Cụm "contingent upon/on" là đặc sản của Part 5 và Part 7 (Hợp đồng kinh tế). Cực kỳ hay bị kiểm tra giới từ "upon/on".'
          },
          {
            term: 'Stipulation',
            ipa: '/ˌstɪp.jəˈleɪ.ʃən/',
            partOfSpeech: 'noun (countable)',
            vietnameseMeaning: 'Điều khoản quy định bắt buộc trong hợp đồng/thỏa thuận',
            wordFamily: 'stipulate (v) - stipulation (n)',
            wordFamilyDetails: {
              noun: 'stipulation',
              nounMeaning: 'Điều khoản quy định bắt buộc',
              verb: 'stipulate',
              verbMeaning: 'Quy định, đặt điều kiện',
              adjective: 'stipulated',
              adjectiveMeaning: 'Đã được quy định rõ trong văn bản',
            },
            synonyms: [
              { word: 'clause', meaning: 'Điều khoản hợp đồng', nuance: 'Mục cụ thể trong văn bản pháp lý' },
              { word: 'provision', meaning: 'Điều khoản quy định', nuance: 'Quy định pháp lý hoặc điều kiện giao kèo' },
            ],
            wordFormExercise: {
              sentence: 'The partnership contract clearly _______ that all financial audits must be conducted quarterly.',
              options: ['stipulation', 'stipulates', 'stipulatedly', 'stipulating'],
              correctIndex: 1,
              targetForm: 'verb',
              explanation: "Chủ ngữ 'The partnership contract' (ngôi thứ 3 số ít) cần một động từ chính 'stipulates' chia thì hiện tại đơn."
            },
            toeicParaphrase: 'stipulation ≈ clause, provision, condition, requirement',
            exampleSentence: 'Failure to adhere to the environmental stipulations will result in severe contractual penalties.',
            exampleTranslation: 'Việc không tuân thủ các điều khoản về môi trường sẽ dẫn đến các hình phạt nghiêm khắc trong hợp đồng.',
            etsTrapTip:
              'Động từ "stipulate" thường đi với mệnh đề giả định bàng thái: "The policy stipulates that every employee be certified" (động từ nguyên thể không to).'
          }
        ],
        interactiveChallenge: {
          prompt:
            'Tình huống phản xạ công sở: Đối tác thông báo giảm giá nhưng yêu cầu bạn nộp hợp đồng trước thứ Sáu. Bạn cần thêm 2 ngày để ban pháp chế duyệt. Đâu là cách phản hồi khéo léo và chuyên nghiệp nhất chuẩn TOEIC 700+?',
          options: [
            'We cannot do it before Friday because our legal team is too slow.',
            'While we appreciate the discount offer, would it be possible to grant a tentative two-day extension so our legal counsel can thoroughly review the stipulations?',
            'You must wait for us until next Tuesday or we cancel the whole contract.',
            'Yes we accept immediately without asking our lawyers.'
          ],
          correctIndex: 1,
          explanation:
            'Lựa chọn 2 thể hiện phong thái giao tiếp kinh doanh ngoại giao (Diplomatic Tone): Vừa ghi nhận thiện chí ("While we appreciate..."), vừa dùng cấu trúc đề nghị lịch sự ("would it be possible to grant..."), kết hợp từ vựng TOEIC cao cấp ("tentative extension", "legal counsel", "review stipulations").',
          takeawayTip:
            'Trong TOEIC Part 3/4 & Part 7, các câu trả lời mang tính xây dựng, ngoại giao và chuyên nghiệp (diplomatic & polite negotiation) luôn là đáp án đúng.'
        }
      };

      return { type: 'toeic_lesson', data: toeicData };
    }

    case 'grammar_lesson': {
      const userLevel = (inputData.userLevel as 'A1' | 'A2' | 'B1' | 'B2') || 'A1';

      const grammarA1: GrammarLessonResult = {
        ruleName: 'Mẫu câu nhờ vả lịch sự công sở với Please',
        userLevel: 'A1',
        formula: 'Please + Động từ nguyên thể (Bare Verb) + Tân ngữ / Thông tin bổ trợ',
        vietnameseMeaning: 'Dùng để nhờ đồng nghiệp hoặc đối tác làm một việc gì đó một cách lịch sự, nhã nhặn nhưng dứt khoát.',
        explanation: 'Khi mới bắt đầu (A1), thay vì chỉ ra lệnh cộc lốc hoặc dịch từng từ tiếng Việt ("You do this"), ta chỉ cần đặt từ "Please" ở đầu câu rồi cộng ngay với động từ nguyên mẫu không chia. Đây là quy tắc vàng số 1 trong văn hóa email và giao tiếp công sở quốc tế.',
        examples: [
          {
            en: 'Please send me the report before 5 PM.',
            vi: 'Vui lòng gửi cho tôi bản báo cáo trước 5 giờ chiều.',
            note: '"send" giữ nguyên thể, không thêm -s, không thêm -ing'
          },
          {
            en: 'Please check your email for the meeting link.',
            vi: 'Vui lòng kiểm tra email của bạn để lấy đường link cuộc họp.',
            note: 'Động từ "check" đi trực tiếp sau Please'
          },
          {
            en: 'Please let me know if you need any assistance.',
            vi: 'Vui lòng cho tôi biết nếu bạn cần bất kỳ sự hỗ trợ nào.',
            note: 'Cụm mẫu câu cực kỳ phổ biến ở cuối email công sở'
          }
        ],
        vietnameseTrap: 'Người Việt hay quen thói quen thêm "to" sau Please (ví dụ: "Please to send..."), hoặc chia thì theo quá khứ. Nhớ tuyệt đối: Sau Please là ĐỘNG TỪ NGUYÊN THỂ KHÔNG TO!',
        practiceSentence: {
          prompt: 'Hãy thử ghép câu: "Vui lòng ký vào tài liệu này và gửi lại cho tôi."',
          hint: 'Dùng: sign (ký), this document (tài liệu này), send back to me (gửi lại cho tôi)'
        }
      };

      const grammarB1: GrammarLessonResult = {
        ruleName: 'Cấu trúc chịu trách nhiệm: Be responsible for + V-ing/Noun',
        userLevel: 'B1',
        formula: 'S + be + responsible for + V-ing / Noun',
        vietnameseMeaning: 'Diễn đạt ai đó chịu trách nhiệm hoặc đảm nhiệm một phân việc, dự án cụ thể.',
        explanation: 'Trong mô tả công việc (Job Description) và phỏng vấn, cấu trúc này xuất hiện với tần suất cực cao. Giới từ "for" bắt buộc động từ đi sau phải chuyển thành danh động từ (V-ing).',
        examples: [
          {
            en: 'Our department is responsible for quality assurance and compliance.',
            vi: 'Phòng ban của chúng tôi chịu trách nhiệm về đảm bảo chất lượng và tuân thủ quy chuẩn.',
            note: 'responsible for + Danh từ kép'
          },
          {
            en: 'She is responsible for organizing the quarterly shareholder meeting.',
            vi: 'Cô ấy chịu trách nhiệm tổ chức cuộc họp cổ đông hàng quý.',
            note: 'organizing ở dạng V-ing sau giới từ for'
          }
        ],
        vietnameseTrap: 'Hay nhầm giữa "responsible for + V-ing" và "take responsibility to...". Sau responsible luôn là giới từ FOR, không dùng to verb.',
        practiceSentence: {
          prompt: 'Hãy thử ghép câu: "Tôi chịu trách nhiệm quản lý đội ngũ bán hàng."',
          hint: 'Dùng: I am responsible for..., managing (quản lý), the sales team (đội ngũ bán hàng)'
        }
      };

      return {
        type: 'grammar_lesson',
        data: userLevel === 'B1' || userLevel === 'B2' ? grammarB1 : grammarA1
      };
    }

    case 'reflex_challenge': {
      const userLevel = (inputData.userLevel as 'A1' | 'A2' | 'B1' | 'B2') || 'A1';
      const reviewTerms = (inputData.reviewTerms as string[]) || [];

      const reviewedNames = reviewTerms.length > 0 ? reviewTerms : ['Accommodate', 'Stipulation'];

      const reflexData: ReflexChallengeResult = {
        sourceType: reviewTerms.length > 0 ? 'memory_review' : 'general',
        userLevel,
        reviewedTerms: reviewedNames,
        situationContext: 'Tình huống: Bạn nhận được email từ khách hàng đối tác yêu cầu điều chỉnh lịch giao hàng sang tuần sau, nhưng hợp đồng quy định cần báo trước 3 ngày.',
        question: 'Đâu là câu trả lời chuyên nghiệp, thể hiện sự linh hoạt ("Accommodate") nhưng vẫn tuân thủ điều khoản hợp đồng ("Stipulation")?',
        options: [
          'No, we cannot change anything because you did not tell us earlier.',
          'We accommodate you unconditionally with no contract needed.',
          'We can accommodate your revised delivery schedule, provided that it complies with the stipulations outlined in Section 4.',
          'You must obey the stipulations and pay fine immediately.'
        ],
        correctIndex: 2,
        explanation: 'Câu trả lời này sử dụng chính xác từ "accommodate" (đáp ứng/thu xếp thỏa đáng) kết hợp "stipulations" (các điều khoản quy định) với cấu trúc liên từ điều kiện "provided that..." (với điều kiện là). Đây là phong thái đàm phán chuẩn mực trong văn hóa kinh doanh quốc tế.',
        memoryTip: 'Nhớ nhanh: "Accommodate a request" (đáp ứng yêu cầu) + "Contractual stipulations" (các điều khoản hợp đồng) là bộ đôi luôn đi cùng nhau trong Part 7 TOEIC.'
      };

      return { type: 'reflex_challenge', data: reflexData };
    }

    case 'reading_lesson': {
      const userLevel = (inputData.userLevel as string) || (inputData.readingLevel as string) || 'B1';
      const topic = (inputData.topic as string) || 'Đời sống, Khám phá & Giao tiếp thường ngày';
      const targetWordCount = typeof inputData.targetWordCount === 'number' && inputData.targetWordCount > 0
        ? inputData.targetWordCount
        : 250;

      const isTravelOrLife = /du lịch|travel|life|ẩm thực|dining|cà phê|coffee|văn hóa|khám phá/i.test(topic);
      const isTech = /công nghệ|tech|ai|khoa học|science/i.test(topic);

      let readingData: ReadingLessonResult;

      if (isTravelOrLife) {
        readingData = {
          title: 'The Art of Mindful Mornings at Local Cafes',
          userLevel,
          topic,
          targetWordCount,
          genre: 'story',
          passage: 'Every Saturday morning, Liam visits a cozy neighborhood cafe nestled near the central park. The inviting aroma of freshly ground Arabica coffee and warm sourdough pastries fills the sunlit room as gentle acoustic music plays in the background.\n\nHe usually orders a golden butter croissant and an iced oat milk latte, then settles into a quiet corner table by the window. For the next hour, Liam intentionally disconnects his smartphone and sets aside his bustling work schedule. Instead, he immerses himself in a captivating travel novel, occasionally pausing to observe local residents walking their dogs along the quiet, tree-lined avenue.\n\nThis deliberate pause has evolved into an indispensable personal ritual. Liam believes that in an increasingly hurried world dominated by continuous screen time, taking thirty to sixty minutes for unhurried reflection and literary discovery is essential to rejuvenate both mental focus and emotional well-being before meeting friends for weekend activities.',
          translationVi: 'Mỗi sáng thứ Bảy, Liam lại ghé một quán cà phê ấm cúng nằm nép mình bên cạnh công viên trung tâm. Hương thơm quyến rũ của hạt cà phê Arabica mới xay cùng những mẻ bánh nướng nóng hổi lan tỏa khắp căn phòng ngập nắng trong điệu nhạc mộc êm dịu.\n\nAnh thường gọi một chiếc bánh sừng bò bơ vàng ruộm cùng một ly latte sữa yến mạch đá, rồi ngồi vào chiếc bàn gỗ yên tĩnh cạnh cửa sổ. Trong một tiếng tiếp theo, Liam chủ động tắt thông báo điện thoại và gác lại lịch trình bận rộn. Thay vào đó, anh đắm chìm vào cuốn tiểu thuyết du lịch lôi cuốn, thi thoảng dừng lại ngắm nhìn cư dân địa phương dắt thú cưng đi dạo dọc theo đại lộ rợp bóng cây.\n\nKhoảng lặng có chủ đích này đã trở thành một nghi thức cá nhân không thể thiếu. Liam tin rằng giữa một thế giới ngày càng vội vã và tràn ngập màn hình điện tử, việc dành ra 30 đến 60 phút để suy ngẫm thư thái và khám phá trang sách là điều thiết yếu để tái tạo sự tập trung cũng như năng lượng tinh thần trước khi gặp gỡ bạn bè vào cuối tuần.',
          keyVocabulary: [
            { term: 'Nestled', ipa: '/ˈnes.əld/', meaning: 'Nằm nép mình ở vị trí yên bình', contextHint: 'nestled near the central park' },
            { term: 'Intentionally', ipa: '/ɪnˈten.ʃən.əl.i/', meaning: 'Một cách có chủ đích, tự nguyện', contextHint: 'intentionally disconnects his phone' },
            { term: 'Indispensable', ipa: '/ˌɪn.dɪˈspen.sə.bəl/', meaning: 'Không thể thiếu, vô cùng quan trọng', contextHint: 'an indispensable personal ritual' },
            { term: 'Rejuvenate', ipa: '/rɪˈdʒuː.vən.eɪt/', meaning: 'Tái tạo, làm tươi mới năng lượng', contextHint: 'rejuvenate mental focus and well-being' },
          ],
          comprehensionQuiz: {
            question: 'Theo bài viết, mục đích chính của Liam khi dành thời gian tại quán cà phê mỗi sáng là gì?',
            options: [
              'Tranh thủ giải quyết các email công việc tồn đọng từ tuần trước',
              'Chủ động tách khỏi nhịp sống vội vã để đọc sách và tái tạo năng lượng tinh thần',
              'Tìm kiếm cơ hội đàm phán hợp đồng kinh doanh mới',
              'Học các công thức pha chế đồ uống chuyên nghiệp'
            ],
            correctIndex: 1,
            explanation: 'Đoạn văn kết luận: "taking thirty to sixty minutes for unhurried reflection and literary discovery is essential to rejuvenate both mental focus and emotional well-being".'
          }
        };
      } else if (isTech) {
        readingData = {
          title: 'How Generative AI Is Reshaping Daily Learning Habits',
          userLevel,
          topic,
          targetWordCount,
          genre: 'article',
          passage: 'Digital devices and artificial intelligence have fundamentally transformed how people acquire knowledge and organize daily priorities. From intelligent tutoring systems to personalized language assistants, technology now enables learners to tailor study materials precisely to their CEFR levels, schedule flexible practice intervals, and receive instant feedback at any hour of the day.\n\nModern educational platforms leverage spaced repetition algorithms to predict when a learner is likely to forget a grammatical rule or vocabulary item. By presenting active recall challenges at optimal intervals, these tools maximize long-term retention while significantly reducing study fatigue. Furthermore, interactive voice recognition allows individuals to practice conversational pronunciation in private, judgment-free environments.\n\nNevertheless, educational psychologists emphasize that technology serves as a powerful accelerator, not a total substitute for human curiosity and disciplined habit formation. Pairing cutting-edge AI feedback with consistent daily routines remains the gold standard for achieving authentic language fluency.',
          translationVi: 'Các thiết bị số và trí tuệ nhân tạo đã thay đổi căn bản cách con người tiếp thu tri thức cũng như sắp xếp các ưu tiên hàng ngày. Từ các hệ thống gia sư thông minh đến trợ lý ngôn ngữ cá nhân hóa, công nghệ hiện nay cho phép người học tinh chỉnh tài liệu chính xác theo cấp độ CEFR, lên lịch học tập linh hoạt và nhận phản hồi tức thì vào bất kỳ thời điểm nào trong ngày.\n\nCác nền tảng giáo dục hiện đại tận dụng thuật toán lặp lại ngắt quãng (Spaced Repetition) để dự đoán thời điểm người học sắp quên một cấu trúc ngữ pháp hay từ vựng. Bằng cách đưa ra thử thách gợi nhớ chủ động vào những khoảng thời gian tối ưu, các công cụ này tối đa hóa khả năng ghi nhớ dài hạn trong khi giảm thiểu đáng kể sự mệt mỏi khi học. Thêm vào đó, công nghệ nhận diện giọng nói tương tác giúp người học luyện phát âm trong một môi trường riêng tư và không lo bị phán xét.\n\nDẫu vậy, các nhà tâm lý học giáo dục nhấn mạnh rằng công nghệ đóng vai trò như một đòn bẩy thúc đẩy mạnh mẽ chứ không thể thay thế hoàn toàn cho sự tò mò và tính kỷ luật tự thân. Việc kết hợp phản hồi chuẩn xác từ AI với thói quen rèn luyện kiên trì mỗi ngày vẫn là chuẩn mực vàng để đạt được sự lưu loát thực chất.',
          keyVocabulary: [
            { term: 'Accelerate', ipa: '/əkˈsel.ə.reɪt/', meaning: 'Thúc đẩy, gia tăng tốc độ phát triển', contextHint: 'technology serves as a powerful accelerator' },
            { term: 'Retention', ipa: '/rɪˈten.ʃən/', meaning: 'Khả năng lưu giữ, duy trì trí nhớ', contextHint: 'maximize long-term retention' },
            { term: 'Optimal', ipa: '/ˈɑːp.tə.məl/', meaning: 'Tối ưu, lý tưởng nhất', contextHint: 'presenting challenges at optimal intervals' },
            { term: 'Fluency', ipa: '/ˈfluː.ən.si/', meaning: 'Sự trôi chảy, lưu loát trong ngôn ngữ', contextHint: 'achieving authentic language fluency' },
          ],
          comprehensionQuiz: {
            question: 'Theo bài viết, điều kiện then chốt nào kết hợp cùng AI để đạt được sự lưu loát ngôn ngữ thực chất?',
            options: [
              'Chỉ cần tải thật nhiều ứng dụng học tập đắt tiền',
              'Duy trì thói quen học tập kỷ luật và tính tự giác hàng ngày',
              'Ngưng hoàn toàn việc đọc sách và chỉ nghe thụ động',
              'Phụ thuộc tuyệt đối vào máy móc mà không cần nỗ lực cá nhân'
            ],
            correctIndex: 1,
            explanation: 'Đoạn cuối nhấn mạnh: "Pairing cutting-edge AI feedback with consistent daily routines remains the gold standard for achieving authentic language fluency".'
          }
        };
      } else {
        readingData = {
          title: userLevel === 'C1' || userLevel === 'B2' ? 'The Cognitive Architecture of Habit Formation' : 'Building Meaningful Habits in Modern Life',
          userLevel,
          topic,
          targetWordCount,
          genre: 'article',
          passage: 'Cultivating sustainable daily habits requires a structured blend of clear cue triggers, deliberate repetition, and meaningful internal rewards. Behavioral researchers have consistently observed that individuals who attempt drastic lifestyle transformations overnight frequently experience burnout, whereas those who commit to modest, incremental daily routines sustain long-term progress across months and years.\n\nWhen developing complex cognitive proficiencies—such as mastering a foreign language or acquiring programming skills—consistency dramatically outweighs occasional bursts of intense effort. Dedicating twenty focused minutes each morning to active recall and contextual reading stimulates neural plasticity far more effectively than an irregular weekend cram session. The cumulative compound effect of micro-progress gradually builds confidence and intuitive mastery.\n\nUltimately, sustainable self-improvement is not measured by dramatic heroic gestures, but by the quiet fidelity to positive routines that one chooses to practice day after day.',
          translationVi: 'Việc xây dựng những thói quen hàng ngày bền vững đòi hỏi sự kết hợp chặt chẽ giữa các tín hiệu kích hoạt rõ ràng, sự lặp lại có chủ đích và phần thưởng nội tại ý nghĩa. Các nhà nghiên cứu hành vi nhận thấy rằng những người cố gắng thay đổi lối sống chóng vánh chỉ sau một đêm thường nhanh chóng kiệt sức, trong khi những người cam kết với các thói quen nhỏ tích lũy hàng ngày lại duy trì được tiến bộ dài hạn qua nhiều tháng và nhiều năm.\n\nKhi rèn luyện các năng lực tư duy phức tạp—chẳng hạn như làm chủ một ngoại ngữ hay học kỹ năng lập trình—tính nhất quán vượt trội hơn rất nhiều so với những đợt nỗ lực dồn dập ngắt quãng. Việc dành ra 20 phút tập trung mỗi sáng để gợi nhớ chủ động và đọc hiểu ngữ cảnh kích thích sự dẻo dai của hệ thần kinh hiệu quả hơn nhiều so với việc nhồi nhét dồn dập vào cuối tuần. Hiệu ứng lãi kép của những bước tiến nhỏ sẽ dần kiến tạo nên sự tự tin và phản xạ nhạy bén.\n\nSau cùng, sự tiến bộ bền vững không được đo đếm bằng những hành động bộc phát hoành tráng, mà được khẳng định bởi sự kiên định bền bỉ với những thói quen tích cực được thực hành đều đặn mỗi ngày.',
          keyVocabulary: [
            { term: 'Cultivate', ipa: '/ˈkʌl.tə.veɪt/', meaning: 'Nuôi dưỡng, rèn luyện thói quen', contextHint: 'cultivating sustainable daily habits' },
            { term: 'Incremental', ipa: '/ˌɪŋ.krəˈmen.t̬əl/', meaning: 'Từng bước một, tăng dần dần', contextHint: 'modest, incremental daily routines' },
            { term: 'Consistency', ipa: '/kənˈsɪs.tən.si/', meaning: 'Tính kiên định, nhất quán liên tục', contextHint: 'consistency dramatically outweighs bursts' },
            { term: 'Cumulative', ipa: '/ˈkjuː.mjə.lə.t̬ɪv/', meaning: 'Tích lũy, dồn lại theo thời gian', contextHint: 'cumulative compound effect of progress' },
          ],
          comprehensionQuiz: {
            question: 'Theo đoạn văn, phương pháp nào mang lại hiệu quả cao hơn khi phát triển các kỹ năng phức tạp như học ngoại ngữ?',
            options: [
              'Chỉ nhồi nhét học nhiều giờ liền vào cuối tuần',
              'Dành một khoảng thời gian tập trung ngắn nhưng đều đặn mỗi ngày',
              'Thay đổi toàn bộ lối sống chóng vánh trong 24 giờ',
              'Học ngắt quãng không cần theo bất kỳ lịch trình nào'
            ],
            correctIndex: 1,
            explanation: 'Bài viết khẳng định: "Dedicating twenty focused minutes each morning to active recall stimulates neural plasticity far more effectively than an irregular weekend cram session".'
          }
        };
      }

      return {
        type: 'reading_lesson',
        data: readingData
      };
    }

    case 'listening_lesson': {
      const userLevel = (inputData.userLevel as 'A1' | 'A2' | 'B1' | 'B2') || 'A1';
      const topic = (inputData.topic as string) || 'Hội thoại giao tiếp & Đời sống';

      const isTravel = /du lịch|travel|sân bay|hotel|khách sạn|flight/i.test(topic);

      let listeningData: ListeningLessonResult;

      if (isTravel) {
        listeningData = {
          title: 'Asking for City Directions (Hỏi Đường Khám Phá)',
          userLevel,
          topic,
          situation: 'Hỏi đường đến quảng trường trung tâm thành phố',
          dialogue: [
            {
              speaker: 'Emma',
              text: 'Excuse me, could you tell me how to get to the central square from here?',
              translationVi: 'Xin lỗi, bạn có thể chỉ giúp tôi đường đến quảng trường trung tâm từ đây không?'
            },
            {
              speaker: 'Mark',
              text: 'Sure! Walk straight past the bookstore, then turn right at the traffic lights. It is about a five-minute walk.',
              translationVi: 'Chắc chắn rồi! Bạn đi thẳng qua hiệu sách, rồi rẽ phải ở cột đèn giao thông. Đi bộ khoảng năm phút là tới.'
            },
            {
              speaker: 'Emma',
              text: 'That sounds really easy. Thank you so much for your kindness!',
              translationVi: 'Nghe có vẻ rất dễ tìm. Cảm ơn bạn rất nhiều vì sự nhiệt tình!'
            }
          ],
          fullAudioScript: 'Excuse me, could you tell me how to get to the central square from here? Sure! Walk straight past the bookstore, then turn right at the traffic lights. It is about a five-minute walk. That sounds really easy. Thank you so much for your kindness!',
          keyPhrases: [
            { phrase: 'How to get to...', ipa: '/haʊ tuː ɡet tuː/', meaning: 'Cách đi đến... ở đâu' },
            { phrase: 'Walk straight past...', ipa: '/wɑːk streɪt pæst/', meaning: 'Đi thẳng qua một địa điểm' },
            { phrase: 'A five-minute walk', ipa: '/ə faɪv ˈmɪn.ɪt wɑːk/', meaning: 'Đi bộ khoảng 5 phút' }
          ],
          listeningQuiz: {
            audioPrompt: 'Walk straight past the bookstore, then turn right at the traffic lights.',
            question: 'Người hướng dẫn bảo rẽ ở vị trí nào?',
            options: [
              'Rẽ phải ngay tại cột đèn giao thông',
              'Rẽ trái trước cửa hiệu sách',
              'Đi ngược lại trạm xe buýt',
              'Đi thang máy lên tầng 2'
            ],
            correctIndex: 0,
            explanation: 'Người hướng dẫn nói: "turn right at the traffic lights" (rẽ phải ở cột đèn giao thông).'
          }
        };
      } else {
        listeningData = {
          title: 'Catching Up with a Friend at a Cafe (Gặp Gỡ Bạn Bè)',
          userLevel,
          topic,
          situation: 'Hẹn bạn uống cà phê cuối tuần và bàn kế hoạch',
          dialogue: [
            {
              speaker: 'Sophia',
              text: 'Hi Liam! Long time no see. How have you been lately?',
              translationVi: 'Chào Liam! Lâu quá không gặp. Dạo này cậu thế nào rồi?'
            },
            {
              speaker: 'Liam',
              text: 'Hey Sophia! I have been great. I just started learning photography on weekends. It is so fun!',
              translationVi: 'Chào Sophia! Mình khỏe lắm. Mình vừa mới bắt đầu học nhiếp ảnh vào cuối tuần. Vui cực kỳ luôn!'
            },
            {
              speaker: 'Sophia',
              text: 'That sounds amazing! You should definitely show me some of your photos today.',
              translationVi: 'Nghe tuyệt quá! Hôm nay cậu nhất định phải cho mình xem vài tấm ảnh nhé.'
            }
          ],
          fullAudioScript: 'Hi Liam! Long time no see. How have you been lately? Hey Sophia! I have been great. I just started learning photography on weekends. It is so fun! That sounds amazing! You should definitely show me some of your photos today.',
          keyPhrases: [
            { phrase: 'Long time no see', ipa: '/lɑːŋ taɪm noʊ siː/', meaning: 'Lâu rồi không gặp' },
            { phrase: 'How have you been lately?', ipa: '/haʊ hæv juː bɪn ˈleɪt.li/', meaning: 'Dạo gần đây bạn thế nào?' },
            { phrase: 'You should definitely...', ipa: '/juː ʃʊd ˈdef.ən.ət.li/', meaning: 'Bạn nhất định nên...' }
          ],
          listeningQuiz: {
            audioPrompt: 'I just started learning photography on weekends. It is so fun!',
            question: 'Liam vừa bắt đầu học môn gì vào cuối tuần?',
            options: [
              'Học nấu ăn món Ý',
              'Học nhiếp ảnh (chụp ảnh)',
              'Học lập trình web',
              'Học chơi đàn guitar'
            ],
            correctIndex: 1,
            explanation: 'Liam nói rõ trong đoạn thoại: "I just started learning photography on weekends".'
          }
        };
      }

      return {
        type: 'listening_lesson',
        data: listeningData
      };
    }
  }
}
