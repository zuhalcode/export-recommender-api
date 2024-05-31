/* eslint-disable prettier/prettier */
import { HttpStatus, Injectable } from '@nestjs/common';
import puppeteer, { Page } from 'puppeteer';
import * as fs from 'fs';
import { join } from 'path';
import {
  GetTrademapResponse,
  ScrapeExporterResponse,
  ScrapeImporterResponse,
} from 'src/model/trademap.model';

import { DatabaseService } from 'src/common/database.service';

@Injectable()
export class TrademapService {
  constructor(private readonly databaseService: DatabaseService) {}

  private readonly dropdownSelector =
    '#ctl00_NavigationControl_DropDownList_Product';

  // DIRECT USED FUNCTION

  private getLocalJSONData(filename: string, dir: string = '') {
    try {
      const filePath = join(process.cwd(), 'src', 'data', dir, filename);
      const rawData = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(rawData);
      return data;
    } catch (error) {
      return { error };
    }
  }

  async loginTrademap(page: Page) {
    try {
      await page.goto(
        'https://idserv.marketanalysis.intracen.org/Account/Login?ReturnUrl=%2Fconnect%2Fauthorize%2Fcallback%3Fclient_id%3DTradeMap%26scope%3Dopenid%2520email%2520profile%2520offline_access%2520ActivityLog%26redirect_uri%3Dhttps%253A%252F%252Fwww.trademap.org%252FLoginCallback.aspx%26state%3D47f9919e804a425e96acfda3c13cadd5%26response_type%3Dcode%2520id_token%26nonce%3Dbe118b2d57e24b8babc2100e7c26d846%26response_mode%3Dform_post',
      );

      // Use page.$eval to directly set the input value without triggering events
      await page.$eval(
        '#Username',
        (el: HTMLInputElement, value: string) => (el.value = value),
        'zuhalcode@gmail.com',
      );

      // Similarly, set the password field
      await page.$eval(
        '#Password',
        (el: HTMLInputElement, value: string) => (el.value = value),
        'trademapZuhal2620',
      );

      // Click the login button
      await page.click('button[value="login"]'); // Replace with the actual selector of the login button

      // Wait for navigation after login (replace 'dashboard' with the expected URL after login)
      await page.waitForNavigation({ waitUntil: 'domcontentloaded' });

      // Wait for the <a> element to be available in the DOM
      await page.waitForSelector('#ctl00_MenuControl_marmenu_login');

      // Click the <a> element
      await page.click('#ctl00_MenuControl_marmenu_login');

      // Pause execution and wait for user input (press Enter) after filling out the CAPTCHA manually
      await page.waitForNavigation({ waitUntil: 'domcontentloaded' });

      // Wait for 5 seconds (adjust as needed) to allow manual interaction
      await page.waitForTimeout(15000);

      // Continue with other interactions on the page as needed
      console.log('CAPTCHA filled and navigation completed');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      // await browser.close();
    }
  }

