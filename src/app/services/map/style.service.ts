import { Injectable } from '@angular/core';
import Style from 'ol/style/Style';
import Circle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Text from 'ol/style/Text';

@Injectable({
  providedIn: 'root'
})
export class StyleService {

  constructor() { }

  styleFunction = (feature: any) => {
    const type = feature.get('type');
    if (type === 'solar') {
      feature.setStyle([
        this.getStyleSolar(),
        this.getTextStyle(feature.get('localId'),'#ff7f00')
      ]);
    } else if (type === 'biodiversidad') {
      feature.setStyle([
        this.getStyleBio(),
        this.getTextStyle(feature.get('localId'),'#4daf4a')
      ]);
    } else {
      feature.setStyle([
        this.getStyleDefault(),
        this.getTextStyle(feature.get('localId'),'#3b83bd')
      ]);
    }
    
  }

  getStyleBio(): Style {
    const patternStyle = new Style({
      stroke: new Stroke({
          color: '#4daf4a',
          width: 3
      })
    });

    return patternStyle;
  }

  getStyleSolar(): Style {
    const patternStyle = new Style({
      stroke: new Stroke({
          color: '#ff7f00',
          width: 3
      })
    });

    return patternStyle;
  }

  getStyleDefault(): Style {
    const patternStyle = new Style({
      stroke: new Stroke({
          color: '#3b83bd',
          width: 3
      })
    });

    return patternStyle;
  }

  getTextStyle(text: string, color: string) {
    return new Style({
        text: new Text({
            text: text,
            font: '12px Calibri,sans-serif',
            fill: new Fill({
                color: color
            }),
            stroke: new Stroke({
                color: 'rgba(255, 255, 255, 0.9)',
                width: 3
            })
        })
    });
  }

}


