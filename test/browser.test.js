const fs = require('fs');
const path = require('path');
const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const loggingPrefs = new webdriver.logging.Preferences();
loggingPrefs.setLevel(
  webdriver.logging.Type.BROWSER,
  webdriver.logging.Level.ALL
);

const chromeOptions = new chrome.Options();
chromeOptions.addArguments('--start-maximized');
chromeOptions.addArguments('--headless');
chromeOptions.setLoggingPrefs(loggingPrefs);

const crisp = fs.readFileSync(
  path.resolve(__dirname, '../dist/crisp.umd.production.min.js'),
  'utf8'
);

let driver;

beforeAll(async () => {
  driver = new webdriver.Builder()
    .forBrowser('chrome')
    .setChromeOptions(chromeOptions)
    .build();

  await driver.get('https://satel-crisp.myshopify.com');

  await driver.executeScript(`${crisp} window.Crisp = Crisp`);
});

afterAll(() => {
  driver.quit();
});

jest.setTimeout(30000);

describe('Browser Testing', () => {
  const fileNames = fs.readdirSync(path.resolve(__dirname, 'browser'));

  for (name of fileNames) {
    if (!name.endsWith('.js')) {
      continue;
    }

    const filePath = path.resolve(__dirname, 'browser', name);
    const formattedName = name.replace('.js', '');

    it(`browser/${formattedName} generates expected output`, async () => {
      const response = await driver.executeAsyncScript(
        fs.readFileSync(filePath, 'utf8')
      );

      // Capture the logs
      const logs = await driver
        .manage()
        .logs()
        .get(webdriver.logging.Type.BROWSER);

      if (logs.length) {
        console.log(`spec "${formattedName}" logged to the console:`);
        logs.forEach(({ level, message }) => {
          switch (level.name_) {
            case 'INFO':
              console.info(message);
              return;
            case 'WARN':
              console.warn(message);
              return;
            case 'SEVERE':
              console.error(message);
              return;
            default:
              console.log(message);
          }
        });
      }

      // Special case for version
      if (formattedName === 'version') {
        expect(typeof response).toEqual('string');
      } else {
        expect(response).toMatchSnapshot(formattedName);
      }
    });
  }
});
