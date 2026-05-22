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

  it('smoke', () => {
    const service = createService();
    expect(service).toBeTruthy();
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

    const appInstalledEvent = new Event('appinstalled');
    window.dispatchEvent(appInstalledEvent);
    expect(service.installPromptEvent()).toBeNull();
    expect(service.canInstall()).toBe(false);
  });

  it('gọi prompt() khi click installApp và xóa event', async () => {
    const service = createService('browser');

    const promptSpy = vi.fn().mockResolvedValue(undefined);
    const mockEvent = {
      prompt: promptSpy,
      userChoice: Promise.resolve({ outcome: 'accepted', platform: 'web' }),
    } as unknown as BeforeInstallPromptEvent;

    service.installPromptEvent.set(mockEvent);

    service.installApp();
    expect(promptSpy).toHaveBeenCalledTimes(1);

    // Wait for promise resolution
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

  it('reloadApp kích hoạt activateUpdate và tải lại trang', async () => {
    const service = createService('browser');

    const originalReload = window.location.reload;
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      writable: true,
      configurable: true,
      value: { reload: reloadMock },
    });

    service.reloadApp();

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(swUpdateMock.activateUpdate).toHaveBeenCalledTimes(1);
    expect(reloadMock).toHaveBeenCalledTimes(1);

    // Restore location
    Object.defineProperty(window, 'location', {
      writable: true,
      configurable: true,
      value: originalReload,
    });
  });

  it('không chạy window listeners trên server', () => {
    const addEventSpy = vi.spyOn(window, 'addEventListener');
    createService('server');

    expect(addEventSpy).not.toHaveBeenCalledWith('beforeinstallprompt', expect.any(Function));
    addEventSpy.mockRestore();
  });
});
