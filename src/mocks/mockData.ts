import type {
  User,
  PlayerTask,
  Task,
  GetUserResponse,
  GetActiveTasksResponse,
  GetPlayerTopicsResponse,
  GetPlayerBalanceResponse,
  PlayerTaskTopic,
  CompleteTaskResponse,
  LoginResponse,
  RefreshResponse,
  SearchPlayerBalanceTransactionsResponse,
  SearchPlayerTasksResponse,
  PlayerBalanceTransaction,
  Level,
  JwtToken,
  LeaderboardUser,
  GetUsersLeaderboardResponse,
  Stamina,
} from '../api';
import {
  TaskTopic,
  TaskRarity,
  Assessment,
  PlayerTaskStatus,
  PlayerBalanceTransactionType,
  PlayerBalanceTransactionCause,
  JwtTokenType,
} from '../api';

// Моковые данные для пользователя
export const mockUser: User = {
  id: 1,
  username: 'mock_user',
  firstName: 'Mock',
  lastName: 'User',
  photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MockUser&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
  locale: 'ru',
  player: {
    id: 1,
    agility: 10,
    strength: 15,
    intelligence: 12,
    level: {
      id: 'level-1',
      level: 5,
      totalExperience: 2500,
      currentExperience: 500,
      experienceToNextLevel: 1000,
      assessment: Assessment.B,
    },
    balance: {
      id: 'balance-1',
      balance: {
        currencyCode: 'GOLD',
        amount: 1500,
      },
    },
    taskTopics: [],
  },
};

// Моковые уровни для топиков
const createMockLevel = (level: number, assessment: Assessment): Level => ({
  id: `level-${level}`,
  level,
  totalExperience: level * 500,
  currentExperience: (level * 500) % 1000,
  experienceToNextLevel: 1000,
  assessment,
});

// Моковые топики игрока
export const mockPlayerTopics: PlayerTaskTopic[] = [
  {
    id: 'topic-1',
    version: 1,
    isActive: true,
    isDisabled: false,
    taskTopic: TaskTopic.PHYSICAL_ACTIVITY,
    level: createMockLevel(3, Assessment.B),
  },
  {
    id: 'topic-2',
    version: 1,
    isActive: false,
    isDisabled: true,
    taskTopic: TaskTopic.READING,
    level: createMockLevel(5, Assessment.A),
  },
  {
    id: 'topic-3',
    version: 1,
    isActive: false,
    isDisabled: false,
    taskTopic: TaskTopic.CREATIVITY,
    level: createMockLevel(1, Assessment.E),
  },
  {
    id: 'topic-4',
    version: 1,
    isActive: true,
    isDisabled: false,
    taskTopic: TaskTopic.BRAIN,
    level: createMockLevel(2, Assessment.C),
  },
];

// Моковые задачи
export const createMockTask = (
  id: string,
  title: string,
  description: string,
  rarity: TaskRarity,
  topics: TaskTopic[],
  experience: number,
  currencyReward: number
): Task => ({
  id,
  title,
  description,
  experience,
  currencyReward,
  rarity,
  topics,
  agility: 5,
  strength: 5,
  intelligence: 5,
});

