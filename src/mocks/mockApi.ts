import type {
  LoginResponse,
  RefreshResponse,
  GetUserResponse,
  GetActiveTasksResponse,
  GetPlayerTopicsResponse,
  GetPlayerBalanceResponse,
  CompleteTaskResponse,
  SearchPlayerBalanceTransactionsResponse,
  SearchPlayerTasksResponse,
  GetUsersLeaderboardResponse,
  GetUsersLeaderboardRequest,
  GetUserLeaderboardResponse,
  TgAuthData,
  RefreshRequest,
  SavePlayerTopicsRequest,
  SearchRequest,
  LocalizedField,
  PlayerTask,
  User,
} from '../api';
import {
  mockGetUserResponse,
  mockGetActiveTasksResponse,
  mockGetPlayerBalanceResponse,
  mockLoginResponse,
  mockRefreshResponse,
  mockTasks,
  mockTransactions,
  mockPlayerTopics,
  generateMockLeaderboardUsers,
  mockUser,
  createMockLeaderboardResponse,
  mockStamina,
} from './mockData';
import { PlayerTaskStatus, TaskRarity, TaskTopic, Assessment, LeaderboardType } from '../api';
import { createMockTask } from './mockData';
import { CancelablePromise } from '../api';
import type { Stamina } from '../api';

// Имитация задержки сети
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

export { getTaskStaminaCost, SKIP_STAMINA_COST } from '../utils/taskUtils';

// Хранилище состояния для моков (симулирует состояние на сервере)
class MockState {
  private tasks = [...mockTasks];
  private playerTopics = [...mockPlayerTopics];
  private completedTaskIds = new Set<string>();
  private taskIdCounter = 1000; // Счетчик для новых задач
  private preparingTaskTimers = new Map<string, NodeJS.Timeout>(); // Таймеры для задач в статусе PREPARING
  private initialized = false; // Флаг инициализации таймеров
  private stamina: Stamina = { ...mockStamina }; // Состояние стамины
  private playerState = {
    strength: mockUser.player.strength || 0,
    agility: mockUser.player.agility || 0,
    intelligence: mockUser.player.intelligence || 0,
    level: {
      level: mockUser.player.level?.level || 1,
      currentExperience: mockUser.player.level?.currentExperience || 0,
      totalExperience: mockUser.player.level?.totalExperience || 0,
      experienceToNextLevel: mockUser.player.level?.experienceToNextLevel || 1000,
    },
    balance: {
      amount: mockUser.player.balance?.balance?.amount || 0,
    },
  };


  constructor() {
    // Запускаем таймеры для всех задач в статусе PREPARING при инициализации
    this.initializePreparingTasks();
  }

  private initializePreparingTasks(): void {
    if (this.initialized) return;
    this.initialized = true;
    
    // Запускаем таймеры для всех задач в статусе PREPARING
    this.tasks.forEach(task => {
      if (task.status === PlayerTaskStatus.PREPARING && task.id) {
        this.scheduleTaskStatusChange(task.id);
      }
    });
  }

  getTasks(): GetActiveTasksResponse {
    // Убеждаемся, что таймеры запущены
    this.initializePreparingTasks();
    // Проверяем и обновляем стамину при загрузке страницы
    this.checkAndUpdateStaminaOnLoad();
    
    return {
      ...mockGetActiveTasksResponse,
      tasks: this.tasks.filter(t => t.status !== 'COMPLETED' && t.status !== 'SKIPPED'),
      stamina: { ...this.stamina },
    };
  }

  private updateFullRegenTime(): void {
    const now = new Date();
    if (this.stamina.current >= this.stamina.max) {
      this.stamina.fullRegenAt = undefined;
      return;
    }
    
    const remainingStamina = this.stamina.max - this.stamina.current;
    const fullRegenTime = new Date(now.getTime() + remainingStamina * this.stamina.regenIntervalSeconds * 1000);
    this.stamina.fullRegenAt = fullRegenTime.toISOString();
  }

