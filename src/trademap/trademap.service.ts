/* eslint-disable prettier/prettier */
import { HttpStatus, Injectable } from '@nestjs/common';
import puppeteer, { Page } from 'puppeteer';
import { DatabaseService } from 'src/database/database.service';
import * as fs from 'fs';
import { join } from 'path';
import { CreateTrademapDTO } from './dto/create-trademap.dto';

@Injectable()
export class TrademapService {
  constructor(private readonly databaseService: DatabaseService) {}

  private readonly dropdownSelector =
    '#ctl00_NavigationControl_DropDownList_Product';

  // DIRECT USED FUNCTION
  private getLocalJSONData(filename: string) {
    try {
      const filePath = join(process.cwd(), 'src', 'data', filename);
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
      const trademapJSONData: CreateTrademapDTO[] =
        this.getLocalJSONData('scrapedHSCODE.json');

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

      const createdData = await this.databaseService.importers.createMany({
        data: importersJSONData.map((data) => ({
          id: data.id,
          name: data.name,
          hscode: data.hscode,
          trade_balance: data.trade_balance,
          quantity_imported: data.quantity_imported,
          value_imported: data.value_imported,
          quantity_unit: data.quantity_unit,
          unit_value: data.unit_value || 0,
        })),
      });

      return createdData;
    } catch (e) {
      console.log(e);
    }
  }

  async createExporters() {
    try {
      const exportersJSONData = this.getLocalJSONData('test.json');

      const createdData = await this.databaseService.exporters.createMany({
        data: exportersJSONData.map((data) => ({
          importer_id: data.importer_id,
          name: data.name,
          trade_balance: data.tradeBalance,
          quantity_imported: data.quantityImported,
          value_imported: data.valueImported,
          unit_value: data.unitValue || '0',
        })),
      });

      return createdData;
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

    // const __dirname = join(process.cwd(), 'src', 'data');
    // const filePath = join(__dirname, 'scrapedHSCODE.json');
    // fs.writeFile(filePath, JSON.stringify(resultData, null, 2), (err) => {
    //   if (err) throw err;
    // });

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

    const importerData = [];
    const countData = [];
    for (const data of trademapData) {
      const { hscode, link } = data;
      try {
        await page.goto(link, { waitUntil: 'domcontentloaded' });
        console.log(`scraping hscode ${hscode}`);

        // Use page.select() to select the option "300 per page"
        // await page.select(
        //   'select[name="ctl00$PageContent$GridViewPanelControl$DropDownList_PageSize"]',
        //   '300',
        // );

        // Wait for navigation to complete
        // await page.waitForNavigation();

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

    return { countData, count: importerData.length, importerData };
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

  async scrapeExportersTest() {
    const browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox'],
    });

    const page = await browser.newPage();

    const __dirname = join(process.cwd(), 'src', 'data');
    const filePath = join(__dirname, 'scrapedHscode-08.json');

    const hscodeData = await this.databaseService.trademap.findMany({});

    const finalExporterData = [];
    const startTime = performance.now(); // Record start time

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
                    tradeBalance: rowData[2],
                    quantityImported: rowData[4],
                    valueImported: rowData[1],
                    unitValue: rowData[6],
                  };
                  data.push(mappedData);
                }
                return data;
              }, importer);

              finalExporterData.push(...exporterData);

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

    return {
      message: 'Scraped Exporters Successfully',
      count: finalExporterData.length,
      executeTime: `${
        (performance.now() - startTime) / 1000 > 60
          ? `${Math.floor((performance.now() - startTime) / 1000 / 60)} minute${
              Math.floor((performance.now() - startTime) / 1000 / 60) > 1
                ? 's'
                : ''
            } and ${(((performance.now() - startTime) / 1000) % 60).toFixed(
              2,
            )} seconds`
          : `${((performance.now() - startTime) / 1000).toFixed(2)} seconds`
      }`,
    };
  }

  async scrapeTest() {
    const browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox'],
    }); // Set headless to false for visibility
    const page = await browser.newPage();

    const __dirname = join(process.cwd(), 'src', 'data');
    const filePath = join(__dirname, 'scrapedData.json');

    try {
      const startTime = performance.now(); // Record start time
      await page.goto(
        'https://www.trademap.org/Country_SelProduct.aspx?nvpm=1%7c%7c%7c%7c%7c0701%7c%7c%7c4%7c1%7c1%7c1%7c1%7c1%7c2%7c1%7c%7c1',
      );

      // Wait for the dropdown element to be available
      await page.waitForSelector(
        'select[name="ctl00$PageContent$GridViewPanelControl$DropDownList_PageSize"]',
      );

      // Pilih elemen select berdasarkan nama atribut "name" dan nilai opsi "300"
      await page.select(
        'select[name="ctl00$PageContent$GridViewPanelControl$DropDownList_PageSize"]',
        '300',
      );

      // Wait for navigation after login (replace 'dashboard' with the expected URL after login)
      await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
      // Wait for the table data to be rendered (if necessary)
      await page.waitForSelector('table');

      // Extract data from all <tr> elements
      const tableData = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('table tr'));
        const data = [];
        for (let i = 15; i < rows.length - 6; i++) {
          const columns = Array.from(rows[i].querySelectorAll('td'));
          const rowData = columns
            .slice(1, 14)
            .map((column) => column.innerText);
          data.push(rowData);
        }
        return data;
      });

      await browser.close();
      console.log(
        `Execute Time : ${((performance.now() - startTime) / 1000).toFixed(
          2,
        )} seconds`,
      );
      console.log(`Scraped ${tableData.length} data`);

      fs.writeFile(filePath, JSON.stringify(tableData, null, 2), (err) => {
        if (err) throw err;
      });

      return tableData;
    } catch (error) {
      console.error('Login failed:', error);
    }
  }
  // SCRAPING

  // CLEANING

  async clean() {
    const filename = 'raw-importers';
    const __dirname = join(process.cwd(), 'src', 'data');
    const __cleanDirname = join(process.cwd(), 'src', 'data', 'clean');

    const filePath = join(__dirname, `${filename}.json`);
    const cleanFilePath = join(__cleanDirname, `clean-importers.json`);

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
        // const removeDuplicates = (arr) => {
        //   const uniqueObjects = {};
        //   arr.forEach((obj) => {
        //     const key = `${obj.importer_id}_${obj.name}_${obj.tradeBalance}_${obj.quantityImported}_${obj.valueImported}_${obj.unitValue}`;
        //     uniqueObjects[key] = obj;
        //   });
        //   return Object.values(uniqueObjects);
        // };

        // const uniqueData = removeDuplicates(jsonData);

        // Convert back to JSON string
        // const cleanedData = JSON.stringify(uniqueData, null, 2);
        const cleanedData = JSON.stringify(jsonData, null, 2);

        // Write cleaned data to file
        fs.writeFile(cleanFilePath, cleanedData, (err) => {
          if (err) {
            console.error('Error writing file:', err);
            return;
          }
          console.log(
            `\nData clean-exporters.json cleaned successfully from ${jsonData.length} to .`,
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

  // CLEANING
}
