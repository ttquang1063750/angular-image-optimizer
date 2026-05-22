import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogRef } from '@angular/cdk/dialog';
import { SupportDialogComponent } from './support-dialog.component';

describe('SupportDialogComponent', () => {
  let component: SupportDialogComponent;
  let fixture: ComponentFixture<SupportDialogComponent>;
  let dialogRef: { close: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    localStorage.clear();
    dialogRef = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [SupportDialogComponent],
      providers: [{ provide: DialogRef, useValue: dialogRef }],
    }).compileComponents();

    fixture = TestBed.createComponent(SupportDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('smoke', () => {
    expect(component).toBeTruthy();
  });

  it('close() delegate vào DialogRef.close', () => {
    component.close();
    expect(dialogRef.close).toHaveBeenCalledTimes(1);
  });

  it('render 3 support cards (PayPal, MoMo, Bank)', () => {
    const cards = fixture.nativeElement.querySelectorAll('.support-card');
    expect(cards.length).toBe(3);
  });

  it('PayPal link target=_blank rel=noopener', () => {
    const link = fixture.nativeElement.querySelector('.support-card.paypal a.btn-action');
    expect(link?.getAttribute('target')).toBe('_blank');
    expect(link?.getAttribute('rel')).toBe('noopener');
  });
});
