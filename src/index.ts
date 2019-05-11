import version from './version';
import request from './request';
import { isCancel } from './cancel';

// Support tree shaking
export { version, request, isCancel };

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
}

// Support UMD
const Crisp: Crisp = {
  version,
  request,
  isCancel
};

export default Crisp;
