import { TaskType, TaskResult, WritingResult, VocabResult, RoleplayResult, QuizResult } from '../src/types';

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

      const roleplayData: RoleplayResult = {
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

      return { type: 'roleplay', data: roleplayData };
    }

    case 'quiz': {
      const topic = (inputData.topic as string) || 'Conditionals & Hypothetical Situations';
      const difficulty = (inputData.difficulty as string) || 'Upper-Intermediate (B2)';

      const quizData: QuizResult = {
        topic,
        difficulty,
        questions: [
          {
            id: 1,
            question: 'Had the weather conditions _______ so volatile, the harbor authorities would not have suspended the ferry services.',
            options: [
              'not been',
              'not were',
              'had not been',
              'haven’t been',
            ],
            correctAnswerIndex: 0,
            explanation: 'This is an inverted Third Conditional expressing an unreal past condition. The standard form "If the weather had not been..." becomes "Had the weather not been..." via subject-auxiliary inversion. "Had not been" is incorrect because "Had" has already been placed before the subject.',
            grammarRule: 'Third Conditional Inversion with Negative Adverbial',
          },
          {
            id: 2,
            question: 'Were the company _______ its current expansion strategy, substantial venture capital would be required immediately.',
            options: [
              'pursues',
              'to pursue',
              'pursued',
              'has pursued',
            ],
            correctAnswerIndex: 1,
            explanation: 'In Second Conditional inversion (referring to hypothetical present/future), "If the company pursued..." is formally inverted into "Were + subject + to-infinitive": "Were the company to pursue...".',
            grammarRule: 'Formal Inversion of Second Conditional with "Were + to-infinitive"',
          },
          {
            id: 3,
            question: 'Should any unexpected discrepancies _______ during the audit, please inform the financial controller without delay.',
            options: [
              'arise',
              'arises',
              'arose',
              'will arise',
            ],
            correctAnswerIndex: 0,
            explanation: 'Inverted First Conditional with "Should" replaces "If any unexpected discrepancies should arise". After the modal auxiliary "Should", the verb must remain in its bare infinitive form ("arise").',
            grammarRule: 'First Conditional Inversion with Modal "Should"',
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
          },
          {
            id: 5,
            question: 'Provided that all safety protocols _______ adhered to, the plant will resume full operations on Monday.',
            options: [
              'are strictly',
              'will be strictly',
              'were strictly',
              'would be strictly',
            ],
            correctAnswerIndex: 0,
            explanation: '"Provided that" acts as a conditional conjunction equivalent to "if/on condition that". In present-future conditionals, the conditional clause takes the present simple ("are strictly adhered to"), not the future tense.',
            grammarRule: 'Conditional Conjunctions ("Provided that / As long as")',
          },
        ],
      };

      return { type: 'quiz', data: quizData };
    }
  }
}
