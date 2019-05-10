import Version from './Version';

export { Version };

export interface Crisp {
  /**
   * Installed version of Crisp
   */
  Version: string;
}

const Crisp: Crisp = {
  Version
};

export default Crisp;
