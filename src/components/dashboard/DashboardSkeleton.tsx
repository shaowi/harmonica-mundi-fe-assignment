import { Skeleton } from '../ui/Skeleton'

export function DashboardSkeleton() {
  return (
    <div
      className="dashboard-layout dashboard-skeleton"
      aria-busy="true"
      aria-label="Loading dashboard data"
    >
      {/* Top greeting section placeholder */}
      <section className="dashboard-greeting-section" aria-hidden="true">
        <div className="dashboard-greeting-skeleton">
          <Skeleton width={240} height={32} />
          <Skeleton width={140} height={20} />
        </div>
      </section>

      {/* Main 2-column grid */}
      <div className="dashboard-content">
        <div className="dashboard-main-col">
          {/* Balance Hero Card Skeleton */}
          <div className="balance-hero balance-hero-skeleton" aria-hidden="true">
            <div className="balance-hero-content">
              <div className="balance-hero-info">
                <Skeleton width={110} height={16} />
                <Skeleton
                  width={260}
                  height={44}
                  style={{ margin: 'var(--space-2) 0' }}
                />
                <Skeleton width={180} height={16} />
              </div>
              <div className="balance-hero-cta">
                <Skeleton
                  width={140}
                  height={44}
                  borderRadius="var(--radius-md)"
                />
              </div>
            </div>
          </div>

          {/* Accounts Section Skeleton */}
          <section className="accounts-section" aria-hidden="true">
            <div className="section-header">
              <Skeleton width={100} height={24} />
            </div>
            <div className="accounts-grid">
              {[1, 2, 3].map((i) => (
                <div key={i} className="account-card account-card-skeleton">
                  <div className="account-card-header">
                    <Skeleton width={120} height={18} />
                    <Skeleton width={70} height={16} />
                  </div>
                  <div className="account-card-body">
                    <Skeleton width={140} height={28} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Transactions Section Skeleton */}
          <section
            className="transactions-section transactions-skeleton"
            aria-hidden="true"
          >
            <div className="transactions-header transactions-header-skeleton">
              <Skeleton width={160} height={24} />
              <div className="transactions-search-wrap">
                <Skeleton
                  width="100%"
                  height={44}
                  borderRadius="var(--radius-md)"
                />
              </div>
            </div>
            <div className="transactions-list-skeleton">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="transaction-item transaction-item-skeleton"
                >
                  <div className="transaction-main">
                    <Skeleton width={160} height={18} />
                    <Skeleton
                      width={100}
                      height={14}
                      style={{ marginTop: '4px' }}
                    />
                  </div>
                  <div className="transaction-right">
                    <Skeleton width={90} height={20} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right rail: Daily Limit Skeleton */}
        <div className="dashboard-rail-col">
          <aside className="daily-limit-rail" aria-hidden="true">
            <div className="daily-limit-card daily-limit-skeleton">
              <Skeleton width={90} height={16} />
              <div className="daily-limit-stat">
                <Skeleton
                  width={200}
                  height={28}
                  style={{ margin: 'var(--space-1) 0' }}
                />
              </div>
              <Skeleton
                width="100%"
                height={8}
                borderRadius="var(--radius-full)"
              />
              <div className="daily-limit-meta">
                <Skeleton width={80} height={14} />
                <Skeleton width={80} height={14} />
              </div>
              <Skeleton
                width={180}
                height={14}
                style={{ marginTop: 'var(--space-2)' }}
              />
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
