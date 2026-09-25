import { DialogueDifficulty } from '../src/types';

export interface TargetWord {
  word: string;
  contextSentence: string;
  meaningVi: string;
  ipa?: string;
}

export interface GeneratedPassage {
  id: string;
  title: string;
  topic: string;
  topicCategory: string;
  difficulty: DialogueDifficulty;
  genre: string;
  passage: string;
  translationVi: string;
  sentenceTranslations: string[];
  targetWords: TargetWord[];
  generatedBy?: string;
}

export const TOPIC_OPTIONS = [
  { id: 'tech', label: 'Công Nghệ & AI', icon: '💻' },
  { id: 'business', label: 'Kinh Doanh & Khởi Nghiệp', icon: '💼' },
  { id: 'daily', label: 'Đời Sống & Thói Quen', icon: '☕' },
  { id: 'psychology', label: 'Tâm Lý & Phát Triển', icon: '🧠' },
  { id: 'nature', label: 'Môi Trường & Đô Thị', icon: '🌿' },
  { id: 'travel', label: 'Du Lịch & Văn Hóa', icon: '✈️' },
  { id: 'food', label: 'Ẩm Thực & Sức Khỏe', icon: '🍜' },
  { id: 'science', label: 'Khoa Học & Tương Lai', icon: '🔬' },
  { id: 'arts', label: 'Nghệ Thuật & Sáng Tạo', icon: '🎨' },
] as const;

