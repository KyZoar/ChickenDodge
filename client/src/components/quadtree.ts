import { Rectangle } from './rectangle';
import { ColliderComponent } from './colliderComponent';

const MAX_OBJECTS = 50;
const MAX_LEVELS = 5;


export class Quadtree {

	private colliders: ColliderComponent[];
	private level: number;
	private bounds: Rectangle;
	private nodes : Quadtree[];

	// Constructeur
	constructor(level:number, bounds:Rectangle) {
		this.level = level;
		this.bounds = bounds;
		this.colliders = [];
		this.nodes = [];
	}

    //libération des variables
	clear() {
		this.colliders = [];
		this.nodes = [];
	}

	//Méthode split
	split() {
		this.nodes = [];

        var subWidth = (this.bounds.xMax - this.bounds.xMin) / 2;
		var subHeight = (this.bounds.yMax - this.bounds.yMin) / 2;
		var subX = this.bounds.xMin;
		var subY = this.bounds.yMin;

		// Inférieur gauche
		this.nodes.push(new Quadtree(this.level + 1, new Rectangle({
			x: subX,
			y: subY,
			width: subWidth,
			height: subHeight,
		})));

		// Supérieur gauche
		this.nodes.push(new Quadtree(this.level + 1, new Rectangle({
			x: subX,
			y: subY + subHeight,
			width: subWidth,
			height: subHeight,
		})));

		// Inférieur droit
		this.nodes.push(new Quadtree(this.level + 1, new Rectangle({
			x: subX + subWidth,
			y: subY,
			width: subWidth,
			height: subHeight,
		})));

		// Supérieur droit
		this.nodes.push(new Quadtree(this.level + 1, new Rectangle({
			x: subX + subWidth,
			y: subY + subHeight,
			width: subWidth,
			height: subHeight,
		})));
	}

	getIndex(area : Rectangle) {
		var width = this.bounds.xMax - this.bounds.xMin;
		var height = this.bounds.yMax - this.bounds.yMin;
		var verticalMiddle = this.bounds.xMin + width / 2;
		var horizontalMiddle = this.bounds.yMin + height / 2;

		var top = (area.yMin > horizontalMiddle);
		var bottom = (area.yMax < horizontalMiddle);
		var left = (area.xMax < verticalMiddle);
		var right = (area.xMin > verticalMiddle);

		if (bottom && left) {
			return 0;
    	} else if (top && left) {
			return 1;
		} else if (bottom && right) {
			return 2;
		} else if (top && right) {
			return 3;
		}

		return -1;
	}

	insert(collider: ColliderComponent) {
		if (this.nodes.length > 0) {
			var index = this.getIndex(collider.area);

			if (index != -1) {
				this.nodes[index].insert(collider);
				return;
			}
		}

		this.colliders.push(collider);

		if (this.colliders.length > MAX_OBJECTS && this.level < MAX_LEVELS) {
			if (this.nodes.length == 0) {
				this.split();
			}

			var i = 0;
			while (i < this.colliders.length) {
				var c = this.colliders[i];
				var index = this.getIndex(c.area);
				if (index != -1) {
					this.colliders.splice(i, 1);
					this.nodes[index].insert(c);
				} else {
					i++;
				}
			}
		}
	}

	retrieve(area: Rectangle): ColliderComponent[] {
		var index = this.getIndex(area);
		var result: ColliderComponent[] = [];
		if (index != -1 && this.nodes.length != 0) {
			result = this.nodes[index].retrieve(area);
		}

		result = result.concat(this.colliders);

		return result;
	}
}