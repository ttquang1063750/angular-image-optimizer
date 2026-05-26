import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdsenseComponent } from './adsense.component';

describe('AdsenseComponent', () => {
  let component: AdsenseComponent;
  let fixture: ComponentFixture<AdsenseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdsenseComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdsenseComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('adSlot', '1234567890');
    fixture.detectChanges();
  });

  it('smoke', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize properties with inputs', () => {
    expect(component.adSlot()).toBe('1234567890');
    expect(component.adFormat()).toBe('auto');
    expect(component.fullWidthResponsive()).toBe(true);
  });
});