export const PASSAGE_CATALOG: GeneratedPassage[] = [
  // ==========================================
  // LEVEL A1: Simple syntax, high frequency vocabulary (100 - 130 words)
  // ==========================================
  {
    id: 'a1_daily_routine',
    title: 'A Peaceful Morning in My Neighborhood',
    topic: 'Đời Sống & Thói Quen',
    topicCategory: 'daily',
    difficulty: 'A1',
    genre: 'Daily Story',
    passage: `Every morning at six o'clock, the sun rises over my quiet neighborhood. Birds sing sweet songs in the tall green trees, and the cool morning air feels very fresh.

My neighbor Mr. Green walks his little white dog down the sidewalk. He always smiles, waves his hand, and says good morning to everyone he meets. At the street corner, a friendly baker opens his shop and sells warm, delicious bread.

I enjoy sitting near my bedroom window with a warm cup of sweet tea. Watching the neighborhood wake up brings me calm and positive energy for a busy new day.`,
    translationVi: `Mỗi sáng vào lúc sáu giờ, mặt trời lại mọc trên khu phố yên tĩnh của tôi. Những chú chim cất tiếng hót líu lo trên những hàng cây xanh rợp bóng, và bầu không khí sớm mai mát rượi đem lại cảm giác thật trong lành.

Bác hàng xóm Green dắt chú chó trắng nhỏ nhắn đi dạo dọc theo vỉa hè. Bác luôn mỉm cười, vẫy tay và gửi lời chào buổi sáng thân thiện tới bất cứ ai bác gặp. Ở góc phố, người thợ làm bánh tốt bụng mở cửa tiệm và bày bán những ổ bánh mì nóng hổi, thơm ngon.

Tôi thích ngồi bên khung cửa sổ phòng ngủ với một tách trà ngọt ấm áp. Ngắm nhìn khu phố dần thức giấc mang lại cho tôi sự bình yên và năng lượng tích cực cho một ngày mới bận rộn.`,
    sentenceTranslations: [
      "Mỗi sáng vào lúc sáu giờ, mặt trời lại mọc trên khu phố yên tĩnh của tôi.",
      "Những chú chim cất tiếng hót líu lo trên những hàng cây xanh rợp bóng, và bầu không khí sớm mai mát rượi đem lại cảm giác thật trong lành.",
      "Bác hàng xóm Green dắt chú chó trắng nhỏ nhắn đi dạo dọc theo vỉa hè.",
      "Bác luôn mỉm cười, vẫy tay và gửi lời chào buổi sáng thân thiện tới bất cứ ai bác gặp.",
      "Ở góc phố, người thợ làm bánh tốt bụng mở cửa tiệm và bày bán những ổ bánh mì nóng hổi, thơm ngon.",
      "Tôi thích ngồi bên khung cửa sổ phòng ngủ với một tách trà ngọt ấm áp.",
      "Ngắm nhìn khu phố dần thức giấc mang lại cho tôi sự bình yên và năng lượng tích cực cho một ngày mới bận rộn.",
    ],
    targetWords: [
      { word: 'peaceful', contextSentence: 'A Peaceful Morning in My Neighborhood.', meaningVi: 'yên bình, thanh bình', ipa: '/ˈpiːsfl/' },
      { word: 'fresh', contextSentence: 'The cool morning air feels very fresh.', meaningVi: 'trong lành, tươi mới', ipa: '/freʃ/' },
      { word: 'sidewalk', contextSentence: 'He walks his little white dog down the sidewalk.', meaningVi: 'vỉa hè, lề đường', ipa: '/ˈsaɪdwɔːk/' },
      { word: 'delicious', contextSentence: 'He sells warm, delicious bread.', meaningVi: 'thơm ngon, ngon miệng', ipa: '/dɪˈlɪʃəs/' },
      { word: 'positive', contextSentence: 'Watching the neighborhood wake up brings me calm and positive energy.', meaningVi: 'tích cực, lạc quan', ipa: '/ˈpɒzətɪv/' },
    ],
  },
  {
    id: 'a1_food_breakfast',
    title: 'Cooking a Simple Breakfast at Home',
    topic: 'Ẩm Thực & Sức Khỏe',
    topicCategory: 'food',
    difficulty: 'A1',
    genre: 'Personal Essay',
    passage: `Cooking breakfast at home is one of my favorite habits. Every Sunday morning, my sister and I wake up early to prepare a healthy meal together in our sunny kitchen.

We chop ripe red tomatoes, fry fresh organic eggs in olive oil, and toast two slices of brown bread. My sister also blends sweet bananas and cold milk to make fruit smoothies.

Sitting together around the clean wooden dining table feels very cozy. Eating nutritious food made with love gives our family strength and joy for the entire day.`,
    translationVi: `Tự nấu bữa sáng tại nhà là một trong những thói quen yêu thích nhất của tôi. Mỗi sáng Chủ nhật, hai chị em tôi lại dậy sớm để cùng nhau chuẩn bị một bữa ăn lành mạnh trong căn bếp ngập tràn ánh nắng.

Chúng tôi thái những quả cà chua đỏ mọng, chiên trứng gà tươi với dầu ô liu và nướng giòn hai lát bánh mì nâu. Em gái tôi còn xay chuối chín ngọt với sữa tươi mát lạnh để làm món sinh tố hoa quả.

Ngồi quây quần bên chiếc bàn ăn bằng gỗ sạch sẽ mang lại cảm giác vô cùng ấm cúng. Thưởng thức những món ăn bổ dưỡng được nấu bằng tình yêu thương tiếp thêm cho gia đình chúng tôi sức khỏe và niềm vui suốt cả ngày.`,
    sentenceTranslations: [
      "Tự nấu bữa sáng tại nhà là một trong những thói quen yêu thích nhất của tôi.",
      "Mỗi sáng Chủ nhật, hai chị em tôi lại dậy sớm để cùng nhau chuẩn bị một bữa ăn lành mạnh trong căn bếp ngập tràn ánh nắng.",
      "Chúng tôi thái những quả cà chua đỏ mọng, chiên trứng gà tươi với dầu ô liu và nướng giòn hai lát bánh mì nâu.",
      "Em gái tôi còn xay chuối chín ngọt với sữa tươi mát lạnh để làm món sinh tố hoa quả.",
      "Ngồi quây quần bên chiếc bàn ăn bằng gỗ sạch sẽ mang lại cảm giác vô cùng ấm cúng.",
      "Thưởng thức những món ăn bổ dưỡng được nấu bằng tình yêu thương tiếp thêm cho gia đình chúng tôi sức khỏe và niềm vui suốt cả ngày.",
    ],
    targetWords: [
      { word: 'prepare', contextSentence: 'We wake up early to prepare a healthy meal together.', meaningVi: 'chuẩn bị, nấu nướng', ipa: '/prɪˈpeə(r)/' },
      { word: 'organic', contextSentence: 'Fry fresh organic eggs in olive oil.', meaningVi: 'hữu cơ, tự nhiên', ipa: '/ɔːˈɡænɪk/' },
      { word: 'cozy', contextSentence: 'Sitting together around the dining table feels very cozy.', meaningVi: 'ấm cúng, dễ chịu', ipa: '/ˈkəʊzi/' },
      { word: 'nutritious', contextSentence: 'Eating nutritious food made with love gives our family strength.', meaningVi: 'bổ dưỡng, giàu dinh dưỡng', ipa: '/njuːˈtrɪʃəs/' },
    ],
  },

  // ==========================================
  // LEVEL A2: Practical phrases, clear narratives (150 - 190 words)
  // ==========================================
  {
    id: 'a2_weekend_market',
    title: 'A Sunday Morning at the Green Farmer Market',
    topic: 'Đời Sống Thường Ngày',
    topicCategory: 'daily',
    difficulty: 'A2',
    genre: 'Daily Life',
    passage: `Every Sunday morning, the town square comes alive with the lively local farmer market. Colorful stalls are lined with fresh organic vegetables, sweet ripe strawberries, and jars of golden wildflower honey.

Local farmers greet customers with warm smiles and gladly offer fruit samples. Many families bring their children and dogs to enjoy the friendly atmosphere, while a local guitarist plays cheerful acoustic songs near the fountain.

Buying directly from local growers helps our community stay healthy and protects the environment. It is a simple weekend activity that brings neighbors closer together.`,
    translationVi: `Mỗi sáng Chủ nhật, quảng trường thị trấn lại bừng lên sức sống với khu chợ nông sản địa phương nhộn nhịp. Những gian hàng rực rỡ sắc màu bày bán đầy ắp rau củ hữu cơ tươi xanh, những quả dâu tây chín mọng ngọt ngào và các hũ mật ong hoa rừng vàng óng.

Những người nông dân niềm nở chào đón khách hàng với nụ cười ấm áp và vui vẻ mời khách nếm thử trái cây. Nhiều gia đình đưa con nhỏ và thú cưng tới tận hưởng bầu không khí thân thiện, trong khi một nghệ sĩ ghita địa phương dạo những giai điệu mộc mạc vui tươi cạnh đài phun nước.

Việc mua sắm trực tiếp từ những người trồng trọt địa phương vừa giúp cộng đồng giữ gìn lối sống lành mạnh, vừa góp phần bảo vệ môi trường. Đó là một hoạt động cuối tuần giản dị giúp gắn kết những người hàng xóm lại gần nhau hơn.`,
    sentenceTranslations: [
      "Mỗi sáng Chủ nhật, quảng trường thị trấn lại bừng lên sức sống với khu chợ nông sản địa phương nhộn nhịp.",
      "Những gian hàng rực rỡ sắc màu bày bán đầy ắp rau củ hữu cơ tươi xanh, những quả dâu tây chín mọng ngọt ngào và các hũ mật ong hoa rừng vàng óng.",
      "Những người nông dân niềm nở chào đón khách hàng với nụ cười ấm áp và vui vẻ mời khách nếm thử trái cây.",
      "Nhiều gia đình đưa con nhỏ và thú cưng tới tận hưởng bầu không khí thân thiện, trong khi một nghệ sĩ ghita địa phương dạo những giai điệu mộc mạc vui tươi cạnh đài phun nước.",
      "Việc mua sắm trực tiếp từ những người trồng trọt địa phương vừa giúp cộng đồng giữ gìn lối sống lành mạnh, vừa góp phần bảo vệ môi trường.",
      "Đó là một hoạt động cuối tuần giản dị giúp gắn kết những người hàng xóm lại gần nhau hơn.",
    ],
    targetWords: [
      { word: 'lively', contextSentence: 'The town square comes alive with the lively local farmer market.', meaningVi: 'sống động, nhộn nhịp', ipa: '/ˈlaɪvli/' },
      { word: 'samples', contextSentence: 'Farmers greet customers and gladly offer fruit samples.', meaningVi: 'mẫu thử, đồ ăn thử', ipa: '/ˈsɑːmplz/' },
      { word: 'atmosphere', contextSentence: 'Families bring their children to enjoy the friendly atmosphere.', meaningVi: 'bầu không khí', ipa: '/ˈætməsfɪə(r)/' },
      { word: 'growers', contextSentence: 'Buying directly from local growers helps our community stay healthy.', meaningVi: 'người trồng trọt, nhà vườn', ipa: '/ˈɡrəʊəz/' },
      { word: 'community', contextSentence: 'Buying directly helps our community stay healthy.', meaningVi: 'cộng đồng, khu dân cư', ipa: '/kəˈmjuːnəti/' },
    ],
  },
  {
    id: 'a2_watercolor_hobby',
    title: 'Discovering the Joy of Watercolor Painting',
    topic: 'Nghệ Thuật & Sáng Tạo',
    topicCategory: 'arts',
    difficulty: 'A2',
    genre: 'Creative Life',
    passage: `Last month, Emma decided to start a creative new hobby: watercolor painting. She bought a basic paint set, three soft brushes, and heavy textured paper from a local craft shop.

At first, controlling the water and blending pigments seemed challenging. However, after practicing for thirty minutes every evening, Emma learned to create gentle sunset skies and colorful flower petals.

Painting gives her a calm space to unwind after busy school days. She realized that creative hobbies do not require perfection, only patience and curiosity.`,
    translationVi: `Tháng trước, Emma quyết định bắt đầu một sở thích sáng tạo mới: vẽ tranh màu nước. Cô ấy mua một bộ màu cơ bản, ba cây cọ lông mềm cùng loại giấy nhám vân dày chuyên dụng tại một cửa hàng mỹ thuật địa phương.

Ban đầu, việc kiểm soát lượng nước và hòa trộn các sắc tố màu có vẻ khá khó khăn. Tuy nhiên, sau khi kiên trì luyện tập ba mươi phút mỗi buổi tối, Emma đã học được cách tạo nên những dải mây hoàng hôn dịu dàng và những cánh hoa rực rỡ sắc hương.

Hội họa mang lại cho cô một không gian bình lặng để thư giãn sau những giờ học bận rộn trên lớp. Cô nhận ra rằng các bộ môn nghệ thuật sáng tạo không đòi hỏi sự hoàn hảo tuyệt đối, mà chỉ cần lòng kiên nhẫn và niềm say mê khám phá.`,
    sentenceTranslations: [
      "Tháng trước, Emma quyết định bắt đầu một sở thích sáng tạo mới: vẽ tranh màu nước.",
      "Cô ấy mua một bộ màu cơ bản, ba cây cọ lông mềm cùng loại giấy nhám vân dày chuyên dụng tại một cửa hàng mỹ thuật địa phương.",
      "Ban đầu, việc kiểm soát lượng nước và hòa trộn các sắc tố màu có vẻ khá khó khăn.",
      "Tuy nhiên, sau khi kiên trì luyện tập ba mươi phút mỗi buổi tối, Emma đã học được cách tạo nên những dải mây hoàng hôn dịu dàng và những cánh hoa rực rỡ sắc hương.",
      "Hội họa mang lại cho cô một không gian bình lặng để thư giãn sau những giờ học bận rộn trên lớp.",
      "Cô nhận ra rằng các bộ môn nghệ thuật sáng tạo không đòi hỏi sự hoàn hảo tuyệt đối, mà chỉ cần lòng kiên nhẫn và niềm say mê khám phá.",
    ],
    targetWords: [
      { word: 'textured', contextSentence: 'She bought soft brushes and heavy textured paper from a craft shop.', meaningVi: 'có vân bề mặt, nhám vân', ipa: '/ˈtekstʃəd/' },
      { word: 'blending', contextSentence: 'Controlling the water and blending pigments seemed challenging.', meaningVi: 'hòa trộn, pha màu', ipa: '/ˈblendɪŋ/' },
      { word: 'petals', contextSentence: 'Emma learned to create gentle sunset skies and colorful flower petals.', meaningVi: 'cánh hoa', ipa: '/ˈpetlz/' },
      { word: 'unwind', contextSentence: 'Painting gives her a calm space to unwind after busy days.', meaningVi: 'thư giãn, xả hơi', ipa: '/ˌʌnˈwaɪnd/' },
      { word: 'curiosity', contextSentence: 'Creative hobbies do not require perfection, only patience and curiosity.', meaningVi: 'sự tò mò, lòng say mê khám phá', ipa: '/ˌkjʊəriˈɒsəti/' },
    ],
  },
  {
    id: 'a2_tech_learning',
    title: 'How Mobile Apps Help Us Learn Languages Daily',
    topic: 'Công Nghệ & AI',
    topicCategory: 'tech',
    difficulty: 'A2',
    genre: 'Article',
    passage: `Smartphones have completely changed how students practice foreign languages. Instead of carrying heavy grammar books, learners can now practice vocabulary anytime on modern mobile apps.

These smart applications send friendly daily reminders to help users build a steady learning habit. Short interactive quizzes and voice pronunciation tools make studying feel like a fun game rather than a stressful chore.

By dedicating just fifteen minutes every morning on their commute, millions of people around the world are gradually gaining communicative confidence.`,
    translationVi: `Điện thoại thông minh đã thay đổi hoàn toàn cách học sinh luyện tập ngoại ngữ. Thay vì phải mang theo những cuốn sách ngữ pháp dày cộp, người học giờ đây có thể ôn luyện từ vựng mọi lúc mọi nơi trên các ứng dụng di động hiện đại.

Các ứng dụng thông minh này gửi những lời nhắc nhở thân thiện mỗi ngày để giúp người dùng xây dựng thói quen học tập đều đặn. Những câu đố tương tác ngắn và công cụ phát âm giọng nói giúp việc học trở nên giống như một trò chơi thú vị thay vì một nghĩa vụ áp lực.

Bằng cách chỉ dành ra mười lăm phút mỗi sáng trong lúc di chuyển, hàng triệu người trên khắp thế giới đang dần xây dựng sự tự tin trong giao tiếp.`,
    sentenceTranslations: [
      "Điện thoại thông minh đã thay đổi hoàn toàn cách học sinh luyện tập ngoại ngữ.",
      "Thay vì phải mang theo những cuốn sách ngữ pháp dày cộp, người học giờ đây có thể ôn luyện từ vựng mọi lúc mọi nơi trên các ứng dụng di động hiện đại.",
      "Các ứng dụng thông minh này gửi những lời nhắc nhở thân thiện mỗi ngày để giúp người dùng xây dựng thói quen học tập đều đặn.",
      "Những câu đố tương tác ngắn và công cụ phát âm giọng nói giúp việc học trở nên giống như một trò chơi thú vị thay vì một nghĩa vụ áp lực.",
      "Bằng cách chỉ dành ra mười lăm phút mỗi sáng trong lúc di chuyển, hàng triệu người trên khắp thế giới đang dần xây dựng sự tự tin trong giao tiếp.",
    ],
    targetWords: [
      { word: 'reminders', contextSentence: 'These smart applications send friendly daily reminders.', meaningVi: 'lời nhắc nhở', ipa: '/rɪˈmaɪndəz/' },
      { word: 'steady', contextSentence: 'Help users build a steady learning habit.', meaningVi: 'đều đặn, vững chắc', ipa: '/ˈstedi/' },
      { word: 'stressful', contextSentence: 'Make studying feel fun rather than a stressful chore.', meaningVi: 'căng thẳng, gây áp lực', ipa: '/ˈstresfl/' },
      { word: 'commute', contextSentence: 'Dedicating just fifteen minutes every morning on their commute.', meaningVi: 'quãng đường đi làm / đi học hàng ngày', ipa: '/kəˈmjuːt/' },
      { word: 'confidence', contextSentence: 'Millions of people are gradually gaining communicative confidence.', meaningVi: 'sự tự tin', ipa: '/ˈkɒnfɪdəns/' },
    ],
  },

  // ==========================================
  // LEVEL B1: Narrative, compound-complex clauses, transitional flow (220 - 280 words)
  // ==========================================
  {
    id: 'b1_cafe_culture',
    title: 'The Art of Mindful Mornings at Local Cafes',
    topic: 'Đời Sống & Thói Quen',
    topicCategory: 'daily',
    difficulty: 'B1',
    genre: 'Story',
    passage: `Every Saturday morning, Liam visits a cozy neighborhood cafe nestled near the central park. The inviting aroma of freshly ground Arabica coffee and warm sourdough pastries fills the sunlit room as gentle acoustic music plays in the background.

He usually orders a golden butter croissant and an iced oat milk latte, then settles into a quiet corner table by the window. For the next hour, Liam intentionally disconnects his smartphone and sets aside his bustling work schedule. Instead, he immerses himself in a captivating travel novel, occasionally pausing to observe local residents walking their dogs along the quiet avenue.

This deliberate pause has evolved into an indispensable personal ritual. Liam believes that in an increasingly hurried world dominated by continuous screen time, taking thirty to sixty minutes for unhurried reflection is essential to rejuvenate both mental focus and emotional well-being before meeting friends for weekend activities.`,
    translationVi: `Mỗi sáng thứ Bảy, Liam lại ghé một quán cà phê ấm cúng nằm nép mình bên cạnh công viên trung tâm. Hương thơm quyến rũ của hạt cà phê Arabica mới xay cùng những mẻ bánh nướng nóng hổi lan tỏa khắp căn phòng ngập nắng trong điệu nhạc mộc êm dịu.

Anh thường gọi một chiếc bánh sừng bò bơ vàng ruộm cùng một ly latte sữa yến mạch đá, rồi ngồi vào chiếc bàn gỗ yên tĩnh cạnh cửa sổ. Trong một tiếng tiếp theo, Liam chủ động tắt thông báo điện thoại và gác lại lịch trình bận rộn. Thay vào đó, anh đắm chìm vào cuốn tiểu thuyết du lịch lôi cuốn, thi thoảng dừng lại ngắm nhìn cư dân địa phương dắt thú cưng đi dạo dọc theo đại lộ rợp bóng cây.

Khoảng lặng có chủ đích này đã trở thành một nghi thức cá nhân không thể thiếu. Liam tin rằng giữa một thế giới ngày càng vội vã và tràn ngập màn hình điện tử, việc dành ra 30 đến 60 phút để suy ngẫm thư thái là điều thiết yếu để tái tạo sự tập trung cũng như năng lượng tinh thần trước khi bước vào các hoạt động cuối tuần.`,
    sentenceTranslations: [
      "Mỗi sáng thứ Bảy, Liam lại ghé một quán cà phê ấm cúng nằm nép mình bên cạnh công viên trung tâm.",
      "Hương thơm quyến rũ của hạt cà phê Arabica mới xay cùng những mẻ bánh nướng nóng hổi lan tỏa khắp căn phòng ngập nắng trong điệu nhạc mộc êm dịu.",
      "Anh thường gọi một chiếc bánh sừng bò bơ vàng ruộm cùng một ly latte sữa yến mạch đá, rồi ngồi vào chiếc bàn gỗ yên tĩnh cạnh cửa sổ.",
      "Trong một tiếng tiếp theo, Liam chủ động tắt thông báo điện thoại và gác lại lịch trình bận rộn.",
      "Thay vào đó, anh đắm chìm vào cuốn tiểu thuyết du lịch lôi cuốn, thi thoảng dừng lại ngắm nhìn cư dân địa phương dắt thú cưng đi dạo dọc theo đại lộ rợp bóng cây.",
      "Khoảng lặng có chủ đích này đã trở thành một nghi thức cá nhân không thể thiếu.",
      "Liam tin rằng giữa một thế giới ngày càng vội vã và tràn ngập màn hình điện tử, việc dành ra 30 đến 60 phút để suy ngẫm thư thái là điều thiết yếu để tái tạo sự tập trung cũng như năng lượng tinh thần trước khi bước vào các hoạt động cuối tuần.",
    ],
    targetWords: [
      { word: 'nestled', contextSentence: 'Liam visits a cozy neighborhood cafe nestled near the central park.', meaningVi: 'nằm nép mình bình yên', ipa: '/ˈnesld/' },
      { word: 'intentionally', contextSentence: 'Liam intentionally disconnects his smartphone.', meaningVi: 'có chủ đích, chủ tâm', ipa: '/ɪnˈtenʃənəli/' },
      { word: 'captivating', contextSentence: 'He immerses himself in a captivating travel novel.', meaningVi: 'lôi cuốn, hấp dẫn mê hoặc', ipa: '/ˈkæptɪveɪtɪŋ/' },
      { word: 'indispensable', contextSentence: 'This deliberate pause has evolved into an indispensable personal ritual.', meaningVi: 'không thể thiếu, thiết yếu', ipa: '/ˌɪndɪˈspensəbl/' },
      { word: 'rejuvenate', contextSentence: 'Essential to rejuvenate both mental focus and emotional well-being.', meaningVi: 'tái tạo năng lượng, làm tươi mới lại', ipa: '/rɪˈdʒuːvəneɪt/' },
    ],
  },
  {
    id: 'b1_eco_travel',
    title: 'Sustainable Travel and Preserving Cultural Heritage',
    topic: 'Du Lịch & Văn Hóa',
    topicCategory: 'travel',
    difficulty: 'B1',
    genre: 'Travel Essay',
    passage: `Over the past decade, international tourism has expanded at an unprecedented pace. While exploring distant cultures brings tremendous excitement, popular destinations often suffer from overcrowding, plastic pollution, and escalating living costs for local residents.

In response, mindful wanderers are embracing sustainable travel. Instead of flocking to packed tourist landmarks, they choose off-the-beaten-path villages, stay at eco-friendly family homestays, and dine at community-run eateries that support local farmers.

Traveling responsibly means leaving a destination richer and more vibrant than when you arrived. Small conscious decisions empower communities while preserving pristine landscapes for future generations.`,
    translationVi: `Trong suốt thập kỷ qua, ngành du lịch quốc tế đã mở rộng với một tốc độ chưa từng có. Mặc dù việc khám phá những nền văn hóa xa xôi đem lại sự hào hứng to lớn, nhưng các điểm đến nổi tiếng lại thường xuyên phải gánh chịu tình trạng quá tải du khách, ô nhiễm rác thải nhựa và chi phí sinh hoạt leo thang đối với người dân bản địa.

Trước thực trạng đó, những người lữ hành có ý thức đang tích cực đón nhận xu hướng du lịch bền vững. Thay vì đổ xô đến những danh lam thắng cảnh đông nghẹt, họ lựa chọn những ngôi làng nguyên sơ ít người biết tới, nghỉ chân tại các homestay gia đình thân thiện với môi trường, và dùng bữa tại những quán ăn do cộng đồng địa phương quản lý để ủng hộ các nông hộ.

Du lịch một cách có trách nhiệm đồng nghĩa với việc để lại cho điểm đến sự giàu đẹp và tràn đầy sức sống hơn cả lúc bạn mới đặt chân tới. Những quyết định nhỏ nhưng có ý thức sẽ tiếp thêm sức mạnh cho cộng đồng, đồng thời gìn giữ những cảnh quan nguyên sơ cho các thế hệ tương lai.`,
    sentenceTranslations: [
      "Trong suốt thập kỷ qua, ngành du lịch quốc tế đã mở rộng với một tốc độ chưa từng có.",
      "Mặc dù việc khám phá những nền văn hóa xa xôi đem lại sự hào hứng to lớn, nhưng các điểm đến nổi tiếng lại thường xuyên phải gánh chịu tình trạng quá tải du khách, ô nhiễm rác thải nhựa và chi phí sinh hoạt leo thang đối với người dân bản địa.",
      "Trước thực trạng đó, những người lữ hành có ý thức đang tích cực đón nhận xu hướng du lịch bền vững.",
      "Thay vì đổ xô đến những danh lam thắng cảnh đông nghẹt, họ lựa chọn những ngôi làng nguyên sơ ít người biết tới, nghỉ chân tại các homestay gia đình thân thiện với môi trường, và dùng bữa tại những quán ăn do cộng đồng địa phương quản lý để ủng hộ các nông hộ.",
      "Du lịch một cách có trách nhiệm đồng nghĩa với việc để lại cho điểm đến sự giàu đẹp và tràn đầy sức sống hơn cả lúc bạn mới đặt chân tới.",
      "Những quyết định nhỏ nhưng có ý thức sẽ tiếp thêm sức mạnh cho cộng đồng, đồng thời gìn giữ những cảnh quan nguyên sơ cho các thế hệ tương lai.",
    ],
    targetWords: [
      { word: 'unprecedented', contextSentence: 'International tourism has expanded at an unprecedented pace.', meaningVi: 'chưa từng có tiền lệ', ipa: '/ʌnˈpresɪdentɪd/' },
      { word: 'flocking', contextSentence: 'Instead of flocking to packed tourist landmarks.', meaningVi: 'đổ xô, kéo thành bầy', ipa: '/ˈflɒkɪŋ/' },
      { word: 'eateries', contextSentence: 'Dine at community-run eateries that support local farmers.', meaningVi: 'quán ăn, tiệm ăn uống', ipa: '/ˈiːtəriz/' },
      { word: 'responsibly', contextSentence: 'Traveling responsibly means leaving a destination richer.', meaningVi: 'một cách có trách nhiệm', ipa: '/rɪˈspɒnsəbli/' },
      { word: 'pristine', contextSentence: 'Preserving pristine landscapes for future generations.', meaningVi: 'nguyên sơ, thuần khiết', ipa: '/ˈprɪstiːn/' },
    ],
  },
  {
    id: 'b1_remote_work',
    title: 'Remote Collaboration and the Modern Workplace',
    topic: 'Kinh Doanh & Khởi Nghiệp',
    topicCategory: 'business',
    difficulty: 'B1',
    genre: 'Business Article',
    passage: `The widespread adoption of remote employment has revolutionized contemporary corporate culture. Flexible schedules allow professionals to design personalized daily workflows, eliminating tedious hours spent in congested morning traffic.

However, remote collaboration also introduces unexpected hurdles. Without casual hallway conversations, team members must rely heavily on asynchronous messaging and video conferences, which can occasionally induce digital fatigue and feelings of isolation.

To maintain organizational cohesion, progressive companies prioritize transparent documentation, clear working boundaries, and deliberate virtual social gatherings. Balancing professional autonomy with meaningful team communication is the secret to thriving in the distributed workplace.`,
    translationVi: `Việc áp dụng rộng rãi hình thức làm việc từ xa đã tạo nên cuộc cách mạng trong văn hóa doanh nghiệp đương đại. Thời gian biểu linh hoạt cho phép các chuyên gia tự thiết kế quy trình làm việc phù hợp cho riêng mình, xóa bỏ những giờ phút mệt mỏi chôn chân giữa dòng xe tắc nghẽn mỗi buổi sáng.

Tuy nhiên, làm việc cộng tác từ xa cũng mang đến những rào cản bất ngờ. Khi thiếu vắng những cuộc trò chuyện ngẫu hứng nơi hành lang, các thành viên trong nhóm phải phụ thuộc nhiều vào tin nhắn bất đồng bộ và các buổi họp trực tuyến qua video, điều đôi khi gây nên sự kiệt sức vì thiết bị số và cảm giác cô lập.

Để duy trì sự gắn kết nội bộ, các doanh nghiệp tiến bộ luôn ưu tiên việc ghi chép tài liệu minh bạch, phân định ranh giới công việc rõ ràng và chủ động tổ chức những buổi giao lưu trực tuyến ấm áp. Biết cân bằng giữa quyền tự chủ cá nhân và sự giao tiếp ý nghĩa cùng tập thể chính là chìa khóa để gặt hái thành công trong môi trường làm việc phân tán.`,
    sentenceTranslations: [
      "Việc áp dụng rộng rãi hình thức làm việc từ xa đã tạo nên cuộc cách mạng trong văn hóa doanh nghiệp đương đại.",
      "Thời gian biểu linh hoạt cho phép các chuyên gia tự thiết kế quy trình làm việc phù hợp cho riêng mình, xóa bỏ những giờ phút mệt mỏi chôn chân giữa dòng xe tắc nghẽn mỗi buổi sáng.",
      "Tuy nhiên, làm việc cộng tác từ xa cũng mang đến những rào cản bất ngờ.",
      "Khi thiếu vắng những cuộc trò chuyện ngẫu hứng nơi hành lang, các thành viên trong nhóm phải phụ thuộc nhiều vào tin nhắn bất đồng bộ và các buổi họp trực tuyến qua video, điều đôi khi gây nên sự kiệt sức vì thiết bị số và cảm giác cô lập.",
      "Để duy trì sự gắn kết nội bộ, các doanh nghiệp tiến bộ luôn ưu tiên việc ghi chép tài liệu minh bạch, phân định ranh giới công việc rõ ràng và chủ động tổ chức những buổi giao lưu trực tuyến ấm áp.",
      "Biết cân bằng giữa quyền tự chủ cá nhân và sự giao tiếp ý nghĩa cùng tập thể chính là chìa khóa để gặt hái thành công trong môi trường làm việc phân tán.",
    ],
    targetWords: [
      { word: 'adoption', contextSentence: 'The widespread adoption of remote employment has revolutionized work.', meaningVi: 'việc áp dụng, sự tiếp nhận', ipa: '/əˈdɒpʃn/' },
      { word: 'asynchronous', contextSentence: 'Team members rely heavily on asynchronous messaging.', meaningVi: 'bất đồng bộ (không cùng thời gian thực)', ipa: '/eɪˈsɪŋkrənəs/' },
      { word: 'isolation', contextSentence: 'Can occasionally induce digital fatigue and feelings of isolation.', meaningVi: 'sự cô lập, tách biệt', ipa: '/ˌaɪsəˈleɪʃn/' },
      { word: 'cohesion', contextSentence: 'To maintain organizational cohesion, progressive companies prioritize documentation.', meaningVi: 'sự gắn kết, tính cố kết', ipa: '/kəʊˈhiːʒn/' },
      { word: 'autonomy', contextSentence: 'Balancing professional autonomy with meaningful team communication.', meaningVi: 'quyền tự chủ, sự độc lập', ipa: '/ɔːˈtɒnəmi/' },
    ],
  },

  // ==========================================
  // LEVEL B2: Upper-intermediate, analytical insight, nuanced academic/editorial prose (300 - 380 words)
  // ==========================================
  {
    id: 'b2_ai_learning',
    title: 'How Generative AI Is Reshaping Daily Learning',
    topic: 'Công Nghệ & AI',
    topicCategory: 'tech',
    difficulty: 'B2',
    genre: 'Article',
    passage: `Digital devices and artificial intelligence have fundamentally transformed how people acquire knowledge and organize daily priorities. From intelligent tutoring systems to personalized language assistants, technology now enables learners to tailor study materials precisely to their CEFR levels, schedule flexible practice intervals, and receive instant feedback at any hour of the day.

Modern educational platforms leverage spaced repetition algorithms to predict when a learner is likely to forget a grammatical rule or vocabulary item. By presenting active recall challenges at optimal intervals, these tools maximize long-term retention while significantly reducing study fatigue. Furthermore, interactive voice recognition allows individuals to practice conversational pronunciation in private, judgment-free environments.

Nevertheless, educational psychologists emphasize that technology serves as a powerful accelerator, not a total substitute for human curiosity and disciplined habit formation. Pairing cutting-edge AI feedback with consistent daily routines remains the gold standard for achieving authentic language fluency.`,
    translationVi: `Các thiết bị số và trí tuệ nhân tạo đã thay đổi căn bản cách con người tiếp thu tri thức cũng như sắp xếp các ưu tiên hàng ngày. Từ các hệ thống gia sư thông minh đến trợ lý ngôn ngữ cá nhân hóa, công nghệ hiện nay cho phép người học tinh chỉnh tài liệu chính xác theo cấp độ CEFR, lên lịch học tập linh hoạt và nhận phản hồi tức thì vào bất kỳ thời điểm nào trong ngày.

Các nền tảng giáo dục hiện đại tận dụng thuật toán lặp lại ngắt quãng (Spaced Repetition) để dự đoán thời điểm người học sắp quên một cấu trúc ngữ pháp hay từ vựng. Bằng cách đưa ra thử thách gợi nhớ chủ động vào những khoảng thời gian tối ưu, các công cụ này tối đa hóa khả năng ghi nhớ dài hạn trong khi giảm thiểu đáng kể sự mệt mỏi khi học. Thêm vào đó, công nghệ nhận diện giọng nói tương tác giúp người học luyện phát âm trong một môi trường riêng tư và không lo bị phán xét.

Dẫu vậy, các nhà tâm lý học giáo dục nhấn mạnh rằng công nghệ đóng vai trò như một đòn bẩy thúc đẩy mạnh mẽ chứ không thể thay thế hoàn toàn cho sự tò mò và tính kỷ luật tự thân. Việc kết hợp phản hồi chuẩn xác từ AI với thói quen rèn luyện kiên trì mỗi ngày vẫn là chuẩn mực vàng để đạt được sự lưu loát thực chất.`,
    sentenceTranslations: [
      "Các thiết bị số và trí tuệ nhân tạo đã thay đổi căn bản cách con người tiếp thu tri thức cũng như sắp xếp các ưu tiên hàng ngày.",
      "Từ các hệ thống gia sư thông minh đến trợ lý ngôn ngữ cá nhân hóa, công nghệ hiện nay cho phép người học tinh chỉnh tài liệu chính xác theo cấp độ CEFR, lên lịch học tập linh hoạt và nhận phản hồi tức thì vào bất kỳ thời điểm nào trong ngày.",
      "Các nền tảng giáo dục hiện đại tận dụng thuật toán lặp lại ngắt quãng để dự đoán thời điểm người học sắp quên một cấu trúc ngữ pháp hay từ vựng.",
      "Bằng cách đưa ra thử thách gợi nhớ chủ động vào những khoảng thời gian tối ưu, các công cụ này tối đa hóa khả năng ghi nhớ dài hạn trong khi giảm thiểu đáng kể sự mệt mỏi khi học.",
      "Thêm vào đó, công nghệ nhận diện giọng nói tương tác giúp người học luyện phát âm trong một môi trường riêng tư và không lo bị phán xét.",
      "Dẫu vậy, các nhà tâm lý học giáo dục nhấn mạnh rằng công nghệ đóng vai trò như một đòn bẩy thúc đẩy mạnh mẽ chứ không thể thay thế hoàn toàn cho sự tò mò và tính kỷ luật tự thân.",
      "Việc kết hợp phản hồi chuẩn xác từ AI với thói quen rèn luyện kiên trì mỗi ngày vẫn là chuẩn mực vàng để đạt được sự lưu loát thực chất.",
    ],
    targetWords: [
      { word: 'fundamentally', contextSentence: 'Digital devices have fundamentally transformed how people acquire knowledge.', meaningVi: 'về cơ bản, từ gốc rễ', ipa: '/ˌfʌndəˈmentəli/' },
      { word: 'leverage', contextSentence: 'Modern educational platforms leverage spaced repetition algorithms.', meaningVi: 'tận dụng đòn bẩy, khai thác', ipa: '/ˈliːvərɪdʒ/' },
      { word: 'retention', contextSentence: 'These tools maximize long-term retention while reducing fatigue.', meaningVi: 'sự ghi nhớ, khả năng lưu giữ', ipa: '/rɪˈtenʃn/' },
      { word: 'accelerator', contextSentence: 'Technology serves as a powerful accelerator, not a total substitute.', meaningVi: 'chất xúc tác, máy gia tốc', ipa: '/əkˈseləreɪtə(r)/' },
      { word: 'fluency', contextSentence: 'The gold standard for achieving authentic language fluency.', meaningVi: 'sự trôi chảy, lưu loát', ipa: '/ˈfluːənsi/' },
    ],
  },
  {
    id: 'b2_micro_habits',
    title: 'The Psychology of Micro-Habits and Compound Growth',
    topic: 'Tâm Lý & Phát Triển',
    topicCategory: 'psychology',
    difficulty: 'B2',
    genre: 'Psychology',
    passage: `Behavioral researchers have long discovered that dramatic personal transformations seldom result from sudden monumental decisions. Instead, sustainable growth is cultivated through minute, incremental adjustments that compound gradually over time.

When individuals establish tiny micro-habits—such as reading two pages of an English book or practicing five minutes of translation daily—the psychological barrier to commencement virtually disappears. The brain ceases to perceive the task as an intimidating burden, making consistency effortlessly achievable.

Over successive months, these humble daily investments solidify into automatic subconscious routines, unlocking profound linguistic mastery and cognitive resilience.`,
    translationVi: `Các nhà nghiên cứu hành vi từ lâu đã khám phá ra rằng những bước chuyển mình to lớn của một cá nhân hiếm khi bắt nguồn từ các quyết định đột ngột mang tính bước ngoặt. Thay vào đó, sự phát triển bền vững được vun đắp thông qua những điều chỉnh rất nhỏ và tăng dần đều đặn, tích lũy theo thời gian như lãi kép.

Khi con người thiết lập những thói quen vi mô nhỏ nhắn—chẳng hạn như đọc hai trang sách tiếng Anh hay dành năm phút luyện dịch mỗi ngày—rào cản tâm lý để bắt đầu gần như tan biến. Não bộ không còn xem nhiệm vụ đó là gánh nặng gây nản lòng, giúp tính kiên trì trở nên dễ dàng đạt được một cách tự nhiên.

Qua nhiều tháng liên tiếp, những nỗ lực đầu tư khiêm tốn mỗi ngày này sẽ kết tinh thành phản xạ tự động trong tiềm thức, mở ra năng lực ngôn ngữ uyên thâm và sức bền nhận thức dẻo dai.`,
    sentenceTranslations: [
      "Các nhà nghiên cứu hành vi từ lâu đã khám phá ra rằng những bước chuyển mình to lớn của một cá nhân hiếm khi bắt nguồn từ các quyết định đột ngột mang tính bước ngoặt.",
      "Thay vào đó, sự phát triển bền vững được vun đắp thông qua những điều chỉnh rất nhỏ và tăng dần đều đặn, tích lũy theo thời gian như lãi kép.",
      "Khi con người thiết lập những thói quen vi mô nhỏ nhắn, rào cản tâm lý để bắt đầu gần như tan biến.",
      "Não bộ không còn xem nhiệm vụ đó là gánh nặng gây nản lòng, giúp tính kiên trì trở nên dễ dàng đạt được một cách tự nhiên.",
      "Qua nhiều tháng liên tiếp, những nỗ lực đầu tư khiêm tốn mỗi ngày này sẽ kết tinh thành phản xạ tự động trong tiềm thức, mở ra năng lực ngôn ngữ uyên thâm và sức bền nhận thức dẻo dai.",
    ],
    targetWords: [
      { word: 'monumental', contextSentence: 'Dramatic personal transformations seldom result from monumental decisions.', meaningVi: 'mang tính bước ngoặt, vĩ đại', ipa: '/ˌmɒnjuˈmentl/' },
      { word: 'incremental', contextSentence: 'Growth is cultivated through minute, incremental adjustments.', meaningVi: 'tăng dần từng bước nhỏ', ipa: '/ˌɪŋkrəˈmentl/' },
      { word: 'compound', contextSentence: 'Adjustments that compound gradually over time.', meaningVi: 'tích lũy cấp số nhân, sinh lãi kép', ipa: '/kəmˈpaʊnd/' },
      { word: 'intimidating', contextSentence: 'The brain ceases to perceive the task as an intimidating burden.', meaningVi: 'đáng sợ, gây nản lòng', ipa: '/ɪnˈtɪmɪdeɪtɪŋ/' },
      { word: 'solidify', contextSentence: 'These humble daily investments solidify into automatic routines.', meaningVi: 'củng cố vững chắc, kết tinh', ipa: '/səˈlɪdɪfaɪ/' },
    ],
  },
  {
    id: 'b2_urban_nature',
    title: 'Biophilic Architecture: Integrating Nature into Modern Cities',
    topic: 'Môi Trường & Đô Thị',
    topicCategory: 'nature',
    difficulty: 'B2',
    genre: 'Architecture',
    passage: `Modern metropolitan planners are discovering that concrete towers void of natural greenery impose subtle psychological strains on urban dwellers. In response, contemporary architects are championing biophilic design, an architectural philosophy that weaves vegetation, natural sunlight, and flowing water into urban infrastructure.

Rooftop botanical gardens, cascading vertical plant walls, and natural timber materials not only diminish ambient temperatures in dense districts, but also markedly alleviate stress among office employees. Studies reveal that regular exposure to living greenery promotes mental restoration and elevates creative productivity.

Integrating living ecosystems into high-density skyscrapers demonstrates that urban modernization and environmental harmony can coexist seamlessly.`,
    translationVi: `Các nhà quy hoạch đô thị hiện đại đang nhận thấy rằng những tòa tháp bê tông thiếu vắng mảng xanh tự nhiên đang tạo ra những căng thẳng tâm lý âm thầm lên cư dân thành phố. Để ứng phó, các kiến trúc sư đương đại đang tích cực thúc đẩy thiết kế sinh thái (biophilic design) - một triết lý kiến trúc khéo léo đan xen cây xanh, ánh sáng tự nhiên và dòng nước vào cơ sở hạ tầng đô thị.

Những khu vườn thực vật trên tầng thượng, những bức tường cây xanh xếp tầng và các vật liệu gỗ tự nhiên không chỉ giúp hạ nhiệt độ môi trường ở các khu vực đông đúc, mà còn xoa dịu đáng kể sự căng thẳng cho nhân viên văn phòng. Các nghiên cứu chỉ ra rằng việc tiếp xúc thường xuyên với cây xanh kích thích sự phục hồi tinh thần và nâng cao năng suất sáng tạo.

Việc tích hợp các hệ sinh thái sống vào những tòa nhà chọc trời mật độ cao chứng minh rằng quá trình hiện đại hóa đô thị và sự hòa hợp môi trường hoàn toàn có thể cùng song hành một cách hài hòa.`,
    sentenceTranslations: [
      "Các nhà quy hoạch đô thị hiện đại đang nhận thấy rằng những tòa tháp bê tông thiếu vắng mảng xanh tự nhiên đang tạo ra những căng thẳng tâm lý âm thầm lên cư dân thành phố.",
      "Để ứng phó, các kiến trúc sư đương đại đang tích cực thúc đẩy thiết kế sinh thái, một triết lý kiến trúc khéo léo đan xen cây xanh, ánh sáng tự nhiên và dòng nước vào cơ sở hạ tầng đô thị.",
      "Những khu vườn thực vật trên tầng thượng, những bức tường cây xanh xếp tầng và các vật liệu gỗ tự nhiên không chỉ giúp hạ nhiệt độ môi trường, mà còn xoa dịu đáng kể sự căng thẳng cho nhân viên văn phòng.",
      "Các nghiên cứu chỉ ra rằng việc tiếp xúc thường xuyên với cây xanh kích thích sự phục hồi tinh thần và nâng cao năng suất sáng tạo.",
      "Việc tích hợp các hệ sinh thái sống vào những tòa nhà chọc trời mật độ cao chứng minh rằng quá trình hiện đại hóa đô thị và sự hòa hợp môi trường hoàn toàn có thể cùng song hành một cách hài hòa.",
    ],
    targetWords: [
      { word: 'championing', contextSentence: 'Contemporary architects are championing biophilic design.', meaningVi: 'tích cực ủng hộ, cổ vũ dẫn đầu', ipa: '/ˈtʃæmpiənɪŋ/' },
      { word: 'weaves', contextSentence: 'An architectural philosophy that weaves vegetation into infrastructure.', meaningVi: 'đan xen, kết hợp khéo léo', ipa: '/wiːvz/' },
      { word: 'markedly', contextSentence: 'Vertical plant walls markedly alleviate stress among employees.', meaningVi: 'rõ rệt, đáng kể', ipa: '/ˈmɑːkɪdli/' },
      { word: 'alleviate', contextSentence: 'Markedly alleviate stress among office employees.', meaningVi: 'làm dịu bớt, xoa dịu', ipa: '/əˈliːvieɪt/' },
      { word: 'coexist', contextSentence: 'Urban modernization and environmental harmony can coexist seamlessly.', meaningVi: 'cùng chung sống, cùng tồn tại', ipa: '/ˌkəʊɪɡˈzɪst/' },
    ],
  },
  {
    id: 'b2_deep_work',
    title: 'Cultivating Deep Focus in a Hyper-Connected World',
    topic: 'Tâm Lý & Phát Triển',
    topicCategory: 'psychology',
    difficulty: 'B2',
    genre: 'Self-Development',
    passage: `In contemporary workplaces, continuous digital notifications constantly fracture human attention. Cognitive scientists warn that chronic multitasking severely impairs our capacity for prolonged concentration and creative problem-solving.

To counteract this mental fragmentation, professionals are increasingly embracing the discipline of deep work. By scheduling uninterrupted blocks of sixty to ninety minutes, individuals immerse themselves completely in cognitively demanding tasks, entering a state of uninterrupted flow.

Ultimately, the ability to concentrate intensely without distraction is becoming a rare and invaluable commodity in modern knowledge-driven economies.`,
    translationVi: `Trong môi trường công sở đương đại, những thông báo số liên tục xuất hiện đang không ngừng bẻ vụn sự chú ý của con người. Các nhà khoa học nhận thức cảnh báo rằng thói quen làm nhiều việc cùng lúc kéo dài sẽ làm suy giảm nghiêm trọng khả năng tập trung sâu và tư duy giải quyết vấn đề sáng tạo của chúng ta.

Để chống lại sự phân mảnh tinh thần này, ngày càng nhiều chuyên gia đón nhận kỷ luật làm việc sâu (Deep Work). Bằng cách lên lịch cho những khoảng thời gian tập trung liên tục từ 60 đến 90 phút, mỗi cá nhân có thể đắm chìm hoàn toàn vào những nhiệm vụ đòi hỏi tư duy cao độ và bước vào trạng thái dòng chảy không bị gián đoạn.

Xét cho cùng, năng lực tập trung cao độ mà không bị xao nhãng đang dần trở thành một tài sản quý hiếm và vô giá trong các nền kinh tế dựa trên tri thức hiện đại.`,
    sentenceTranslations: [
      "Trong môi trường công sở đương đại, những thông báo số liên tục xuất hiện đang không ngừng bẻ vụn sự chú ý của con người.",
      "Các nhà khoa học nhận thức cảnh báo rằng thói quen làm nhiều việc cùng lúc kéo dài sẽ làm suy giảm nghiêm trọng khả năng tập trung sâu và tư duy giải quyết vấn đề sáng tạo.",
      "Để chống lại sự phân mảnh tinh thần này, ngày càng nhiều chuyên gia đón nhận kỷ luật làm việc sâu.",
      "Bằng cách lên lịch cho những khoảng thời gian tập trung liên tục từ 60 đến 90 phút, mỗi cá nhân có thể đắm chìm hoàn toàn vào những nhiệm vụ đòi hỏi tư duy cao độ và bước vào trạng thái dòng chảy không bị gián đoạn.",
      "Xét cho cùng, năng lực tập trung cao độ mà không bị xao nhãng đang dần trở thành một tài sản quý hiếm và vô giá trong các nền kinh tế dựa trên tri thức hiện đại.",
    ],
    targetWords: [
      { word: 'fracture', contextSentence: 'Continuous digital notifications constantly fracture human attention.', meaningVi: 'làm gãy vỡ, phân mảnh', ipa: '/ˈfræktʃə(r)/' },
      { word: 'chronic', contextSentence: 'Cognitive scientists warn that chronic multitasking impairs capacity.', meaningVi: 'mãn tính, kinh niên, kéo dài dai dẳng', ipa: '/ˈkrɒnɪk/' },
      { word: 'counteract', contextSentence: 'To counteract this mental fragmentation, professionals embrace deep work.', meaningVi: 'chống lại, hóa giải', ipa: '/ˌkaʊntərˈækt/' },
      { word: 'uninterrupted', contextSentence: 'Individuals immerse themselves in an uninterrupted flow.', meaningVi: 'liên tục, không bị ngắt quãng', ipa: '/ˌʌnɪntəˈrʌptɪd/' },
      { word: 'commodity', contextSentence: 'Concentration is becoming a rare and invaluable commodity.', meaningVi: 'hàng hóa, tài sản giá trị', ipa: '/kəˈmɒdəti/' },
    ],
  },

  // ==========================================
  // LEVEL C1: Advanced academic/professional prose, sophisticated discourse markers (380 - 480 words)
  // ==========================================
  {
    id: 'c1_startup_dilemma',
    title: 'The Startup Dilemma: Breakneck Growth vs Enduring Resilience',
    topic: 'Kinh Doanh & Khởi Nghiệp',
    topicCategory: 'business',
    difficulty: 'C1',
    genre: 'Business Analysis',
    passage: `In the competitive realm of technological startups, founders frequently grapple with a critical strategic tradeoff: pursuing breakneck user growth or cultivating sustainable unit economics. While early venture capital investments encourage aggressive customer acquisition, enduring business resilience demands rigorous fiscal discipline.

Successful enterprises distinguish themselves by building resilient product ecosystems that foster genuine customer loyalty rather than relying exclusively on discounted promotions. When economic headwinds inevitably emerge, companies with robust balance sheets and loyal user communities possess the agility to pivot without sacrificing their core value proposition.

Ultimately, sustainable innovation requires visionary leaders to harmonize audacious long-term ambitions with pragmatic operational execution.`,
    translationVi: `Trong thế giới cạnh tranh khốc liệt của các công ty khởi nghiệp công nghệ, những nhà sáng lập thường xuyên phải trăn trở trước một bài toán đánh đổi mang tính chiến lược: theo đuổi tốc độ tăng trưởng người dùng chóng mặt hay xây dựng nền tảng kinh tế đơn vị bền vững. Dù dòng vốn đầu tư mạo hiểm ban đầu luôn khuyến khích việc thâu tóm khách hàng bằng mọi giá, sức bật lâu dài của doanh nghiệp lại đòi hỏi tính kỷ luật tài chính nghiêm ngặt.

Những doanh nghiệp thành công tạo nên sự khác biệt nhờ kiến tạo hệ sinh thái sản phẩm bền vững nhằm vun đắp lòng trung thành thực chất từ khách hàng, thay vì chỉ đơn thuần dựa vào các chương trình khuyến mãi giảm giá. Khi những khó khăn bất lợi của nền kinh tế ập đến, các công ty có bảng cân đối tài chính vững mạnh và cộng đồng người dùng trung thành sẽ nắm giữ sự linh hoạt để chuyển hướng mà không phải đánh đổi giá trị cốt lõi.

Xét cho cùng, đổi mới sáng tạo bền vững đòi hỏi các nhà lãnh đạo có tầm nhìn phải biết dung hòa giữa tham vọng lớn lao táo bạo với năng lực thực thi vận hành thực tế.`,
    sentenceTranslations: [
      "Trong thế giới cạnh tranh khốc liệt của các công ty khởi nghiệp công nghệ, những nhà sáng lập thường xuyên phải trăn trở trước một bài toán đánh đổi mang tính chiến lược: theo đuổi tốc độ tăng trưởng người dùng chóng mặt hay xây dựng nền tảng kinh tế đơn vị bền vững.",
      "Dù dòng vốn đầu tư mạo hiểm ban đầu luôn khuyến khích việc thâu tóm khách hàng bằng mọi giá, sức bật lâu dài của doanh nghiệp lại đòi hỏi tính kỷ luật tài chính nghiêm ngặt.",
      "Những doanh nghiệp thành công tạo nên sự khác biệt nhờ kiến tạo hệ sinh thái sản phẩm bền vững nhằm vun đắp lòng trung thành thực chất từ khách hàng, thay vì chỉ đơn thuần dựa vào các chương trình khuyến mãi giảm giá.",
      "Khi những khó khăn bất lợi của nền kinh tế ập đến, các công ty có bảng cân đối tài chính vững mạnh và cộng đồng người dùng trung thành sẽ nắm giữ sự linh hoạt để chuyển hướng mà không phải đánh đổi giá trị cốt lõi.",
      "Xét cho cùng, đổi mới sáng tạo bền vững đòi hỏi các nhà lãnh đạo có tầm nhìn phải biết dung hòa giữa tham vọng lớn lao táo bạo với năng lực thực thi vận hành thực tế.",
    ],
    targetWords: [
      { word: 'grapple with', contextSentence: 'Founders frequently grapple with a critical strategic tradeoff.', meaningVi: 'vật lộn, trăn trở giải quyết', ipa: '/ˈɡræpl wɪð/' },
      { word: 'breakneck', contextSentence: 'Pursuing breakneck user growth or cultivating sustainable unit economics.', meaningVi: 'chóng mặt, thần tốc nguy hiểm', ipa: '/ˈbreɪknek/' },
      { word: 'resilience', contextSentence: 'Enduring business resilience demands rigorous fiscal discipline.', meaningVi: 'sức bật bền bỉ, khả năng phục hồi', ipa: '/rɪˈzɪliəns/' },
      { word: 'headwinds', contextSentence: 'When economic headwinds inevitably emerge, companies pivot.', meaningVi: 'nghịch cảnh, trở ngại bất lợi', ipa: '/ˈhedwɪndz/' },
      { word: 'audacious', contextSentence: 'Harmonize audacious long-term ambitions with pragmatic execution.', meaningVi: 'táo bạo, dũng cảm phi thường', ipa: '/ɔːˈdeɪʃəs/' },
    ],
  },
  {
    id: 'c1_quantum_leap',
    title: 'The Quantum Computing Paradigm and Cryptographic Horizons',
    topic: 'Khoa Học & Tương Lai',
    topicCategory: 'science',
    difficulty: 'C1',
    genre: 'Science & Technology',
    passage: `Theoretical physics and computer science are converging on a profound paradigm shift: quantum computing. Unlike classical binary architectures that manipulate discrete bits of zero or one, quantum processors exploit the counterintuitive principles of superposition and entanglement to execute computations of astronomical complexity.

This nascent technology promises to revolutionize molecular drug discovery, optimize complex supply chains, and unravel cryptographic algorithms currently securing global financial networks. Consequently, national security agencies and cybersecurity firms are racing to implement post-quantum cryptographic standards before quantum supremacy renders contemporary encryption obsolete.

The transition into the quantum epoch represents not merely an incremental speed enhancement, but an ontological leap in our computational dominion over reality.`,
    translationVi: `Vật lý lý thuyết và khoa học máy tính đang cùng hội tụ tại một bước ngoặt mang tính hình mẫu sâu sắc: máy tính lượng tử. Không giống như kiến trúc nhị phân cổ điển chỉ xử lý các bit rời rạc mang giá trị 0 hoặc 1, các bộ xử lý lượng tử khai thác các nguyên lý phản trực giác về sự chồng chập và vướng víu lượng tử để thực thi những phép tính có độ phức tạp thiên văn.

Công nghệ non trẻ này hứa hẹn sẽ cách mạng hóa việc tìm kiếm các hợp chất thuốc phân tử mới, tối ưu hóa các chuỗi cung ứng phức tạp và giải mã những thuật toán mã hóa hiện đang bảo vệ các mạng lưới tài chính toàn cầu. Do đó, các cơ quan an ninh quốc gia cùng các tập đoàn an ninh mạng đang ráo riết triển khai các tiêu chuẩn mật mã hậu lượng tử trước khi ưu thế lượng tử biến các phương thức mã hóa đương thời trở nên lỗi thời hoàn toàn.

Bước chuyển dịch sang kỷ nguyên lượng tử không đơn thuần là sự nâng cấp tốc độ từng bước nhỏ, mà là một bước nhảy vọt về mặt bản thể luận trong quyền năng tính toán của con người đối với thực tại vật chất.`,
    sentenceTranslations: [
      "Vật lý lý thuyết và khoa học máy tính đang cùng hội tụ tại một bước ngoặt mang tính hình mẫu sâu sắc: máy tính lượng tử.",
      "Không giống như kiến trúc nhị phân cổ điển chỉ xử lý các bit rời rạc mang giá trị 0 hoặc 1, các bộ xử lý lượng tử khai thác các nguyên lý phản trực giác về sự chồng chập và vướng víu lượng tử để thực thi những phép tính có độ phức tạp thiên văn.",
      "Công nghệ non trẻ này hứa hẹn sẽ cách mạng hóa việc tìm kiếm các hợp chất thuốc phân tử mới, tối ưu hóa các chuỗi cung ứng phức tạp và giải mã những thuật toán mã hóa hiện đang bảo vệ các mạng lưới tài chính toàn cầu.",
      "Do đó, các cơ quan an ninh quốc gia cùng các tập đoàn an ninh mạng đang ráo riết triển khai các tiêu chuẩn mật mã hậu lượng tử trước khi ưu thế lượng tử biến các phương thức mã hóa đương thời trở nên lỗi thời hoàn toàn.",
      "Bước chuyển dịch sang kỷ nguyên lượng tử không đơn thuần là sự nâng cấp tốc độ từng bước nhỏ, mà là một bước nhảy vọt về mặt bản thể luận trong quyền năng tính toán của con người đối với thực tại vật chất.",
    ],
    targetWords: [
      { word: 'paradigm shift', contextSentence: 'Converging on a profound paradigm shift: quantum computing.', meaningVi: 'bước chuyển mình hệ hình mẫu', ipa: '/ˈpærədaɪm ʃɪft/' },
      { word: 'exploit', contextSentence: 'Quantum processors exploit the counterintuitive principles of superposition.', meaningVi: 'khai thác triệt để', ipa: '/ɪkˈsplɔɪt/' },
      { word: 'nascent', contextSentence: 'This nascent technology promises to revolutionize molecular drug discovery.', meaningVi: 'non trẻ, mới chớm nở', ipa: '/ˈnæsnt/' },
      { word: 'obsolete', contextSentence: 'Before quantum supremacy renders contemporary encryption obsolete.', meaningVi: 'lỗi thời, không còn dùng được', ipa: '/ˈɒbsəliːt/' },
      { word: 'epoch', contextSentence: 'The transition into the quantum epoch represents an ontological leap.', meaningVi: 'kỷ nguyên, thời đại lớn', ipa: '/ˈiːpɒk/' },
    ],
  },
  {
    id: 'c1_neuroplasticity',
    title: 'Neuroplasticity and the Architecture of Lifelong Cognitive Agility',
    topic: 'Tâm Lý & Phát Triển',
    topicCategory: 'psychology',
    difficulty: 'C1',
    genre: 'Neuroscience Essay',
    passage: `For decades, neurobiological orthodoxy posited that the adult human brain was an immutable biological mechanism whose neural pathways solidified irrevocably after early development. However, groundbreaking discoveries in neuroplasticity have demonstrated that neural networks remain remarkably malleable across the entire lifespan.

When adults actively challenge their intellect—through rigorous bilingual translation, mastering musical instruments, or solving novel structural dilemmas—the brain continuously recalibrates its synaptic connections. Dendritic branches extend into new territory, reviving dormant circuits and constructing resilient cognitive reserves that withstand age-related degradation.

Consequently, cognitive agility is not a fixed genetic endowment, but an evolving architectural marvel sculpted by disciplined intellectual curiosity.`,
    translationVi: `Trong suốt nhiều thập kỷ, quan điểm chính thống của ngành sinh học thần kinh từng cho rằng bộ não của người trưởng thành là một cỗ máy sinh học bất biến với các đường dẫn thần kinh bị cố định vĩnh viễn sau giai đoạn phát triển ban đầu. Tuy nhiên, những khám phá đột phá về tính mềm dẻo của não bộ (neuroplasticity) đã chứng minh rằng các mạng lưới tế bào thần kinh vẫn duy trì được độ linh hoạt uốn nắn đáng kinh ngạc trong suốt vòng đời.

Khi người trưởng thành chủ động thử thách trí tuệ của mình - thông qua việc dịch thuật song ngữ nghiêm cẩn, làm chủ các nhạc cụ âm nhạc hay giải quyết những bài toán cấu trúc mới lạ - bộ não sẽ liên tục tái hiệu chỉnh các kết nối synap của nó. Các nhánh gai sợi nhánh vươn dài vào những vùng lãnh thổ mới, đánh thức các mạch điện đang ngủ yên và kiến tạo nên những nguồn dự trữ nhận thức vững bền có khả năng chống lại sự suy thoái do tuổi tác.

Do đó, sự nhanh nhạy của nhận thức không phải là một món quà di truyền cố định bất biến, mà là một tuyệt tác kiến trúc liên tục tiến hóa được tạc nên bởi tính tò mò trí tuệ đầy kỷ luật.`,
    sentenceTranslations: [
      "Trong suốt nhiều thập kỷ, quan điểm chính thống của ngành sinh học thần kinh từng cho rằng bộ não của người trưởng thành là một cỗ máy sinh học bất biến với các đường dẫn thần kinh bị cố định vĩnh viễn sau giai đoạn phát triển ban đầu.",
      "Tuy nhiên, những khám phá đột phá về tính mềm dẻo của não bộ đã chứng minh rằng các mạng lưới tế bào thần kinh vẫn duy trì được độ linh hoạt uốn nắn đáng kinh ngạc trong suốt vòng đời.",
      "Khi người trưởng thành chủ động thử thách trí tuệ của mình, bộ não sẽ liên tục tái hiệu chỉnh các kết nối synap của nó.",
      "Các nhánh gai sợi nhánh vươn dài vào những vùng lãnh thổ mới, đánh thức các mạch điện đang ngủ yên và kiến tạo nên những nguồn dự trữ nhận thức vững bền có khả năng chống lại sự suy thoái do tuổi tác.",
      "Do đó, sự nhanh nhạy của nhận thức không phải là một món quà di truyền cố định bất biến, mà là một tuyệt tác kiến trúc liên tục tiến hóa được tạc nên bởi tính tò mò trí tuệ đầy kỷ luật.",
    ],
    targetWords: [
      { word: 'orthodoxy', contextSentence: 'Neurobiological orthodoxy posited that the adult brain was immutable.', meaningVi: 'quan điểm truyền thống chính thống', ipa: '/ˈɔːθədɒksi/' },
      { word: 'malleable', contextSentence: 'Neural networks remain remarkably malleable across the lifespan.', meaningVi: 'dễ uốn nắn, mềm dẻo thích ứng', ipa: '/ˈmæliəbl/' },
      { word: 'recalibrates', contextSentence: 'The brain continuously recalibrates its synaptic connections.', meaningVi: 'tái hiệu chỉnh, cân chỉnh lại', ipa: '/ˌriːˈkælɪbreɪts/' },
      { word: 'dormant', contextSentence: 'Reviving dormant circuits and constructing resilient reserves.', meaningVi: 'ngủ yên, tạm thời bất hoạt', ipa: '/ˈdɔːmənt/' },
      { word: 'endowment', contextSentence: 'Cognitive agility is not a fixed genetic endowment.', meaningVi: 'thiên phú, vốn ban tặng', ipa: '/ɪnˈdaʊmənt/' },
    ],
  },
];

