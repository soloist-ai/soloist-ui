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
  TASK_COMPLETION = 'TASK_COMPLETION'
}

export enum BalanceTransactionType {
  IN = 'IN',
  OUT = 'OUT'
}

export type CompleteTaskBalance = {
  __typename?: 'CompleteTaskBalance';
  amount: Money;
  id: Scalars['UUID']['output'];
};

export type CreateCustomTaskResult = {
  __typename?: 'CreateCustomTaskResult';
  isValid: Scalars['Boolean']['output'];
  rejectionReason?: Maybe<Scalars['String']['output']>;
  task?: Maybe<Task>;
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
  createCustomTask: CreateCustomTaskResult;
  updateUserLocale: Scalars['Boolean']['output'];
};


export type MutationCreateCustomTaskArgs = {
  name: Scalars['String']['input'];
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
  balance: Balance;
  dayStreak: DayStreak;
  id: Scalars['Long']['output'];
  monthlyActivity: MonthlyActivityResult;
  stamina: Stamina;
  taskHistory: TaskHistoryResult;
  tasks: TasksResult;
};


export type PlayerMonthlyActivityArgs = {
  month: Scalars['Int']['input'];
  year: Scalars['Int']['input'];
};


export type PlayerTaskHistoryArgs = {
  paging: PagingInput;
};

export enum ProofType {
  PHOTO = 'PHOTO',
  TEXT = 'TEXT',
  VIDEO = 'VIDEO'
}

export type Query = {
  __typename?: 'Query';
  me: User;
  user: User;
  userLeaderboard?: Maybe<LeaderboardUser>;
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
  createdAt: Scalars['DateTime']['output'];
  day: Scalars['Date']['output'];
  gemReward: Scalars['Int']['output'];
  goal: Scalars['Int']['output'];
  id: Scalars['UUID']['output'];
  isCompleted: Scalars['Boolean']['output'];
  name?: Maybe<Scalars['String']['output']>;
  progress: Scalars['Int']['output'];
  proofType: ProofType;
  type: TaskType;
};

export type TaskHistoryResult = {
  __typename?: 'TaskHistoryResult';
  paging: ResponsePaging;
  tasks: Array<Task>;
};

export enum TaskType {
  CUSTOM = 'CUSTOM',
  PUSH_UPS = 'PUSH_UPS',
  SQUATS = 'SQUATS',
  STEPS = 'STEPS'
}

export type TasksResult = {
  __typename?: 'TasksResult';
  tasks: Array<Task>;
};

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

export type TaskFieldsFragment = { __typename?: 'Task', id: string, type: TaskType, name?: string | null, goal: number, progress: number, gemReward: number, isCompleted: boolean, proofType: ProofType, day: string, createdAt: string };

export type MoneyFieldsFragment = { __typename?: 'Money', currencyCode: string, amount: string };

export type StaminaFieldsFragment = { __typename?: 'Stamina', id: string, current: number, max: number, isRegenerating: boolean, regenRate: number, regenIntervalSeconds: number, nextRegenAt?: string | null, fullRegenAt?: string | null };

export type DayStreakFieldsFragment = { __typename?: 'DayStreak', id: string, current: number, max: number, isExtendedToday: boolean };

export type ResponsePagingFieldsFragment = { __typename?: 'ResponsePaging', totalRowCount: number, totalPageCount: number, currentPage: number, currentPageSize: number };

export type LeaderboardUserFieldsFragment = { __typename?: 'LeaderboardUser', id: number, firstName: string, lastName?: string | null, photoUrl?: string | null, score: string, position: number };

export type ResponseQueryOptionsFieldsFragment = { __typename?: 'ResponseQueryOptions', sorts: Array<string>, filters: Array<{ __typename?: 'LocalizedField', field: string, localization: string, items: Array<{ __typename?: 'LocalizedItem', name: string, localization: string }> }> };

export type BalanceTransactionFieldsFragment = { __typename?: 'BalanceTransaction', id: string, type: BalanceTransactionType, cause: BalanceTransactionCause, createdAt: string, amount: (
    { __typename?: 'Money' }
    & MoneyFieldsFragment
  ) };

export type UserProfileFieldsFragment = { __typename?: 'User', id: number, username?: string | null, firstName: string, lastName?: string | null, photoUrl?: string | null, roles: Array<UserRole>, locale?: { __typename?: 'UserLocale', tag: string, isManual: boolean } | null, player: { __typename?: 'Player', id: number } };

export type CreateCustomTaskMutationVariables = Exact<{
  name: Scalars['String']['input'];
}>;


export type CreateCustomTaskMutation = { __typename?: 'Mutation', createCustomTask: { __typename?: 'CreateCustomTaskResult', isValid: boolean, rejectionReason?: string | null, task?: (
      { __typename?: 'Task' }
      & TaskFieldsFragment
    ) | null } };