  async scrapeExportersByIdTagImporters(page: Page) {
    try {
      await page.waitForSelector('table');
      // Extract data from all <tr> elements
      const tableData = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('table tr'));
        const data = [];
        for (let i = 17; i < rows.length - 6; i++) {
          const columns = Array.from(rows[i].querySelectorAll('td'));
          const rowData = columns.slice(1, 7).map((column) => column.innerText);
          const mappedData = {
            exporter: rowData[0],
            valueImported: rowData[1],
            tradeBalance: rowData[2],
            quantityImported: rowData[3],
            quantityUnit: rowData[4],
            unitValue: rowData[5],
          };
          data.push(mappedData);
        }
        return data;
      });

      return tableData;
    } catch (error) {
      console.log(error);
    }
  }

  async scrapeHScode(page: Page, resultData: any[]) {
    await page.waitForSelector(this.dropdownSelector);
    // Evaluasi ekspresi JavaScript untuk mendapatkan value dari opsi yang terpilih
    const dropdownElement = await page.$(this.dropdownSelector);
    if (dropdownElement) {
      // Get option values
      const optionValues = await page.evaluate((dropdown) => {
        const options = Array.from(dropdown.querySelectorAll('option'));
        const hscodes = options
          .map((option: HTMLOptionElement) => option.value)
          .filter((value) => value.length === 4);

        const titles = options
          .filter((option: HTMLOptionElement) => hscodes.includes(option.value))
          .map((option: HTMLOptionElement) => option.title.substring(11));

        return { hscodes, titles };
      }, dropdownElement);
      const resultUrls: string[] = [];

      // Get All Url
      for (const optionValue of optionValues.hscodes) {
        // Emulate a user selecting an option
        await page.select(this.dropdownSelector, optionValue);

        // Wait for navigation to complete
        await page.waitForNavigation();

        // Get the current URL after navigation
        const currentUrl = page.url();

        // Collect the URL
        resultUrls.push(currentUrl);
      }

      const { hscodes, titles } = optionValues;

      const trademapCategories = hscodes.map((hscode, i) => ({
        hscode,
        name: titles[i].toLowerCase(),
        link: resultUrls[i],
      }));

      trademapCategories.forEach((data) =>
        !resultData.some((existingData) => existingData.hscode === data.hscode)
          ? resultData.push(data)
          : null,
      );
    } else return { message: 'Dropdown element not found' };
  }

  // Direct used function

  // CRUD

  async findAll(): Promise<GetTrademapResponse[]> {
    const trademaps = await this.databaseService.trademap.findMany({
      where: {
        hscode: {
          notIn: [
            '0309',
            '0402',
            ...Array.from({ length: 9 }, (_, i) => `050${i + 3}`),
            '0807',
            '0810',
            '1002',
            '1005',
            '1008',
            ...Array.from({ length: 4 }, (_, i) => `140${i + 1}`),
            '1508',
            '1513',
            '1518',
            '1701',
            '1802',
            '1901',
            '2009',
            '2106',
            '2209',
            '2309',
            '2401',
            '2402',
            '2403',
            '2404',
            '3401',
            '3402',
            '3809',
            '3812',
            '3818',
            ...Array.from({ length: 7 }, (_, i) => `382${i + 1}`),
            '4005',
            '4016',
            ...Array.from({ length: 3 }, (_, i) => `420${i + 4}`),
            '6101',
            ...Array.from({ length: 5 }, (_, i) => `610${i + 6}`),
            '6206',
            '6208',
            '9405',
            // add
            '0303',
            '0404',
            '0406',
            '0410',
            '0602',
            '0709',
            '0710',
            '0713',
            '0714',
            '0903',
            '0905',
            '1003',
            '1502',
            '1504',
            '1505',
            '1509',
            '1521',
            '1601',
            '1602',
            '1605',
            '1702',
            '1704',
            '1806',
            '1902',
            '1905',
            '2004',
            '2006',
            '2102',
            '2103',
            '2105',
            '2202',
            '2203',
            '2208',
            '2303',
            '3403',
            '3801',
            '3806',
            '3811',
            '3813',
            '3814',
            '3815',
            '3816',
            '3820',
            '4002',
            '4008',
            '4009',
            '4010',
            '4011',
            '4201',
            '4203',
            '6213',
            '6404',
            '6405',
            '6702',
            '9402',
          ],
        },
      },
      select: { hscode: true, name: true },
    });

    return trademaps;
  }

  async findOne(hscode: string): Promise<GetTrademapResponse> {
    const trademap = await this.databaseService.trademap.findFirstOrThrow({
      where: { hscode },
      select: { hscode: true, name: true },
    });

    return trademap;
  }

  async create(scrapedData: any[]) {
    // Extract hscode values from the scraped data
    const hscodeValues = scrapedData.map((item) => item.hscode);

    // Check for existing data based on hscode
    const existingData = await this.databaseService.trademap.findMany({
      where: {
        hscode: {
          in: hscodeValues,
        },
      },
    });

    // Filter out duplicate data
    const newData = scrapedData.filter(
      (item) =>
        !existingData.some((existing) => existing.hscode === item.hscode),
    );

    // Create new entries for non-duplicate data
    const createdTrademapCategories =
      await this.databaseService.trademap.createMany({
        data: newData.map((item) => ({
          hscode: item.hscode,
          name: item.name,
          link: item.link, // Map link to url assuming link is used for URL
        })),
      });

    return {
      status: HttpStatus.CREATED,
      data: createdTrademapCategories,
      message: 'Trademap categories created successfully',
    };
  }

  async createTrademap() {
    try {
      const trademapJSONData = this.getLocalJSONData('scrapedHscodeFix.json');

      const existingData = await this.databaseService.trademap.findMany({
        where: {
          hscode: {
            in: trademapJSONData.map((data) => data.hscode),
          },
        },
      });

      const newData = trademapJSONData.filter((data) => {
        // Cek apakah hscode dari data saat ini sudah ada dalam data yang ada
        return !existingData.some(
          (existing) => existing.hscode === data.hscode,
        );
      });

      const createdData = await this.databaseService.trademap.createMany({
        data: newData.map((data) => ({
          hscode: data.hscode,
          name: data.name.slice(0, 255),
          link: data.link,
        })),
      });

      return createdData;
    } catch (e) {
      console.log(e);
    }
  }

  async createImporters() {
    try {
      const importersJSONData = this.getLocalJSONData('clean-importers.json');

      const allHscodes = (
        await this.databaseService.trademap.findMany({
          select: { hscode: true },
        })
      ).map((data) => data.hscode);

      const createdData = await this.databaseService.importers.createMany({
        data: importersJSONData.map((data, i) => {
          if (allHscodes.includes(data.hscode)) {
            console.log(`Importer ke-${i + 1} hscode ${data.hscode}`);
            return {
              id: data.id,
              name: data.name,
              hscode: data.hscode,
              trade_balance: data.trade_balance,
              quantity_imported: data.quantity_imported,
              value_imported: data.value_imported,
              quantity_unit: data.quantity_unit,
              unit_value: data.unit_value || 0,
            };
          }
        }),
      });

      return createdData;
    } catch (e) {
      console.log(e);
    }
  }

  async createExporters() {
    try {
      const exportersJSONData = this.getLocalJSONData(
        'clean-exporters.json',
        'clean',
      );

      const allImporters = (
        await this.databaseService.importers.findMany({
          select: { id: true },
        })
      ).map((data) => data.id);

      const createdData = await this.databaseService.exporters.createMany({
        data: exportersJSONData.map((data, i) => {
          if (allImporters.includes(data.importer_id)) {
            console.log(`Exporter ke-${i + 1}`);

            return {
              importer_id: data.importer_id,
              name: data.name,
              trade_balance: parseFloat(
                data.tradeBalance === '' ? 0 : data.tradeBalance,
              ),
              quantity_imported: parseFloat(
                data.quantityImported === '' ? 0 : data.quantityImported,
              ),
              value_imported: parseFloat(
                data.valueImported === '' ? 0 : data.valueImported,
              ),
              unit_value: parseFloat(
                data.unitValue === '' ? 0 : data.unitValue,
              ),
            };
          }
        }),
      });

      return { message: 'Exporters Created Successfully', createdData };
    } catch (e) {
      console.log(e);
    }
  }

  // CRUD

  // SCRAPING

  async scrapeHscodeData() {
    const trademapData = this.getLocalJSONData('trademap-nonmigas.json');

    const browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox'],
    }); // Set headless to false for visibility
    const page = await browser.newPage();

    const startTime = performance.now();

    await this.loginTrademap(page);
    const resultData = [];

    await page.$eval(
      '#ctl00_PageContent_RadComboBox_Product_Input',
      (el: HTMLInputElement, value: string) => (el.value = value),
      '03',
    );

    // Wait for the specific img element to be available in the DOM
    await page.waitForSelector('#ctl00_PageContent_RadComboBox_Product_Image');

    // Click the img element
    await page.click('#ctl00_PageContent_RadComboBox_Product_Image');

    // Wait for the specific div element to be available in the DOM
    await page.waitForSelector(
      'div[title="03 - Fish and crustaceans, molluscs and other aquatic invertebrates"]',
    );

    // Click the div element
    await page.click(
      'div[title="03 - Fish and crustaceans, molluscs and other aquatic invertebrates"]',
    );

    // Wait for the specific input element to be available in the DOM
    await page.waitForSelector('#ctl00_PageContent_Button_TradeIndicators');

    // Click the input element
    await page.click('#ctl00_PageContent_Button_TradeIndicators');

    await page.waitForNavigation();

    for (const data of trademapData) {
      const { hscode, url } = data;
      const targetUrl = url.toString();

      try {
        await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
        console.log(`scraping hscode ${hscode}`);
        await this.scrapeHScode(page, resultData);
      } catch (error) {
        console.log(error);
      }
    }

    await browser.close();

    console.log(
      `Execute Time : ${
        (performance.now() - startTime) / 1000 >= 60
          ? `${Math.floor(
              (performance.now() - startTime) / 1000 / 60,
            )} minutes ${Math.floor(
              ((performance.now() - startTime) / 1000) % 60,
            )} seconds`
          : `${((performance.now() - startTime) / 1000).toFixed(2)} seconds`
      }`,
    );

    console.log(`Scraped ${resultData.length} data`);

    return resultData;
  }

  async scrapeImporters() {
    const browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox'],
    }); // Set headless to false for visibility
    const page = await browser.newPage();

    const __dirname = join(process.cwd(), 'src', 'data');
    const filePath = join(__dirname, 'scrapedImporters.json');

    const trademapData = this.getLocalJSONData('scrapedHSCODE.json');

    const importerData: ScrapeImporterResponse[] = [];
    const countData = [];
    for (const data of trademapData) {
      const { hscode, link } = data;
      try {
        await page.goto(link, { waitUntil: 'domcontentloaded' });
        console.log(`scraping hscode ${hscode}`);

        await page.select(
          'select[name="ctl00$PageContent$GridViewPanelControl$DropDownList_PageSize"]',
          '300',
        );

        await page.waitForSelector('table');

        // Wait until all <tr> elements inside the table are loaded
        await page.waitForFunction(() => {
          const rows = document.querySelectorAll('table tr');
          return rows.length > 150; // Adjust the minimum expected number of rows as needed
        });

        // Extract data from all <tr> elements
        const tableData = await page.evaluate(() => {
          const rows = Array.from(document.querySelectorAll('tr'));
          const data = [];
          for (let i = 15; i < rows.length - 6; i++) {
            const columns = Array.from(rows[i].querySelectorAll('td'));

            const rowData = columns
              .slice(1, 7)
              .map((column) => column.innerText);

            const mappedData = {
              importer: rowData[0].trim().toLowerCase(),
              value_imported: rowData[1],
              trade_balance: rowData[2],
              quantity_imported: rowData[3],
              quantity_unit: rowData[4].toLowerCase(),
              unit_value: rowData[5],
            };

            data.push(mappedData);
          }
          return data;
        });

        const tableDataWithHscode = tableData.map((item) => {
          return { ...item, hscode };
        });

        // Read the existing file to get its content
        fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) {
            console.error('Error reading file:', err);
            return;
          }

          let existingData;
          try {
            existingData = JSON.parse(data);
          } catch (error) {
            console.error('Error parsing JSON:', error);
            return;
          }

          // Push the new data to the existing array
          existingData.push(...tableDataWithHscode);

          // Write the updated data back to the file
          fs.writeFile(
            filePath,
            JSON.stringify(existingData, null, 2),
            (err) => {
              if (err) {
                console.error('Error writing file:', err);
                return;
              }
              console.log('Data appended successfully!');
            },
          );
        });

        importerData.push(...tableDataWithHscode);
        countData.push(tableDataWithHscode.length);
      } catch (error) {
        console.log(error);
      }
    }

    await browser.close();

    const scraped_data = importerData;

    return { scraped_data };
  }

  async scrapeRemainImporters() {
    const browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox'],
    }); // Set headless to false for visibility
    const page = await browser.newPage();

    const __dirname = join(process.cwd(), 'src', 'data');
    const filePath = join(__dirname, 'scrapedImporters.json');

    const remainImporters = this.getLocalJSONData('remainImporters.json');

    const importerData = [];
    const countData = [];

    for (const data of remainImporters) {
      const { hscode, link } = data;
      try {
        await page.goto(link, { waitUntil: 'domcontentloaded' });
        console.log(`scraping hscode ${hscode}`);

        // Use page.select() to select the option "by country"
        await page.select(
          'select[name="ctl00$NavigationControl$DropDownList_OutputOption"]',
          'ByCountry',
        );

        // Wait for navigation to complete
        await page.waitForNavigation();

        // Use page.select() to select the option "300 per page"
        await page.select(
          'select[name="ctl00$PageContent$GridViewPanelControl$DropDownList_PageSize"]',
          '300',
        );

        // Wait for navigation to complete
        await page.waitForNavigation();

        await page.select(
          'select[name="ctl00$PageContent$GridViewPanelControl$DropDownList_PageSize"]',
          '300',
        );

        await page.waitForSelector('table');

        // Wait until all <tr> elements inside the table are loaded
        await page.waitForFunction(() => {
          const rows = document.querySelectorAll('table tr');
          return rows.length > 30;
        });

        // Extract data from all <tr> elements
        const tableData = await page.evaluate(() => {
          const rows = Array.from(document.querySelectorAll('tr'));
          const data = [];
          for (let i = 15; i < rows.length - 6; i++) {
            const columns = Array.from(rows[i].querySelectorAll('td'));

            const rowData = columns
              .slice(1, 7)
              .map((column) => column.innerText);

            const mappedData = {
              importer: rowData[0].trim().toLowerCase(),
              valueImported: rowData[1],
              tradeBalance: rowData[2],
              quantityImported: rowData[3],
              quantityUnit: rowData[4].toLowerCase(),
              unitValue: rowData[5],
            };

            data.push(mappedData);
          }
          return data;
        });

        const tableDataWithHscode = tableData.map((item) => {
          return { ...item, hscode };
        });

        // Read the existing file to get its content
        fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) {
            console.error('Error reading file:', err);
            return;
          }

          let existingData;
          try {
            existingData = JSON.parse(data);
          } catch (error) {
            console.error('Error parsing JSON:', error);
            return;
          }

          // Push the new data to the existing array
          existingData.push(...tableDataWithHscode);

          // Write the updated data back to the file
          fs.writeFile(
            filePath,
            JSON.stringify(existingData, null, 2),
            (err) => {
              if (err) {
                console.error('Error writing file:', err);
                return;
              }
              console.log('Data appended successfully!');
            },
          );
        });

        importerData.push(...tableDataWithHscode);
        countData.push(tableDataWithHscode.length);
      } catch (error) {
        console.log(error);
      }
    }

    await browser.close();

    return {
      countData,
      count: importerData.length,
      importerData,
    };
  }

  async scrapeExporters() {
    const browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox'],
    });

    const page = await browser.newPage();

    const __dirname = join(process.cwd(), 'src', 'data');
    const filePath = join(__dirname, 'scrapedHscode-08.json');

    const hscodeData = await this.databaseService.trademap.findMany({});

    const scraped_data: ScrapeExporterResponse[] = [];

    for (const data of hscodeData) {
      const { hscode, link } = data;

      try {
        await page.goto(link, { waitUntil: 'domcontentloaded' });
        console.log('masuk ke hscode ' + hscode);

        // Use page.select() to select the option "300 per page"
        await page.select(
          'select[name="ctl00$PageContent$GridViewPanelControl$DropDownList_PageSize"]',
          '300',
        );

        // Wait for navigation to complete
        await page.waitForNavigation();

        await page.select(
          'select[name="ctl00$PageContent$GridViewPanelControl$DropDownList_PageSize"]',
          '300',
        );

        await page.waitForNavigation();

        // Wait until all <tr> elements inside the table are loaded
        await page.waitForFunction(() => {
          const rows = document.querySelectorAll('table tr');
          return rows.length > 50;
        });

        console.log('aman bolo');

        const importerData = await this.databaseService.importers.findMany({
          where: {
            hscode,
          },
          select: { id: true, name: true },
        });

        for (const importer of importerData) {
          await page.waitForSelector(
            'a[onclick^="javascript:SetValuesFromGrid"][id^="ctl00_PageContent_MyGridView1_ctl"]',
          );

          const exporterLinks = await page.$$(
            'a[onclick^="javascript:SetValuesFromGrid"][id^="ctl00_PageContent_MyGridView1_ctl"]',
          );

          for (const link of exporterLinks) {
            const linkText = await page.evaluate(
              (el) => el.textContent.trim().toLowerCase(),
              link,
            );

            if (linkText === importer.name) {
              await link.click();
              console.log(
                `\nmasuk ke hscode ${hscode} exporternya ${importer.name}`,
              );
              await page.waitForNavigation();

              await page.select(
                'select[name="ctl00$PageContent$GridViewPanelControl$DropDownList_PageSize"]',
                '300',
              );
              // Wait for navigation to complete
              await page.waitForNavigation();

              // Extract data from all <tr> elements
              const exporterData = await page.evaluate((importer) => {
                const rows = Array.from(document.querySelectorAll('tr'));
                const data = [];
                for (let i = 15; i < rows.length - 6; i++) {
                  const columns = Array.from(rows[i].querySelectorAll('td'));
                  const rowData = columns
                    .slice(1, 8)
                    .map((column) => column.innerText);
                  const mappedData = {
                    importer_id: importer.id,
                    name: rowData[0].trim().toLowerCase(),
                    trade_balance: rowData[2],
                    quantity_imported: rowData[4],
                    value_imported: rowData[1],
                    unit_value: rowData[6],
                  };
                  data.push(mappedData);
                }
                return data;
              }, importer);

              scraped_data.push(...exporterData);

              // Read the existing file to get its content
              fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                  console.error('Error reading file:', err);
                  return;
                }
                let existingData = null;
                try {
                  existingData = JSON.parse(data);
                } catch (error) {
                  console.error('Error parsing JSON:', error);
                  return;
                }
                // Push the new data to the existing array
                existingData.push(...exporterData);
                // Write the updated data back to the file
                fs.writeFile(
                  filePath,
                  JSON.stringify(existingData, null, 2),
                  (err) => {
                    if (err) {
                      console.error('Error writing file:', err);
                      return;
                    }
                    console.log('Data appended successfully!');
                  },
                );
              });

              await page.goBack();
              console.log('Kembali ke halaman sebelumnya');
              break;
            }
          }
        }
      } catch (error) {
        console.log(error);
      }
    }

    await browser.close();
    console.log('selesai');

    return { scraped_data };
  }

  // SCRAPING

  // CLEANING

  async clean() {
    const filename = 'raw-exporters';
    const __dirname = join(process.cwd(), 'src', 'data');
    const __cleanDirname = join(process.cwd(), 'src', 'data', 'clean');

    const filePath = join(__dirname, `${filename}.json`);
    const cleanFilePath = join(__cleanDirname, `clean-exporters.json`);

    try {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading file:', err);
          return;
        }

        // Parse the JSON data
        const jsonData = JSON.parse(data);

        jsonData.map((item) => {
          for (const key in item) {
            if (
              typeof item[key] === 'string' &&
              item[key].charCodeAt(0) === 160
            ) {
              item[key] = '';
            } else if (
              key !== 'name' &&
              key !== 'importer_id' &&
              key !== 'hscode' &&
              typeof item[key] === 'string' &&
              (item[key].includes(',') || !isNaN(item[key]))
            ) {
              item[key] = parseFloat(item[key].replace(/,/g, ''));
            }
          }
          return item;
        });

        // Function to check for duplicate objects
        const removeDuplicates = (arr) => {
          const uniqueObjects = {};
          arr.forEach((obj) => {
            const key = `${obj.importer_id}_${obj.name}_${obj.tradeBalance}_${obj.quantityImported}_${obj.valueImported}_${obj.unitValue}`;
            uniqueObjects[key] = obj;
          });
          return Object.values(uniqueObjects);
        };

        const uniqueData = removeDuplicates(jsonData);

        // Convert back to JSON string
        const cleanedData = JSON.stringify(uniqueData, null, 2);

        // Write cleaned data to file
        fs.writeFile(cleanFilePath, cleanedData, (err) => {
          if (err) {
            console.error('Error writing file:', err);
            return;
          }
          console.log(
            `\nData clean-exporters.json cleaned successfully from ${jsonData.length} to ${uniqueData.length}.`,
          );
        });
      });
    } catch (error) {
      console.error('Error parsing JSON:', error);
    }
  }

  async combine() {
    const fileCodes = [
      '03',
      '04',
      '05',
      '06',
      '07',
      '08',
      '09',
      '10',
      '14',
      '15',
      '16',
      '17',
      '18',
      '19',
      '20',
      '21',
      '22',
      '23',
      '34',
      '38',
      '40',
      '42-61',
      '62',
      '64',
      '67',
      '94',
    ];

    const __dirname = join(process.cwd(), 'src', 'data');
    const combinedFilePath = join(__dirname, `raw-exporters.json`);

    const combinedData = [];

    for (const code of fileCodes) {
      const cleanFilePath = join(__dirname, `scrapedHscode-${code}.json`);
      try {
        const fileData = fs.readFileSync(cleanFilePath, 'utf8');
        combinedData.push(JSON.parse(fileData));
      } catch (err) {
        console.error(`Error reading file ${cleanFilePath}:`, err);
      }
    }

    fs.writeFile(
      combinedFilePath,
      JSON.stringify(combinedData.flat(), null, 2),
      (err) => {
        if (err) {
          console.error(`Error writing file ${combinedFilePath}:`, err);
          return;
        }
        console.log(
          `Data from all files combined successfully! Result saved in:`,
          combinedFilePath,
        );
      },
    );
  }

  async cleanFiles() {
    const fileCode = [
      '03',
      '04',
      '05',
      '06',
      '07',
      '08',
      '09',
      '10',
      '14',
      '15',
      '16',
      '17',
      '18',
      '19',
      '20',
      '21',
      '22',
      '23',
      '34',
      '38',
      '40',
      '42-61',
      '62',
      '64',
      '67',
      '94',
    ];

    const filename = 'scrapedHscode';
    const __dirname = join(process.cwd(), 'src', 'data');
    const __cleanDirname = join(process.cwd(), 'src', 'data', 'clean');

    for (const code of fileCode) {
      const filePath = join(__dirname, `${filename}-${code}.json`);
      const cleanFilePath = join(
        __cleanDirname,
        `${filename}-${code}-clean.json`,
      );

      try {
        fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) {
            console.error('Error reading file:', err);
            return;
          }

          // Parse the JSON data
          const jsonData = JSON.parse(data);

          jsonData.map((item) => {
            for (const key in item) {
              if (
                typeof item[key] === 'string' &&
                item[key].charCodeAt(0) === 160
              ) {
                item[key] = '';
              }
            }
            return item;
          });

          // Function to check for duplicate objects
          const removeDuplicates = (arr) => {
            const uniqueObjects = {};
            arr.forEach((obj) => {
              const key = `${obj.importer_id}_${obj.name}_${obj.tradeBalance}_${obj.quantityImported}_${obj.valueImported}_${obj.unitValue}`;
              uniqueObjects[key] = obj;
            });
            return Object.values(uniqueObjects);
          };

          // Remove duplicates
          const uniqueData = removeDuplicates(jsonData);

          // Convert back to JSON string
          const cleanedData = JSON.stringify(uniqueData, null, 2);

          // Write cleaned data to file
          fs.writeFile(cleanFilePath, cleanedData, (err) => {
            if (err) {
              console.error('Error writing file:', err);
              return;
            }
            console.log(
              `\nData ${filename}-${code}.json cleaned successfully from ${jsonData.length} to ${uniqueData.length}.`,
            );
          });
        });
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    }
  }

  // CLEANING
}