// Генерируем много завершенных задач для тестирования lazy loading
const generateCompletedTasks = (): PlayerTask[] => {
  const tasks: PlayerTask[] = [];
  const taskTitles = [
    'Утренняя зарядка', 'Изучить новый язык', 'Пробежка 3 км', 'Медитация 15 минут',
    'Прочитать статью', 'Написать код', 'Решить задачу по алгоритмам', 'Изучить React',
    'Сделать 50 отжиманий', 'Изучить TypeScript', 'Написать тесты', 'Рефакторинг кода',
    'Изучить GraphQL', 'Изучить Docker', 'Изучить Kubernetes', 'Изучить AWS',
    'Изучить Python', 'Изучить Go', 'Изучить Rust', 'Изучить Swift',
    'Йога 30 минут', 'Плавание 1 км', 'Велосипед 10 км', 'Тренировка в зале',
    'Изучить машинное обучение', 'Изучить нейросети', 'Изучить блокчейн', 'Изучить криптографию',
    'Написать блог-пост', 'Создать проект', 'Изучить дизайн', 'Изучить UX/UI',
    'Изучить английский', 'Изучить испанский', 'Изучить китайский', 'Изучить японский',
    'Изучить философию', 'Изучить историю', 'Изучить психологию', 'Изучить экономику',
    'Изучить физику', 'Изучить математику', 'Изучить химию', 'Изучить биологию',
  ];
  const taskDescriptions = [
    'Выполните комплекс утренних упражнений',
    'Потратьте 30 минут на изучение нового языка программирования',
    'Пробегите 3 километра для улучшения физической формы',
    'Проведите 15 минут в медитации для улучшения ментального здоровья',
    'Прочитайте интересную статью по вашей специальности',
    'Напишите новый компонент для проекта',
    'Решите задачу по алгоритмам и структурам данных',
    'Изучите новые возможности React',
    'Выполните 50 отжиманий для развития силы',
    'Изучите возможности TypeScript',
    'Напишите unit-тесты для вашего кода',
    'Проведите рефакторинг существующего кода',
  ];
  const rarities = [TaskRarity.COMMON, TaskRarity.UNCOMMON, TaskRarity.RARE, TaskRarity.EPIC, TaskRarity.LEGENDARY];
  const topics = [TaskTopic.PHYSICAL_ACTIVITY, TaskTopic.READING, TaskTopic.BRAIN, TaskTopic.CREATIVITY];
  
  // Генерируем 60 завершенных/пропущенных задач
  // Создаем задачи в порядке номеров (1, 2, 3...), но с перемешанными статусами
  // Используем детерминированное перемешивание для предсказуемости
  const taskStatuses: PlayerTaskStatus[] = [];
  for (let i = 0; i < 30; i++) {
    taskStatuses.push(PlayerTaskStatus.COMPLETED);
    taskStatuses.push(PlayerTaskStatus.SKIPPED);
  }
  
  // Перемешиваем статусы детерминированно
  let seed = 12345;
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (let i = taskStatuses.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [taskStatuses[i], taskStatuses[j]] = [taskStatuses[j], taskStatuses[i]];
  }
  
  // Создаем задачи в порядке номеров (1, 2, 3...), но с перемешанными статусами
  for (let i = 0; i < 60; i++) {
    const taskStatus = taskStatuses[i];
    const title = taskTitles[i % taskTitles.length];
    const description = taskDescriptions[i % taskDescriptions.length];
    const rarity = rarities[i % rarities.length];
    const topic = topics[i % topics.length];
    
    // Создаем даты в порядке номеров (более новые даты для больших номеров)
    const daysAgo = Math.floor(i / 3);
    const hoursOffset = i % 24;
    const minutesOffset = (i * 11) % 60;
    
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(hoursOffset, minutesOffset, 0, 0);
    
    // Создаем дату создания (раньше на несколько часов)
    const createdAtDate = new Date(date);
    createdAtDate.setHours(createdAtDate.getHours() - 2);
    
    tasks.push({
      id: `task-completed-${i + 1}`,
      order: i + 1,
      status: taskStatus,
      createdAt: createdAtDate.toISOString(),
      updatedAt: date.toISOString(), // Дата завершения/пропуска
      task: createMockTask(
        `task-completed-${i + 1}`,
        `${title} #${i + 1}`,
        description,
        rarity,
        [topic],
        80 + (i % 5) * 20,
        40 + (i % 5) * 10
      ),
    });
  }
  
  return tasks;
};

// Генерируем дату создания для активных задач
const getCreatedAtForActiveTask = (daysAgo: number, hoursAgo: number = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(date.getHours() - hoursAgo);
  return date.toISOString();
};

