


import { IgcRadialGaugeModule } from 'igniteui-webcomponents-gauges';
import { IgcRadialGaugeComponent } from 'igniteui-webcomponents-gauges';
import { ModuleManager } from 'igniteui-webcomponents-core';

ModuleManager.register(IgcRadialGaugeModule);


export class RadialGaugeTickmarks {

    private gauge: IgcRadialGaugeComponent;

    constructor() {        

        this.gauge = document.getElementById('gauge') as IgcRadialGaugeComponent;

    }

}

let sample = new RadialGaugeTickmarks();