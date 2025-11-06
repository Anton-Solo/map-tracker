import { createContext, useContext } from 'react';
import { AuthStore } from './AuthStore';
import { ObjectsStore } from './ObjectsStore';

export class RootStore {
  authStore: AuthStore;
  objectsStore: ObjectsStore;

  constructor() {
    this.authStore = new AuthStore();
    this.objectsStore = new ObjectsStore();
  }

  cleanup(): void {
    this.objectsStore.clear();
  }
}

export const rootStore = new RootStore();
export const RootStoreContext = createContext<RootStore>(rootStore);

export const useStore = (): RootStore => {
  const store = useContext(RootStoreContext);
  if (!store) {
    throw new Error('useStore must be used within RootStoreContext.Provider');
  }
  return store;
};

export const useAuthStore = (): AuthStore => useStore().authStore;
export const useObjectsStore = (): ObjectsStore => useStore().objectsStore;

