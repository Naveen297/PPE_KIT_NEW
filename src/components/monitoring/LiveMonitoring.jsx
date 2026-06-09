import { useState, useCallback } from 'react';
import { usePlant } from '@/hooks';
import CameraConfigSidebar from './CameraConfigSidebar';
import CameraPanel from './CameraPanel';

const INITIAL_CONFIG = { area: '' };

/**
 * LiveMonitoring — Container component for the live camera feed view.
 * Owns stream state and config, delegates rendering to sub-components.
 */
const LiveMonitoring = () => {
  const { currentPlant } = usePlant();
  const [isStreaming, setIsStreaming] = useState(false);
  const [config, setConfig] = useState(INITIAL_CONFIG);
  const [validationError, setValidationError] = useState(null);

  const handleStartStream = useCallback(() => {
    if (config.area) {
      setValidationError(null);
      setIsStreaming(true);
    } else {
      setValidationError('Please select an Area before starting the stream.');
    }
  }, [config]);

  const handleStopStream = useCallback(() => {
    setIsStreaming(false);
    setValidationError(null);
  }, []);

  const handleConfigChange = useCallback((newConfig) => {
    setConfig(newConfig);
    setValidationError(null);
  }, []);

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 mt-6 animate-fade-in">
      <CameraConfigSidebar
        config={config}
        onConfigChange={handleConfigChange}
        isStreaming={isStreaming}
        onStartStream={handleStartStream}
        onStopStream={handleStopStream}
        plantName={currentPlant.name}
        validationError={validationError}
      />
      <CameraPanel isStreaming={isStreaming} config={config} />
    </div>
  );
};

export default LiveMonitoring;