// Anti-repetition tracker
let lastServedId = '';

/**
 * Procedural Dynamic Custom Passage Generator
 * Generates an authentic English passage + Vietnamese translation for ANY custom topic
 */
export function generateCustomPassage(
  level: DialogueDifficulty = 'B1',
  customTopic: string = 'Đời sống hiện đại'
): GeneratedPassage {
  const normLevel = (level || 'B1').toUpperCase() as DialogueDifficulty;
  const cleanTopic = customTopic.trim();

  // Determine complexity based on level
  if (normLevel === 'A1') {
    return {
      id: `custom_a1_${Date.now()}`,
      title: `Learning and Exploring: ${cleanTopic}`,
      topic: cleanTopic,
      topicCategory: 'daily',
      difficulty: 'A1',
      genre: 'Story',
      passage: `Every day brings new chances to discover ${cleanTopic}. Many people find great joy when they explore this friendly topic with their close friends and family members.\n\nTaking time to learn simple things makes our daily life brighter and much more interesting. It helps everyone feel happy, relaxed, and ready for a good new day.`,
      translationVi: `Mỗi ngày đều mang đến những cơ hội mới để khám phá về ${cleanTopic}. Rất nhiều người tìm thấy niềm vui to lớn khi họ tìm hiểu chủ đề thân thiện này cùng bạn bè thân thiết và người thân trong gia đình.\n\nDành thời gian học hỏi những điều giản dị giúp cuộc sống thường ngày của chúng ta trở nên tươi sáng và thú vị hơn rất nhiều. Điều đó giúp mọi người luôn cảm thấy vui vẻ, thư thái và sẵn sàng cho một ngày mới tốt lành.`,
      sentenceTranslations: [
        `Mỗi ngày đều mang đến những cơ hội mới để khám phá về ${cleanTopic}.`,
        `Rất nhiều người tìm thấy niềm vui to lớn khi họ tìm hiểu chủ đề thân thiện này cùng bạn bè thân thiết và người thân trong gia đình.`,
        `Dành thời gian học hỏi những điều giản dị giúp cuộc sống thường ngày của chúng ta trở nên tươi sáng và thú vị hơn rất nhiều.`,
        `Điều đó giúp mọi người luôn cảm thấy vui vẻ, thư thái và sẵn sàng cho một ngày mới tốt lành.`,
      ],
      targetWords: [
        { word: 'discover', contextSentence: `New chances to discover ${cleanTopic}.`, meaningVi: 'khám phá, tìm hiểu', ipa: '/dɪˈskʌvə(r)/' },
        { word: 'explore', contextSentence: 'When they explore this friendly topic with close friends.', meaningVi: 'khám phá, khảo sát', ipa: '/ɪkˈsplɔː(r)/' },
        { word: 'brighter', contextSentence: 'Makes our daily life brighter and more interesting.', meaningVi: 'tươi sáng hơn', ipa: '/ˈbraɪtə(r)/' },
        { word: 'relaxed', contextSentence: 'Helps everyone feel happy and relaxed.', meaningVi: 'thư thái, nhẹ nhõm', ipa: '/rɪˈlækst/' },
      ],
    };
  }

  if (normLevel === 'A2') {
    return {
      id: `custom_a2_${Date.now()}`,
      title: `Practical Insights on ${cleanTopic}`,
      topic: cleanTopic,
      topicCategory: 'daily',
      difficulty: 'A2',
      genre: 'Article',
      passage: `In recent times, more people are paying attention to ${cleanTopic}. Exploring this subject helps us understand our surroundings and develop practical skills for everyday life.\n\nWhen we dedicate regular time each week to learn about ${cleanTopic}, we discover helpful ideas that improve our routines. Sharing these experiences with others also creates strong bonds and encourages healthy habits.`,
      translationVi: `Thời gian gần đây, ngày càng có nhiều người dành sự quan tâm tới ${cleanTopic}. Việc tìm hiểu chủ đề này giúp chúng ta thấu hiểu môi trường xung quanh và phát triển các kỹ năng thực tế cho cuộc sống hàng ngày.\n\nKhi chúng ta dành thời gian đều đặn mỗi tuần để học hỏi về ${cleanTopic}, chúng ta sẽ khám phá ra những ý tưởng bổ ích giúp cải thiện nếp sinh hoạt. Chia sẻ những trải nghiệm này với người khác cũng tạo nên những sự gắn kết bền chặt và khích lệ các thói quen lành mạnh.`,
      sentenceTranslations: [
        `Thời gian gần đây, ngày càng có nhiều người dành sự quan tâm tới ${cleanTopic}.`,
        `Việc tìm hiểu chủ đề này giúp chúng ta thấu hiểu môi trường xung quanh và phát triển các kỹ năng thực tế cho cuộc sống hàng ngày.`,
        `Khi chúng ta dành thời gian đều đặn mỗi tuần để học hỏi về ${cleanTopic}, chúng ta sẽ khám phá ra những ý tưởng bổ ích giúp cải thiện nếp sinh hoạt.`,
        `Chia sẻ những trải nghiệm này với người khác cũng tạo nên những sự gắn kết bền chặt và khích lệ các thói quen lành mạnh.`,
      ],
      targetWords: [
        { word: 'attention', contextSentence: `More people are paying attention to ${cleanTopic}.`, meaningVi: 'sự chú ý, quan tâm', ipa: '/əˈtenʃn/' },
        { word: 'surroundings', contextSentence: 'Helps us understand our surroundings and develop skills.', meaningVi: 'môi trường xung quanh', ipa: '/səˈraʊndɪŋz/' },
        { word: 'dedicate', contextSentence: `When we dedicate regular time each week to learn about ${cleanTopic}.`, meaningVi: 'dành ra, cống hiến', ipa: '/ˈdedɪkeɪt/' },
        { word: 'experiences', contextSentence: 'Sharing these experiences with others creates strong bonds.', meaningVi: 'trải nghiệm, kinh nghiệm', ipa: '/ɪkˈspɪəriənsɪz/' },
      ],
    };
  }

  if (normLevel === 'C1' || normLevel === 'C2') {
    return {
      id: `custom_c1_${Date.now()}`,
      title: `Strategic Horizons: A Critical Analysis of ${cleanTopic}`,
      topic: cleanTopic,
      topicCategory: 'business',
      difficulty: 'C1',
      genre: 'Analytical Essay',
      passage: `In contemporary socio-economic discourse, the evolution of ${cleanTopic} constitutes a pivotal catalyst for structural transformation. Visionary analysts argue that navigating this domain demands not merely incremental adjustments, but a profound paradigm shift in how organizations synthesize strategic priorities.\n\nCrucially, embracing the intricacies of ${cleanTopic} requires leaders to harmonize audacious long-term objectives with meticulous operational execution. Those who cultivate systemic resilience and foster continuous intellectual inquiry will undeniably command decisive competitive advantages in an increasingly volatile global landscape.`,
      translationVi: `Trong các cuộc thảo luận kinh tế - xã hội đương đại, sự phát triển của ${cleanTopic} đóng vai trò như một chất xúc tác then chốt cho những cuộc chuyển mình mang tính cơ cấu. Các nhà phân tích có tầm nhìn lập luận rằng việc làm chủ lĩnh vực này đòi hỏi không đơn thuần là những điều chỉnh nhỏ nhặt, mà là một bước chuyển đổi hình mẫu sâu sắc trong cách các tổ chức tổng hòa các ưu tiên chiến lược.\n\nĐiều cốt yếu là, việc thấu suốt những khía cạnh tinh vi của ${cleanTopic} đòi hỏi các nhà lãnh đạo phải biết dung hòa giữa các mục tiêu dài hạn táo bạo với quy trình thực thi vận hành tỉ mỉ. Những ai biết vun đắp sức bật mang tính hệ thống và nuôi dưỡng tinh thần tìm tòi học hỏi không ngừng chắc chắn sẽ nắm giữ những lợi thế cạnh tranh mang tính quyết định giữa một bối cảnh toàn cầu ngày càng biến động.`,
      sentenceTranslations: [
        `Trong các cuộc thảo luận kinh tế - xã hội đương đại, sự phát triển của ${cleanTopic} đóng vai trò như một chất xúc tác then chốt cho những cuộc chuyển mình mang tính cơ cấu.`,
        `Các nhà phân tích có tầm nhìn lập luận rằng việc làm chủ lĩnh vực này đòi hỏi không đơn thuần là những điều chỉnh nhỏ nhặt, mà là một bước chuyển đổi hình mẫu sâu sắc trong cách các tổ chức tổng hòa các ưu tiên chiến lược.`,
        `Điều cốt yếu là, việc thấu suốt những khía cạnh tinh vi của ${cleanTopic} đòi hỏi các nhà lãnh đạo phải biết dung hòa giữa các mục tiêu dài hạn táo bạo với quy trình thực thi vận hành tỉ mỉ.`,
        `Những ai biết vun đắp sức bật mang tính hệ thống và nuôi dưỡng tinh thần tìm tòi học hỏi không ngừng chắc chắn sẽ nắm giữ những lợi thế cạnh tranh mang tính quyết định giữa một bối cảnh toàn cầu ngày càng biến động.`,
      ],
      targetWords: [
        { word: 'discourse', contextSentence: `In contemporary socio-economic discourse, the evolution of ${cleanTopic}.`, meaningVi: 'đàm luận, diễn ngôn học thuật', ipa: '/ˈdɪskɔːs/' },
        { word: 'pivotal', contextSentence: 'Constitutes a pivotal catalyst for structural transformation.', meaningVi: 'then chốt, mang tính quyết định', ipa: '/ˈpɪvətl/' },
        { word: 'intricacies', contextSentence: `Embracing the intricacies of ${cleanTopic} requires leaders to harmonize goals.`, meaningVi: 'sự phức tạp, khía cạnh tinh vi', ipa: '/ˈɪntrɪkəsiz/' },
        { word: 'resilience', contextSentence: 'Those who cultivate systemic resilience command decisive advantages.', meaningVi: 'sức bật, năng lực chống chịu bền bỉ', ipa: '/rɪˈzɪliəns/' },
        { word: 'volatile', contextSentence: 'Command decisive advantages in an increasingly volatile global landscape.', meaningVi: 'dễ biến động, khó lường', ipa: '/ˈvɒlətaɪl/' },
      ],
    };
  }

  if (normLevel === 'B1') {
    return {
      id: `custom_b1_${Date.now()}`,
      title: `Finding Balance and Growth Through ${cleanTopic}`,
      topic: cleanTopic,
      topicCategory: 'daily',
      difficulty: 'B1',
      genre: 'Article',
      passage: `In recent years, many people have recognized the positive influence of ${cleanTopic} on their lives. Taking time to learn about this subject helps us develop healthy habits and gain more self-confidence.\n\nAlthough building a new routine can be challenging at first, staying consistent brings great satisfaction. When we focus on small daily improvements, we can balance our busy schedules and feel much more motivated every day.`,
      translationVi: `Trong những năm gần đây, nhiều người đã nhận ra sức ảnh hưởng tích cực của ${cleanTopic} đối với cuộc sống của họ. Dành thời gian tìm hiểu về chủ đề này giúp chúng ta phát triển những thói quen lành mạnh và bồi đắp thêm sự tự tin.\n\nMặc dù việc xây dựng một nếp sống mới ban đầu có thể gặp đôi chút thử thách, nhưng việc duy trì đều đặn sẽ mang lại sự hài lòng to lớn. Khi chúng ta tập trung vào những tiến bộ nhỏ mỗi ngày, chúng ta có thể cân bằng thời gian biểu bận rộn và cảm thấy có thêm nhiều động lực mỗi ngày.`,
      sentenceTranslations: [
        `Trong những năm gần đây, nhiều người đã nhận ra sức ảnh hưởng tích cực của ${cleanTopic} đối với cuộc sống của họ.`,
        `Dành thời gian tìm hiểu về chủ đề này giúp chúng ta phát triển những thói quen lành mạnh và bồi đắp thêm sự tự tin.`,
        `Mặc dù việc xây dựng một nếp sống mới ban đầu có thể gặp đôi chút thử thách, nhưng việc duy trì đều đặn sẽ mang lại sự hài lòng to lớn.`,
        `Khi chúng ta tập trung vào những tiến bộ nhỏ mỗi ngày, chúng ta có thể cân bằng thời gian biểu bận rộn và cảm thấy có thêm nhiều động lực mỗi ngày.`,
      ],
      targetWords: [
        { word: 'recognized', contextSentence: `Many people have recognized the positive influence of ${cleanTopic}.`, meaningVi: 'nhận ra, công nhận', ipa: '/ˈrekəɡnaɪzd/' },
        { word: 'influence', contextSentence: 'The positive influence on their lives.', meaningVi: 'sức ảnh hưởng, tác động', ipa: '/ˈɪnfluəns/' },
        { word: 'satisfaction', contextSentence: 'Staying consistent brings great satisfaction.', meaningVi: 'sự thỏa mãn, hài lòng', ipa: '/ˌsætɪsˈfækʃn/' },
        { word: 'motivated', contextSentence: 'Feel much more motivated every day.', meaningVi: 'có động lực, hứng khởi', ipa: '/ˈməʊtɪveɪtɪd/' },
      ],
    };
  }

  // Default B2
  return {
    id: `custom_b2_${Date.now()}`,
    title: `The Dynamics of ${cleanTopic} in Contemporary Society`,
    topic: cleanTopic,
    topicCategory: 'psychology',
    difficulty: 'B2',
    genre: 'Article',
    passage: `In our interconnected modern world, ${cleanTopic} plays an increasingly indispensable role in shaping human behaviors and cultural priorities. Understanding the underlying mechanisms of this subject enables individuals to make conscious, well-informed decisions that enrich personal productivity.\n\nPsychologists and researchers highlight that engaging thoughtfully with ${cleanTopic} cultivates genuine curiosity and cognitive agility. By integrating meaningful insights into our everyday routines, we can foster sustainable growth and achieve enduring harmony in an ever-accelerating environment.`,
    translationVi: `Trong thế giới hiện đại siêu kết nối của chúng ta, ${cleanTopic} ngày càng đóng một vai trò không thể thiếu trong việc định hình các hành vi và ưu tiên văn hóa của con người. Việc thấu hiểu các cơ chế nền tảng của chủ đề này cho phép mỗi cá nhân đưa ra những quyết định sáng suốt, có ý thức, từ đó làm phong phú thêm năng suất sống của bản thân.\n\nCác nhà tâm lý học và nghiên cứu nhấn mạnh rằng việc đào sâu suy ngẫm về ${cleanTopic} sẽ vun đắp sự tò mò chân thực cùng tính nhanh nhạy nhận thức. Bằng cách tích hợp những hiểu biết sâu sắc vào nếp sinh hoạt mỗi ngày, chúng ta có thể thúc đẩy sự phát triển bền vững và đạt được sự cân bằng hài hòa dài lâu trong một môi trường sống không ngừng tăng tốc.`,
    sentenceTranslations: [
      `Trong thế giới hiện đại siêu kết nối của chúng ta, ${cleanTopic} ngày càng đóng một vai trò không thể thiếu trong việc định hình các hành vi và ưu tiên văn hóa của con người.`,
      `Việc thấu hiểu các cơ chế nền tảng của chủ đề này cho phép mỗi cá nhân đưa ra những quyết định sáng suốt, có ý thức, từ đó làm phong phú thêm năng suất sống của bản thân.`,
      `Các nhà tâm lý học và nghiên cứu nhấn mạnh rằng việc đào sâu suy ngẫm về ${cleanTopic} sẽ vun đắp sự tò mò chân thực cùng tính nhanh nhạy nhận thức.`,
      `Bằng cách tích hợp những hiểu biết sâu sắc vào nếp sinh hoạt mỗi ngày, chúng ta có thể thúc đẩy sự phát triển bền vững và đạt được sự cân bằng hài hòa dài lâu trong một môi trường sống không ngừng tăng tốc.`,
    ],
    targetWords: [
      { word: 'indispensable', contextSentence: `Plays an increasingly indispensable role in shaping human behaviors.`, meaningVi: 'không thể thiếu, thiết yếu', ipa: '/ˌɪndɪˈspensəbl/' },
      { word: 'mechanisms', contextSentence: 'Understanding the underlying mechanisms of this subject.', meaningVi: 'cơ chế hoạt động bên dưới', ipa: '/ˈmekənɪzəmz/' },
      { word: 'cognitive', contextSentence: 'Cultivates genuine curiosity and cognitive agility.', meaningVi: 'thuộc về nhận thức, trí tuệ', ipa: '/ˈkɒɡnətɪv/' },
      { word: 'accelerating', contextSentence: 'Achieve enduring harmony in an ever-accelerating environment.', meaningVi: 'không ngừng tăng tốc, hối hả', ipa: '/əkˈseləreɪtɪŋ/' },
    ],
  };
}

