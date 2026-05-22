import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { SwUpdate, VersionEvent } from '@angular/service-worker';
import { Subject } from 'rxjs';
import { PwaService, BeforeInstallPromptEvent } from './pwa.service';

interface SwUpdateMock {
  isEnabled: boolean;
  versionUpdates: ReturnType<typeof Subject.prototype.asObservable>;
  activateUpdate: ReturnType<typeof vi.fn>;
}

describe('PwaService', () => {
  let versionUpdates$: Subject<VersionEvent>;
  let swUpdateMock: SwUpdateMock;

  beforeEach(() => {
    versionUpdates$ = new Subject<VersionEvent>();
    swUpdateMock = {
      isEnabled: true,
      versionUpdates: versionUpdates$.asObservable(),
      activateUpdate: vi.fn().mockResolvedValue(true),
    };
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function createService(platformId: string | object = 'browser'): PwaService {
    TestBed.configureTestingModule({
      providers: [
        PwaService,
        { provide: PLATFORM_ID, useValue: platformId },
        { provide: SwUpdate, useValue: swUpdateMock as unknown as SwUpdate },
      ],
    });
    return TestBed.inject(PwaService);
  }

  /**
   * Stub window.location chỉ replace method .reload bằng spy — KHÔNG đụng
   * đến properties khác (href, origin, …) tránh phá tests khác.
   */
  function stubReload(): ReturnType<typeof vi.fn> {
    const reloadMock = vi.fn();
    vi.stubGlobal('location', {
      ...window.location,
      reload: reloadMock,
    });
    return reloadMock;
  }

  it('smoke', () => {
    expect(createService()).toBeTruthy();
  });

  it('lắng nghe sự kiện beforeinstallprompt trên môi trường trình duyệt', () => {
    const service = createService('browser');
    expect(service.canInstall()).toBe(false);

    const mockEvent = new Event('beforeinstallprompt') as unknown as BeforeInstallPromptEvent;
    const mockEventRecord = mockEvent as unknown as Record<string, unknown>;
    mockEventRecord['prompt'] = vi.fn().mockResolvedValue(undefined);
    mockEventRecord['userChoice'] = Promise.resolve({ outcome: 'accepted', platform: 'web' });

    window.dispatchEvent(mockEvent as unknown as Event);

    expect(service.installPromptEvent()).toBe(mockEvent);
    expect(service.canInstall()).toBe(true);
  });

  it('xóa event khi appinstalled được kích hoạt', () => {
    const service = createService('browser');

    const mockEvent = new Event('beforeinstallprompt') as BeforeInstallPromptEvent;
    window.dispatchEvent(mockEvent);
    expect(service.canInstall()).toBe(true);

    window.dispatchEvent(new Event('appinstalled'));
    expect(service.installPromptEvent()).toBeNull();
    expect(service.canInstall()).toBe(false);
  });

  it('installApp gọi prompt và clear event khi user accept', async () => {
    const service = createService('browser');
    const promptSpy = vi.fn().mockResolvedValue(undefined);
    const mockEvent = {
      prompt: promptSpy,
      userChoice: Promise.resolve({ outcome: 'accepted', platform: 'web' }),
    } as unknown as BeforeInstallPromptEvent;

    service.installPromptEvent.set(mockEvent);
    service.installApp();
    expect(promptSpy).toHaveBeenCalledTimes(1);

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(service.installPromptEvent()).toBeNull();
  });

  it('installApp vẫn clear event khi userChoice REJECT (không kẹt button)', async () => {
    const service = createService('browser');
    const mockEvent = {
      prompt: vi.fn().mockResolvedValue(undefined),
      userChoice: Promise.reject(new Error('user gesture interrupted')),
    } as unknown as BeforeInstallPromptEvent;

    service.installPromptEvent.set(mockEvent);
    service.installApp();

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(service.installPromptEvent()).toBeNull();
  });

  it('không làm gì nếu không có prompt event', () => {
    const service = createService('browser');
    expect(() => service.installApp()).not.toThrow();
  });

  it('lắng nghe versionUpdates và bật updateAvailable', () => {
    const service = createService('browser');
    expect(service.updateAvailable()).toBe(false);

    versionUpdates$.next({
      type: 'VERSION_READY',
      currentVersion: { hash: 'a' },
      latestVersion: { hash: 'b' },
    } as unknown as VersionEvent);
    expect(service.updateAvailable()).toBe(true);
  });

  it('reloadApp kích hoạt activateUpdate rồi reload', async () => {
    const service = createService('browser');
    const reloadMock = stubReload();

    service.reloadApp();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(swUpdateMock.activateUpdate).toHaveBeenCalledTimes(1);
    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  it('reloadApp VẪN reload khi activateUpdate REJECT (không kẹt user)', async () => {
    swUpdateMock.activateUpdate.mockRejectedValueOnce(new Error('no waiting worker'));
    const service = createService('browser');
    const reloadMock = stubReload();

    service.reloadApp();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  it('reloadApp reload thẳng khi swUpdate không enabled', () => {
    swUpdateMock.isEnabled = false;
    const service = createService('browser');
    const reloadMock = stubReload();

    service.reloadApp();
    expect(reloadMock).toHaveBeenCalledTimes(1);
    expect(swUpdateMock.activateUpdate).not.toHaveBeenCalled();
  });

  it('không chạy window listeners trên server', () => {
    const addEventSpy = vi.spyOn(window, 'addEventListener');
    createService('server');

    expect(addEventSpy).not.toHaveBeenCalledWith('beforeinstallprompt', expect.any(Function));
    addEventSpy.mockRestore();
  });
});
