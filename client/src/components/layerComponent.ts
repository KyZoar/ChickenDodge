import { Component } from './component';
import { SpriteComponent } from './spriteComponent';
import { IDisplayComponent } from '../displaySystem';
import { TextureComponent } from './textureComponent';
import * as GraphicsAPI from '../graphicsAPI';

let GL: WebGLRenderingContext;

// # Classe *LayerComponent*
// Ce composant représente un ensemble de sprites qui
// doivent normalement être considérées comme étant sur un
// même plan.
export class LayerComponent extends Component<Object> implements IDisplayComponent {
  private vertexBuffer: WebGLBuffer;
  private indexBuffer: WebGLBuffer;
		
  // ## Méthode *setup*
  setup() {
    GL = GraphicsAPI.context;
    
    // Création des buffers
    this.vertexBuffer = GL.createBuffer()!;
    this.indexBuffer = GL.createBuffer()!;
    
    const MAX_SPRITES = 1000;
    var vertices = new Float32Array(4 * TextureComponent.vertexSize * MAX_SPRITES);
    var ind = [];
    for (var i = 0 ; i < MAX_SPRITES ; i++) {
      var k = i * 4;
      ind.push(k, k+1, k+2, k+2, k+3, k);
    }
    var indices = new Uint16Array(ind);
    
    // On crée ici un tableau de 4 vertices permettant de représenter
    // le rectangle à afficher.
    GL.bindBuffer(GL.ARRAY_BUFFER, this.vertexBuffer);
    GL.bufferData(GL.ARRAY_BUFFER, vertices, GL.DYNAMIC_DRAW);

    // On crée ici un tableau de 6 indices, soit 2 triangles, pour
    // représenter quels vertices participent à chaque triangle:
    // ```
    // 0    1
    // +----+
    // |\   |
    // | \  |
    // |  \ |
    // |   \|
    // +----+
    // 3    2
    // ```
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, indices, GL.DYNAMIC_DRAW);
  }

  // ## Méthode *display*
  // La méthode *display* est appelée une fois par itération
  // de la boucle de jeu.
  display(dT: number) {
    const layerSprites = this.listSprites();
    if (layerSprites.length === 0) {
      return;
    }
    const spriteSheet = layerSprites[0].spriteSheet;

    // Dans le cas où nous avons une plaque de sprite
    if (spriteSheet) {
      // Construction des indices pour la lecture des sprites
      var vertices = new Float32Array(4 * TextureComponent.vertexSize * layerSprites.length);
      var ind = [];
      for (var i = 0 ; i < layerSprites.length ; i++) {
        var sprite = layerSprites[i];
        if (sprite.vertices) {
          var k = i*4;
          vertices.set(sprite.vertices, k * TextureComponent.vertexSize);
          ind.push(k, k+1, k+2, k+2, k+3, k);
        }
      }
      var indices = new Uint16Array(ind);

      // Mise en place du VBO
      GL.bindBuffer(GL.ARRAY_BUFFER, this.vertexBuffer);
      GL.bufferSubData(GL.ARRAY_BUFFER, 0, vertices);
      GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
      GL.bufferSubData(GL.ELEMENT_ARRAY_BUFFER, 0, indices);
      /*
      GL.bindBuffer(GL.ARRAY_BUFFER, this.vertexBuffer);
      GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
      this.spriteSheet.bind();
      GL.drawElements(GL.TRIANGLES, 6, GL.UNSIGNED_SHORT, 0);
      this.spriteSheet.unbind();
      */

      // Dessin
      spriteSheet.bind();
      GL.drawElements(GL.TRIANGLES, 6 * i, GL.UNSIGNED_SHORT, 0);
      spriteSheet.unbind();
    }
  }

  // ## Fonction *listSprites*
  // Cette fonction retourne une liste comportant l'ensemble
  // des sprites de l'objet courant et de ses enfants.
  private listSprites() {
    const sprites: SpriteComponent[] = [];
    this.owner.walkChildren((child) => {
      if (!child.active)
        return;

      child.walkComponent((comp) => {
        if (comp instanceof SpriteComponent && comp.enabled)
          sprites.push(comp);
      });
    });

    return sprites;
  }
}
