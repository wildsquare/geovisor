import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DndFilesComponent } from './dnd-files.component';

describe('DndFilesComponent', () => {
  let component: DndFilesComponent;
  let fixture: ComponentFixture<DndFilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DndFilesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DndFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