export type UpdateUserLocaleMutationVariables = Exact<{
  locale: UserLocaleInput;
}>;


export type UpdateUserLocaleMutation = { __typename?: 'Mutation', updateUserLocale: boolean };

export type GetAppDataQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAppDataQuery = { __typename?: 'Query', me: { __typename?: 'User', id: number, photoUrl?: string | null, roles: Array<UserRole>, locale?: { __typename?: 'UserLocale', tag: string, isManual: boolean } | null, player: { __typename?: 'Player', dayStreak: (
        { __typename?: 'DayStreak' }
        & DayStreakFieldsFragment
      ), tasks: { __typename?: 'TasksResult', tasks: Array<(
          { __typename?: 'Task' }
          & TaskFieldsFragment
        )> } } } };

export type GetUserLocaleQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUserLocaleQuery = { __typename?: 'Query', me: { __typename?: 'User', locale?: { __typename?: 'UserLocale', tag: string, isManual: boolean } | null } };

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

export type GetTasksQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTasksQuery = { __typename?: 'Query', me: { __typename?: 'User', player: { __typename?: 'Player', tasks: { __typename?: 'TasksResult', tasks: Array<(
          { __typename?: 'Task' }
          & TaskFieldsFragment
        )> } } } };

export type GetTaskHistoryQueryVariables = Exact<{
  paging: PagingInput;
}>;


export type GetTaskHistoryQuery = { __typename?: 'Query', me: { __typename?: 'User', player: { __typename?: 'Player', taskHistory: { __typename?: 'TaskHistoryResult', tasks: Array<(
          { __typename?: 'Task' }
          & TaskFieldsFragment
        )>, paging: (
          { __typename?: 'ResponsePaging' }
          & ResponsePagingFieldsFragment
        ) } } } };

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
    ) }, userLeaderboard?: (
    { __typename?: 'LeaderboardUser' }
    & LeaderboardUserFieldsFragment
  ) | null };

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

export const TaskFieldsFragmentDoc = gql`
    fragment TaskFields on Task {
  id
  type
  name
  goal
  progress
  gemReward
  isCompleted
  proofType
  day
  createdAt
}
    `;
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
  }
}
    `;
export const CreateCustomTaskDocument = gql`
    mutation CreateCustomTask($name: String!) {
  createCustomTask(name: $name) {
    isValid
    rejectionReason
    task {
      ...TaskFields
    }
  }
}
    ${TaskFieldsFragmentDoc}`;
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
      tasks {
        tasks {
          ...TaskFields
        }
      }
    }
  }
}
    ${DayStreakFieldsFragmentDoc}
${TaskFieldsFragmentDoc}`;
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
export const GetTasksDocument = gql`
    query GetTasks {
  me {
    player {
      tasks {
        tasks {
          ...TaskFields
        }
      }
    }
  }
}
    ${TaskFieldsFragmentDoc}`;
export const GetTaskHistoryDocument = gql`
    query GetTaskHistory($paging: PagingInput!) {
  me {
    player {
      taskHistory(paging: $paging) {
        tasks {
          ...TaskFields
        }
        paging {
          ...ResponsePagingFields
        }
      }
    }
  }
}
    ${TaskFieldsFragmentDoc}
${ResponsePagingFieldsFragmentDoc}`;
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
    CreateCustomTask(variables: CreateCustomTaskMutationVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<CreateCustomTaskMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<CreateCustomTaskMutation>({ document: CreateCustomTaskDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'CreateCustomTask', 'mutation', variables);
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
    RefreshDayStreak(variables?: RefreshDayStreakQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<RefreshDayStreakQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<RefreshDayStreakQuery>({ document: RefreshDayStreakDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'RefreshDayStreak', 'query', variables);
    },
    GetUserProfile(variables?: GetUserProfileQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetUserProfileQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetUserProfileQuery>({ document: GetUserProfileDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetUserProfile', 'query', variables);
    },
    GetTasks(variables?: GetTasksQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetTasksQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetTasksQuery>({ document: GetTasksDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetTasks', 'query', variables);
    },
    GetTaskHistory(variables: GetTaskHistoryQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetTaskHistoryQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetTaskHistoryQuery>({ document: GetTaskHistoryDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetTaskHistory', 'query', variables);
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
    GetBalanceTransactions(variables: GetBalanceTransactionsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetBalanceTransactionsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetBalanceTransactionsQuery>({ document: GetBalanceTransactionsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetBalanceTransactions', 'query', variables);
    },
    GetUsersLeaderboard(variables: GetUsersLeaderboardQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetUsersLeaderboardQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetUsersLeaderboardQuery>({ document: GetUsersLeaderboardDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'GetUsersLeaderboard', 'query', variables);
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;