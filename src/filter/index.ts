/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import EventEmitter from 'eventemitter3';
import TreeModel from 'tree-model';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Payload = any;

type FilterFunction = (arg0: Payload) => boolean;

/**
 *
 */
interface FilterModel {
  name: string;
  filter?: FilterFunction;
  exclusive?: boolean;
  and?: boolean;
  selected?: boolean;
  context?: any;
  children?: FilterModel[];
}

interface Node {
  model: FilterModel;
  children: Node[];
  parent: Node;
  isRoot: () => boolean;
  hasChildren: () => boolean;
  addChild: (arg0: Node) => Node;
  addChildAtIndex: (arg0: Node, arg1: number) => Node;
  setIndex: (arg0: number) => Node;
  getIndex: () => number;
  getPath: () => Node[];
  drop: () => Node;
  first: (arg0: (arg0: Node) => boolean) => Node;
  all: (arg0: (arg0: Node) => boolean) => Node[];
  walk: (arg0: (arg0: Node) => any) => any;
}

const ROOT_NODE = '__ROOT';

/**
 * Recursively build filter function from tree
 * @private
 */
const buildNodeFunction = ({
  children,
  model
}: Node): FilterFunction | null => {
  // Exit condition
  if (children.length === 0) {
    if (model.selected && model.filter && typeof model.filter === 'function') {
      return model.filter;
    }
    return null;
  }

  // If this group is selected, add filter function
  let fn = () => true;
  if (model.selected && typeof model.filter === 'function') {
    // @ts-ignore
    fn = model.filter;
  }

  // Recursively create array of children
  // Ignore when null
  const functions = children
    .map(child => buildNodeFunction(child))
    .filter(child => typeof child === 'function');

  // If no functions returned, local function
  if (functions.length === 0) {
    return fn;
  }

  if (model.and === true) {
    // @ts-ignore
    return p => fn(p) && functions.every(func => func(p));
  }

  // @ts-ignore
  return p => fn(p) && functions.some(func => func(p));
};

interface FilterConfig {
  filters: FilterModel[];
  and?: boolean;
  global?: FilterFunction[];
}

/**
 * @name FilterClass
 * @private
 */
class Filter extends EventEmitter {
  root: Node;
  global: FilterFunction[];

  constructor({ filters, global = [], and = true }: FilterConfig) {
    super();

    if (typeof filters !== 'object') {
      throw new Error('Crisp.Filter expects a filters object');
    }

    this.global = global;

    const treeModel = new TreeModel();
    // @ts-ignore
    this.root = treeModel.parse({
      name: ROOT_NODE,
      and,
      children: [...filters]
    });
  }

  /**
   * Retrieve node by name
   * @private
   */
  getNode = (name: string) => {
    const node = this.root.first(n => n.model.name === name);

    if (!node) {
      throw new Error(`Node '${name}' does not exist`);
    }

    return node;
  };

  /**
   * Selects a given node in the filter tree
   * @param {string} name
   * @return {boolean} Success
   * @example
   * filter.select('blue');
   */
  select = (name: string) => {
    const node = this.getNode(name);

    // Error if trying to select root node
    if (name === ROOT_NODE) {
      throw new Error('Cannot select the root node');
    }

    // Check if parent is exclusive & deselect all
    if (node.parent.model.exclusive === true) {
      node.parent.children.forEach(({ model }) => {
        // @TODO optimize
        if (model.name !== name) {
          this.deselect(model.name);
        }
      });
    }

    if (node && !node.model.selected) {
      node.model.selected = true;
      this.emit('update', {
        name: node.model.name,
        parent: node.parent.model.name,
        selected: true,
        context: node.model.context
      });
      return true;
    }

    return false;
  };

  /**
   * Deselects a given node in the filter tree
   * @param {string} name
   * @return {boolean} Success
   * @example
   * filter.select('blue');
   */
  deselect = (name: string) => {
    const node = this.getNode(name);

    if (node && node.model.selected === true) {
      node.model.selected = false;
      this.emit('update', {
        name: node.model.name,
        parent: node.parent.model.name,
        selected: false,
        context: node.model.context
      });
      return true;
    }

    return false;
  };

  /**
   * Deselects all children of a given node
   * @param {string} name
   * @return {boolean} Success
   * @example
   * filter.clear('color');
   */
  clear = (name: string) => {
    const node = this.getNode(name);

    if (node) {
      node.children.forEach(({ model }) => this.deselect(model.name));
    }

    return false;
  };

  /**
   * Returns the context of a given node
   * @param {string} name
   * @return {any} context
   */
  context = (name: string) => {
    const { model } = this.getNode(name);
    return model.context;
  };

  /**
   * Generates a filter function based on the current state of the filter tree
   * @return {FilterFunction}
   * @example
   * [1, 2, 3].filter(filter.fn());
   */
  fn = (): FilterFunction => payload => {
    if (this.global.every(func => func(payload)) === false) {
      return false;
    }

    const treeFunction = buildNodeFunction(this.root);

    return treeFunction ? treeFunction(payload) : true;
  };

  /**
   * Returns a comma delimited string of the selected filters
   * @return {string}
   * @example
   * filter.getQuery();
   * // red,yellow
   */
  getQuery = () => {
    const selected = [];

    this.root.walk(({ model }) => {
      if (model.selected === true) {
        selected.push(model.name);
      }
    });

    return selected.join(',');
  };

  /**
   * Takes a query are and select the required filters
   * @param {string}
   * @example
   * filter.setQuery('red,yellow');
   */
  setQuery = (query: string) => {
    const names = query.split(',');
    this.root.walk(({ model }) => {
      if (names.includes(model.name)) {
        this.select(model.name);
      } else {
        this.deselect(model.name);
      }
    });
  };

  /**
   * The update event
   * @name on
   * @memberof Filter
   * @param {string} eventName
   * @param {FilterEventCallback} cb
   * @example
   * filter.on('update', ({ name, parent, selected, context }) => {
   *   // Update filter ui
   * });
   */

  /**
   * The event callback
   * @callback FilterEventCallback
   * @param {object} options
   * @param {string} options.name
   * @param {string} options.parent
   * @param {boolean} options.selected
   * @param {any} options.context
   */
}

/**
 * Creates a new filter object
 * @name Filter
 * @param {object} config
 * @param {Array<FilterModel>} config.filters
 * @param {Array<FilterFunction>} [config.global = []]
 * @param {boolean} [config.and = true]
 * @return {FilterInstance}
 * @example
 * const filter = Filter({
 *   global: [
 *     color => typeof color === 'string',
 *   ],
 *   filters: [
 *     {
 *       name: 'blue',
 *       filter: color => color === 'blue',
 *     },
 *     {
 *       name: 'red',
 *       filter: color => color === 'red',
 *       selected: true,
 *     },
 *     {
 *       name: 'yellow',
 *       filter: color => color === 'yellow',
 *     },
 *   ],
 *   and: false,
 * });
 */
const createFilter = (config: FilterConfig) => new Filter(config);

export default createFilter;