  // Проверка и обновление стамины при загрузке страницы или перед операциями
  private checkAndUpdateStaminaOnLoad(): void {
    const now = new Date();
    
    // Если стамина полная, ничего не делаем
    if (this.stamina.current >= this.stamina.max) {
      this.stamina.isRegenerating = false;
      this.stamina.nextRegenAt = undefined;
      this.stamina.fullRegenAt = undefined;
      return;
    }
    
    // Если нет времени следующего восстановления, устанавливаем его
    if (!this.stamina.nextRegenAt) {
      this.stamina.isRegenerating = true;
      this.stamina.nextRegenAt = new Date(now.getTime() + this.stamina.regenIntervalSeconds * 1000).toISOString();
      this.updateFullRegenTime();
      return;
    }
    
    let nextRegen = new Date(this.stamina.nextRegenAt);
    
    // Если время восстановления уже прошло, прибавляем стамину и устанавливаем следующее время
    // Используем цикл для обработки всех прошедших интервалов
    while (now >= nextRegen && this.stamina.current < this.stamina.max) {
      // Прибавляем стамину
      this.stamina.current = Math.min(
        this.stamina.current + this.stamina.regenRate,
        this.stamina.max
      );
      
      // Устанавливаем следующее время восстановления
      if (this.stamina.current < this.stamina.max) {
        const newNextRegen = new Date(nextRegen.getTime() + this.stamina.regenIntervalSeconds * 1000);
        this.stamina.nextRegenAt = newNextRegen.toISOString();
        this.updateFullRegenTime();
        // Обновляем nextRegen для следующей итерации цикла
        nextRegen = new Date(newNextRegen);
      } else {
        // Стамина полностью восстановлена
        this.stamina.isRegenerating = false;
        this.stamina.nextRegenAt = undefined;
        this.stamina.fullRegenAt = undefined;
        break;
      }
    }
    
    // Если время еще не подошло, просто обновляем время полного восстановления
    if (this.stamina.current < this.stamina.max && this.stamina.nextRegenAt) {
      this.updateFullRegenTime();
    }
  }

  // Проверка, достаточно ли стамины для выполнения задачи
  canCompleteTask(taskRarity?: TaskRarity): boolean {
    const staminaCost = getTaskStaminaCost(taskRarity);
    return this.stamina.current >= staminaCost;
  }

  // Проверка, достаточно ли стамины для скипа задачи
  canSkipTask(): boolean {
    return this.stamina.current >= SKIP_STAMINA_COST;
  }

  // Получение текущей стамины
  getStamina(): Stamina {
    return { ...this.stamina };
  }

  getPlayerTopics(): GetPlayerTopicsResponse {
    return {
      playerTaskTopics: this.playerTopics,
    };
  }

  private generateNewTask(): PlayerTask {
    const taskTitles = [
      'Утренняя зарядка', 'Изучить новый язык', 'Пробежка 3 км', 'Медитация 15 минут',
      'Прочитать статью', 'Написать код', 'Решить задачу по алгоритмам', 'Изучить React',
      'Сделать 50 отжиманий', 'Изучить TypeScript', 'Написать тесты', 'Рефакторинг кода',
      'Йога 30 минут', 'Плавание 1 км', 'Велосипед 10 км', 'Тренировка в зале',
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
    ];
    const rarities = [TaskRarity.COMMON, TaskRarity.UNCOMMON, TaskRarity.RARE, TaskRarity.EPIC, TaskRarity.LEGENDARY];
    const topics = [TaskTopic.PHYSICAL_ACTIVITY, TaskTopic.READING, TaskTopic.BRAIN, TaskTopic.CREATIVITY];

    const randomIndex = Math.floor(Math.random() * taskTitles.length);
    const taskId = `task-${this.taskIdCounter++}`;
    const maxOrder = Math.max(...this.tasks.map(t => t.order || 0), 0);

    const now = new Date();
    const newTask: PlayerTask = {
      id: taskId,
      order: maxOrder + 1,
      status: PlayerTaskStatus.PREPARING,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      task: createMockTask(
        taskId,
        taskTitles[randomIndex],
        taskDescriptions[randomIndex % taskDescriptions.length],
        rarities[randomIndex % rarities.length],
        [topics[randomIndex % topics.length]],
        80 + (randomIndex % 5) * 20,
        40 + (randomIndex % 5) * 10
      ),
    };
    return newTask;
  }

