import { useEffect, useRef } from 'react';

// Get the API base URL from your existing API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://192.168.1.15:5000';

export function useProductChangefeed(onProductChange) {
  const eventSourceRef = useRef(null);

  useEffect(() => {
    // Connect to SSE endpoint using the correct API URL
    const eventSource = new EventSource(`${API_BASE_URL}/api/realtime/products`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('✅ Connected to product changefeed');
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'connected') {
          console.log('Connected to product changefeed');
        } else if (data.type === 'change') {
          console.log('Product change received:', data.change);
          // Call the callback with the change
          onProductChange(data.change);
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('❌ SSE connection error:', error);
      console.log('EventSource readyState:', eventSource.readyState);
      // EventSource automatically reconnects, but we log the error
    };

    // Cleanup on unmount
    return () => {
      console.log('Closing product changefeed connection');
      eventSource.close();
    };
  }, [onProductChange]);

  return eventSourceRef;
}