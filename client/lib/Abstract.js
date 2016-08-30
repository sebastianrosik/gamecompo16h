import {getNextId} from './generators';

export default class Abstract {
  constructor() {
  	this.id = getNextId();
  	this.children = [];
  }

  add(child) {
    child.parent = this;
    this.children.unshift(child);
  }

  remove(child) {
    let index = this.children.indexOf(child);
    child.parent = undefined;
    this.children.splice(index, 1);
  }
}