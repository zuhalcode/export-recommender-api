/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/common/database.service';

import * as fs from 'fs';
import * as path from 'path';
import { prod } from 'mathjs';

@Injectable()
export class RegressionService {
  constructor(private readonly databaseService: DatabaseService) {}

  async multipleLinearRegression(hscode: string) {
    const importers = await this.databaseService.importers.findMany({
      where: { hscode },
    });

    const negativeResult = [];
    const positiveResult = [];

    for (const importer of importers) {
      const exporters = await this.databaseService.exporters.findMany({
        where: {
          importer_id: importer.id,
          trade_balance: { not: 0 },
        },
        select: {
          name: true,
          trade_balance: true,
          quantity_imported: true,
          value_imported: true,
          unit_value: true,
        },
      });

      const y: number[] = exporters.map((exporter) => exporter.trade_balance); // Trade Balance

      const x1: number[] = exporters.map(
        (exporter) => exporter.quantity_imported,
      ); // Quantity Imported

      const x2: number[] = exporters.map((exporter) => exporter.value_imported); // Value Imported
      const x3: number[] = exporters.map((exporter) => exporter.unit_value); // Unit Value

      const { ySum, ...sums } = this.sumingValues(y, x1, x2, x3);

      const matrixValues = {
        n: y.length,
        ySum,
        ...sums,
      };

      const coef: {
        b0: number;
        b1: number;
        b2: number;
        b3: number;
      } = this.matrixModelling(matrixValues);

      const exporterPredictions: number[] = exporters.map(
        (_, index) =>
          coef.b0 +
          coef.b1 * x1[index] +
          coef.b2 * x2[index] +
          coef.b3 * x3[index],
      );

      // Calculate R Squared
      const rSquared: number = this.RSquared(exporterPredictions, y, ySum);

      // Calculate MAE
      const MAE: number = this.MAE(exporterPredictions, y);

      // Calculate RMSE
      const RMSE: number = this.RMSE(exporterPredictions, y);

      const ImporterPrediction: number =
        coef.b0 +
        coef.b1 * importer.quantity_imported +
        coef.b2 * importer.value_imported +
        coef.b3 * importer.unit_value;

      if (!isNaN(ImporterPrediction)) {
        const object = {
          n: exporters.length,
          id: importer.id,
          hscode: importer.hscode,
          name: importer.name,
          trade_balance: importer.trade_balance,
          quantity_imported: importer.quantity_imported,
          value_imported: importer.value_imported,
          unit_value: importer.unit_value,
          quantity_unit: importer.quantity_unit,
          coef,
          prediction: ImporterPrediction,
          rSquared,
          MAE,
          RMSE,
        };

        if (object.rSquared > 0.5) {
          if (object.prediction < 0) negativeResult.push(object);
          else positiveResult.push(object);
        }
      }
    }

    // Sorting untuk nilai prediksi < 0: terkecil ke terbesar, kemudian R Squared terbesar ke terkecil
    negativeResult.sort((a, b) => b.rSquared - a.rSquared);

    // Sorting untuk nilai prediksi > 0: terbesar ke terkecil, kemudian R Squared terbesar ke terkecil
    positiveResult.sort((a, b) => b.rSquared - a.rSquared);

    const result = [...negativeResult, ...positiveResult];

    return {
      message: 'Regression successfully',
      result,
    };
  }

  async getFinalAccuracy() {
    const testingData = this.readJSON('accuracy-4digit.json').map(
      (data) => data.hscode,
    );

    const hscodes = [];

    for (const hscode of testingData) {
      const products = await this.databaseService.products.findMany({
        where: { hscode },
      });

      if (products.length === 0) hscodes.push(hscode);
    }

    return { hscodes };
    const RSquared =
      testingData
        .map((data) => Math.abs(data.RSquared))
        .filter((value) => !isNaN(value))
        .reduce((total, value) => total + value, 0) /
      testingData
        .map((data) => Math.abs(data.RSquared))
        .filter((value) => !isNaN(value)).length;

    const MAE =
      testingData
        .map((data) => data.MAE)
        .filter((value) => !isNaN(value))
        .reduce((total, value) => total + value, 0) /
      testingData.map((data) => data.MAE).filter((value) => !isNaN(value))
        .length;

    const RMSE =
      testingData
        .map((data) => data.RMSE)
        .filter((value) => !isNaN(value))
        .reduce((total, value) => total + value, 0) /
      testingData.map((data) => data.RMSE).filter((value) => !isNaN(value))
        .length;

    const finalResult = {
      RSquared,
      MAE,
      RMSE,
    };

    return {
      message: 'Testing Accuracy successfully',
      finalResult,
    };
  }