export const mockTasks: PlayerTask[] = [
  {
    id: 'task-legendary-long',
    order: 0,
    status: PlayerTaskStatus.IN_PROGRESS,
    createdAt: getCreatedAtForActiveTask(1, 3),
    updatedAt: getCreatedAtForActiveTask(1, 3),
    task: createMockTask(
      'task-legendary-long',
      'Очень длинное название задачи для проверки наложения элементов интерфейса друг на друга при максимальной редкости',
      'Это тестовая задача с легендарной редкостью и очень длинным названием, чтобы проверить, не накладываются ли звезды редкости на название задачи',
      TaskRarity.LEGENDARY,
      [TaskTopic.READING, TaskTopic.BRAIN],
      500,
      250
    ),
  },
  {
    id: 'task-1',
    order: 1,
    status: PlayerTaskStatus.PREPARING,
    createdAt: getCreatedAtForActiveTask(0, 1),
    updatedAt: getCreatedAtForActiveTask(0, 1),
    task: createMockTask(
      'task-1',
      'Пробежка 5 км',
      'Пробегите 5 километров для улучшения физической формы',
      TaskRarity.COMMON,
      [TaskTopic.PHYSICAL_ACTIVITY],
      100,
      50
    ),
  },
  {
    id: 'task-2',
    order: 2,
    status: PlayerTaskStatus.IN_PROGRESS,
    createdAt: getCreatedAtForActiveTask(0, 5),
    updatedAt: getCreatedAtForActiveTask(0, 5),
    task: createMockTask(
      'task-2',
      'Прочитать главу книги',
      'Прочитайте одну главу из книги по программированию',
      TaskRarity.UNCOMMON,
      [TaskTopic.READING],
      150,
      75
    ),
  },
  {
    id: 'task-3',
    order: 3,
    status: PlayerTaskStatus.IN_PROGRESS,
    createdAt: getCreatedAtForActiveTask(0, 8),
    updatedAt: getCreatedAtForActiveTask(0, 8),
    task: createMockTask(
      'task-3',
      'Медитация 10 минут',
      'Проведите 10 минут в медитации для улучшения ментального здоровья',
      TaskRarity.COMMON,
      [TaskTopic.BRAIN],
      80,
      40
    ),
  },
  {
    id: 'task-4',
    order: 4,
    status: PlayerTaskStatus.IN_PROGRESS,
    createdAt: getCreatedAtForActiveTask(1, 2),
    updatedAt: getCreatedAtForActiveTask(1, 2),
    task: createMockTask(
      'task-4',
      'Написать код',
      'Напишите новый компонент для проекта',
      TaskRarity.RARE,
      [TaskTopic.CREATIVITY, TaskTopic.READING],
      200,
      100
    ),
  },
  {
    id: 'task-5',
    order: 5,
    status: PlayerTaskStatus.IN_PROGRESS,
    createdAt: getCreatedAtForActiveTask(1, 6),
    updatedAt: getCreatedAtForActiveTask(1, 6),
    task: createMockTask(
      'task-5',
      'Тренировка и изучение',
      'Проведите тренировку и изучите новую технику',
      TaskRarity.UNCOMMON,
      [TaskTopic.PHYSICAL_ACTIVITY, TaskTopic.READING],
      180,
      90
    ),
  },
  {
    id: 'task-6',
    order: 6,
    status: PlayerTaskStatus.IN_PROGRESS,
    createdAt: getCreatedAtForActiveTask(2, 1),
    updatedAt: getCreatedAtForActiveTask(2, 1),
    task: createMockTask(
      'task-6',
      'Медитация и творчество',
      'Проведите медитацию и создайте что-то новое',
      TaskRarity.RARE,
      [TaskTopic.BRAIN, TaskTopic.CREATIVITY],
      160,
      80
    ),
  },
  {
    id: 'task-7',
    order: 7,
    status: PlayerTaskStatus.IN_PROGRESS,
    createdAt: getCreatedAtForActiveTask(2, 4),
    updatedAt: getCreatedAtForActiveTask(2, 4),
    task: createMockTask(
      'task-7',
      'Йога и обучение',
      'Выполните комплекс йоги и изучите новую тему',
      TaskRarity.COMMON,
      [TaskTopic.PHYSICAL_ACTIVITY, TaskTopic.BRAIN],
      120,
      60
    ),
  },
  // Добавляем сгенерированные завершенные задачи
  ...generateCompletedTasks(),
];

// Генерируем много транзакций для тестирования lazy loading
const generateMockTransactions = (): PlayerBalanceTransaction[] => {
  const transactions: PlayerBalanceTransaction[] = [];
  const causes = [
    PlayerBalanceTransactionCause.TASK_COMPLETION,
    PlayerBalanceTransactionCause.DAILY_CHECK_IN,
    PlayerBalanceTransactionCause.LEVEL_UP,
    PlayerBalanceTransactionCause.ITEM_PURCHASE,
  ];
  
  // Генерируем 80 транзакций
  for (let i = 0; i < 80; i++) {
    const daysAgo = Math.floor(i / 3); // Распределяем по дням
    const cause = causes[i % causes.length];
    const type = cause === PlayerBalanceTransactionCause.ITEM_PURCHASE
      ? PlayerBalanceTransactionType.OUT
      : PlayerBalanceTransactionType.IN;
    const amount = type === PlayerBalanceTransactionType.IN
      ? 50 + (i % 10) * 10 // 50-140 для входящих
      : 100 + (i % 5) * 20; // 100-180 для исходящих
    
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(8 + (i % 12), (i * 7) % 60, 0, 0);
    
    transactions.push({
      id: `trans-${i + 1}`,
      amount: {
        currencyCode: 'GOLD',
        amount,
      },
      type,
      cause,
      createdAt: date.toISOString(),
    });
  }
  
  return transactions;
};

export const mockTransactions: PlayerBalanceTransaction[] = generateMockTransactions();

// Моковые токены
const createMockJwtToken = (type: JwtTokenType): JwtToken => {
  const expiration = new Date();
  expiration.setHours(expiration.getHours() + 24);
  return {
    token: `mock_${type}_token_${Date.now()}`,
    expiration: expiration.toISOString(),
    type,
  };
};

// API Responses
export const mockGetUserResponse: GetUserResponse = {
  user: mockUser,
};

