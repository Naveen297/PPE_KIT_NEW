import { useEffect, useRef } from 'react';

/**
 * Fires `callback` whenever a mousedown event occurs outside `ref`.
 * Attach the returned ref to the element you want to treat as "inside".
 *
 * @param {() => void} callback - Function to call on outside click.
 * @returns {React.RefObject} ref - Attach to the container element.
 */
const useClickOutside = (callback) => {
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [callback]);

  return ref;
};

export default useClickOutside;
