import Axios from 'axios';
import request from './request';

import { Request, Response, Cancel } from '../types';

interface Return {
  response: Promise<Response>;
  cancel: Cancel;
}

const cancelable = (req: Request): Return => {
  // Create cancel
  let cancel = () => undefined;
  const cancelToken = new Axios.CancelToken(c => {
    cancel = c;
  });

  const response = request({
    ...req,
    cancelToken
  });

  return {
    response,
    cancel
  };
};

export default cancelable;