// Моковые данные для стамины
export const mockStamina: Stamina = {
  id: 'mock-stamina',
  current: 100,
  max: 100,
  isRegenerating: true,
  regenRate: 1,
  regenIntervalSeconds: 10, // Восстановление каждые 10 секунд
  nextRegenAt: new Date(Date.now() + 10 * 1000).toISOString(), // Через 10 секунд
  fullRegenAt: new Date(Date.now() + (100 - 100) * 10 * 1000).toISOString(), // Полное восстановление когда current = max
};

export const mockGetActiveTasksResponse: GetActiveTasksResponse = {
  tasks: mockTasks,
  stamina: mockStamina,
  isFirstTime: false,
};

export const mockGetPlayerTopicsResponse: GetPlayerTopicsResponse = {
  playerTaskTopics: mockPlayerTopics,
};

export const mockGetPlayerBalanceResponse: GetPlayerBalanceResponse = {
  balance: mockUser.player.balance!,
};

export const mockLoginResponse: LoginResponse = {
  accessToken: createMockJwtToken(JwtTokenType.ACCESS),
  refreshToken: createMockJwtToken(JwtTokenType.REFRESH),
};

export const mockRefreshResponse: RefreshResponse = {
  accessToken: createMockJwtToken(JwtTokenType.ACCESS),
};

export const mockCompleteTaskResponse: CompleteTaskResponse = {
  playerBefore: {
    ...mockUser.player,
    level: {
      ...mockUser.player.level!,
      currentExperience: mockUser.player.level!.currentExperience,
    },
  },
  playerAfter: {
    ...mockUser.player,
    level: {
      ...mockUser.player.level!,
      currentExperience: mockUser.player.level!.currentExperience + 100,
      totalExperience: mockUser.player.level!.totalExperience + 100,
    },
    balance: {
      ...mockUser.player.balance!,
      balance: {
        currencyCode: 'GOLD',
        amount: mockUser.player.balance!.balance.amount + 50,
      },
    },
  },
};

export const mockSearchPlayerTasksResponse: SearchPlayerTasksResponse = {
  tasks: mockTasks.filter(t => t.status === PlayerTaskStatus.COMPLETED || t.status === PlayerTaskStatus.SKIPPED),
  paging: {
    totalRowCount: 2,
    totalPageCount: 1,
    currentPage: 0,
    currentPageSize: 2,
  },
  options: {},
};

export const mockSearchPlayerBalanceTransactionsResponse: SearchPlayerBalanceTransactionsResponse = {
  transactions: mockTransactions,
  paging: {
    totalRowCount: mockTransactions.length,
    totalPageCount: 1,
    currentPage: 0,
    currentPageSize: mockTransactions.length,
  },
  options: {},
};

// Моковые данные для лидерборда
export const generateMockLeaderboardUsers = (count: number, offset: number = 0): LeaderboardUser[] => {
  const users: LeaderboardUser[] = [];
  const firstNames = ['Александр', 'Дмитрий', 'Максим', 'Иван', 'Сергей', 'Андрей', 'Алексей', 'Владимир', 'Николай', 'Павел'];
  const lastNames = ['Иванов', 'Петров', 'Сидоров', 'Смирнов', 'Кузнецов', 'Попов', 'Соколов', 'Лебедев', 'Козлов', 'Новиков'];
  
  for (let i = 0; i < count; i++) {
    const position = offset + i + 1;
    const firstName = firstNames[(offset + i) % firstNames.length];
    const lastName = lastNames[(offset + i) % lastNames.length];
    
    users.push({
      id: 1000 + offset + i,
      firstName,
      lastName,
      photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
      score: 10000 - (offset + i) * 50 - Math.floor(Math.random() * 100),
      position,
    });
  }
  
  return users;
};

export const createMockLeaderboardResponse = (
  page: number,
  pageSize: number = 20,
  totalUsers: number = 200
): GetUsersLeaderboardResponse => {
  const offset = page * pageSize;
  const users = generateMockLeaderboardUsers(Math.min(pageSize, totalUsers - offset), offset);
  const totalPages = Math.ceil(totalUsers / pageSize);
  return {
    users,
    paging: {
      totalRowCount: totalUsers,
      totalPageCount: totalPages,
      currentPage: page,
      currentPageSize: users.length,
    },
  };
};

// Моковые данные для Telegram WebApp
export const mockTelegramUser = {
  id: 123456789,
  first_name: 'Mock',
  last_name: 'User',
  username: 'mock_user',
  language_code: 'ru',
  is_premium: false,
  photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MockUser&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf',
};

export const mockTelegramWebAppData = {
  user: mockTelegramUser,
  auth_date: Math.floor(Date.now() / 1000),
  hash: 'mock_hash_string',
  query_id: 'mock_query_id',
  start_param: '',
};

