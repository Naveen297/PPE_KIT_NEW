import { useState, useCallback } from 'react';
import { usePlant, useCameras, useVideoStream } from '@/hooks';
import { startBackend } from '@/api';
import CameraConfigSidebar from './CameraConfigSidebar';
import CameraPanel from './CameraPanel';

/**
 * LiveMonitoring — container for the live camera view. Lists real cameras from
 * `GET /cameras`, streams the selected one's annotated frames over WebSocket,
 * and can kick the detection engine via `GET /start_backend`.
 */
const LiveMonitoring = () => {
  const { currentPlant } = usePlant();
  const { cameras, loading, error, refetch } = useCameras();

  const [selectedCamera, setSelectedCamera] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [backend, setBackend] = useState({ loading: false, message: null, error: false });

  const { frameUrl, status } = useVideoStream(selectedCamera, isStreaming);

  const handleSelectCamera = useCallback((name) => {
    setSelectedCamera(name);
    setValidationError(null);
    setIsStreaming(false); // switching cameras tears down the old socket
  }, []);

  const handleStartStream = useCallback(() => {
    if (!selectedCamera) {
      setValidationError('Please select a camera before starting the stream.');
      return;
    }
    setValidationError(null);
    setIsStreaming(true);
  }, [selectedCamera]);

  const handleStopStream = useCallback(() => {
    setIsStreaming(false);
    setValidationError(null);
  }, []);

  const handleStartBackend = useCallback(async () => {
    setBackend({ loading: true, message: null, error: false });
    try {
      const message = await startBackend();
      setBackend({ loading: false, message: message?.trim() || 'Backend started.', error: false });
      refetch();
    } catch (err) {
      setBackend({ loading: false, message: err.message, error: true });
    }
  }, [refetch]);

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 mt-6 animate-fade-in">
      <CameraConfigSidebar
        cameras={cameras}
        loading={loading}
        error={error}
        onRetry={refetch}
        selectedCamera={selectedCamera}
        onSelectCamera={handleSelectCamera}
        isStreaming={isStreaming}
        onStartStream={handleStartStream}
        onStopStream={handleStopStream}
        plantName={currentPlant.name}
        validationError={validationError}
        onStartBackend={handleStartBackend}
        backend={backend}
      />
      <CameraPanel
        isStreaming={isStreaming}
        cameraName={selectedCamera}
        frameUrl={frameUrl}
        status={status}
      />
    </div>
  );
};

export default LiveMonitoring;
