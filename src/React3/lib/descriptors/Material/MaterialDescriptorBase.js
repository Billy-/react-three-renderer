import THREE from 'three';
import THREEElementDescriptor from '../THREEElementDescriptor';
import invariant from 'fbjs/lib/invariant';

import resource from '../decorators/resource';

import ResourceReference from '../../Resources/ResourceReference';

import PropTypes from 'react/lib/ReactPropTypes';

@resource
class MaterialDescriptorBase extends THREEElementDescriptor {
  constructor(react3Instance) {
    super(react3Instance);

    this.hasProp('slot', {
      type: PropTypes.string,
      updateInitial: true,
      update: (threeObject, slot, hasProperty) => {
        if (hasProperty) {
          threeObject.userData._materialSlot = slot;
        } else {
          threeObject.userData._materialSlot = 'material';
        }
      },
      default: 'material',
    });

    this.hasProp('transparent', {
      type: PropTypes.bool,
      simple: true,
    });

    this.hasProp('alphaTest', {
      type: PropTypes.number,
      updateInitial: true,
      update: (self, alphaTest) => {
        self.alphaTest = alphaTest;
      },
      initialOnly: true,
    });

    this.hasProp('side', {
      type: PropTypes.oneOf([THREE.FrontSide, THREE.BackSide, THREE.DoubleSide]),
      updateInitial: true,
      update: (self, side) => {
        self.side = side;
      },
      default: undefined,
    });

    this.hasProp('opacity', {
      type: PropTypes.number,
      simple: true,
    });

    this.hasProp('visible', {
      type: PropTypes.number,
      simple: true,
      default: true,
    });
  }

  getMaterialDescription(props) {
    const materialDescription = {};

    if (props.hasOwnProperty('color')) {
      materialDescription.color = props.color;
    }

    return materialDescription;
  }

  hasColor() {
    this.hasProp('color', {
      type: PropTypes.number,
      update: (threeObject, newColor) => {
        threeObject.color.set(newColor);
      },
      default: 0xffffff,
    });
  }

  hasWireframe() {
    this.hasProp('wireframe', {
      type: PropTypes.bool,
      simple: true,
      default: false,
    });

    this.hasProp('wireframeLinewidth', {
      type: PropTypes.number,
      simple: true,
      default: 1,
    });
  }

  construct() {
    return new THREE.Material({});
  }

  applyInitialProps(threeObject, props) {
    threeObject.userData = {
      ...threeObject.userData,
    };

    super.applyInitialProps(threeObject, props);
  }

  setParent(material, parentObject3D) {
    invariant(parentObject3D instanceof THREE.Mesh || parentObject3D instanceof THREE.Points, 'Parent is not a mesh');
    invariant(parentObject3D[material.userData._materialSlot] === undefined, 'Parent already has a ' + material.userData._materialSlot + ' defined');
    super.setParent(material, parentObject3D);

    parentObject3D[material.userData._materialSlot] = material;
  }

  unmount(material) {
    const parent = material.userData.parentMarkup.threeObject;

    // could either be a resource description or an actual material
    if (parent instanceof THREE.Mesh || parent instanceof THREE.Points) {
      const slot = material.userData._materialSlot;

      if (parent[slot] === material) {
        parent[slot] = undefined;
      }
    }

    material.dispose();

    super.unmount(material);
  }

  highlight(threeObject) {
    const ownerMesh = threeObject.userData.parentMarkup.threeObject;
    threeObject.userData.events.emit('highlight', {
      uuid: threeObject.uuid,
      boundingBoxFunc: () => {
        const boundingBox = new THREE.Box3();

        boundingBox.setFromObject(ownerMesh);

        return [boundingBox];
      },
    });
  }

  getBoundingBoxes(threeObject) {
    const boundingBox = new THREE.Box3();

    boundingBox.setFromObject(threeObject.userData.parentMarkup.threeObject);

    return [boundingBox];
  }

  hideHighlight(threeObject) {
    threeObject.userData.events.emit('hideHighlight');
  }

  addChildren(threeObject, children) {
    invariant(children.filter(this._invalidChild).length === 0, 'Mesh children can only be materials or geometries!');
  }

  addChild(threeObject, child) {
    this.addChildren(threeObject, [child]);
  }

  moveChild() {
    // doesn't matter
  }

  removeChild() {
    // doesn't matter
  }

  invalidChildInternal(child) {
    const invalid = !(child instanceof THREE.Texture || child instanceof ResourceReference );

    if (invalid) {
      debugger;
    }

    return invalid;
  }

  _invalidChild = child => {
    return this.invalidChildInternal(child);
  };
}

export default MaterialDescriptorBase;
