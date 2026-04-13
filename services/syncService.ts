import AsyncStorage from '@react-native-async-storage/async-storage';
import { Evaluation } from '../types';
import api from './api';

const QUEUE_KEY = 'evaluations_offline_queue';

interface QueuedEvaluation {
  id: string; // offline generated id
  payload: any;
  timestamp: number;
}

export const addToOfflineQueue = async (payload: any): Promise<Evaluation> => {
  try {
    const queueJson = await AsyncStorage.getItem(QUEUE_KEY);
    const queue: QueuedEvaluation[] = queueJson ? JSON.parse(queueJson) : [];
    
    // Create a mock payload to return so UI can show it as completed
    const offlineItem: QueuedEvaluation = {
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      payload,
      timestamp: Date.now()
    };
    
    queue.push(offlineItem);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    
    // Simulate what the backend returns so the frontend handles it transparently
    return {
      _id: offlineItem.id,
      teacher: payload.teacherId,
      student: 'offline_user',
      college: payload.college,
      program: payload.program,
      year: payload.year,
      semester: payload.semester,
      rating: payload.rating,
      criteria: payload.criteria,
      comment: payload.comment,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as unknown as Evaluation;

  } catch (e) {
    console.error('Error adding to offline queue', e);
    throw new Error('Failed to save evaluation offline.');
  }
};

export const getOfflineQueueLength = async (): Promise<number> => {
  try {
    const queueJson = await AsyncStorage.getItem(QUEUE_KEY);
    return queueJson ? JSON.parse(queueJson).length : 0;
  } catch (e) {
    return 0;
  }
};

export const clearOfflineQueue = async () => {
  await AsyncStorage.removeItem(QUEUE_KEY);
};

export const syncOfflineData = async (): Promise<void> => {
  try {
    const queueJson = await AsyncStorage.getItem(QUEUE_KEY);
    if (!queueJson) return; // Nothing to sync

    const queue: QueuedEvaluation[] = JSON.parse(queueJson);
    if (queue.length === 0) return;

    console.log(`Syncing ${queue.length} items from offline queue...`);
    
    const remainingQueue: QueuedEvaluation[] = [];

    for (const item of queue) {
      try {
        await api.post('/evaluations', item.payload);
        console.log(`Synced evaluation ${item.id}`);
      } catch (error: any) {
        // If it's a 400 Duplicate evaluation, we can throw it away as it's already posted!
        if (error.response?.status === 400 || error.message?.includes('already evaluated')) {
          console.warn(`Duplicate dropped for offline item ${item.id}`);
        } else {
          // If it's a real network error, keep it in the queue for the next retry
          console.error(`Failed to sync item ${item.id}, keeping in queue. Error:`, error.message);
          remainingQueue.push(item);
        }
      }
    }

    if (remainingQueue.length === 0) {
      await AsyncStorage.removeItem(QUEUE_KEY);
    } else {
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remainingQueue));
    }

  } catch (e) {
    console.error('Offline sync process failed', e);
  }
};