  private sendTaskNotification(message: string): void {
    // Отправляем notification через window.dispatchEvent для моков
    // Это будет обработано так же, как WebSocket сообщения
    if (typeof window !== 'undefined') {
      const notificationEvent = new CustomEvent('mock-notification', {
        detail: {
          payload: {
            message,
            type: 'INFO' as any,
            source: 'TASKS' as any,
            visible: true,
          },
          timestamp: new Date().toISOString(),
        }
      });
      window.dispatchEvent(notificationEvent);
    }
  }

  private scheduleTaskStatusChange(taskId: string): void {
    // Отменяем предыдущий таймер, если есть
    const existingTimer = this.preparingTaskTimers.get(taskId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Устанавливаем таймер на 3 секунды для перехода в IN_PROGRESS
    const timer = setTimeout(() => {
      const task = this.tasks.find(t => t.id === taskId);
      if (task && task.status === PlayerTaskStatus.PREPARING) {
        task.status = PlayerTaskStatus.IN_PROGRESS;
        this.preparingTaskTimers.delete(taskId);
        
        // Отправляем notification о том, что задача готова
        this.sendTaskNotification(`Новая задача "${task.task?.title || 'Задача'}" готова к выполнению!`);
        
        // Отправляем событие для обновления списка задач
        const event = new CustomEvent('tasks-notification', {
          detail: { source: 'tasks' }
        });
        window.dispatchEvent(event);
      }
    }, 3000);

    this.preparingTaskTimers.set(taskId, timer);
  }

  completeTask(taskId: string): CompleteTaskResponse {
    // Обновляем стамину на основе времени перед проверкой
    // Это гарантирует, что стамина актуальна даже если она обновлялась локально в UI
    this.checkAndUpdateStaminaOnLoad();
    
    const taskIndex = this.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }

    const completedTask = this.tasks[taskIndex];
    const task = completedTask.task;
    if (!task) {
      throw new Error('Task data not found');
    }

    // Проверяем наличие достаточного количества стамины
    const staminaCost = getTaskStaminaCost(task.rarity);
    if (this.stamina.current < staminaCost) {
      throw new Error(`Not enough stamina. Required: ${staminaCost}, Current: ${this.stamina.current}`);
    }

    // Списываем стамину
    this.stamina.current = Math.max(0, this.stamina.current - staminaCost);
    
    // Обновляем время полного восстановления после списания
    this.updateFullRegenTime();

    this.completedTaskIds.add(taskId);
    
    // Получаем текущее состояние игрока
    const playerBefore = {
      ...mockUser.player,
      strength: this.playerState.strength,
      agility: this.playerState.agility,
      intelligence: this.playerState.intelligence,
      level: {
        ...mockUser.player.level!,
        level: this.playerState.level.level,
        currentExperience: this.playerState.level.currentExperience,
        totalExperience: this.playerState.level.totalExperience,
        experienceToNextLevel: this.playerState.level.experienceToNextLevel,
      },
      balance: {
        ...mockUser.player.balance!,
        balance: {
          ...mockUser.player.balance!.balance,
          amount: this.playerState.balance.amount,
        },
      },
      taskTopics: this.playerTopics.map(tp => ({
        ...tp,
        level: {
          ...tp.level,
          currentExperience: tp.level.currentExperience,
          totalExperience: tp.level.totalExperience,
        },
      })),
    };

    // Обновляем атрибуты игрока
    const newStrength = this.playerState.strength + (task.strength || 0);
    const newAgility = this.playerState.agility + (task.agility || 0);
    const newIntelligence = this.playerState.intelligence + (task.intelligence || 0);

    // Обновляем опыт игрока
    const expGain = task.experience || 0;
    const newCurrentExp = this.playerState.level.currentExperience + expGain;
    const newTotalExp = this.playerState.level.totalExperience + expGain;
    
    // Проверяем, нужно ли повысить уровень
    let newLevel = this.playerState.level.level;
    let finalCurrentExp = newCurrentExp;
    const expToNextLevel = this.playerState.level.experienceToNextLevel;
    
    if (finalCurrentExp >= expToNextLevel) {
      newLevel += 1;
      finalCurrentExp = finalCurrentExp - expToNextLevel;
    }

    // Обновляем баланс
    const currencyGain = task.currencyReward || 0;
    const newBalanceAmount = this.playerState.balance.amount + currencyGain;

    // Обновляем опыт топиков
    const updatedTopics = [...this.playerTopics];
    const perTopicExpGain = task.topics && task.topics.length > 0
      ? Math.floor(expGain / task.topics.length)
      : 0;

    task.topics?.forEach(topic => {
      const topicIndex = updatedTopics.findIndex(tp => tp.taskTopic === topic);
      if (topicIndex >= 0) {
        const topicData = updatedTopics[topicIndex];
        const newTopicCurrentExp = (topicData.level.currentExperience || 0) + perTopicExpGain;
        const newTopicTotalExp = (topicData.level.totalExperience || 0) + perTopicExpGain;
        
        let newTopicLevel = topicData.level.level || 1;
        let finalTopicCurrentExp = newTopicCurrentExp;
        const topicExpToNextLevel = topicData.level.experienceToNextLevel || 1000;
        
        if (finalTopicCurrentExp >= topicExpToNextLevel) {
          newTopicLevel += 1;
          finalTopicCurrentExp = finalTopicCurrentExp - topicExpToNextLevel;
        }

        updatedTopics[topicIndex] = {
          ...topicData,
          level: {
            ...topicData.level,
            level: newTopicLevel,
            currentExperience: finalTopicCurrentExp,
            totalExperience: newTopicTotalExp,
          },
        };
      } else {
        // Создаем новый топик, если его нет
        updatedTopics.push({
          id: `topic-${Date.now()}-${Math.random()}`,
          version: 1,
          isActive: true,
          isDisabled: false,
          taskTopic: topic,
          level: {
            id: `level-${Date.now()}`,
            level: 1,
            totalExperience: perTopicExpGain,
            currentExperience: perTopicExpGain,
            experienceToNextLevel: 1000,
            assessment: 'E' as any,
          },
        });
      }
    });

    // Обновляем состояние топиков
    this.playerTopics = updatedTopics;

    // Создаем playerAfter
    const playerAfter = {
      ...playerBefore,
      strength: newStrength,
      agility: newAgility,
      intelligence: newIntelligence,
      level: {
        ...playerBefore.level!,
        level: newLevel,
        currentExperience: finalCurrentExp,
        totalExperience: newTotalExp,
      },
      balance: {
        ...playerBefore.balance!,
        balance: {
          ...playerBefore.balance!.balance,
          amount: newBalanceAmount,
        },
      },
      taskTopics: updatedTopics,
    };

    // Обновляем состояние игрока для последующих запросов
    this.playerState = {
      strength: newStrength,
      agility: newAgility,
      intelligence: newIntelligence,
      level: {
        level: newLevel,
        currentExperience: finalCurrentExp,
        totalExperience: newTotalExp,
        experienceToNextLevel: expToNextLevel,
      },
      balance: {
        amount: newBalanceAmount,
      },
    };

    // СРАЗУ заменяем старую задачу на новую в статусе PREPARING
    const newTask = this.generateNewTask();
    this.tasks[taskIndex] = newTask;
    
    // Запускаем таймер для перехода в IN_PROGRESS
    if (newTask.id) {
      this.scheduleTaskStatusChange(newTask.id);
    }
    
    // Отправляем событие для обновления списка задач
    const event = new CustomEvent('tasks-notification', {
      detail: { source: 'tasks' }
    });
    window.dispatchEvent(event);

    return {
      playerBefore,
      playerAfter,
    };
  }

