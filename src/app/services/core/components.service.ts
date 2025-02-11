import { Injectable, ViewContainerRef, Type, ComponentFactoryResolver } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ComponentsService {

    components: any[] = [];

    verifyCaptchaComponent = new Subject<any>();
    public verifyCaptchaComponent$ = this.verifyCaptchaComponent.asObservable();

    synopticContainer!: ViewContainerRef;
    noteSynopticContainer!: ViewContainerRef;
    menuContainer!: ViewContainerRef;
    registryContainer!: ViewContainerRef;
    locatorRegistryContainer!: ViewContainerRef;
    addFeatureContainer!: ViewContainerRef;
    alertsContainer!: ViewContainerRef;
    simpleNoteContainer!: ViewContainerRef;
    settingsContainer!: ViewContainerRef;
    helpContainer!: ViewContainerRef;
    coordinateFinderContainer!: ViewContainerRef;
    tocContainer!: ViewContainerRef;
    loadContextContainer!: ViewContainerRef;
    loadCardsContainer!: ViewContainerRef;
    detailLoadFilesContainer!: ViewContainerRef;
    LoadFilesAuxContainer!: ViewContainerRef;


    constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

    setSynopticContainer(container: ViewContainerRef) {
        this.synopticContainer = container;
    }

    setMenuContainer(container: ViewContainerRef) {
        this.menuContainer = container;
    }

    setRegistryContainer(container: ViewContainerRef) {
        this.registryContainer = container;
    }

    setLocatorRegistryContainer(container: ViewContainerRef) {
        this.locatorRegistryContainer = container;
    }

    setAddFeatureContainer(container: ViewContainerRef) {
        this.addFeatureContainer = container;
    }

    setAlertsContainer(container: ViewContainerRef) {
        this.alertsContainer = container;
    }

    setSimpleNoteContainer(container: ViewContainerRef) {
        this.simpleNoteContainer = container;
    }

    setSettingsContainer(container: ViewContainerRef) {
        this.settingsContainer = container;
    }

    setHelpContainer(container: ViewContainerRef) {
        this.helpContainer = container;
    }

    setCoordinateFinderContainer(container: ViewContainerRef) {
        this.coordinateFinderContainer = container;
    }

    setTocContainer(container: ViewContainerRef) {
        this.tocContainer = container;
    }

    setLoadContextContainer(container: ViewContainerRef) {
        this.loadContextContainer = container;
    }

    setNoteSynopticContainer(container: ViewContainerRef) {
        this.noteSynopticContainer = container;
    }

    setLoadCardsContainer(container: ViewContainerRef) {
        this.loadCardsContainer = container;
    }

    setDetailLoadFilesContainer(container: ViewContainerRef) {
        this.detailLoadFilesContainer = container;
    }

    setLoadFilesAuxContainer(container: ViewContainerRef) {
        this.LoadFilesAuxContainer = container;
    }

    addComponent(container: ViewContainerRef, componentClass: Type<any>) {
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(componentClass);
        const component = container.createComponent(componentFactory);
        this.components.push(component);
    }

    removeComponents(container: ViewContainerRef) {
        container.clear();
        this.components = [];
    }

    removeComponent(container: ViewContainerRef, componentClass: Type<any>) {
        const component = this.components.find((elementComponent) => elementComponent.instance instanceof componentClass);
        const componentIndex = this.components.indexOf(component);
        if (componentIndex !== -1) {
            container.remove(container.indexOf(component));
            this.components.splice(componentIndex, 1);
        }
    }

}
