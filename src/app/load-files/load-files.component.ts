import { Component, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoadFilesService } from '../services/core/load-files.service';
import { UtilsService } from '../services/core/utils.service';
import { FileUploadModule } from 'primeng/fileupload';

@Component({
  selector: 'app-load-files',
  imports: [ FileUploadModule ],
  templateUrl: './load-files.component.html',
  styleUrl: './load-files.component.css'
})
export class LoadFilesComponent {
    @ViewChild('fileUpLoader', {static: true}) fileUpLoader: any;
    noUploadedFiles: any[] = [];
    candidateFiles!: Array<File>;
    cont = 0;
    actionNextFileToLoad: Subscription = new Subscription();
    actionNextFileToList: Subscription = new Subscription();
    actionUnloadFiles: Subscription = new Subscription();
    actionUploadFiles: Subscription = new Subscription();

    constructor(
        private loadFileServices: LoadFilesService,
        private utilsService: UtilsService
    ) {
        const self = this;

        this.actionNextFileToList = this.loadFileServices.addFilesLoadPanel.subscribe(
            (files) => {
                if (files) {
                    self.addFilesToLoader(files);
                }
            }
        );

    }

    ngOnInit(): void {

    }

    myUploader(event: { files: Array<File> }): void {
      const self = this;
      this.cont = 0;
      this.noUploadedFiles = [];
      this.candidateFiles = new Array<File>();
      event.files.map((file: File) => {
        if (!self.loadFileServices.uploadedFiles.find((f: File) => f.name === file.name)) {
          self.loadFileServices.uploadedFiles.push(file);
          self.candidateFiles.push(file);
        }
      });
      if (this.candidateFiles.length > 0) {
        this.candidateFiles.map((file: File) => {
          self.loadFileServices.loadFile(file);
        });
      }
      this.fileUpLoader.clear();
    }

    // Añadimos el fichero sin duplicados
    addFilesToLoader(filesToLoader: Array<any>) {
        filesToLoader.map((file) => {
            this.fileUpLoader.files.push(file);
        });
        this.fileUpLoader.upload();
    }


    ngOnDestroy() {
        if (this.actionNextFileToLoad) {
            this.actionNextFileToLoad.unsubscribe();
        }

        if (this.actionNextFileToList) {
            this.actionNextFileToList.unsubscribe();
        }

        if (this.actionUnloadFiles) {
            this.actionUnloadFiles.unsubscribe();
        }
    }
}