  skipTask(taskId: string): void {
    // Обновляем стамину на основе времени перед проверкой
    // Это гарантирует, что стамина актуальна даже если она обновлялась локально в UI
    this.checkAndUpdateStaminaOnLoad();
    
    const taskIndex = this.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }

    // Проверяем наличие достаточного количества стамины
    if (this.stamina.current < SKIP_STAMINA_COST) {
      throw new Error(`Not enough stamina. Required: ${SKIP_STAMINA_COST}, Current: ${this.stamina.current}`);
    }

    // Списываем стамину
    this.stamina.current = Math.max(0, this.stamina.current - SKIP_STAMINA_COST);
    
    // Обновляем время полного восстановления после списания
    this.updateFullRegenTime();

    // СРАЗУ заменяем старую задачу на новую в статусе PREPARING
    const newTask = this.generateNewTask();
    this.tasks[taskIndex] = newTask;
    
    // Запускаем таймер для перехода в IN_PROGRESS
    if (newTask.id) {
      this.scheduleTaskStatusChange(newTask.id);
    }
    
    // Отправляем событие для обновления списка задач
    const event = new CustomEvent('tasks-notification', {
      detail: { source: 'tasks' }
    });
    window.dispatchEvent(event);
  }

  savePlayerTopics(topics: SavePlayerTopicsRequest): void {
    // Обновляем топики
    if (!topics.playerTaskTopics) {
      return;
    }
    topics.playerTaskTopics.forEach(updatedTopic => {
      const index = this.playerTopics.findIndex(
        pt => pt.taskTopic === updatedTopic.taskTopic
      );
      if (index >= 0) {
        this.playerTopics[index] = { ...this.playerTopics[index], ...updatedTopic };
      } else {
        this.playerTopics.push(updatedTopic);
      }
    });
  }

  generateTasks(): void {
    // Генерируем новые задачи (в реальности это делал бы сервер)
    // Для мока просто возвращаем существующие задачи
  }
}

