import { makeAutoObservable, runInAction } from 'mobx';
import { webSocketService } from '../services/WebSocketService';
import { type TrackedObject } from '../types';
import { REMOVE_OBJECT_TIMEOUT } from '../config';

interface ObjectWithTimers {
  object: TrackedObject;
  lostTimer: number | null;
  removeTimer: number | null;
}

export class ObjectsStore {
  objects = new Map<string, ObjectWithTimers>();
  lastUpdateTime: Date | null = null;

  constructor() {
    makeAutoObservable(this);
    this.setupWebSocketListener();
  }

  private setupWebSocketListener(): void {
    webSocketService.onMessage((message) => {
      if (message.type === 'objects_update' && message.objects) {
        runInAction(() => {
          this.updateObjects(message.objects!);
          this.lastUpdateTime = new Date();
        });
      }
    });
  }

  private updateObjects(newObjects: TrackedObject[]): void {
    const receivedIds = new Set<string>();

    newObjects.forEach((obj) => {
      receivedIds.add(obj.id);

      const existing = this.objects.get(obj.id);

      if (existing) {
        this.clearTimers(existing);
        existing.object = { ...obj, status: 'active' };
      } else {
        this.objects.set(obj.id, {
          object: { ...obj, status: 'active' },
          lostTimer: null,
          removeTimer: null,
        });
      }
    });

    this.objects.forEach((_, id) => {
      if (!receivedIds.has(id)) {
        this.markAsLost(id);
      }
    });
  }

  private markAsLost(objectId: string): void {
    const data = this.objects.get(objectId);
    if (!data) return;

    if (data.object.status === 'lost') return;

    data.object = { ...data.object, status: 'lost' };

    this.clearTimers(data);

    data.removeTimer = setTimeout(() => {
      runInAction(() => {
        this.removeObject(objectId);
      });
    }, REMOVE_OBJECT_TIMEOUT) as unknown as number;
  }


  private removeObject(objectId: string): void {
    const data = this.objects.get(objectId);
    if (data) {
      this.clearTimers(data);
      this.objects.delete(objectId);
    }
  }

  private clearTimers(data: ObjectWithTimers): void {
    if (data.lostTimer) {
      clearTimeout(data.lostTimer);
      data.lostTimer = null;
    }
    if (data.removeTimer) {
      clearTimeout(data.removeTimer);
      data.removeTimer = null;
    }
  }

  clear(): void {
    this.objects.forEach((data) => this.clearTimers(data));
    this.objects.clear();
    this.lastUpdateTime = null;
  }

  get objectsArray(): TrackedObject[] {
    return Array.from(this.objects.values()).map((data) => data.object);
  }

  get activeObjects(): TrackedObject[] {
    return this.objectsArray.filter((obj) => obj.status === 'active');
  }

  get lostObjects(): TrackedObject[] {
    return this.objectsArray.filter((obj) => obj.status === 'lost');
  }

  get totalCount(): number {
    return this.objects.size;
  }

  get activeCount(): number {
    return this.activeObjects.length;
  }

  get lostCount(): number {
    return this.lostObjects.length;
  }

  getObjectById(id: string): TrackedObject | undefined {
    return this.objects.get(id)?.object;
  }
}

