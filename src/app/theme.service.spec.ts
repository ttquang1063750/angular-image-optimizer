import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  function createService(): ThemeService {
    TestBed.configureTestingModule({});
    return TestBed.inject(ThemeService);
  }

  function stubMatchMedia(matches: boolean): void {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockReturnValue({ matches } as MediaQueryList),
    });
  }

  it('mặc định dùng prefers-color-scheme khi chưa có lựa chọn lưu', () => {
    stubMatchMedia(true);
    const service = createService();
    expect(service.currentTheme()).toBe('dark');
  });

  it('mặc định light khi prefers-color-scheme không tối', () => {
    stubMatchMedia(false);
    const service = createService();
    expect(service.currentTheme()).toBe('light');
  });

  it('khôi phục theme đã lưu trong localStorage', () => {
    localStorage.setItem('theme', 'dark');
    const service = createService();
    expect(service.currentTheme()).toBe('dark');
  });

  it('setTheme cập nhật signal và localStorage', () => {
    const service = createService();
    service.setTheme('dark');
    expect(service.currentTheme()).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('toggle chuyển đổi giữa light và dark', () => {
    localStorage.setItem('theme', 'light');
    const service = createService();
    service.toggle();
    expect(service.currentTheme()).toBe('dark');
    service.toggle();
    expect(service.currentTheme()).toBe('light');
  });
});