  async calculate2Digit() {
    const testingData = this.readJSON('accuracy-4digit.json');

    const hscodes = [
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
      '42',
      '61',
      '62',
      '64',
      '67',
      '94',
    ];

    const finalResult = [];

    for (const hscode of hscodes) {
      const filteredData = testingData.filter((item) =>
        item.hscode.startsWith(hscode),
      );

      const RSquared =
        filteredData
          .map((data) => data.RSquared)
          .reduce((total, value) => total + value, 0) / filteredData.length;

      const MAE =
        filteredData
          .map((data) => data.MAE)
          .reduce((total, value) => total + value, 0) / filteredData.length;

      const RMSE =
        filteredData
          .map((data) => data.RMSE)
          .filter((value) => !isNaN(value))
          .reduce((total, value) => total + value, 0) / filteredData.length;

      const object = {
        hscode,
        RSquared,
        MAE,
        RMSE,
      };

      finalResult.push({ object });

      this.writeJSON(object, 'accuracy-2digit.json');
    }

    return {
      message: 'Calculate successfully',
      finalResult,
    };
  }

  async calculate4Digit() {
    const hscodes = this.readJSON('scrapedHscode.json').map(
      (data) => data.hscode,
    );

    // const importers = this.readJSON('raw-importers.json').length;
    // const cleanImporters = this.readJSON('clean-importers.json').length;
    // const exporter = this.readJSON('raw-exporters.json').length;
    // const cleanExporters = this.readJSON('clean-exporters.json').length;

    // return {
    //   importers,
    //   cleanImporters,
    //   exporter,
    //   cleanExporters,
    // };

    const finalResult = [];

    for (const hscode of hscodes) {
      console.log(`Calculate hscode ${hscode}`);
      const importers = await this.databaseService.importers.findMany({
        where: { hscode },
        select: {
          id: true,
          hscode: true,
          name: true,
          trade_balance: true,
          quantity_imported: true,
          value_imported: true,
          unit_value: true,
          quantity_unit: true,
        },
      });

      const result = [];

      for (const importer of importers) {
        const exporters = await this.databaseService.exporters.findMany({
          where: {
            importer_id: importer.id,
            trade_balance: { not: 0 },
          },
          select: {
            name: true,
            trade_balance: true,
            quantity_imported: true,
            value_imported: true,
            unit_value: true,
          },
        });

        const y: number[] = exporters.map((exporter) => exporter.trade_balance); // Trade Balance

        const x1: number[] = exporters.map(
          (exporter) => exporter.quantity_imported,
        ); // Quantity Imported

        const x2: number[] = exporters.map(
          (exporter) => exporter.value_imported,
        ); // Value Imported

        const x3: number[] = exporters.map((exporter) => exporter.unit_value); // Unit Value

        const {
          x1Sum,
          x2Sum,
          x3Sum,
          x1x1Sum,
          x1x2Sum,
          x1x3Sum,
          x2x2Sum,
          x2x3Sum,
          x3x3Sum,
          ySum,
          x1ySum,
          x2ySum,
          x3ySum,
        } = this.sumingValues(y, x1, x2, x3);

        const matrixValues = {
          n: y.length,
          x1Sum,
          x2Sum,
          x3Sum,
          x1x1Sum,
          x1x2Sum,
          x1x3Sum,
          x2x2Sum,
          x2x3Sum,
          x3x3Sum,
          ySum,
          x1ySum,
          x2ySum,
          x3ySum,
        };

        const coef: { b0: number; b1: number; b2: number; b3: number } =
          this.matrixModelling(matrixValues);

        const exporterPredictions: number[] = exporters.map(
          (_, index) =>
            coef.b0 +
            coef.b1 * x1[index] +
            coef.b2 * x2[index] +
            coef.b3 * x3[index],
        );

        // Calculate R Squared
        const rSquared: number = this.RSquared(exporterPredictions, y, ySum);

        // Calculate MAE
        const MAE: number = this.MAE(exporterPredictions, y);

        // Calculate RMSE
        const RMSE: number = this.RMSE(exporterPredictions, y);

        const importerPrediction: number =
          coef.b0 +
          coef.b1 * importer.quantity_imported +
          coef.b2 * importer.value_imported +
          coef.b3 * importer.unit_value;

        if (!isNaN(importerPrediction)) {
          const object = {
            n: exporters.length,
            hscode: importer.hscode,
            name: importer.name,
            trade_balance: importer.trade_balance,
            prediction: importerPrediction,
            rSquared,
            MAE,
            RMSE,
          };

          result.push(object);
        }
      }

      const avgRSquared =
        result
          .map((data) => data.rSquared)
          .filter((value) => !isNaN(value))
          .reduce((total, value) => total + value, 0) /
        result.map((data) => data.rSquared).filter((value) => !isNaN(value))
          .length;

      const avgMAE =
        result
          .map((data) => data.MAE)
          .filter((value) => !isNaN(value))
          .reduce((total, value) => total + value, 0) /
        result.map((data) => data.MAE).filter((value) => !isNaN(value)).length;

      const avgRMSE =
        result
          .map((data) => data.RMSE)
          .filter((value) => !isNaN(value))
          .reduce((total, value) => total + value, 0) /
        result.map((data) => data.RMSE).filter((value) => !isNaN(value)).length;

      if (!isNaN(avgRSquared)) {
        const result4Digit = {
          hscode,
          RSquared: avgRSquared,
          MAE: avgMAE,
          RMSE: avgRMSE,
        };

        // this.writeJSON(result4Digit, 'accuracy-new-4digit.json');

        finalResult.push({ result4Digit });
      }
    }

    return {
      message: 'Calculate successfully',
      finalResult,
    };
  }

