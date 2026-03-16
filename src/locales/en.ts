export const en = {
  // Common elements
  common: {
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    closeNotification: 'Close notification',
    back: 'Back',
    prev: 'Prev.',
    next: 'Next',
    confirm: 'Confirm',
    continue: 'Continue',
    active: 'Active',
    completed: 'Completed',
    inProgress: 'In Progress',
    preparing: 'Preparing',
    pending: 'Pending',
    skipped: 'Skipped',
    success: 'Success',
    warning: 'Warning',
    info: 'Information',
    retry: 'Retry',
    filters: 'Filters',
    clearFilters: 'Clear Filters',
    resetFilters: 'Reset Filters',
    sortBy: 'Sort by',
    noSort: 'No sorting',
    ascending: 'Ascending',
    descending: 'Descending',
    dateRange: 'Date Range',
    loadingData: 'Error loading data',
    noData: 'No data available',
    error: {
      loadingData: 'Error loading data',
    },
    showFilters: 'Show Filters',
    hideFilters: 'Hide Filters',
    from: 'From',
    to: 'To',
    selectDateRange: 'Select Date Range',
    apply: 'Apply',
    clear: 'Clear',
    sortFields: {
      createdAt: 'Creation Date',
      amount: 'Amount'
    },
    today: 'Today',
    yesterday: 'Yesterday',
    totalItems: 'Total: {{total}}',
    months: {
      january: 'January',
      february: 'February',
      march: 'March',
      april: 'April',
      may: 'May',
      june: 'June',
      july: 'July',
      august: 'August',
      september: 'September',
      october: 'October',
      november: 'November',
      december: 'December'
    },
    monthsGenitive: {
      january: 'January',
      february: 'February',
      march: 'March',
      april: 'April',
      may: 'May',
      june: 'June',
      july: 'July',
      august: 'August',
      september: 'September',
      october: 'October',
      november: 'November',
      december: 'December'
    },
    days: {
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday'
    },
    daysShort: {
      monday: 'Mon',
      tuesday: 'Tue',
      wednesday: 'Wed',
      thursday: 'Thu',
      friday: 'Fri',
      saturday: 'Sat',
      sunday: 'Sun'
    },
  },

  // Navigation
  navigation: {
    title: 'Navigation',
    profile: 'Profile',
    balance: 'Balance',
    tasks: 'Tasks',
    topics: 'Topics',
    welcome: 'Home',
    menu: 'Menu',
  },

  dayStreak: {
    extended: 'Daily streak extended!',
    days_one: 'day',
    days_few: 'days',
    days_many: 'days',
    days_other: 'days',
    current: 'Current streak',
    max: 'Best',
    monthlyActivity: 'Monthly activity',
    noActivity: 'No activity',
    year: 'Year',
  },

  // Welcome page
  welcome: {
    title: 'Soloist AI',
    subtitle: 'Level Up Your Reality',
    startButton: 'To Tasks',
    feedback: {
      text: 'Have feedback? Share it with us in the bot using',
      command: '/feedback',
    },
    stats: {
      activePlayers: 'Active Players',
      completedTasks: 'Completed Tasks',
      levelsPassed: 'Levels Passed',
    },
    features: {
      quickStart: {
        title: 'Quick Start',
        description: 'Start playing instantly',
      },
      targetedTasks: {
        title: 'Targeted Tasks',
        description: 'Develop according to plan',
      },
      progress: {
        title: 'Progress',
        description: 'Track your growth',
      },
      achievements: {
        title: 'Achievements',
        description: 'Earn rewards',
      },
    },
  },

  // Tasks
  tasks: {
    title: 'Your Tasks',
    subtitle: 'Develop every day with personalized assignments',
    stamina: {
      title: 'Stamina',
      nextRegen: 'Next regeneration',
      fullRegen: 'Full regeneration',
      now: 'Now',
      fullyRestored: 'Fully restored',
      regenRate: 'Regeneration',
      every: 'every',
      seconds: 'sec',
      minutes: 'min',
      hours: 'h',
      hoverForDetails: 'Hover for details',
      insufficientStamina: 'Not enough stamina. Required: {{required}}, you have: {{current}}',
    },
    noTasks: {
      title: 'Choose Your Topics',
      subtitle: 'This will help select the best tasks for you and create a personal development plan',
      button: 'Go to Topics',
    },
    status: {
      preparing: 'Preparing',
      inProgress: 'In Progress',
      pendingCompletion: 'Pending Completion',
      completed: 'Completed',
      skipped: 'Skipped',
    },
    actions: {
      complete: 'Complete',
      replace: 'Replace',
    },
    buttons: {
      complete: 'Done',
      replace: 'Replace',
    },
    confirm: {
      complete: 'Are you sure you want to complete this task?',
      replace: 'Are you sure you want to replace this task?',
    },
    viewMode: {
      active: 'Active',
      completed: 'Completed',
      daily: 'Daily',
    },
    daily: {
      empty: 'No daily tasks for today',
    },
    noCompletedTasks: 'No completed tasks',
    noCompletedTasksDescription: 'Complete tasks to see them here!',
    noCompletedTasksByFilterDescription: 'Nothing found for the selected filters.',
    filters: {
      reset: 'Reset Filters',
    },
  },

  // Topics
  topics: {
    title: 'Topic Selection',
    subtitle: 'Choose areas of interest to receive personalized assignments',
    save: 'Save',
    saving: 'Saving...',
    noChanges: 'No changes to save',
    selectAtLeastOne: 'Select at least one topic to continue',
    selected: 'Topics Selected',
    status: {
      newProfile: 'New Profile',
      hasChanges: 'Has Changes',
      noChanges: 'No Changes',
      label: 'Status',
    },
    info: {
      welcome: {
        title: 'Welcome!',
        description: 'Choose areas of interest to receive personalized assignments. After saving, the system will create tasks specifically for you!',
      },
      preferences: {
        title: 'Preference Settings',
        description: 'Change your preferences at any time. The system will adapt assignments to your interests.',
      },
    },
    labels: {
      PHYSICAL_ACTIVITY: 'Physical Activity',
      CREATIVITY: 'Creativity',
      SOCIAL_SKILLS: 'Social Skills',
      NUTRITION: 'Nutrition',
      PRODUCTIVITY: 'Productivity',
      ADVENTURE: 'Adventure',
      MUSIC: 'Music',
      BRAIN: 'Cognitive Skills',
      CYBERSPORT: 'Cybersport',
      DEVELOPMENT: 'Development',
      READING: 'Reading',
      LANGUAGE_LEARNING: 'Language Learning',
    },
  },

  // Profile
  profile: {
    tabs: {
      level: 'Level',
      balance: 'Balance',
      settings: 'Settings',
    },
    stats: {
      strength: 'Strength',
      agility: 'Agility',
      intelligence: 'Intelligence',
      progress: 'Progress',
      class: 'Class',
      characteristics: 'Characteristics',
    },
    balance: {
      recentTransactions: 'Recent Transactions',
      taskCompletion: 'Task Completion',
      itemPurchase: 'Item Purchase',
      levelBonus: 'Level Bonus',
      today: 'Today',
      yesterday: 'Yesterday',
      daysAgo: 'days ago',
    },
    settings: {
      title: 'Settings',
      language: {
        title: 'Language',
        description: 'Choose interface language',
        russian: 'Русский',
        english: 'English',
        sourceTitle: 'Language source',
        useTelegram: 'Telegram',
        chooseManually: 'Manual',
        sourceDescription: 'Use Telegram or manual.',
        manualDisabledHint: 'Manual selection disabled while Telegram mode is on',
      },
    },
  },

  // Balance
  balance: {
    title: 'Balance',
    subtitle: 'Your current balance and transaction history',
    totalBalance: 'Total Balance',
    currencyName: 'Soloist Coin',
    topUp: 'Top Up',
    transfer: 'Transfer',
    transactions: {
      title: 'Transaction History',
      empty: 'No transactions yet',
      emptyDescription: 'Complete tasks to earn rewards!',
      emptyByFilterDescription: 'Nothing found for the selected filters.'
    },
    empty: 'No transactions yet',
    causes: {
      TASK_COMPLETION: 'Task Completion',
      LEVEL_UP: 'Level Up Bonus',
      DAILY_CHECK_IN: 'Daily Check-in',
      ITEM_PURCHASE: 'Item Purchase',
    },
        filters: {
          period: 'Period',
          reset: 'Reset',
          selectPeriod: 'Select Period',
          selected: 'selected',
        },
  },

  // Dialogs and modals
  dialogs: {
    task: {
      close: 'Close',
      rewardsTitle: 'Rewards',
      experience: 'Experience',
      coins: 'Coins',
      statsTitle: 'Stats',
      categoriesTitle: 'Categories',
      createdAt: 'Created',
      completedAt: 'Completed',
      skippedAt: 'Skipped',
    },
    sessionExpired: {
      message: 'Session expired. Please refresh the page to continue.',
      refreshButton: 'Refresh Page',
    },
    uiUpdate: {
      message: 'A new version of the app is available. Refresh now?',
      chunkErrorMessage: 'The app was updated on the server. Please refresh the page to continue.',
      refreshButton: 'Refresh',
      laterButton: 'Later',
    },
  },

  maintenance: {
    title: 'Technical maintenance',
    description: 'We are carrying out technical work. Please try again later.',
  },

  // Errors and messages
  errors: {
    telegramRequired: 'Telegram Required',
    authError: 'Authentication Error',
    loadingError: 'Loading Error',
    saveError: 'Save Error',
    taskCompleteFailed: 'Error completing task',
    taskSkipFailed: 'Error skipping task',
    insufficientStamina: 'Not enough stamina!',
  },
  // Task rarity
  rarity: {
    COMMON: 'Common',
    UNCOMMON: 'Uncommon',
    RARE: 'Rare',
    EPIC: 'Epic',
    LEGENDARY: 'Legendary',
  },

  // Task cards
  taskCard: {
    complete: 'Done',
    replace: 'Replace',
    completed: 'Completed',
    skipped: 'Skipped',
    generating: 'Generating...',
  },

  // Task completion dialog
  taskCompletion: {
    title: 'Task Completed!',
    level: 'Level',
    experience: 'Experience',
    topicsProgress: 'Topics Progress',
    stats: 'Stats',
    balance: 'Balance',
    balanceGained: 'for task completion',
    continue: 'Continue',
  },

  // Menu
  menu: {
    tabs: {
      leaderboard: 'LEADERBOARD',
      guilds: 'GUILDS',
      dungeons: 'DUNGEONS',
    },
    leaderboard: {
      title: 'Leaderboard',
      subtitle: 'Compete with other players and climb the rankings',
      yourPosition: 'Your Position',
    },
    types: {
      level: 'By Level',
      tasks: 'By Tasks',
      balance: 'By Balance',
    },
    score: {
      level: 'Level',
      tasks: 'Completed Tasks',
      balance: 'Balance',
    },
    guilds: {
      comingSoon: 'Coming Soon',
      description: 'Guilds will be available soon',
    },
    dungeons: {
      comingSoon: 'Coming Soon',
      description: 'Dungeons will be available soon',
    },
  },
};
