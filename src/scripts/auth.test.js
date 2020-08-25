import { restoreSessionFromStore, saveUserSessionToStore, clearUserSessionFromStore, getCurrentUserId } from "./auth";

beforeEach(() => {
  global.localStorage.clear()
})

describe('restore user session', () => {
  it('should get null from storage if no user info in storage', () => {
    expect(restoreSessionFromStore()).toBe(null)
  });

  it('should get user info from storage if user info exists in storage', () => {
    // mock cached user info
    global.localStorage.setItem("user", JSON.stringify({
      id: 1,
      name: 'John'
    }))
    global.localStorage.setItem("access", "rtyuidq")
    global.localStorage.setItem("refresh", "ueidn12j")

    expect(restoreSessionFromStore()).toEqual({
      user: { id: 1, name: 'John' },
      access: "rtyuidq",
      refresh: "ueidn12j"
    })
  });
})

describe('save user session', () => {
  it('should save tokens and name to local storage', () => {
    const mockSessionInfo = {
      id: 1,
      name: "John",
      access: "1fgm32j1ui",
      refresh: "tugrkjh12"
    }

    saveUserSessionToStore(mockSessionInfo);

    expect(global.localStorage.getItem("user")).toBe('{"id":1,"name":"John"}')
    expect(global.localStorage.getItem("access")).toBe("1fgm32j1ui")
    expect(global.localStorage.getItem("refresh")).toBe("tugrkjh12")
  });
});

describe('clear user session', () => {
  it('should remove data from localStorage: access, refresh and user', () => {
    // mock cached user info
    global.localStorage.setItem("user", JSON.stringify({
      id: 1,
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

describe('restore current user id', () => {
  it('should return null if no user in store', () => {
    expect(getCurrentUserId()).toEqual(null);
  });
  it('should restore current userId from local storage', () => {
    global.localStorage.setItem("user", JSON.stringify({
      id: 1,
      name: 'John'
    }))

    expect(getCurrentUserId()).toEqual(1);
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