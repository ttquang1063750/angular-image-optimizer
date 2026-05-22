import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Dialog } from '@angular/cdk/dialog';
import { MarketingFooterComponent } from './marketing-footer.component';
import { SupportDialogComponent } from '../../ui/support-dialog/support-dialog.component';

describe('MarketingFooterComponent', () => {
  let component: MarketingFooterComponent;
  let fixture: ComponentFixture<MarketingFooterComponent>;
  let dialog: { open: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    localStorage.clear();
    dialog = { open: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [MarketingFooterComponent],
      providers: [provideRouter([]), { provide: Dialog, useValue: dialog }],
    }).compileComponents();

    fixture = TestBed.createComponent(MarketingFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('smoke', () => {
    expect(component).toBeTruthy();
  });

  it('copyright() substitute {year} bằng năm hiện tại', () => {
    const year = new Date().getFullYear();
    expect(component.copyright()).toContain(String(year));
  });

  it('openSupport lazy-import SupportDialogComponent', async () => {
    await component.openSupport();
    expect(dialog.open).toHaveBeenCalledTimes(1);
    expect(dialog.open.mock.calls[0][0]).toBe(SupportDialogComponent);
  });

  it('footer có button Support click trigger openSupport', () => {
    const spy = vi.spyOn(component, 'openSupport').mockResolvedValue(undefined as unknown as void);
    const btn = fixture.nativeElement.querySelector('.link-button') as HTMLButtonElement;
    expect(btn).toBeTruthy();
    btn.click();
    expect(spy).toHaveBeenCalled();
  });
});
