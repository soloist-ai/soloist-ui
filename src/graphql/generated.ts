import { GraphQLClient, RequestOptions } from 'graphql-request';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
type GraphQLClientRequestHeaders = RequestOptions['requestHeaders'];
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  BigDecimal: { input: string; output: string; }
  Date: { input: string; output: string; }
  DateTime: { input: string; output: string; }
  Long: { input: number; output: number; }
  UUID: { input: string; output: string; }
};

export type ActiveTasksResult = {
  __typename?: 'ActiveTasksResult';
  isFirstTime: Scalars['Boolean']['output'];
  tasks: Array<PlayerTask>;
};

export enum Assessment {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
  S = 'S'
}

export type Balance = {
  __typename?: 'Balance';
  amount: Money;
  id: Scalars['UUID']['output'];
  transactions: SearchBalanceTransactionsResult;
};


export type BalanceTransactionsArgs = {
  options?: InputMaybe<SearchOptionsInput>;
  paging: PagingInput;
};

export type BalanceTransaction = {
  __typename?: 'BalanceTransaction';
  amount: Money;
  cause: BalanceTransactionCause;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  type: BalanceTransactionType;
};

export enum BalanceTransactionCause {
  DAILY_CHECK_IN = 'DAILY_CHECK_IN',
  ITEM_PURCHASE = 'ITEM_PURCHASE',
  LEVEL_UP = 'LEVEL_UP',
  TASK_COMPLETION = 'TASK_COMPLETION'
}

export enum BalanceTransactionType {
  IN = 'IN',
  OUT = 'OUT'
}

export type ClosedPlayerTasksResult = {
  __typename?: 'ClosedPlayerTasksResult';
  options?: Maybe<ResponseQueryOptions>;
  paging: ResponsePaging;
  tasks: Array<PlayerTask>;
};

export type CompleteTaskBalance = {
  __typename?: 'CompleteTaskBalance';
  amount: Money;
  id: Scalars['UUID']['output'];
};

export type CompleteTaskPlayer = {
  __typename?: 'CompleteTaskPlayer';
  agility: Scalars['Int']['output'];
  balance: CompleteTaskBalance;
  id: Scalars['Long']['output'];
  intelligence: Scalars['Int']['output'];
  level: Level;
  strength: Scalars['Int']['output'];
  taskTopics: Array<PlayerTaskTopic>;
};

export type CompleteTaskResult = {
  __typename?: 'CompleteTaskResult';
  playerAfter: CompleteTaskPlayer;
  playerBefore: CompleteTaskPlayer;
};

export type DailyTasksResult = {
  __typename?: 'DailyTasksResult';
  tasks: Array<PlayerDailyTask>;
};

export type DateFilterInput = {
  field: Scalars['String']['input'];
  range: DayRangeInput;
};

export type DayRangeInput = {
  from: Scalars['Date']['input'];
  to: Scalars['Date']['input'];
};

export type DayStreak = {
  __typename?: 'DayStreak';
  current: Scalars['Int']['output'];
  id: Scalars['UUID']['output'];
  isExtendedToday: Scalars['Boolean']['output'];
  max: Scalars['Int']['output'];
};

export type EnumFilterInput = {
  field: Scalars['String']['input'];
  values: Array<Scalars['String']['input']>;
};

export type FilterInput = {
  dateFilters?: InputMaybe<Array<DateFilterInput>>;
  enumFilters?: InputMaybe<Array<EnumFilterInput>>;
};

export type LeaderboardFilterInput = {
  range?: InputMaybe<DayRangeInput>;
  type: LeaderboardType;
};

export enum LeaderboardType {
  BALANCE = 'BALANCE',
  LEVEL = 'LEVEL',
  TASKS = 'TASKS'
}

export type LeaderboardUser = {
  __typename?: 'LeaderboardUser';
  firstName: Scalars['String']['output'];
  id: Scalars['Long']['output'];
  lastName?: Maybe<Scalars['String']['output']>;
  photoUrl?: Maybe<Scalars['String']['output']>;
  position: Scalars['Long']['output'];
  score: Scalars['String']['output'];
};

export type Level = {
  __typename?: 'Level';
  assessment: Assessment;
  currentExperience: Scalars['Int']['output'];
  experienceToNextLevel: Scalars['Int']['output'];
  id: Scalars['UUID']['output'];
  level: Scalars['Int']['output'];
  totalExperience: Scalars['Int']['output'];
};

export type LocalizedField = {
  __typename?: 'LocalizedField';
  field: Scalars['String']['output'];
  items: Array<LocalizedItem>;
  localization: Scalars['String']['output'];
};