  determinant = (matrix: number[][]) => {
    if (matrix.length !== 4 || matrix[0].length !== 4) {
      throw new Error('Matrix must be 4x4');
    }

    // Helper function to get minor matrix
    const getMinor = (
      matrix: number[][],
      row: number,
      col: number,
    ): number[][] => {
      return matrix
        .filter((_, i) => i !== row)
        .map((row) => row.filter((_, j) => j !== col));
    };

    // Recursive function to calculate determinant
    const calculateDeterminant = (matrix: number[][]) => {
      if (matrix.length === 2) {
        return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
      } else {
        let det = 0;
        for (let i = 0; i < matrix.length; i++) {
          const minor = getMinor(matrix, 0, i);
          const cofactor = matrix[0][i] * calculateDeterminant(minor);
          det += i % 2 === 0 ? cofactor : -cofactor;
        }
        return det;
      }
    };

    return calculateDeterminant(matrix);
  };

  matrixModelling = (values: {
    n: number;
    x1Sum: number;
    x2Sum: number;
    x3Sum: number;
    x1x1Sum: number;
    x1x2Sum: number;
    x1x3Sum: number;
    x2x2Sum: number;
    x2x3Sum: number;
    x3x3Sum: number;
    ySum: number;
    x1ySum: number;
    x2ySum: number;
    x3ySum: number;
  }) => {
    const {
      n,
      x1Sum,
      x2Sum,
      x3Sum,
      x1x1Sum,
      x1x2Sum,
      x1x3Sum,
      x2x2Sum,
      x2x3Sum,
      x3x3Sum,
      ySum,
      x1ySum,
      x2ySum,
      x3ySum,
    } = values;

    const matrixM = [
      [n, x1Sum, x2Sum, x3Sum],
      [x1Sum, x1x1Sum, x1x2Sum, x1x3Sum],
      [x2Sum, x1x2Sum, x2x2Sum, x2x3Sum],
      [x3Sum, x1x3Sum, x2x3Sum, x3x3Sum],
    ];

    const matrixH = [[ySum], [x1ySum], [x2ySum], [x3ySum]];

    const matrixM0 = matrixM.map((row, index) => [
      matrixH[index][0],
      ...row.slice(1),
    ]);

    const matrixM1 = matrixM.map((row, index) => [
      row[0],
      matrixH[index][0],
      ...row.slice(2),
    ]);

    const matrixM2 = matrixM.map((row, index) => [
      row[0],
      row[1],
      matrixH[index][0],
      row[3],
    ]);

    const matrixM3 = matrixM.map((row, index) => [
      row[0],
      row[1],
      row[2],
      matrixH[index][0],
    ]);

    const detM = this.determinant(matrixM);
    const detM1 = this.determinant(matrixM0);
    const detM2 = this.determinant(matrixM1);
    const detM3 = this.determinant(matrixM2);
    const detM4 = this.determinant(matrixM3);

    const b0 = detM1 / detM;
    const b1 = detM2 / detM;
    const b2 = detM3 / detM;
    const b3 = detM4 / detM;

    return { b0, b1, b2, b3 };
  };

