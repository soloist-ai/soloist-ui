export const ru = {
  // Общие элементы
  common: {
    loading: 'Загрузка...',
    save: 'Сохранить',
    cancel: 'Отмена',
    close: 'Закрыть',
    closeNotification: 'Закрыть уведомление',
    back: 'Назад',
    prev: 'Пред.',
    next: 'След.',
    confirm: 'Подтвердить',
    continue: 'Продолжить',
    active: 'Активно',
    completed: 'Завершено',
    inProgress: 'В процессе',
    preparing: 'Подготовка',
    pending: 'Ожидает',
    skipped: 'Пропущено',
    success: 'Успешно',
    warning: 'Предупреждение',
    info: 'Информация',
    retry: 'Повторить',
    error: {
      loadingData: 'Ошибка загрузки данных',
    },
    filters: 'Фильтры',
    clearFilters: 'Очистить фильтры',
    resetFilters: 'Сбросить фильтры',
    sortBy: 'Сортировать по',
    noSort: 'Без сортировки',
    ascending: 'По возрастанию',
    descending: 'По убыванию',
    dateRange: 'Диапазон дат',
    loadingData: 'Ошибка загрузки данных',
    noData: 'Данные отсутствуют',
    showFilters: 'Показать фильтры',
    hideFilters: 'Скрыть фильтры',
    from: 'С',
    to: 'По',
    selectDateRange: 'Выберите диапазон дат',
    apply: 'Применить',
    clear: 'Очистить',
    sortFields: {
      createdAt: 'Дата создания',
      amount: 'Сумма'
    },
    today: 'Сегодня',
    yesterday: 'Вчера',
    totalItems: 'Всего: {{total}}',
    months: {
      january: 'Январь',
      february: 'Февраль',
      march: 'Март',
      april: 'Апрель',
      may: 'Май',
      june: 'Июнь',
      july: 'Июль',
      august: 'Август',
      september: 'Сентябрь',
      october: 'Октябрь',
      november: 'Ноябрь',
      december: 'Декабрь'
    },
    monthsGenitive: {
      january: 'января',
      february: 'февраля',
      march: 'марта',
      april: 'апреля',
      may: 'мая',
      june: 'июня',
      july: 'июля',
      august: 'августа',
      september: 'сентября',
      october: 'октября',
      november: 'ноября',
      december: 'декабря'
    },
    days: {
      monday: 'Понедельник',
      tuesday: 'Вторник',
      wednesday: 'Среда',
      thursday: 'Четверг',
      friday: 'Пятница',
      saturday: 'Суббота',
      sunday: 'Воскресенье'
    },
    daysShort: {
      monday: 'Пн',
      tuesday: 'Вт',
      wednesday: 'Ср',
      thursday: 'Чт',
      friday: 'Пт',
      saturday: 'Сб',
      sunday: 'Вс'
    },
  },

  // Навигация
  navigation: {
    title: 'Навигация',
    profile: 'Профиль',
    balance: 'Баланс',
    tasks: 'Задачи',
    topics: 'Темы',
    welcome: 'Главная',
    menu: 'Меню',
  },

  dayStreak: {
    extended: 'Ежедневный стрик продлён!',
    days_one: 'день',
    days_few: 'дня',
    days_many: 'дней',
    current: 'Текущий стрик',
    max: 'Рекорд',
    monthlyActivity: 'Активность за месяц',
    noActivity: 'Нет активности',
    year: 'Год',
  },

  // Приветственная страница
  welcome: {
    title: 'Soloist AI',
    subtitle: 'Level Up Your Reality',
    startButton: 'К задачам',
    feedback: {
      text: 'Есть обратная связь? Поделитесь с нами в боте через команду',
      command: '/feedback',
    },
    stats: {
      activePlayers: 'Активных игроков',
      completedTasks: 'Выполнено задач',
      levelsPassed: 'Уровней пройдено',
    },
    features: {
      quickStart: {
        title: 'Быстрый старт',
        description: 'Начните играть мгновенно',
      },
      targetedTasks: {
        title: 'Целевые задания',
        description: 'Развивайтесь по плану',
      },
      progress: {
        title: 'Прогресс',
        description: 'Отслеживайте рост',
      },
      achievements: {
        title: 'Достижения',
        description: 'Получайте награды',
      },
    },
  },

  // Задачи
  tasks: {
    title: 'Задачи',
    subtitle: 'Выполняй задачи и зарабатывай GEM',
    defaultTasks: 'Ежедневные задачи',
    customTasks: 'Мои задачи',
    taskHistory: 'История',
    createTask: 'Создать задачу',
    submitProof: 'Отправить доказательство',
    completed: 'Выполнено',
    gemReward: '+{{amount}} GEM',
    proofType: {
      TEXT: 'Текст',
      PHOTO: 'Фото',
      VIDEO: 'Видео',
    },
    taskType: {
      STEPS: 'Шаги',
      PUSH_UPS: 'Отжимания',
      SQUATS: 'Приседания',
    },
    createForm: {
      title: 'Создать задачу',
      titleLabel: 'Название задачи',
      titlePlaceholder: 'Что вы хотите сделать?',
      descriptionLabel: 'Описание',
      descriptionPlaceholder: 'Опишите, что нужно сделать...',
      submit: 'Создать',
      validating: 'ИИ проверяет задачу...',
      rejected: 'Задача отклонена: {{reason}}',
    },
    noTasks: 'Нет пользовательских задач',
    noHistory: 'Нет выполненных задач',
  },

  // Темы
  topics: {
    title: 'Выбор топиков',
    subtitle: 'Выберите интересующие вас области для получения персональных заданий',
    save: 'Сохранить',
    saving: 'Сохраняю...',
    noChanges: 'Нет изменений для сохранения',
    selectAtLeastOne: 'Выберите хотя бы один топик для продолжения',
    selected: 'Выбрано топиков',
    status: {
      newProfile: 'Новый профиль',
      hasChanges: 'Есть изменения',
      noChanges: 'Без изменений',
      label: 'Статус',
    },
    info: {
      welcome: {
        title: 'Добро пожаловать!',
        description: 'Выберите интересующие вас области для получения персональных заданий. После сохранения система создаст задачи специально для вас!',
      },
      preferences: {
        title: 'Настройка предпочтений',
        description: 'Измените свои предпочтения в любое время. Система адаптирует задания под ваши интересы.',
      },
    },
    labels: {
      PHYSICAL_ACTIVITY: 'Физическая активность',
      CREATIVITY: 'Креативность',
      SOCIAL_SKILLS: 'Социальные навыки',
      NUTRITION: 'Питание',
      PRODUCTIVITY: 'Продуктивность',
      ADVENTURE: 'Приключения',
      MUSIC: 'Музыка',
      BRAIN: 'Когнитивные навыки',
      CYBERSPORT: 'Киберспорт',
      DEVELOPMENT: 'Разработка',
      READING: 'Чтение',
      LANGUAGE_LEARNING: 'Изучение языков',
    },
  },

  // Профиль
  profile: {
    tabs: {
      level: 'Уровень',
      balance: 'Баланс',
      settings: 'Настройки',
    },
    stats: {
      strength: 'Сила',
      agility: 'Ловкость',
      intelligence: 'Интеллект',
      progress: 'Прогресс',
      class: 'Класс',
      characteristics: 'Характеристики',
    },
    balance: {
      recentTransactions: 'Последние транзакции',
      taskCompletion: 'Выполнение задачи',
      itemPurchase: 'Покупка предмета',
      levelBonus: 'Бонус за уровень',
      today: 'Сегодня',
      yesterday: 'Вчера',
      daysAgo: 'дня назад',
    },
    settings: {
      title: 'Настройки',
      language: {
        title: 'Язык',
        description: 'Выберите язык интерфейса',
        russian: 'Русский',
        english: 'English',
        sourceTitle: 'Источник языка',
        useTelegram: 'Telegram',
        chooseManually: 'Вручную',
        sourceDescription: 'Язык из Telegram или вручную.',
        manualDisabledHint: 'Ручной выбор недоступен, включен режим Telegram',
      },
    },
  },

  // Баланс
  balance: {
    title: 'Баланс',
    subtitle: 'Ваш текущий баланс и история транзакций',
    totalBalance: 'Общий баланс',
    currencyName: 'Soloist Coin',
    topUp: 'Пополнить',
    transfer: 'Перевести',
    transactions: {
      title: 'История транзакций',
      empty: 'Транзакции не найдены',
      emptyDescription: 'Выполняйте задачи, чтобы заработать награды!',
      emptyByFilterDescription: 'По выбранным фильтрам ничего не найдено.'
    },
    empty: 'Пока нет транзакций',
    causes: {
      TASK_COMPLETION: 'Выполнение задачи',
      LEVEL_UP: 'Бонус за повышение уровня',
      DAILY_CHECK_IN: 'Ежедневная отметка',
      ITEM_PURCHASE: 'Покупка предмета',
    },
        filters: {
          period: 'Период',
          reset: 'Сбросить',
          selectPeriod: 'Выберите период',
          selected: 'выбрано',
        },
  },

  // Диалоги и модальные окна
  dialogs: {
    task: {
      close: 'Закрыть',
      rewardsTitle: 'Награды',
      experience: 'Опыт',
      coins: 'Монеты',
      statsTitle: 'Характеристики',
      categoriesTitle: 'Категории',
      createdAt: 'Создана',
      completedAt: 'Завершена',
      skippedAt: 'Пропущена',
    },
    sessionExpired: {
      message: 'Сессия истекла. Пожалуйста, обновите страницу для продолжения работы.',
      refreshButton: 'Обновить страницу',
    },
    uiUpdate: {
      message: 'Доступна новая версия приложения. Обновить сейчас?',
      chunkErrorMessage: 'Приложение обновилось на сервере. Чтобы продолжить работу, нужно обновить страницу.',
      refreshButton: 'Обновить',
      laterButton: 'Позже',
    },
  },

  maintenance: {
    title: 'Технические работы',
    description: 'Проводятся технические работы. Пожалуйста, попробуйте позже.',
  },

  // Ошибки и сообщения
  errors: {
    telegramRequired: 'Требуется Telegram',
    authError: 'Ошибка авторизации',
    loadingError: 'Ошибка загрузки',
    saveError: 'Ошибка сохранения',
    taskCompleteFailed: 'Ошибка при выполнении задачи',
    taskSkipFailed: 'Ошибка при пропуске задачи',
    insufficientStamina: 'Недостаточно стамины!',
  },
  // Редкости задач
  rarity: {
    COMMON: 'Обычная',
    UNCOMMON: 'Необычная',
    RARE: 'Редкая',
    EPIC: 'Эпическая',
    LEGENDARY: 'Легендарная',
  },

  // Карточки задач
  taskCard: {
    complete: 'Готово',
    replace: 'Заменить',
    completed: 'Завершено',
    skipped: 'Пропущено',
    generating: 'Генерируется...',
  },

  // Диалог завершения задачи
  taskCompletion: {
    title: 'Задача выполнена!',
    level: 'Уровень',
    experience: 'Опыт',
    topicsProgress: 'Прогресс по темам',
    stats: 'Характеристики',
    balance: 'Баланс',
    balanceGained: 'за выполнение задачи',
    continue: 'Продолжить',
  },

  // Меню
  menu: {
    tabs: {
      leaderboard: 'ТАБЛИЦА ЛИДЕРОВ',
      guilds: 'ГИЛЬДИИ',
      dungeons: 'ДАНЖИ',
    },
    leaderboard: {
      title: 'Таблица лидеров',
      subtitle: 'Соревнуйся с другими игроками и поднимайся в рейтинге',
      yourPosition: 'Ваша позиция',
    },
    types: {
      level: 'По уровню',
      tasks: 'По задачам',
      balance: 'По балансу',
    },
    score: {
      level: 'Уровень',
      tasks: 'Выполнено задач',
      balance: 'Баланс',
    },
    guilds: {
      comingSoon: 'Скоро',
      description: 'Гильдии будут доступны в ближайшее время',
    },
    dungeons: {
      comingSoon: 'Скоро',
      description: 'Данжи будут доступны в ближайшее время',
    },
  },
};
