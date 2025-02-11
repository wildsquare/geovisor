import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TocOverlayComponent } from './toc-overlay.component';

describe('TocOverlayComponent', () => {
  let component: TocOverlayComponent;
  let fixture: ComponentFixture<TocOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TocOverlayComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TocOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
