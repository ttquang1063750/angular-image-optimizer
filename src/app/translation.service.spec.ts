import { TestBed } from '@angular/core/testing';
import { TranslationService } from './translation.service';

describe('TranslationService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  function createService(): TranslationService {
    TestBed.configureTestingModule({});
    return TestBed.inject(TranslationService);
  }

  it('khôi phục ngôn ngữ đã lưu trong localStorage', () => {
    localStorage.setItem('lang', 'en');
    const service = createService();
    expect(service.currentLang()).toBe('en');
  });

  it('setLang cập nhật signal và localStorage', () => {
    const service = createService();
    service.setLang('en');
    expect(service.currentLang()).toBe('en');
    expect(localStorage.getItem('lang')).toBe('en');
  });

  it('t() trả về dictionary của ngôn ngữ hiện tại', () => {
    const service = createService();
    service.setLang('vi');
    expect(service.t()['app_title']).toBe('Image Optimizer');
    expect(service.t()['btn_clear']).toBe('Xóa hết');

    service.setLang('en');
    expect(service.t()['btn_clear']).toBe('Clear All');
  });

  it('reactivity: thay đổi lang trigger computed t()', () => {
    const service = createService();
    service.setLang('vi');
    const before = service.t()['btn_clear'];
    service.setLang('en');
    const after = service.t()['btn_clear'];
    expect(before).not.toBe(after);
  });
});
