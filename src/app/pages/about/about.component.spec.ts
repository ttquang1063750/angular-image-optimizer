import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Dialog } from '@angular/cdk/dialog';
import { AboutComponent } from './about.component';
import { TranslationService } from '../../translation.service';
import { SupportDialogComponent } from '../../shared/ui/support-dialog/support-dialog.component';

describe('AboutComponent', () => {
  let component: AboutComponent;
  let fixture: ComponentFixture<AboutComponent>;
  let translation: TranslationService;
  let dialog: { open: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    localStorage.clear();
    dialog = { open: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [AboutComponent],
      providers: [{ provide: Dialog, useValue: dialog }],
    }).compileComponents();

    fixture = TestBed.createComponent(AboutComponent);
    component = fixture.componentInstance;
    translation = TestBed.inject(TranslationService);
    fixture.detectChanges();
  });

  it('smoke', () => {
    expect(component).toBeTruthy();
  });

  it('content() trả VI khi lang là vi', () => {
    translation.setLang('vi');
    expect(component.content().lede).toContain('Image Optimizer');
    expect(component.content().storyParagraphs.length).toBeGreaterThan(0);
  });

  it('content() trả EN khi lang là en', () => {
    translation.setLang('en');
    fixture.detectChanges();
    expect(component.content().storyTitle).toBe('The story');
  });

  it('openSupport lazy-import SupportDialogComponent rồi mở qua Dialog service', async () => {
    await component.openSupport();
    expect(dialog.open).toHaveBeenCalledTimes(1);
    expect(dialog.open.mock.calls[0][0]).toBe(SupportDialogComponent);
  });

  it('render đủ sections: story + tech + privacy + oss + support + contact', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('section.story h2')).not.toBeNull();
    expect(el.querySelector('section.tech .tech-grid')).not.toBeNull();
    expect(el.querySelector('section.privacy .privacy-bullets')).not.toBeNull();
    expect(el.querySelector('section.oss .oss-link')).not.toBeNull();
    expect(el.querySelector('section.support .support-cta')).not.toBeNull();
    expect(el.querySelector('section.contact .contact-list')).not.toBeNull();
  });

  it('tech-grid render đủ items với link external', () => {
    const items = fixture.nativeElement.querySelectorAll('.tech-grid li');
    expect(items.length).toBe(component.content().techStack.length);
    items.forEach((li: HTMLElement) => {
      const a = li.querySelector('a');
      expect(a?.getAttribute('target')).toBe('_blank');
      expect(a?.getAttribute('rel')).toBe('noopener');
    });
  });
});
