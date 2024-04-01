/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class RegressionService {
  constructor(private readonly databaseService: DatabaseService) {}

  async linearRegression() {
    const importer = await this.databaseService.importers.findFirst({
      where: { hscode: '0301' },
      select: {
        id: true,
        name: true,
        trade_balance: true,
        quantity_imported: true,
        value_imported: true,
        unit_value: true,
      },
    });

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

    // Trade Balance
    const y = exporters.map((exporter) => exporter.trade_balance);
    const ySum = y.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0,
    );

    // Quantity Imported
    const x1 = exporters.map((exporter) => exporter.quantity_imported);
    const x1Sum = x1.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0,
    );

    // Value Imported
    const x2 = exporters.map((exporter) => exporter.value_imported);
    const x2Sum = x2.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0,
    );

    // Unit Value
    const x3 = exporters.map((exporter) => exporter.unit_value);
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

    const x3x1 = x3.map((x3Value, index) => x3Value * x1[index]);
    const x3x1Sum = x3x1.reduce(
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

    const matrixM = [
      [y.length, x1Sum, x2Sum, x3Sum],
      [x1Sum, x1x1Sum, x1x2Sum, x1x3Sum],
      [x2Sum, x1x2Sum, x2x2Sum, x2x3Sum],
      [x3Sum, x3x1Sum, x2x3Sum, x3x3Sum],
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

    const prediction =
      b0 +
      b1 * importer.quantity_imported +
      b2 * importer.value_imported +
      b3 * importer.unit_value;

    return {
      message: 'Regression successfully',
      prediction,
      yActual: importer.trade_balance,
      coef: [b0, b1, b2, b3],
      det: [detM, detM1, detM2, detM3],
      matrixM0,
      matrixM1,
      matrixM2,
      matrixM3,
      sum: [
        ySum,
        x1Sum,
        x2Sum,
        x3Sum,
        x1x1Sum,
        x1x2Sum,
        x1x3Sum,
        x2x2Sum,
        x2x3Sum,
        x3x1Sum,
        x3x3Sum,
        x1ySum,
        x2ySum,
        x3ySum,
      ],
    };
  }

  determinant = (matrix) => {
    if (matrix.length !== 4 || matrix[0].length !== 4) {
      throw new Error('Matrix must be 4x4');
    }

    // Helper function to get minor matrix
    const getMinor = (matrix, row, col) => {
      return matrix
        .filter((_, i) => i !== row)
        .map((row) => row.filter((_, j) => j !== col));
    };

    // Recursive function to calculate determinant
    const calculateDeterminant = (matrix) => {
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
}