const mockState = new MockState();

// Моковые API сервисы
export const mockAuthService = {
  login: (requestBody: TgAuthData): CancelablePromise<LoginResponse> => {
    return new CancelablePromise(async (resolve) => {
      // Имитация сетевой задержки для тестирования анимации загрузки
      // В реальном приложении задержка будет зависеть от сети пользователя
      await delay(3000);
      resolve(mockLoginResponse);
    });
  },

  refresh: (requestBody: RefreshRequest): CancelablePromise<RefreshResponse> => {
    return new CancelablePromise(async (resolve) => {
      await delay(300);
      resolve(mockRefreshResponse);
    });
  },
};

export const mockUserService = {
  getCurrentUser: (): CancelablePromise<GetUserResponse> => {
    return new CancelablePromise(async (resolve) => {
      await delay(400);
      resolve(mockGetUserResponse);
    });
  },

  getUser: (userId: number): CancelablePromise<GetUserResponse> => {
    return new CancelablePromise(async (resolve) => {
      await delay(400);
      // Создаем моковые данные для пользователя на основе его ID
      // Генерируем пользователей из лидерборда
      const allUsers = generateMockLeaderboardUsers(200);
      const leaderboardUser = allUsers.find(u => u.id === userId);
      const mockUserData: User = leaderboardUser ? {
        id: leaderboardUser.id,
        username: `user_${leaderboardUser.id}`,
        firstName: leaderboardUser.firstName,
        lastName: leaderboardUser.lastName,
        photoUrl: leaderboardUser.photoUrl,
        locale: 'ru',
        player: {
          id: leaderboardUser.id,
          agility: 10 + (leaderboardUser.id % 10),
          strength: 15 + (leaderboardUser.id % 10),
          intelligence: 12 + (leaderboardUser.id % 10),
          level: {
            id: `level-${leaderboardUser.id}`,
            level: Math.floor(leaderboardUser.score / 100) || 1,
            totalExperience: leaderboardUser.score * 10,
            currentExperience: (leaderboardUser.score * 10) % 1000,
            experienceToNextLevel: 1000,
            assessment: leaderboardUser.id <= 3 ? Assessment.A : Assessment.B,
          },
          balance: {
            id: `balance-${leaderboardUser.id}`,
            balance: {
              currencyCode: 'GOLD',
              amount: leaderboardUser.score || 0,
            },
          },
          taskTopics: [],
        },
      } : mockUser;
      resolve({ user: mockUserData });
    });
  },

  getUserAdditionalInfo: (): CancelablePromise<any> => {
    return new CancelablePromise(async (resolve) => {
      await delay(200);
      resolve({
        photoUrl: undefined,
        dayStreak: {
          id: 'mock-streak',
          current: 3,
          max: 7,
        },
        locale: {
          tag: 'ru',
          isManual: false
        },
        roles: []
      });
    });
  },

  updateUserLocale: (requestBody: any): CancelablePromise<any> => {
    return new CancelablePromise(async (resolve) => {
      await delay(300);
      resolve({ locale: requestBody.locale || 'ru' });
    });
  },

  getUsersLeaderboard: (
    type: LeaderboardType,
    requestBody: GetUsersLeaderboardRequest,
    page?: number,
    pageSize: number = 20
  ): CancelablePromise<GetUsersLeaderboardResponse> => {
    return new CancelablePromise(async (resolve) => {
      await delay(400);
      const currentPage = page || 0;
      const response = createMockLeaderboardResponse(currentPage, pageSize, 200);
      resolve(response);
    });
  },

  getUserLeaderboard: (
    type: LeaderboardType,
    requestBody: GetUsersLeaderboardRequest,
  ): CancelablePromise<GetUserLeaderboardResponse> => {
    return new CancelablePromise(async (resolve, reject) => {
      await delay(400);
      
      // Для тестирования 404: возвращаем 404 статус
      // reject({ status: 404, message: 'User not found in leaderboard' });
      
      // Генерируем моковые данные для текущего пользователя
      // Позиция может быть далеко в списке (например, 12345 для проверки отображения больших чисел)
      const currentUserId = mockUser.id;
      const mockPosition = 12345; // Позиция текущего пользователя в лидерборде (большое число для тестирования)
      
      // Вычисляем score в зависимости от типа лидерборда
      let score: number;
      if (type === LeaderboardType.LEVEL) {
        score = mockUser.player?.level?.totalExperience || 2500;
      } else if (type === LeaderboardType.BALANCE) {
        score = mockUser.player?.balance?.balance?.amount || 1500;
      } else {
        score = 1000;
      }
      
      const currentUserLeaderboard: GetUserLeaderboardResponse = {
        user: {
          id: currentUserId,
          firstName: mockUser.firstName || 'User',
          ...(mockUser.lastName && { lastName: mockUser.lastName }),
          ...(mockUser.photoUrl && { photoUrl: mockUser.photoUrl }),
          score: score,
          position: mockPosition,
        },
      };
      
      resolve(currentUserLeaderboard);
    });
  },
};