export type LocalizedItem = {
  __typename?: 'LocalizedItem';
  localization: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type Money = {
  __typename?: 'Money';
  amount: Scalars['BigDecimal']['output'];
  currencyCode: Scalars['String']['output'];
};

export type MonthlyActivityResult = {
  __typename?: 'MonthlyActivityResult';
  activeDays: Array<Scalars['Int']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  completeTask: CompleteTaskResult;
  generateTasks: Scalars['Boolean']['output'];
  savePlayerTopics: Scalars['Boolean']['output'];
  skipTask: Scalars['Boolean']['output'];
  updateUserLocale: Scalars['Boolean']['output'];
};


export type MutationCompleteTaskArgs = {
  id: Scalars['UUID']['input'];
};


export type MutationSavePlayerTopicsArgs = {
  topics: Array<PlayerTaskTopicInput>;
};


export type MutationSkipTaskArgs = {
  id: Scalars['UUID']['input'];
};


export type MutationUpdateUserLocaleArgs = {
  locale: UserLocaleInput;
};

export enum OrderMode {
  ASC = 'ASC',
  DESC = 'DESC'
}

export type PagingInput = {
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
};

export type Player = {
  __typename?: 'Player';
  activeTasks: ActiveTasksResult;
  agility: Scalars['Int']['output'];
  balance: Balance;
  closedTasks: ClosedPlayerTasksResult;
  dailyTasks: DailyTasksResult;
  dayStreak: DayStreak;
  id: Scalars['Long']['output'];
  intelligence: Scalars['Int']['output'];
  level: Level;
  monthlyActivity: MonthlyActivityResult;
  stamina: Stamina;
  strength: Scalars['Int']['output'];
  taskTopics: PlayerTopicsResult;
};


export type PlayerClosedTasksArgs = {
  options?: InputMaybe<SearchOptionsInput>;
  paging: PagingInput;
};


export type PlayerMonthlyActivityArgs = {
  month: Scalars['Int']['input'];
  year: Scalars['Int']['input'];
};

export type PlayerDailyTask = {
  __typename?: 'PlayerDailyTask';
  goal: Scalars['BigDecimal']['output'];
  id: Scalars['UUID']['output'];
  isCompleted: Scalars['Boolean']['output'];
  progress: Scalars['BigDecimal']['output'];
  title: Scalars['String']['output'];
};

export type PlayerTask = {
  __typename?: 'PlayerTask';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['UUID']['output'];
  order: Scalars['Int']['output'];
  status: PlayerTaskStatus;
  task: Task;
  updatedAt: Scalars['DateTime']['output'];
};

export enum PlayerTaskStatus {
  COMPLETED = 'COMPLETED',
  IN_PROGRESS = 'IN_PROGRESS',
  PREPARING = 'PREPARING',
  SKIPPED = 'SKIPPED'
}

export type PlayerTaskTopic = {
  __typename?: 'PlayerTaskTopic';
  id: Scalars['UUID']['output'];
  isActive: Scalars['Boolean']['output'];
  isDisabled: Scalars['Boolean']['output'];
  level: Level;
  taskTopic: TaskTopic;
  version: Scalars['Int']['output'];
};

export type PlayerTaskTopicInput = {
  id: Scalars['UUID']['input'];
  isActive: Scalars['Boolean']['input'];
  taskTopic: TaskTopic;
  version: Scalars['Int']['input'];
};

export type PlayerTopicsResult = {
  __typename?: 'PlayerTopicsResult';
  topics: Array<PlayerTaskTopic>;
};

export type Query = {
  __typename?: 'Query';
  me: User;
  user: User;
  userLeaderboard: LeaderboardUser;
  usersLeaderboard: UsersLeaderboardResult;
};


export type QueryUserArgs = {
  id: Scalars['Long']['input'];
};


export type QueryUserLeaderboardArgs = {
  filter: LeaderboardFilterInput;
};


export type QueryUsersLeaderboardArgs = {
  filter: LeaderboardFilterInput;
  paging: PagingInput;
};

export enum Rarity {
  COMMON = 'COMMON',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
  RARE = 'RARE',
  UNCOMMON = 'UNCOMMON'
}

export type ResponsePaging = {
  __typename?: 'ResponsePaging';
  currentPage: Scalars['Int']['output'];
  currentPageSize: Scalars['Int']['output'];
  totalPageCount: Scalars['Long']['output'];
  totalRowCount: Scalars['Long']['output'];
};

export type ResponseQueryOptions = {
  __typename?: 'ResponseQueryOptions';
  filters: Array<LocalizedField>;
  sorts: Array<Scalars['String']['output']>;
};

export type SearchBalanceTransactionsResult = {
  __typename?: 'SearchBalanceTransactionsResult';
  options?: Maybe<ResponseQueryOptions>;
  paging: ResponsePaging;
  transactions: Array<BalanceTransaction>;
};

export type SearchOptionsInput = {
  filter?: InputMaybe<FilterInput>;
  sorts?: InputMaybe<Array<SortInput>>;
};

export type SortInput = {
  field: Scalars['String']['input'];
  mode: OrderMode;
};

export type Stamina = {
  __typename?: 'Stamina';
  current: Scalars['Int']['output'];
  fullRegenAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['UUID']['output'];
  isRegenerating: Scalars['Boolean']['output'];
  max: Scalars['Int']['output'];
  nextRegenAt?: Maybe<Scalars['DateTime']['output']>;
  regenIntervalSeconds: Scalars['Int']['output'];
  regenRate: Scalars['Int']['output'];
};

export type Task = {
  __typename?: 'Task';
  agility: Scalars['Int']['output'];
  currencyReward: Scalars['Int']['output'];
  description?: Maybe<Scalars['String']['output']>;
  experience: Scalars['Int']['output'];
  id: Scalars['UUID']['output'];
  intelligence: Scalars['Int']['output'];
  rarity: Rarity;
  strength: Scalars['Int']['output'];
  title: Scalars['String']['output'];
  topics: Array<TaskTopic>;
};

export enum TaskTopic {
  ADVENTURE = 'ADVENTURE',
  BRAIN = 'BRAIN',
  CREATIVITY = 'CREATIVITY',
  CYBERSPORT = 'CYBERSPORT',
  DEVELOPMENT = 'DEVELOPMENT',
  LANGUAGE_LEARNING = 'LANGUAGE_LEARNING',
  MUSIC = 'MUSIC',
  NUTRITION = 'NUTRITION',
  PHYSICAL_ACTIVITY = 'PHYSICAL_ACTIVITY',
  PRODUCTIVITY = 'PRODUCTIVITY',
  READING = 'READING',
  SOCIAL_SKILLS = 'SOCIAL_SKILLS'
}

export type User = {
  __typename?: 'User';
  firstName: Scalars['String']['output'];
  id: Scalars['Long']['output'];
  lastName?: Maybe<Scalars['String']['output']>;
  locale?: Maybe<UserLocale>;
  photoUrl?: Maybe<Scalars['String']['output']>;
  player: Player;
  roles: Array<UserRole>;
  username?: Maybe<Scalars['String']['output']>;
};

export type UserLocale = {
  __typename?: 'UserLocale';
  isManual: Scalars['Boolean']['output'];
  tag: Scalars['String']['output'];
};

export type UserLocaleInput = {
  isManual: Scalars['Boolean']['input'];
  tag: Scalars['String']['input'];
};

export enum UserRole {
  ADMIN = 'ADMIN',
  DEVELOPER = 'DEVELOPER',
  MANAGER = 'MANAGER',
  USER = 'USER'
}

export type UsersLeaderboardResult = {
  __typename?: 'UsersLeaderboardResult';
  paging: ResponsePaging;
  users: Array<LeaderboardUser>;
};

export type LevelFieldsFragment = { __typename?: 'Level', id: string, level: number, totalExperience: number, currentExperience: number, experienceToNextLevel: number, assessment: Assessment };

export type MoneyFieldsFragment = { __typename?: 'Money', currencyCode: string, amount: string };

export type StaminaFieldsFragment = { __typename?: 'Stamina', id: string, current: number, max: number, isRegenerating: boolean, regenRate: number, regenIntervalSeconds: number, nextRegenAt?: string | null, fullRegenAt?: string | null };

export type DayStreakFieldsFragment = { __typename?: 'DayStreak', id: string, current: number, max: number, isExtendedToday: boolean };

export type TaskFieldsFragment = { __typename?: 'Task', id: string, title: string, description?: string | null, experience: number, currencyReward: number, rarity: Rarity, topics: Array<TaskTopic>, agility: number, strength: number, intelligence: number };

export type PlayerTaskFieldsFragment = { __typename?: 'PlayerTask', id: string, createdAt: string, updatedAt: string, order: number, status: PlayerTaskStatus, task: (
    { __typename?: 'Task' }
    & TaskFieldsFragment
  ) };

export type PlayerDailyTaskFieldsFragment = { __typename?: 'PlayerDailyTask', id: string, title: string, progress: string, goal: string, isCompleted: boolean };

export type PlayerTaskTopicFieldsFragment = { __typename?: 'PlayerTaskTopic', id: string, version: number, isActive: boolean, taskTopic: TaskTopic, isDisabled: boolean, level: (
    { __typename?: 'Level' }
    & LevelFieldsFragment
  ) };

export type ResponsePagingFieldsFragment = { __typename?: 'ResponsePaging', totalRowCount: number, totalPageCount: number, currentPage: number, currentPageSize: number };

export type LeaderboardUserFieldsFragment = { __typename?: 'LeaderboardUser', id: number, firstName: string, lastName?: string | null, photoUrl?: string | null, score: string, position: number };

export type ResponseQueryOptionsFieldsFragment = { __typename?: 'ResponseQueryOptions', sorts: Array<string>, filters: Array<{ __typename?: 'LocalizedField', field: string, localization: string, items: Array<{ __typename?: 'LocalizedItem', name: string, localization: string }> }> };

export type BalanceTransactionFieldsFragment = { __typename?: 'BalanceTransaction', id: string, type: BalanceTransactionType, cause: BalanceTransactionCause, createdAt: string, amount: (
    { __typename?: 'Money' }
    & MoneyFieldsFragment
  ) };

export type UserProfileFieldsFragment = { __typename?: 'User', id: number, username?: string | null, firstName: string, lastName?: string | null, photoUrl?: string | null, roles: Array<UserRole>, locale?: { __typename?: 'UserLocale', tag: string, isManual: boolean } | null, player: { __typename?: 'Player', id: number, agility: number, strength: number, intelligence: number, level: (
      { __typename?: 'Level' }
      & LevelFieldsFragment
    ) } };

export type CompleteTaskPlayerFieldsFragment = { __typename?: 'CompleteTaskPlayer', id: number, agility: number, strength: number, intelligence: number, level: (
    { __typename?: 'Level' }
    & LevelFieldsFragment
  ), balance: { __typename?: 'CompleteTaskBalance', id: string, amount: (
      { __typename?: 'Money' }
      & MoneyFieldsFragment
    ) }, taskTopics: Array<(
    { __typename?: 'PlayerTaskTopic' }
    & PlayerTaskTopicFieldsFragment
  )> };

export type GenerateTasksMutationVariables = Exact<{ [key: string]: never; }>;


export type GenerateTasksMutation = { __typename?: 'Mutation', generateTasks: boolean };

export type CompleteTaskMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;


export type CompleteTaskMutation = { __typename?: 'Mutation', completeTask: { __typename?: 'CompleteTaskResult', playerBefore: (
      { __typename?: 'CompleteTaskPlayer' }
      & CompleteTaskPlayerFieldsFragment
    ), playerAfter: (
      { __typename?: 'CompleteTaskPlayer' }
      & CompleteTaskPlayerFieldsFragment
    ) } };

export type SkipTaskMutationVariables = Exact<{
  id: Scalars['UUID']['input'];
}>;


export type SkipTaskMutation = { __typename?: 'Mutation', skipTask: boolean };

export type SavePlayerTopicsMutationVariables = Exact<{
  topics: Array<PlayerTaskTopicInput> | PlayerTaskTopicInput;
}>;


export type SavePlayerTopicsMutation = { __typename?: 'Mutation', savePlayerTopics: boolean };

export type SavePlayerTopicsAndGenerateMutationVariables = Exact<{
  topics: Array<PlayerTaskTopicInput> | PlayerTaskTopicInput;
}>;


export type SavePlayerTopicsAndGenerateMutation = { __typename?: 'Mutation', savePlayerTopics: boolean, generateTasks: boolean };

export type UpdateUserLocaleMutationVariables = Exact<{
  locale: UserLocaleInput;
}>;


export type UpdateUserLocaleMutation = { __typename?: 'Mutation', updateUserLocale: boolean };

export type GetAppDataQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAppDataQuery = { __typename?: 'Query', me: { __typename?: 'User', id: number, photoUrl?: string | null, roles: Array<UserRole>, locale?: { __typename?: 'UserLocale', tag: string, isManual: boolean } | null, player: { __typename?: 'Player', dayStreak: (
        { __typename?: 'DayStreak' }
        & DayStreakFieldsFragment
      ) } } };

export type GetUserLocaleQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUserLocaleQuery = { __typename?: 'Query', me: { __typename?: 'User', locale?: { __typename?: 'UserLocale', tag: string, isManual: boolean } | null } };

export type RefreshActiveTasksQueryVariables = Exact<{ [key: string]: never; }>;


export type RefreshActiveTasksQuery = { __typename?: 'Query', me: { __typename?: 'User', player: { __typename?: 'Player', activeTasks: { __typename?: 'ActiveTasksResult', isFirstTime: boolean, tasks: Array<(
          { __typename?: 'PlayerTask' }
          & PlayerTaskFieldsFragment
        )> }, stamina: (
        { __typename?: 'Stamina' }
        & StaminaFieldsFragment
      ) } } };

export type GetPlayerStaminaQueryVariables = Exact<{ [key: string]: never; }>;


export type GetPlayerStaminaQuery = { __typename?: 'Query', me: { __typename?: 'User', player: { __typename?: 'Player', stamina: (
        { __typename?: 'Stamina' }
        & StaminaFieldsFragment
      ) } } };

export type RefreshDayStreakQueryVariables = Exact<{ [key: string]: never; }>;


export type RefreshDayStreakQuery = { __typename?: 'Query', me: { __typename?: 'User', player: { __typename?: 'Player', dayStreak: (
        { __typename?: 'DayStreak' }
        & DayStreakFieldsFragment
      ) } } };

export type GetUserProfileQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUserProfileQuery = { __typename?: 'Query', me: (
    { __typename?: 'User' }
    & UserProfileFieldsFragment
  ) };

export type GetPlayerTopicsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetPlayerTopicsQuery = { __typename?: 'Query', me: { __typename?: 'User', player: { __typename?: 'Player', taskTopics: { __typename?: 'PlayerTopicsResult', topics: Array<(
          { __typename?: 'PlayerTaskTopic' }
          & PlayerTaskTopicFieldsFragment
        )> } } } };

export type GetBalanceWithTransactionsQueryVariables = Exact<{
  paging: PagingInput;
  options?: InputMaybe<SearchOptionsInput>;
}>;


export type GetBalanceWithTransactionsQuery = { __typename?: 'Query', me: { __typename?: 'User', player: { __typename?: 'Player', balance: { __typename?: 'Balance', id: string, amount: (
          { __typename?: 'Money' }
          & MoneyFieldsFragment
        ), transactions: { __typename?: 'SearchBalanceTransactionsResult', transactions: Array<(
            { __typename?: 'BalanceTransaction' }
            & BalanceTransactionFieldsFragment
          )>, paging: (
            { __typename?: 'ResponsePaging' }
            & ResponsePagingFieldsFragment
          ), options?: (
            { __typename?: 'ResponseQueryOptions' }
            & ResponseQueryOptionsFieldsFragment
          ) | null } } } } };

export type GetLeaderboardInitialQueryVariables = Exact<{
  paging: PagingInput;
  filter: LeaderboardFilterInput;
}>;


export type GetLeaderboardInitialQuery = { __typename?: 'Query', usersLeaderboard: { __typename?: 'UsersLeaderboardResult', users: Array<(
      { __typename?: 'LeaderboardUser' }
      & LeaderboardUserFieldsFragment
    )>, paging: (
      { __typename?: 'ResponsePaging' }
      & ResponsePagingFieldsFragment
    ) }, userLeaderboard: (
    { __typename?: 'LeaderboardUser' }
    & LeaderboardUserFieldsFragment
  ) };

export type GetUserByIdQueryVariables = Exact<{
  id: Scalars['Long']['input'];
}>;


export type GetUserByIdQuery = { __typename?: 'Query', user: (
    { __typename?: 'User', player: { __typename?: 'Player', balance: { __typename?: 'Balance', id: string, amount: (
          { __typename?: 'Money' }
          & MoneyFieldsFragment
        ) } } }
    & UserProfileFieldsFragment
  ) };

export type GetMonthlyActivityQueryVariables = Exact<{
  year: Scalars['Int']['input'];
  month: Scalars['Int']['input'];
}>;


export type GetMonthlyActivityQuery = { __typename?: 'Query', me: { __typename?: 'User', player: { __typename?: 'Player', monthlyActivity: { __typename?: 'MonthlyActivityResult', activeDays: Array<number> } } } };

export type GetDailyTasksQueryVariables = Exact<{ [key: string]: never; }>;


export type GetDailyTasksQuery = { __typename?: 'Query', me: { __typename?: 'User', player: { __typename?: 'Player', dailyTasks: { __typename?: 'DailyTasksResult', tasks: Array<(
          { __typename?: 'PlayerDailyTask' }
          & PlayerDailyTaskFieldsFragment
        )> } } } };

export type GetBalanceTransactionsQueryVariables = Exact<{
  paging: PagingInput;
  options?: InputMaybe<SearchOptionsInput>;
}>;


export type GetBalanceTransactionsQuery = { __typename?: 'Query', me: { __typename?: 'User', player: { __typename?: 'Player', balance: { __typename?: 'Balance', transactions: { __typename?: 'SearchBalanceTransactionsResult', transactions: Array<(
            { __typename?: 'BalanceTransaction' }
            & BalanceTransactionFieldsFragment
          )>, paging: (
            { __typename?: 'ResponsePaging' }
            & ResponsePagingFieldsFragment
          ), options?: (
            { __typename?: 'ResponseQueryOptions' }
            & ResponseQueryOptionsFieldsFragment
          ) | null } } } } };

export type GetClosedTasksQueryVariables = Exact<{
  paging: PagingInput;
  options?: InputMaybe<SearchOptionsInput>;
}>;


export type GetClosedTasksQuery = { __typename?: 'Query', me: { __typename?: 'User', player: { __typename?: 'Player', closedTasks: { __typename?: 'ClosedPlayerTasksResult', tasks: Array<(
          { __typename?: 'PlayerTask' }
          & PlayerTaskFieldsFragment
        )>, paging: (
          { __typename?: 'ResponsePaging' }
          & ResponsePagingFieldsFragment
        ), options?: (
          { __typename?: 'ResponseQueryOptions' }
          & ResponseQueryOptionsFieldsFragment
        ) | null } } } };

export type GetUsersLeaderboardQueryVariables = Exact<{
  paging: PagingInput;
  filter: LeaderboardFilterInput;
}>;


export type GetUsersLeaderboardQuery = { __typename?: 'Query', usersLeaderboard: { __typename?: 'UsersLeaderboardResult', users: Array<(
      { __typename?: 'LeaderboardUser' }
      & LeaderboardUserFieldsFragment
    )>, paging: (
      { __typename?: 'ResponsePaging' }
      & ResponsePagingFieldsFragment
    ) } };

export const StaminaFieldsFragmentDoc = gql`
    fragment StaminaFields on Stamina {
  id
  current
  max
  isRegenerating
  regenRate
  regenIntervalSeconds
  nextRegenAt
  fullRegenAt
}
    `;
export const DayStreakFieldsFragmentDoc = gql`
    fragment DayStreakFields on DayStreak {
  id
  current
  max
  isExtendedToday
}
    `;
export const TaskFieldsFragmentDoc = gql`
    fragment TaskFields on Task {
  id
  title
  description
  experience
  currencyReward
  rarity
  topics
  agility
  strength
  intelligence
}
    `;
export const PlayerTaskFieldsFragmentDoc = gql`
    fragment PlayerTaskFields on PlayerTask {
  id
  createdAt
  updatedAt
  order
  status
  task {
    ...TaskFields
  }
}
    ${TaskFieldsFragmentDoc}`;
export const PlayerDailyTaskFieldsFragmentDoc = gql`
    fragment PlayerDailyTaskFields on PlayerDailyTask {
  id
  title
  progress
  goal
  isCompleted
}
    `;
export const ResponsePagingFieldsFragmentDoc = gql`
    fragment ResponsePagingFields on ResponsePaging {
  totalRowCount
  totalPageCount
  currentPage
  currentPageSize
}
    `;
export const LeaderboardUserFieldsFragmentDoc = gql`
    fragment LeaderboardUserFields on LeaderboardUser {
  id
  firstName
  lastName
  photoUrl
  score
  position
}
    `;
export const ResponseQueryOptionsFieldsFragmentDoc = gql`
    fragment ResponseQueryOptionsFields on ResponseQueryOptions {
  filters {
    field
    localization
    items {
      name
      localization
    }
  }
  sorts
}
    `;
export const MoneyFieldsFragmentDoc = gql`
    fragment MoneyFields on Money {
  currencyCode
  amount
}
    `;
export const BalanceTransactionFieldsFragmentDoc = gql`
    fragment BalanceTransactionFields on BalanceTransaction {
  id
  amount {
    ...MoneyFields
  }
  type
  cause
  createdAt
}
    ${MoneyFieldsFragmentDoc}`;
export const LevelFieldsFragmentDoc = gql`
    fragment LevelFields on Level {
  id
  level
  totalExperience
  currentExperience
  experienceToNextLevel
  assessment
}
    `;
export const UserProfileFieldsFragmentDoc = gql`
    fragment UserProfileFields on User {
  id
  username
  firstName
  lastName
  photoUrl
  roles
  locale {
    tag
    isManual
  }
  player {
    id
    agility
    strength
    intelligence
    level {
      ...LevelFields
    }
  }
}
    ${LevelFieldsFragmentDoc}`;
export const PlayerTaskTopicFieldsFragmentDoc = gql`
    fragment PlayerTaskTopicFields on PlayerTaskTopic {
  id
  version
  isActive
  taskTopic
  level {
    ...LevelFields
  }
  isDisabled
}
    ${LevelFieldsFragmentDoc}`;
export const CompleteTaskPlayerFieldsFragmentDoc = gql`
    fragment CompleteTaskPlayerFields on CompleteTaskPlayer {
  id
  agility
  strength
  intelligence
  level {
    ...LevelFields
  }
  balance {
    id
    amount {
      ...MoneyFields
    }
  }
  taskTopics {
    ...PlayerTaskTopicFields
  }
}
    ${LevelFieldsFragmentDoc}
${MoneyFieldsFragmentDoc}
${PlayerTaskTopicFieldsFragmentDoc}`;
export const GenerateTasksDocument = gql`
    mutation GenerateTasks {
  generateTasks
}
    `;
export const CompleteTaskDocument = gql`
    mutation CompleteTask($id: UUID!) {
  completeTask(id: $id) {
    playerBefore {
      ...CompleteTaskPlayerFields
    }
    playerAfter {
      ...CompleteTaskPlayerFields
    }
  }
}
    ${CompleteTaskPlayerFieldsFragmentDoc}`;
export const SkipTaskDocument = gql`
    mutation SkipTask($id: UUID!) {
  skipTask(id: $id)
}
    `;
export const SavePlayerTopicsDocument = gql`
    mutation SavePlayerTopics($topics: [PlayerTaskTopicInput!]!) {
  savePlayerTopics(topics: $topics)
}
    `;
export const SavePlayerTopicsAndGenerateDocument = gql`
    mutation SavePlayerTopicsAndGenerate($topics: [PlayerTaskTopicInput!]!) {
  savePlayerTopics(topics: $topics)
  generateTasks
}
    `;
export const UpdateUserLocaleDocument = gql`
    mutation UpdateUserLocale($locale: UserLocaleInput!) {
  updateUserLocale(locale: $locale)
}
    `;
export const GetAppDataDocument = gql`
    query GetAppData {
  me {
    id
    photoUrl
    locale {
      tag
      isManual
    }
    roles
    player {
      dayStreak {
        ...DayStreakFields
      }
    }
  }
}
    ${DayStreakFieldsFragmentDoc}`;
export const GetUserLocaleDocument = gql`
    query GetUserLocale {
  me {
    locale {
      tag
      isManual
    }
  }
}
    `;
export const RefreshActiveTasksDocument = gql`
    query RefreshActiveTasks {
  me {
    player {
      activeTasks {
        isFirstTime
        tasks {
          ...PlayerTaskFields
        }
      }
      stamina {
        ...StaminaFields
      }
    }
  }
}
    ${PlayerTaskFieldsFragmentDoc}
${StaminaFieldsFragmentDoc}`;
export const GetPlayerStaminaDocument = gql`
    query GetPlayerStamina {
  me {
    player {
      stamina {
        ...StaminaFields
      }
    }
  }
}
    ${StaminaFieldsFragmentDoc}`;
export const RefreshDayStreakDocument = gql`
    query RefreshDayStreak {
  me {
    player {
      dayStreak {
        ...DayStreakFields
      }
    }
  }
}
    ${DayStreakFieldsFragmentDoc}`;
export const GetUserProfileDocument = gql`
    query GetUserProfile {
  me {
    ...UserProfileFields
  }
}
    ${UserProfileFieldsFragmentDoc}`;
export const GetPlayerTopicsDocument = gql`
    query GetPlayerTopics {
  me {
    player {
      taskTopics {
        topics {
          ...PlayerTaskTopicFields
        }
      }
    }
  }
}
    ${PlayerTaskTopicFieldsFragmentDoc}`;
export const GetBalanceWithTransactionsDocument = gql`
    query GetBalanceWithTransactions($paging: PagingInput!, $options: SearchOptionsInput) {
  me {
    player {
      balance {
        id
        amount {
          ...MoneyFields
        }
        transactions(paging: $paging, options: $options) {
          transactions {
            ...BalanceTransactionFields
          }
          paging {
            ...ResponsePagingFields
          }
          options {
            ...ResponseQueryOptionsFields
          }
        }
      }
    }
  }
}
    ${MoneyFieldsFragmentDoc}
${BalanceTransactionFieldsFragmentDoc}
${ResponsePagingFieldsFragmentDoc}
${ResponseQueryOptionsFieldsFragmentDoc}`;
export const GetLeaderboardInitialDocument = gql`
    query GetLeaderboardInitial($paging: PagingInput!, $filter: LeaderboardFilterInput!) {
  usersLeaderboard(paging: $paging, filter: $filter) {
    users {
      ...LeaderboardUserFields
    }
    paging {
      ...ResponsePagingFields
    }
  }
  userLeaderboard(filter: $filter) {
    ...LeaderboardUserFields
  }
}
    ${LeaderboardUserFieldsFragmentDoc}
${ResponsePagingFieldsFragmentDoc}`;
export const GetUserByIdDocument = gql`
    query GetUserById($id: Long!) {
  user(id: $id) {
    ...UserProfileFields
    player {
      balance {
        id
        amount {
          ...MoneyFields
        }
      }
    }
  }
}
    ${UserProfileFieldsFragmentDoc}
${MoneyFieldsFragmentDoc}`;
export const GetMonthlyActivityDocument = gql`
    query GetMonthlyActivity($year: Int!, $month: Int!) {
  me {
    player {
      monthlyActivity(year: $year, month: $month) {
        activeDays
      }
    }
  }
}
    `;
export const GetDailyTasksDocument = gql`
    query GetDailyTasks {
  me {
    player {
      dailyTasks {
        tasks {
          ...PlayerDailyTaskFields
        }
      }
    }
  }
}
    ${PlayerDailyTaskFieldsFragmentDoc}`;
export const GetBalanceTransactionsDocument = gql`
    query GetBalanceTransactions($paging: PagingInput!, $options: SearchOptionsInput) {
  me {
    player {
      balance {
        transactions(paging: $paging, options: $options) {
          transactions {
            ...BalanceTransactionFields
          }
          paging {
            ...ResponsePagingFields
          }
          options {
            ...ResponseQueryOptionsFields
          }
        }
      }
    }
  }
}
    ${BalanceTransactionFieldsFragmentDoc}
${ResponsePagingFieldsFragmentDoc}
${ResponseQueryOptionsFieldsFragmentDoc}`;
export const GetClosedTasksDocument = gql`
    query GetClosedTasks($paging: PagingInput!, $options: SearchOptionsInput) {
  me {
    player {
      closedTasks(paging: $paging, options: $options) {
        tasks {
          ...PlayerTaskFields
        }
        paging {
          ...ResponsePagingFields
        }
        options {
          ...ResponseQueryOptionsFields
        }
      }
    }
  }
}
    ${PlayerTaskFieldsFragmentDoc}
${ResponsePagingFieldsFragmentDoc}
${ResponseQueryOptionsFieldsFragmentDoc}`;
export const GetUsersLeaderboardDocument = gql`
    query GetUsersLeaderboard($paging: PagingInput!, $filter: LeaderboardFilterInput!) {
  usersLeaderboard(paging: $paging, filter: $filter) {
    users {
      ...LeaderboardUserFields
    }
    paging {
      ...ResponsePagingFields
    }
  }
}
    ${LeaderboardUserFieldsFragmentDoc}
${ResponsePagingFieldsFragmentDoc}`;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string, variables?: any) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType, _variables) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    GenerateTasks(variables?: GenerateTasksMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GenerateTasksMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<GenerateTasksMutation>({ document: GenerateTasksDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GenerateTasks', 'mutation', variables);
    },
    CompleteTask(variables: CompleteTaskMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CompleteTaskMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CompleteTaskMutation>({ document: CompleteTaskDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'CompleteTask', 'mutation', variables);
    },
    SkipTask(variables: SkipTaskMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SkipTaskMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SkipTaskMutation>({ document: SkipTaskDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'SkipTask', 'mutation', variables);
    },
    SavePlayerTopics(variables: SavePlayerTopicsMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SavePlayerTopicsMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SavePlayerTopicsMutation>({ document: SavePlayerTopicsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'SavePlayerTopics', 'mutation', variables);
    },
    SavePlayerTopicsAndGenerate(variables: SavePlayerTopicsAndGenerateMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<SavePlayerTopicsAndGenerateMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<SavePlayerTopicsAndGenerateMutation>({ document: SavePlayerTopicsAndGenerateDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'SavePlayerTopicsAndGenerate', 'mutation', variables);
    },
    UpdateUserLocale(variables: UpdateUserLocaleMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<UpdateUserLocaleMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<UpdateUserLocaleMutation>({ document: UpdateUserLocaleDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'UpdateUserLocale', 'mutation', variables);
    },
    GetAppData(variables?: GetAppDataQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetAppDataQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetAppDataQuery>({ document: GetAppDataDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetAppData', 'query', variables);
    },
    GetUserLocale(variables?: GetUserLocaleQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetUserLocaleQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetUserLocaleQuery>({ document: GetUserLocaleDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetUserLocale', 'query', variables);
    },
    RefreshActiveTasks(variables?: RefreshActiveTasksQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<RefreshActiveTasksQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<RefreshActiveTasksQuery>({ document: RefreshActiveTasksDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'RefreshActiveTasks', 'query', variables);
    },
    GetPlayerStamina(variables?: GetPlayerStaminaQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetPlayerStaminaQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetPlayerStaminaQuery>({ document: GetPlayerStaminaDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetPlayerStamina', 'query', variables);
    },
    RefreshDayStreak(variables?: RefreshDayStreakQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<RefreshDayStreakQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<RefreshDayStreakQuery>({ document: RefreshDayStreakDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'RefreshDayStreak', 'query', variables);
    },
    GetUserProfile(variables?: GetUserProfileQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetUserProfileQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetUserProfileQuery>({ document: GetUserProfileDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetUserProfile', 'query', variables);
    },
    GetPlayerTopics(variables?: GetPlayerTopicsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetPlayerTopicsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetPlayerTopicsQuery>({ document: GetPlayerTopicsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetPlayerTopics', 'query', variables);
    },
    GetBalanceWithTransactions(variables: GetBalanceWithTransactionsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetBalanceWithTransactionsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetBalanceWithTransactionsQuery>({ document: GetBalanceWithTransactionsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetBalanceWithTransactions', 'query', variables);
    },
    GetLeaderboardInitial(variables: GetLeaderboardInitialQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetLeaderboardInitialQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetLeaderboardInitialQuery>({ document: GetLeaderboardInitialDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetLeaderboardInitial', 'query', variables);
    },
    GetUserById(variables: GetUserByIdQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetUserByIdQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetUserByIdQuery>({ document: GetUserByIdDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetUserById', 'query', variables);
    },
    GetMonthlyActivity(variables: GetMonthlyActivityQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetMonthlyActivityQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetMonthlyActivityQuery>({ document: GetMonthlyActivityDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetMonthlyActivity', 'query', variables);
    },
    GetDailyTasks(variables?: GetDailyTasksQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetDailyTasksQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetDailyTasksQuery>({ document: GetDailyTasksDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetDailyTasks', 'query', variables);
    },
    GetBalanceTransactions(variables: GetBalanceTransactionsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetBalanceTransactionsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetBalanceTransactionsQuery>({ document: GetBalanceTransactionsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetBalanceTransactions', 'query', variables);
    },
    GetClosedTasks(variables: GetClosedTasksQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetClosedTasksQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetClosedTasksQuery>({ document: GetClosedTasksDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetClosedTasks', 'query', variables);
    },
    GetUsersLeaderboard(variables: GetUsersLeaderboardQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetUsersLeaderboardQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetUsersLeaderboardQuery>({ document: GetUsersLeaderboardDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetUsersLeaderboard', 'query', variables);
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;