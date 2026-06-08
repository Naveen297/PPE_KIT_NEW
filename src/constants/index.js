// Plant configurations
export const PLANTS = [
  {
    id: 'plant-mumbai',
    name: 'Mumbai Production Plant',
    location: 'Mumbai, Maharashtra',
    code: 'MPP',
    zones: ['Assembly Line A', 'Assembly Line B', 'Welding Section A', 'Welding Section B', 'Paint Shop', 'Quality Control', 'Warehouse', 'Logistics Area']
  },
  {
    id: 'plant-chennai',
    name: 'Chennai Manufacturing Unit',
    location: 'Chennai, Tamil Nadu',
    code: 'CMU',
    zones: ['Production Line 1', 'Production Line 2', 'Fabrication Shop', 'Welding Zone', 'Assembly Area', 'Testing Lab', 'Storage Facility', 'Dispatch Center']
  }
];

// PPE Items configuration
export const PPE_ITEMS = {
  HELMET: {
    id: 'helmet',
    name: 'Safety Helmet',
    icon: '🪖',
    color: 'blue',
    priority: 'critical'
  },
  GLOVES: {
    id: 'gloves',
    name: 'Safety Gloves',
    icon: '🧤',
    color: 'green',
    priority: 'high'
  },
  VEST: {
    id: 'vest',
    name: 'Safety Vest',
    icon: '🦺',
    color: 'orange',
    priority: 'high'
  },
  BOOTS: {
    id: 'boots',
    name: 'Safety Boots',
    icon: '👢',
    color: 'purple',
    priority: 'critical'
  },
  GOGGLES: {
    id: 'goggles',
    name: 'Safety Goggles',
    icon: '🥽',
    color: 'indigo',
    priority: 'medium'
  },
  MASK: {
    id: 'mask',
    name: 'Face Mask',
    icon: '😷',
    color: 'pink',
    priority: 'medium'
  }
};

// Detection status types
export const DETECTION_STATUS = {
  COMPLIANT: 'compliant',
  VIOLATION: 'violation',
  WARNING: 'warning'
};

// Filter options
export const FILTERS = {
  ALL: 'all',
  COMPLIANT: 'compliant',
  VIOLATION: 'violation',
  WARNING: 'warning'
};

// Time periods for analytics
export const TIME_PERIODS = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly'
};

// Chart types
export const CHART_TYPES = {
  PIE: 'pie',
  BAR: 'bar',
  LINE: 'line'
};

// App configuration
export const APP_CONFIG = {
  appName: 'SafetyFirst',
  companyName: 'Mahindra',
  version: '2.0.0',
  maxDetections: 100,
  refreshInterval: 15000, // 15 seconds
  defaultPlant: PLANTS[0].id
};

// Color scheme
export const COLORS = {
  primary: {
    blue: '#1e3c72',
    darkBlue: '#2a5298',
    red: '#e31e24',
    lightBlue: '#4a90e2'
  },
  status: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6'
  },
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  }
};

// Notification messages
export const MESSAGES = {
  noData: 'No detections found for the selected period',
  systemActive: 'System Active',
  systemInactive: 'System Inactive',
  loading: 'Loading data...',
  error: 'An error occurred while fetching data',
  reportGenerated: 'Report generated successfully'
};