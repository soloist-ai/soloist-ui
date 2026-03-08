import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import type { LocalizedField } from '../graphql/generated';
import BankingTransactionsList, { type GqlTransaction } from '../components/balance/BankingTransactionsList';
import Icon from '../components/common/Icon';
import FilterDropdown from '../components/filters/FilterDropdown';
import DateFilter from '../components/filters/DateFilter';
import ResetFiltersButton from '../components/filters/ResetFiltersButton';
import { gqlSdk } from '../graphql/client';
import type { MoneyFieldsFragment, ResponsePagingFieldsFragment, OrderMode as GqlOrderMode } from '../graphql/generated';
import { OrderMode } from '../graphql/generated';

type BalanceTabProps = {
  isAuthenticated: boolean;
};

interface BalanceData {
  id: string;
  amount: MoneyFieldsFragment;
}

interface InitialData {
  balance: BalanceData;
  transactions: GqlTransaction[];
  paging: ResponsePagingFieldsFragment;
}

const PAGE_SIZE = 20;
const DEFAULT_SORTS: { field: string; mode: GqlOrderMode }[] = [{ field: 'createdAt', mode: OrderMode.DESC }];

const BalanceTab: React.FC<BalanceTabProps> = ({ isAuthenticated }) => {
  const fetchInitiatedRef = useRef(false);
  const [initialData, setInitialData] = useState<InitialData | null>(null);
  const [dateFilters, setDateFilters] = useState({ from: '', to: '' });
  const [enumFilters, setEnumFilters] = useState<{[field: string]: string[]}>({});
  const [availableFilters, setAvailableFilters] = useState<LocalizedField[]>([]);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [balanceLoaded, setBalanceLoaded] = useState(false);
  const { t } = useLocalization();

  useEffect(() => {
    if (!isAuthenticated) {
      fetchInitiatedRef.current = false;
      return;
    }
    if (fetchInitiatedRef.current) return;
    fetchInitiatedRef.current = true;

    gqlSdk.GetBalanceWithTransactions({
      paging: { page: 0, pageSize: PAGE_SIZE },
      options: { sorts: DEFAULT_SORTS },
    }).then(({ me }) => {
      const { balance } = me.player;
      setInitialData({
        balance: { id: balance.id, amount: balance.amount },
        transactions: balance.transactions.transactions as GqlTransaction[],
        paging: balance.transactions.paging,
      });
      if (balance.transactions.options?.filters) {
        setAvailableFilters(balance.transactions.options.filters);
      }
      setTimeout(() => {
        setContentLoaded(true);
        setBalanceLoaded(true);
      }, 50);
    }).catch((err) => console.error('[BalanceTab] failed to load balance:', err));
  }, [isAuthenticated]);

  const handleDateFilterChange = useCallback((from: string, to: string) => {
    setDateFilters({ from, to });
  }, []);

  const handleEnumFilterChange = useCallback((field: string, values: string[]) => {
    setEnumFilters(prev => ({ ...prev, [field]: values }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setDateFilters({ from: '', to: '' });
    setEnumFilters({});
  }, []);

  const handleFiltersUpdate = useCallback((filters: LocalizedField[]) => {
    setAvailableFilters(filters);
  }, []);

  if (!isAuthenticated || !initialData) {
    return <BalanceSkeleton />;
  }

  const { balance } = initialData;

  return (
    <div
      className={`tab-page-wrapper fixed inset-0 overflow-y-auto overflow-x-hidden ${contentLoaded ? 'tab-content-enter-active' : ''}`}
      style={{
        boxSizing: 'border-box',
        opacity: contentLoaded ? 1 : 0,
        transform: contentLoaded ? 'translateY(0)' : 'translateY(10px)',
        transition: contentLoaded ? 'opacity 0.4s ease-out, transform 0.4s ease-out' : 'none',
        touchAction: 'pan-y',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <div className="tab-inner-content relative z-10 min-h-screen pt-16 md:pt-20 px-4 md:px-6 pb-24">
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-tech font-bold mb-3 tracking-tight"
            style={{
              color: '#e8f4f8',
              textShadow: '0 0 8px rgba(180, 220, 240, 0.3)'
            }}
          >
            {t('balance.title')}
          </h1>
          <p
            className="mb-6 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto px-4"
            style={{
              color: 'rgba(220, 235, 245, 0.7)',
              textShadow: '0 0 4px rgba(180, 220, 240, 0.1)'
            }}
          >
            {t('balance.subtitle')}
          </p>
          <div
            className="w-24 sm:w-32 md:w-40 h-1 rounded-full mx-auto"
            style={{
              background: 'rgba(180, 220, 240, 0.6)',
              boxShadow: '0 0 8px rgba(180, 220, 240, 0.4)'
            }}
          ></div>
        </div>

        <div className="flex justify-center mb-8">
          <div
            className="relative overflow-hidden rounded-2xl md:rounded-3xl p-6 md:p-8 max-w-md w-full group"
            style={{
              background: 'linear-gradient(160deg, rgba(160, 120, 255, 0.08) 0%, rgba(255, 255, 255, 0.05) 40%, rgba(80, 200, 180, 0.06) 100%)',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(160, 130, 255, 0.2)',
              boxShadow: `
                0 0 20px rgba(160, 130, 255, 0.1),
                inset 0 0 20px rgba(200, 230, 245, 0.03)
              `,
              opacity: balanceLoaded ? 1 : 0,
              transform: balanceLoaded ? 'translateY(0)' : 'translateY(10px)',
              transition: 'opacity 0.3s ease-out, transform 0.3s ease-out'
            }}
          >
            {/* Glowing orbs */}
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-2xl opacity-10 animate-float" style={{
              background: 'rgba(160, 120, 255, 0.8)'
            }}></div>
            <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full blur-xl opacity-10 animate-float-delayed" style={{
              background: 'rgba(80, 200, 180, 0.6)'
            }}></div>

            {/* Shimmer effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>

            {/* Content */}
            <div className="relative z-10">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p
                    className="text-xs md:text-sm font-tech mb-1"
                    style={{
                      color: 'rgba(220, 235, 245, 0.7)',
                      textShadow: '0 0 2px rgba(160, 130, 255, 0.15)'
                    }}
                  >
                    {t('balance.totalBalance')}
                  </p>
                  <p
                    className="text-[10px] md:text-xs font-tech"
                    style={{
                      color: 'rgba(220, 235, 245, 0.6)'
                    }}
                  >
                    {t('balance.currencyName')}
                  </p>
                </div>
                <div
                  className="profile-icon-wrapper"
                  style={{
                    color: 'rgba(180, 160, 255, 0.9)',
                    filter: 'drop-shadow(0 0 8px rgba(160, 130, 255, 0.5))'
                  }}
                >
                  <Icon type="coins" size={28} />
                </div>
              </div>

              {/* Balance amount */}
              <div className="mb-6">
                <div
                  className="text-4xl md:text-5xl font-tech font-bold mb-2"
                  style={{
                    color: '#e8f4f8',
                    textShadow: '0 0 12px rgba(160, 130, 255, 0.3)'
                  }}
                >
                  {balance.amount.amount}
                </div>
                <div
                  className="text-sm md:text-base font-tech font-semibold"
                  style={{
                    color: 'rgba(180, 160, 255, 0.75)',
                    textShadow: '0 0 6px rgba(160, 130, 255, 0.2)'
                  }}
                >
                  {balance.amount.currencyCode}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Section */}
        <div className="flex justify-center">
          <div className="max-w-4xl w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 
                className="text-xl md:text-2xl font-tech font-bold"
                style={{
                  color: '#e8f4f8',
                  textShadow: '0 0 8px rgba(180, 220, 240, 0.3)'
                }}
              >
                {t('balance.transactions.title')}
              </h3>
            </div>

            {/* Фильтры - горизонтальная строка */}
            <div className="mb-6">
              <div className="flex gap-3 overflow-x-auto pb-2 px-1 filters-scrollbar">
                {/* Date Range Filter */}
                <DateFilter
                  from={dateFilters.from}
                  to={dateFilters.to}
                  onChange={handleDateFilterChange}
                />

                {/* Enum Filters */}
                {availableFilters.map((filter) => (
                  <FilterDropdown
                    key={filter.field}
                    label={filter.localization}
                    options={filter.items}
                    selectedValues={enumFilters[filter.field] || []}
                    onSelectionChange={(values) => handleEnumFilterChange(filter.field, values)}
                  />
                ))}

                {/* Clear Filters Button */}
                <ResetFiltersButton onClick={handleClearFilters} />
              </div>
            </div>

            <BankingTransactionsList
              initialData={{ transactions: initialData.transactions, paging: initialData.paging }}
              dateFilters={dateFilters}
              enumFilters={enumFilters}
              onFiltersUpdate={handleFiltersUpdate}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const BalanceSkeleton: React.FC = () => (
  <div
    className="tab-page-wrapper fixed inset-0 overflow-y-auto overflow-x-hidden"
    style={{
      boxSizing: 'border-box',
    }}
  >
    <div className="tab-inner-content relative z-10 min-h-screen pt-16 md:pt-20 px-4 md:px-6 pb-24">
      {/* Header skeleton */}
      <div className="text-center mb-8">
        <div 
          className="h-8 md:h-10 w-48 md:w-64 mx-auto mb-3 rounded-lg animate-pulse"
          style={{
            background: 'rgba(220, 235, 245, 0.1)'
          }}
        ></div>
        <div 
          className="h-4 md:h-5 w-72 md:w-96 mx-auto mb-6 rounded-lg animate-pulse"
          style={{
            background: 'rgba(220, 235, 245, 0.08)'
          }}
        ></div>
        <div
          className="w-24 sm:w-32 md:w-40 h-1 rounded-full mx-auto"
          style={{
            background: 'rgba(180, 220, 240, 0.6)',
            boxShadow: '0 0 8px rgba(180, 220, 240, 0.4)'
          }}
        ></div>
      </div>

      {/* Balance skeleton */}
      <div className="flex justify-center mb-8">
        <div
          className="relative overflow-hidden rounded-2xl md:rounded-3xl p-6 md:p-8 max-w-md w-full animate-pulse"
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(160, 130, 255, 0.2)',
            boxShadow: '0 0 20px rgba(160, 130, 255, 0.1), inset 0 0 20px rgba(200, 230, 245, 0.03)'
          }}
        >
          <div className="flex justify-between items-center mb-6">
            <div className="space-y-2">
              <div className="h-4 w-24 rounded" style={{ background: 'rgba(220, 235, 245, 0.1)' }}></div>
              <div className="h-3 w-16 rounded" style={{ background: 'rgba(220, 235, 245, 0.08)' }}></div>
            </div>
            <div className="w-7 h-7 rounded-lg" style={{ background: 'rgba(220, 235, 245, 0.1)' }}></div>
          </div>
          <div className="mb-6">
            <div className="h-12 w-32 rounded mb-2" style={{ background: 'rgba(220, 235, 245, 0.1)' }}></div>
            <div className="h-5 w-20 rounded" style={{ background: 'rgba(220, 235, 245, 0.08)' }}></div>
          </div>
        </div>
      </div>

      {/* Transactions skeleton */}
      <div className="flex justify-center">
        <div className="max-w-4xl w-full">
          <div
            className="h-7 w-44 rounded-lg mb-6 animate-pulse"
            style={{ background: 'rgba(220, 235, 245, 0.1)' }}
          />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl p-5 animate-pulse"
                style={{
                  background: 'rgba(220, 235, 245, 0.05)',
                  border: '1px solid rgba(220, 235, 245, 0.1)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-12 h-12 rounded-xl flex-shrink-0"
                      style={{ background: 'rgba(220, 235, 245, 0.1)' }}
                    />
                    <div>
                      <div
                        className="h-5 rounded mb-2"
                        style={{ width: `${96 + (i % 3) * 24}px`, background: 'rgba(220, 235, 245, 0.1)' }}
                      />
                      <div
                        className="h-4 w-16 rounded"
                        style={{ background: 'rgba(220, 235, 245, 0.08)' }}
                      />
                    </div>
                  </div>
                  <div
                    className="h-6 w-20 rounded"
                    style={{ background: 'rgba(220, 235, 245, 0.1)' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  </div>
);

export default BalanceTab;
