import { restoreSessionFromStore } from "./auth";

beforeEach(() => {
  global.localStorage.clear()
})

describe('restore user session', () => {
  it('should get user info from storage if refresh token was correct or null', () => {
    expect(restoreSessionFromStore()).toBe(null)
  });

  it('should get user info from storage if refresh token was correct or null', () => {
    // mock cached user info
    global.localStorage.setItem("user", JSON.stringify({
      name: 'John'
    }))

    expect(restoreSessionFromStore()).toEqual({
      name: 'John'
    })
  });
})


// Mock LocalStorage
class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = value.toString();
  }

  removeItem(key) {
    delete this.store[key];
  }
};

global.localStorage = new LocalStorageMock;