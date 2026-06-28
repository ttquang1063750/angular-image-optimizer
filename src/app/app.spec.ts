import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SwUpdate, VersionEvent } from '@angular/service-worker';
import { Subject } from 'rxjs';
import { App } from './app';
import { PwaService, BeforeInstallPromptEvent } from './shared/pwa/pwa.service';

vi.mock('heic-to', () => ({
  heicTo: vi.fn(),
  isHeic: vi.fn(),
}));

interface ShellExposed {
  showSettings: () => boolean;
  toggleSettings: () => void;
  closeSettings: () => void;
  pwa: PwaService;
}

describe('App', () => {
  let component: App;
  let exposed: ShellExposed;
  let fixture: ComponentFixture<App>;
  let swUpdateMock: unknown;

  beforeEach(async () => {
    localStorage.clear();
    swUpdateMock = {
      isEnabled: false,
      versionUpdates: new Subject<VersionEvent>(),
      activateUpdate: vi.fn().mockResolvedValue(true),
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: SwUpdate, useValue: swUpdateMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    exposed = component as unknown as ShellExposed;
    fixture.detectChanges();
  });

  it('smoke', () => {
    expect(component).toBeTruthy();
  });

  it('showSettings mặc định false; toggle/close hoạt động đúng', () => {
    expect(exposed.showSettings()).toBe(false);
    exposed.toggleSettings();
    expect(exposed.showSettings()).toBe(true);
    exposed.toggleSettings();
    expect(exposed.showSettings()).toBe(false);
    exposed.toggleSettings();
    exposed.closeSettings();
    expect(exposed.showSettings()).toBe(false);
  });

  describe('outside click', () => {
    it('click ngoài đóng popover khi đang mở', () => {
      exposed.toggleSettings();
      expect(exposed.showSettings()).toBe(true);

      const outside = document.createElement('div');
      document.body.appendChild(outside);
      const event = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(event, 'target', { value: outside });
      component.onDocumentClick(event);

      expect(exposed.showSettings()).toBe(false);
      outside.remove();
    });

    it('click vào .settings-toggle KHÔNG đóng (nút tự xử lý toggle)', () => {
      exposed.toggleSettings();
      const btn = document.createElement('button');
      btn.className = 'settings-toggle';
      document.body.appendChild(btn);

      const event = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(event, 'target', { value: btn });
      component.onDocumentClick(event);

      expect(exposed.showSettings()).toBe(true);
      btn.remove();
    });

    it('click vào .settings-popover KHÔNG đóng', () => {
      exposed.toggleSettings();
      const popover = document.createElement('div');
      popover.className = 'settings-popover';
      const child = document.createElement('span');
      popover.appendChild(child);
      document.body.appendChild(popover);

      const event = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(event, 'target', { value: child });
      component.onDocumentClick(event);

      expect(exposed.showSettings()).toBe(true);
      popover.remove();
    });

    it('khi popover đóng, document click không làm gì', () => {
      const outside = document.createElement('div');
      const event = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(event, 'target', { value: outside });
      expect(() => component.onDocumentClick(event)).not.toThrow();
      expect(exposed.showSettings()).toBe(false);
    });
  });

  describe('Escape key', () => {
    it('Esc đóng popover khi đang mở', () => {
      exposed.toggleSettings();
      component.onEscape();
      expect(exposed.showSettings()).toBe(false);
    });

    it('Esc không lỗi khi popover đang đóng', () => {
      expect(() => component.onEscape()).not.toThrow();
    });
  });

  describe('PWA Integration', () => {
    it('gọi pwa.installApp và đóng settings khi click installApp()', () => {
      const installSpy = vi.spyOn(exposed.pwa, 'installApp');
      exposed.toggleSettings();
      expect(exposed.showSettings()).toBe(true);

      component.installApp();

      expect(installSpy).toHaveBeenCalledTimes(1);
      expect(exposed.showSettings()).toBe(false);
    });

    it('hiển thị nút install khi canInstall() trả về true', () => {
      exposed.toggleSettings();
      fixture.detectChanges();

      let installBtn = fixture.nativeElement.querySelector('.pwa-install-btn');
      expect(installBtn).toBeNull();

      exposed.pwa.installPromptEvent.set({} as unknown as BeforeInstallPromptEvent);
      fixture.detectChanges();

      installBtn = fixture.nativeElement.querySelector('.pwa-install-btn');
      expect(installBtn).not.toBeNull();
    });

    it('hiển thị toast update khi updateAvailable() là true', () => {
      let toast = fixture.nativeElement.querySelector('.pwa-update-toast');
      expect(toast).toBeNull();

      exposed.pwa.updateAvailable.set(true);
      fixture.detectChanges();

      toast = fixture.nativeElement.querySelector('.pwa-update-toast');
      expect(toast).not.toBeNull();

      const reloadBtn = toast.querySelector('.toast-action-btn');
      expect(reloadBtn).not.toBeNull();
    });
  });
});
