import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { LangSwitcherComponent } from './lang-switcher.component';
import { TranslationService } from '../../../translation.service';

describe('LangSwitcherComponent (route-aware)', () => {
  let component: LangSwitcherComponent;
  let fixture: ComponentFixture<LangSwitcherComponent>;
  let router: Router;
  let translation: TranslationService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [LangSwitcherComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LangSwitcherComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    translation = TestBed.inject(TranslationService);
    fixture.detectChanges();
  });

  it('smoke', () => {
    expect(component).toBeTruthy();
  });

  it('setLang navigate giữ path, đổi segment đầu', async () => {
    const navSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    translation.setLang('vi');
    vi.spyOn(router, 'url', 'get').mockReturnValue('/vi/about');

    component.setLang('en');

    expect(navSpy).toHaveBeenCalledTimes(1);
    const arg = navSpy.mock.calls[0][0];
    expect(String(arg)).toBe('/en/about');
  });

  it('setLang giữ nested path (blog/:slug)', () => {
    const navSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    translation.setLang('vi');
    vi.spyOn(router, 'url', 'get').mockReturnValue('/vi/blog/webp-vs-jpeg');

    component.setLang('en');

    expect(String(navSpy.mock.calls[0][0])).toBe('/en/blog/webp-vs-jpeg');
  });

  it('setLang no-op khi chọn lại lang hiện tại', () => {
    const navSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    translation.setLang('vi');

    component.setLang('vi');

    expect(navSpy).not.toHaveBeenCalled();
  });

  it('setLang xử lý URL root rỗng', () => {
    const navSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    translation.setLang('vi');
    vi.spyOn(router, 'url', 'get').mockReturnValue('/');

    component.setLang('en');

    expect(String(navSpy.mock.calls[0][0])).toBe('/en');
  });
});
