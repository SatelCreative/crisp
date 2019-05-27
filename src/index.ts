import version from './version';
import request from './request';
import { isCancel } from './cancel';
import FilterClass, { LegacyFilterConfig, FilterFactory } from './filter';

const Filter = (config: LegacyFilterConfig) => new FilterClass(config);

// Support tree shaking
export { version, request, isCancel, Filter, FilterFactory };

export interface Crisp {
  /**
   * Installed version of Crisp
   */
  version: string;

  /**
   * Make a cancellable request
   */
  request: typeof request;

  /**
   * Checks if an error resulted from cancellation
   */
  isCancel: (error: Error) => boolean;

  /**
   * @deprecated
   *
   * @type {typeof Filter}
   * @memberof Crisp
   */
  Filter: typeof Filter;
}

// Support UMD
const Crisp: Crisp = {
  version,
  request,
  isCancel,
  Filter
};

export default Crisp;
