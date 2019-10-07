import Axios from 'axios';
import { Collection, Search, SearchableCollection } from './clients';
import Filter from './filter';
import { version } from '../package.json';

/**
 * Active version of Crisp
 * @name Version
 * @example
 * console.log(Crisp.Version);
 * // 0.0.0
 */

// This is populated by rollup
/* eslint-disable no-undef */
// $flow-ignore
const Version = version;
/* eslint-enable no-undef */

/**
 * A function to determine if an error is due to cancellation
 * @name isCancel
 * @kind function
 * @param {error} error
 * @return {boolean}
 * @example
 * const cancelled = Crisp.isCancel(error);
 */
const isCancel = Axios.isCancel;

const Crisp = {
  Collection,
  Search,
  SearchableCollection,
  Filter,
  isCancel,
  Version
};

export {
  Crisp,
  Collection,
  Search,
  SearchableCollection,
  Filter,
  isCancel,
  Version
};

export default Crisp;
