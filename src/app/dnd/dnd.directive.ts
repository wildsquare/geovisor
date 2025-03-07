import {
    Directive,
    Output,
    Input,
    EventEmitter,
    HostBinding,
    HostListener
  } from '@angular/core';
  
  @Directive({
    selector: '[appDnd]'
  })
  export class DndDirective {
    // @HostBinding('class.fileover') fileOver: boolean;
    // @HostBinding('class.fileout') fileOut: boolean;
    @Output() fileDropped = new EventEmitter<any>();
    @Output() showBanner = new EventEmitter<any>();
  
    // Dragover listener
    @HostListener('dragover', ['$event']) onDragOver(evt: DragEvent): void {
      evt.preventDefault();
      evt.stopPropagation();
      // this.fileOver = true;
      // this.fileOut = false;
      this.showBanner.emit(true);
    }
  
    // Dragleave listener
    @HostListener('dragleave', ['$event']) public onDragLeave(evt: DragEvent): void {
      evt.preventDefault();
      evt.stopPropagation();
      // this.fileOver = false;
      // this.fileOut = true;
      this.showBanner.emit(false);
    }
  
    // Drop listener
    @HostListener('drop', ['$event']) public ondrop(evt: DragEvent): void {
      evt.preventDefault();
      evt.stopPropagation();
      // this.fileOver = false;
      // this.fileOut = true;
      const dataTransfer = evt.dataTransfer;
      if (dataTransfer) {
        const files: FileList = dataTransfer.files;
        if (files.length > 0) {
          this.fileDropped.emit(files);
        }
      }
      this.showBanner.emit(false);
    }
  }