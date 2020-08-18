import { restoreSessionFromStore, saveUserSessionToStore, clearUserSessionFromStore } from "./auth";

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
    global.localStorage.setItem("access", "rtyuidq")
    global.localStorage.setItem("refresh", "ueidn12j")

    expect(restoreSessionFromStore()).toEqual({
      user: { name: 'John' },
      access: "rtyuidq",
      refresh: "ueidn12j"
    })
  });
})

describe('save user session', () => {
  it('should save tokens and name to local storage', () => {
    const mockSessionInfo = {
      name: "John",
      access: "1fgm32j1ui",
      refresh: "tugrkjh12"
    }

    saveUserSessionToStore(mockSessionInfo);

    expect(global.localStorage.getItem("user")).toBe('{"name":"John"}')
    expect(global.localStorage.getItem("access")).toBe("1fgm32j1ui")
    expect(global.localStorage.getItem("refresh")).toBe("tugrkjh12")
  });
});

describe('clear user session', () => {
  it('should remove data from localStorage: access, refresh and user', () => {
    // mock cached user info
    global.localStorage.setItem("user", JSON.stringify({
      name: 'John'
    }))
    global.localStorage.setItem("access", "rtyuidq")
    global.localStorage.setItem("refresh", "ueidn12j")

    clearUserSessionFromStore();

    expect(global.localStorage.getItem("user")).toBe(null)
    expect(global.localStorage.getItem("access")).toBe(null)
    expect(global.localStorage.getItem("refresh")).toBe(null)
  });
});


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