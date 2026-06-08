import { PLANTS, PPE_ITEMS, DETECTION_STATUS } from '../constants';

// Generate random detection data
export const generateDetection = (plantId, customTimestamp = null) => {
  const plant = PLANTS.find(p => p.id === plantId) || PLANTS[0];
  const zones = plant.zones;

  // Randomly determine status (70% compliant, 30% violation)
  const isCompliant = Math.random() > 0.3;

  // PPE items array
  const allPpeItems = [
    PPE_ITEMS.HELMET.name,
    PPE_ITEMS.GLOVES.name,
    PPE_ITEMS.VEST.name,
    PPE_ITEMS.BOOTS.name
  ];

  let detectedItems = [];
  let missingItems = [];

  if (isCompliant) {
    detectedItems = [...allPpeItems];
    // Sometimes add additional items for compliant cases
    if (Math.random() > 0.5) {
      detectedItems.push(PPE_ITEMS.GOGGLES.name);
    }
    if (Math.random() > 0.7) {
      detectedItems.push(PPE_ITEMS.MASK.name);
    }
  } else {
    // Randomly select 1-3 missing items
    const missingCount = Math.floor(Math.random() * 3) + 1;
    const shuffled = [...allPpeItems].sort(() => 0.5 - Math.random());
    missingItems = shuffled.slice(0, missingCount);
    detectedItems = allPpeItems.filter(item => !missingItems.includes(item));
  }

  const timestamp = customTimestamp || new Date();

  return {
    id: `DET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: timestamp.toLocaleString(),
    location: zones[Math.floor(Math.random() * zones.length)],
    status: isCompliant ? DETECTION_STATUS.COMPLIANT : DETECTION_STATUS.VIOLATION,
    ppeItems: detectedItems,
    missingItems: missingItems,
    confidence: (85 + Math.random() * 14).toFixed(1),
    imageUrl: `https://via.placeholder.com/800x600/1e3c72/ffffff?text=${plant.code}+PPE+Detection`,
    plantId: plantId,
    plantName: plant.name
  };
};

// Generate historical data for a plant
export const generateHistoricalData = (plantId, count = 50) => {
  const now = new Date();
  const data = [];

  for (let i = 0; i < count; i++) {
    // Generate timestamps spread across last 30 days
    const daysAgo = Math.floor(Math.random() * 30);
    const hoursAgo = Math.floor(Math.random() * 24);
    const minutesAgo = Math.floor(Math.random() * 60);

    const timestamp = new Date(
      now.getTime() -
      (daysAgo * 24 * 60 * 60 * 1000) -
      (hoursAgo * 60 * 60 * 1000) -
      (minutesAgo * 60 * 1000)
    );

    data.push(generateDetection(plantId, timestamp));
  }

  // Sort by timestamp (newest first)
  return data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

// Calculate statistics from detections
export const calculateStats = (detections) => {
  const total = detections.length;
  const compliant = detections.filter(d => d.status === DETECTION_STATUS.COMPLIANT).length;
  const violations = detections.filter(d => d.status === DETECTION_STATUS.VIOLATION).length;
  const complianceRate = total > 0 ? ((compliant / total) * 100).toFixed(1) : 0;

  return {
    total,
    compliant,
    violations,
    complianceRate
  };
};

// Format timestamp
export const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};

// Get time period label
export const getTimePeriodLabel = (period) => {
  const labels = {
    daily: 'Today',
    weekly: 'Last 7 Days',
    monthly: 'Last 30 Days'
  };
  return labels[period] || period;
};

// Filter detections by time period
export const filterByTimePeriod = (detections, period) => {
  const now = new Date();

  switch (period) {
    case 'daily':
      return detections.filter(d => {
        const detectionDate = new Date(d.timestamp);
        return detectionDate.toDateString() === now.toDateString();
      });

    case 'weekly':
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return detections.filter(d => {
        const detectionDate = new Date(d.timestamp);
        return detectionDate >= weekAgo;
      });

    case 'monthly':
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return detections.filter(d => {
        const detectionDate = new Date(d.timestamp);
        return detectionDate >= monthAgo;
      });

    default:
      return detections;
  }
};

// Generate report text
export const generateReportText = (detections, plantName, period) => {
  const stats = calculateStats(detections);

  let reportText = `PPE DETECTION SAFETY REPORT\n`;
  reportText += `${'='.repeat(60)}\n\n`;
  reportText += `Plant: ${plantName}\n`;
  reportText += `Generated: ${new Date().toLocaleString()}\n`;
  reportText += `Period: ${getTimePeriodLabel(period)}\n\n`;
  reportText += `SUMMARY STATISTICS\n`;
  reportText += `${'='.repeat(60)}\n`;
  reportText += `Total Detections: ${stats.total}\n`;
  reportText += `Compliant: ${stats.compliant} (${((stats.compliant / stats.total) * 100).toFixed(1)}%)\n`;
  reportText += `Violations: ${stats.violations} (${((stats.violations / stats.total) * 100).toFixed(1)}%)\n`;
  reportText += `Compliance Rate: ${stats.complianceRate}%\n\n`;
  reportText += `DETAILED DETECTIONS\n`;
  reportText += `${'='.repeat(60)}\n`;

  detections.forEach((d, idx) => {
    reportText += `\n${idx + 1}. ${d.id}\n`;
    reportText += `   Timestamp: ${d.timestamp}\n`;
    reportText += `   Location: ${d.location}\n`;
    reportText += `   Status: ${d.status.toUpperCase()}\n`;
    reportText += `   Confidence: ${d.confidence}%\n`;
    reportText += `   PPE Items Detected: ${d.ppeItems.join(', ')}\n`;
    if (d.missingItems.length > 0) {
      reportText += `   Missing Items: ${d.missingItems.join(', ')}\n`;
    }
  });

  reportText += `\n${'='.repeat(60)}\n`;
  reportText += `End of Report\n`;

  return reportText;
};