export const mockPlayerService = {
  getCurrentPlayerTopics: (): CancelablePromise<GetPlayerTopicsResponse> => {
    return new CancelablePromise(async (resolve) => {
      await delay(400);
      resolve(mockState.getPlayerTopics());
    });
  },

  getPlayerTopics: (playerId: number): CancelablePromise<GetPlayerTopicsResponse> => {
    return new CancelablePromise(async (resolve) => {
      await delay(400);
      resolve(mockState.getPlayerTopics());
    });
  },

  savePlayerTopics: (requestBody: SavePlayerTopicsRequest): CancelablePromise<void> => {
    return new CancelablePromise(async (resolve) => {
      await delay(500);
      mockState.savePlayerTopics(requestBody);
      resolve(undefined);
    });
  },

  getActiveTasks: (): CancelablePromise<GetActiveTasksResponse> => {
    return new CancelablePromise(async (resolve) => {
      await delay(400);
      resolve(mockState.getTasks());
    });
  },

  generateTasks: (): CancelablePromise<void> => {
    return new CancelablePromise(async (resolve) => {
      await delay(600);
      mockState.generateTasks();
      resolve(undefined);
    });
  },

  completeTask: (id: string): CancelablePromise<CompleteTaskResponse> => {
    return new CancelablePromise(async (resolve, reject) => {
      await delay(500);
      try {
        const response = mockState.completeTask(id);
        resolve(response);
        // Имитация: после выполнения задачи считаем, что выполнена daily task — отправляем событие для оверлея продления стрика
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('day-streak-notification', {
              detail: { message: 'Ежедневный стрик продлён!' },
            }));
          }
        }, 300);
      } catch (error) {
        reject(error);
      }
    });
  },

  skipTask: (id: string): CancelablePromise<void> => {
    return new CancelablePromise(async (resolve, reject) => {
      await delay(400);
      try {
        mockState.skipTask(id);
        resolve(undefined);
      } catch (error) {
        reject(error);
      }
    });
  },

  getPlayerBalance: (): CancelablePromise<GetPlayerBalanceResponse> => {
    return new CancelablePromise(async (resolve) => {
      await delay(400);
      resolve(mockGetPlayerBalanceResponse);
    });
  },

  searchPlayerBalanceTransactions: (
    requestBody: SearchRequest,
    page?: number,
    pageSize: number = 20
  ): CancelablePromise<SearchPlayerBalanceTransactionsResponse> => {
    return new CancelablePromise(async (resolve) => {
      await delay(400);
      
      let filteredTransactions = [...mockTransactions];
      
      // Применяем фильтры по датам
      if (requestBody.options?.filter?.dateFilters) {
        requestBody.options.filter.dateFilters.forEach(dateFilter => {
          if (dateFilter.field === 'createdAt' && dateFilter.range?.from && dateFilter.range?.to) {
            const fromDate = new Date(dateFilter.range.from);
            const toDate = new Date(dateFilter.range.to);
            filteredTransactions = filteredTransactions.filter(transaction => {
              const transactionDate = new Date(transaction.createdAt);
              return transactionDate >= fromDate && transactionDate <= toDate;
            });
          }
        });
      }
      
      // Применяем enum фильтры
      if (requestBody.options?.filter?.enumFilters) {
        requestBody.options.filter.enumFilters.forEach(enumFilter => {
          if (enumFilter.values.length > 0) {
            if (enumFilter.field === 'type') {
              filteredTransactions = filteredTransactions.filter(transaction => 
                enumFilter.values.includes(transaction.type.toString())
              );
            } else if (enumFilter.field === 'cause') {
              filteredTransactions = filteredTransactions.filter(transaction => 
                enumFilter.values.includes(transaction.cause.toString())
              );
            }
          }
        });
      }
      
      // Сортируем по дате создания (новые сначала)
      filteredTransactions.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      // Применяем пагинацию
      const currentPage = page || 0;
      const startIndex = currentPage * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);
      const hasMore = endIndex < filteredTransactions.length;
      
      // Моковые доступные фильтры
      const mockFilters: LocalizedField[] = [
        {
          field: 'type',
          localization: 'Тип',
          items: [
            { name: 'IN', localization: 'Пополнение' },
            { name: 'OUT', localization: 'Списание' },
          ]
        },
        {
          field: 'cause',
          localization: 'Причина',
          items: [
            { name: 'TASK_COMPLETION', localization: 'Выполнение задачи' },
            { name: 'DAILY_CHECK_IN', localization: 'Ежедневный вход' },
            { name: 'LEVEL_UP', localization: 'Повышение уровня' },
            { name: 'ITEM_PURCHASE', localization: 'Покупка предмета' },
          ]
        }
      ];
      
      const response: SearchPlayerBalanceTransactionsResponse = {
        transactions: paginatedTransactions,
        paging: {
          totalRowCount: filteredTransactions.length,
          totalPageCount: Math.ceil(filteredTransactions.length / pageSize),
          currentPage: currentPage,
          hasMore: hasMore,
        },
        options: {
          filters: mockFilters,
        },
      };
      
      resolve(response);
    });
  },

  getDailyTasks: (): CancelablePromise<{ tasks?: import('../api').PlayerDailyTask[] }> => {
    return new CancelablePromise(async (resolve) => {
      await delay(200);
      resolve({
        tasks: [
          {
            id: 'daily-1',
            title: 'Выполни 2 задачи',
            progress: 1,
            goal: 2,
            isCompleted: false,
          },
          {
            id: 'daily-2',
            title: 'Потрать 1000 монет',
            progress: 350,
            goal: 1000,
            isCompleted: false,
          },
          {
            id: 'daily-3',
            title: 'Зайди в приложение',
            progress: 1,
            goal: 1,
            isCompleted: true,
          },
        ],
      });
    });
  },

  getMonthlyActivity: (year: number, month: number): CancelablePromise<{ activeDays?: number[] }> => {
    return new CancelablePromise(async (resolve) => {
      await delay(200);
      // Мок: несколько активных дней в текущем месяце (1, 5, 10, 15, 20)
      const today = new Date().getDate();
      const activeDays = [1, 5, Math.min(10, today), Math.min(15, today), Math.min(20, today)].filter(
        (d, i, arr) => arr.indexOf(d) === i && d <= new Date(year, month, 0).getDate()
      );
      resolve({ activeDays });
    });
  },

  searchPlayerTasks: (
    requestBody: SearchRequest,
    page?: number,
    pageSize: number = 20
  ): CancelablePromise<SearchPlayerTasksResponse> => {
    return new CancelablePromise(async (resolve) => {
      await delay(400);
      
      // Фильтруем задачи по статусам из запроса
      let filteredTasks = [...mockTasks];
      
      // Применяем фильтры по датам
      if (requestBody.options?.filter?.dateFilters) {
        requestBody.options.filter.dateFilters.forEach(dateFilter => {
          if (dateFilter.field === 'createdAt' && dateFilter.range?.from && dateFilter.range?.to) {
            const fromDate = new Date(dateFilter.range.from);
            const toDate = new Date(dateFilter.range.to);
            filteredTasks = filteredTasks.filter(task => {
              if (!task.createdAt) return false;
              const taskDate = new Date(task.createdAt);
              return taskDate >= fromDate && taskDate <= toDate;
            });
          }
        });
      }
      
      // Применяем enum фильтры
      if (requestBody.options?.filter?.enumFilters) {
        requestBody.options.filter.enumFilters.forEach(enumFilter => {
          if (enumFilter.values.length > 0) {
            if (enumFilter.field === 'status') {
              filteredTasks = filteredTasks.filter(task => 
                task.status && enumFilter.values.includes(task.status.toString())
              );
            } else if (enumFilter.field === 'rarity') {
              // Фильтр по редкости задачи
              filteredTasks = filteredTasks.filter(task => 
                task.task?.rarity && enumFilter.values.includes(task.task.rarity.toString())
              );
            } else if (enumFilter.field === 'topic') {
              // Фильтр по темам задачи
              filteredTasks = filteredTasks.filter(task => {
                if (!task.task?.topics || task.task.topics.length === 0) return false;
                return task.task.topics.some(topic => 
                  enumFilter.values.includes(topic.toString())
                );
              });
            } else {
              // Для других enum фильтров
              filteredTasks = filteredTasks.filter(task => {
                const taskValue = (task as any)[enumFilter.field];
                return taskValue && enumFilter.values.includes(taskValue.toString());
              });
            }
          }
        });
      }
      
      // Не сортируем задачи - оставляем порядок как в исходном массиве
      
      // Применяем пагинацию
      const currentPage = page || 0;
      const startIndex = currentPage * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedTasks = filteredTasks.slice(startIndex, endIndex);
      const hasMore = endIndex < filteredTasks.length;
      
      
      // Моковые доступные фильтры (можно расширить)
      const mockFilters: LocalizedField[] = [
        {
          field: 'rarity',
          localization: 'Редкость',
          items: [
            { name: 'COMMON', localization: 'Обычная' },
            { name: 'UNCOMMON', localization: 'Необычная' },
            { name: 'RARE', localization: 'Редкая' },
            { name: 'EPIC', localization: 'Эпическая' },
            { name: 'LEGENDARY', localization: 'Легендарная' },
          ]
        },
        {
          field: 'topic',
          localization: 'Тема',
          items: [
            { name: 'PHYSICAL_ACTIVITY', localization: 'Физическая активность' },
            { name: 'CREATIVITY', localization: 'Креативность' },
            { name: 'SOCIAL_SKILLS', localization: 'Социальные навыки' },
            { name: 'NUTRITION', localization: 'Питание' },
            { name: 'PRODUCTIVITY', localization: 'Продуктивность' },
            { name: 'ADVENTURE', localization: 'Приключения' },
            { name: 'MUSIC', localization: 'Музыка' },
            { name: 'BRAIN', localization: 'Мозг' },
            { name: 'CYBERSPORT', localization: 'Киберспорт' },
            { name: 'DEVELOPMENT', localization: 'Разработка' },
            { name: 'READING', localization: 'Чтение' },
            { name: 'LANGUAGE_LEARNING', localization: 'Изучение языков' },
          ]
        }
      ];
      
      const response: SearchPlayerTasksResponse = {
        tasks: paginatedTasks,
        paging: {
          totalRowCount: filteredTasks.length,
          totalPageCount: Math.ceil(filteredTasks.length / pageSize),
          currentPage: currentPage,
          hasMore: hasMore,
        },
        options: {
          filters: mockFilters,
          sorts: ['createdAt', 'updatedAt', 'order']
        },
      };
      
      resolve(response);
    });
  },
};

