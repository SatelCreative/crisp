import version from './version';
import request from './request';

export { version, request };

export interface Crisp {
  /**
   * Installed version of Crisp
   */
  version: string;

  /**
   * Make a cancellable request
   */
  request: any;
}

const Crisp: Crisp = {
  version,
  request,
};

export default Crisp;
