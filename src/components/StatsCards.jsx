const StatsCards = ({ stats, detections = [] }) => {
  const cards = [
    {
      title: 'Total Detections',
      value: stats.total,
      gradient: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      title: 'Compliant',
      value: stats.compliant,
      gradient: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      valueColor: 'text-green-700',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      showTrend: true,
      trendUp: true
    },
    {
      title: 'Violations',
      value: stats.violations,
      gradient: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      valueColor: 'text-red-700',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      showTrend: true,
      trendUp: false
    },
    {
      title: 'Compliance Rate',
      value: `${stats.complianceRate}%`,
      gradient: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      showTrend: stats.complianceRate >= 75,
      trendUp: stats.complianceRate >= 75
    }
  ];

  const getItemStats = () => {
    const counts = {
      helmet: 0,
      gloves: 0,
      apron: 0,
      mobile: 0,
      shoes: 0,
      goggles: 0
    };

    detections.forEach(d => {
      if (d.missingItems) {
        d.missingItems.forEach(item => {
          const lower = item.toLowerCase();
          if (lower.includes('helmet') || lower.includes('hat')) counts.helmet++;
          if (lower.includes('glove')) counts.gloves++;
          if (lower.includes('vest') || lower.includes('apron')) counts.apron++;
          if (lower.includes('boot') || lower.includes('shoe')) counts.shoes++;
          if (lower.includes('goggle') || lower.includes('glass')) counts.goggles++;
        });
      }

      if (d.ppeItems) {
        d.ppeItems.forEach(item => {
          if (item.toLowerCase().includes('mobile') || item.toLowerCase().includes('phone')) {
            counts.mobile++;
          }
        });
      }

      if (d.missingItems) {
        d.missingItems.forEach(item => {
          if (item.toLowerCase().includes('mobile') || item.toLowerCase().includes('phone')) {
            counts.mobile++;
          }
        });
      }
    });

    return counts;
  };

  const itemCounts = getItemStats();

  const itemTabs = [
    { label: 'Helmet', count: itemCounts.helmet, styles: 'bg-red-50 border-red-200 text-red-700', icon: '⛑️' },
    { label: 'Gloves', count: itemCounts.gloves, styles: 'bg-blue-50 border-blue-200 text-blue-700', icon: '🧤' },
    { label: 'Apron', count: itemCounts.apron, styles: 'bg-yellow-50 border-yellow-200 text-yellow-700', icon: '🦺' },
    { label: 'Mobile', count: itemCounts.mobile, styles: 'bg-purple-50 border-purple-200 text-purple-700', icon: '📱' },
    { label: 'Shoes', count: itemCounts.shoes, styles: 'bg-green-50 border-green-200 text-green-700', icon: '👢' },
    { label: 'Goggles', count: itemCounts.goggles, styles: 'bg-orange-50 border-orange-200 text-orange-700', icon: '🥽' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`${card.bgColor} ${card.borderColor} border-2 p-2.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-300`}
          >
            <div className="flex items-center gap-3">
              <div className={`bg-gradient-to-br ${card.gradient} w-8 h-8 rounded-lg flex items-center justify-center shadow-md flex-shrink-0`}>
                {card.icon}
              </div>
              <div className="flex-1 min-w-0 text-xs font-semibold text-gray-600">
                {card.title}
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`text-xl font-bold ${card.valueColor || 'text-gray-800'}`}>
                  {card.value}
                </div>
                {card.showTrend && (
                  <div className="flex-shrink-0">
                    {card.trendUp ? (
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {itemTabs.map((item, index) => (
          <div
            key={index}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 hover:shadow-md cursor-default ${item.styles}`}
          >
            <div className="mb-1 text-2xl filter drop-shadow-sm">{item.icon}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">{item.label}</div>
            <div className="mt-0.5 text-xl font-black">{item.count}</div>
            <div className="text-[9px] font-medium opacity-70">Violations</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsCards;