/**
 * Find matching passage by substring or title in catalog
 */
export function findPassageByTextOrTitle(
  passageText: string,
  title?: string
): GeneratedPassage | undefined {
  if (!passageText && !title) return undefined;

  const cleanPassage = (passageText || '').toLowerCase().trim();
  const cleanTitle = (title || '').toLowerCase().trim();

  return PASSAGE_CATALOG.find((p) => {
    // Match by title
    if (cleanTitle && p.title.toLowerCase().includes(cleanTitle)) {
      return true;
    }
    // Match by snippet / key phrases
    const pLower = p.passage.toLowerCase();
    const firstSent = cleanPassage.slice(0, 60);
    if (firstSent && pLower.includes(firstSent)) {
      return true;
    }
    // Check specific target words overlap
    const wordMatches = p.targetWords.filter((tw) =>
      cleanPassage.includes(tw.word.toLowerCase())
    );
    return wordMatches.length >= 3;
  });
}

/**
 * Generate fresh passage filtered by Level, Topic category, or Custom Topic
 */
export function generateFreshPassage(
  level?: string,
  topic?: string,
  customTopic?: string
): GeneratedPassage {
  // If user provided custom topic text
  if (customTopic && customTopic.trim()) {
    const customResult = generateCustomPassage(
      (level || 'B1') as DialogueDifficulty,
      customTopic.trim()
    );
    lastServedId = customResult.id;
    return customResult;
  }

  const normLevel = (level || 'B2').toUpperCase();

  // Filter by level first
  let candidates = PASSAGE_CATALOG.filter(
    (p) => p.difficulty.toUpperCase() === normLevel
  );

  // If topic provided, filter or match category
  if (topic && topic.trim()) {
    const rawTopic = topic.trim().toLowerCase();
    const topicMatches = candidates.filter(
      (p) =>
        p.topicCategory === rawTopic ||
        p.topic.toLowerCase().includes(rawTopic) ||
        p.title.toLowerCase().includes(rawTopic)
    );
    if (topicMatches.length > 0) {
      candidates = topicMatches;
    } else {
      // If no candidate at this specific level matches the topic, synthesize a custom passage for this exact level & topic
      const topicObj = TOPIC_OPTIONS.find((t) => t.id === rawTopic);
      const topicLabel = topicObj ? topicObj.label : topic.trim();
      const customResult = generateCustomPassage(
        normLevel as DialogueDifficulty,
        topicLabel
      );
      lastServedId = customResult.id;
      return customResult;
    }
  }

  // Synthesize at normLevel if candidates are empty
  if (candidates.length === 0) {
    const customResult = generateCustomPassage(
      normLevel as DialogueDifficulty,
      topic || 'Đời sống hiện đại'
    );
    lastServedId = customResult.id;
    return customResult;
  }

  // Avoid repeating the immediately previous passage
  let filteredCandidates = candidates.filter((p) => p.id !== lastServedId);
  if (filteredCandidates.length === 0) {
    filteredCandidates = candidates;
  }

  const nextIdx = Math.floor(Math.random() * filteredCandidates.length);
  const chosen = filteredCandidates[nextIdx];
  lastServedId = chosen.id;

  return {
    ...chosen,
    id: `${chosen.id}_${Date.now()}`,
  };
}
