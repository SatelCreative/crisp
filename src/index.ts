import version from './version';
import request, { isCancel } from './request';

export { version, request, isCancel };

export interface Crisp {
  /**
   * Installed version of Crisp
   */
  version: string;

  /**
   * Make a cancellable request
   */
  request: any;

  /**
   * Checks if an error resulted from cancellation
   */
  isCancel: (error: Error) => boolean;
}

const Crisp: Crisp = {
  version,
  request,
  isCancel,
};

export default Crisp;