  sumingValues = (y: number[], x1: number[], x2: number[], x3: number[]) => {
    const ySum = y.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0,
    );

    const x1Sum = x1.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0,
    );

    const x2Sum = x2.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0,
    );

    const x3Sum = x3.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0,
    );

    const x1x1 = x1.map((value) => value * value);
    const x1x1Sum = x1x1.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0,
    );

    const x1x2 = x1.map((x1Value, index) => x1Value * x2[index]);
    const x1x2Sum = x1x2.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0,
    );

    const x1x3 = x1.map((x1Value, index) => x1Value * x3[index]);
    const x1x3Sum = x1x3.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0,
    );

    const x2x2 = x2.map((value) => value * value);
    const x2x2Sum = x2x2.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0,
    );

    const x2x3 = x2.map((x2Value, index) => x2Value * x3[index]);
    const x2x3Sum = x2x3.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0,
    );

    const x3x3 = x3.map((value) => value * value);
    const x3x3Sum = x3x3.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0,
    );

    const x1y = x1.map((x1Value, index) => x1Value * y[index]);
    const x1ySum = x1y.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0,
    );

    const x2y = x2.map((x2Value, index) => x2Value * y[index]);
    const x2ySum = x2y.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0,
    );

    const x3y = x3.map((x3Value, index) => x3Value * y[index]);
    const x3ySum = x3y.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0,
    );

    return {
      ySum,
      x1Sum,
      x2Sum,
      x3Sum,
      x1x1Sum,
      x1x2Sum,
      x1x3Sum,
      x2x2Sum,
      x2x3Sum,
      x3x3Sum,
      x1ySum,
      x2ySum,
      x3ySum,
    };
  };

  RSquared = (predictions: number[], y: number[], ySum: number) => {
    const result = predictions.reduce(
      (acc, prediction, index) => {
        const mean = ySum / predictions.length;
        const actualValue = y[index];
        const actualPredictDiff = Math.pow(actualValue - prediction, 2);
        const actualMeanDiff = Math.pow(actualValue - mean, 2);
        acc[0] += actualPredictDiff;
        acc[1] += actualMeanDiff;
        return acc;
      },
      [0, 0],
    );
    return 1 - result[0] / result[1];
  };

  RMSE = (predictions: number[], y: number[]) => {
    return Math.sqrt(
      predictions.reduce(
        (sum: number, prediction: number, index: number) =>
          sum + Math.pow(prediction - y[index], 2),
        0,
      ) / y.length,
    );
  };

  MAE = (predictions: number[], y: number[]) =>
    predictions.reduce(
      (sum, prediction, index) => sum + Math.abs(prediction - y[index]),
      0,
    ) / y.length;

  writeJSON = (result, filename = 'testing-result.json') => {
    const __dirname = path.join(process.cwd(), 'src', 'data');
    const filePath = path.join(__dirname, filename);

    let existingData = [];

    if (!fs.existsSync(filePath)) {
      // If the file doesn't exist, create a new file with an empty array
      fs.writeFileSync(filePath, '[]');
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    existingData = JSON.parse(fileContent);

    // Append new data to the existing array
    if (Array.isArray(existingData)) {
      existingData.push(result);
    } else {
      existingData = [result]; // If not an array, convert it to an array
    }

    // Write the updated data back to the file
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2), 'utf-8');
  };

  readJSON = (filename = 'testing-result.json') => {
    const __dirname = path.join(process.cwd(), 'src', 'data');
    const filePath = path.join(__dirname, filename);

    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(fileContent);
    } else {
      return []; // Return an empty array if the file doesn't exist
    }
  };

  async delete() {
    const exportersToDelete = await this.databaseService.exporters.findMany({
      where: {
        trade_balance: 0,
        quantity_imported: 0,
        value_imported: 0,
        unit_value: 0,
      },
    });

    let i = 1;

    for (const exporter of exportersToDelete) {
      await this.databaseService.exporters.delete({
        where: {
          id: exporter.id,
        },
      });
      console.log(
        `exporter id ${exporter.id} Terhapus || ${i} : ${exportersToDelete.length} `,
      );
      i++;
    }

    return {};
  }
}
