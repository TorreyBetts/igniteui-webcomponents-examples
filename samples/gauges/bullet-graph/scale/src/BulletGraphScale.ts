


import { IgcBulletGraphModule } from 'igniteui-webcomponents-gauges';
import { IgcBulletGraphComponent } from 'igniteui-webcomponents-gauges';
import { ModuleManager } from 'igniteui-webcomponents-core';

ModuleManager.register(IgcBulletGraphModule);


export class BulletGraphScale {

    private gauge: IgcBulletGraphComponent;

    constructor() {
        
        this.gauge = document.getElementById('gauge') as IgcBulletGraphComponent;

    }

}

let sample = new BulletGraphScale();